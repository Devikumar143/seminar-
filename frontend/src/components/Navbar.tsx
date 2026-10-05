import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Bell, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Shield, 
  Calendar, 
  Award, 
  QrCode, 
  CheckCheck,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { SlideOutSidebar } from './SlideOutSidebar';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80 transition-all shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Sidebar Toggle + Brand Identity */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 rounded-lg transition-colors border border-slate-200/80 flex items-center justify-center gap-1.5 text-xs font-semibold"
              title="Open Navigation Sidebar"
              aria-label="Toggle Navigation Sidebar"
            >
              <Menu className="w-4 h-4 text-slate-800" />
              <span className="hidden sm:inline text-slate-700 text-xs font-medium">Menu</span>
            </button>

            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 group-hover:text-blue-900 transition-colors">
                  Joy<span className="text-blue-600 font-extrabold ml-0.5">University</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 block -mt-0.5">
                  Academic Seminars
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links - Segmented Pill Bar */}
          <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-100/80 border border-slate-200/70 rounded-full shadow-2xs">
            <Link
              to="/seminars"
              className={`px-3.5 py-1.5 rounded-full text-xs transition-all ${
                isActive('/seminars')
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 font-medium'
              }`}
            >
              Browse Seminars
            </Link>

            {isAuthenticated && !isAdmin && (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3.5 py-1.5 rounded-full text-xs transition-all ${
                    isActive('/dashboard')
                      ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 font-medium'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/my-registrations"
                  className={`px-3.5 py-1.5 rounded-full text-xs transition-all ${
                    isActive('/my-registrations')
                      ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 font-medium'
                  }`}
                >
                  My Passes
                </Link>
                <Link
                  to="/certificates"
                  className={`px-3.5 py-1.5 rounded-full text-xs transition-all ${
                    isActive('/certificates')
                      ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 font-medium'
                  }`}
                >
                  Certificates
                </Link>
              </>
            )}

            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Console</span>
              </Link>
            )}

            <Link
              to="/verify-certificate/demo"
              className={`px-3 py-1.5 rounded-full text-xs transition-all flex items-center gap-1.5 ${
                isActive('/verify-certificate/demo')
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-white/50 font-medium'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Verify</span>
            </Link>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* Notifications Bell Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setNotifDropdownOpen(!notifDropdownOpen);
                      setUserDropdownOpen(false);
                    }}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-full relative transition-colors border border-transparent hover:border-slate-200/60"
                    title="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50 animate-slide-up text-slate-800">
                      <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">Notifications</span>
                          {unreadCount > 0 && (
                            <span className="px-2 py-0.5 text-[10px] bg-blue-100 text-blue-800 rounded-full font-bold">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-[11px] text-blue-700 hover:text-blue-900 font-medium flex items-center gap-1"
                          >
                            <CheckCheck className="w-3 h-3" />
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-slate-400 text-xs">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => markAsRead(notif.id)}
                              className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${
                                !notif.is_read ? 'bg-blue-50/40' : ''
                              }`}
                            >
                              <div
                                className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                                  !notif.is_read ? 'bg-blue-600' : 'bg-transparent'
                                }`}
                              />
                              <div className="flex-1">
                                <h4 className="text-xs font-semibold text-slate-900 leading-snug">
                                  {notif.title}
                                </h4>
                                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                                  {notif.message}
                                </p>
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                  {new Date(notif.created_at).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Avatar Capsule & Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(!userDropdownOpen);
                      setNotifDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-slate-100/80 hover:bg-slate-100 transition-colors border border-slate-200/80 shadow-2xs"
                  >
                    <img
                      src={
                        user?.profile_photo ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                          user?.name || 'User'
                        )}`
                      }
                      alt={user?.name}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-white"
                    />
                    <div className="hidden sm:block text-left pr-0.5">
                      <div className="text-xs font-semibold text-slate-900 leading-none">
                        {user?.name?.split(' ')[0]}
                      </div>
                      <div className="text-[10px] text-slate-500 leading-none mt-1 font-mono">
                        {user?.role === 'student' ? user?.student_id || 'Student' : user?.role.replace('_', ' ')}
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/80 py-1.5 z-50 animate-slide-up text-slate-800">
                      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70">
                        <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                        <span className="inline-block mt-1.5 px-2 py-0.5 text-[9px] font-semibold bg-blue-50 text-blue-800 border border-blue-200/60 rounded-full uppercase tracking-wider">
                          {user?.role.replace('_', ' ')}
                        </span>
                      </div>

                      {user?.role === 'student' ? (
                        <>
                          <Link
                            to="/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                          >
                            <Calendar className="w-4 h-4 text-slate-400" />
                            Dashboard
                          </Link>
                          <Link
                            to="/profile"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                          >
                            <User className="w-4 h-4 text-slate-400" />
                            My Profile
                          </Link>
                          <Link
                            to="/my-registrations"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                          >
                            <QrCode className="w-4 h-4 text-slate-400" />
                            My Passes
                          </Link>
                          <Link
                            to="/certificates"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                          >
                            <Award className="w-4 h-4 text-slate-400" />
                            Certificates
                          </Link>
                        </>
                      ) : (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
                        >
                          <Shield className="w-4 h-4 text-blue-600" />
                          Admin Console
                        </Link>
                      )}

                      <div className="border-t border-slate-100 my-1" />

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 rounded-full transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-full transition-all shadow-xs hover:shadow"
                >
                  Register Free
                </Link>
                <Link
                  to="/admin/login"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50 rounded-full transition-colors"
                >
                  <Shield className="w-3.5 h-3.5 text-slate-500" />
                  <span>Admin</span>
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-full transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-1 text-slate-800">
          <Link
            to="/seminars"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Browse Seminars
          </Link>

          {isAuthenticated ? (
            <>
              {user?.role === 'student' ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Student Dashboard
                  </Link>
                  <Link
                    to="/my-registrations"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    My Passes
                  </Link>
                  <Link
                    to="/my-attendance"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Attendance Record
                  </Link>
                  <Link
                    to="/certificates"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    My Certificates
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Profile Settings
                  </Link>
                </>
              ) : (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-bold text-white bg-slate-900"
                >
                  Admin Console
                </Link>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50"
              >
                Log Out
              </button>
            </>
          ) : (
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2 text-xs font-semibold text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
              >
                Create Student Account
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Slide-out Sidebar Drawer */}
      <SlideOutSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </header>
  );
};
