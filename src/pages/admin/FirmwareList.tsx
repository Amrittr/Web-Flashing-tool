import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/common/Navbar';
import { getAllFirmwares, updateFirmware, deleteFirmware } from '../../services/firmwareService';
import type { Firmware } from '../../types';
import { HardDrive, Plus, Edit, Trash2, CheckCircle, Power, Loader2 } from 'lucide-react';
import { ToastNotification } from '../../components/common/ToastNotification';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';

export const FirmwareList: React.FC = () => {
  const [firmwares, setFirmwares] = useState<Firmware[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deletingFirmware, setDeletingFirmware] = useState<Firmware | null>(null);

  const fetchList = async () => {
    try {
      setLoading(true);
      const data = await getAllFirmwares();
      setFirmwares(data);
    } catch (e) {
      console.error("Failed to load firmware list", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleToggleStatus = async (firmware: Firmware) => {
    const newStatus = firmware.status === 'active' ? 'inactive' : 'active';
    try {
      await updateFirmware(firmware.id, { status: newStatus });
      setToast({ message: `Firmware status updated to ${newStatus}`, type: 'success' });
      fetchList();
    } catch (e: any) {
      setToast({ message: `Failed to update status: ${e.message}`, type: 'error' });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingFirmware) return;
    try {
      await deleteFirmware(deletingFirmware);
      setToast({ message: "Firmware deleted successfully", type: 'success' });
      setDeletingFirmware(null);
      fetchList();
    } catch (e: any) {
      setToast({ message: `Delete failed: ${e.message}`, type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">Firmware Management</h1>
              <p className="text-xs text-slate-400">Upload, edit, configure and publish firmware binaries for ESP boards</p>
            </div>
          </div>

          <Link
            to="/admin/firmware/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs shadow-lg shadow-cyan-900/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add New Firmware
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-400 mr-3" />
            <span>Loading firmware packages...</span>
          </div>
        ) : firmwares.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl text-center border border-slate-800">
            <HardDrive className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-300">No Firmware Packages Found</h3>
            <p className="text-xs text-slate-500 mt-1">Upload your first ESP firmware build to allow users to flash devices.</p>
          </div>
        ) : (
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-4 px-6">Firmware Name</th>
                    <th className="py-4 px-6">Version</th>
                    <th className="py-4 px-6">Target Board</th>
                    <th className="py-4 px-6">Binary Files</th>
                    <th className="py-4 px-6">Upload Date</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {firmwares.map((fw) => (
                    <tr key={fw.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-200">
                        {fw.name}
                        {fw.description && <span className="block text-[11px] font-normal text-slate-400 truncate max-w-xs">{fw.description}</span>}
                      </td>
                      <td className="py-4 px-6 font-mono text-cyan-400">
                        v{fw.version}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-800 font-mono text-[11px]">
                          {fw.targetBoard}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-400">
                        {Object.keys(fw.files || {}).length} file(s)
                      </td>
                      <td className="py-4 px-6 text-slate-400">
                        {new Date(fw.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        {fw.status === 'active' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800 font-medium">
                            <CheckCircle className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 text-slate-500 border border-slate-800 font-medium">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => handleToggleStatus(fw)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            fw.status === 'active' 
                              ? 'bg-amber-950/40 text-amber-300 border-amber-800 hover:bg-amber-900/60' 
                              : 'bg-emerald-950/40 text-emerald-300 border-emerald-800 hover:bg-emerald-900/60'
                          }`}
                          title={fw.status === 'active' ? 'Disable Firmware' : 'Enable Firmware'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          to={`/admin/firmware/edit/${fw.id}`}
                          className="inline-block p-1.5 rounded-lg bg-slate-900 text-slate-300 hover:text-cyan-400 border border-slate-800 hover:border-cyan-500/30 transition-colors"
                          title="Edit Firmware"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => setDeletingFirmware(fw)}
                          className="p-1.5 rounded-lg bg-rose-950/40 text-rose-400 border border-rose-800 hover:bg-rose-900/60 transition-colors"
                          title="Delete Firmware"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {toast && (
        <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <ConfirmationModal
        isOpen={!!deletingFirmware}
        title="Delete Firmware Build"
        message={`Are you sure you want to permanently delete '${deletingFirmware?.name}' and all its associated binary files from Storage?`}
        confirmText="Delete Firmware"
        isDanger={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingFirmware(null)}
      />
    </div>
  );
};
