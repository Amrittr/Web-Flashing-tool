import React, { useState } from 'react';
import { espService } from '../../services/espService';
import { Play, Square, Trash2, Copy, Check, Activity } from 'lucide-react';

export const SerialMonitor: React.FC = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [logs, setLogs] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleStart = async () => {
    try {
      setIsMonitoring(true);
      await espService.startSerialMonitor((data) => {
        setLogs((prev) => prev + data);
      });
    } catch (err: any) {
      console.error("Monitor failed:", err);
      setIsMonitoring(false);
    }
  };

  const handleStop = () => {
    espService.stopSerialMonitor();
    setIsMonitoring(false);
  };

  const handleClear = () => {
    setLogs('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(logs);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Live Serial Monitor</h2>
            <p className="text-xs text-slate-400">Stream incoming serial output from ESP UART TX</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isMonitoring ? (
            <button
              onClick={handleStart}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Start Monitoring
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition-all"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              Stop
            </button>
          )}
          <button
            onClick={handleCopy}
            disabled={!logs}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-slate-300 hover:text-white text-xs font-medium border border-slate-800 disabled:opacity-40"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            Copy
          </button>
          <button
            onClick={handleClear}
            disabled={!logs}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-slate-300 hover:text-rose-400 text-xs font-medium border border-slate-800 disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            Clear
          </button>
        </div>
      </div>

      <div className="bg-slate-950 rounded-xl p-4 border border-slate-900 font-mono text-xs text-emerald-400 h-44 overflow-y-auto whitespace-pre-wrap shadow-inner leading-relaxed">
        {logs || <span className="text-slate-600 italic">Serial output terminal idle. Click 'Start Monitoring' to stream data.</span>}
      </div>
    </div>
  );
};
