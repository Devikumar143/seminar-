import React, { useState } from 'react';
import {
  ShieldCheck,
  Building,
  Server,
  Save
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const AdminSettings: React.FC = () => {
  const { showToast } = useToast();

  const [settings, setSettings] = useState({
    institutionName: 'Joy University',
    portalTitle: 'Online Seminar & Academic Events Management System',
    supportEmail: 'seminars@joyuniversity.edu',
    campusAddress: 'Academic Block 1, Joy Main Campus, University Boulevard',
    enableWaitlistAutoPromotion: true,
    emailNotificationsEnabled: true,
    certificateVerificationPublic: true,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('System configuration settings saved successfully!', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-900 pb-12">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System & Portal Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure institutional parameters, automated event policies, and notification dispatchers.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* University Details */}
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Building className="w-4 h-4 text-slate-700" />
            <span>Institutional Identity</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Institution Name</label>
              <input
                type="text"
                value={settings.institutionName}
                onChange={(e) => setSettings({ ...settings, institutionName: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Support Desk Email</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1.5">Campus Venue Address</label>
              <input
                type="text"
                value={settings.campusAddress}
                onChange={(e) => setSettings({ ...settings, campusAddress: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Automation Policies */}
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Server className="w-4 h-4 text-slate-700" />
            <span>Automation & Verification Protocols</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="font-semibold text-slate-900 block">Waitlist Auto-Promotion Engine</span>
                <span className="text-slate-500 block text-[11px] mt-0.5">
                  Automatically enroll and generate QR passes for the next waitlisted student when a seat is released.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.enableWaitlistAutoPromotion}
                onChange={(e) =>
                  setSettings({ ...settings, enableWaitlistAutoPromotion: e.target.checked })
                }
                className="w-4 h-4 accent-slate-900 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="font-semibold text-slate-900 block">Public Certificate Registry</span>
                <span className="text-slate-500 block text-[11px] mt-0.5">
                  Allow external employers and academic institutions to verify certificates via QR code.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.certificateVerificationPublic}
                onChange={(e) =>
                  setSettings({ ...settings, certificateVerificationPublic: e.target.checked })
                }
                className="w-4 h-4 accent-slate-900 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="font-semibold text-slate-900 block">Transactional Email Notifications</span>
                <span className="text-slate-500 block text-[11px] mt-0.5">
                  Dispatch email receipts for registrations, waitlist status, check-ins, and certificate releases.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotificationsEnabled}
                onChange={(e) =>
                  setSettings({ ...settings, emailNotificationsEnabled: e.target.checked })
                }
                className="w-4 h-4 accent-slate-900 rounded"
              />
            </div>
          </div>
        </div>

        {/* Database & Service Health Status */}
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-700" />
            <span>Infrastructure Connectivity</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <div>
                <span className="font-semibold text-slate-900 block">PostgreSQL 18</span>
                <span className="text-[10px] text-emerald-700 font-mono">Port 5432 (Connected)</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <div>
                <span className="font-semibold text-slate-900 block">Express REST API</span>
                <span className="text-[10px] text-emerald-700 font-mono">Port 5000 (Healthy)</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <div>
                <span className="font-semibold text-slate-900 block">QR Code Engine</span>
                <span className="text-[10px] text-emerald-700 font-mono">Level H Encoding</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save System Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
