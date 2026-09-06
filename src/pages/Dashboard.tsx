import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/common/Navbar';
import { BrowserCompatibilityWarning } from '../components/common/BrowserCompatibilityWarning';
import { FirmwareSelector } from '../components/flasher/FirmwareSelector';
import { SerialConnection } from '../components/flasher/SerialConnection';
import { FlashControls } from '../components/flasher/FlashControls';
import { FlasherLogs } from '../components/flasher/FlasherLogs';
import { SerialMonitor } from '../components/flasher/SerialMonitor';
import { ToastNotification } from '../components/common/ToastNotification';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { getActiveFirmwares, saveFlashRecord } from '../services/firmwareService';
import { espService } from '../services/espService';
import { useAuth } from '../contexts/AuthContext';
import type { Firmware, ConnectionStatus, LogMessage, ESPBoardType } from '../types';

export const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();

  // State
  const [firmwares, setFirmwares] = useState<Firmware[]>([]);
  const [selectedFirmware, setSelectedFirmware] = useState<Firmware | null>(null);
  const [loadingFirmware, setLoadingFirmware] = useState(true);

  // Serial state
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('No device connected');
  const [detectedChip, setDetectedChip] = useState<string>('');
  const [portName, setPortName] = useState<string>('');
  const [baudRate, setBaudRate] = useState<number>(921600);
  const [targetBoard, setTargetBoard] = useState<ESPBoardType>('Auto Detect');

  // Flash progress & logs
  const [progress, setProgress] = useState<number>(0);
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showEraseModal, setShowEraseModal] = useState(false);

  // Load firmwares
  useEffect(() => {
    const fetchFirmwares = async () => {
      try {
        setLoadingFirmware(true);
        const activeList = await getActiveFirmwares();
        setFirmwares(activeList);
        if (activeList.length > 0) {
          setSelectedFirmware(activeList[0]);
        }
      } catch (err: any) {
        addLog(`Failed to fetch firmwares from Firebase: ${err.message}`, 'error');
      } finally {
        setLoadingFirmware(false);
      }
    };
    fetchFirmwares();
  }, []);

  const addLog = (message: string, type: LogMessage['type'] = 'info') => {
    const timeStr = new Date().toLocaleTimeString();
    setLogs((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        timestamp: timeStr,
        message,
        type
      }
    ]);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  // Compatibility checking
  const checkCompatibility = (): string | null => {
    if (!selectedFirmware || !detectedChip) return null;
    const reqBoard = selectedFirmware.targetBoard;
    if (reqBoard === 'Auto Detect') return null;

    const normalizedDetected = detectedChip.toLowerCase().replace(/[-_ ]/g, '');
    const normalizedTarget = reqBoard.toLowerCase().replace(/[-_ ]/g, '');

    if (!normalizedDetected.includes(normalizedTarget)) {
      return `Selected firmware target (${reqBoard}) does not match detected hardware (${detectedChip}). Flashing is restricted for safety.`;
    }
    return null;
  };

  // Handlers
  const handleConnect = async () => {
    try {
      setConnectionStatus('Connecting');
      addLog("Requesting Web Serial port access...", 'info');
      await espService.requestPort();
      
      addLog(`Initiating connection at ${baudRate} baud...`, 'info');
      const chip = await espService.connect(baudRate, (msg, type) => addLog(msg, type));
      
      setDetectedChip(chip);
      setPortName(espService.getPortName());
      setConnectionStatus('Device connected');
      addLog(`Connected successfully. Detected chip: ${chip}`, 'success');
      showToast(`Connected to ${chip}`, 'success');
    } catch (err: any) {
      setConnectionStatus('Connection failed');
      addLog(`Connection error: ${err.message || err}`, 'error');
      showToast(`Connection failed: ${err.message || 'Error'}`, 'error');
    }
  };

  const handleDisconnect = async () => {
    await espService.disconnect((msg, type) => addLog(msg, type));
    setConnectionStatus('No device connected');
    setDetectedChip('');
    setPortName('');
    showToast("Device disconnected", 'info');
  };

  const handleReset = async () => {
    try {
      await espService.resetBoard((msg, type) => addLog(msg, type));
      showToast("Reset signal sent", 'success');
    } catch (err: any) {
      showToast("Failed to reset board", 'error');
    }
  };

  const handleFlash = async () => {
    if (!selectedFirmware) {
      showToast("Please select a firmware first", 'error');
      return;
    }
    if (!espService.getIsConnected()) {
      showToast("No serial device connected", 'error');
      return;
    }

    const startTime = Date.now();
    setConnectionStatus('Flashing firmware');
    setProgress(0);
    addLog(`Starting flash procedure for ${selectedFirmware.name}...`, 'info');

    try {
      // Prepare file downloads
      const fileArray: Array<{ data: Uint8Array; address: number }> = [];
      const filesObj = selectedFirmware.files || {};
      const fileKeys = Object.keys(filesObj);

      if (fileKeys.length === 0) {
        throw new Error("Selected firmware has no binary components.");
      }

      for (const key of fileKeys) {
        const fileInfo = filesObj[key];
        addLog(`Downloading binary: ${fileInfo.fileName} from Firebase Storage...`, 'info');
        
        let url = fileInfo.downloadUrl;
        if (!url && fileInfo.storagePath) {
          // fetch download url dynamically if needed
          const { ref: sRef, getDownloadURL } = await import('firebase/storage');
          const { storage } = await import('../services/firebase');
          url = await getDownloadURL(sRef(storage, fileInfo.storagePath));
        }

        if (!url) throw new Error(`Could not resolve download URL for ${fileInfo.fileName}`);

        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to download ${fileInfo.fileName}`);
        
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const address = parseInt(fileInfo.flashAddress, 16) || 0x10000;

        fileArray.push({ data: uint8Array, address });
        addLog(`Downloaded ${fileInfo.fileName} (${(uint8Array.length / 1024).toFixed(1)} KB) -> Address: ${fileInfo.flashAddress}`, 'success');
      }

      // Execute flash via esptool-js
      await espService.flashFirmware(
        fileArray,
        baudRate,
        (pct) => setProgress(pct),
        (msg, type) => addLog(msg, type)
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      setConnectionStatus('Flash completed');
      addLog(`Firmware successfully flashed in ${(duration / 1000).toFixed(1)} seconds!`, 'success');
      showToast("Firmware flashed successfully!", 'success');

      // Record to Firebase
      if (currentUser) {
        await saveFlashRecord(currentUser.uid, {
          userId: currentUser.uid,
          firmwareId: selectedFirmware.id,
          firmwareName: selectedFirmware.name,
          board: detectedChip || selectedFirmware.targetBoard,
          status: 'success',
          startedAt: startTime,
          completedAt: endTime,
          duration
        });
      }
    } catch (err: any) {
      setConnectionStatus('Connection failed');
      const endTime = Date.now();
      addLog(`Flashing failed: ${err.message || err}`, 'error');
      showToast(`Flashing failed: ${err.message}`, 'error');

      if (currentUser && selectedFirmware) {
        await saveFlashRecord(currentUser.uid, {
          userId: currentUser.uid,
          firmwareId: selectedFirmware.id,
          firmwareName: selectedFirmware.name,
          board: detectedChip || selectedFirmware.targetBoard,
          status: 'failed',
          startedAt: startTime,
          completedAt: endTime,
          duration: endTime - startTime,
          errorMessage: err.message
        });
      }
    }
  };

  const handleEraseConfirm = async () => {
    setShowEraseModal(false);
    if (!espService.getIsConnected()) return;

    setConnectionStatus('Erasing flash');
    addLog("Erasing ESP flash memory...", 'warning');

    try {
      await espService.eraseFlash((msg, type) => addLog(msg, type));
      setConnectionStatus('Device connected');
      addLog("Flash erase process complete.", 'success');
      showToast("Flash erased successfully", 'success');
    } catch (err: any) {
      setConnectionStatus('Connection failed');
      addLog(`Erase failed: ${err.message}`, 'error');
      showToast("Flash erase failed", 'error');
    }
  };

  const isConnected = connectionStatus === 'Device connected' || connectionStatus === 'Flash completed' || connectionStatus === 'Flashing firmware' || connectionStatus === 'Erasing flash';
  const compatibilityWarning = checkCompatibility();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <BrowserCompatibilityWarning />

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left Column: Selection & Controls */}
          <div className="space-y-6">
            <FirmwareSelector
              firmwares={firmwares}
              selectedFirmware={selectedFirmware}
              onSelect={setSelectedFirmware}
              loading={loadingFirmware}
            />

            <FlashControls
              status={connectionStatus}
              progress={progress}
              onFlash={handleFlash}
              onErase={() => setShowEraseModal(true)}
              disabled={!isConnected || !selectedFirmware}
              compatibilityWarning={compatibilityWarning}
            />
          </div>

          {/* Right Column: Connection & Hardware Settings */}
          <div className="space-y-6">
            <SerialConnection
              status={connectionStatus}
              detectedChip={detectedChip}
              portName={portName}
              baudRate={baudRate}
              targetBoard={targetBoard}
              onBaudRateChange={setBaudRate}
              onTargetBoardChange={setTargetBoard}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              onReset={handleReset}
              disabled={connectionStatus === 'Flashing firmware' || connectionStatus === 'Erasing flash'}
            />

            <SerialMonitor />
          </div>
        </div>

        {/* Bottom Full-Width: Execution Logs */}
        <FlasherLogs logs={logs} onClear={() => setLogs([])} />
      </main>

      {/* Modals & Notifications */}
      {toast && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <ConfirmationModal
        isOpen={showEraseModal}
        title="Erase Entire Flash Memory?"
        message="Are you sure you want to completely erase the flash memory on your connected ESP device? All existing code and file systems will be permanently destroyed. This action cannot be undone."
        confirmText="Erase Flash"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={handleEraseConfirm}
        onCancel={() => setShowEraseModal(false)}
      />
    </div>
  );
};
