import React, { Component, type ReactNode } from 'react';

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/common/ProtectedRoutes';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { UserHistory } from './pages/History';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { FirmwareList } from './pages/admin/FirmwareList';
import { FirmwareUploadForm } from './pages/admin/FirmwareUploadForm';
import { UserManagement } from './pages/admin/UserManagement';
import { ActivityLogs } from './pages/admin/ActivityLogs';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught application error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl">
            <div className="inline-flex p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-slate-100 mb-2">Something went wrong</h1>
            <p className="text-xs text-slate-400 mb-4">
              {this.state.error?.message || "An unexpected error occurred while loading the application."}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition-all shadow-lg shadow-cyan-900/30"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* User Portal Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/history" element={<UserHistory />} />
            </Route>

            {/* Admin Portal Protected Routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/firmware" element={<FirmwareList />} />
              <Route path="/admin/firmware/new" element={<FirmwareUploadForm />} />
              <Route path="/admin/firmware/edit/:id" element={<FirmwareUploadForm />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/activity" element={<ActivityLogs />} />
            </Route>

            {/* Default Fallback Redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
