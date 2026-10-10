import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Music2,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import { Post } from '../types.js';

interface InstagramPreviewProps {
  post: Post | null;
  username?: string;
}

export const InstagramPreview: React.FC<InstagramPreviewProps> = ({
  post,
  username = 'content_creator_hub',
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlayingReel, setIsPlayingReel] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  if (!post) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
        <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-300" />
        <p className="text-sm font-medium">Select or generate a post to preview on Instagram.</p>
      </div>
    );
  }

  const isReel = post.postType === 'reel';
  const isCarousel = post.postType === 'carousel' && (post.carouselSlides?.length || 0) > 0;
  const slides = post.carouselSlides || [];

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Preview Device Frame Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-100 rounded-t-2xl border-t border-x border-slate-200 text-xs text-slate-600">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span>Instagram Mockup Preview</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="text-[11px] px-2 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 transition-colors"
          >
            {darkMode ? 'Light View' : 'Dark View'}
          </button>
        </div>
      </div>

      {/* Main Instagram Post Card */}
      <div
        className={`rounded-b-2xl border shadow-sm overflow-hidden transition-colors ${
          darkMode
            ? 'bg-black text-white border-zinc-800'
            : 'bg-white text-zinc-900 border-slate-200'
        }`}
      >
        {/* Post Header */}
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600">
              <div
                className={`w-full h-full rounded-full flex items-center justify-center font-bold text-xs uppercase ${
                  darkMode ? 'bg-zinc-900 text-white' : 'bg-white text-slate-800'
                }`}
              >
                {username.charAt(0)}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold leading-none">@{username}</span>
                <CheckCircle className="w-3 h-3 text-sky-500 fill-sky-500 text-white" />
              </div>
              <p className={`text-[10px] leading-tight ${darkMode ? 'text-zinc-400' : 'text-slate-400'}`}>
                {post.niche} · Original Post
              </p>
            </div>
          </div>
          <button className={`p-1 rounded-full ${darkMode ? 'text-zinc-400' : 'text-slate-400'}`}>
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Media Container */}
        <div className="relative w-full aspect-square bg-slate-900 overflow-hidden flex items-center justify-center">
          {post.imageUrl ? (
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          ) : isCarousel && slides.length > 0 ? (
            /* Carousel Slide View */
            <div className="w-full h-full p-6 flex flex-col justify-between bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
              <div className="flex items-center justify-between text-xs text-indigo-300">
                <span className="font-semibold tracking-wider uppercase text-[10px]">
                  {post.niche} Guide
                </span>
                <span className="bg-white/10 px-2 py-0.5 rounded-full text-[10px]">
                  {currentSlide + 1} / {slides.length}
                </span>
              </div>

              <div className="my-auto space-y-3">
                <h4 className="text-lg font-bold leading-snug tracking-tight text-white">
                  {slides[currentSlide].header}
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {slides[currentSlide].body}
                </p>
              </div>

              <div className="text-[10px] text-slate-400 flex items-center justify-between border-t border-white/10 pt-2">
                <span>Swipe for more &rarr;</span>
                <span className="italic">{slides[currentSlide].visualStyle?.slice(0, 30)}</span>
              </div>

              {/* Slide Nav buttons */}
              {currentSlide > 0 && (
                <button
                  onClick={() => setCurrentSlide((s) => Math.max(0, s - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              {currentSlide < slides.length - 1 && (
                <button
                  onClick={() => setCurrentSlide((s) => Math.min(slides.length - 1, s + 1))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : isReel ? (
            /* Reel Simulation View */
            <div className="w-full h-full relative bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] text-rose-300 font-semibold">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  REEL SCRIPT
                </span>
                <span className="bg-black/40 px-2 py-0.5 rounded text-[10px]">
                  {post.reelScript?.length || 3} Scenes
                </span>
              </div>

              <div className="my-auto text-center px-4 space-y-2">
                <div className="inline-block p-2 rounded-full bg-white/10 backdrop-blur-md mb-2">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <h4 className="text-sm font-extrabold leading-snug">
                  {post.reelScript?.[0]?.onScreenText || post.title}
                </h4>
                <p className="text-[11px] text-slate-300 line-clamp-3 italic">
                  "{post.reelScript?.[0]?.voiceover || post.caption.slice(0, 100)}..."
                </p>
              </div>

              {/* Reel Controls overlay */}
              <div className="flex items-center justify-between text-[11px] text-slate-300 pt-2 border-t border-white/10">
                <button
                  onClick={() => setIsPlayingReel(!isPlayingReel)}
                  className="flex items-center gap-1.5 hover:text-white"
                >
                  {isPlayingReel ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>Scene 1 of {post.reelScript?.length || 3}</span>
                </button>
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Music2 className="w-3 h-3" />
                  <span>Original audio · @{username}</span>
                </div>
              </div>
            </div>
          ) : (
            /* Default Graphic Placeholder */
            <div className="w-full h-full p-6 flex flex-col justify-between bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 text-white">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold tracking-wider uppercase text-rose-400">
                  {post.niche}
                </span>
                <span className="text-slate-400 text-[10px]">@{username}</span>
              </div>
              <div className="my-auto space-y-2">
                <h3 className="text-base font-bold leading-snug text-white line-clamp-3">
                  {post.title}
                </h3>
                <p className="text-[11px] text-slate-300 line-clamp-2">
                  {post.callToAction}
                </p>
              </div>
              <div className="text-[10px] text-slate-400 border-t border-white/10 pt-2 flex items-center justify-between">
                <span>Save for later</span>
                <span>Double tap &hearts;</span>
              </div>
            </div>
          )}

          {/* Carousel Slide Indicators */}
          {isCarousel && slides.length > 1 && (
            <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1">
              {slides.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentSlide ? 'w-4 bg-white' : 'w-1.5 bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons Bar */}
        <div className="p-3 pb-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3.5">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`transition-transform active:scale-125 ${
                  isLiked ? 'text-rose-500 fill-rose-500' : darkMode ? 'text-white' : 'text-slate-800'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              <button className={`${darkMode ? 'text-white' : 'text-slate-800'}`}>
                <MessageCircle className="w-5 h-5" />
              </button>
              <button className={`${darkMode ? 'text-white' : 'text-slate-800'}`}>
                <Send className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={() => setIsSaved(!isSaved)}
              className={`${darkMode ? 'text-white' : 'text-slate-800'}`}
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Like Counter */}
          <p className="text-xs font-bold leading-tight mb-1">
            {isLiked ? '1,429 likes' : '1,428 likes'}
          </p>

          {/* Caption & Read More Fold */}
          <div className="text-xs leading-relaxed">
            <span className="font-bold mr-1.5">@{username}</span>
            <span className={isExpanded ? 'whitespace-pre-line' : 'line-clamp-2'}>
              {post.caption}
            </span>
            {post.caption.length > 120 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`text-[11px] ml-1 font-medium ${
                  darkMode ? 'text-zinc-400' : 'text-slate-500'
                }`}
              >
                {isExpanded ? 'less' : '...more'}
              </button>
            )}
          </div>

          {/* Hashtags display */}
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="mt-1.5 text-[11px] text-sky-600 dark:text-sky-400 leading-normal line-clamp-2">
              {post.hashtags.join(' ')}
            </div>
          )}

          {/* View comments & Timestamp */}
          <p className={`text-[10px] mt-2 mb-1 cursor-pointer ${darkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
            View all 34 comments
          </p>
          <p className={`text-[9px] uppercase tracking-wider ${darkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
            {post.publishedAt
              ? `Published · ${new Date(post.publishedAt).toLocaleDateString()}`
              : 'Draft Preview'}
          </p>
        </div>
      </div>
    </div>
  );
};
