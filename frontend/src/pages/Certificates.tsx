import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Download,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Eye,
  FileCheck
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { CertificateModal } from '../components/CertificateModal';

export const Certificates: React.FC = () => {
  const { showToast } = useToast();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const res = await api.get('/certificates/my');
      if (res.data.success) {
        setCertificates(res.data.certificates || []);
      }
    } catch (err) {
      console.error('Failed to load certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (cert: any) => {
    try {
      showToast('Generating official certificate PDF...', 'info');
      const response = await api.get(`/certificates/${cert.certificate_id || cert.id}/pdf`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Certificate-${cert.certificate_id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast('Certificate downloaded successfully!', 'success');
    } catch (err) {
      showToast('Failed to download certificate PDF.', 'error');
    }
  };

  return (
    <div className="space-y-6 text-slate-900">
      {/* Top Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Academic Portfolio
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-0.5">
            My Participation Certificates
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official academic credentials awarded upon verified attendance at university seminars.
          </p>
        </div>

        <Link
          to="/verify-certificate/demo"
          className="self-start sm:self-auto px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-semibold rounded-lg border border-slate-300 shadow-xs transition-colors flex items-center gap-1.5"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Public Verification Registry</span>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="p-8 bg-white rounded-xl border border-slate-200 shadow-xs animate-pulse h-36" />
          ))}
        </div>
      ) : certificates.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3 shadow-xs">
          <Award className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No Certificates Awarded Yet</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Certificates are automatically issued once the seminar concludes and your attendance is verified at the venue.
          </p>
          <Link
            to="/seminars"
            className="inline-block px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors"
          >
            Browse Upcoming Seminars
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow p-6 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-800 rounded-md border border-emerald-200 uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Credential
                  </span>
                  <span className="text-[11px] font-mono font-semibold text-slate-500">
                    {cert.certificate_id}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {cert.seminar_title}
                </h3>

                <p className="text-xs text-slate-500">
                  Keynote Speaker: <span className="font-semibold text-slate-800">{cert.speaker}</span>
                </p>

                <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Seminar Date: {new Date(cert.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-slate-700">Issued by Joy University Academic Affairs</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedCert(cert);
                    setModalOpen(true);
                  }}
                  className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-4 h-4" />
                  <span>Inspect Certificate</span>
                </button>

                <button
                  onClick={() => handleDownloadPDF(cert)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg transition-colors"
                  title="Download PDF"
                >
                  <Download className="w-4 h-4" />
                </button>

                <Link
                  to={`/verify-certificate/${cert.certificate_id}`}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg transition-colors"
                  title="Verify in Public Registry"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        certificate={selectedCert}
      />
    </div>
  );
};
