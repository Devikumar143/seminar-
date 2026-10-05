import React, { useState, useEffect } from 'react';
import {
  Award,
  ExternalLink,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { CertificateModal } from '../../components/CertificateModal';

export const AdminCertificates: React.FC = () => {
  const { showToast } = useToast();
  const [seminars, setSeminars] = useState<any[]>([]);
  const [selectedSeminarId, setSelectedSeminarId] = useState<string>('');
  const [generating, setGenerating] = useState(false);
  const [selectedCert, setSelectedCert] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchSeminars();
  }, []);

  const fetchSeminars = async () => {
    try {
      const res = await api.get('/seminars?timeframe=all&limit=50');
      if (res.data.success && res.data.seminars.length > 0) {
        setSeminars(res.data.seminars);
        setSelectedSeminarId(res.data.seminars[0].id.toString());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateCertificates = async () => {
    if (!selectedSeminarId) return;
    try {
      setGenerating(true);
      const res = await api.post('/certificates/generate', {
        seminar_id: parseInt(selectedSeminarId, 10),
      });

      if (res.data.success) {
        showToast(res.data.message, 'success');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to issue certificates.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const selectedSeminar = seminars.find((s) => s.id.toString() === selectedSeminarId);

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-900 pb-12">
      {/* Top Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Academic Certificate Issuance
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Generate tamper-proof verifiable credentials for students who completed seminars.
        </p>
      </div>

      {/* Generator Card */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Bulk Credential Generator</h2>
            <p className="text-xs text-slate-500">
              Certificates are automatically generated and linked to each student's attendance record.
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
          <label className="block text-xs font-semibold text-slate-700">
            Select Seminar to Issue Certificates:
          </label>
          <select
            value={selectedSeminarId}
            onChange={(e) => setSelectedSeminarId(e.target.value)}
            className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-slate-900"
          >
            {seminars.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} ({s.status.toUpperCase()} • {new Date(s.date).toLocaleDateString()})
              </option>
            ))}
          </select>

          {selectedSeminar && (
            <div className="pt-2 text-xs text-slate-600 flex flex-wrap gap-4 border-t border-slate-200">
              <span>Venue: <strong className="text-slate-800">{selectedSeminar.venue}</strong></span>
              <span>Speaker: <strong className="text-slate-800">{selectedSeminar.speaker}</strong></span>
              <span>Date: <strong className="text-slate-800">{new Date(selectedSeminar.date).toLocaleDateString()}</strong></span>
            </div>
          )}
        </div>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
          <p className="font-semibold text-amber-900 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Eligibility Protocol:</span>
          </p>
          <p className="leading-relaxed">
            Certificates will only be issued to participants who have been marked as <strong>PRESENT</strong> in the attendance registry for this session. Duplicate certificates are safely prevented.
          </p>
        </div>

        <button
          onClick={handleGenerateCertificates}
          disabled={generating || !selectedSeminarId}
          className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>{generating ? 'Issuing Certificates...' : 'Generate Certificates for Verified Attendees'}</span>
        </button>
      </div>

      {/* Public Verification Link Card */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Public Certificate Verification Registry</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Test the tamper-proof public credential verification page.
          </p>
        </div>
        <a
          href="/verify-certificate/demo"
          target="_blank"
          rel="noreferrer"
          className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg border border-slate-300 shadow-xs transition-colors flex items-center gap-1.5"
        >
          <span>Open Public Registry</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        certificate={selectedCert}
      />
    </div>
  );
};
