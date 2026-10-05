import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

export const CreateSeminar: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Artificial Intelligence',
    speaker: '',
    speaker_designation: '',
    speaker_image: '',
    banner_image: '',
    date: '',
    start_time: '10:00',
    end_time: '13:00',
    venue: '',
    capacity: 50,
    registration_deadline: '',
    requirements: '',
    topics: '',
    organizer_info: 'Office of Academic Affairs & Department of Computer Science',
    status: 'published',
  });

  const [submitting, setSubmitting] = useState(false);

  const categories = [
    'Artificial Intelligence',
    'Cybersecurity',
    'Cloud Computing',
    'Quantum Computing',
    'Blockchain',
    'Data Science & Analytics',
    'Software Engineering',
    'Robotics & Automation',
    'Electrical & Embedded Systems',
    'Academic Research & Writing',
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.speaker || !formData.date || !formData.venue) {
      showToast('Please fill all required seminar fields.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/seminars', {
        ...formData,
        capacity: parseInt(formData.capacity.toString(), 10),
        topics: formData.topics.split(',').map((t) => t.trim()).filter(Boolean),
        registration_deadline: formData.registration_deadline
          ? new Date(formData.registration_deadline).toISOString()
          : new Date(formData.date).toISOString(),
      });

      if (res.data.success) {
        showToast('Seminar created and published successfully!', 'success');
        navigate('/admin/seminars');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to create seminar.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-900 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <Link
            to="/admin/seminars"
            className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Seminar List
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create Academic Seminar</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Info */}
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-700" />
            <span>Seminar Details</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Seminar Title <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                name="title"
                placeholder="e.g. Next-Gen Autonomous AI Agents & Real-World Deployments"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-slate-900 text-slate-900 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-slate-900 text-slate-800 font-medium"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Publication Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-slate-900 text-slate-800 font-medium"
                >
                  <option value="published">Published (Visible to students)</option>
                  <option value="draft">Draft (Admin eyes only)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Detailed Seminar Abstract / Description <span className="text-rose-600">*</span>
              </label>
              <textarea
                required
                rows={4}
                name="description"
                placeholder="Provide a comprehensive syllabus, lecture outline, and key takeaways for students..."
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
            <span>Keynote Speaker Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Speaker Full Name <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                name="speaker"
                placeholder="e.g. Dr. Marcus Vance"
                value={formData.speaker}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-slate-900 text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Speaker Professional Designation
              </label>
              <input
                type="text"
                name="speaker_designation"
                placeholder="e.g. Chief Scientist, DeepTech Labs"
                value={formData.speaker_designation}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-slate-900 text-slate-900 font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Speaker Photo URL (Optional)
              </label>
              <input
                type="url"
                name="speaker_image"
                placeholder="https://images.unsplash.com/..."
                value={formData.speaker_image}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-slate-900 text-slate-900 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Schedule, Venue & Capacity */}
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-700" />
            <span>Schedule, Venue & Capacity</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Event Date <span className="text-rose-600">*</span>
              </label>
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
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Start Time <span className="text-rose-600">*</span>
              </label>
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
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                End Time <span className="text-rose-600">*</span>
              </label>
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
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Venue Location <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                name="venue"
                placeholder="e.g. Newton Auditorium, Block A, Joy Campus"
                value={formData.venue}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-slate-900 text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Maximum Capacity <span className="text-rose-600">*</span>
              </label>
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
                Registration Deadline (Date & Time) <span className="text-rose-600">*</span>
              </label>
              <input
                type="datetime-local"
                required
                name="registration_deadline"
                value={formData.registration_deadline}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-slate-900 text-slate-900 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Media & Metadata */}
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Image className="w-4 h-4 text-slate-700" />
            <span>Banner, Topics & Guidelines</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Banner Poster URL
              </label>
              <input
                type="url"
                name="banner_image"
                placeholder="https://images.unsplash.com/..."
                value={formData.banner_image}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-slate-900 text-slate-900 font-medium placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Topics Covered (Comma separated list)
              </label>
              <input
                type="text"
                name="topics"
                placeholder="e.g. LLM Architectures, RAG Pipelines, Fine-tuning, Agent Frameworks"
                value={formData.topics}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-slate-900 text-slate-900 font-medium placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Requirements / Prerequisites
              </label>
              <input
                type="text"
                name="requirements"
                placeholder="e.g. Basic understanding of Python and linear algebra"
                value={formData.requirements}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-slate-900 text-slate-900 font-medium placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
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
            <span>{submitting ? 'Creating Seminar...' : 'Publish Seminar'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
