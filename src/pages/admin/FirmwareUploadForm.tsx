import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/common/Navbar';
import { createFirmware, uploadFirmwareFile } from '../../services/firmwareService';
import { useAuth } from '../../contexts/AuthContext';
import type { ESPBoardType, FirmwareFile } from '../../types';
import { HardDriveUpload, Plus, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import { ToastNotification } from '../../components/common/ToastNotification';

interface BinaryFileInput {
  id: string;
  name: string;
  flashAddress: string;
  file: File | null;
}

export const FirmwareUploadForm: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [description, setDescription] = useState('');
  const [targetBoard, setTargetBoard] = useState<ESPBoardType>('ESP32-C3');
  const [releaseNotes] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  // Firmware files array supporting single or multi-binary packages
  const [files, setFiles] = useState<BinaryFileInput[]>([
    { id: '1', name: 'firmware.bin', flashAddress: '0x0', file: null }
  ]);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleAddFileRow = () => {
    setFiles([
      ...files,
      { id: Date.now().toString(), name: `firmware-part-${files.length + 1}.bin`, flashAddress: '0x10000', file: null }
    ]);
  };

  const handleRemoveFileRow = (id: string) => {
    if (files.length === 1) return;
    setFiles(files.filter(f => f.id !== id));
  };

  const handleFileChange = (id: string, file: File | null) => {
    setFiles(files.map(f => f.id === id ? { ...f, file, name: file ? file.name : f.name } : f));
  };

  const handleAddressChange = (id: string, flashAddress: string) => {
    setFiles(files.map(f => f.id === id ? { ...f, flashAddress } : f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // Validation
    const missingFiles = files.some(f => !f.file);
    if (missingFiles) {
      setToast({ message: "Please select a firmware file (.bin, .hex, .uf2, .elf, etc.) for all component rows.", type: 'error' });
      return;
    }

    setLoading(true);

    try {
      // 1. Create temporary DB record to get ID
      const firmwareId = await createFirmware({
        name,
        version,
        description,
        targetBoard,
        status,
        createdBy: currentUser.uid,
        releaseNotes,
        files: {}
      });

      // 2. Upload files to Firebase Storage
      const filesMap: Record<string, FirmwareFile> = {};
      for (let i = 0; i < files.length; i++) {
        const item = files[i];
        if (item.file) {
          const fileResult = await uploadFirmwareFile(firmwareId, `file${i}`, item.file);
          filesMap[`file_${i}`] = {
            fileName: fileResult.fileName,
            flashAddress: item.flashAddress || '0x0',
            storagePath: fileResult.storagePath,
            downloadUrl: fileResult.downloadUrl
          };
        }
      }

      // 3. Update DB record with file metadata
      const { updateFirmware } = await import('../../services/firmwareService');
      await updateFirmware(firmwareId, { files: filesMap });

      setToast({ message: "Firmware package uploaded successfully!", type: 'success' });
      setTimeout(() => {
        navigate('/admin/firmware');
      }, 1500);
    } catch (err: any) {
      setToast({ message: `Upload failed: ${err.message}`, type: 'error' });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/firmware')}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-100">Upload Firmware Package</h1>
              <p className="text-xs text-slate-400">Add new firmware binaries and configure flash layout parameters</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Firmware Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ESP32-C3 Blinky Example"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Version *
              </label>
              <input
                type="text"
                required
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="1.0.0"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 transition-all font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Target Board *
              </label>
              <select
                value={targetBoard}
                onChange={(e) => setTargetBoard(e.target.value as ESPBoardType)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 transition-all"
              >
                <option value="ESP32">ESP32</option>
                <option value="ESP32-C3">ESP32-C3</option>
                <option value="ESP32-S2">ESP32-S2</option>
                <option value="ESP32-S3">ESP32-S3</option>
                <option value="ESP32-C6">ESP32-C6</option>
                <option value="ESP8266">ESP8266</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Initial Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 transition-all"
              >
                <option value="active">Active (Visible to users)</option>
                <option value="inactive">Inactive (Draft / Hidden)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Simple LED blinking firmware for ESP32-C3 mini board."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 transition-all"
            />
          </div>

          {/* Firmware Files Component Section */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  Firmware Image Components
                  <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60 text-cyan-400">
                    Supports .bin, .hex, .uf2, .elf, .dfu, .zip
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Specify flash offset addresses and upload your firmware files</p>
              </div>
              <button
                type="button"
                onClick={handleAddFileRow}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-400 text-xs font-semibold border border-slate-800 transition-colors self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Component File
              </button>
            </div>

            <div className="space-y-3">
              {files.map((row) => (
                <div key={row.id} className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-4">
                    <label className="block text-[11px] text-slate-400 mb-1">Offset Address</label>
                    <input
                      type="text"
                      value={row.flashAddress}
                      onChange={(e) => handleAddressChange(row.id, e.target.value)}
                      placeholder="0x0 or 0x10000"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="sm:col-span-7">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] text-slate-400">Firmware File (.bin, .hex, .uf2, .elf, etc.)</label>
                      {row.file && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300">
                          {row.file.name.split('.').pop()?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <input
                      type="file"
                      accept=".bin,.hex,.ihex,.elf,.uf2,.dfu,.img,.zip,.ota,.out,application/octet-stream"
                      onChange={(e) => handleFileChange(row.id, e.target.files?.[0] || null)}
                      className="w-full text-xs text-slate-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-cyan-500/10 file:text-cyan-400 hover:file:bg-cyan-500/20 cursor-pointer"
                    />
                  </div>

                  <div className="sm:col-span-1 flex justify-end pt-4 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => handleRemoveFileRow(row.id)}
                      disabled={files.length === 1}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 disabled:opacity-30 transition-colors"
                      title="Remove component file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => navigate('/admin/firmware')}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium text-xs border border-slate-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-900/40 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading to Firebase Storage...
                </>
              ) : (
                <>
                  <HardDriveUpload className="w-4 h-4" />
                  Upload & Publish Firmware
                </>
              )}
            </button>
          </div>
        </form>
      </main>

      {toast && (
        <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};
