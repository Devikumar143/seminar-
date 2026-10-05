import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  FileSpreadsheet
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { PassModal } from '../../components/PassModal';

export const AdminRegistrations: React.FC = () => {
  const { showToast } = useToast();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [seminars, setSeminars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedSeminar, setSelectedSeminar] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [attendanceFilter, setAttendanceFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Pass preview modal
  const [selectedPass, setSelectedPass] = useState<any>(null);
  const [passModalOpen, setPassModalOpen] = useState(false);

  useEffect(() => {
    fetchSeminarsList();
  }, []);

  useEffect(() => {
    fetchRegistrations();
  }, [search, selectedSeminar, statusFilter, attendanceFilter, page]);

  const fetchSeminarsList = async () => {
    try {
      const res = await api.get('/seminars?timeframe=all&limit=50');
      if (res.data.success) {
        setSeminars(res.data.seminars || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedSeminar !== 'all') params.append('seminar_id', selectedSeminar);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (attendanceFilter !== 'all') params.append('attendance', attendanceFilter);
      params.append('page', page.toString());
      params.append('limit', '15');

      const res = await api.get(`/admin/registrations?${params.toString()}`);
      if (res.data.success) {
        setRegistrations(res.data.registrations || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.total || 0);
      }
    } catch (err) {
      console.error('Failed to load registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      showToast('Generating Registrations CSV Export...', 'info');
      const params = new URLSearchParams();
      if (selectedSeminar !== 'all') params.append('seminar_id', selectedSeminar);

      const res = await api.get(`/admin/export/registrations-csv?${params.toString()}`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.setAttribute('download', 'seminar_registrations.csv');
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast('CSV Export downloaded successfully!', 'success');
    } catch (err) {
      showToast('Failed to export CSV.', 'error');
    }
  };

  return (
    <div className="space-y-6 text-slate-900">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Registration Roster</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full registry of confirmed student entries, ticket passes, and check-in statuses.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="self-start sm:self-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-2"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export CSV Roster</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search student, ID, or pass..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Seminar filter */}
          <div>
            <select
              value={selectedSeminar}
              onChange={(e) => {
                setSelectedSeminar(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-slate-900"
            >
              <option value="all">All Seminars</option>
              {seminars.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          {/* Registration Status */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-slate-900"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="waitlisted">Waitlisted</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Attendance Status */}
          <div>
            <select
              value={attendanceFilter}
              onChange={(e) => {
                setAttendanceFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-slate-900"
            >
              <option value="all">All Attendance</option>
              <option value="present">Present (Checked In)</option>
              <option value="absent">Absent / Unmarked</option>
            </select>
          </div>
        </div>
      </div>

      {/* Registrations Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading registrations...</div>
        ) : registrations.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No registrations found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Pass ID</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Seminar</th>
                  <th className="py-3 px-4">Registered At</th>
                  <th className="py-3 px-4">Attendance</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {registrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                      {reg.registration_id}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{reg.student_name}</div>
                      <div className="text-[10px] text-slate-500">{reg.student_id} • {reg.email}</div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500">
                      {reg.department || 'N/A'} ({reg.year || 'N/A'})
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-900 truncate">{reg.seminar_title}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {new Date(reg.seminar_date).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500">
                      {new Date(reg.registered_at).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {reg.attendance_status === 'present' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Present ({new Date(reg.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          <Clock className="w-3 h-3 text-slate-400" />
                          Unmarked
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedPass(reg);
                          setPassModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[11px] rounded-md border border-slate-300 transition-colors shadow-xs"
                      >
                        Inspect Pass
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>Total records: {totalCount}</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 bg-white border border-slate-300 rounded-md hover:bg-slate-100 disabled:opacity-50 font-medium text-slate-700"
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 bg-white border border-slate-300 rounded-md hover:bg-slate-100 disabled:opacity-50 font-medium text-slate-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Digital Pass Modal Preview */}
      <PassModal
        isOpen={passModalOpen}
        onClose={() => setPassModalOpen(false)}
        registration={selectedPass}
      />
    </div>
  );
};
