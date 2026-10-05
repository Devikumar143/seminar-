import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ShieldCheck, Mail, Phone, MapPin, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white text-slate-600 border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-base font-bold text-slate-900 tracking-tight">Joy University</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Official university portal for academic symposiums, guest lectures, and verified participation credentials.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              All Event Systems Operational
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/seminars" className="text-slate-600 hover:text-slate-900 transition-colors">Browse Upcoming Seminars</Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-slate-600 hover:text-slate-900 transition-colors">Student Dashboard</Link>
              </li>
              <li>
                <Link to="/my-registrations" className="text-slate-600 hover:text-slate-900 transition-colors">My Registration Passes</Link>
              </li>
              <li>
                <Link to="/verify-certificate/demo" className="text-slate-600 hover:text-slate-900 transition-colors">Verify Certificate Online</Link>
              </li>
            </ul>
          </div>

          {/* Academic Policies */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Academic Guidelines</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>Verified QR Check-In Required</li>
              <li>Certificate Eligibility Criteria</li>
              <li>Waitlist Auto-Promotion Rules</li>
              <li>Code of Conduct for Attendees</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Events Secretariat</h4>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Academic Block 1, Joy Main Campus</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                <span>seminars@joyuniversity.edu</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                <span>+1 (555) 019-2800 (Ext. 402)</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Joy University. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/admin/login" className="hover:text-slate-900 flex items-center gap-1 transition-colors">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
              Staff / Admin Access
            </Link>
            <span>•</span>
            <Link to="/verify-certificate/demo" className="hover:text-slate-900 flex items-center gap-1 transition-colors">
              <Award className="w-3.5 h-3.5 text-slate-500" />
              Public Verification
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
