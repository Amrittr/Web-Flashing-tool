import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Zap, 
  LogOut, 
  User, 
  History, 
  Cpu, 
  LayoutDashboard,
  HardDriveUpload,
  Users,
  Activity
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { userProfile, isAdmin, logout } = useAuth();
  const location = useLocation();

  const isCurrent = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Header */}
        <div className="flex items-center gap-6">
          <Link to={isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-3 group">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-200">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg bg-gradient-to-r from-cyan-400 via-sky-300 to-white bg-clip-text text-transparent">
                  ESP Web Flasher
                </span>
                {isAdmin && (
                  <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Flash ESP firmware directly from the browser</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 ml-4 border-l border-slate-800 pl-4">
            {!isAdmin ? (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isCurrent('/dashboard') 
                      ? 'bg-slate-800 text-cyan-400 border border-slate-700' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Cpu className="w-4 h-4" />
                  Flasher
                </Link>
                <Link
                  to="/history"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isCurrent('/history') 
                      ? 'bg-slate-800 text-cyan-400 border border-slate-700' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <History className="w-4 h-4" />
                  Flash History
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/admin"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isCurrent('/admin') 
                      ? 'bg-slate-800 text-cyan-400 border border-slate-700' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Overview
                </Link>
                <Link
                  to="/admin/firmware"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname.startsWith('/admin/firmware') 
                      ? 'bg-slate-800 text-cyan-400 border border-slate-700' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <HardDriveUpload className="w-4 h-4" />
                  Firmware
                </Link>
                <Link
                  to="/admin/users"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isCurrent('/admin/users') 
                      ? 'bg-slate-800 text-cyan-400 border border-slate-700' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Users
                </Link>
                <Link
                  to="/admin/activity"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isCurrent('/admin/activity') 
                      ? 'bg-slate-800 text-cyan-400 border border-slate-700' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  Activity Logs
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-3">
          {userProfile && (
            <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                <User className="w-4 h-4" />
              </div>
              <div className="text-left leading-tight">
                <p className="text-xs font-semibold text-slate-200">{userProfile.name}</p>
                <p className="text-[11px] text-slate-400">{userProfile.email}</p>
              </div>
            </div>
          )}

          {isAdmin && (
            <Link
              to="/dashboard"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              <Cpu className="w-3.5 h-3.5" />
              Switch to User View
            </Link>
          )}

          <button
            onClick={() => logout()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/20 transition-all"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>

      </div>
    </header>
  );
};
