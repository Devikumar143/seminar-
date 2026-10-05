import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  Award,
  ChevronRight,
  Flame,
  CheckCircle2,
  QrCode,
  Ticket,
  Zap
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [featuredSeminars, setFeaturedSeminars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTopicIndex, setActiveTopicIndex] = useState(0);
  const [prevTopicIndex, setPrevTopicIndex] = useState(-1);

  const EDITORIAL_TOPICS = [
    "Distinguished Academic Seminars",
    "World-Class Research Keynotes",
    "Senate-Certified Symposia",
    "Frontier Scientific Colloquia"
  ];

  const handleTopicChange = (newIndex: number) => {
    if (newIndex === activeTopicIndex) return;
    setPrevTopicIndex(activeTopicIndex);
    setActiveTopicIndex(newIndex);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTopicIndex((current) => {
        setPrevTopicIndex(current);
        return (current + 1) % EDITORIAL_TOPICS.length;
      });
    }, 4200);
    return () => clearInterval(timer);
  }, [EDITORIAL_TOPICS.length]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/seminars?limit=3&timeframe=upcoming');
        if (res.data.success) {
          setFeaturedSeminars(res.data.seminars || []);
        }
      } catch (err) {
        console.error('Failed to load featured seminars:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="space-y-16 pb-20 text-slate-900">
      {/* Hero Section - Luxury Editorial & Hexagonal Honeycomb Theme */}
      <section className="relative overflow-hidden bg-white/70 border-b border-slate-200/90 py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        {/* Hexagonal Honeycomb Grid with Radial Fade Mask */}
        <div className="absolute inset-0 bg-grid-honeycomb mask-radial-hero opacity-85 pointer-events-none" />

        {/* Ambient Soft Indigo / Sky Spotlight Glow with Slow Breathing Animation */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[380px] bg-gradient-to-tr from-blue-400/10 via-indigo-500/10 to-teal-400/5 blur-3xl pointer-events-none rounded-full animate-pulse-slow" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          {/* Refined Academic Senate Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/90 text-slate-800 text-xs font-medium shadow-2xs hover:border-slate-300 transition-all duration-300 group">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            <span className="tracking-wider uppercase text-[10.5px] font-bold text-slate-600">
              Joy University Senate
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="text-slate-800 font-medium">
              Official Academic Sessions
            </span>
            <span className="text-blue-600 text-xs font-bold group-hover:rotate-45 transition-transform duration-300">
              ✦
            </span>
          </div>

          {/* Luxury Editorial Headline with Typographic Contrast & Liquid-Smooth Morph Transition */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
            <span className="block font-sans text-slate-900 font-extrabold">
              Discover, Register & Attend
            </span>

            {/* Simultaneous Liquid Smooth Cross-Fade Container */}
            <div className="relative mt-1 sm:mt-2 min-h-[1.3em] overflow-hidden flex items-center justify-center">
              {/* Invisible Sizing Anchor preventing layout shift */}
              <span className="invisible pointer-events-none select-none font-editorial italic font-normal text-3xl sm:text-5xl lg:text-[3.4rem] tracking-tight block">
                Distinguished Academic Seminars
              </span>

              {/* Overlapping Animated Text Track */}
              {EDITORIAL_TOPICS.map((topic, idx) => {
                const isActive = activeTopicIndex === idx;
                const isPrev = prevTopicIndex === idx;

                let stateClasses = "opacity-0 translate-y-6 scale-[0.98] blur-[4px] pointer-events-none z-0";
                if (isActive) {
                  stateClasses = "opacity-100 translate-y-0 scale-100 blur-0 pointer-events-auto z-10";
                } else if (isPrev) {
                  stateClasses = "opacity-0 -translate-y-6 scale-[0.98] blur-[4px] pointer-events-none z-0";
                }

                return (
                  <span
                    key={topic}
                    className={`absolute inset-0 flex items-center justify-center text-center font-editorial italic font-normal tracking-tight text-3xl sm:text-5xl lg:text-[3.4rem] text-transparent bg-clip-text bg-gradient-to-r from-slate-950 via-slate-850 to-blue-950 transition-all duration-800 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu will-change-transform ${stateClasses}`}
                  >
                    {topic}
                  </span>
                );
              })}
            </div>
          </h1>

          {/* Subtle Rotating Indicator Pills */}
          <div className="flex items-center justify-center gap-1.5 pt-0.5">
            {EDITORIAL_TOPICS.map((topic, idx) => (
              <button
                key={topic}
                onClick={() => handleTopicChange(idx)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  activeTopicIndex === idx
                    ? 'w-8 bg-slate-900 shadow-xs'
                    : 'w-2 bg-slate-200 hover:bg-slate-300'
                }`}
                aria-label={`Switch to ${topic}`}
              />
            ))}
          </div>

          {/* Luxury Editorial Subtitle */}
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Conferring verified credentials for live keynote lectures from international researchers, digital QR entrance passes, and Senate-certified documentation.
          </p>

          {/* Elevated CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
            <Link
              to="/seminars"
              className="w-full sm:w-auto px-7 py-3.5 bg-slate-950 hover:bg-slate-900 text-white font-semibold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-slate-950/10 hover:shadow-xl hover:shadow-slate-950/20 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2.5 group border border-slate-800"
            >
              <span>Explore Upcoming Seminars</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-200" />
            </Link>

            {!isAuthenticated ? (
              <Link
                to="/register"
                className="w-full sm:w-auto px-7 py-3.5 bg-white/95 hover:bg-white text-slate-800 font-semibold text-xs uppercase tracking-wider rounded-xl border border-slate-200/90 hover:border-slate-300 transition-all duration-300 shadow-2xs hover:shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-2 backdrop-blur-md"
              >
                <span>Create Student Account</span>
              </Link>
            ) : (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-7 py-3.5 bg-white/95 hover:bg-white text-slate-800 font-semibold text-xs uppercase tracking-wider rounded-xl border border-slate-200/90 hover:border-slate-300 transition-all duration-300 shadow-2xs hover:shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-2 backdrop-blur-md"
              >
                <span>Go to My Dashboard</span>
              </Link>
            )}
          </div>

          {/* Key Metrics Strip - Scaled Low-Transparency Watermark Pattern */}
          <div className="pt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto text-left">
            {/* 100% Digital QR Check-in */}
            <div className="p-6 sm:p-7 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-2xs hover:border-blue-300 hover:shadow-lg hover:-translate-y-1.5 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group min-h-[136px] sm:min-h-[148px] flex flex-col justify-between">
              {/* Corner Status Dot */}
              <div className="absolute top-4 right-4 sm:top-5 sm:right-5 pointer-events-none">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-2xs block" />
              </div>
              {/* Low Transparency SVG Watermark */}
              <QrCode className="w-28 h-28 sm:w-36 sm:h-36 text-blue-900/[0.07] absolute -right-3 -bottom-3 -rotate-12 pointer-events-none transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 stroke-[1.3]" />
              <div className="relative z-10">
                <span className="text-2xl sm:text-3xl lg:text-[1.85rem] font-black text-slate-900 tracking-tight block whitespace-nowrap leading-none">
                  100%
                </span>
                <span className="text-xs sm:text-sm text-slate-600 font-semibold block mt-2 sm:mt-2.5">
                  Digital QR Check-in
                </span>
              </div>
            </div>

            {/* Instant PDF Entry Passes */}
            <div className="p-6 sm:p-7 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-2xs hover:border-indigo-300 hover:shadow-lg hover:-translate-y-1.5 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group min-h-[136px] sm:min-h-[148px] flex flex-col justify-between">
              {/* Corner Status Dot */}
              <div className="absolute top-4 right-4 sm:top-5 sm:right-5 pointer-events-none">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-2xs block" />
              </div>
              {/* Low Transparency SVG Watermark */}
              <Ticket className="w-28 h-28 sm:w-36 sm:h-36 text-indigo-900/[0.07] absolute -right-3 -bottom-3 -rotate-12 pointer-events-none transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 stroke-[1.3]" />
              <div className="relative z-10">
                <span className="text-2xl sm:text-3xl lg:text-[1.85rem] font-black text-slate-900 tracking-tight block whitespace-nowrap leading-none">
                  Instant
                </span>
                <span className="text-xs sm:text-sm text-slate-600 font-semibold block mt-2 sm:mt-2.5">
                  PDF Entry Passes
                </span>
              </div>
            </div>

            {/* Verifiable Senate Certificates */}
            <div className="p-6 sm:p-7 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-2xs hover:border-emerald-300 hover:shadow-lg hover:-translate-y-1.5 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group min-h-[136px] sm:min-h-[148px] flex flex-col justify-between">
              {/* Corner Status Dot */}
              <div className="absolute top-4 right-4 sm:top-5 sm:right-5 pointer-events-none">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-2xs block" />
              </div>
              {/* Low Transparency SVG Watermark */}
              <Award className="w-28 h-28 sm:w-36 sm:h-36 text-emerald-900/[0.07] absolute -right-3 -bottom-3 -rotate-12 pointer-events-none transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 stroke-[1.3]" />
              <div className="relative z-10">
                <span className="text-2xl sm:text-3xl lg:text-[1.85rem] font-black text-slate-900 tracking-tight block whitespace-nowrap leading-none">
                  Verifiable
                </span>
                <span className="text-xs sm:text-sm text-slate-600 font-semibold block mt-2 sm:mt-2.5">
                  Senate Certificates
                </span>
              </div>
            </div>

            {/* Automated Waitlist Allocation */}
            <div className="p-6 sm:p-7 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-2xs hover:border-amber-300 hover:shadow-lg hover:-translate-y-1.5 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group min-h-[136px] sm:min-h-[148px] flex flex-col justify-between">
              {/* Corner Status Dot */}
              <div className="absolute top-4 right-4 sm:top-5 sm:right-5 pointer-events-none">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-2xs block" />
              </div>
              {/* Low Transparency SVG Watermark */}
              <Zap className="w-28 h-28 sm:w-36 sm:h-36 text-amber-600/[0.08] absolute -right-3 -bottom-3 -rotate-12 pointer-events-none transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 stroke-[1.3]" />
              <div className="relative z-10">
                <span className="text-2xl sm:text-3xl lg:text-[1.85rem] font-black text-slate-900 tracking-tight block whitespace-nowrap leading-none">
                  Automated
                </span>
                <span className="text-xs sm:text-sm text-slate-600 font-semibold block mt-2 sm:mt-2.5">
                  Waitlist Allocation
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Seminars Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-slate-700" />
              <span>Spotlight Sessions</span>
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
              Featured Upcoming Seminars
            </h2>
          </div>
          <Link
            to="/seminars"
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1 group"
          >
            <span>View All Seminars</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs animate-pulse space-y-4">
                <div className="h-44 bg-slate-100 rounded-lg" />
                <div className="h-4 bg-slate-100 rounded w-1/3" />
                <div className="h-6 bg-slate-100 rounded w-3/4" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredSeminars.map((sem) => {
              const capacityPct = Math.min(100, Math.round(((sem.registered_count || 0) / (sem.capacity || 1)) * 100));
              return (
                <div
                  key={sem.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col group"
                >
                  {/* Banner Image */}
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img
                      src={sem.banner_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800'}
                      alt={sem.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 text-[11px] font-semibold bg-white/95 text-slate-800 border border-slate-200 rounded-md shadow-xs">
                        {sem.category}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className={`px-2.5 py-1 text-[10px] font-semibold rounded-md shadow-xs border ${
                        sem.remaining_seats > 0
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {sem.remaining_seats > 0 ? `${sem.remaining_seats} Seats Left` : 'Waitlist Only'}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-slate-700 transition-colors line-clamp-2 leading-snug">
                        {sem.title}
                      </h3>

                      <div className="mt-3 flex items-center gap-3">
                        <img
                          src={sem.speaker_image || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(sem.speaker)}`}
                          alt={sem.speaker}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div className="overflow-hidden">
                          <span className="text-xs font-semibold text-slate-900 block truncate">{sem.speaker}</span>
                          <span className="text-[11px] text-slate-500 block truncate">{sem.speaker_designation}</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar of booked seats */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>Registration Capacity</span>
                        <span className="font-mono text-slate-700">{capacityPct}% Full</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${capacityPct}%` }}
                          className={`h-full rounded-full ${
                            capacityPct >= 100 ? 'bg-amber-500' : 'bg-slate-900'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{new Date(sem.date).toLocaleDateString()}</span>
                        <span className="text-slate-300">•</span>
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{sem.start_time.slice(0, 5)}</span>
                      </div>
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{sem.venue}</span>
                      </div>
                    </div>

                    <Link
                      to={`/seminars/${sem.id}`}
                      className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 text-center mt-2 shadow-xs"
                    >
                      <span>View Seminar Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* How It Works Process */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Operational Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
            How The Seminar Portal Operates
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1.5">
            Seamless registration, paperless check-in, and instant verified credentials.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 border border-slate-200 font-bold flex items-center justify-center text-sm mb-3">
              01
            </div>
            <h3 className="font-bold text-sm text-slate-900">Discover Seminars</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Filter by engineering disciplines, cutting-edge topics, keynote speakers, and schedules.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 border border-slate-200 font-bold flex items-center justify-center text-sm mb-3">
              02
            </div>
            <h3 className="font-bold text-sm text-slate-900">Instant QR Pass</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Confirm your seat and receive a cryptographic digital pass with downloadable PDF format.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 border border-slate-200 font-bold flex items-center justify-center text-sm mb-3">
              03
            </div>
            <h3 className="font-bold text-sm text-slate-900">Scan at Venue</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Present your QR barcode at the lecture hall entrance. Venue staff verifies check-in in under 2 seconds.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 border border-slate-200 font-bold flex items-center justify-center text-sm mb-3">
              04
            </div>
            <h3 className="font-bold text-sm text-slate-900">Earn Certificate</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Once marked present, access your official Certificate of Participation with verifiable QR code.
            </p>
          </div>
        </div>
      </section>

      {/* Certificate Showcase Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-2xl p-8 sm:p-10 text-white border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="max-w-xl space-y-3.5 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Verifiable Academic Credentials</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Earn Industry Recognized Participation Certificates
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Every certificate issued through the Joy University portal contains a tamper-proof cryptographic verification code and public registry URL for employers and graduate institutions.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                to="/verify-certificate/demo"
                className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs rounded-xl shadow-xs transition-colors"
              >
                Launch Verification Portal
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
