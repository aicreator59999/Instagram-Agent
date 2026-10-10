import React from 'react';
import {
  Sparkles,
  LayoutDashboard,
  Calendar,
  Clock,
  Instagram,
  HelpCircle,
  PlusCircle,
  CheckCircle2,
  ShieldAlert,
  AlertCircle,
} from 'lucide-react';
import { InstagramConfig } from '../types.js';

interface NavbarProps {
  activeTab: 'dashboard' | 'create' | 'calendar' | 'automation' | 'instagram';
  onSelectTab: (tab: 'dashboard' | 'create' | 'calendar' | 'automation' | 'instagram') => void;
  onOpenGuide: () => void;
  instagramConfig: InstagramConfig;
  onQuickGenerate: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenGuide,
  instagramConfig,
  onQuickGenerate,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => onSelectTab('dashboard')}
            className="cursor-pointer flex items-center gap-2.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Instagram className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 tracking-tight text-base">
                  Content Post Agent
                </span>
                <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                  Instagram AI
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Create, Schedule & Publish Posts with Gemini
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'dashboard'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dashboard
          </button>

          <button
            onClick={() => onSelectTab('create')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'create'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            Create Post
          </button>

          <button
            onClick={() => onSelectTab('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'calendar'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Content Calendar
          </button>

          <button
            onClick={() => onSelectTab('automation')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'automation'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Daily Automation
          </button>

          <button
            onClick={() => onSelectTab('instagram')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'instagram'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Instagram className="w-3.5 h-3.5 text-purple-600" />
            Instagram Setup
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Status Indicator */}
          <button
            onClick={() => onSelectTab('instagram')}
            className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
              !instagramConfig.testMode && instagramConfig.isConnected
                ? instagramConfig.isSimulatedToken
                  ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : instagramConfig.testMode
                ? 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100'
                : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
            }`}
            title="Click to configure Instagram settings"
          >
            {!instagramConfig.testMode && instagramConfig.isConnected ? (
              instagramConfig.isSimulatedToken ? (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Live (Demo Token): @{instagramConfig.username}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Live: @{instagramConfig.username}</span>
                </>
              )
            ) : instagramConfig.testMode ? (
              <>
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                <span>Mode: Sandbox</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                <span>Mode: Live (Not Connected)</span>
              </>
            )}
          </button>

          {/* Beginner Guide */}
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70 rounded-lg transition-colors"
            title="Simple Beginner Instructions"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Beginner Guide</span>
          </button>

          {/* Quick Generate Action */}
          <button
            onClick={onQuickGenerate}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-all hover:shadow active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Generate Post</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-200 px-2 py-1.5 bg-slate-50 text-xs">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`px-2 py-1 rounded font-medium ${
            activeTab === 'dashboard' ? 'text-slate-900 bg-white font-semibold' : 'text-slate-500'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onSelectTab('create')}
          className={`px-2 py-1 rounded font-medium ${
            activeTab === 'create' ? 'text-rose-600 bg-white font-semibold' : 'text-slate-500'
          }`}
        >
          Create
        </button>
        <button
          onClick={() => onSelectTab('calendar')}
          className={`px-2 py-1 rounded font-medium ${
            activeTab === 'calendar' ? 'text-slate-900 bg-white font-semibold' : 'text-slate-500'
          }`}
        >
          Calendar
        </button>
        <button
          onClick={() => onSelectTab('automation')}
          className={`px-2 py-1 rounded font-medium ${
            activeTab === 'automation' ? 'text-slate-900 bg-white font-semibold' : 'text-slate-500'
          }`}
        >
          Automation
        </button>
        <button
          onClick={() => onSelectTab('instagram')}
          className={`px-2 py-1 rounded font-medium ${
            activeTab === 'instagram' ? 'text-purple-600 bg-white font-semibold' : 'text-slate-500'
          }`}
        >
          Instagram
        </button>
      </div>
    </header>
  );
};
