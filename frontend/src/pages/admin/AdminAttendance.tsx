import React, { useState, useEffect } from 'react';
import {
  QrCode,
  CheckCircle2,
  Search,
  Users,
  Clock,
  Calendar
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { QRScannerModal } from '../../components/QRScannerModal';

export const AdminAttendance: React.FC = () => {
  const { showToast } = useToast();
  const [seminars, setSeminars] = useState<any[]>([]);
  const [selectedSeminarId, setSelectedSeminarId] = useState<string>('');
  const [stats, setStats] = useState<any>({ total_registered: 0, total_present: 0, total_absent: 0 });
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchSeminarsList();
  }, []);

  useEffect(() => {
    if (selectedSeminarId) {
      fetchAttendanceData(selectedSeminarId);
    }
  }, [selectedSeminarId]);

  const fetchSeminarsList = async () => {
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

  const fetchAttendanceData = async (semId: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/attendance/seminar/${semId}`);
      if (res.data.success) {
        setStats(res.data.stats || { total_registered: 0, total_present: 0, total_absent: 0 });
        setAttendees(res.data.attendees || []);
      }
    } catch (err) {
      console.error('Failed to load seminar attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualMark = async (registrationId: number, status: 'present' | 'absent') => {
    try {
      const res = await api.post('/attendance/manual-mark', {
        registration_id: registrationId,
        status,
      });
      if (res.data.success) {
        showToast(res.data.message, 'success');
        fetchAttendanceData(selectedSeminarId);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update attendance.', 'error');
    }
  };

  const filteredAttendees = attendees.filter((a) =>
    a.student_name?.toLowerCase().includes(search.toLowerCase()) ||
    a.student_id?.toLowerCase().includes(search.toLowerCase()) ||
    a.registration_id?.toLowerCase().includes(search.toLowerCase())
  );

  const rate = stats.total_registered > 0
    ? Math.round((parseInt(stats.total_present, 10) / parseInt(stats.total_registered, 10)) * 100)
    : 0;

  return (
    <div className="space-y-6 text-slate-900">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">QR Attendance Console</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Scan attendee digital passes in real-time or manually mark verified participants.
          </p>
        </div>

        <button
          onClick={() => setScannerOpen(true)}
          className="self-start sm:self-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-2"
        >
          <QrCode className="w-4 h-4" />
          <span>Open Live QR Scanner</span>
        </button>
      </div>

      {/* Seminar Selector Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="text-xs font-semibold text-slate-700">Seminar:</span>
          <select
            value={selectedSeminarId}
            onChange={(e) => setSelectedSeminarId(e.target.value)}
            className="flex-1 sm:w-96 px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-slate-900"
          >
            {seminars.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} ({new Date(s.date).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
          <input
            type="text"
            placeholder="Filter attendee name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-slate-900"
          />
        </div>
      </div>

      {/* KPI Cards for the Selected Seminar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">Total Enrolled</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">
            {stats.total_registered}
          </span>
          <span className="text-[10px] text-slate-500 font-medium">Confirmed Passes</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">Checked In (Present)</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">
            {stats.total_present}
          </span>
          <span className="text-[10px] text-emerald-700 font-medium">QR Scanned</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">Unmarked / Absent</span>
          <span className="text-2xl font-bold text-slate-500 mt-1 block">
            {stats.total_absent}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">Awaiting Arrival</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">Attendance Rate</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">
            {rate}%
          </span>
          <span className="text-[10px] text-slate-500 font-medium">Venue Turnout</span>
        </div>
      </div>

      {/* Attendees Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-4 h-4 text-slate-700" />
            <span>Attendee Verification Roster</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            {filteredAttendees.length} Participants
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading attendee records...</div>
        ) : filteredAttendees.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No attendees found for this seminar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Pass ID</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Check-in Status</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Manual Override</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredAttendees.map((att) => {
                  const isPresent = att.attendance_status === 'present';
                  return (
                    <tr key={att.registration_id_pk} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                        {att.registration_id}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{att.student_name}</div>
                        <div className="text-[10px] text-slate-500">{att.student_id} • {att.email}</div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                        {att.department || 'N/A'} ({att.year || 'N/A'})
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {isPresent ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Present
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            Unmarked
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-slate-500">
                        {att.check_in_time
                          ? new Date(att.check_in_time).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })
                          : '—'}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {isPresent ? (
                          <button
                            onClick={() => handleManualMark(att.registration_id_pk, 'absent')}
                            className="px-2.5 py-1 text-[10px] font-semibold rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors"
                          >
                            Mark Absent
                          </button>
                        ) : (
                          <button
                            onClick={() => handleManualMark(att.registration_id_pk, 'present')}
                            className="px-2.5 py-1 text-[10px] font-semibold rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors"
                          >
                            Mark Present
                          </button>
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

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={scannerOpen}
        onClose={() => {
          setScannerOpen(false);
          if (selectedSeminarId) fetchAttendanceData(selectedSeminarId);
        }}
        selectedSeminarId={selectedSeminarId}
        onAttendanceMarked={() => {
          if (selectedSeminarId) fetchAttendanceData(selectedSeminarId);
        }}
      />
    </div>
  );
};
