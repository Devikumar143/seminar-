import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Users,
  UserCheck,
  Award,
  Armchair,
  QrCode,
  PlusCircle,
  Calendar,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { QRScannerModal } from '../../components/QRScannerModal';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>({
    total_seminars: 0,
    upcoming_seminars: 0,
    total_registrations: 0,
    total_attendees: 0,
    certificates_issued: 0,
    available_seats: 0,
  });
  const [recentRegistrations, setRecentRegistrations] = useState<any[]>([]);
  const [recentCheckins, setRecentCheckins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scannerOpen, setScannerOpen] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/dashboard');
      if (res.data.success) {
        setStats(res.data.stats || {});
        setRecentRegistrations(res.data.recent_registrations || []);
        setRecentCheckins(res.data.recent_checkins || []);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-900">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
            <span>Event Management Center</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-0.5">
            Executive Operations Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as <strong className="text-slate-800 font-semibold">{user?.name}</strong> ({user?.role?.replace('_', ' ')})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setScannerOpen(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            <span>Launch QR Scanner</span>
          </button>

          <Link
            to="/admin/seminars/create"
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Seminar</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid - Low Transparency Watermark Pattern */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Total Seminars */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs relative overflow-hidden group hover:border-blue-300 hover:shadow-xs transition-all flex flex-col justify-between">
          <CalendarDays className="w-16 h-16 text-blue-900/[0.06] absolute -right-2 -bottom-2 -rotate-12 pointer-events-none transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" />
          <div className="relative z-10 flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Seminars</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          </div>
          <div className="mt-3 relative z-10">
            <span className="text-2xl font-bold text-slate-900 block">{stats.total_seminars}</span>
            <span className="text-[10px] text-slate-500 font-medium">Curated Sessions</span>
          </div>
        </div>

        {/* Upcoming Seminars */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs relative overflow-hidden group hover:border-emerald-300 hover:shadow-xs transition-all flex flex-col justify-between">
          <Calendar className="w-16 h-16 text-emerald-900/[0.06] absolute -right-2 -bottom-2 -rotate-12 pointer-events-none transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" />
          <div className="relative z-10 flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Upcoming</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>
          <div className="mt-3 relative z-10">
            <span className="text-2xl font-bold text-slate-900 block">{stats.upcoming_seminars}</span>
            <span className="text-[10px] text-slate-500 font-medium">Open for Entry</span>
          </div>
        </div>

        {/* Total Registrations */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs relative overflow-hidden group hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col justify-between">
          <UserCheck className="w-16 h-16 text-indigo-900/[0.06] absolute -right-2 -bottom-2 -rotate-12 pointer-events-none transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" />
          <div className="relative z-10 flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Registrations</span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          </div>
          <div className="mt-3 relative z-10">
            <span className="text-2xl font-bold text-slate-900 block">{stats.total_registrations}</span>
            <span className="text-[10px] text-slate-500 font-medium">Confirmed Passes</span>
          </div>
        </div>

        {/* Total Attendees */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs relative overflow-hidden group hover:border-emerald-300 hover:shadow-xs transition-all flex flex-col justify-between">
          <Users className="w-16 h-16 text-emerald-900/[0.06] absolute -right-2 -bottom-2 -rotate-12 pointer-events-none transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" />
          <div className="relative z-10 flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Attendees</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>
          <div className="mt-3 relative z-10">
            <span className="text-2xl font-bold text-emerald-700 block">{stats.total_attendees}</span>
            <span className="text-[10px] text-emerald-700 font-medium">Verified Checked In</span>
          </div>
        </div>

        {/* Certificates Issued */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs relative overflow-hidden group hover:border-amber-300 hover:shadow-xs transition-all flex flex-col justify-between">
          <Award className="w-16 h-16 text-amber-900/[0.06] absolute -right-2 -bottom-2 -rotate-12 pointer-events-none transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" />
          <div className="relative z-10 flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Certificates</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          </div>
          <div className="mt-3 relative z-10">
            <span className="text-2xl font-bold text-slate-900 block">{stats.certificates_issued}</span>
            <span className="text-[10px] text-slate-500 font-medium">Issued Registry</span>
          </div>
        </div>

        {/* Available Seats */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs relative overflow-hidden group hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between">
          <Armchair className="w-16 h-16 text-slate-900/[0.06] absolute -right-2 -bottom-2 -rotate-12 pointer-events-none transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" />
          <div className="relative z-10 flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Open Seats</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          </div>
          <div className="mt-3 relative z-10">
            <span className="text-2xl font-bold text-slate-900 block">{stats.available_seats}</span>
            <span className="text-[10px] text-slate-500 font-medium">Across Seminars</span>
          </div>
        </div>
      </div>

      {/* Tables: Recent Registrations & Check-ins */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-slate-700" />
              <span>Recent Registrations</span>
            </h2>
            <Link to="/admin/registrations" className="text-xs text-slate-600 hover:text-slate-900 font-medium">
              View All
            </Link>
          </div>

          {recentRegistrations.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No registrations recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {recentRegistrations.map((r) => (
                <div
                  key={r.id}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div className="overflow-hidden space-y-0.5">
                    <span className="font-semibold text-slate-900 block truncate">{r.student_name}</span>
                    <span className="text-[11px] text-slate-500 block truncate">{r.seminar_title}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-[10px] text-slate-700 font-semibold block">
                      {r.registration_id}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(r.registered_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Attendance Scans */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Recent Live Check-ins</span>
            </h2>
            <Link to="/admin/attendance" className="text-xs text-slate-600 hover:text-slate-900 font-medium">
              View Log
            </Link>
          </div>

          {recentCheckins.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No check-in scans recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {recentCheckins.map((c) => (
                <div
                  key={c.id}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div className="overflow-hidden space-y-0.5">
                    <span className="font-semibold text-slate-900 block truncate">{c.student_name}</span>
                    <span className="text-[11px] text-slate-500 block truncate">{c.seminar_title}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
                      Present
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                      {new Date(c.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={scannerOpen}
        onClose={() => {
          setScannerOpen(false);
          fetchDashboard();
        }}
        onAttendanceMarked={fetchDashboard}
      />
    </div>
  );
};
