import React, { useState } from 'react';
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
  HelpCircle,
  ShieldCheck,
  ExternalLink,
  X,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { Post, PostStatus, InstagramConfig } from '../types.js';
import { InstagramPreview } from './InstagramPreview.js';

interface DashboardProps {
  posts: Post[];
  selectedPost: Post | null;
  onSelectPost: (post: Post) => void;
  onNavigateTab: (tab: 'dashboard' | 'create' | 'calendar' | 'automation' | 'instagram') => void;
  onTriggerAutomation: () => Promise<void>;
  username: string;
  instagramConfig?: InstagramConfig;
  onToggleMode?: (testMode: boolean) => Promise<void>;
}

export const Dashboard: React.FC<DashboardProps> = ({
  posts,
  selectedPost,
  onSelectPost,
  onNavigateTab,
  onTriggerAutomation,
  username,
  instagramConfig,
  onToggleMode,
}) => {
  const [showPublishingExplainer, setShowPublishingExplainer] = useState(false);
  const isSandbox = instagramConfig ? instagramConfig.testMode : true;

  // Metric counts
  const totalDrafts = posts.filter((p) => p.status === 'draft').length;
  const totalApproved = posts.filter((p) => p.status === 'approved').length;
  const totalScheduled = posts.filter((p) => p.status === 'scheduled').length;

  // Separate Real Live published from Sandbox / Template test posts
  const livePublishedPosts = posts.filter(
    (p) =>
      p.status === 'published' &&
      p.instagramPostId &&
      !p.instagramPostId.startsWith('ig_test_') &&
      !p.instagramPostId.startsWith('ig_seed_')
  );

  const sandboxPublishedPosts = posts.filter(
    (p) =>
      p.status === 'published' &&
      (!p.instagramPostId ||
        p.instagramPostId.startsWith('ig_test_') ||
        p.instagramPostId.startsWith('ig_seed_'))
  );

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
      {/* Real vs Sandbox Clarity Banner */}
      <div
        className={`p-4 rounded-2xl border text-xs flex flex-wrap items-center justify-between gap-3 shadow-xs transition-colors ${
          isSandbox
            ? 'bg-purple-50/90 border-purple-200 text-purple-950'
            : instagramConfig?.isSimulatedToken
            ? 'bg-amber-50/90 border-amber-300 text-amber-950'
            : 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
        }`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`w-3 h-3 rounded-full shrink-0 ${
              isSandbox
                ? 'bg-purple-600 animate-pulse'
                : instagramConfig?.isSimulatedToken
                ? 'bg-amber-500'
                : 'bg-emerald-600'
            }`}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-xs">
                {isSandbox
                  ? 'Current Mode: Sandbox Test Mode'
                  : instagramConfig?.isSimulatedToken
                  ? 'Live Mode Active (Sandbox Demo Token)'
                  : 'Current Mode: Live Instagram Mode'}
              </span>
              <span
                className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  isSandbox
                    ? 'bg-purple-200/80 text-purple-900 border border-purple-300'
                    : instagramConfig?.isSimulatedToken
                    ? 'bg-amber-200/80 text-amber-900 border border-amber-300'
                    : 'bg-emerald-200/80 text-emerald-900 border border-emerald-300'
                }`}
              >
                {isSandbox
                  ? 'Simulation'
                  : instagramConfig?.isSimulatedToken
                  ? 'Demo Token'
                  : 'Real Publishing'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              {isSandbox
                ? 'Posts are safely simulated inside the studio. To push posts to your real Instagram feed, switch to Live Mode.'
                : instagramConfig?.isSimulatedToken
                ? `Authorized with Sandbox Demo Token (@${instagramConfig.username}). Meta's live API will reject this token with "malformed access token" — switch back to Sandbox Test Mode to test inside the app!`
                : instagramConfig?.isConnected
                ? `Connected to @${instagramConfig.username}. Posts publish directly to your live Instagram profile!`
                : 'Live mode is selected. Remember to authorize your account in Instagram Setup so posts reach your feed.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Switch Button */}
          {onToggleMode && (
            <button
              onClick={() => onToggleMode(!isSandbox)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border shadow-xs transition-all flex items-center gap-1.5 active:scale-95 ${
                isSandbox
                  ? 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'
                  : 'bg-purple-600 text-white border-purple-700 hover:bg-purple-700'
              }`}
            >
              {isSandbox ? (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>Switch to Live Mode</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Switch to Sandbox</span>
                </>
              )}
            </button>
          )}

          {/* Navigation to Instagram Setup */}
          <button
            onClick={() => onNavigateTab('instagram')}
            className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <Instagram className="w-3.5 h-3.5 text-purple-600" />
            <span>Instagram Setup &rarr;</span>
          </button>

          {/* Learn More Explainer */}
          <button
            onClick={() => setShowPublishingExplainer(true)}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 p-1.5 hover:bg-white/80 rounded-lg transition-colors"
            title="Learn how Live Publishing works"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

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
                  ? 'bg-purple-100 text-purple-800'
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

        {/* Card 5: Published (Distinguishing Live vs Sandbox) */}
        <div
          onClick={() => setShowPublishingExplainer(true)}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between cursor-pointer hover:border-purple-300 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Published
            </span>
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600 group-hover:scale-105 transition-transform">
              <Send className="w-4 h-4" />
            </span>
          </div>
          <div className="my-1.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-slate-900">{totalPublished}</span>
              <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                {livePublishedPosts.length > 0 ? `${livePublishedPosts.length} Live` : 'Sandbox'}
              </span>
            </div>
            <span className="text-xs text-slate-500 block">
              {livePublishedPosts.length > 0
                ? `${livePublishedPosts.length} Live · ${sandboxPublishedPosts.length} Sandbox`
                : 'Simulated in Sandbox'}
            </span>
          </div>
          <div className="text-[10px] text-purple-600 font-medium flex items-center gap-1 group-hover:underline">
            <span>Click to view live status</span>
            <HelpCircle className="w-3 h-3" />
          </div>
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
              {posts.slice(0, 6).map((post) => {
                const isSelected = activePreviewPost?.id === post.id;
                const isRealLive =
                  post.status === 'published' &&
                  post.instagramPostId &&
                  !post.instagramPostId.startsWith('ig_test_') &&
                  !post.instagramPostId.startsWith('ig_seed_');
                const isSandbox =
                  post.status === 'published' &&
                  (!post.instagramPostId ||
                    post.instagramPostId.startsWith('ig_test_') ||
                    post.instagramPostId.startsWith('ig_seed_'));

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
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        {isRealLive ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            Live on Instagram
                          </span>
                        ) : isSandbox ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-purple-100 text-purple-800 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                            Sandbox Test Mode
                          </span>
                        ) : (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                              post.status === 'scheduled'
                                ? 'bg-amber-100 text-amber-800'
                                : post.status === 'approved'
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {post.status}
                          </span>
                        )}

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

      {/* Explainer Modal: Real Instagram Publishing vs Sandbox */}
      {showPublishingExplainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-xl overflow-hidden flex flex-col">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300">
                  <Instagram className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Can we publish to real Instagram?</h3>
                  <p className="text-[11px] text-slate-300">
                    Understanding Live Publishing vs. Sandbox Mode
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPublishingExplainer(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-600 leading-relaxed overflow-y-auto max-h-[75vh]">
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>YES! Real Publishing is fully supported</span>
                </div>
                <p className="text-[11px]">
                  This application includes the exact official <strong>Meta Graph API</strong> endpoints (<code className="bg-white px-1 rounded">/media</code> and <code className="bg-white px-1 rounded">/media_publish</code>) used by professional scheduling tools like Buffer and Hootsuite.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1 text-xs">
                  Why are my posts not showing up on Instagram yet?
                </h4>
                <p>
                  You are currently in <strong>Sandbox Test Mode</strong>. In this mode, the app generates a simulated verification ID (<code className="bg-slate-100 px-1 rounded">ig_test_...</code>) so you can test all features (generation, editing, scheduling, approving) safely without needing to set up a Facebook Developer account first.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs">
                  Requirements from Meta to publish to your REAL account:
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600">
                  <li>
                    <strong>Instagram Professional Account:</strong> Your account must be Creator or Business (Personal accounts cannot use Meta's publishing API).
                  </li>
                  <li>
                    <strong>Connected Facebook Page:</strong> Meta requires your Instagram account to be linked to a Facebook Page you administer.
                  </li>
                  <li>
                    <strong>Live Meta Token:</strong> Connect your account in the <strong>Instagram Setup</strong> tab using the <em>Connect Instagram</em> button.
                  </li>
                  <li>
                    <strong>Image Asset Attached:</strong> Instagram strictly requires a valid image for all feed posts and carousels.
                  </li>
                </ol>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setShowPublishingExplainer(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowPublishingExplainer(false);
                  onNavigateTab('instagram');
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
              >
                <span>Go to Instagram Setup</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
