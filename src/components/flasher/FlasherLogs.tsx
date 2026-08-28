import React, { useRef, useEffect } from 'react';
import type { LogMessage } from '../../types';
import { Terminal, Copy, Trash2, Check } from 'lucide-react';

interface FlasherLogsProps {
  logs: LogMessage[];
  onClear: () => void;
}

export const FlasherLogs: React.FC<FlasherLogsProps> = ({ logs, onClear }) => {
  const [copied, setCopied] = React.useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCopy = () => {
    const text = logs.map(l => `[${l.timestamp}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTypeStyle = (type: LogMessage['type']) => {
    switch (type) {
      case 'success': return 'text-emerald-400';
      case 'error': return 'text-rose-400 font-semibold';
      case 'warning': return 'text-amber-300';
      default: return 'text-cyan-300/90';
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">ESP Flasher Logs</h2>
            <p className="text-xs text-slate-400">Detailed operation execution sequence and output</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            disabled={logs.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition-all disabled:opacity-40"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Logs'}
          </button>
          <button
            onClick={onClear}
            disabled={logs.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 text-xs font-medium border border-slate-800 transition-all disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            Clear Logs
          </button>
        </div>
      </div>

      <div
        ref={logContainerRef}
        className="bg-slate-950/90 rounded-xl p-4 border border-slate-900 font-mono text-xs h-48 overflow-y-auto space-y-1.5 shadow-inner"
      >
        {logs.length === 0 ? (
          <p className="text-slate-600 italic">No activity logged yet. Connect device and start flashing.</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 leading-relaxed">
              <span className="text-slate-500 select-none shrink-0">{log.timestamp}</span>
              <span className={`break-all ${getTypeStyle(log.type)}`}>{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
