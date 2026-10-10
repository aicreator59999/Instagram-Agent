import React, { useState } from 'react';
import {
  Clock,
  Play,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  RotateCw,
  Calendar,
  Lock,
} from 'lucide-react';
import { AutomationConfig, InstagramConfig } from '../types.js';

interface AutomationManagerProps {
  config: AutomationConfig;
  instagramConfig: InstagramConfig;
  onSaveConfig: (updated: AutomationConfig) => Promise<void>;
  onTriggerNow: () => Promise<void>;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AutomationManager: React.FC<AutomationManagerProps> = ({
  config,
  instagramConfig,
  onSaveConfig,
  onTriggerNow,
  onShowToast,
}) => {
  const [formData, setFormData] = useState<AutomationConfig>({ ...config });
  const [isTriggering, setIsTriggering] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveConfig(formData);
      onShowToast('Automation preferences updated!', 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Failed to save automation settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualRun = async () => {
    setIsTriggering(true);
    try {
      await onTriggerNow();
      onShowToast('Daily automation executed! Check new draft post.', 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Failed to run automation', 'error');
    } finally {
      setIsTriggering(false);
    }
  };

  const isInstagramReady = instagramConfig.isConnected || instagramConfig.testMode;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <span>Daily Automation Engine</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automatically draft Instagram content every day at your preferred peak hour
          </p>
        </div>

        {/* Quick Trigger Button */}
        <button
          onClick={handleManualRun}
          disabled={isTriggering}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-xl transition-all shadow-xs active:scale-95"
        >
          <Play className={`w-3.5 h-3.5 text-emerald-400 ${isTriggering ? 'animate-spin' : ''}`} />
          <span>{isTriggering ? 'Running Engine...' : 'Run Daily Automation Now'}</span>
        </button>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Schedule Configuration */}
        <div className="space-y-4">
          {/* Master Switch */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50">
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                Daily Post Automation
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Automatically generate a post every single day at the designated time
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.dailyAutomationEnabled}
                onChange={(e) =>
                  setFormData({ ...formData, dailyAutomationEnabled: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-900"></div>
            </label>
          </div>

          {/* Time & Timezone */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Daily Execution Time</label>
              <input
                type="time"
                value={formData.dailyPostingTime}
                onChange={(e) =>
                  setFormData({ ...formData, dailyPostingTime: e.target.value })
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Timezone</label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium"
              >
                <option value="UTC">UTC (Coordinated Universal)</option>
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
              </select>
            </div>
          </div>

          {/* Safe Approval Rule Box */}
          <div className="p-3.5 rounded-xl border border-sky-100 bg-sky-50 text-xs text-sky-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <span>Safe Human-in-the-Loop Review</span>
            </div>
            <p className="text-[11px] text-sky-800 leading-relaxed">
              By default, automated posts are saved as <strong>Drafts</strong> in your Content Calendar. You retain full control to edit captions, replace images, or approve before anything goes live.
            </p>
          </div>
        </div>

        {/* Right: Auto-Publish Safeguard Toggle */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Automatic Publishing Safeguard
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Directly publish without manual review (Advanced)
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  disabled={!isInstagramReady}
                  checked={formData.autoPublish && isInstagramReady}
                  onChange={(e) => setFormData({ ...formData, autoPublish: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600 disabled:opacity-40"></div>
              </label>
            </div>

            {!isInstagramReady && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Automatic publishing requires an active Instagram connection or Sandbox mode.
                </span>
              </div>
            )}

            {formData.autoPublish && isInstagramReady && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-[11px]">
                <div className="font-bold mb-0.5">Live Auto-Publish Warning</div>
                <span>
                  Posts generated during the daily scheduled run will be immediately dispatched to Instagram.
                </span>
              </div>
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Automation Settings'}</span>
          </button>
        </div>
      </div>

      {/* Audit Log / History */}
      <div className="space-y-2 border-t border-slate-100 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">
            Automation Activity & Audit Trail
          </span>
          <span className="text-[10px] text-slate-400">
            {formData.logs?.length || 0} recorded events
          </span>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50 max-h-48 overflow-y-auto">
          {(!formData.logs || formData.logs.length === 0) ? (
            <p className="p-4 text-center text-xs text-slate-400">No automation logs yet.</p>
          ) : (
            <div className="divide-y divide-slate-200">
              {formData.logs.map((log) => (
                <div key={log.id} className="p-2.5 text-xs flex items-start justify-between gap-3 bg-white">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          log.status === 'success'
                            ? 'bg-emerald-500'
                            : log.status === 'warning'
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                      />
                      <span className="font-bold text-slate-800">{log.action}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 ml-3.5">{log.message}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
