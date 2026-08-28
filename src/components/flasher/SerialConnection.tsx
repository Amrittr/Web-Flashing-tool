import React from 'react';
import type { ConnectionStatus, ESPBoardType } from '../../types';
import { Usb, RefreshCw, Power, AlertCircle, Radio } from 'lucide-react';

interface SerialConnectionProps {
  status: ConnectionStatus;
  detectedChip: string;
  portName: string;
  baudRate: number;
  targetBoard: ESPBoardType;
  onBaudRateChange: (rate: number) => void;
  onTargetBoardChange: (board: ESPBoardType) => void;
  onConnect: () => void;
  onDisconnect: () => void;
  onReset: () => void;
  disabled: boolean;
}

export const SerialConnection: React.FC<SerialConnectionProps> = ({
  status,
  detectedChip,
  portName,
  baudRate,
  targetBoard,
  onBaudRateChange,
  onTargetBoardChange,
  onConnect,
  onDisconnect,
  onReset,
  disabled
}) => {
  const isConnected = status === 'Device connected' || status === 'Flash completed' || status === 'Flashing firmware' || status === 'Erasing flash';

  const getStatusBadge = () => {
    switch (status) {
      case 'Device connected':
      case 'Flash completed':
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            {status}
          </span>
        );
      case 'Connecting':
      case 'Flashing firmware':
      case 'Erasing flash':
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            {status}
          </span>
        );
      case 'Connection failed':
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 bg-rose-950/60 px-3 py-1 rounded-full border border-rose-800">
            <AlertCircle className="w-3.5 h-3.5" />
            {status}
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-slate-500"></span>
            {status}
          </span>
        );
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Usb className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Serial Connection</h2>
            <p className="text-xs text-slate-400">Configure Web Serial port parameters and connection</p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* Target Board & Baud Rate Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Target Board
          </label>
          <select
            value={targetBoard}
            onChange={(e) => onTargetBoardChange(e.target.value as ESPBoardType)}
            disabled={disabled || isConnected}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 disabled:opacity-60"
          >
            <option value="Auto Detect">Auto Detect</option>
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
            Baud Rate
          </label>
          <select
            value={baudRate}
            onChange={(e) => onBaudRateChange(Number(e.target.value))}
            disabled={disabled || isConnected}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 disabled:opacity-60"
          >
            <option value={115200}>115200</option>
            <option value={230400}>230400</option>
            <option value={460800}>460800</option>
            <option value={921600}>921600 (Recommended)</option>
          </select>
        </div>
      </div>

      {/* Connected Device Info Box */}
      {isConnected && (
        <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800/80 space-y-2 text-xs animate-fade-in">
          <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
            <span>Detected Chip:</span>
            <strong className="text-cyan-300 font-mono text-sm">{detectedChip || 'ESP32 (Generic)'}</strong>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Connected Port:</span>
            <strong className="text-slate-200 font-mono">{portName}</strong>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        {!isConnected ? (
          <button
            onClick={onConnect}
            disabled={disabled}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-sm shadow-lg shadow-cyan-900/30 transition-all disabled:opacity-50"
          >
            <Radio className="w-4 h-4" />
            Connect Device
          </button>
        ) : (
          <button
            onClick={onDisconnect}
            disabled={disabled}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 font-medium text-sm transition-all disabled:opacity-50"
          >
            <Power className="w-4 h-4" />
            Disconnect
          </button>
        )}

        <button
          onClick={onReset}
          disabled={!isConnected || disabled}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-sm transition-all disabled:opacity-50"
          title="Hardware Reset ESP Board"
        >
          <RefreshCw className="w-4 h-4" />
          Reset Board
        </button>
      </div>
    </div>
  );
};
