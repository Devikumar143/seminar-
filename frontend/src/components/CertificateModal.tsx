import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, Award, ShieldCheck, ExternalLink, Printer } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: any;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ isOpen, onClose, certificate }) => {
  const { showToast } = useToast();

  // Handle ESC key and scroll lock
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

  if (!isOpen || !certificate) return null;

  const verifyUrl = `${window.location.origin}/verify-certificate/${certificate.certificate_id}`;

  const handleDownloadPDF = async () => {
    try {
      showToast('Generating official PDF certificate...', 'info');
      const response = await api.get(`/certificates/${certificate.certificate_id || certificate.id}/pdf`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Certificate-${certificate.certificate_id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast('Certificate downloaded successfully!', 'success');
    } catch (err) {
      console.error('Failed to download certificate PDF:', err);
      showToast('Failed to download certificate PDF.', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in"
    >
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden border border-slate-200 relative flex flex-col max-h-[92vh] animate-slide-up my-auto">
        {/* Top actions bar */}
        <div className="bg-slate-50 text-slate-900 px-4 sm:px-6 py-3 flex items-center justify-between border-b border-slate-200 shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-xs tracking-wider uppercase text-slate-800">
              Joy University Academic Registry • Verifiable Credential
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors text-xs flex items-center gap-1.5"
              title="Print Certificate"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 hover:text-slate-900 transition-colors ml-1"
              title="Close modal"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Certificate Printable Canvas Body - Minimalist Academic Style */}
        <div className="p-4 sm:p-8 bg-slate-100/90 overflow-y-auto printable-area flex-1">
          <div className="border-2 border-slate-800 p-6 sm:p-10 rounded-xl relative bg-white text-slate-900 shadow-sm text-center">
            {/* Header */}
            <div className="mb-6">
              <div className="w-12 h-12 mx-auto rounded-lg bg-slate-900 flex items-center justify-center text-white mb-3">
                <Award className="w-6 h-6 text-amber-400" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-widest text-slate-900 font-serif uppercase">
                Joy University
              </h1>
              <p className="text-[10px] sm:text-xs font-semibold tracking-widest text-slate-500 uppercase mt-0.5">
                Office of Academic Affairs & Student Development
              </p>
              <div className="w-24 h-0.5 bg-slate-800 mx-auto mt-3"></div>
            </div>

            {/* Main Title */}
            <div className="mb-5">
              <h2 className="text-lg sm:text-xl font-bold tracking-widest text-slate-800 font-serif uppercase">
                Certificate of Participation
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 italic mt-1 font-serif">
                This academic credential is conferred upon
              </p>
            </div>

            {/* Recipient Name */}
            <div className="mb-6">
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-serif capitalize">
                {certificate.student_name || 'Rahul Sharma'}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1.5">
                {certificate.student_id ? `Student ID: ${certificate.student_id}` : ''}
                {certificate.department ? ` • Department of ${certificate.department}` : ''}
              </p>
            </div>

            {/* Citation Body */}
            <div className="max-w-2xl mx-auto mb-7 text-xs sm:text-sm text-slate-700 leading-relaxed font-serif">
              for successful attendance and verified participation in the university academic seminar
              <span className="block text-base sm:text-lg font-bold text-slate-900 mt-1 font-sans">
                "{certificate.seminar_title}"
              </span>
              <span className="block text-xs text-slate-500 mt-1 font-sans">
                Delivered by {certificate.speaker} ({certificate.speaker_designation || 'Keynote Speaker'}) on{' '}
                {new Date(certificate.date || certificate.issued_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}{' '}
                at Joy University Campus.
              </span>
            </div>

            {/* Signatures & QR Verification */}
            <div className="grid grid-cols-3 items-end pt-6 border-t border-slate-200 gap-4">
              {/* Speaker Signature */}
              <div className="text-center">
                <div className="font-serif italic text-base text-slate-800 font-bold mb-1">
                  {certificate.speaker?.split(',')[0]}
                </div>
                <div className="w-28 border-b border-slate-400 mx-auto"></div>
                <p className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold mt-1">
                  Keynote Speaker
                </p>
              </div>

              {/* QR Code Verification in Center */}
              <div className="flex flex-col items-center justify-center">
                <div className="p-1 bg-white border border-slate-300 rounded shadow-xs">
                  <QRCodeSVG value={verifyUrl} size={64} level="M" />
                </div>
                <span className="text-[9px] font-mono text-slate-700 font-bold mt-1 tracking-wider">
                  {certificate.certificate_id}
                </span>
                <a
                  href={verifyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[9px] text-blue-900 hover:underline flex items-center gap-0.5 mt-0.5 font-semibold"
                >
                  <span>Verify Online</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>

              {/* Dean Signature */}
              <div className="text-center">
                <div className="font-serif italic text-base text-slate-800 font-bold mb-1">
                  Dr. Evelyn Richardson
                </div>
                <div className="w-28 border-b border-slate-400 mx-auto"></div>
                <p className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold mt-1">
                  Dean of Academic Affairs
                </p>
              </div>
            </div>

            {/* Security Seal Footer */}
            <div className="mt-6 flex items-center justify-between text-[9px] text-slate-500 font-mono pt-3 border-t border-slate-100">
              <span>Issue Date: {new Date(certificate.issued_at || Date.now()).toLocaleDateString()}</span>
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Tamper-Proof Credential
              </span>
              <span>Registry: JOY-SENATE-VALIDATED</span>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
