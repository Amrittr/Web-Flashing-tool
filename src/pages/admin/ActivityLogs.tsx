import React, { useEffect, useState } from 'react';
import { Navbar } from '../../components/common/Navbar';
import { getSystemLogs } from '../../services/firmwareService';
import type { SystemLog } from '../../types';
import { Activity, Clock, ShieldAlert, Loader2 } from 'lucide-react';

export const ActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const data = await getSystemLogs();
        setLogs(data);
      } catch (e) {
        console.error("Failed to load system logs", e);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">System Activity Logs</h1>
              <p className="text-xs text-slate-400">Audit trail of system events, user operations and flash actions</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-400 mr-3" />
            <span>Loading system audit logs...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl text-center border border-slate-800">
            <ShieldAlert className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-300">No System Logs Found</h3>
            <p className="text-xs text-slate-500 mt-1">Audit logs will automatically populate as operations occur across the platform.</p>
          </div>
        ) : (
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-4 px-6">Timestamp</th>
                    <th className="py-4 px-6">User ID</th>
                    <th className="py-4 px-6">Action Event</th>
                    <th className="py-4 px-6">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-4 px-6 font-mono text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono text-cyan-400 truncate max-w-xs">
                        {log.userId}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-900 text-slate-200 border border-slate-800 font-mono text-[11px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-300">
                        {log.details || 'N/A'}
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
