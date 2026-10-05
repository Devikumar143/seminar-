import React, { useState } from 'react';
import {
  User,
  Lock,
  ShieldAlert,
  Save
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    department: user?.department || 'Computer Science',
    year: user?.year || '3rd Year',
    profile_photo: user?.profile_photo || '',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_new_password: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const departments = [
    'Computer Science',
    'Information Technology',
    'Data Science & AI',
    'Software Engineering',
    'Electronics & Comm.',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Biotechnology',
    'Management Studies',
  ];

  const years = [
    '1st Year',
    '2nd Year',
    '3rd Year',
    '4th Year',
    'Post-Graduate / M.Tech',
    'Doctoral / Ph.D.',
  ];

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const res = await api.put('/auth/profile', formData);
      if (res.data.success) {
        updateUser(res.data.user);
        showToast('Profile updated successfully!', 'success');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_new_password) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    if (passwordData.new_password.length < 6) {
      showToast('New password must be at least 6 characters long.', 'error');
      return;
    }

    try {
      setSavingPassword(true);
      const res = await api.put('/auth/change-password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      if (res.data.success) {
        showToast('Password changed successfully!', 'success');
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_new_password: '',
        });
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Incorrect current password.', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-900">
      {/* Top Heading */}
      <div className="border-b border-slate-200 pb-4">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Student Profile Management
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-0.5">
          Account Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Update personal information, academic department details, and login security credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & ID Card */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs text-center space-y-4">
            <div className="relative w-20 h-20 mx-auto">
              <img
                src={
                  formData.profile_photo ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`
                }
                alt={user?.name}
                className="w-20 h-20 rounded-2xl object-cover border border-slate-200 mx-auto shadow-xs"
              />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">{user?.name}</h3>
              <p className="text-xs font-mono font-semibold text-slate-700 mt-0.5">{user?.student_id}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 text-left text-xs space-y-2 text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Role:</span>
                <span className="font-semibold capitalize text-slate-800">{user?.role?.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Department:</span>
                <span className="font-semibold truncate max-w-[140px] text-right text-slate-800">{user?.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Status:</span>
                <span className="font-semibold text-emerald-700">Active Student</span>
              </div>
            </div>
          </div>

          {/* Student ID Lock Warning Notice */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Identity Verification Policy</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-800">
              Your Student ID is locked to ensure authentic certificates. To request modifications, submit an inquiry to Academic Affairs.
            </p>
          </div>
        </div>

        {/* Right Column: Edit Profile & Password Form */}
        <div className="md:col-span-2 space-y-6">
          {/* Edit Profile Form */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <User className="w-4 h-4 text-slate-700" />
              <span>Personal & Academic Details</span>
            </h2>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-slate-900 font-medium text-slate-900"
                  />
                </div>

                {/* Student ID (Locked) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    Student ID / Roll (Locked)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user?.student_id || 'N/A'}
                    className="w-full px-3.5 py-2 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed font-mono font-bold"
                  />
                </div>

                {/* College Email (Locked) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    College Email (Verified)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full px-3.5 py-2 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed font-medium"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-slate-900 font-medium text-slate-900"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-slate-900 font-medium text-slate-800"
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Academic Year
                  </label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-slate-900 font-medium text-slate-800"
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Profile Photo URL */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Profile Avatar URL (Optional Image Link)
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.profile_photo}
                    onChange={(e) => setFormData({ ...formData, profile_photo: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-slate-900 font-medium text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>{savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}</span>
              </button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-700" />
              <span>Change Security Password</span>
            </h2>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={passwordData.current_password}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, current_password: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-slate-900 font-medium text-slate-900 placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 chars"
                    value={passwordData.new_password}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, new_password: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-slate-900 font-medium text-slate-900 placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Repeat password"
                    value={passwordData.confirm_new_password}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirm_new_password: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-slate-900 font-medium text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingPassword}
                className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span>{savingPassword ? 'Updating Password...' : 'Update Password'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
