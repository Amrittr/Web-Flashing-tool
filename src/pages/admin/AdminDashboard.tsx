import React, { useEffect, useState } from 'react';
import { Navbar } from '../../components/common/Navbar';
import { getAllUsers } from '../../services/authService';
import { getAllFirmwares, getAllFlashHistory } from '../../services/firmwareService';
import { Users, HardDrive, Zap, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFirmware: 0,
    totalFlashes: 0,
    successFlashes: 0,
    failedFlashes: 0
  });

  const [recentFlashes, setRecentFlashes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [users, firmwares, flashes] = await Promise.all([
          getAllUsers(),
          getAllFirmwares(),
          getAllFlashHistory()
        ]);

        const success = flashes.filter(f => f.status === 'success').length;
        const failed = flashes.filter(f => f.status === 'failed').length;

        setStats({
          totalUsers: users.length,
          totalFirmware: firmwares.length,
          totalFlashes: flashes.length,
          successFlashes: success,
          failedFlashes: failed
        });

        setRecentFlashes(flashes.slice(0, 5));
      } catch (err) {
        console.error("Error loading admin dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Admin Control Center</h1>
            <p className="text-xs text-slate-400 mt-1">Platform overview, system statistics and activity insights</p>
          </div>
          <Link
            to="/admin/firmware/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs shadow-lg shadow-cyan-900/30 transition-all"
          >
            <HardDrive className="w-4 h-4" />
            Upload New Firmware
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Users</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-bold text-slate-100">{stats.totalUsers}</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Firmware</span>
              <HardDrive className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-bold text-slate-100">{stats.totalFirmware}</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Flash Operations</span>
              <Zap className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-bold text-slate-100">{stats.totalFlashes}</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Successful</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400">{stats.successFlashes}</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Failed</span>
              <XCircle className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-2xl font-bold text-rose-400">{stats.failedFlashes}</p>
          </div>
        </div>

        {/* Recent Operations */}
        <div className="glass-panel rounded-2xl border border-slate-800 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              Recent Platform Flashes
            </h2>
          </div>

          {loading ? (
            <p className="text-xs text-slate-500 py-6 text-center">Loading recent platform events...</p>
          ) : recentFlashes.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No flashing activity recorded yet.</p>
          ) : (
            <div className="space-y-2.5">
              {recentFlashes.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-900/60 px-4 py-3 rounded-xl border border-slate-800/80 text-xs">
                  <div className="flex items-center gap-3">
                    {item.status === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <div>
                      <strong className="text-slate-200 block text-sm">{item.firmwareName}</strong>
                      <span className="text-slate-400 font-mono">Target: {item.board}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block">{new Date(item.startedAt).toLocaleString()}</span>
                    <span className="text-cyan-400 font-mono text-[11px]">{(item.duration / 1000).toFixed(1)}s</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
