import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Hash, 
  Building2, 
  Calendar, 
  Lock, 
  ArrowRight, 
  AlertCircle,
  BookOpen,
  ShieldCheck,
  CalendarCheck,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    student_id: '',
    email: '',
    phone: '',
    department: 'Computer Science',
    year: '3rd Year',
    password: '',
    confirm_password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const departments = [
    'Computer Science',
    'Information Technology',
    'Data Science & AI',
    'Software Engineering',
    'Electronics & Comm.',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Biotechnology',
    'Management Studies',
  ];

  const years = [
    '1st Year',
    '2nd Year',
    '3rd Year',
    '4th Year',
    'Post-Graduate / M.Tech',
    'Doctoral / Ph.D.',
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Frontend validations
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      showToast('Registration successful! Welcome to the seminar portal.', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Registration failed. Please check your details.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 sm:p-6 lg:p-10 relative">
      {/* Soft Ambient Background Glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-10 overflow-hidden">
        <div className="w-[600px] h-[600px] bg-gradient-to-tr from-blue-200/30 via-indigo-100/20 to-sky-100/30 blur-3xl rounded-full" />
      </div>

      {/* Responsive Two-Column Layout */}
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
        
        {/* ================= LEFT: Tagline & University Enrollment Info ================= */}
        <div className="lg:col-span-5 space-y-6 lg:pr-4 text-left">
          {/* Institutional Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/90 text-blue-950 text-xs font-semibold tracking-wide uppercase shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            Joy University Senate • Student Enrollment
          </div>

          {/* Static Primary Tagline */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-900 tracking-tight leading-[1.2]">
              Begin your journey into{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-600">
                scholarly excellence.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl pt-1">
              Join the official Joy University academic network. Access accredited seminars, track research credits, and receive tamper-proof digital passes recognized by the University Senate.
            </p>
          </div>

          {/* Three Key Enrollment Highlights */}
          <div className="space-y-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-2xs hover:bg-white hover:border-blue-200 transition-all flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Priority Seminar Access</h3>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Immediate seat reservations for all faculty keynotes and symposiums.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-2xs hover:bg-white hover:border-indigo-200 transition-all flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Digital Certificate Vault</h3>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Tamper-proof verifiable credentials automatically synced to your student profile.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-2xs hover:bg-white hover:border-emerald-200 transition-all flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Live Credit Sync</h3>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Automated attendance tracking for semester compliance and credit audits.
                </p>
              </div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="pt-2 flex items-center gap-3 text-xs text-slate-500 font-medium">
            <div className="flex -space-x-2 overflow-hidden">
              <span className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-blue-600 text-[10px] text-white font-bold flex items-center justify-center">JU</span>
              <span className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-indigo-600 text-[10px] text-white font-bold flex items-center justify-center">CS</span>
              <span className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-800 text-[10px] text-white font-bold flex items-center justify-center">AI</span>
            </div>
            <span>Trusted by 2,400+ students & faculty across Joy University campus</span>
          </div>
        </div>

        {/* ================= RIGHT: Standalone Separate Registration Box ================= */}
        <div className="lg:col-span-7 flex justify-center lg:justify-end">
          <div className="w-full max-w-xl bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/90 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.09),0_1px_3px_rgba(15,23,42,0.04)] overflow-hidden text-slate-900 relative transition-all">
            {/* Header (Clean, icon-free) */}
            <div className="pt-7 pb-5 px-7 sm:px-8 text-center border-b border-slate-100 relative">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-serif">
                Create Student Account
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                Register with your institutional details to participate in university academic seminars
              </p>
            </div>

            {/* Form Body */}
            <div className="p-6 sm:p-8 space-y-4">
              {error && (
                <div className="p-3.5 bg-rose-50/90 border border-rose-200/90 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 shadow-2xs animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span className="leading-relaxed font-medium">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 tracking-wide">
                      Full Name <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative group">
                      <User className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600 absolute left-3.5 top-3 transition-colors" />
                      <input
                        type="text"
                        required
                        name="name"
                        placeholder="e.g. Rahul Sharma"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-900 placeholder:text-slate-400 font-medium transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Student ID / Roll Number */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 tracking-wide">
                      Student ID / Roll Number <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative group">
                      <Hash className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600 absolute left-3.5 top-3 transition-colors" />
                      <input
                        type="text"
                        required
                        name="student_id"
                        placeholder="e.g. CS2024-0150"
                        value={formData.student_id}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-900 placeholder:text-slate-400 font-medium uppercase font-mono transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* College Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 tracking-wide">
                      College Email <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative group">
                      <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600 absolute left-3.5 top-3 transition-colors" />
                      <input
                        type="email"
                        required
                        name="email"
                        placeholder="student@college.edu"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-900 placeholder:text-slate-400 font-medium transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 tracking-wide">
                      Phone Number
                    </label>
                    <div className="relative group">
                      <Phone className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600 absolute left-3.5 top-3 transition-colors" />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-900 placeholder:text-slate-400 font-medium transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 tracking-wide">
                      Department
                    </label>
                    <div className="relative group">
                      <Building2 className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600 absolute left-3.5 top-3 transition-colors" />
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-800 font-medium transition-all duration-200"
                      >
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Year / Semester */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 tracking-wide">
                      Academic Year
                    </label>
                    <div className="relative group">
                      <Calendar className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600 absolute left-3.5 top-3 transition-colors" />
                      <select
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-800 font-medium transition-all duration-200"
                      >
                        {years.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 tracking-wide">
                      Password <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative group">
                      <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600 absolute left-3.5 top-3 transition-colors" />
                      <input
                        type="password"
                        required
                        name="password"
                        placeholder="Min 6 characters"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-900 placeholder:text-slate-400 font-medium transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 tracking-wide">
                      Confirm Password <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative group">
                      <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600 absolute left-3.5 top-3 transition-colors" />
                      <input
                        type="password"
                        required
                        name="confirm_password"
                        placeholder="Re-enter password"
                        value={formData.confirm_password}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-900 placeholder:text-slate-400 font-medium transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-slate-950 hover:bg-slate-900 disabled:opacity-50 text-white font-semibold text-xs tracking-wide rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 group mt-4"
                >
                  <span>{loading ? 'Registering Account...' : 'Complete Student Registration'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </button>
              </form>

              <div className="pt-4 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-600">
                  Already registered?{' '}
                  <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                    Sign in to your account
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};


