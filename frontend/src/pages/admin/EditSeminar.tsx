import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Image,
  Users,
  BookOpen,
  Save
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const EditSeminar: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    speaker: '',
    speaker_designation: '',
    speaker_image: '',
    banner_image: '',
    date: '',
    start_time: '',
    end_time: '',
    venue: '',
    capacity: 50,
    registration_deadline: '',
    requirements: '',
    topics: '',
    organizer_info: '',
    status: 'published',
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSeminar();
  }, [id]);

  const fetchSeminar = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/seminars/${id}`);
      if (res.data.success) {
        const s = res.data.seminar;
        setFormData({
          title: s.title || '',
          description: s.description || '',
          category: s.category || '',
          speaker: s.speaker || '',
          speaker_designation: s.speaker_designation || '',
          speaker_image: s.speaker_image || '',
          banner_image: s.banner_image || '',
          date: s.date ? s.date.split('T')[0] : '',
          start_time: s.start_time || '',
          end_time: s.end_time || '',
          venue: s.venue || '',
          capacity: s.capacity || 50,
          registration_deadline: s.registration_deadline
            ? new Date(s.registration_deadline).toISOString().slice(0, 16)
            : '',
          requirements: s.requirements || '',
          topics: Array.isArray(s.topics) ? s.topics.join(', ') : '',
          organizer_info: s.organizer_info || '',
          status: s.status || 'published',
        });
      }
    } catch (err) {
      console.error('Failed to load seminar for edit:', err);
      showToast('Seminar not found.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.put(`/seminars/${id}`, {
        ...formData,
        capacity: parseInt(formData.capacity.toString(), 10),
        topics: formData.topics.split(',').map((t) => t.trim()).filter(Boolean),
        registration_deadline: formData.registration_deadline
          ? new Date(formData.registration_deadline).toISOString()
          : undefined,
      });

      if (res.data.success) {
        showToast('Seminar updated successfully!', 'success');
        navigate('/admin/seminars');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update seminar.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-500">Loading seminar data...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-900 pb-12">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <Link
            to="/admin/seminars"
            className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Seminar List
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Edit Academic Seminar</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-700" />
            <span>Seminar Details</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Seminar Title
              </label>
              <input
                type="text"
                required
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-slate-900 text-slate-900 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category</label>
                <input
                  type="text"
                  required
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-slate-900 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-slate-900 text-slate-800 font-medium"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="closed">Registration Closed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description</label>
              <textarea
                required
                rows={4}
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-3.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-slate-900 text-slate-900 leading-relaxed font-medium"
              />
            </div>
          </div>
        </div>

        {/* Speaker Profile */}
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-700" />
            <span>Speaker Profile</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Speaker Name</label>
              <input
                type="text"
                required
                name="speaker"
                value={formData.speaker}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-slate-900 text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Designation</label>
              <input
                type="text"
                name="speaker_designation"
                value={formData.speaker_designation}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-slate-900 text-slate-900 font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Speaker Photo URL</label>
              <input
                type="url"
                name="speaker_image"
                value={formData.speaker_image}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-slate-900 text-slate-900 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Schedule & Capacity */}
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-700" />
            <span>Schedule, Venue & Capacity</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Event Date</label>
              <input
                type="date"
                required
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-slate-900 text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Start Time</label>
              <input
                type="time"
                required
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-slate-900 text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">End Time</label>
              <input
                type="time"
                required
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-slate-900 text-slate-900 font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Venue</label>
              <input
                type="text"
                required
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-slate-900 text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Capacity</label>
              <input
                type="number"
                min="1"
                required
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-slate-900 text-slate-900 font-medium"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Registration Deadline
              </label>
              <input
                type="datetime-local"
                name="registration_deadline"
                value={formData.registration_deadline}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-slate-900 text-slate-900 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Media */}
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Image className="w-4 h-4 text-slate-700" />
            <span>Banner & Topics</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Banner Image URL</label>
              <input
                type="url"
                name="banner_image"
                value={formData.banner_image}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-slate-900 text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Topics (Comma separated)
              </label>
              <input
                type="text"
                name="topics"
                value={formData.topics}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-slate-900 text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Requirements</label>
              <input
                type="text"
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-slate-900 text-slate-900 font-medium"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to="/admin/seminars"
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-xs rounded-lg transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? 'Saving Changes...' : 'Update Seminar'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
