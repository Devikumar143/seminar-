import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  Ticket,
  ClipboardCheck,
  Award,
  User,
  LogOut,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Browse Seminars', path: '/seminars', icon: Compass },
    { label: 'My Registrations', path: '/my-registrations', icon: Ticket },
    { label: 'My Attendance', path: '/my-attendance', icon: ClipboardCheck },
    { label: 'Certificates', path: '/certificates', icon: Award },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <aside className="w-64 bg-white/95 backdrop-blur-md border-r border-slate-200/90 shrink-0 hidden md:flex flex-col justify-between p-4 sticky top-16 h-[calc(100vh-4rem)] text-slate-700 shadow-2xs">
      <div>
        {/* User Profile Card */}
        <div className="p-3.5 bg-slate-50/90 backdrop-blur-xs rounded-2xl border border-slate-200/80 flex items-center gap-3 mb-5 hover:border-slate-300 transition-colors shadow-2xs">
          <img
            src={
              user?.profile_photo ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`
            }
            alt={user?.name}
            className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200/80 shrink-0 bg-white"
          />
          <div className="overflow-hidden min-w-0">
            <h3 className="text-xs font-bold text-slate-900 truncate">{user?.name}</h3>
            <p className="text-[11px] text-blue-900 font-mono font-semibold truncate bg-blue-50/80 px-1.5 py-0.2 rounded border border-blue-100/80 inline-block mt-0.5">
              {user?.student_id || 'Student'}
            </p>
            <p className="text-[10px] text-slate-500 truncate mt-0.5">{user?.department || 'Joy University'}</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-blue-50/90 text-blue-950 font-bold border border-blue-200/80 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/90 border border-transparent font-medium'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active Left Vertical Accent Line */}
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 rounded-r-full" />
                    )}
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-700'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 ml-auto shrink-0 shadow-2xs" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom section with university badge and logout */}
      <div className="pt-4 border-t border-slate-200/90 space-y-2">
        <div className="px-3.5 py-2.5 bg-slate-50/90 backdrop-blur-xs rounded-xl border border-slate-200/80 flex items-center gap-2.5 text-xs text-slate-700 shadow-2xs">
          <GraduationCap className="w-4 h-4 text-blue-900 shrink-0" />
          <div className="overflow-hidden min-w-0">
            <span className="font-bold text-[11px] block leading-tight text-slate-900 truncate">Joy Senate Member</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-slate-500">Student ID Active</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50/80 hover:text-rose-700 border border-transparent hover:border-rose-200/60 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};
