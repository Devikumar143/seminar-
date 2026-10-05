import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Search,
  Edit,
  Trash2,
  Eye,
  AlertTriangle
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const AdminSeminars: React.FC = () => {
  const { showToast } = useToast();
  const [seminars, setSeminars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Deletion modal
  const [deletingSeminar, setDeletingSeminar] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchSeminars();
  }, [search, statusFilter]);

  const fetchSeminars = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      params.append('timeframe', 'all');

      const res = await api.get(`/seminars?${params.toString()}`);
      if (res.data.success) {
        setSeminars(res.data.seminars || []);
      }
    } catch (err) {
      console.error('Failed to load seminars:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (seminarId: number, newStatus: string) => {
    try {
      const res = await api.patch(`/seminars/${seminarId}/status`, { status: newStatus });
      if (res.data.success) {
        showToast(`Status updated to ${newStatus}`, 'success');
        fetchSeminars();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingSeminar) return;
    try {
      setIsDeleting(true);
      const res = await api.delete(`/seminars/${deletingSeminar.id}`);
      if (res.data.success) {
        showToast('Seminar deleted successfully.', 'info');
        setDeletingSeminar(null);
        fetchSeminars();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete seminar.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-900">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Seminar Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create, edit, publish, monitor capacity, and archive university academic seminars.
          </p>
        </div>

        <Link
          to="/admin/seminars/create"
          className="self-start sm:self-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Seminar</span>
        </Link>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search seminars..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-slate-900 text-slate-900 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-slate-900"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="closed">Registration Closed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading seminars...</div>
        ) : seminars.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No seminars match your filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Seminar</th>
                  <th className="py-3 px-4">Speaker</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Capacity / Booked</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {seminars.map((sem) => (
                  <tr key={sem.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-slate-900 truncate">{sem.title}</div>
                      <div className="text-[10px] text-slate-500 font-medium">{sem.category}</div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">{sem.speaker}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[140px]">
                        {sem.speaker_designation}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div>{new Date(sem.date).toLocaleDateString()}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {sem.start_time.slice(0, 5)} - {sem.end_time.slice(0, 5)}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">
                        {sem.registered_count} / {sem.capacity}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {sem.remaining_seats} available
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <select
                        value={sem.status}
                        onChange={(e) => handleStatusChange(sem.id, e.target.value)}
                        className={`px-2 py-1 rounded text-[11px] font-semibold border ${
                          sem.status === 'published'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : sem.status === 'completed'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : sem.status === 'closed'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <option value="published">Published</option>
                        <option value="closed">Closed</option>
                        <option value="completed">Completed</option>
                        <option value="draft">Draft</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/seminars/${sem.id}`}
                          target="_blank"
                          className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors"
                          title="Preview Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        <Link
                          to={`/admin/seminars/${sem.id}/edit`}
                          className="p-1.5 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors"
                          title="Edit Seminar"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => setDeletingSeminar(sem)}
                          className="p-1.5 text-rose-600 hover:text-rose-800 rounded-md hover:bg-rose-50 transition-colors"
                          title="Delete Seminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingSeminar && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 text-slate-900">
            <div className="text-center space-y-2">
              <div className="w-11 h-11 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Permanently Delete Seminar?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to delete <strong>"{deletingSeminar.title}"</strong>? All associated registrations, attendance logs, and digital passes will be removed.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Seminar'}
              </button>
              <button
                onClick={() => setDeletingSeminar(null)}
                className="py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-xs rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
