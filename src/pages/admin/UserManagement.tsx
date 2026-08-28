import React, { useEffect, useState } from 'react';
import { Navbar } from '../../components/common/Navbar';
import { getAllUsers, updateUserRole, updateUserStatus } from '../../services/authService';
import type { UserProfile, UserRole } from '../../types';
import { Users, User, CheckCircle2, XCircle, Power, Loader2 } from 'lucide-react';
import { ToastNotification } from '../../components/common/ToastNotification';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const list = await getAllUsers();
      setUsers(list);
    } catch (e) {
      console.error("Failed to load users", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (uid: string, newRole: UserRole) => {
    try {
      await updateUserRole(uid, newRole);
      setToast({ message: `User role updated to ${newRole}`, type: 'success' });
      fetchUsers();
    } catch (e: any) {
      setToast({ message: `Role change failed: ${e.message}`, type: 'error' });
    }
  };

  const handleStatusToggle = async (uid: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'disabled' : 'active';
    try {
      await updateUserStatus(uid, nextStatus);
      setToast({ message: `User account ${nextStatus}`, type: 'success' });
      fetchUsers();
    } catch (e: any) {
      setToast({ message: `Status update failed: ${e.message}`, type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">User Management</h1>
              <p className="text-xs text-slate-400">View registered users, grant administrative permissions, or manage account access</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-400 mr-3" />
            <span>Loading user profiles...</span>
          </div>
        ) : (
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-4 px-6">User</th>
                    <th className="py-4 px-6">Role</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Joined Date</th>
                    <th className="py-4 px-6">Flashes</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {users.map((u) => (
                    <tr key={u.uid} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-4 px-6 font-medium text-slate-200">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <strong className="text-slate-100 block">{u.name}</strong>
                            <span className="text-slate-400 text-[11px]">{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.uid, e.target.value as UserRole)}
                          className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-cyan-300 font-medium focus:outline-none focus:border-cyan-500"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="py-4 px-6">
                        {u.status === 'active' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-950/60 text-rose-400 border border-rose-800 font-medium">
                            <XCircle className="w-3.5 h-3.5" />
                            Disabled
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 font-mono text-cyan-400">
                        {u.flashCount || 0}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleStatusToggle(u.uid, u.status)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            u.status === 'active' 
                              ? 'bg-rose-950/40 text-rose-400 border-rose-800 hover:bg-rose-900/60' 
                              : 'bg-emerald-950/40 text-emerald-400 border-emerald-800 hover:bg-emerald-900/60'
                          }`}
                          title={u.status === 'active' ? 'Disable Account' : 'Enable Account'}
                        >
                          <Power className="w-3.5 h-3.5" />
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
    </div>
  );
};
