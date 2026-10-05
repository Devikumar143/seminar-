import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  Download,
  Trash2,
  Hourglass
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PassModal } from '../components/PassModal';

export const MyRegistrations: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'confirmed' | 'waitlist'>('confirmed');
  const [loading, setLoading] = useState(true);

  // Pass Modal
  const [selectedPass, setSelectedPass] = useState<any>(null);
  const [passModalOpen, setPassModalOpen] = useState(false);

  // Cancel Dialog
  const [cancelingReg, setCancelingReg] = useState<any>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const [regRes, waitRes] = await Promise.all([
        api.get('/registrations/my'),
        api.get('/registrations/my-waitlist'),
      ]);

      if (regRes.data.success) setRegistrations(regRes.data.registrations || []);
      if (waitRes.data.success) setWaitlist(waitRes.data.waitlist || []);
    } catch (err) {
      console.error('Failed to load registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (reg: any) => {
    try {
      showToast('Generating PDF Pass...', 'info');
      const response = await api.get(`/registrations/${reg.registration_id || reg.id}/pass-pdf`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Pass-${reg.registration_id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast('Pass downloaded successfully!', 'success');
    } catch (err) {
      showToast('Failed to download PDF pass.', 'error');
    }
  };

  const handleCancelRegistration = async () => {
    if (!cancelingReg) return;
    try {
      setCancelLoading(true);
      const res = await api.delete(`/registrations/${cancelingReg.registration_id || cancelingReg.id}`);
      if (res.data.success) {
        showToast('Registration cancelled. Waitlisted participants promoted.', 'info');
        setCancelingReg(null);
        fetchRegistrations();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to cancel registration.', 'error');
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-900">
      {/* Top Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Student Credentials
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-0.5">
            My Seminar Passes & Registrations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Access your entry passes, check-in barcodes, and waitlist allocations.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200">
          <button
            onClick={() => setActiveTab('confirmed')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'confirmed'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Confirmed Passes ({registrations.length})
          </button>
          <button
            onClick={() => setActiveTab('waitlist')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'waitlist'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Waitlist ({waitlist.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs animate-pulse h-28" />
          ))}
        </div>
      ) : activeTab === 'confirmed' ? (
        registrations.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3 shadow-xs">
            <Ticket className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No Registrations Yet</h3>
            <p className="text-xs text-slate-500">
              You have not registered for any upcoming seminars yet. Discover seminars and reserve your seat.
            </p>
            <Link
              to="/seminars"
              className="inline-block px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors"
            >
              Browse Upcoming Seminars
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {registrations.map((reg) => (
              <div
                key={reg.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-md transition-all p-5 sm:p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5"
              >
                {/* Main seminar & pass info */}
                <div className="flex flex-col sm:flex-row items-start gap-5 flex-1 min-w-0 w-full">
                  <div className="relative shrink-0 w-full sm:w-44 h-40 sm:h-28 rounded-xl overflow-hidden border border-slate-200 shadow-2xs bg-slate-100">
                    <img
                      src={reg.banner_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=400'}
                      alt={reg.seminar_title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold bg-slate-900/80 backdrop-blur-xs text-white rounded-md tracking-wider uppercase">
                      {reg.category}
                    </span>
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 text-[10px] font-mono text-slate-600 bg-slate-100 border border-slate-200 rounded-full font-semibold">
                        PASS: {reg.registration_id}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Confirmed Seat
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
                      {reg.seminar_title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 font-medium">
                      Speaker: <span className="text-slate-800 font-semibold">{reg.speaker}</span>
                    </p>

                    <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1.5 font-medium text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        {new Date(reg.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="text-slate-300 hidden sm:inline">•</span>
                      <span className="flex items-center gap-1.5 font-medium text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        {reg.start_time.slice(0, 5)} - {reg.end_time.slice(0, 5)}
                      </span>
                      <span className="text-slate-300 hidden sm:inline">•</span>
                      <span className="flex items-center gap-1.5 font-medium text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        {reg.venue}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 w-full lg:w-auto justify-end shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
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
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <QrCode className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                    <span>View QR Pass</span>
                  </button>

                  <button
                    onClick={() => handleDownloadPDF(reg)}
                    className="p-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 rounded-xl transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                    title="Download Pass as PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setCancelingReg(reg)}
                    className="p-2.5 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-300 rounded-xl transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                    title="Cancel Registration"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Waitlist Tab */
        waitlist.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3 shadow-xs">
            <Hourglass className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No Waitlisted Seminars</h3>
            <p className="text-xs text-slate-500">
              When seminars reach full capacity, you can join the priority waitlist here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {waitlist.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold rounded-md">
                      Waitlist Position #{item.position}
                    </span>
                    <span className="text-xs text-slate-500">
                      Added on {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">{item.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span>{new Date(item.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{item.venue}</span>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 max-w-xs">
                  ⚡ Auto-Promotion Enabled: You will be automatically enrolled and issued a pass if any confirmed attendee cancels!
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Confirmation Dialog for Cancellation */}
      {cancelingReg && createPortal(
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-slate-900">
            <div className="text-center space-y-2.5">
              <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shadow-2xs">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Cancel Seminar Registration?</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Are you sure you want to cancel your registration for{' '}
                <strong className="text-slate-900">"{cancelingReg.seminar_title}"</strong>? Your reserved seat will be immediately released to the next scholar on the waitlist.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleCancelRegistration}
                disabled={cancelLoading}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {cancelLoading ? 'Cancelling...' : 'Yes, Cancel Registration'}
              </button>
              <button
                onClick={() => setCancelingReg(null)}
                className="py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Keep Seat
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Digital Pass Modal */}
      <PassModal
        isOpen={passModalOpen}
        onClose={() => setPassModalOpen(false)}
        registration={selectedPass}
      />
    </div>
  );
};
