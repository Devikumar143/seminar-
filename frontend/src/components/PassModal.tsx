import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';
import { 
  X, 
  Download, 
  MapPin, 
  ShieldCheck, 
  GraduationCap
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

interface PassModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: any;
}

export const PassModal: React.FC<PassModalProps> = ({ isOpen, onClose, registration }) => {
  const { showToast } = useToast();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !registration) return null;

  const handleDownloadPDF = async () => {
    try {
      showToast('Generating official PDF Pass...', 'info');
      const response = await api.get(`/registrations/${registration.registration_id || registration.id}/pass-pdf`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Pass-${registration.registration_id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast('Pass downloaded successfully!', 'success');
    } catch (err) {
      console.error('Failed to download pass PDF:', err);
      showToast('Failed to download PDF pass. Please try again.', 'error');
    }
  };

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
    >
      <div className="bg-white text-slate-900 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 relative animate-slide-up my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-white flex items-center justify-center transition-colors"
          title="Close Pass"
          aria-label="Close Pass"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top VIP Event Banner - Solid Minimal Navy */}
        <div className="bg-slate-900 text-white p-6 text-center border-b border-slate-800">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 text-slate-200 text-[10px] font-semibold tracking-wider uppercase mb-2">
            <GraduationCap className="w-3.5 h-3.5 text-slate-300" />
            <span>Official University Entry Pass</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Joy University</h2>
          <p className="text-xs text-slate-400 mt-0.5">Senate Academic Symposium Pass</p>
        </div>

        {/* Pass Body */}
        <div className="p-6 space-y-5 relative">
          {/* Perforation Notches on sides */}
          <div className="ticket-notch-left" />
          <div className="ticket-notch-right" />

          {/* Seminar Title & Speaker */}
          <div className="text-center">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
              Session Ticket
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-1 leading-snug">
              {registration.seminar_title || registration.title}
            </h3>
            <p className="text-xs text-slate-600 font-medium mt-1">
              Keynote Speaker: <span className="text-slate-900 font-semibold">{registration.speaker}</span>
            </p>
          </div>

          {/* High-Res QR Code Card - Flat Clean Minimalist */}
          <div className="flex flex-col items-center justify-center p-5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-xs">
              <QRCodeSVG
                value={registration.qr_code_token || `REG-${registration.registration_id}`}
                size={160}
                level="H"
                includeMargin={false}
              />
            </div>
            <div className="mt-3 text-center">
              <p className="text-xs font-mono font-bold text-slate-900 tracking-wider">
                {registration.registration_id}
              </p>
              <div className="flex items-center gap-1.5 justify-center text-[10px] text-emerald-700 font-semibold mt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>CONFIRMED & VALIDATED</span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Participant</span>
              <span className="font-bold text-slate-900 truncate block mt-0.5">
                {registration.student_name || 'Rahul Sharma'}
              </span>
              <span className="text-[10px] text-blue-900 font-mono font-semibold">
                {registration.student_id || 'Student ID'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Date & Time</span>
              <span className="font-bold text-slate-900 block mt-0.5">
                {new Date(registration.seminar_date || registration.date).toLocaleDateString()}
              </span>
              <span className="text-[10px] text-slate-600">
                {registration.start_time?.slice(0, 5)} - {registration.end_time?.slice(0, 5)}
              </span>
            </div>

            <div className="col-span-2 p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">Venue Location</span>
                <span className="font-medium text-slate-800 text-xs">
                  {registration.venue || registration.seminar_venue}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF Pass</span>
            </button>
            <button
              onClick={onClose}
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
