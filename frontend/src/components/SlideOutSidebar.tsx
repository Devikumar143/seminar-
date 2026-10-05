import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  X,
  LayoutDashboard,
  Compass,
  Ticket,
  ClipboardCheck,
  Award,
  User,
  LogOut,
  Shield,
  ShieldCheck,
  ChevronRight,
  LogIn,
  UserPlus,
  QrCode,
  Sparkles,
  MapPin,
  Settings,
  BarChart3,
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SlideOutSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SlideOutSidebar: React.FC<SlideOutSidebarProps> = ({ isOpen, onClose }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when sidebar drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/login');
  };

  const categories = [
    'Artificial Intelligence',
    'Cybersecurity',
    'Cloud Computing',
    'Quantum Computing',
    'Blockchain',
  ];

  return createPortal(
    <>
      {/* Backdrop Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[9998] bg-slate-900/50 backdrop-blur-xs transition-opacity duration-200 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Slide-Out Drawer Panel */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-[9999] w-80 max-w-[85vw] h-full bg-white border-r border-slate-200 shadow-2xl flex flex-col justify-between transition-transform duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="University Navigation Sidebar"
      >
        {/* Drawer Header */}
        <div className="h-16 px-4 border-b border-slate-200/90 flex items-center justify-between shrink-0 bg-white">
          <Link to="/" onClick={onClose} className="flex items-center gap-2 group">
            <div className="flex flex-col">
              <span className="text-base font-black tracking-tight text-slate-900 group-hover:text-blue-900 transition-colors">
                Joy<span className="text-blue-600 font-extrabold ml-0.5">University</span>
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 block -mt-0.5">
                Academic Seminars
              </span>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200/80 cursor-pointer"
            title="Close Sidebar (Esc)"
            aria-label="Close Sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 text-slate-800">
          {/* User Profile Card / Guest Greeting */}
          {isAuthenticated ? (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <img
                  src={
                    user?.profile_photo ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                      user?.name || 'User'
                    )}`
                  }
                  alt={user?.name}
                  className="w-10 h-10 rounded-lg object-cover ring-1 ring-slate-200 shrink-0 bg-white"
                />
                <div className="overflow-hidden min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{user?.name}</h4>
                  <p className="text-[11px] text-blue-900 font-mono font-semibold truncate">
                    {user?.role === 'student' ? user?.student_id || 'Student' : user?.role.replace('_', ' ')}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {user?.department || 'Joy University'}
                  </p>
                </div>
              </div>

              <div className="mt-2.5 pt-2.5 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-600">
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  Active Session
                </span>
                <span className="font-mono text-slate-500 uppercase">{user?.role}</span>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-center">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Academic Guest</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Sign in to reserve your digital seminar seat and receive attendance passes.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={onClose}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log In</span>
                </Link>
                <Link
                  to="/register"
                  onClick={onClose}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </Link>
              </div>
            </div>
          )}

          {/* Main Discover Section */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1.5">
              Portal Discovery
            </span>
            <NavLink
              to="/"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>Portal Home</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </NavLink>

            <NavLink
              to="/seminars"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <Compass className="w-4 h-4 shrink-0" />
                <span>Browse All Seminars</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </NavLink>

            <NavLink
              to="/verify-certificate/demo"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Verify Academic Certificate</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </NavLink>
          </div>

          {/* Student Dedicated Navigation */}
          {isAuthenticated && !isAdmin && (
            <div className="space-y-1 pt-2 border-t border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1.5">
                Student Console
              </span>
              <NavLink
                to="/dashboard"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  <span>Student Dashboard</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </NavLink>

              <NavLink
                to="/my-registrations"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Ticket className="w-4 h-4 shrink-0" />
                  <span>My Registration Passes</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </NavLink>

              <NavLink
                to="/my-attendance"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <ClipboardCheck className="w-4 h-4 shrink-0" />
                  <span>Attendance Records</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </NavLink>

              <NavLink
                to="/certificates"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 shrink-0" />
                  <span>My Certificates</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </NavLink>

              <NavLink
                to="/profile"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4 shrink-0" />
                  <span>My Student Profile</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </NavLink>
            </div>
          )}

          {/* Admin Dedicated Navigation (If Admin) */}
          {isAdmin && (
            <div className="space-y-1 pt-2 border-t border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1.5">
                Admin Console
              </span>
              <NavLink
                to="/admin/dashboard"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  <span>Admin Dashboard</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </NavLink>

              <NavLink
                to="/admin/seminars"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Compass className="w-4 h-4 shrink-0" />
                  <span>Manage Seminars</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </NavLink>

              <NavLink
                to="/admin/attendance"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <QrCode className="w-4 h-4 shrink-0" />
                  <span>QR Attendance Scanner</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </NavLink>

              <NavLink
                to="/admin/certificates"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 shrink-0" />
                  <span>Issue Certificates</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </NavLink>

              <NavLink
                to="/admin/analytics"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 className="w-4 h-4 shrink-0" />
                  <span>Reports & Analytics</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </NavLink>

              <NavLink
                to="/admin/users"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 shrink-0" />
                  <span>Manage Users</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </NavLink>

              <NavLink
                to="/admin/settings"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4 shrink-0" />
                  <span>System Settings</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </NavLink>
            </div>
          )}

          {/* Academic Categories Filter Shortcuts */}
          <div className="space-y-1.5 pt-2 border-t border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1.5">
              Disciplines & Categories
            </span>
            <div className="flex flex-wrap gap-1.5 px-1">
              {categories.map((cat) => (
                <Link
                  key={cat}
                  to={`/seminars?category=${encodeURIComponent(cat)}`}
                  onClick={onClose}
                  className="px-2.5 py-1 text-[11px] rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-medium transition-colors"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>

          {/* Staff Access Link for non-admins */}
          {!isAdmin && (
            <div className="pt-2 border-t border-slate-200">
              <Link
                to="/admin/login"
                onClick={onClose}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-dashed border-slate-200"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-slate-500" />
                  <span>Staff / Admin Console</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </Link>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 shrink-0 space-y-3">
          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">Academic Block 1, Joy Main Campus</span>
          </div>

          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 transition-colors shadow-2xs"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out ({user?.name?.split(' ')[0]})</span>
            </button>
          ) : (
            <div className="text-[10px] text-slate-500 text-center">
              Joy University Official Seminar Portal
            </div>
          )}
        </div>
      </aside>
    </>,
    document.body
  );
};
