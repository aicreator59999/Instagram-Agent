import React from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  Instagram,
  ShieldCheck,
  Zap,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

interface BeginnerGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToTab: (tab: 'dashboard' | 'create' | 'calendar' | 'automation' | 'instagram') => void;
}

export const BeginnerGuideModal: React.FC<BeginnerGuideModalProps> = ({
  isOpen,
  onClose,
  onGoToTab,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                Beginner Guide: Content Post Agent
              </h3>
              <p className="text-xs text-slate-300">
                Simple instructions to create, schedule, and publish Instagram posts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-600 leading-relaxed">
          {/* Step 1 */}
          <div className="flex items-start gap-3.5">
            <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-xs">
              1
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 text-sm">
                Pick Your Niche, Language & Format
              </h4>
              <p>
                Head to the <strong>Create Post</strong> tab. Choose your topic (Technology, AI, Education, Motivation, Business, Art, or Custom). Choose your preferred language (English, Telugu, Hindi, or Bilingual) and tone of voice.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3.5">
            <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-xs">
              2
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 text-sm">
                Generate High-Retention Content with Gemini
              </h4>
              <p>
                Click <strong>Generate Post</strong>. Gemini will generate a punchy title, formatted caption with line breaks, 15–25 curated hashtags, and an exact visual prompt. If you chose a Reel, you get a full scene-by-scene script with visual cues and voiceovers.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3.5">
            <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-xs">
              3
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 text-sm">
                Create or Upload Visuals & Live Preview
              </h4>
              <p>
                In the <strong>Image Creator</strong>, use the <em>Instant Graphic Template</em> button or upload your own graphic. The interactive Instagram Mockup updates live so you can inspect how your caption and image will look in the actual feed!
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start gap-3.5">
            <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-xs">
              4
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 text-sm">
                Save Draft, Schedule, or Publish
              </h4>
              <p>
                Click <strong>Approve Post</strong> to move it into your calendar, or <strong>Schedule</strong> for a specific date and time.
              </p>
            </div>
          </div>

          {/* What needs external setup vs Sandbox Mode */}
          <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 space-y-2">
            <div className="flex items-center gap-2 font-bold text-purple-900 text-xs">
              <ShieldCheck className="w-4 h-4 text-purple-700" />
              <span>Which Integrations Need External Setup?</span>
            </div>
            <p className="text-purple-800 text-[11px] leading-relaxed">
              <strong>Gemini AI Generation:</strong> Already fully working on our secure server!
            </p>
            <p className="text-purple-800 text-[11px] leading-relaxed">
              <strong>Official Instagram Publishing API:</strong> By default, we have enabled <em>Safe Sandbox Test Mode</em> so you can test publishing safely without any external accounts. To publish to your <em>real live</em> Instagram account, Meta requires an approved Instagram Professional Account connected to a Facebook Page, and a Meta Developer Access Token with <code className="bg-white px-1 rounded border">instagram_content_publish</code> permission.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Need help? Jump into the generator right away!
          </span>
          <button
            onClick={() => {
              onClose();
              onGoToTab('create');
            }}
            className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs"
          >
            Start Creating Post &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
