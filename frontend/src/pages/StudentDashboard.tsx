import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Ticket,
  ClipboardCheck,
  Award,
  ArrowRight,
  QrCode,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PassModal } from '../components/PassModal';
import { CertificateModal } from '../components/CertificateModal';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [selectedPass, setSelectedPass] = useState<any>(null);
  const [passModalOpen, setPassModalOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState<any>(null);
  const [certModalOpen, setCertModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [regRes, attRes, certRes] = await Promise.all([
        api.get('/registrations/my'),
        api.get('/attendance/my'),
        api.get('/certificates/my'),
      ]);

      if (regRes.data.success) setRegistrations(regRes.data.registrations || []);
      if (attRes.data.success) setAttendance(attRes.data.attendance || []);
      if (certRes.data.success) setCertificates(certRes.data.certificates || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const upcomingRegistrations = registrations.filter(
    (r) => new Date(r.date) >= new Date() && r.registration_status === 'confirmed'
  );

  const presentCount = attendance.filter((a) => a.attendance_status === 'present').length;

  return (
    <div className="space-y-6 text-slate-900">
      {/* Modern Frosted Glass Welcome Banner */}
      <div className="bg-white/95 backdrop-blur-md text-slate-900 p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all relative overflow-hidden group">
        {/* Subtle Honeycomb Pattern */}
        <div className="absolute inset-0 bg-grid-honeycomb mask-radial-hero opacity-35 pointer-events-none" />

        {/* Ambient Top-Right Sky Spotlight */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-gradient-to-bl from-blue-400/10 via-indigo-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

        {/* Low-Transparency Academic Watermark */}
        <GraduationCap className="w-36 h-36 text-slate-900/[0.04] absolute -right-4 -bottom-4 -rotate-12 pointer-events-none transition-transform duration-300 group-hover:scale-105 stroke-[1.2]" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100/90 border border-slate-200/80 text-slate-700 text-xs font-medium mb-1 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-2xs" />
              <span className="text-[11px] font-bold tracking-wider uppercase text-slate-600">
                Joy University Student Console
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="text-[11px] font-medium text-slate-600">
                Academic Portal
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome back, {user?.name}!
            </h1>

            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs sm:text-sm text-slate-600 font-medium pt-0.5">
              <span className="text-slate-800 font-semibold">
                Department of {user?.department || 'Computer Science'}
              </span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/80 text-xs font-semibold">
                ID: {user?.student_id || 'Student'}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-medium">
                {user?.year || 'Active Scholar'}
              </span>
            </div>
          </div>

          <Link
            to="/seminars"
            className="self-start sm:self-auto px-5 py-3 bg-slate-950 hover:bg-slate-900 text-white font-semibold text-xs uppercase tracking-wider rounded-xl shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 group border border-slate-800 shrink-0 cursor-pointer"
          >
            <span>Discover Seminars</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-200" />
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards - Low-Transparency Watermark Pattern */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Registrations */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs relative overflow-hidden group hover:border-blue-300 hover:shadow-xs transition-all">
          {/* Low Transparency SVG Watermark */}
          <div className="absolute -right-3 -bottom-3 pointer-events-none transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
            <Ticket className="w-24 h-24 text-blue-900/[0.07] -rotate-12 stroke-[1.2]" />
          </div>

          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Registrations
              </span>
              <span className="w-2 h-2 rounded-full bg-blue-500" />
            </div>
            <div className="mt-2.5">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight block">
                {registrations.length}
              </span>
              <span className="text-[11px] text-slate-600 font-medium block mt-0.5">
                Active Passes
              </span>
            </div>
          </div>
        </div>

        {/* Upcoming Seminars */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs relative overflow-hidden group hover:border-emerald-300 hover:shadow-xs transition-all">
          {/* Low Transparency SVG Watermark */}
          <div className="absolute -right-3 -bottom-3 pointer-events-none transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
            <Calendar className="w-24 h-24 text-emerald-900/[0.07] -rotate-12 stroke-[1.2]" />
          </div>

          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Upcoming
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div className="mt-2.5">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight block">
                {upcomingRegistrations.length}
              </span>
              <span className="text-[11px] text-slate-600 font-medium block mt-0.5">
                To Attend
              </span>
            </div>
          </div>
        </div>

        {/* Verified Attendance */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs relative overflow-hidden group hover:border-indigo-300 hover:shadow-xs transition-all">
          {/* Low Transparency SVG Watermark */}
          <div className="absolute -right-3 -bottom-3 pointer-events-none transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
            <ClipboardCheck className="w-24 h-24 text-indigo-900/[0.07] -rotate-12 stroke-[1.2]" />
          </div>

          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Attendance
              </span>
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
            </div>
            <div className="mt-2.5">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight block">
                {presentCount}
              </span>
              <span className="text-[11px] text-slate-600 font-medium block mt-0.5">
                Present Verified
              </span>
            </div>
          </div>
        </div>

        {/* Certificates Earned */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs relative overflow-hidden group hover:border-amber-300 hover:shadow-xs transition-all">
          {/* Low Transparency SVG Watermark */}
          <div className="absolute -right-3 -bottom-3 pointer-events-none transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
            <Award className="w-24 h-24 text-amber-900/[0.07] -rotate-12 stroke-[1.2]" />
          </div>

          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Certificates
              </span>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            </div>
            <div className="mt-2.5">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight block">
                {certificates.length}
              </span>
              <span className="text-[11px] text-slate-600 font-medium block mt-0.5">
                Awarded Credentials
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Upcoming Seminar Passes */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Ticket className="w-4 h-4 text-slate-700" />
              <span>Upcoming Seminar Passes</span>
            </h2>
            <Link to="/my-registrations" className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors">
              View All ({registrations.length})
            </Link>
          </div>

          {upcomingRegistrations.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <p className="text-xs font-medium text-slate-500">You have no upcoming registered seminars.</p>
              <Link to="/seminars" className="text-xs font-semibold text-slate-900 inline-block hover:underline">
                Browse Seminars →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingRegistrations.slice(0, 3).map((reg) => (
                <div
                  key={reg.id}
                  className="p-4 bg-slate-50 hover:bg-slate-100/70 rounded-xl border border-slate-200 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 overflow-hidden">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{reg.seminar_title}</h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>{new Date(reg.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{reg.start_time.slice(0, 5)}</span>
                      <span>•</span>
                      <span className="truncate">{reg.venue}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedPass({
                        ...reg,
                        student_name: user?.name,
                        student_id: user?.student_id,
                        department: user?.department,
                        year: user?.year,
                      });
                      setPassModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-xs shrink-0 flex items-center gap-1.5 transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>View Pass</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Certificates Earned */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Award className="w-4 h-4 text-slate-700" />
              <span>Earned Certificates</span>
            </h2>
            <Link to="/certificates" className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors">
              View All ({certificates.length})
            </Link>
          </div>

          {certificates.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <p className="text-xs font-medium text-slate-500">
                Attend verified seminars to receive official academic participation certificates.
              </p>
              <Link to="/seminars" className="text-xs font-semibold text-slate-900 inline-block hover:underline">
                Explore Available Events →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {certificates.slice(0, 3).map((cert) => (
                <div
                  key={cert.id}
                  className="p-4 bg-slate-50 hover:bg-slate-100/70 rounded-xl border border-slate-200 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 overflow-hidden">
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                      Certificate Issued
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 truncate">{cert.seminar_title}</h4>
                    <span className="text-[11px] text-slate-500 font-mono block">
                      ID: {cert.certificate_id}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedCert(cert);
                      setCertModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-xs shrink-0 flex items-center gap-1.5 transition-colors"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <PassModal
        isOpen={passModalOpen}
        onClose={() => setPassModalOpen(false)}
        registration={selectedPass}
      />

      <CertificateModal
        isOpen={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        certificate={selectedCert}
      />
    </div>
  );
};
