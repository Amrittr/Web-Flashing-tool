import React from 'react';
import type { ConnectionStatus } from '../../types';
import { Flame, Trash2, Loader2, AlertCircle } from 'lucide-react';

interface FlashControlsProps {
  status: ConnectionStatus;
  progress: number;
  onFlash: () => void;
  onErase: () => void;
  disabled: boolean;
  compatibilityWarning: string | null;
}

export const FlashControls: React.FC<FlashControlsProps> = ({
  status,
  progress,
  onFlash,
  onErase,
  disabled,
  compatibilityWarning
}) => {
  const isFlashing = status === 'Flashing firmware';
  const isErasing = status === 'Erasing flash';

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          <Flame className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100">Flash Firmware</h2>
          <p className="text-xs text-slate-400">Download binary files and write to ESP flash memory</p>
        </div>
      </div>

      {/* Compatibility warning if target chip mismatch */}
      {compatibilityWarning && (
        <div className="bg-rose-950/80 border border-rose-500/40 text-rose-200 p-3 rounded-xl text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-rose-300 font-semibold mb-0.5">Compatibility Warning</strong>
            {compatibilityWarning}
          </div>
        </div>
      )}

      {/* Progress Bar Display */}
      {(isFlashing || isErasing || progress > 0) && (
        <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-300 flex items-center gap-2">
              {(isFlashing || isErasing) && <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />}
              {isErasing ? 'Erasing Flash Memory...' : isFlashing ? 'Uploading & Writing Firmware...' : 'Operation Complete'}
            </span>
            <span className="text-cyan-400 font-mono">{progress}%</span>
          </div>

          <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-300 ease-out shadow-lg shadow-cyan-500/50"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <button
          onClick={onFlash}
          disabled={disabled || isFlashing || isErasing || !!compatibilityWarning}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-cyan-900/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isFlashing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Flashing ({progress}%)
            </>
          ) : (
            <>
              <Flame className="w-4 h-4" />
              Flash Now
            </>
          )}
        </button>

        <button
          onClick={onErase}
          disabled={disabled || isFlashing || isErasing}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-slate-800 hover:border-rose-500/30 font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isErasing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
              Erasing...
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4 text-rose-400" />
              Erase Flash
            </>
          )}
        </button>
      </div>
    </div>
  );
};
