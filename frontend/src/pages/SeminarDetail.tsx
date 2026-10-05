import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  CheckCircle2,
  Hourglass,
  ArrowLeft,
  QrCode,
  Building,
  HelpCircle
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PassModal } from '../components/PassModal';

export const SeminarDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [seminar, setSeminar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [passModalOpen, setPassModalOpen] = useState(false);
  const [passData, setPassData] = useState<any>(null);

  useEffect(() => {
    fetchSeminar();
  }, [id]);

  const fetchSeminar = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/seminars/${id}`);
      if (res.data.success) {
        setSeminar(res.data.seminar);
      }
    } catch (err: any) {
      console.error('Failed to load seminar details:', err);
      showToast(err.response?.data?.message || 'Seminar not found.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = () => {
    if (!isAuthenticated) {
      showToast('Please log in with your student credentials to register.', 'info');
      navigate('/login', { state: { from: { pathname: `/seminars/${id}` } } });
      return;
    }
    setConfirmModalOpen(true);
  };

  const handleConfirmRegistration = async () => {
    try {
      setRegistering(true);
      const res = await api.post('/registrations', { seminar_id: seminar.id });

      if (res.data.success) {
        if (res.data.waitlisted) {
          showToast(res.data.message, 'warning');
        } else {
          // Trigger celebratory confetti
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });

          showToast('Registration Confirmed! Your QR pass has been generated.', 'success');
          setPassData(res.data.registration);
          setPassModalOpen(true);
        }

        setConfirmModalOpen(false);
        fetchSeminar(); // refresh state
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed.';
      showToast(msg, 'error');
    } finally {
      setRegistering(false);
    }
  };

  const handleViewPass = () => {
    if (seminar?.user_registration_id) {
      setPassData({
        registration_id: seminar.user_registration_id,
        seminar_title: seminar.title,
        speaker: seminar.speaker,
        date: seminar.date,
        start_time: seminar.start_time,
        end_time: seminar.end_time,
        venue: seminar.venue,
        student_name: user?.name,
        student_id: user?.student_id,
        department: user?.department,
        year: user?.year,
        qr_code_token: seminar.user_qr_token,
      });
      setPassModalOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-6 bg-slate-200 rounded-lg w-1/4" />
        <div className="h-72 bg-slate-200 rounded-2xl border border-slate-300" />
        <div className="h-10 bg-slate-200 rounded-lg w-3/4" />
        <div className="h-40 bg-slate-200 rounded-xl border border-slate-300" />
      </div>
    );
  }

  if (!seminar) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Seminar not found</h2>
        <Link to="/seminars" className="text-slate-700 hover:text-slate-900 font-semibold text-xs inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Return to seminar discovery
        </Link>
      </div>
    );
  }

  const isRegistered = seminar.user_registration_status === 'confirmed';
  const isWaitlisted = seminar.user_waitlist_status === 'waiting';
  const isFull = seminar.remaining_seats <= 0;
  const isPastDeadline = new Date() > new Date(seminar.registration_deadline);
  const isCompleted = seminar.status === 'completed';
  const isClosed = seminar.status === 'closed' || seminar.status === 'cancelled';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-slate-900">
      {/* Back Link */}
      <Link
        to="/seminars"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Seminars</span>
      </Link>

      {/* Main Banner Header */}
      <div className="relative rounded-2xl overflow-hidden shadow-xs border border-slate-200 bg-slate-900 aspect-[21/8] min-h-[260px] flex flex-col justify-end p-6 sm:p-8 text-white">
        <img
          src={seminar.banner_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200'}
          alt={seminar.title}
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-slate-900/60" />

        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 text-xs font-semibold bg-white text-slate-900 rounded-md">
              {seminar.category}
            </span>
            <span className={`px-3 py-1 text-xs font-semibold rounded-md border ${
              isCompleted
                ? 'bg-slate-800 border-slate-700 text-slate-300'
                : isFull
                ? 'bg-amber-900/80 border-amber-600 text-amber-200'
                : 'bg-emerald-900/80 border-emerald-600 text-emerald-200'
            }`}>
              {isCompleted ? 'Completed Event' : isFull ? 'Capacity Full (Waitlist)' : `${seminar.remaining_seats} Seats Remaining`}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight text-white">
            {seminar.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-200 pt-1">
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <Calendar className="w-3.5 h-3.5 text-slate-300" />
              <span>{new Date(seminar.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <Clock className="w-3.5 h-3.5 text-slate-300" />
              <span>{seminar.start_time.slice(0, 5)} - {seminar.end_time.slice(0, 5)}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <MapPin className="w-3.5 h-3.5 text-slate-300" />
              <span>{seminar.venue}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Details on Left, Registration Card on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detailed Description */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-slate-700" />
              About This Seminar
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {seminar.description}
            </p>
          </div>

          {/* Keynote Speaker Section */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Keynote Speaker Profile</h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <img
                src={seminar.speaker_image || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seminar.speaker)}`}
                alt={seminar.speaker}
                className="w-14 h-14 rounded-xl object-cover border border-slate-300 shrink-0"
              />
              <div>
                <h3 className="text-sm font-bold text-slate-900">{seminar.speaker}</h3>
                <p className="text-xs font-medium text-slate-600 mt-0.5">{seminar.speaker_designation}</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Leading expert in {seminar.category}. Invited to present foundational and cutting-edge advancements to Joy University students and faculty.
                </p>
              </div>
            </div>
          </div>

          {/* Topics Covered */}
          {seminar.topics && seminar.topics.length > 0 && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Topics Covered</h2>
              <div className="flex flex-wrap gap-2">
                {seminar.topics.map((topic: string, i: number) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-slate-100 text-slate-800 text-xs font-medium rounded-lg border border-slate-200"
                  >
                    ✓ {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Requirements & Prerequisites */}
          {seminar.requirements && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-slate-700" />
                Participant Prerequisites
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                {seminar.requirements}
              </p>
            </div>
          )}

          {/* Organizer Info */}
          {seminar.organizer_info && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-600" />
                Organizing Body
              </h2>
              <p className="text-xs text-slate-800 font-semibold">{seminar.organizer_info}</p>
            </div>
          )}
        </div>

        {/* Right Column: Registration Card */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs sticky top-20 space-y-5">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Registration Status
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-bold text-slate-900">
                  {isCompleted
                    ? 'Concluded'
                    : isRegistered
                    ? 'Confirmed'
                    : isWaitlisted
                    ? `Waitlist #${seminar.user_waitlist_position}`
                    : isFull
                    ? 'Waitlist Open'
                    : 'Free Entry'}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {seminar.capacity} Total Seats
                </span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Available Seats:</span>
                <span className="font-semibold text-slate-900">{seminar.remaining_seats}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Confirmed Attendees:</span>
                <span className="font-semibold text-slate-900">{seminar.registered_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Waitlist Count:</span>
                <span className="font-semibold text-slate-900">{seminar.waitlist_count}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2">
                <span className="text-slate-500 font-medium">Deadline:</span>
                <span className="font-semibold text-rose-600">
                  {new Date(seminar.registration_deadline).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            {/* Action Buttons based on state */}
            {isRegistered ? (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>You are confirmed for this seminar!</span>
                </div>
                <button
                  onClick={handleViewPass}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <QrCode className="w-4 h-4" />
                  <span>View & Download Digital Pass</span>
                </button>
              </div>
            ) : isWaitlisted ? (
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-xs text-blue-800 font-medium">
                  <Hourglass className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    You are on the waitlist at <strong className="font-semibold">position #{seminar.user_waitlist_position}</strong>.
                  </span>
                </div>
              </div>
            ) : isCompleted ? (
              <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg text-center text-xs font-semibold text-slate-600">
                This seminar was successfully conducted on {new Date(seminar.date).toLocaleDateString()}.
              </div>
            ) : isClosed || isPastDeadline ? (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-center text-xs font-semibold text-rose-700">
                Registration Closed
              </div>
            ) : isFull ? (
              <button
                onClick={handleRegisterClick}
                className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <Hourglass className="w-4 h-4" />
                <span>Join Priority Waitlist (Full Capacity)</span>
              </button>
            ) : (
              <button
                onClick={handleRegisterClick}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Register Now (Free Entry Pass)</span>
              </button>
            )}

            <div className="pt-2 text-[11px] text-slate-500 text-center space-y-1">
              <p>✓ Instant QR code entry pass upon registration</p>
              <p>✓ Eligible for verifiable certificate upon attendance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Confirmation Modal */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 text-slate-900">
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                {isFull ? 'Confirm Waitlist Placement' : 'Confirm Seminar Registration'}
              </h3>
              <p className="text-xs text-slate-500">
                Please verify your student information before continuing.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Participant Name:</span>
                <span className="font-semibold text-slate-900">{user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Student ID / Roll:</span>
                <span className="font-semibold text-slate-900">{user?.student_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">College Email:</span>
                <span className="font-semibold text-slate-900">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Department:</span>
                <span className="font-semibold text-slate-900">{user?.department}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between">
                <span className="text-slate-500">Seminar:</span>
                <span className="font-semibold text-slate-900 text-right">{seminar.title}</span>
              </div>
            </div>

            {isFull && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                Notice: All standard seats are booked. You will be added to the waitlist and notified as soon as a participant cancels.
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={handleConfirmRegistration}
                disabled={registering}
                className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-colors"
              >
                {registering ? 'Processing...' : isFull ? 'Confirm Waitlist Entry' : 'Confirm Registration'}
              </button>
              <button
                onClick={() => setConfirmModalOpen(false)}
                className="py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-xs rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Digital Pass Modal */}
      <PassModal
        isOpen={passModalOpen}
        onClose={() => setPassModalOpen(false)}
        registration={passData}
      />
    </div>
  );
};
