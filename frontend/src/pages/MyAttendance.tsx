import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Award
} from 'lucide-react';
import api from '../services/api';

export const MyAttendance: React.FC = () => {
  const [attendanceList, setAttendanceList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.get('/attendance/my');
      if (res.data.success) {
        setAttendanceList(res.data.attendance || []);
      }
    } catch (err) {
      console.error('Failed to load attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalRegistered = attendanceList.length;
  const attendedCount = attendanceList.filter((a) => a.attendance_status === 'present').length;
  const rate = totalRegistered > 0 ? Math.round((attendedCount / totalRegistered) * 100) : 0;

  return (
    <div className="space-y-6 text-slate-900">
      {/* Top Heading */}
      <div className="border-b border-slate-200 pb-4">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Verified Attendance Record
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-0.5">
          My Seminar Attendance
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Official attendance timestamps verified via QR scanning at venue entrances.
        </p>
      </div>

      {/* Attendance Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Attendance Rate
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 block">
            {rate}%
          </span>
          <span className="text-[11px] text-emerald-700 font-medium">Verified Participation</span>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Sessions Attended
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-emerald-700 mt-1 block">
            {attendedCount}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">Marked Present</span>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Enrolled
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 block">
            {totalRegistered}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">Confirmed Registrations</span>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-slate-700" />
            <span>Attendance Log</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">{attendanceList.length} Sessions Total</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading attendance records...</div>
        ) : attendanceList.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="text-xs text-slate-500">No attendance records found yet.</p>
            <Link to="/seminars" className="text-xs font-semibold text-slate-900 hover:underline">
              Browse Seminars to Register →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Seminar</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Attendance Status</th>
                  <th className="py-3 px-4">Check-in Time</th>
                  <th className="py-3 px-4 text-right">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {attendanceList.map((item, i) => {
                  const isPresent = item.attendance_status === 'present';
                  const isNotStarted = item.attendance_status === 'Not Started';

                  return (
                    <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs">
                        <div className="truncate font-bold">{item.seminar_title}</div>
                        <div className="text-[11px] text-slate-500 font-normal">Speaker: {item.speaker}</div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {new Date(item.date).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isPresent ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Present
                          </span>
                        ) : isNotStarted ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-700">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            Not Started
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-800">
                            <XCircle className="w-3.5 h-3.5 text-rose-500" />
                            Absent
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-mono whitespace-nowrap">
                        {item.check_in_time
                          ? new Date(item.check_in_time).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })
                          : '—'}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {item.certificate_id ? (
                          <Link
                            to="/certificates"
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold rounded-md border border-amber-200 transition-colors"
                          >
                            <Award className="w-3 h-3 text-amber-600" />
                            <span>Claimed</span>
                          </Link>
                        ) : isPresent ? (
                          <span className="text-[11px] text-slate-500">Processing</span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Ineligible</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
