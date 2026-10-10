import React, { useState } from 'react';
import {
  Instagram,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Key,
  ExternalLink,
  HelpCircle,
  RefreshCw,
  Info,
  Radio,
  Lock,
} from 'lucide-react';
import { InstagramConfig } from '../types.js';

interface InstagramIntegrationModalProps {
  config: InstagramConfig;
  onSaveConfig: (updated: InstagramConfig) => Promise<void>;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const InstagramIntegrationModal: React.FC<InstagramIntegrationModalProps> = ({
  config,
  onSaveConfig,
  onShowToast,
}) => {
  const [formData, setFormData] = useState<InstagramConfig>({ ...config });
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  // Test Connection
  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/instagram/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instagramAccountId: formData.instagramAccountId,
          accessToken: formData.accessToken,
          testMode: formData.testMode,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: data.message,
        });
        setFormData((prev) => ({
          ...prev,
          isConnected: true,
          username: data.username || prev.username,
          accountType: data.mode === 'test_sandbox' ? 'Creator' : 'Business',
          lastTestedAt: new Date().toISOString(),
          lastTestStatus: 'success',
          lastErrorMessage: null,
        }));
        onShowToast('Instagram connection verified successfully!', 'success');
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Connection failed. Verify your Meta credentials.',
          details: data.hint,
        });
        setFormData((prev) => ({
          ...prev,
          isConnected: false,
          lastTestedAt: new Date().toISOString(),
          lastTestStatus: 'error',
          lastErrorMessage: data.error,
        }));
        onShowToast(data.error || 'Connection test failed', 'error');
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Network error reaching Instagram Graph API',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    try {
      await onSaveConfig(formData);
      onShowToast('Instagram settings saved securely!', 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Failed to save Instagram settings', 'error');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Instagram className="w-5 h-5 text-purple-600" />
            <span>Official Instagram Publishing Setup</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Connect your Instagram Professional Account via Meta Graph API or use Safe Sandbox Mode
          </p>
        </div>

        {/* Current status indicator */}
        <div className="flex items-center gap-2">
          {formData.isConnected ? (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Connected (@{formData.username})</span>
            </span>
          ) : formData.testMode ? (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>Sandbox Test Mode Active</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs font-medium">
              <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>Not Connected</span>
            </span>
          )}
        </div>
      </div>

      {/* Mode Toggle: Live Meta API vs Sandbox Test Mode */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
        <span className="text-xs font-bold text-slate-800 block">Choose Connection Mode</span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Option 1: Sandbox Test Mode */}
          <div
            onClick={() => setFormData({ ...formData, testMode: true })}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              formData.testMode
                ? 'bg-white border-purple-400 shadow-xs ring-1 ring-purple-400'
                : 'bg-white/60 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>Safe Sandbox Test Mode (Recommended for Beginners)</span>
              </span>
              <input
                type="radio"
                checked={formData.testMode}
                onChange={() => setFormData({ ...formData, testMode: true })}
                className="text-purple-600"
              />
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Test generating, scheduling, approving, and mock-publishing without requiring an approved Meta App or Facebook business verification.
            </p>
          </div>

          {/* Option 2: Live Meta Graph API */}
          <div
            onClick={() => setFormData({ ...formData, testMode: false })}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              !formData.testMode
                ? 'bg-white border-slate-900 shadow-xs ring-1 ring-slate-900'
                : 'bg-white/60 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-slate-700" />
                <span>Live Meta Graph API (Official Production)</span>
              </span>
              <input
                type="radio"
                checked={!formData.testMode}
                onChange={() => setFormData({ ...formData, testMode: false })}
                className="text-slate-900"
              />
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Publishes directly to your real Instagram profile via Facebook Graph API v19.0. Requires Instagram Professional Account.
            </p>
          </div>
        </div>
      </div>

      {/* Form Credentials */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Instagram Username</label>
            <div className="flex items-center">
              <span className="px-3 py-2 text-xs bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-slate-500 font-semibold">
                @
              </span>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="your_handle"
                className="w-full px-3 py-2 text-xs rounded-r-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Account Type</label>
            <select
              value={formData.accountType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  accountType: e.target.value as any,
                })
              }
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium"
            >
              <option value="Creator">Creator Account</option>
              <option value="Business">Business Account</option>
              <option value="Not Connected">Not Connected</option>
            </select>
          </div>
        </div>

        {/* Live API Fields (Disabled if in test mode) */}
        {!formData.testMode && (
          <div className="space-y-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Meta Developer Credentials (Stored Server-Side)</span>
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-semibold">
                Never sent to client
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Instagram Business/Creator Account ID
              </label>
              <input
                type="text"
                value={formData.instagramAccountId}
                onChange={(e) => setFormData({ ...formData, instagramAccountId: e.target.value })}
                placeholder="e.g. 17841400000000000"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono bg-white"
              />
              <p className="text-[11px] text-slate-400">
                Found via Graph API Explorer: <code className="bg-slate-100 px-1 rounded">me/accounts</code> &rarr; connected Instagram account ID.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Meta Page Access Token
              </label>
              <input
                type="password"
                value={formData.accessToken}
                onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                placeholder="EAAB..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono bg-white"
              />
              <p className="text-[11px] text-slate-400">
                Requires permissions: <code className="bg-slate-100 px-1 rounded">instagram_content_publish</code>, <code className="bg-slate-100 px-1 rounded">pages_show_list</code>.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Test Result Message */}
      {testResult && (
        <div
          className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
            testResult.success
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2 font-bold mb-0.5">
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{testResult.message}</span>
          </div>
          {testResult.details && <p className="mt-1 text-[11px]">{testResult.details}</p>}
        </div>
      )}

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <button
          onClick={handleTestConnection}
          disabled={isTesting}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
          <span>{isTesting ? 'Verifying...' : 'Test Connection'}</span>
        </button>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Save Settings</span>
        </button>
      </div>

      {/* Step-by-Step Beginner Setup Guide */}
      <div className="rounded-xl border border-slate-200 p-4 bg-slate-50 space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-purple-600" />
            <span>Beginner Setup Walkthrough for Live Publishing</span>
          </span>
          <a
            href="https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/content-publishing"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-purple-600 hover:underline font-semibold"
          >
            <span>Meta Docs</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <ol className="list-decimal list-inside space-y-1.5 text-slate-600 leading-relaxed text-[11px]">
          <li>
            <strong className="text-slate-800">Switch to Professional Account:</strong> In the Instagram app, go to Settings &rarr; Account Type &rarr; Switch to Professional (Creator or Business).
          </li>
          <li>
            <strong className="text-slate-800">Link Facebook Page:</strong> Link your Instagram account to a Facebook Page that you administer.
          </li>
          <li>
            <strong className="text-slate-800">Create Meta App:</strong> Go to <span className="font-mono">developers.facebook.com</span>, create a new App under "Business" type.
          </li>
          <li>
            <strong className="text-slate-800">Generate Token:</strong> In the Graph API Explorer, select your App and request scopes <code className="bg-white px-1 border rounded">instagram_content_publish</code> and <code className="bg-white px-1 border rounded">pages_show_list</code>.
          </li>
        </ol>
      </div>
    </div>
  );
};
