import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Building2,
  CheckCircle2,
  Clock,
  Hourglass
} from 'lucide-react';
import api from '../../services/api';

export const AdminAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/analytics');
      if (res.data.success) {
        setAnalytics(res.data.analytics);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return <div className="p-12 text-center text-xs text-slate-500">Loading analytics insights...</div>;
  }

  const {
    registrations_over_time = [],
    attendance_stats = { present: 0, absent: 0, waitlist: 0 },
    seminar_popularity = [],
    department_participation = [],
  } = analytics;

  const maxDaily = Math.max(...registrations_over_time.map((d: any) => parseInt(d.count, 10)), 1);
  const totalAtt = attendance_stats.present + attendance_stats.absent;
  const presentPct = totalAtt > 0 ? Math.round((attendance_stats.present / totalAtt) * 100) : 0;

  return (
    <div className="space-y-6 text-slate-900 pb-12">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Event Analytics & Intelligence
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time metrics, participation trends, and institutional turnout reports.
        </p>
      </div>

      {/* Grid: Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registrations Over Time (Last 14 Days) */}
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-slate-700" />
              <span>Registration Trend (Past 14 Days)</span>
            </h2>
            <span className="text-[11px] text-slate-500 font-mono">Daily Inflow</span>
          </div>

          <div className="h-52 flex items-end justify-between gap-1.5 pt-6 pb-2 px-2 border-b border-slate-200">
            {registrations_over_time.map((day: any, i: number) => {
              const count = parseInt(day.count, 10);
              const heightPercent = Math.max(12, Math.round((count / maxDaily) * 100));

              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-7 bg-slate-900 text-[10px] text-white px-2 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 font-mono">
                    {day.label}: {count}
                  </div>

                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full bg-slate-900 rounded-t-sm hover:bg-slate-800 transition-colors"
                  />
                  <span className="text-[9px] text-slate-500 font-mono -rotate-45 sm:rotate-0 mt-1">
                    {day.label.slice(4)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Attendance Breakdown */}
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-slate-700" />
              <span>Attendance Status Distribution</span>
            </h2>
            <span className="text-[11px] text-emerald-700 font-bold">{presentPct}% Verified Present</span>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-1">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" />
              <span className="text-2xl font-bold text-emerald-800 block">
                {attendance_stats.present}
              </span>
              <span className="text-[10px] text-emerald-800 uppercase font-semibold tracking-wider block">
                Present
              </span>
            </div>

            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-center space-y-1">
              <Clock className="w-5 h-5 text-rose-600 mx-auto" />
              <span className="text-2xl font-bold text-rose-800 block">
                {attendance_stats.absent}
              </span>
              <span className="text-[10px] text-rose-800 uppercase font-semibold tracking-wider block">
                Unmarked / Absent
              </span>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-center space-y-1">
              <Hourglass className="w-5 h-5 text-blue-600 mx-auto" />
              <span className="text-2xl font-bold text-blue-800 block">
                {attendance_stats.waitlist}
              </span>
              <span className="text-[10px] text-blue-800 uppercase font-semibold tracking-wider block">
                Waitlisted
              </span>
            </div>
          </div>

          {/* Visual Bar Breakdown */}
          <div className="pt-3 space-y-1.5">
            <span className="text-xs text-slate-500 font-medium">Turnout Ratio</span>
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${presentPct}%` }}
                className="bg-emerald-600 h-full"
                title={`Present: ${presentPct}%`}
              />
              <div
                style={{ width: `${100 - presentPct}%` }}
                className="bg-rose-500 h-full"
                title={`Absent: ${100 - presentPct}%`}
              />
            </div>
          </div>
        </div>

        {/* Seminar Popularity */}
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-slate-700" />
            <span>Top Seminars by Demand</span>
          </h2>

          <div className="space-y-3 pt-1">
            {seminar_popularity.map((sem: any) => {
              const pct = Math.min(100, Math.round((sem.registration_count / sem.capacity) * 100));
              return (
                <div key={sem.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-900 truncate max-w-xs">{sem.title}</span>
                    <span className="font-mono text-slate-500">
                      {sem.registration_count} / {sem.capacity} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full rounded-full ${
                        pct >= 100 ? 'bg-amber-500' : 'bg-slate-900'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Department Participation */}
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-700" />
            <span>Department-wise Registration Share</span>
          </h2>

          <div className="space-y-3 pt-1">
            {department_participation.map((dept: any, i: number) => {
              const maxDept = Math.max(...department_participation.map((d: any) => d.count), 1);
              const pct = Math.round((dept.count / maxDept) * 100);

              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-900">{dept.department}</span>
                    <span className="font-mono text-slate-700 font-semibold">{dept.count} Students</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-slate-900 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
