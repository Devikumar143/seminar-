import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { AdminSidebar } from '../components/AdminSidebar';
import { SlideOutSidebar } from '../components/SlideOutSidebar';
import { ExternalLink, ShieldCheck, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageTransition } from '../components/PageTransition';

export const AdminLayout: React.FC = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-y-auto h-screen">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 bg-white px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 md:hidden text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
              title="Open Navigation Menu"
              aria-label="Toggle Navigation Menu"
            >
              <Menu className="w-5 h-5 text-slate-800" />
            </button>
            <ShieldCheck className="w-5 h-5 text-slate-900 shrink-0" />
            <span className="font-bold text-xs sm:text-sm tracking-wide text-slate-900 uppercase truncate">
              Joy University Administrative Console
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/seminars"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-200"
            >
              <span>Public Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span className="text-xs text-slate-700 font-medium">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 lg:p-8 min-w-0 bg-slate-50 relative flex flex-col">
          <div className="absolute top-0 left-0 right-0 h-[450px] bg-grid-honeycomb mask-radial-top opacity-55 pointer-events-none" />
          <div className="relative z-10 flex-1 flex flex-col">
            <PageTransition>
              <Outlet />
            </PageTransition>
          </div>
        </main>
      </div>

      <SlideOutSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </div>
  );
};
