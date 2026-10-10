/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Post,
  AppSettings,
  ContentSettings,
  InstagramConfig,
  AutomationConfig,
  PostStatus,
} from './types.js';
import { Navbar } from './components/Navbar.js';
import { Dashboard } from './components/Dashboard.js';
import { ContentSettingsForm } from './components/ContentSettingsForm.js';
import { PostEditor } from './components/PostEditor.js';
import { ImageCreator } from './components/ImageCreator.js';
import { InstagramPreview } from './components/InstagramPreview.js';
import { ContentCalendar } from './components/ContentCalendar.js';
import { InstagramIntegrationModal } from './components/InstagramIntegrationModal.js';
import { AutomationManager } from './components/AutomationManager.js';
import { BeginnerGuideModal } from './components/BeginnerGuideModal.js';
import { ToastContainer, ToastMessage } from './components/Toast.js';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'create' | 'calendar' | 'automation' | 'instagram'
  >('dashboard');
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Loading States
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isGeneratingPost, setIsGeneratingPost] = useState(false);
  const [isRegeneratingAll, setIsRegeneratingAll] = useState(false);
  const [isRegeneratingCaption, setIsRegeneratingCaption] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Toast Helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial Fetch: Posts and Settings
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [postsRes, settingsRes] = await Promise.all([
          fetch('/api/posts'),
          fetch('/api/settings'),
        ]);

        if (postsRes.ok) {
          const loadedPosts = await postsRes.json();
          setPosts(loadedPosts);
          if (loadedPosts.length > 0) {
            setCurrentPost(loadedPosts[0]);
          }
        }

        if (settingsRes.ok) {
          const loadedSettings = await settingsRes.json();
          setSettings(loadedSettings);
        }
      } catch (err: any) {
        console.error('Initial data load error:', err);
        showToast('Unable to reach server. Please reload.', 'error');
      } finally {
        setIsLoadingInitial(false);
      }
    }

    loadInitialData();
  }, []);

  // Update Settings
  const handleUpdateSettings = async (partialSettings: Partial<AppSettings>) => {
    if (!settings) return;
    const updated = { ...settings, ...partialSettings };
    setSettings(updated);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (!res.ok) {
        throw new Error('Failed to persist settings on server');
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating settings', 'error');
    }
  };

  // Feature 2: Generate Post with Gemini
  const handleGeneratePost = async () => {
    if (!settings) return;
    setIsGeneratingPost(true);

    try {
      const res = await fetch('/api/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: settings.contentSettings }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate post');
      }

      const newPost: Post = data.post;
      // Save newly generated post directly as draft to persistent server
      const saveRes = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost),
      });
      const saveData = await saveRes.json();
      const savedPost = saveData.post || newPost;

      setPosts((prev) => [savedPost, ...prev]);
      setCurrentPost(savedPost);
      setActiveTab('create');
      showToast('New post generated with Gemini! Review & edit below.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Generation failed', 'error');
    } finally {
      setIsGeneratingPost(false);
    }
  };

  // Feature 4: Generate another complete version
  const handleRegenerateAll = async () => {
    if (!settings) return;
    setIsRegeneratingAll(true);
    try {
      const res = await fetch('/api/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: settings.contentSettings }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate alternative');
      }

      if (currentPost) {
        const updated: Post = {
          ...currentPost,
          title: data.post.title,
          caption: data.post.caption,
          hashtags: data.post.hashtags,
          callToAction: data.post.callToAction,
          imagePrompt: data.post.imagePrompt,
          reelScript: data.post.reelScript,
          carouselSlides: data.post.carouselSlides,
          updatedAt: new Date().toISOString(),
        };
        await handleSavePost(updated);
        showToast('Generated fresh angle & concept!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Regeneration error', 'error');
    } finally {
      setIsRegeneratingAll(false);
    }
  };

  // Feature 4: Regenerate Caption Only
  const handleRegenerateCaption = async () => {
    if (!currentPost) return;
    setIsRegeneratingCaption(true);

    try {
      const res = await fetch('/api/regenerate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postTitle: currentPost.title,
          niche: currentPost.niche,
          language: currentPost.language,
          tone: currentPost.tone,
          targetAudience: currentPost.targetAudience,
          currentCaption: currentPost.caption,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to regenerate caption');
      }

      const updated: Post = {
        ...currentPost,
        caption: data.caption,
        hashtags: data.hashtags,
        callToAction: data.callToAction,
        updatedAt: new Date().toISOString(),
      };
      await handleSavePost(updated);
      showToast('Caption and hook refreshed!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Caption regeneration error', 'error');
    } finally {
      setIsRegeneratingCaption(false);
    }
  };

  // Persistent Save Post
  const handleSavePost = async (postToSave: Post) => {
    try {
      const exists = posts.some((p) => p.id === postToSave.id);
      let res;
      if (exists) {
        res = await fetch(`/api/posts/${postToSave.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postToSave),
        });
      } else {
        res = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postToSave),
        });
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save post');
      }

      const saved = data.post || postToSave;
      setCurrentPost(saved);
      setPosts((prev) => {
        const idx = prev.findIndex((p) => p.id === saved.id);
        if (idx !== -1) {
          const clone = [...prev];
          clone[idx] = saved;
          return clone;
        }
        return [saved, ...prev];
      });
      return saved;
    } catch (err: any) {
      showToast(err.message || 'Error saving post', 'error');
      throw err;
    }
  };

  // Save Draft Action
  const handleSaveDraft = async () => {
    if (!currentPost) return;
    const updated: Post = { ...currentPost, status: 'draft' };
    await handleSavePost(updated);
    showToast('Draft saved persistently!', 'success');
  };

  // Approve Post Action
  const handleApprovePost = async () => {
    if (!currentPost) return;
    const updated: Post = { ...currentPost, status: 'approved' };
    await handleSavePost(updated);
    showToast('Post approved! Ready for scheduling or publishing.', 'success');
  };

  // Update Post Status from Calendar
  const handleUpdateStatus = async (postId: string, newStatus: PostStatus) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const updated: Post = { ...post, status: newStatus };
    await handleSavePost(updated);
    showToast(`Post marked as ${newStatus}!`, 'success');
  };

  // Delete Post
  const handleDeletePost = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete post');
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      if (currentPost?.id === postId) {
        const remaining = posts.filter((p) => p.id !== postId);
        setCurrentPost(remaining[0] || null);
      }
      showToast('Post deleted', 'info');
    } catch (err: any) {
      showToast(err.message || 'Error deleting post', 'error');
    }
  };

  // Feature 6: Instagram Publishing
  const handlePublishPost = async () => {
    if (!currentPost) return;
    setIsPublishing(true);

    try {
      const res = await fetch('/api/instagram/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: currentPost.id }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.code === 'INSTAGRAM_NOT_CONNECTED') {
          showToast(data.error, 'error');
          setActiveTab('instagram');
          return;
        }
        throw new Error(data.error || 'Failed to publish to Instagram');
      }

      const updated = data.post || {
        ...currentPost,
        status: 'published',
        publishedAt: data.publishedAt,
        instagramPostId: data.instagramPostId,
      };

      setCurrentPost(updated);
      setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      showToast(data.message || 'Post published to Instagram!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Publishing error', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  // Feature 7: Trigger Daily Automation Now
  const handleTriggerAutomationNow = async () => {
    const res = await fetch('/api/automation/trigger-now', { method: 'POST' });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to trigger automation');
    }

    if (data.latestPost) {
      setPosts((prev) => [data.latestPost, ...prev]);
      setCurrentPost(data.latestPost);
    }
    if (data.settings) {
      setSettings(data.settings);
    }
  };

  if (isLoadingInitial || !settings) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600">
            Initializing Content Post Agent...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenGuide={() => setIsGuideOpen(true)}
        instagramConfig={settings.instagramConfig}
        onQuickGenerate={() => {
          setActiveTab('create');
          handleGeneratePost();
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab 1: Dashboard */}
        {activeTab === 'dashboard' && (
          <Dashboard
            posts={posts}
            selectedPost={currentPost}
            onSelectPost={(p) => setCurrentPost(p)}
            onNavigateTab={setActiveTab}
            onTriggerAutomation={handleTriggerAutomationNow}
            username={settings.instagramConfig.username || 'content_creator_hub'}
          />
        )}

        {/* Tab 2: Create Post & Editor */}
        {activeTab === 'create' && (
          <div className="space-y-6">
            {/* Strategy Form */}
            <ContentSettingsForm
              settings={settings.contentSettings}
              onChange={(updated) =>
                handleUpdateSettings({ contentSettings: updated })
              }
              onGenerate={handleGeneratePost}
              isGenerating={isGeneratingPost}
            />

            {/* Split layout: Editor on Left, Live Mockup on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Editor & Image Creator */}
              <div className="lg:col-span-7 space-y-6">
                {currentPost ? (
                  <>
                    <PostEditor
                      post={currentPost}
                      onChange={(updated) => handleSavePost(updated)}
                      onRegenerateAll={handleRegenerateAll}
                      onRegenerateCaption={handleRegenerateCaption}
                      onSaveDraft={handleSaveDraft}
                      onApprovePost={handleApprovePost}
                      onPublishPost={handlePublishPost}
                      isRegeneratingAll={isRegeneratingAll}
                      isRegeneratingCaption={isRegeneratingCaption}
                      isPublishing={isPublishing}
                      onShowToast={showToast}
                    />

                    <ImageCreator
                      imagePrompt={currentPost.imagePrompt}
                      currentImageUrl={currentPost.imageUrl}
                      postTitle={currentPost.title}
                      niche={currentPost.niche}
                      postType={currentPost.postType}
                      onUpdateImage={(url) => {
                        const updated: Post = { ...currentPost, imageUrl: url };
                        handleSavePost(updated);
                      }}
                      onShowToast={showToast}
                    />
                  </>
                ) : (
                  <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
                    <p className="text-xs text-slate-500 font-medium">
                      Configure your settings above and click "Generate Post" to start crafting!
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column: Live Instagram Mockup */}
              <div className="lg:col-span-5 sticky top-20">
                <div className="space-y-3">
                  <InstagramPreview
                    post={currentPost}
                    username={settings.instagramConfig.username || 'content_creator_hub'}
                  />
                  <p className="text-[11px] text-center text-slate-400">
                    Instant live preview reflecting your edits and visual changes
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Content Calendar */}
        {activeTab === 'calendar' && (
          <ContentCalendar
            posts={posts}
            onSelectPost={(post) => {
              setCurrentPost(post);
              setActiveTab('create');
            }}
            onUpdatePostStatus={handleUpdateStatus}
            onDeletePost={handleDeletePost}
          />
        )}

        {/* Tab 4: Daily Automation */}
        {activeTab === 'automation' && (
          <AutomationManager
            config={settings.automationConfig}
            instagramConfig={settings.instagramConfig}
            onSaveConfig={async (updated) => {
              await handleUpdateSettings({ automationConfig: updated });
            }}
            onTriggerNow={handleTriggerAutomationNow}
            onShowToast={showToast}
          />
        )}

        {/* Tab 5: Instagram Integration */}
        {activeTab === 'instagram' && (
          <InstagramIntegrationModal
            config={settings.instagramConfig}
            onSaveConfig={async (updated) => {
              await handleUpdateSettings({ instagramConfig: updated });
            }}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Content Post Agent · Instagram AI Publishing Studio</span>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Powered by Gemini 3.8 Flash</span>
            <span>·</span>
            <button
              onClick={() => setIsGuideOpen(true)}
              className="hover:text-slate-700 underline"
            >
              Beginner Guide
            </button>
          </div>
        </div>
      </footer>

      {/* Beginner Guide Modal */}
      <BeginnerGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onGoToTab={(tab) => {
          setIsGuideOpen(false);
          setActiveTab(tab);
        }}
      />
    </div>
  );
}
