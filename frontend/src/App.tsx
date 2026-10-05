import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { StudentLayout } from './layouts/StudentLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public & Student Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminLogin } from './pages/AdminLogin';
import { Seminars } from './pages/Seminars';
import { SeminarDetail } from './pages/SeminarDetail';
import { StudentDashboard } from './pages/StudentDashboard';
import { MyRegistrations } from './pages/MyRegistrations';
import { MyAttendance } from './pages/MyAttendance';
import { Certificates } from './pages/Certificates';
import { VerifyCertificate } from './pages/VerifyCertificate';
import { Profile } from './pages/Profile';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminSeminars } from './pages/admin/AdminSeminars';
import { CreateSeminar } from './pages/admin/CreateSeminar';
import { EditSeminar } from './pages/admin/EditSeminar';
import { AdminRegistrations } from './pages/admin/AdminRegistrations';
import { AdminAttendance } from './pages/admin/AdminAttendance';
import { AdminCertificates } from './pages/admin/AdminCertificates';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';
import { AdminSettings } from './pages/admin/AdminSettings';

// Route guards
const StudentRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-xs text-slate-400">Loading session...</div>;
  }
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-xs text-slate-400">Authenticating admin...</div>;
  }
  return isAuthenticated && isAdmin ? <>{children}</> : <Navigate to="/admin/login" replace />;
};

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <NotificationProvider>
            <Routes>
              {/* Public Routes with Navbar & Footer */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/seminars" element={<Seminars />} />
                <Route path="/seminars/:id" element={<SeminarDetail />} />
                <Route path="/verify-certificate/:certificateId" element={<VerifyCertificate />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin/login" element={<AdminLogin />} />
              </Route>

              {/* Protected Student Portal with Sidebar */}
              <Route
                element={
                  <StudentRoute>
                    <StudentLayout />
                  </StudentRoute>
                }
              >
                <Route path="/dashboard" element={<StudentDashboard />} />
                <Route path="/my-registrations" element={<MyRegistrations />} />
                <Route path="/my-attendance" element={<MyAttendance />} />
                <Route path="/certificates" element={<Certificates />} />
                <Route path="/profile" element={<Profile />} />
              </Route>

              {/* Protected Admin Console with Admin Sidebar */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="seminars" element={<AdminSeminars />} />
                <Route path="seminars/create" element={<CreateSeminar />} />
                <Route path="seminars/:id/edit" element={<EditSeminar />} />
                <Route path="registrations" element={<AdminRegistrations />} />
                <Route path="attendance" element={<AdminAttendance />} />
                <Route path="certificates" element={<AdminCertificates />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
