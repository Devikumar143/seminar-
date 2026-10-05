import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import api from '../services/api';

export const VerifyCertificate: React.FC = () => {
  const { certificateId } = useParams<{ certificateId: string }>();
  const navigate = useNavigate();

  const [inputCode, setInputCode] = useState(certificateId || '');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (certificateId && certificateId !== 'demo') {
      verifyId(certificateId);
    } else {
      api.get('/certificates/verify/CERT-2026-')
        .catch(() => {});
    }
  }, [certificateId]);

  const verifyId = async (idToVerify: string) => {
    if (!idToVerify.trim()) return;
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const res = await api.get(`/certificates/verify/${idToVerify.trim()}`);
      if (res.data.success) {
        setResult(res.data.verification);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Certificate could not be verified in the Joy University Academic Senate database.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    navigate(`/verify-certificate/${inputCode.trim()}`);
    verifyId(inputCode.trim());
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 text-slate-900">
      {/* Top Banner */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Joy University Credential Verification
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
          Public verification portal for authenticating participation certificates issued by the Joy University Academic Senate.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs max-w-xl mx-auto">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Enter Certificate ID (e.g. CERT-2026-...)"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-slate-900 text-slate-900 font-mono placeholder:text-slate-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !inputCode.trim()}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors shrink-0"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      </div>

      {/* Verification Result Display */}
      {result ? (
        <div className="bg-white rounded-xl border-2 border-emerald-300 shadow-sm p-6 sm:p-8 max-w-2xl mx-auto space-y-5 text-slate-900">
          {/* Top Emerald Banner */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-300">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide block">
                Official Credential Verified
              </span>
              <p className="text-[11px] text-emerald-700">
                This academic certificate is authentic and recorded in the university registry.
              </p>
            </div>
          </div>

          {/* Record Details */}
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
                  Certificate ID
                </span>
                <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">
                  {result.certificate_id}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
                  Issuing Senate
                </span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {result.issuing_organization}
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
                  Recipient Name
                </span>
                <span className="font-bold text-slate-900 text-base mt-0.5 block">
                  {result.student_name}
                </span>
                <span className="text-[11px] text-slate-500">Department: {result.department}</span>
              </div>

              <div className="border-t border-slate-200 pt-2.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
                  Seminar / Academic Event
                </span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  "{result.seminar_title}"
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Keynote Speaker: {result.speaker}
                </span>
              </div>

              <div className="border-t border-slate-200 pt-2.5 grid grid-cols-2 gap-2 text-slate-700">
                <div>
                  <span className="text-slate-500 text-[10px] block">Event Date:</span>
                  <span className="font-semibold text-slate-900">
                    {new Date(result.seminar_date).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Venue:</span>
                  <span className="font-semibold text-slate-900">{result.venue}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center pt-1">
            <span className="text-[10px] text-slate-400 font-mono">
              Joy University Digital Credential Trust Framework • Standard ISO-27001
            </span>
          </div>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl border border-rose-300 shadow-xs p-6 max-w-xl mx-auto text-center space-y-2">
          <div className="w-10 h-10 mx-auto rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
            <XCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Verification Unsuccessful</h3>
          <p className="text-xs text-rose-600 leading-relaxed font-medium">{error}</p>
          <p className="text-[11px] text-slate-400">
            Please ensure you have entered the exact Certificate ID (e.g. CERT-2026-...) without extra spaces.
          </p>
        </div>
      ) : (
        <div className="p-8 bg-white rounded-xl border border-slate-200 max-w-xl mx-auto text-center text-xs text-slate-500 shadow-xs">
          Enter a certificate ID above to verify its authenticity.
        </div>
      )}
    </div>
  );
};
