import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  ShieldAlert, 
  Sliders, 
  FileCheck2, 
  Users2,
  Building,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const AdminLogin: React.FC = () => {
  const { adminLogin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await adminLogin(email, password);
      showToast('Admin authorized. Welcome to Event Control Center.', 'success');
      navigate('/admin/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Administrative login failed.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fillSuperAdmin = () => {
    setEmail('admin@college.edu');
    setPassword('Admin@123');
    setError(null);
  };

  const fillEventAdmin = () => {
    setEmail('eventadmin@college.edu');
    setPassword('Admin@123');
    setError(null);
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
      {/* Soft Ambient Background Glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-10 overflow-hidden">
        <div className="w-[650px] h-[650px] bg-gradient-to-tr from-slate-200/40 via-blue-100/30 to-indigo-100/30 blur-3xl rounded-full" />
      </div>

      {/* Main Split Container */}
      <div className="max-w-5xl w-full bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/90 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.08),0_1px_3px_rgba(15,23,42,0.04)] overflow-hidden relative transition-all">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* ================= LEFT COLUMN: Admin Console Info ================= */}
          <div className="lg:col-span-7 p-8 sm:p-10 lg:p-12 bg-gradient-to-br from-slate-50/90 via-slate-100/40 to-blue-50/30 border-b lg:border-b-0 lg:border-r border-slate-200/80 flex flex-col justify-between relative overflow-hidden">
            {/* Watermark */}
            <div className="absolute -top-10 -right-10 w-56 h-56 opacity-[0.035] pointer-events-none">
              <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full text-slate-900">
                <polygon points="50 0, 93 25, 93 75, 50 100, 7 75, 7 25" />
              </svg>
            </div>

            <div>
              {/* Institutional Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-[11px] font-semibold tracking-wide uppercase shadow-2xs mb-6">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                Joy University • Staff & Admin Operations
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight leading-[1.2]">
                Seminar Operations &{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-700">
                  Event Control Center.
                </span>
              </h1>

              <p className="mt-3.5 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg">
                Restricted gateway for faculty administrators, seminar directors, and university evaluators to oversee registrations, issue verified credentials, and monitor live attendance.
              </p>

              {/* Operational Capabilities */}
              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/70 border border-slate-200/60 shadow-2xs hover:bg-white transition-all">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Sliders className="w-4 h-4 text-blue-300" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-slate-900">Seminar Orchestration</h2>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Schedule keynote sessions, manage venue capacities, and oversee registration approvals.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/70 border border-slate-200/60 shadow-2xs hover:bg-white transition-all">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <FileCheck2 className="w-4 h-4 text-emerald-300" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-slate-900">Cryptographic Issuance</h2>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Generate, validate, and revoke digitally signed seminar completion certificates.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/70 border border-slate-200/60 shadow-2xs hover:bg-white transition-all">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Users2 className="w-4 h-4 text-sky-300" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-slate-900">Live Attendance Audits</h2>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Real-time gate check-ins, barcode verification, and student participation metrics.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Admin Signature */}
            <div className="mt-8 pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-4 text-slate-600">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-800" />
                <span className="text-[11px] font-semibold tracking-wide text-slate-800">
                  Joy University Central Administration
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Tier 1 Console
                </span>
                <span>•</span>
                <span>Role-Based Access Control</span>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: Admin Credentials ================= */}
          <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-center bg-white/95 relative">
            <div className="mb-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white shadow-md shadow-slate-900/20 flex items-center justify-center mb-3.5 ring-4 ring-slate-100">
                <Shield className="w-6 h-6 text-blue-300" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-serif">
                Admin Console
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your administrative credentials to continue
              </p>
            </div>

            {/* Evaluator Quick Demo Accounts */}
            <div className="mb-5 space-y-2">
              <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
                Evaluator Demo Accounts:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={fillSuperAdmin}
                  className="p-2.5 bg-slate-50 hover:bg-blue-50/60 border border-slate-200/90 hover:border-blue-200 rounded-xl text-left transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-blue-900 block">Super Admin</span>
                    <KeyRound className="w-3 h-3 text-slate-400 group-hover:text-blue-600" />
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5 font-mono truncate">admin@college.edu</span>
                </button>
                <button
                  type="button"
                  onClick={fillEventAdmin}
                  className="p-2.5 bg-slate-50 hover:bg-blue-50/60 border border-slate-200/90 hover:border-blue-200 rounded-xl text-left transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-blue-900 block">Event Admin</span>
                    <KeyRound className="w-3 h-3 text-slate-400 group-hover:text-blue-600" />
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5 font-mono truncate">eventadmin@college.edu</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3.5 bg-rose-50/90 border border-rose-200/90 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 shadow-2xs animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="leading-relaxed font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 tracking-wide">
                  Staff / Admin Email
                </label>
                <div className="relative group">
                  <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600 absolute left-3.5 top-3 transition-colors" />
                  <input
                    type="email"
                    required
                    placeholder="admin@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-900 rounded-xl focus:outline-none focus:ring-4 focus:ring-slate-900/10 text-slate-900 font-medium transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 tracking-wide">
                  Admin Password
                </label>
                <div className="relative group">
                  <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600 absolute left-3.5 top-3 transition-colors" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-900 rounded-xl focus:outline-none focus:ring-4 focus:ring-slate-900/10 text-slate-900 font-medium transition-all duration-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-slate-950 hover:bg-slate-900 disabled:opacity-50 text-white font-semibold text-xs tracking-wide rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 group mt-2"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Admin Console'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            </form>

            <div className="pt-5 mt-5 border-t border-slate-100 text-center">
              <Link to="/login" className="text-xs text-slate-600 hover:text-slate-900 font-medium transition-colors">
                ← Return to Student Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

