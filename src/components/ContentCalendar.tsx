import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  List,
  Grid,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  FileText,
  Trash2,
  Edit3,
} from 'lucide-react';
import { Post, PostStatus } from '../types.js';

interface ContentCalendarProps {
  posts: Post[];
  onSelectPost: (post: Post) => void;
  onUpdatePostStatus: (postId: string, newStatus: PostStatus) => void;
  onDeletePost: (postId: string) => void;
}

export const ContentCalendar: React.FC<ContentCalendarProps> = ({
  posts,
  onSelectPost,
  onUpdatePostStatus,
  onDeletePost,
}) => {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterNiche, setFilterNiche] = useState<string>('all');

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Calendar matrix calculation
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  // Filter posts
  const filteredPosts = posts.filter((p) => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (filterNiche !== 'all' && p.niche !== filterNiche) return false;
    return true;
  });

  // Get posts for a specific day of the current month
  const getPostsForDay = (day: number) => {
    return filteredPosts.filter((p) => {
      const dateStr = p.scheduledDate || p.createdAt;
      const d = new Date(dateStr);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  };

  const niches = Array.from(new Set(posts.map((p) => p.niche)));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-rose-500" />
            <span>Content Calendar</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize drafts, approved ideas, and scheduled Instagram releases
          </p>
        </div>

        {/* View Mode & Month Navigation */}
        <div className="flex items-center gap-3">
          {/* Status Filters */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'calendar' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
              title="Timeline List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Month Stepper */}
          <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg">
            <button
              onClick={prevMonth}
              className="p-1 rounded hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-bold text-slate-800 px-2 min-w-28 text-center">
              {monthName} {year}
            </span>
            <button
              onClick={nextMonth}
              className="p-1 rounded hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 flex items-center gap-1 font-semibold">
            <Filter className="w-3 h-3" /> Filter:
          </span>

          {/* Status filter tabs */}
          {(['all', 'draft', 'approved', 'scheduled', 'published'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status === 'all'
                ? `All (${posts.length})`
                : `${status.charAt(0).toUpperCase() + status.slice(1)} (${
                    posts.filter((p) => p.status === status).length
                  })`}
            </button>
          ))}
        </div>

        {/* Niche selector */}
        {niches.length > 0 && (
          <select
            value={filterNiche}
            onChange={(e) => setFilterNiche(e.target.value)}
            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium"
          >
            <option value="all">All Topics</option>
            {niches.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* CALENDAR GRID VIEW */}
      {viewMode === 'calendar' ? (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-100/80 text-center text-[11px] font-bold text-slate-600 py-2">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-200 bg-white">
            {calendarDays.map((day, index) => {
              const dayPosts = day ? getPostsForDay(day) : [];
              const isToday =
                day &&
                day === new Date().getDate() &&
                month === new Date().getMonth() &&
                year === new Date().getFullYear();

              return (
                <div
                  key={index}
                  className={`min-h-24 p-1.5 transition-colors ${
                    day ? 'bg-white hover:bg-slate-50/80' : 'bg-slate-50/40'
                  }`}
                >
                  {day && (
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${
                          isToday
                            ? 'bg-rose-500 text-white font-bold'
                            : 'text-slate-700'
                        }`}
                      >
                        {day}
                      </span>
                      {dayPosts.length > 0 && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          {dayPosts.length} post{dayPosts.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Day Posts Pills */}
                  <div className="space-y-1">
                    {dayPosts.slice(0, 3).map((p) => (
                      <div
                        key={p.id}
                        onClick={() => onSelectPost(p)}
                        className={`p-1 rounded text-[10px] cursor-pointer font-medium truncate border transition-all hover:scale-[1.02] ${
                          p.status === 'published'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : p.status === 'scheduled'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : p.status === 'approved'
                            ? 'bg-sky-50 text-sky-800 border-sky-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                        title={p.title}
                      >
                        <span className="font-bold mr-1">
                          {p.postType === 'reel' ? '🎥' : p.postType === 'carousel' ? '📑' : '📷'}
                        </span>
                        {p.title}
                      </div>
                    ))}
                    {dayPosts.length > 3 && (
                      <div className="text-[9px] text-slate-400 font-medium text-center">
                        +{dayPosts.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* TIMELINE LIST VIEW */
        <div className="space-y-2.5">
          {filteredPosts.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-xs font-medium">No posts match the selected filter criteria.</p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-2xs bg-white transition-all gap-3"
              >
                <div
                  onClick={() => onSelectPost(post)}
                  className="flex-1 cursor-pointer min-w-0"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        post.status === 'published'
                          ? 'bg-emerald-100 text-emerald-800'
                          : post.status === 'scheduled'
                          ? 'bg-amber-100 text-amber-800'
                          : post.status === 'approved'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {post.status}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-500 font-medium">{post.niche}</span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-500 capitalize">{post.postType}</span>
                    {post.scheduledDate && (
                      <>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-amber-700 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(post.scheduledDate).toLocaleDateString()}
                        </span>
                      </>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 truncate">{post.title}</h4>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{post.caption}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {post.status === 'draft' && (
                    <button
                      onClick={() => onUpdatePostStatus(post.id, 'approved')}
                      className="px-2.5 py-1 text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors"
                      title="Approve Post"
                    >
                      Approve
                    </button>
                  )}
                  {post.status === 'approved' && (
                    <button
                      onClick={() => onUpdatePostStatus(post.id, 'scheduled')}
                      className="px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                      title="Mark as Scheduled"
                    >
                      Schedule
                    </button>
                  )}
                  <button
                    onClick={() => onSelectPost(post)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Edit in Editor"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeletePost(post.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Post"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
