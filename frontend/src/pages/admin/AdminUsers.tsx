import React, { useState, useEffect } from 'react';
import {
  Users,
  Search
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AdminUsers: React.FC = () => {
  const { isSuperAdmin } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (roleFilter !== 'all') params.append('role', roleFilter);
      params.append('limit', '50');

      const res = await api.get(`/admin/users?${params.toString()}`);
      if (res.data.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    if (!isSuperAdmin) {
      showToast('Only Super Administrators can modify role privileges.', 'error');
      return;
    }
    try {
      const res = await api.put(`/admin/users/${userId}/role`, { role: newRole });
      if (res.data.success) {
        showToast(res.data.message, 'success');
        fetchUsers();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update role.', 'error');
    }
  };

  return (
    <div className="space-y-6 text-slate-900 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">University User Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered students, faculty coordinators, and event administrators.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, student ID, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-slate-900 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500">Filter Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-slate-900"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="event_admin">Event Admins</option>
            <option value="super_admin">Super Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading directory...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No users match your criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Student ID / Roll</th>
                  <th className="py-3 px-4">Department & Year</th>
                  <th className="py-3 px-4">Participation</th>
                  <th className="py-3 px-4">Role Privileges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            u.profile_photo ||
                            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}`
                          }
                          alt={u.name}
                          className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{u.name}</span>
                          <span className="text-[10px] text-slate-500 block">{u.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-800 whitespace-nowrap">
                      {u.student_id || '—'}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500">
                      <div>{u.department || 'N/A'}</div>
                      <div className="text-[10px] text-slate-400">{u.year || 'N/A'}</div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-slate-900 font-semibold">{u.total_registrations || 0} Regs</span>
                      <span className="text-[10px] text-emerald-700 block font-medium">
                        {u.total_attended || 0} Attended
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {isSuperAdmin ? (
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-slate-900"
                        >
                          <option value="student">Student</option>
                          <option value="event_admin">Event Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 capitalize border border-slate-200">
                          {u.role.replace('_', ' ')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
