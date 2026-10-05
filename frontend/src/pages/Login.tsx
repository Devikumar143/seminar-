import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  Shield, 
  BookOpen,
  CalendarCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Animated rotating tagline phrases
  const TAGLINE_PHRASES = [
    "scholarly excellence.",
    "intellectual discovery.",
    "frontier research.",
    "verified academic leadership."
  ];

  const [activePhraseIndex, setActivePhraseIndex] = useState(0);
  const [prevPhraseIndex, setPrevPhraseIndex] = useState(-1);

  useEffect(() => {
    const timer = setInterval(() => {
      setActivePhraseIndex((current) => {
        setPrevPhraseIndex(current);
        return (current + 1) % TAGLINE_PHRASES.length;
      });
    }, 3800);
    return () => clearInterval(timer);
  }, [TAGLINE_PHRASES.length]);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      showToast('Welcome back! Login successful.', 'success');
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoStudent = () => {
    setEmail('rahul.sharma@college.edu');
    setPassword('Student@123');
    setError(null);
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 sm:p-6 lg:p-10 relative">
      {/* Soft Ambient Background Lighting */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-10 overflow-hidden">
        <div className="w-[600px] h-[600px] bg-gradient-to-tr from-blue-200/30 via-indigo-100/20 to-sky-100/30 blur-3xl rounded-full" />
      </div>

      {/* Responsive Two-Column Layout */}
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
        
        {/* ================= LEFT: Tagline & University Information ================= */}
        <div className="lg:col-span-7 space-y-6 lg:pr-6 text-left">
          {/* Institutional Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/90 text-blue-950 text-xs font-semibold tracking-wide uppercase shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            Joy University Senate • Official Seminar Portal
          </div>

          {/* Animated Primary Tagline / Headline */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-900 tracking-tight leading-[1.2]">
              <span className="block text-slate-900">Where curiosity meets</span>
              <div className="relative h-[1.3em] overflow-hidden mt-1">
                {TAGLINE_PHRASES.map((phrase, idx) => {
                  const isActive = activePhraseIndex === idx;
                  const isPrev = prevPhraseIndex === idx;

                  let stateClasses = "opacity-0 translate-y-7 scale-[0.98] blur-[3px] pointer-events-none";
                  if (isActive) {
                    stateClasses = "opacity-100 translate-y-0 scale-100 blur-0 pointer-events-auto";
                  } else if (isPrev) {
                    stateClasses = "opacity-0 -translate-y-7 scale-[0.98] blur-[3px] pointer-events-none";
                  }

                  return (
                    <span
                      key={phrase}
                      className={`absolute left-0 top-0 text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-600 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu will-change-transform ${stateClasses}`}
                    >
                      {phrase}
                    </span>
                  );
                })}
              </div>
            </h1>

            {/* Rotating Indicator Pills */}
            <div className="flex items-center gap-1.5 pt-1">
              {TAGLINE_PHRASES.map((phrase, idx) => (
                <button
                  key={phrase}
                  onClick={() => {
                    setPrevPhraseIndex(activePhraseIndex);
                    setActivePhraseIndex(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    activePhraseIndex === idx
                      ? 'w-7 bg-blue-600 shadow-2xs'
                      : 'w-2 bg-slate-200 hover:bg-slate-300'
                  }`}
                  aria-label={`Select phrase ${idx + 1}`}
                />
              ))}
            </div>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl pt-1">
              Access university-sanctioned research conferences, departmental colloquiums, and distinguished guest lectures. Secure your accredited pass and tamper-proof digital certificates.
            </p>
          </div>

          {/* Three Key Value Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
            <div className="p-3.5 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-2xs hover:bg-white hover:border-blue-200 hover:shadow-xs transition-all">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-2.5">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">Curated Seminars</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Sessions led by distinguished faculty & industry leaders.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-2xs hover:bg-white hover:border-indigo-200 hover:shadow-xs transition-all">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-2.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">Verified Passes</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Cryptographically signed certificates with instant QR check.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-2xs hover:bg-white hover:border-emerald-200 hover:shadow-xs transition-all">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2.5">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">Live Credit Sync</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Automated attendance sync with academic registry.
              </p>
            </div>
          </div>

          {/* Social Proof / Trust Footnote */}
          <div className="pt-2 flex items-center gap-3 text-xs text-slate-500 font-medium">
            <div className="flex -space-x-2 overflow-hidden">
              <span className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-blue-600 text-[10px] text-white font-bold flex items-center justify-center">JU</span>
              <span className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-indigo-600 text-[10px] text-white font-bold flex items-center justify-center">CS</span>
              <span className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-800 text-[10px] text-white font-bold flex items-center justify-center">AI</span>
            </div>
            <span>Trusted by 2,400+ students & faculty across Joy University campus</span>
          </div>
        </div>

        {/* ================= RIGHT: Standalone Separate Login Box ================= */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="max-w-[440px] w-full bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/90 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.09),0_1px_3px_rgba(15,23,42,0.04)] overflow-hidden relative transition-all">
            {/* Header (Clean, icon-free) */}
            <div className="pt-8 pb-5 px-8 text-center relative border-b border-slate-100">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-serif">
                Student Portal Login
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your institutional college credentials
              </p>
            </div>

            {/* Form Body */}
            <div className="p-7 sm:p-8 space-y-4">
              {/* Quick Demo Fill Pill */}
              <div className="p-3 bg-gradient-to-r from-slate-50 to-blue-50/50 border border-slate-200/90 rounded-2xl flex items-center justify-between shadow-2xs transition-all hover:border-blue-200 group">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left">
                    <span className="font-semibold text-slate-900 text-xs block leading-tight">
                      Quick Demo Student
                    </span>
                    <span className="text-slate-500 text-[11px]">Rahul Sharma</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={fillDemoStudent}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1"
                >
                  <span>Auto-Fill</span>
                </button>
              </div>

              {error && (
                <div className="p-3.5 bg-rose-50/90 border border-rose-200/90 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 shadow-2xs animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span className="leading-relaxed font-medium">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 tracking-wide">
                    College Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600 absolute left-3.5 top-3 transition-colors" />
                    <input
                      type="email"
                      required
                      placeholder="student@college.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-900 placeholder:text-slate-400 font-medium transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700 tracking-wide">
                      Password
                    </label>
                    <span className="text-[11px] text-slate-400">Min 6 characters</span>
                  </div>
                  <div className="relative group">
                    <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600 absolute left-3.5 top-3 transition-colors" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-900 placeholder:text-slate-400 font-medium transition-all duration-200"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-slate-950 hover:bg-slate-900 disabled:opacity-50 text-white font-semibold text-xs tracking-wide rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 group mt-2"
                >
                  <span>{loading ? 'Authenticating...' : 'Sign In to Student Account'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </button>
              </form>

              {/* Links */}
              <div className="pt-4 border-t border-slate-100 text-center space-y-2">
                <p className="text-xs text-slate-600">
                  Don't have an account?{' '}
                  <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                    Register as Student
                  </Link>
                </p>
                <div className="pt-0.5">
                  <Link
                    to="/admin/login"
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5 text-slate-400" />
                    <span>Administrator or Faculty Console →</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};




