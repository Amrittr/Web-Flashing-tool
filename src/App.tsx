import React from 'react';
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

export const App: React.FC = () => {
  return (
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
  );
};

export default App;
