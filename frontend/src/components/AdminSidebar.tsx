import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  PlusCircle,
  Users,
  QrCode,
  Award,
  BarChart3,
  UserCheck,
  Settings,
  LogOut,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Admin Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Manage Seminars', path: '/admin/seminars', icon: CalendarDays },
    { label: 'Create Seminar', path: '/admin/seminars/create', icon: PlusCircle },
    { label: 'Registrations', path: '/admin/registrations', icon: UserCheck },
    { label: 'QR Attendance Scanner', path: '/admin/attendance', icon: QrCode, badge: 'Live' },
    { label: 'Certificates Issuance', path: '/admin/certificates', icon: Award },
    { label: 'User Directory', path: '/admin/users', icon: Users },
    { label: 'Analytics & Reports', path: '/admin/analytics', icon: BarChart3 },
    { label: 'System Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white text-slate-700 border-r border-slate-200 shrink-0 hidden md:flex flex-col justify-between p-4 sticky top-0 h-screen">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-4 mb-4 border-b border-slate-200">
          <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-wide">JOY ADMIN</h2>
            <p className="text-[11px] text-slate-500 font-medium">Seminar Control Center</p>
          </div>
        </div>

        {/* Admin info badge */}
        <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 mb-4">
          <div className="text-xs font-semibold text-slate-900 truncate">{user?.name}</div>
          <div className="text-[10px] text-slate-500 font-mono capitalize">
            {user?.role?.replace('_', ' ')}
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin/dashboard'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-blue-50/90 text-blue-950 font-bold border border-blue-200/80 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/90 border border-transparent font-medium'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-600 rounded-r-full" />
                    )}
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-700'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-800 rounded uppercase">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer controls */}
      <div className="pt-4 border-t border-slate-200 space-y-1">
        <NavLink
          to="/seminars"
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Switch to Public Portal</span>
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Admin Logout</span>
        </button>
      </div>
    </aside>
  );
};
