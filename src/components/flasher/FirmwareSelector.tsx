import React from 'react';
import type { Firmware } from '../../types';
import { FileCode2, Info, Calendar, HardDrive, Cpu, CheckCircle2 } from 'lucide-react';

interface FirmwareSelectorProps {
  firmwares: Firmware[];
  selectedFirmware: Firmware | null;
  onSelect: (firmware: Firmware | null) => void;
  loading: boolean;
}

export const FirmwareSelector: React.FC<FirmwareSelectorProps> = ({
  firmwares,
  selectedFirmware,
  onSelect,
  loading
}) => {
  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          <FileCode2 className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100">Firmware Selection</h2>
          <p className="text-xs text-slate-400">Choose an active verified firmware package to flash</p>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-slate-800 rounded-xl w-full"></div>
          <div className="h-24 bg-slate-800/50 rounded-xl w-full"></div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Dropdown */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Select Firmware Build
            </label>
            <select
              value={selectedFirmware?.id || ''}
              onChange={(e) => {
                const found = firmwares.find((f) => f.id === e.target.value);
                onSelect(found || null);
              }}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all cursor-pointer"
            >
              <option value="">-- Choose Firmware Package --</option>
              {firmwares.map((firmware) => (
                <option key={firmware.id} value={firmware.id}>
                  {firmware.name} (v{firmware.version}) - [{firmware.targetBoard}]
                </option>
              ))}
            </select>
          </div>

          {/* Details Preview */}
          {selectedFirmware ? (
            <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-4 animate-fade-in">
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-semibold text-cyan-300 text-base flex items-center gap-2">
                    {selectedFirmware.name}
                    <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                      v{selectedFirmware.version}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{selectedFirmware.description}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/50">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Available</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span className="text-slate-400">Target Board:</span>
                  <strong className="text-slate-100">{selectedFirmware.targetBoard}</strong>
                </div>

                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span className="text-slate-400">Upload Date:</span>
                  <strong className="text-slate-100">
                    {new Date(selectedFirmware.createdAt).toLocaleDateString()}
                  </strong>
                </div>
              </div>

              {/* Package Files List */}
              {selectedFirmware.files && (
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Binary Components ({Object.keys(selectedFirmware.files).length}):
                  </span>
                  <div className="space-y-1.5">
                    {Object.entries(selectedFirmware.files).map(([key, file]) => (
                      <div key={key} className="flex items-center justify-between bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
                        <span className="text-slate-200 font-mono flex items-center gap-2">
                          <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                          {file.fileName}
                        </span>
                        <span className="text-cyan-400 font-mono text-[11px]">
                          Offset: {file.flashAddress}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl bg-slate-900/30">
              <Info className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">Please select a firmware build above to proceed with flashing.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
