import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Download,
  Upload,
  Copy,
  Check,
  RefreshCw,
  Palette,
  ExternalLink,
  Info,
} from 'lucide-react';

interface ImageCreatorProps {
  imagePrompt: string;
  currentImageUrl: string | null;
  postTitle: string;
  niche: string;
  postType: string;
  onUpdateImage: (url: string | null) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ImageCreator: React.FC<ImageCreatorProps> = ({
  imagePrompt,
  currentImageUrl,
  postTitle,
  niche,
  postType,
  onUpdateImage,
  onShowToast,
}) => {
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '4:5' | '9:16'>(
    postType === 'reel' ? '9:16' : '1:1'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [apiNotice, setApiNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Copy prompt helper
  const handleCopyPrompt = async () => {
    if (!imagePrompt) return;
    try {
      await navigator.clipboard.writeText(imagePrompt);
      setCopiedPrompt(true);
      onShowToast('Visual prompt copied to clipboard!', 'success');
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch {
      onShowToast('Failed to copy prompt', 'error');
    }
  };

  // Generate Image via Backend Gemini endpoint
  const handleGenerateAI = async () => {
    if (!imagePrompt) {
      onShowToast('Please generate post content first to get an image prompt.', 'info');
      return;
    }

    setIsGenerating(true);
    setApiNotice(null);

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          aspectRatio: aspectRatio === '4:5' ? '3:4' : aspectRatio,
        }),
      });

      const data = await res.json();
      if (data.success && data.imageUrl) {
        onUpdateImage(data.imageUrl);
        onShowToast('AI image created successfully!', 'success');
      } else {
        // Fallback notice
        setApiNotice(
          data.message ||
            'AI image generation capability not active on current tier. You can use our built-in Graphic Generator below or upload an image.'
        );
        onShowToast('Visual prompt ready. You can generate or upload a graphic.', 'info');
      }
    } catch (err: any) {
      setApiNotice(err.message || 'Image generation network error.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Local Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onShowToast('Please upload an image file (PNG, JPG, WebP)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      onUpdateImage(result);
      onShowToast('Custom image uploaded successfully!', 'success');
    };
    reader.readAsDataURL(file);
  };

  // Generate Styled Instagram Graphic on HTML Canvas
  const handleCreateGraphicTemplate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensions based on aspect ratio
    const width = 1080;
    const height = aspectRatio === '9:16' ? 1920 : aspectRatio === '4:5' ? 1350 : 1080;
    canvas.width = width;
    canvas.height = height;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    if (niche === 'AI' || niche === 'Technology') {
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.5, '#1e1b4b');
      grad.addColorStop(1, '#020617');
    } else if (niche === 'Motivation' || niche === 'Business') {
      grad.addColorStop(0, '#18181b');
      grad.addColorStop(0.7, '#27272a');
      grad.addColorStop(1, '#09090b');
    } else {
      grad.addColorStop(0, '#111827');
      grad.addColorStop(0.6, '#312e81');
      grad.addColorStop(1, '#0f172a');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Decorative geometric accents
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 2;
    ctx.strokeRect(60, 60, width - 120, height - 120);

    // Subtle corner glow
    const glow = ctx.createRadialGradient(width - 150, 150, 10, width - 150, 150, 300);
    glow.addColorStop(0, 'rgba(244, 63, 94, 0.25)');
    glow.addColorStop(1, 'rgba(244, 63, 94, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    // Niche Badge
    ctx.font = 'bold 28px sans-serif';
    ctx.fillStyle = '#f43f5e';
    ctx.fillText(niche.toUpperCase() + ' · INSTAGRAM GUIDE', 100, 150);

    // Title (multi-line word wrap)
    ctx.font = 'bold 58px sans-serif';
    ctx.fillStyle = '#ffffff';

    const words = postTitle.split(' ');
    let line = '';
    let y = height * 0.38;
    const maxWidth = width - 200;
    const lineHeight = 75;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, 100, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 100, y);

    // Bottom Branding
    ctx.font = '500 30px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('@content_creator_hub', 100, height - 140);

    ctx.font = '400 24px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Swipe & Save for later ⚡', 100, height - 100);

    const dataUrl = canvas.toDataURL('image/png');
    onUpdateImage(dataUrl);
    onShowToast('Styled Instagram Graphic generated!', 'success');
  };

  // Download Image
  const handleDownloadImage = () => {
    if (!currentImageUrl) return;
    const a = document.createElement('a');
    a.href = currentImageUrl;
    a.download = `instagram-post-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onShowToast('Image downloaded!', 'success');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
      {/* Hidden canvas for graphic generation */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Image Creation & Preview
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate AI visuals, render custom templates, or upload your own graphic
          </p>
        </div>

        {/* Aspect Ratio Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
          {(['1:1', '4:5', '9:16'] as const).map((ratio) => (
            <button
              key={ratio}
              onClick={() => setAspectRatio(ratio)}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                aspectRatio === ratio
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {ratio === '1:1' ? '1:1 Square' : ratio === '4:5' ? '4:5 Portrait' : '9:16 Reel'}
            </button>
          ))}
        </div>
      </div>

      {/* Preview Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        {/* Left: Image Canvas Preview */}
        <div className="flex flex-col items-center justify-center">
          <div
            className={`w-full max-w-sm rounded-xl overflow-hidden border border-slate-200 bg-slate-900 flex items-center justify-center relative shadow-xs transition-all ${
              aspectRatio === '9:16'
                ? 'aspect-[9/16] max-h-96'
                : aspectRatio === '4:5'
                ? 'aspect-[4/5] max-h-80'
                : 'aspect-square max-h-80'
            }`}
          >
            {currentImageUrl ? (
              <img
                src={currentImageUrl}
                alt="Post Visual"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="p-6 text-center text-slate-400 space-y-3">
                <Palette className="w-10 h-10 mx-auto text-slate-500" />
                <div>
                  <p className="text-xs font-semibold text-slate-300">No Image Set Yet</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Click Generate AI Image, Instant Graphic, or Upload Below
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Row for the Image */}
          {currentImageUrl && (
            <div className="flex items-center gap-2 mt-3 w-full max-w-sm">
              <button
                onClick={handleDownloadImage}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Image</span>
              </button>
              <button
                onClick={() => onUpdateImage(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Right: Creation Controls & Visual Prompt */}
        <div className="space-y-4">
          {/* Action Buttons */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 block">Creation Methods</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={handleGenerateAI}
                disabled={isGenerating || !imagePrompt}
                className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 disabled:opacity-50 rounded-xl shadow-xs transition-all active:scale-95"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate AI Image</span>
                  </>
                )}
              </button>

              <button
                onClick={handleCreateGraphicTemplate}
                className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-all active:scale-95"
              >
                <Palette className="w-3.5 h-3.5 text-indigo-600" />
                <span>Instant Graphic Template</span>
              </button>
            </div>

            {/* Upload File Input */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Upload Custom Image / Graphic</span>
              </button>
            </div>
          </div>

          {/* Fallback & Prompt Box */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-500" />
                <span>Optimized Visual Prompt</span>
              </span>
              <button
                onClick={handleCopyPrompt}
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                {copiedPrompt ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Prompt</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-600 font-mono bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed max-h-24 overflow-y-auto">
              {imagePrompt || 'Generate post content to create an image prompt.'}
            </p>

            {apiNotice && (
              <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded border border-amber-200 leading-relaxed">
                {apiNotice}
              </p>
            )}

            <p className="text-[11px] text-slate-400">
              💡 Tip: You can copy this prompt into Midjourney, DALL-E, or Canva, or use our Instant Graphic button above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
