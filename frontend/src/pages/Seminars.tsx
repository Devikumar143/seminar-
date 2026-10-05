import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Hourglass,
  ArrowUpDown,
  Sparkles
} from 'lucide-react';
import api from '../services/api';

export const Seminars: React.FC = () => {
  const [seminars, setSeminars] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [timeframe, setTimeframe] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [selectedDate, setSelectedDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('ASC');

  useEffect(() => {
    fetchSeminars();
  }, [search, selectedCategory, timeframe, selectedDate, sortBy, sortOrder]);

  const fetchSeminars = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (timeframe !== 'all') params.append('timeframe', timeframe);
      if (selectedDate) params.append('date', selectedDate);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const res = await api.get(`/seminars?${params.toString()}`);
      if (res.data.success) {
        setSeminars(res.data.seminars || []);
        if (res.data.categories) {
          setCategories(['All', ...res.data.categories]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch seminars:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-slate-900">
      {/* Title & Tagline */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-slate-400" />
            <span>Academic Registry 2026</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
            Browse & Discover Seminars
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Register for university lectures, technical symposiums, and professional guest speakers.
          </p>
        </div>

        {/* Upcoming vs Past Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl self-start md:self-auto border border-slate-200">
          <button
            onClick={() => setTimeframe('upcoming')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              timeframe === 'upcoming'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Upcoming Seminars
          </button>
          <button
            onClick={() => setTimeframe('past')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              timeframe === 'past'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Past & Completed
          </button>
          <button
            onClick={() => setTimeframe('all')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              timeframe === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search seminars by title, speaker, venue, or topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-slate-900 text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Date Filter */}
          <div className="md:col-span-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-slate-900 text-slate-800"
            />
          </div>

          {/* Sort By */}
          <div className="md:col-span-3 flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-slate-900 text-slate-800"
            >
              <option value="date">Sort: Event Date</option>
              <option value="title">Sort: Seminar Title</option>
              <option value="capacity">Sort: Capacity</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')}
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-600 transition-colors"
              title="Toggle Ascending/Descending"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 text-xs no-scrollbar">
          <span className="text-slate-500 font-medium shrink-0 mr-1">Discipline:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Seminars Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs animate-pulse space-y-4">
              <div className="h-44 bg-slate-100 rounded-lg" />
              <div className="h-4 bg-slate-100 rounded w-1/3" />
              <div className="h-6 bg-slate-100 rounded w-3/4" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : seminars.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3 shadow-xs">
          <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Seminars Match Criteria</h3>
          <p className="text-xs text-slate-500">
            Try adjusting your search query or switching categories.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('All');
              setSelectedDate('');
              setTimeframe('upcoming');
            }}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {seminars.map((sem) => {
            const isRegistered = sem.user_registration_status === 'confirmed';
            const isWaitlisted = sem.user_waitlist_status === 'waiting';
            const isCompleted = sem.status === 'completed';
            const isFull = sem.remaining_seats <= 0;
            const capacityPct = Math.min(100, Math.round(((sem.registered_count || 0) / (sem.capacity || 1)) * 100));

            return (
              <div
                key={sem.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col group"
              >
                {/* Banner Image */}
                <div className="relative h-44 overflow-hidden bg-slate-100">
                  <img
                    src={sem.banner_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800'}
                    alt={sem.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />

                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 text-[11px] font-semibold bg-white/95 text-slate-800 border border-slate-200 rounded-md shadow-xs">
                      {sem.category}
                    </span>
                  </div>

                  {/* Status Pill */}
                  <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                    {isRegistered && (
                      <span className="px-2.5 py-1 text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md shadow-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Registered
                      </span>
                    )}

                    {isWaitlisted && !isRegistered && (
                      <span className="px-2.5 py-1 text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200 rounded-md shadow-xs flex items-center gap-1">
                        <Hourglass className="w-3 h-3" /> Waitlist #{sem.user_waitlist_position}
                      </span>
                    )}

                    {!isRegistered && !isWaitlisted && (
                      <span
                        className={`px-2.5 py-1 text-[10px] font-semibold rounded-md shadow-xs border ${
                          isCompleted
                            ? 'bg-slate-100 text-slate-700 border-slate-200'
                            : isFull
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {isCompleted
                          ? 'Event Concluded'
                          : isFull
                          ? 'Full Capacity'
                          : `${sem.remaining_seats} Seats Available`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-slate-700 transition-colors line-clamp-2 leading-snug">
                      {sem.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1.5 leading-relaxed">
                      {sem.description}
                    </p>

                    {/* Speaker */}
                    <div className="mt-3.5 flex items-center gap-3">
                      <img
                        src={sem.speaker_image || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(sem.speaker)}`}
                        alt={sem.speaker}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div className="overflow-hidden">
                        <span className="text-xs font-semibold text-slate-900 block truncate">{sem.speaker}</span>
                        <span className="text-[11px] text-slate-500 block truncate">{sem.speaker_designation}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Seat Enrollment</span>
                      <span className="font-mono text-slate-700">{capacityPct}% Booked</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${capacityPct}%` }}
                        className={`h-full rounded-full ${
                          capacityPct >= 100 ? 'bg-amber-500' : 'bg-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Date, Time, Venue metadata */}
                  <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{new Date(sem.date).toLocaleDateString()}</span>
                      <span className="text-slate-300">•</span>
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{sem.start_time.slice(0, 5)} - {sem.end_time.slice(0, 5)}</span>
                    </div>

                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{sem.venue}</span>
                    </div>
                  </div>

                  {/* Action Link */}
                  <Link
                    to={`/seminars/${sem.id}`}
                    className={`w-full py-2.5 px-4 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 text-center mt-2 shadow-xs ${
                      isRegistered
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <span>{isRegistered ? 'View Registration & Pass' : 'View Seminar Details'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
