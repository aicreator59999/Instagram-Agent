import React, { useState, useEffect } from 'react';
import {
  Instagram,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Key,
  ExternalLink,
  HelpCircle,
  RefreshCw,
  Copy,
  Check,
  LogOut,
  Sliders,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { InstagramConfig } from '../types.js';

interface InstagramIntegrationModalProps {
  config: InstagramConfig;
  onSaveConfig: (updated: InstagramConfig) => Promise<void>;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onRefreshSettings?: () => void;
}

export const InstagramIntegrationModal: React.FC<InstagramIntegrationModalProps> = ({
  config,
  onSaveConfig,
  onShowToast,
  onRefreshSettings,
}) => {
  const [formData, setFormData] = useState<InstagramConfig>({ ...config });
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copiedCallback, setCopiedCallback] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    setFormData({ ...config });
  }, [config]);

  // Exact callback URL based on environment
  const callbackUrl = `${window.location.origin}/auth/instagram/callback`;

  // Listen for OAuth postMessage events from the popup
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      // Validate origin if not localhost
      if (
        event.origin &&
        !event.origin.endsWith('.run.app') &&
        !event.origin.includes('localhost')
      ) {
        return;
      }

      if (event.data?.type === 'INSTAGRAM_AUTH_SUCCESS') {
        const accountData = event.data.data;
        onShowToast(
          `Connected to @${accountData.username}! Account ID (${accountData.instagramAccountId}) auto-discovered.`,
          'success'
        );

        setFormData((prev) => ({
          ...prev,
          isConnected: true,
          username: accountData.username,
          instagramAccountId: accountData.instagramAccountId,
          facebookPageId: accountData.facebookPageId,
          facebookPageName: accountData.facebookPageName,
          accountType: accountData.accountType || 'Business',
          authMethod: accountData.authMethod || 'oauth_meta_graph',
          lastTestedAt: new Date().toISOString(),
          lastTestStatus: 'success',
          lastErrorMessage: null,
        }));

        if (onRefreshSettings) {
          onRefreshSettings();
        }
      } else if (event.data?.type === 'INSTAGRAM_AUTH_ERROR') {
        onShowToast(event.data.error || 'Instagram authorization failed.', 'error');
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [onShowToast, onRefreshSettings]);

  // 1-Click Connect Button
  const handleConnectInstagram = async () => {
    setIsConnecting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/auth/instagram/url');
      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Failed to initialize authorization');
      }

      // Open OAuth URL in popup
      const popupWidth = 620;
      const popupHeight = 720;
      const left = window.screenX + (window.outerWidth - popupWidth) / 2;
      const top = window.screenY + (window.outerHeight - popupHeight) / 2;

      const popup = window.open(
        data.url,
        'instagram_oauth_popup',
        `width=${popupWidth},height=${popupHeight},left=${left},top=${top},scrollbars=yes,status=no,toolbar=no`
      );

      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        onShowToast('Please allow popups in your browser to complete authorization.', 'error');
      }
    } catch (err: any) {
      onShowToast(err.message || 'Error launching authorization flow', 'error');
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect Account
  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      const res = await fetch('/api/instagram/disconnect', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to disconnect');
      }

      setFormData((prev) => ({
        ...prev,
        isConnected: false,
        accessToken: '',
        accountType: 'Not Connected',
        lastTestedAt: undefined,
        lastTestStatus: null,
      }));

      onShowToast('Instagram account disconnected safely.', 'info');
      if (onRefreshSettings) onRefreshSettings();
    } catch (err: any) {
      onShowToast(err.message || 'Disconnect error', 'error');
    } finally {
      setIsDisconnecting(false);
    }
  };

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
          testMode: formData.authMethod === 'sandbox_oauth' || formData.testMode,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: data.message || 'Instagram publishing credentials verified successfully!',
        });
        onShowToast('Instagram connection verified!', 'success');
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Connection test failed. Re-authorization may be required.',
        });
        onShowToast(data.error || 'Test failed', 'error');
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Network error verifying connection',
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Save Meta App ID / Secret (Optional custom app settings)
  const handleSaveAdvanced = async () => {
    try {
      await onSaveConfig(formData);
      onShowToast('Meta App credentials saved securely on server!', 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Failed to save settings', 'error');
    }
  };

  const copyCallbackUrl = async () => {
    try {
      await navigator.clipboard.writeText(callbackUrl);
      setCopiedCallback(true);
      onShowToast('Callback URL copied to clipboard!', 'success');
      setTimeout(() => setCopiedCallback(false), 2000);
    } catch {
      onShowToast('Failed to copy URL', 'error');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Instagram className="w-5 h-5 text-purple-600" />
            <span>Official Instagram Authorization</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Connect via Meta OAuth. Your Instagram Professional Account ID is auto-discovered with zero guessing.
          </p>
        </div>

        {/* Status Badge */}
        <div>
          {formData.isConnected ? (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Connected (@{formData.username})</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs font-medium">
              <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>Not Connected</span>
            </span>
          )}
        </div>
      </div>

      {/* STATE 1: ALREADY CONNECTED */}
      {formData.isConnected ? (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 shrink-0">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-bold text-sm text-slate-800 uppercase">
                  {formData.username?.charAt(0) || 'I'}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">@{formData.username}</h3>
                  <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                    {formData.accountType || 'Professional'} Account
                  </span>
                </div>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Linked Facebook Page: <strong>{formData.facebookPageName || 'Creator Page'}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleTestConnection}
                disabled={isTesting}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-white text-slate-800 border border-emerald-300 hover:bg-emerald-100 rounded-xl transition-colors shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Verifying...' : 'Verify Status'}</span>
              </button>

              <button
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-white text-rose-700 border border-rose-200 hover:bg-rose-50 rounded-xl transition-colors shadow-2xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            </div>
          </div>

          {/* Auto-Discovered Account Details Box */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <span className="text-xs font-bold text-slate-800 block">
              Auto-Discovered Instagram Account Details
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Instagram Account ID
                </span>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  {formData.instagramAccountId}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                  ✓ Automatically detected via Meta API
                </span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Publishing Permissions Active
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="text-[10px] font-medium px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-100">
                    instagram_content_publish
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-100">
                    pages_show_list
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-100">
                    instagram_basic
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* STATE 2: NOT CONNECTED (BEGINNER ONBOARDING FLOW) */
        <div className="space-y-6">
          {/* Main Action Callout */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-lg">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-rose-300 text-[11px] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero Manual Setup Required for Beginners</span>
              </div>
              <h3 className="text-lg font-extrabold tracking-tight">
                Connect Your Professional Instagram Account
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Click below to open the official Meta Instagram authorization popup. Log into your account and grant access. We will <strong>automatically fetch your Instagram Account ID</strong> and store credentials securely on your server.
              </p>
            </div>

            <button
              onClick={handleConnectInstagram}
              disabled={isConnecting}
              className="w-full md:w-auto px-6 py-3.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 hover:from-rose-400 hover:to-purple-500 shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Opening Meta Authorization...</span>
                </>
              ) : (
                <>
                  <Instagram className="w-4 h-4" />
                  <span>Connect Instagram Account</span>
                </>
              )}
            </button>
          </div>

          {/* Simple 3-Step Process for Beginners */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                1
              </div>
              <h4 className="font-bold text-slate-900 text-xs">Click Connect</h4>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                A secure Meta authorization window opens. Your Instagram password is never seen or stored by this app.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                2
              </div>
              <h4 className="font-bold text-slate-900 text-xs">Authorize Permissions</h4>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Grant publishing and page access so the agent can publish your approved posts and reels.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                3
              </div>
              <h4 className="font-bold text-slate-900 text-xs">Auto-ID Discovery</h4>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                The server automatically detects your 17-digit Instagram Business/Creator Account ID and completes the setup.
              </p>
            </div>
          </div>
        </div>
      )}

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
        </div>
      )}

      {/* Advanced Section: Custom Meta Developer App (Collapsible) */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full p-4 flex items-center justify-between text-left text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-slate-500" />
            <span>Custom Meta Developer App Configuration (Advanced / Optional)</span>
          </div>
          {showAdvanced ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {showAdvanced && (
          <div className="p-4 pt-0 space-y-4 border-t border-slate-200 text-xs">
            <p className="text-slate-500 text-[11px] leading-relaxed pt-3">
              If you have created your own App in <strong>Meta for Developers (developers.facebook.com)</strong>, you can supply your App ID and App Secret here to authenticate directly through your custom registered app.
            </p>

            {/* Callback URL Box */}
            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                OAuth Valid Redirect URI (Add to your Meta App settings)
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={callbackUrl}
                  className="flex-1 font-mono text-xs bg-slate-50 p-2 rounded border border-slate-200 text-slate-800"
                />
                <button
                  onClick={copyCallbackUrl}
                  className="px-3 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 flex items-center gap-1"
                >
                  {copiedCallback ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCallback ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Meta App ID (Client ID)</label>
                <input
                  type="text"
                  value={formData.metaAppId || ''}
                  onChange={(e) => setFormData({ ...formData, metaAppId: e.target.value })}
                  placeholder="e.g. 102938475610293"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Meta App Secret (Client Secret)</label>
                <input
                  type="password"
                  value={formData.metaAppSecret || ''}
                  onChange={(e) => setFormData({ ...formData, metaAppSecret: e.target.value })}
                  placeholder="Stored server-side"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={handleSaveAdvanced}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Save Meta App Credentials
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
