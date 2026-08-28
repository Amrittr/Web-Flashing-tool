import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/common/Navbar';
import { getUserFlashHistory } from '../services/firmwareService';
import { useAuth } from '../contexts/AuthContext';
import type { FlashRecord } from '../types';
import { History, CheckCircle2, XCircle, Clock, Cpu, Calendar, Loader2 } from 'lucide-react';

export const UserHistory: React.FC = () => {
  const { currentUser } = useAuth();
  const [history, setHistory] = useState<FlashRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (currentUser) {
        try {
          const records = await getUserFlashHistory(currentUser.uid);
          // Sort most recent first
          records.sort((a, b) => b.startedAt - a.startedAt);
          setHistory(records);
        } catch (e) {
          console.error("Failed to load user flash history", e);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchHistory();
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">Personal Flash History</h1>
              <p className="text-xs text-slate-400">Review all firmware flashing operations performed from your account</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-400 mr-3" />
            <span>Loading history records...</span>
          </div>
        ) : history.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl text-center border border-slate-800">
            <History className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-300">No Flash Activity Found</h3>
            <p className="text-xs text-slate-500 mt-1">Connect an ESP device on the dashboard to flash your first firmware build.</p>
          </div>
        ) : (
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-4 px-6">Firmware</th>
                    <th className="py-4 px-6">Target Board</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Date & Time</th>
                    <th className="py-4 px-6 text-right">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {history.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-4 px-6 font-medium text-slate-200">
                        {record.firmwareName}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 text-slate-300 border border-slate-800 font-mono">
                          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                          {record.board}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {record.status === 'success' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Success
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-950/60 text-rose-400 border border-rose-800 font-medium">
                            <XCircle className="w-3.5 h-3.5" />
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {new Date(record.startedAt).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-mono text-slate-300">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {(record.duration / 1000).toFixed(1)}s
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
