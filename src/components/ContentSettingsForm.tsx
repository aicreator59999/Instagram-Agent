import React from 'react';
import {
  Sparkles,
  Layers,
  Video,
  Image as ImageIcon,
  Clock,
  Globe,
  Smile,
  Target,
  Hash,
  Instagram,
} from 'lucide-react';
import { ContentSettings, Language, Tone, PostType, Niche } from '../types.js';

interface ContentSettingsFormProps {
  settings: ContentSettings;
  onChange: (updated: ContentSettings) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

const NICHES: Niche[] = [
  'Technology',
  'AI',
  'Education',
  'Motivation',
  'Business',
  'Art',
  'Custom',
];

const LANGUAGES: Language[] = [
  'English',
  'Telugu',
  'Hindi',
  'Bilingual (English + Telugu)',
  'Bilingual (English + Hindi)',
];

const TONES: { value: Tone; label: string; desc: string }[] = [
  { value: 'Inspirational', label: 'Inspirational', desc: 'Uplifting, high energy, motivating' },
  { value: 'Educational', label: 'Educational', desc: 'Clear frameworks, actionable tips' },
  { value: 'Friendly', label: 'Friendly', desc: 'Casual, approachable, conversational' },
  { value: 'Professional', label: 'Professional', desc: 'Authoritative, clean, structured' },
  { value: 'Funny', label: 'Funny', desc: 'Witty, relatable, humorous hooks' },
];

const POST_TYPES: { type: PostType; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    type: 'image',
    label: 'Image Post',
    desc: 'Single high-impact visual or graphic poster',
    icon: <ImageIcon className="w-4 h-4 text-rose-500" />,
  },
  {
    type: 'carousel',
    label: 'Carousel (Multi-slide)',
    desc: '4-6 step-by-step swipeable slides',
    icon: <Layers className="w-4 h-4 text-indigo-500" />,
  },
  {
    type: 'reel',
    label: 'Reel Script',
    desc: 'Timed scenes, voiceover cues & on-screen text',
    icon: <Video className="w-4 h-4 text-purple-500" />,
  },
];

const AUDIENCE_PRESETS = [
  'Tech enthusiasts, developers, and aspiring founders',
  'College students, freshers & career switchers',
  'Content creators, videographers & influencers',
  'Small business owners & local entrepreneurs',
  'Productivity seekers & everyday learners',
];

export const ContentSettingsForm: React.FC<ContentSettingsFormProps> = ({
  settings,
  onChange,
  onGenerate,
  isGenerating,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Content Strategy Settings</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure how Gemini shapes your Instagram hook, caption, and format
          </p>
        </div>

        {/* Platform Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-rose-50 to-purple-50 text-rose-700 border border-rose-100 rounded-lg text-xs font-semibold">
          <Instagram className="w-3.5 h-3.5" />
          <span>Instagram</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. Niche / Topic */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-slate-500" />
            <span>Niche / Topic</span>
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
            {NICHES.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onChange({ ...settings, niche: n })}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all text-center truncate ${
                  settings.niche === n
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          {settings.niche === 'Custom' && (
            <input
              type="text"
              placeholder="e.g. Sustainable Fashion, Coffee Brewing, Stock Trading"
              value={settings.customNiche || ''}
              onChange={(e) => onChange({ ...settings, customNiche: e.target.value })}
              className="mt-2 w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
            />
          )}
        </div>

        {/* 2. Language Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>Language</span>
          </label>
          <select
            value={settings.language}
            onChange={(e) => onChange({ ...settings, language: e.target.value as Language })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400">
            Supports native script and natural social vernacular for Telugu & Hindi.
          </p>
        </div>

        {/* 3. Post Type */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>Post Type</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {POST_TYPES.map((pt) => (
              <div
                key={pt.type}
                onClick={() => onChange({ ...settings, postType: pt.type })}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  settings.postType === pt.type
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs ring-1 ring-slate-900'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {pt.icon}
                  <span className="text-xs font-bold">{pt.label}</span>
                </div>
                <p
                  className={`text-[11px] leading-relaxed ${
                    settings.postType === pt.type ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  {pt.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Target Audience */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-slate-500" />
            <span>Target Audience</span>
          </label>
          <input
            type="text"
            value={settings.targetAudience}
            onChange={(e) => onChange({ ...settings, targetAudience: e.target.value })}
            placeholder="Who are you speaking to? e.g. College students learning python"
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
          />
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[10px] text-slate-400 font-medium py-0.5">Quick picks:</span>
            {AUDIENCE_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onChange({ ...settings, targetAudience: preset })}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              >
                {preset.split(',')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Tone */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Smile className="w-3.5 h-3.5 text-slate-500" />
            <span>Tone of Voice</span>
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {TONES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => onChange({ ...settings, tone: t.value })}
                className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all text-left ${
                  settings.tone === t.value
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="font-semibold">{t.label}</div>
                <div
                  className={`text-[10px] truncate ${
                    settings.tone === t.value ? 'text-slate-300' : 'text-slate-400'
                  }`}
                >
                  {t.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 6. Posting Frequency & Preferred Time */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Posting Frequency</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {(['Daily', '3 times a week', 'Weekdays', 'Custom'] as const).map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => onChange({ ...settings, frequency: freq })}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border text-center transition-all ${
                    settings.frequency === freq
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Preferred Time
              </label>
              <input
                type="time"
                value={settings.preferredPostingTime}
                onChange={(e) => onChange({ ...settings, preferredPostingTime: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Timezone
              </label>
              <select
                value={settings.timezone}
                onChange={(e) => onChange({ ...settings, timezone: e.target.value })}
                className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
              >
                <option value="UTC">UTC (Coordinated Universal)</option>
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Gemini will generate a post idea, caption, hashtags, CTA, and visual prompt.
        </p>
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-xl shadow-sm transition-all hover:shadow active:scale-95"
        >
          {isGenerating ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Generating with Gemini...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-rose-400" />
              <span>Generate Post</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
