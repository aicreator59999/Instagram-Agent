import React from 'react';
import {
  Sparkles,
  FileEdit,
  CheckCircle2,
  Calendar,
  Send,
  PlusCircle,
  Play,
  ArrowRight,
  TrendingUp,
  Instagram,
  Clock,
} from 'lucide-react';
import { Post, PostStatus } from '../types.js';
import { InstagramPreview } from './InstagramPreview.js';

interface DashboardProps {
  posts: Post[];
  selectedPost: Post | null;
  onSelectPost: (post: Post) => void;
  onNavigateTab: (tab: 'dashboard' | 'create' | 'calendar' | 'automation' | 'instagram') => void;
  onTriggerAutomation: () => Promise<void>;
  username: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  posts,
  selectedPost,
  onSelectPost,
  onNavigateTab,
  onTriggerAutomation,
  username,
}) => {
  // Metric counts
  const totalDrafts = posts.filter((p) => p.status === 'draft').length;
  const totalApproved = posts.filter((p) => p.status === 'approved').length;
  const totalScheduled = posts.filter((p) => p.status === 'scheduled').length;
  const totalPublished = posts.filter((p) => p.status === 'published').length;

  // Find today's post (or most recently active)
  const todayPost =
    posts.find((p) => {
      const d = new Date(p.scheduledDate || p.createdAt);
      const now = new Date();
      return (
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    }) || posts[0] || null;

  const activePreviewPost = selectedPost || todayPost;

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Today's Status */}
        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Today's Post
            </span>
            <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <div className="my-2">
            <span className="text-sm font-bold text-slate-900 block truncate">
              {todayPost ? todayPost.title : 'No Post Today'}
            </span>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                todayPost?.status === 'published'
                  ? 'bg-emerald-100 text-emerald-800'
                  : todayPost?.status === 'scheduled'
                  ? 'bg-amber-100 text-amber-800'
                  : todayPost?.status === 'approved'
                  ? 'bg-sky-100 text-sky-800'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {todayPost ? todayPost.status : 'Idle'}
            </span>
          </div>
          <button
            onClick={() => onNavigateTab('create')}
            className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 mt-1"
          >
            <span>Create today's post</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Card 2: Drafts */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Drafts
            </span>
            <span className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
              <FileEdit className="w-4 h-4" />
            </span>
          </div>
          <div className="my-1.5">
            <span className="text-2xl font-extrabold text-slate-900">{totalDrafts}</span>
            <span className="text-xs text-slate-400 block">Pending review</span>
          </div>
          <span className="text-[10px] text-slate-400">Needs editing or approval</span>
        </div>

        {/* Card 3: Approved */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Approved
            </span>
            <span className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="my-1.5">
            <span className="text-2xl font-extrabold text-slate-900">{totalApproved}</span>
            <span className="text-xs text-slate-400 block">Ready to schedule</span>
          </div>
          <span className="text-[10px] text-slate-400">Content finalized</span>
        </div>

        {/* Card 4: Scheduled */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Scheduled
            </span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="my-1.5">
            <span className="text-2xl font-extrabold text-slate-900">{totalScheduled}</span>
            <span className="text-xs text-slate-400 block">In calendar queue</span>
          </div>
          <span className="text-[10px] text-slate-400">Auto or calendar timed</span>
        </div>

        {/* Card 5: Published */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Published
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Send className="w-4 h-4" />
            </span>
          </div>
          <div className="my-1.5">
            <span className="text-2xl font-extrabold text-slate-900">{totalPublished}</span>
            <span className="text-xs text-slate-400 block">Live on Instagram</span>
          </div>
          <span className="text-[10px] text-slate-400">Delivered to feed</span>
        </div>
      </div>

      {/* Main 2-Column Split: Content Feed on Left, Live Mockup on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 7 Cols */}
        <div className="lg:col-span-7 space-y-6">
          {/* Quick Action Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-rose-400" />
                <span>Ready to create your next viral Instagram post?</span>
              </h3>
              <p className="text-xs text-slate-300">
                Let Gemini draft tailored captions, hooks, and hashtags in seconds.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigateTab('create')}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-xl transition-all shadow-xs"
              >
                Create Post &rarr;
              </button>
            </div>
          </div>

          {/* Recent Content List */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Your Content Stream</h3>
                <p className="text-xs text-slate-500">
                  Click any post below to preview it on the Instagram mockup
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('calendar')}
                className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1"
              >
                <span>View Full Calendar</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {posts.slice(0, 5).map((post) => {
                const isSelected = activePreviewPost?.id === post.id;
                return (
                  <div
                    key={post.id}
                    onClick={() => onSelectPost(post)}
                    className={`p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-slate-100/90 ring-1 ring-slate-900/10'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
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
                        <span className="text-xs font-semibold text-slate-600">
                          {post.niche}
                        </span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-[11px] text-slate-400 capitalize">
                          {post.postType}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {post.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {post.caption}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPost(post);
                          onNavigateTab('create');
                        }}
                        className="px-2.5 py-1 text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition-colors shadow-2xs"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: 5 Cols (Instagram Mockup Sticky) */}
        <div className="lg:col-span-5 sticky top-20">
          <div className="space-y-3">
            <InstagramPreview post={activePreviewPost} username={username} />
            <p className="text-[11px] text-center text-slate-400">
              Interactive preview: toggle dark/light view, like posts, or expand captions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
