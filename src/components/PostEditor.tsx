import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Bookmark,
  CheckCircle2,
  Calendar,
  Send,
  Trash2,
  Plus,
  Video,
  Layers,
  FileText,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { Post, ReelScene, CarouselSlide, InstagramConfig } from '../types.js';

interface PostEditorProps {
  post: Post;
  onChange: (updatedPost: Post) => void;
  onRegenerateAll: () => void;
  onRegenerateCaption: () => void;
  onSaveDraft: () => void;
  onApprovePost: () => void;
  onPublishPost: () => void;
  isRegeneratingAll: boolean;
  isRegeneratingCaption: boolean;
  isPublishing: boolean;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  instagramConfig?: InstagramConfig;
  onToggleMode?: (testMode: boolean) => Promise<void>;
  onNavigateTab?: (tab: string) => void;
}

export const PostEditor: React.FC<PostEditorProps> = ({
  post,
  onChange,
  onRegenerateAll,
  onRegenerateCaption,
  onSaveDraft,
  onApprovePost,
  onPublishPost,
  isRegeneratingAll,
  isRegeneratingCaption,
  isPublishing,
  onShowToast,
  instagramConfig,
  onToggleMode,
  onNavigateTab,
}) => {
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedHashtags, setCopiedHashtags] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [showScheduleInput, setShowScheduleInput] = useState(false);

  // Copy Caption
  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(post.caption);
      setCopiedCaption(true);
      onShowToast('Caption copied to clipboard!', 'success');
      setTimeout(() => setCopiedCaption(false), 2000);
    } catch {
      onShowToast('Failed to copy caption', 'error');
    }
  };

  // Copy Hashtags
  const handleCopyHashtags = async () => {
    try {
      const tagStr = post.hashtags.join(' ');
      await navigator.clipboard.writeText(tagStr);
      setCopiedHashtags(true);
      onShowToast(`${post.hashtags.length} hashtags copied!`, 'success');
      setTimeout(() => setCopiedHashtags(false), 2000);
    } catch {
      onShowToast('Failed to copy hashtags', 'error');
    }
  };

  // Hashtag management
  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    const formatted = newTagInput.startsWith('#') ? newTagInput.trim() : `#${newTagInput.trim()}`;
    if (!post.hashtags.includes(formatted)) {
      onChange({ ...post, hashtags: [...post.hashtags, formatted] });
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange({
      ...post,
      hashtags: post.hashtags.filter((t) => t !== tagToRemove),
    });
  };

  // Carousel slide updater
  const handleUpdateSlide = (index: number, updated: Partial<CarouselSlide>) => {
    const slides = [...(post.carouselSlides || [])];
    slides[index] = { ...slides[index], ...updated };
    onChange({ ...post, carouselSlides: slides });
  };

  // Reel scene updater
  const handleUpdateScene = (index: number, updated: Partial<ReelScene>) => {
    const scenes = [...(post.reelScript || [])];
    scenes[index] = { ...scenes[index], ...updated };
    onChange({ ...post, reelScript: scenes });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Header and Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Post Editor</h2>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
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
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Fine-tune the copy, hashtags, and script before scheduling or publishing
          </p>
        </div>

        {/* Primary Action Buttons Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Generate Another Version */}
          <button
            onClick={onRegenerateAll}
            disabled={isRegeneratingAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="Generate a completely fresh version"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegeneratingAll ? 'animate-spin' : ''}`} />
            <span>Another Version</span>
          </button>

          {/* Regenerate Caption */}
          <button
            onClick={onRegenerateCaption}
            disabled={isRegeneratingCaption}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="Keep concept, regenerate caption & hook"
          >
            <Sparkles className={`w-3.5 h-3.5 text-rose-500 ${isRegeneratingCaption ? 'animate-pulse' : ''}`} />
            <span>Regen Caption</span>
          </button>

          {/* Save Draft */}
          <button
            onClick={onSaveDraft}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <Bookmark className="w-3.5 h-3.5 text-slate-500" />
            <span>Save Draft</span>
          </button>

          {/* Approve Post */}
          <button
            onClick={onApprovePost}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              post.status === 'approved'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-300" />
            <span>{post.status === 'approved' ? 'Approved' : 'Approve Post'}</span>
          </button>
        </div>
      </div>

      {/* Title & Topic Field */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700">Post Concept / Title</label>
        <input
          type="text"
          value={post.title}
          onChange={(e) => onChange({ ...post, title: e.target.value })}
          className="w-full px-3.5 py-2 text-sm font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
          placeholder="Catchy concept or title"
        />
      </div>

      {/* Caption Field */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Caption</span>
          </label>
          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-mono ${
                post.caption.length > 2200 ? 'text-rose-600 font-bold' : 'text-slate-400'
              }`}
            >
              {post.caption.length} / 2,200 chars
            </span>
            <button
              onClick={handleCopyCaption}
              className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              {copiedCaption ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Caption</span>
                </>
              )}
            </button>
          </div>
        </div>

        <textarea
          rows={7}
          value={post.caption}
          onChange={(e) => onChange({ ...post, caption: e.target.value })}
          className="w-full p-3.5 text-xs leading-relaxed font-sans rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 whitespace-pre-wrap"
          placeholder="Write your Instagram caption..."
        />
      </div>

      {/* Call To Action */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700">Call To Action (CTA)</label>
        <input
          type="text"
          value={post.callToAction}
          onChange={(e) => onChange({ ...post, callToAction: e.target.value })}
          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
          placeholder="e.g. Save this post for your next project!"
        />
      </div>

      {/* Hashtags Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700">
            Hashtags ({post.hashtags.length})
          </label>
          <button
            onClick={handleCopyHashtags}
            className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            {copiedHashtags ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy Hashtags</span>
              </>
            )}
          </button>
        </div>

        {/* Tags container */}
        <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 max-h-36 overflow-y-auto">
          {post.hashtags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-white text-slate-700 rounded-lg border border-slate-200 shadow-2xs group"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="text-slate-400 hover:text-rose-600 transition-colors"
              >
                &times;
              </button>
            </span>
          ))}

          {/* Add custom tag */}
          <div className="inline-flex items-center gap-1">
            <input
              type="text"
              placeholder="Add tag..."
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              className="px-2 py-0.5 text-[11px] rounded border border-slate-200 bg-white w-24 focus:w-32 transition-all focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="p-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Post Type Specific Editors: Reel Script */}
      {post.postType === 'reel' && post.reelScript && post.reelScript.length > 0 && (
        <div className="space-y-3 border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-purple-600" />
              <span>Reel Script & Scene Breakdown ({post.reelScript.length} Scenes)</span>
            </h4>
          </div>

          <div className="space-y-2.5">
            {post.reelScript.map((scene, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between font-semibold text-slate-700">
                  <span>Scene {scene.sceneNumber}</span>
                  <div className="flex items-center gap-1">
                    <span>Duration:</span>
                    <input
                      type="number"
                      value={scene.durationSeconds}
                      onChange={(e) =>
                        handleUpdateScene(idx, {
                          durationSeconds: parseInt(e.target.value, 10) || 1,
                        })
                      }
                      className="w-12 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-center"
                    />
                    <span>sec</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">
                      Visual Cue
                    </label>
                    <textarea
                      rows={2}
                      value={scene.visualCue}
                      onChange={(e) => handleUpdateScene(idx, { visualCue: e.target.value })}
                      className="w-full p-2 bg-white rounded border border-slate-200 text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">
                      Voiceover / Audio
                    </label>
                    <textarea
                      rows={2}
                      value={scene.voiceover}
                      onChange={(e) => handleUpdateScene(idx, { voiceover: e.target.value })}
                      className="w-full p-2 bg-white rounded border border-slate-200 text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">
                      On-Screen Text
                    </label>
                    <textarea
                      rows={2}
                      value={scene.onScreenText}
                      onChange={(e) => handleUpdateScene(idx, { onScreenText: e.target.value })}
                      className="w-full p-2 bg-white rounded border border-slate-200 text-[11px]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Post Type Specific Editors: Carousel Slides */}
      {post.postType === 'carousel' && post.carouselSlides && post.carouselSlides.length > 0 && (
        <div className="space-y-3 border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Carousel Slide Breakdown ({post.carouselSlides.length} Slides)</span>
            </h4>
          </div>

          <div className="space-y-2.5">
            {post.carouselSlides.map((slide, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between font-semibold text-slate-700">
                  <span>Slide {slide.slideNumber}</span>
                  <input
                    type="text"
                    value={slide.header}
                    onChange={(e) => handleUpdateSlide(idx, { header: e.target.value })}
                    className="flex-1 max-w-xs ml-3 px-2 py-0.5 bg-white border border-slate-200 rounded font-bold"
                    placeholder="Slide header"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">
                      Slide Body Text
                    </label>
                    <textarea
                      rows={2}
                      value={slide.body}
                      onChange={(e) => handleUpdateSlide(idx, { body: e.target.value })}
                      className="w-full p-2 bg-white rounded border border-slate-200 text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">
                      Visual Direction
                    </label>
                    <textarea
                      rows={2}
                      value={slide.visualStyle}
                      onChange={(e) => handleUpdateSlide(idx, { visualStyle: e.target.value })}
                      className="w-full p-2 bg-white rounded border border-slate-200 text-[11px]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notice / Warning Banners */}
      {!post.imageUrl && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <span>
              <strong>Image Required for Live Instagram:</strong> The official Instagram API requires an image asset to publish. Use the <em>Image Creator</em> section below to generate or upload an image.
            </span>
          </div>
        </div>
      )}

      {/* Target Destination Indicator */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-slate-500 font-medium">Publishing Target:</span>
        {instagramConfig?.testMode ? (
          <span className="flex items-center gap-1.5 font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <span>Sandbox Test Mode (Safe Simulation — Verifies Flow Inside App)</span>
          </span>
        ) : instagramConfig?.isConnected ? (
          instagramConfig?.isSimulatedToken ? (
            <span className="flex items-center gap-1.5 font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-300">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Live Mode (Demo Token: EAAB_token_... — Requires Real Token)</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Live Instagram Account (@{instagramConfig.username} — Real Post)</span>
            </span>
          )
        ) : (
          <span className="flex items-center gap-1.5 font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
            <span>Live Mode Active (Not Connected to Instagram)</span>
          </span>
        )}
      </div>

      {/* Notice if in Live Mode with Sandbox Simulation Token */}
      {!instagramConfig?.testMode && instagramConfig?.isSimulatedToken && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold flex items-center gap-1.5 text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Sandbox Demo Token Detected in Live Mode</span>
            </span>
            <span className="text-[10px] bg-amber-200/80 text-amber-900 font-mono px-2 py-0.5 rounded">
              EAAB_token_...
            </span>
          </div>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            Your connected account is using a demonstration token. Meta Graph API rejects demo tokens on live endpoints with <strong>"malformed access token"</strong>.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            {onToggleMode && (
              <button
                type="button"
                onClick={() => onToggleMode(true)}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Switch to Sandbox Test Mode (Safe)</span>
              </button>
            )}
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('instagram')}
                className="px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                <span>Connect Real Meta Token in Setup →</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Publishing & Scheduling Footer */}
      <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        {/* Schedule Date Picker */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowScheduleInput(!showScheduleInput)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              post.status === 'scheduled'
                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>
              {post.scheduledDate
                ? `Scheduled for: ${new Date(post.scheduledDate).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}`
                : 'Schedule for Later'}
            </span>
          </button>

          {showScheduleInput && (
            <input
              type="datetime-local"
              value={post.scheduledDate ? post.scheduledDate.slice(0, 16) : ''}
              onChange={(e) => {
                const dateVal = e.target.value ? new Date(e.target.value).toISOString() : null;
                onChange({
                  ...post,
                  scheduledDate: dateVal,
                  status: dateVal ? 'scheduled' : post.status,
                });
              }}
              className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white"
            />
          )}

          {post.status === 'scheduled' && post.scheduledDate && (
            <span className="text-[11px] text-slate-500">
              (Will auto-publish when time arrives)
            </span>
          )}
        </div>

        {/* Publish To Instagram button */}
        <button
          onClick={onPublishPost}
          disabled={isPublishing || post.status === 'published'}
          className={`flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl transition-all shadow-xs ${
            post.status === 'published'
              ? 'bg-emerald-600 text-white cursor-default'
              : 'bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white active:scale-95 disabled:opacity-50'
          }`}
        >
          {isPublishing ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Publishing to Instagram...</span>
            </>
          ) : post.status === 'published' ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Published to Instagram</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Publish to Instagram Now</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
