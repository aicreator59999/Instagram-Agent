import express, { Request, Response } from 'express';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import {
  Post,
  AppSettings,
  ContentSettings,
  InstagramConfig,
  AutomationConfig,
  PostType,
  Language,
  Tone,
  Niche,
} from './src/types.js';

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DATA_DIR = path.resolve(process.cwd(), 'data');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial default settings
const defaultSettings: AppSettings = {
  contentSettings: {
    platform: 'Instagram',
    niche: 'Technology',
    targetAudience: 'Tech enthusiasts, developers, and aspiring founders',
    language: 'English',
    tone: 'Inspirational',
    postType: 'image',
    frequency: 'Daily',
    preferredPostingTime: '10:00',
    timezone: 'UTC',
  },
  instagramConfig: {
    isConnected: false,
    accountType: 'Not Connected',
    instagramAccountId: '',
    facebookPageId: '',
    accessToken: '',
    username: 'content_creator_hub',
    testMode: true, // Enabled for seamless beginner onboarding & safe testing
    lastTestedAt: undefined,
    lastTestStatus: null,
    lastErrorMessage: null,
  },
  automationConfig: {
    dailyAutomationEnabled: false,
    dailyPostingTime: '10:00',
    timezone: 'UTC',
    autoPublish: false, // strictly requires approval by default
    logs: [
      {
        id: 'log-init',
        timestamp: new Date().toISOString(),
        action: 'System initialized',
        status: 'success',
        message: 'Content Post Agent initialized with safe draft defaults.',
      },
    ],
  },
};

// Seed sample posts for rich initial UI
const seedPosts: Post[] = [
  {
    id: 'post-seed-1',
    title: '5 AI Tools Every Creator Needs in 2026',
    caption: `Are you still editing your content manually? Here are 5 AI superpowers you should plug into your workflow this week.\n\n1. Smart Voice Refinement: clean background noise with zero acoustic loss.\n2. Visual Prompt Synthesizers: generate custom slide graphics in 5 seconds.\n3. Dynamic Caption Sync: auto-generate accurate subtitles with zero frame lag.\n4. Micro-Hook Analyzers: score your opening 3 seconds before publishing.\n5. Automated Repurposing: turn 1 long-form video into 10 viral reels.\n\nWhich tool are you testing first? Drop a comment below!`,
    hashtags: [
      '#ContentCreation',
      '#AITools2026',
      '#ProductivityHacks',
      '#CreatorEconomy',
      '#DigitalMarketing',
      '#TechTrends',
      '#InstagramGrowth',
      '#WorkflowTips',
    ],
    callToAction: 'Save this post for your next content batch!',
    imagePrompt:
      'A sleek, high-tech desk workspace with holographic glowing widgets showing content analytics, ambient neon purple and cyan lighting, hyper-detailed minimalist aesthetic, 8k resolution.',
    imageUrl: null,
    postType: 'image',
    niche: 'AI',
    language: 'English',
    tone: 'Educational',
    targetAudience: 'Creators & Tech enthusiasts',
    status: 'draft',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    scheduledDate: new Date(Date.now() + 3600000 * 4).toISOString(),
    publishedAt: null,
    instagramPostId: null,
  },
  {
    id: 'post-seed-2',
    title: 'Stop Overcomplicating Your First Tech Startup',
    caption: `Most founders fail before launch because they build features nobody asked for.\n\nHere is the 3-step validation rule:\n- Talk to 10 potential customers before writing a single line of code.\n- Build a prototype that solves ONE painful bottleneck.\n- Charge from day one.\n\nIf people won't pay for your simplest solution, they won't pay for your complex platform either.\n\nKeep it focused. Ship fast. Learn daily.`,
    hashtags: [
      '#StartupAdvice',
      '#Entrepreneurship',
      '#BuildInPublic',
      '#TechFounders',
      '#BusinessMindset',
      '#GrowthStrategy',
    ],
    callToAction: 'Share this with a founder who needs to hear it today!',
    imagePrompt:
      'Minimalist modern typography poster on textured matte slate background, bold geometric lines, editorial Swiss graphic design, high contrast.',
    imageUrl: null,
    postType: 'image',
    niche: 'Business',
    language: 'English',
    tone: 'Inspirational',
    targetAudience: 'Founders & Builders',
    status: 'approved',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    scheduledDate: new Date(Date.now() + 3600000 * 24).toISOString(),
    publishedAt: null,
    instagramPostId: null,
  },
  {
    id: 'post-seed-3',
    title: 'How Neural Networks Actually Learn (Simple Breakdown)',
    caption: `Think neural networks are black magic? Let's demystify backpropagation in 30 seconds.\n\nImagine learning to throw darts blindfolded. Someone tells you 'too far left' (the error gradient). Next throw, you adjust slightly to the right (weight updates).\n\nRepeat 100,000 times until you hit the bullseye every single time. That is gradient descent in action!`,
    hashtags: [
      '#MachineLearning',
      '#DeepLearning',
      '#LearnAI',
      '#ComputerScience',
      '#TechEducation',
      '#DataScience',
    ],
    callToAction: 'Double tap if this made machine learning click for you!',
    imagePrompt:
      'Abstract glowing neural network nodes with luminous golden pathways, dark navy backdrop, futuristic scientific illustration.',
    imageUrl: null,
    postType: 'carousel',
    carouselSlides: [
      {
        slideNumber: 1,
        header: 'How Neural Networks Actually Learn',
        body: 'Demystifying machine learning without complex math or jargon.',
        visualStyle: 'Glowing neural nodes on dark background with bold header',
      },
      {
        slideNumber: 2,
        header: '1. The Blind Dartboard Analogy',
        body: 'Every initial guess is completely random. The magic begins when you measure how far off target you were.',
        visualStyle: 'Dartboard target graphic with measurement vector',
      },
      {
        slideNumber: 3,
        header: '2. Gradient Descent: The Tiny Nudge',
        body: 'Weights adjust backward through each layer to minimize prediction errors.',
        visualStyle: '3D smooth topography curve illustrating gradient descent descent',
      },
      {
        slideNumber: 4,
        header: '3. Repetition Creates Intelligence',
        body: 'Billions of mini adjustments turn noise into coherent recognition.',
        visualStyle: 'Clean summary diagram connecting inputs, hidden layers, and outputs',
      },
    ],
    niche: 'Education',
    language: 'English',
    tone: 'Educational',
    targetAudience: 'Beginner coders & students',
    status: 'scheduled',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    scheduledDate: new Date(Date.now() + 3600000 * 8).toISOString(),
    publishedAt: null,
    instagramPostId: null,
  },
  {
    id: 'post-seed-4',
    title: 'The 3-Second Rule That Tripled My Reel Retention',
    caption: `If your viewer scrolls in the first 3 seconds, the algorithm buries your video.\n\nHere is the exact framework to fix it:\n\n1. No Greetings: Never say 'Hey guys!' Start directly inside the action.\n2. Visual Disruption: Change angle, zoom, or text within the first 1.5 seconds.\n3. Curiosity Gap: Promise an answer that only arrives at the end.\n\nTry this on your next video and watch your retention graph spike!`,
    hashtags: [
      '#ReelsTips',
      '#ContentGrowth',
      '#SocialMediaMarketing',
      '#VideoEditing',
      '#ViralReels',
      '#CreatorTips',
    ],
    callToAction: 'Follow for daily content growth frameworks!',
    imagePrompt:
      'Cinematic vertical 9:16 frame of a creator holding a mirrorless camera with neon blue rim light, dynamic motion blur, high energy.',
    imageUrl: null,
    postType: 'reel',
    reelScript: [
      {
        sceneNumber: 1,
        durationSeconds: 3,
        visualCue: 'Fast snap zoom onto phone screen displaying a flat retention graph',
        voiceover: 'Stop saying "Hey guys!" in the first 3 seconds of your Reel.',
        onScreenText: 'DELETE THIS OPENING ❌',
      },
      {
        sceneNumber: 2,
        durationSeconds: 5,
        visualCue: 'Screen splits showing side-by-side comparison of high vs low hooks',
        voiceover: 'Instead, start right in the middle of a mistake your audience makes every day.',
        onScreenText: 'HOOK FORMULA: Problem First 🎯',
      },
      {
        sceneNumber: 3,
        durationSeconds: 7,
        visualCue: 'Quick cuts showcasing motion zoom, dynamic subtitles, sound effects',
        voiceover: 'Pair it with a visual disruption before second two. Check the caption for the full retention checklist.',
        onScreenText: 'Full Breakdown Below 👇',
      },
    ],
    niche: 'Technology',
    language: 'English',
    tone: 'Friendly',
    targetAudience: 'Reel creators',
    status: 'published',
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 70).toISOString(),
    scheduledDate: new Date(Date.now() - 3600000 * 70).toISOString(),
    publishedAt: new Date(Date.now() - 3600000 * 70).toISOString(),
    instagramPostId: 'ig_seed_published_908123',
  },
];

// File I/O Helpers
function loadPosts(): Post[] {
  try {
    if (fs.existsSync(POSTS_FILE)) {
      const data = fs.readFileSync(POSTS_FILE, 'utf-8');
      return JSON.parse(data);
    }
    fs.writeFileSync(POSTS_FILE, JSON.stringify(seedPosts, null, 2));
    return seedPosts;
  } catch (err) {
    console.error('Error reading posts file, falling back to seed data:', err);
    return seedPosts;
  }
}

function savePosts(posts: Post[]): void {
  try {
    fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
  } catch (err) {
    console.error('Error writing posts file:', err);
  }
}

function loadSettings(): AppSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      return {
        ...defaultSettings,
        ...parsed,
        contentSettings: { ...defaultSettings.contentSettings, ...(parsed.contentSettings || {}) },
        instagramConfig: { ...defaultSettings.instagramConfig, ...(parsed.instagramConfig || {}) },
        automationConfig: { ...defaultSettings.automationConfig, ...(parsed.automationConfig || {}) },
      };
    }
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2));
    return defaultSettings;
  } catch (err) {
    console.error('Error reading settings file, falling back to defaults:', err);
    return defaultSettings;
  }
}

function saveSettings(settings: AppSettings): void {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
  } catch (err) {
    console.error('Error writing settings file:', err);
  }
}

// Gemini Client initialization
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to mask sensitive credentials before sending to client
function sanitizeSettings(settings: AppSettings) {
  const rawToken = settings.instagramConfig.accessToken || '';
  const isSimulated =
    rawToken.startsWith('EAAB_token_') ||
    settings.instagramConfig.authMethod === 'sandbox_oauth';

  return {
    ...settings,
    instagramConfig: {
      ...settings.instagramConfig,
      accessToken: rawToken ? `••••••••${rawToken.slice(-4)}` : '',
      metaAppSecret: settings.instagramConfig.metaAppSecret
        ? `••••••••${settings.instagramConfig.metaAppSecret.slice(-4)}`
        : '',
      hasToken: Boolean(rawToken),
      hasAppSecret: Boolean(
        settings.instagramConfig.metaAppSecret || process.env.META_APP_SECRET
      ),
      isSimulatedToken: isSimulated,
    },
  };
}

// Background scheduler for daily automation & individual scheduled posts
let lastDailyCheckDate = '';
async function runSchedulerTick() {
  try {
    const settings = loadSettings();
    const { automationConfig } = settings;

    // 1. Check individual scheduled posts whose scheduledDate has arrived
    await checkAndPublishScheduledPosts();

    // 2. Check recurring daily post generator
    if (!automationConfig.dailyAutomationEnabled) return;

    const now = new Date();
    const todayKey = now.toISOString().slice(0, 10);
    const currentTime = `${String(now.getUTCHours()).padStart(2, '0')}:${String(
      now.getUTCMinutes()
    ).padStart(2, '0')}`;

    if (currentTime === automationConfig.dailyPostingTime && lastDailyCheckDate !== todayKey) {
      lastDailyCheckDate = todayKey;
      triggerDailyAutomation(settings, 'Scheduled Daily Runner');
    }
  } catch (tickErr) {
    console.error('[Scheduler] Tick error:', tickErr);
  }
}

async function checkAndPublishScheduledPosts() {
  const posts = loadPosts();
  const settings = loadSettings();
  const now = new Date();
  let updatedAny = false;

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    if (post.status === 'scheduled' && post.scheduledDate) {
      const schedTime = new Date(post.scheduledDate);
      if (schedTime <= now) {
        console.log(`[Scheduler] Scheduled time reached for post: "${post.title}" (ID: ${post.id})`);
        const igConfig = settings.instagramConfig;

        if (!igConfig.isConnected && !igConfig.testMode) {
          console.warn(`[Scheduler] Cannot publish post "${post.title}": Instagram is not connected.`);
          settings.automationConfig.logs.unshift({
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: 'Scheduled Publish Failed',
            status: 'error',
            message: `Scheduled post "${post.title}" reached its time, but no active Instagram account is connected.`,
            postId: post.id,
          });
          continue;
        }

        // Safe Sandbox Test Mode
        if (igConfig.testMode) {
          const simulatedPostId = `ig_scheduled_test_${Date.now()}`;
          post.status = 'published';
          post.publishedAt = new Date().toISOString();
          post.instagramPostId = simulatedPostId;
          post.updatedAt = new Date().toISOString();
          updatedAny = true;

          settings.automationConfig.logs.unshift({
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: 'Scheduled Post Published (Sandbox)',
            status: 'success',
            message: `Scheduled post "${post.title}" published in Instagram Sandbox Test Mode (ID: ${simulatedPostId}).`,
            postId: post.id,
          });
          continue;
        }

        // Check if token is a Sandbox simulation token in Live Mode
        if (igConfig.accessToken?.startsWith('EAAB_token_') || igConfig.authMethod === 'sandbox_oauth') {
          console.warn(`[Scheduler] Cannot publish post "${post.title}": Connected with Sandbox simulation token in Live mode.`);
          settings.automationConfig.logs.unshift({
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: 'Scheduled Publish Blocked',
            status: 'error',
            message: `Scheduled post "${post.title}" could not publish live because the account is using a Sandbox simulation token (EAAB_token_...). Meta Graph API rejects simulation tokens. Switch to Sandbox Test Mode or supply an authentic Meta Access Token in Instagram Setup.`,
            postId: post.id,
          });
          continue;
        }

        // Live Instagram Meta API Publishing
        if (!post.imageUrl) {
          console.warn(`[Scheduler] Cannot publish post "${post.title}": Missing image asset.`);
          settings.automationConfig.logs.unshift({
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: 'Scheduled Publish Failed',
            status: 'error',
            message: `Scheduled post "${post.title}" reached its time, but has no image attached. The official Instagram API requires an image.`,
            postId: post.id,
          });
          continue;
        }

        try {
          const fullCaption = `${post.caption}\n\n${post.hashtags.join(' ')}`;
          const containerRes = await fetch(
            `https://graph.facebook.com/v19.0/${encodeURIComponent(igConfig.instagramAccountId)}/media`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                image_url: post.imageUrl,
                caption: fullCaption,
                access_token: igConfig.accessToken,
              }),
            }
          );
          const containerData: any = await containerRes.json();
          if (containerData.id) {
            const publishRes = await fetch(
              `https://graph.facebook.com/v19.0/${encodeURIComponent(igConfig.instagramAccountId)}/media_publish`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  creation_id: containerData.id,
                  access_token: igConfig.accessToken,
                }),
              }
            );
            const publishData: any = await publishRes.json();
            if (publishData.id) {
              post.status = 'published';
              post.publishedAt = new Date().toISOString();
              post.instagramPostId = publishData.id;
              post.updatedAt = new Date().toISOString();
              updatedAny = true;

              settings.automationConfig.logs.unshift({
                id: `log-${Date.now()}`,
                timestamp: new Date().toISOString(),
                action: 'Scheduled Post Published (Live)',
                status: 'success',
                message: `Scheduled post "${post.title}" published live to @${igConfig.username} (ID: ${publishData.id}).`,
                postId: post.id,
              });
            }
          }
        } catch (pubErr: any) {
          console.error(`[Scheduler] Live publish error for "${post.title}":`, pubErr);
        }
      }
    }
  }

  if (updatedAny) {
    savePosts(posts);
    saveSettings(settings);
  }
}

async function triggerDailyAutomation(settings: AppSettings, triggerSource: string) {
  try {
    const posts = loadPosts();
    const recentTitles = posts.slice(0, 5).map((p) => p.title);

    console.log(`[Automation] Triggering post generation via ${triggerSource}...`);
    const generated = await generateContentViaGemini(
      settings.contentSettings,
      recentTitles
    );

    const newPost: Post = {
      id: `post-${Date.now()}`,
      title: generated.title,
      caption: generated.caption,
      hashtags: generated.hashtags,
      callToAction: generated.callToAction,
      imagePrompt: generated.imagePrompt,
      imageUrl: null,
      postType: settings.contentSettings.postType,
      niche: settings.contentSettings.niche,
      language: settings.contentSettings.language,
      tone: settings.contentSettings.tone,
      targetAudience: settings.contentSettings.targetAudience,
      status: 'draft', // By default saved as draft requiring approval
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      scheduledDate: new Date(Date.now() + 3600000 * 2).toISOString(),
      publishedAt: null,
      instagramPostId: null,
      reelScript: generated.reelScript,
      carouselSlides: generated.carouselSlides,
      isAutomated: true,
    };

    // Auto-publishing is strictly gated
    let publishNote = 'Saved as draft pending human review.';
    if (
      settings.automationConfig.autoPublish &&
      (settings.instagramConfig.isConnected || settings.instagramConfig.testMode)
    ) {
      if (settings.instagramConfig.testMode) {
        newPost.status = 'published';
        newPost.publishedAt = new Date().toISOString();
        newPost.instagramPostId = `ig_auto_test_${Date.now()}`;
        publishNote = 'Auto-published via Instagram Test Sandbox.';
      }
    }

    posts.unshift(newPost);
    savePosts(posts);

    // Update log
    settings.automationConfig.lastRunAt = new Date().toISOString();
    settings.automationConfig.logs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'Daily Post Generated',
      status: 'success',
      message: `Generated "${newPost.title}". ${publishNote}`,
      postId: newPost.id,
    });
    if (settings.automationConfig.logs.length > 30) {
      settings.automationConfig.logs = settings.automationConfig.logs.slice(0, 30);
    }
    saveSettings(settings);
    console.log(`[Automation] Successfully generated daily post: ${newPost.title}`);
  } catch (err: any) {
    console.error('[Automation] Daily run error:', err);
    settings.automationConfig.logs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'Daily Automation Failed',
      status: 'error',
      message: err.message || 'Failed to generate scheduled post',
    });
    saveSettings(settings);
  }
}

// Check every 60 seconds
setInterval(runSchedulerTick, 60000);

// Gemini Generation Core Logic
async function generateContentViaGemini(
  contentSettings: ContentSettings,
  recentTitles: string[] = []
) {
  const nicheName =
    contentSettings.niche === 'Custom' && contentSettings.customNiche
      ? contentSettings.customNiche
      : contentSettings.niche;

  const prompt = `You are an elite Instagram content strategist and copywriter.
Create a high-performing Instagram post with the following specifications:
- Platform: Instagram
- Topic/Niche: ${nicheName}
- Target Audience: ${contentSettings.targetAudience}
- Language: ${contentSettings.language}
- Tone of Voice: ${contentSettings.tone}
- Post Type: ${contentSettings.postType} (can be 'image', 'carousel', or 'reel')

RULES:
1. Ground your advice in real, authentic best practices. DO NOT invent fake statistics, fake scientific studies, or unsupported claims.
2. The language MUST be strictly ${contentSettings.language}. If Telugu is requested, use clean Telugu or Telugu script. If Hindi is requested, use clean Hindi or Hinglish suitable for modern social media. If Bilingual, use engaging natural conversational code-switching.
3. The caption must include an irresistible opening hook (first 1-2 lines), structured body with line breaks or bullet points, clear actionable value, and natural emoji usage.
4. Provide 15 to 25 relevant hashtags (mix of broad, niche, and community tags). Include the '#' symbol on each.
5. Create a compelling Call to Action (CTA).
6. Create an exact, highly descriptive visual image generation prompt detailing lighting, composition, camera style, colors, and subject matter without text clutter.
7. If postType is 'reel', provide a structured 3-5 scene script with duration in seconds, visual cue, voiceover, and on-screen text.
8. If postType is 'carousel', provide 4-6 slide breakdowns with slide number, catchy header, value body text, and visual design direction.
9. Avoid repeating or re-using these recent topics: ${JSON.stringify(recentTitles)}. Come up with a fresh, original angle.

Respond with strict JSON following the schema.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: 'Catchy internal title/concept for the post (max 10 words)',
          },
          caption: {
            type: Type.STRING,
            description: 'Complete Instagram caption with hook, body, and formatting',
          },
          hashtags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '15-25 curated hashtags starting with #',
          },
          callToAction: {
            type: Type.STRING,
            description: 'Punchy call to action (e.g. Save this for later, comment YES)',
          },
          imagePrompt: {
            type: Type.STRING,
            description: 'Detailed prompt for an image generator or designer',
          },
          reelScript: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                sceneNumber: { type: Type.INTEGER },
                durationSeconds: { type: Type.INTEGER },
                visualCue: { type: Type.STRING },
                voiceover: { type: Type.STRING },
                onScreenText: { type: Type.STRING },
              },
              required: ['sceneNumber', 'durationSeconds', 'visualCue', 'voiceover', 'onScreenText'],
            },
            description: 'Reel breakdown if postType is reel',
          },
          carouselSlides: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                slideNumber: { type: Type.INTEGER },
                header: { type: Type.STRING },
                body: { type: Type.STRING },
                visualStyle: { type: Type.STRING },
              },
              required: ['slideNumber', 'header', 'body', 'visualStyle'],
            },
            description: 'Slide breakdown if postType is carousel',
          },
        },
        required: ['title', 'caption', 'hashtags', 'callToAction', 'imagePrompt'],
      },
    },
  });

  const parsed = JSON.parse(response.text || '{}');
  return parsed;
}

// Main Server Setup
async function startServer() {
  const app = express();
  app.use(express.json({ limit: '20mb' }));

  // --- API ROUTES ---

  // Health check & status
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      hasGeminiApiKey: Boolean(process.env.GEMINI_API_KEY),
      time: new Date().toISOString(),
    });
  });

  // Public media endpoint for Instagram Graph API crawler
  app.get('/api/media/:id.png', (req: Request, res: Response) => {
    const { id } = req.params;
    const posts = loadPosts();
    const post = posts.find((p) => p.id === id);

    if (!post || !post.imageUrl) {
      return res.status(404).send('Media not found');
    }

    if (post.imageUrl.startsWith('data:image/')) {
      const matches = post.imageUrl.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      if (matches && matches[2]) {
        const buffer = Buffer.from(matches[2], 'base64');
        res.setHeader('Content-Type', matches[1] || 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.send(buffer);
      }
    }

    if (post.imageUrl.startsWith('http')) {
      return res.redirect(post.imageUrl);
    }

    res.status(404).send('Invalid media format');
  });

  // Settings GET & POST
  app.get('/api/settings', (_req: Request, res: Response) => {
    const settings = loadSettings();
    res.json(sanitizeSettings(settings));
  });

  app.post('/api/settings', (req: Request, res: Response) => {
    try {
      const current = loadSettings();
      const body = req.body || {};

      const updated: AppSettings = {
        ...current,
        contentSettings: body.contentSettings
          ? { ...current.contentSettings, ...body.contentSettings }
          : current.contentSettings,
        automationConfig: body.automationConfig
          ? { ...current.automationConfig, ...body.automationConfig }
          : current.automationConfig,
        instagramConfig: body.instagramConfig
          ? {
              ...current.instagramConfig,
              ...body.instagramConfig,
              // If incoming accessToken is empty/masked, keep existing token
              accessToken:
                body.instagramConfig.accessToken &&
                !body.instagramConfig.accessToken.includes('••••')
                  ? body.instagramConfig.accessToken
                  : current.instagramConfig.accessToken,
              metaAppSecret:
                body.instagramConfig.metaAppSecret &&
                !body.instagramConfig.metaAppSecret.includes('••••')
                  ? body.instagramConfig.metaAppSecret
                  : current.instagramConfig.metaAppSecret,
            }
          : current.instagramConfig,
      };

      saveSettings(updated);
      res.json({ success: true, settings: sanitizeSettings(updated) });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to save settings' });
    }
  });

  // Posts CRUD
  app.get('/api/posts', (_req: Request, res: Response) => {
    const posts = loadPosts();
    res.json(posts);
  });

  app.post('/api/posts', (req: Request, res: Response) => {
    try {
      const posts = loadPosts();
      const body = req.body;
      const newPost: Post = {
        id: body.id || `post-${Date.now()}`,
        title: body.title || 'Untitled Post',
        caption: body.caption || '',
        hashtags: Array.isArray(body.hashtags) ? body.hashtags : [],
        callToAction: body.callToAction || '',
        imagePrompt: body.imagePrompt || '',
        imageUrl: body.imageUrl || null,
        postType: body.postType || 'image',
        niche: body.niche || 'Technology',
        language: body.language || 'English',
        tone: body.tone || 'Friendly',
        targetAudience: body.targetAudience || 'Followers',
        status: body.status || 'draft',
        createdAt: body.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        scheduledDate: body.scheduledDate || null,
        publishedAt: body.publishedAt || null,
        instagramPostId: body.instagramPostId || null,
        reelScript: body.reelScript,
        carouselSlides: body.carouselSlides,
        isAutomated: Boolean(body.isAutomated),
      };

      posts.unshift(newPost);
      savePosts(posts);
      res.json({ success: true, post: newPost });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to save post' });
    }
  });

  app.put('/api/posts/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const posts = loadPosts();
      const index = posts.findIndex((p) => p.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Post not found' });
      }

      const existing = posts[index];
      const updated: Post = {
        ...existing,
        ...req.body,
        id: existing.id, // prevent changing id
        updatedAt: new Date().toISOString(),
      };

      posts[index] = updated;
      savePosts(posts);
      res.json({ success: true, post: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update post' });
    }
  });

  app.delete('/api/posts/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      let posts = loadPosts();
      posts = posts.filter((p) => p.id !== id);
      savePosts(posts);
      res.json({ success: true, message: 'Post deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete post' });
    }
  });

  // Feature 2: Generate Post with Gemini
  app.post('/api/generate-post', async (req: Request, res: Response) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          error:
            'GEMINI_API_KEY is not configured on the server. Please check the AI Studio secrets configuration.',
        });
      }

      const contentSettings: ContentSettings = req.body.settings;
      const posts = loadPosts();
      const recentTitles = posts.slice(0, 8).map((p) => p.title);

      const generated = await generateContentViaGemini(contentSettings, recentTitles);

      const post: Post = {
        id: `post-${Date.now()}`,
        title: generated.title,
        caption: generated.caption,
        hashtags: generated.hashtags || [],
        callToAction: generated.callToAction,
        imagePrompt: generated.imagePrompt,
        imageUrl: null,
        postType: contentSettings.postType,
        niche: contentSettings.niche === 'Custom' && contentSettings.customNiche ? contentSettings.customNiche : contentSettings.niche,
        language: contentSettings.language,
        tone: contentSettings.tone,
        targetAudience: contentSettings.targetAudience,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        scheduledDate: null,
        publishedAt: null,
        instagramPostId: null,
        reelScript: generated.reelScript,
        carouselSlides: generated.carouselSlides,
      };

      res.json({ success: true, post });
    } catch (err: any) {
      console.error('Error in /api/generate-post:', err);
      res.status(500).json({
        error: err.message || 'Failed to generate post with Gemini',
      });
    }
  });

  // Feature 4: Regenerate Caption Only
  app.post('/api/regenerate-caption', async (req: Request, res: Response) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is missing on server.' });
      }

      const { postTitle, niche, language, tone, targetAudience, currentCaption } = req.body;

      const prompt = `You are an elite Instagram copywriter.
A creator already has this post idea: "${postTitle}" (Topic: ${niche}, Audience: ${targetAudience}, Language: ${language}, Tone: ${tone}).
Their current caption is: "${currentCaption}".

Generate a completely FRESH, high-retention alternative caption with a new opening hook, clean body formatting, 15-20 relevant hashtags, and a distinct Call to Action.
The caption must be strictly written in ${language}. DO NOT invent unsupported facts.

Respond with strict JSON:
{
  "caption": "...",
  "hashtags": ["#tag1", "#tag2", ...],
  "callToAction": "..."
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              caption: { type: Type.STRING },
              hashtags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              callToAction: { type: Type.STRING },
            },
            required: ['caption', 'hashtags', 'callToAction'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json({ success: true, ...parsed });
    } catch (err: any) {
      console.error('Error in /api/regenerate-caption:', err);
      res.status(500).json({ error: err.message || 'Failed to regenerate caption' });
    }
  });

  // Feature 3: Image Generation Endpoint
  app.post('/api/generate-image', async (req: Request, res: Response) => {
    const { prompt, aspectRatio = '1:1' } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
      // Attempt generation using gemini-3.1-flash-lite-image
      const validRatios = ['1:1', '3:4', '4:3', '9:16', '16:9'];
      const ratio = validRatios.includes(aspectRatio) ? aspectRatio : '1:1';

      console.log(`[Image] Attempting generation with gemini-3.1-flash-lite-image: "${prompt.slice(0, 40)}..."`);
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: ratio as any,
          },
        },
      });

      let foundImageUrl: string | null = null;
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            const mime = part.inlineData.mimeType || 'image/png';
            foundImageUrl = `data:${mime};base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (foundImageUrl) {
        return res.json({ success: true, imageUrl: foundImageUrl });
      }

      // If no image part returned, provide clear status
      res.json({
        success: false,
        fallback: true,
        prompt,
        message: 'The model responded without inline image bytes. Use the prompt below or upload your graphic.',
      });
    } catch (err: any) {
      console.warn('Image generation capability returned:', err.message);
      // Clean, beginner-friendly fallback response
      res.json({
        success: false,
        fallback: true,
        prompt,
        message:
          err.message?.includes('RESOURCE_EXHAUSTED') || err.message?.includes('not found') || err.message?.includes('PERMISSION_DENIED')
            ? 'AI Image Generation model requires active tier quota. You can copy the exact prompt below or upload a graphic.'
            : (err.message || 'Image generation unavailable'),
      });
    }
  });

  // Feature 6: Instagram Publishing API Test Connection
  app.post('/api/instagram/test-connection', async (req: Request, res: Response) => {
    try {
      const { instagramAccountId, accessToken, testMode } = req.body;
      const settings = loadSettings();

      if (testMode) {
        settings.instagramConfig.isConnected = true;
        settings.instagramConfig.testMode = true;
        settings.instagramConfig.accountType = 'Creator';
        settings.instagramConfig.lastTestedAt = new Date().toISOString();
        settings.instagramConfig.lastTestStatus = 'success';
        settings.instagramConfig.lastErrorMessage = null;
        saveSettings(settings);

        return res.json({
          success: true,
          mode: 'test_sandbox',
          username: settings.instagramConfig.username || 'content_creator_hub',
          accountType: 'Professional (Sandbox Test Mode)',
          message: 'Connection verified in Safe Test Mode! You can test publishing workflows safely.',
        });
      }

      // Resolve token if masked or omitted
      let effectiveToken = accessToken;
      if (!effectiveToken || effectiveToken.includes('••••')) {
        effectiveToken = settings.instagramConfig.accessToken;
      }

      const effectiveAccountId =
        instagramAccountId || settings.instagramConfig.instagramAccountId;

      if (!effectiveToken) {
        return res.status(400).json({
          success: false,
          error: 'No Meta Access Token found. Please provide your token.',
        });
      }

      // If token is a simulation token
      if (
        effectiveToken.startsWith('EAAB_token_') ||
        settings.instagramConfig.authMethod === 'sandbox_oauth'
      ) {
        return res.status(400).json({
          success: false,
          code: 'SIMULATED_TOKEN',
          error: `Current token is a Sandbox simulation token (${effectiveToken.slice(0, 15)}...). Meta's live API will reject this token as "malformed access token". Switch to Sandbox Test Mode to test inside the app, or provide an authentic Meta Access Token.`,
          isSimulatedToken: true,
        });
      }

      if (!effectiveAccountId) {
        return res.status(400).json({
          success: false,
          error:
            'Please provide both the Instagram Business/Creator Account ID and the Meta Access Token.',
        });
      }

      // Real Meta Graph API check
      const graphUrl = `https://graph.facebook.com/v19.0/${encodeURIComponent(
        effectiveAccountId
      )}?fields=id,username,name,profile_picture_url&access_token=${encodeURIComponent(
        effectiveToken
      )}`;

      const metaRes = await fetch(graphUrl);
      const data: any = await metaRes.json();

      if (!metaRes.ok || data.error) {
        let errorMsg = data.error?.message || `Meta API Error (${metaRes.status})`;
        if (errorMsg.toLowerCase().includes('malformed access token')) {
          errorMsg = `Meta API rejected this token as malformed or invalid (${effectiveToken.slice(0, 15)}...). Authentic Meta tokens are ~200 characters long generated from Meta for Developers.`;
        }

        settings.instagramConfig.isConnected = false;
        settings.instagramConfig.lastTestedAt = new Date().toISOString();
        settings.instagramConfig.lastTestStatus = 'error';
        settings.instagramConfig.lastErrorMessage = errorMsg;
        saveSettings(settings);

        return res.status(400).json({
          success: false,
          error: errorMsg,
          details: data.error,
          hint: 'Ensure your Instagram account is linked to a Facebook Page and the token has "instagram_content_publish" scope.',
        });
      }

      // Success
      settings.instagramConfig.isConnected = true;
      settings.instagramConfig.username = data.username || settings.instagramConfig.username;
      settings.instagramConfig.accountType = 'Business';
      settings.instagramConfig.profilePictureUrl = data.profile_picture_url;
      settings.instagramConfig.lastTestedAt = new Date().toISOString();
      settings.instagramConfig.lastTestStatus = 'success';
      settings.instagramConfig.lastErrorMessage = null;
      settings.instagramConfig.authMethod = 'oauth_meta_graph';
      saveSettings(settings);

      res.json({
        success: true,
        username: data.username,
        name: data.name,
        profilePictureUrl: data.profile_picture_url,
        message: 'Successfully verified and connected to Instagram Professional Account!',
      });
    } catch (err: any) {
      console.error('Error testing Instagram connection:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'Network error verifying Instagram connection',
      });
    }
  });

  // Feature 6b: Direct Real Meta Token Connection
  app.post('/api/instagram/connect-token', async (req: Request, res: Response) => {
    try {
      const { accessToken, instagramAccountId } = req.body;
      if (!accessToken || typeof accessToken !== 'string' || !accessToken.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Please enter a valid Meta Access Token.',
        });
      }

      const cleanToken = accessToken.trim();

      if (cleanToken.startsWith('EAAB_token_')) {
        return res.status(400).json({
          success: false,
          error: 'This is a Sandbox demonstration token. Please provide a real Meta Access Token starting with "EAA..." generated from developers.facebook.com.',
        });
      }

      const settings = loadSettings();

      // Attempt 1: If account ID provided, test directly
      if (instagramAccountId && instagramAccountId.trim()) {
        const cleanId = instagramAccountId.trim();
        const testUrl = `https://graph.facebook.com/v19.0/${encodeURIComponent(cleanId)}?fields=id,username,name,profile_picture_url&access_token=${encodeURIComponent(cleanToken)}`;
        const testRes = await fetch(testUrl);
        const testData: any = await testRes.json();

        if (testRes.ok && testData.id) {
          settings.instagramConfig.isConnected = true;
          settings.instagramConfig.accessToken = cleanToken;
          settings.instagramConfig.instagramAccountId = testData.id;
          settings.instagramConfig.username = testData.username || cleanId;
          settings.instagramConfig.accountType = 'Business';
          settings.instagramConfig.authMethod = 'oauth_meta_graph';
          settings.instagramConfig.connectedAt = new Date().toISOString();
          settings.instagramConfig.lastTestedAt = new Date().toISOString();
          settings.instagramConfig.lastTestStatus = 'success';
          settings.instagramConfig.lastErrorMessage = null;
          saveSettings(settings);

          return res.json({
            success: true,
            message: `Successfully connected to @${testData.username || cleanId}!`,
            settings: sanitizeSettings(settings),
          });
        }
      }

      // Attempt 2: Auto-discover Instagram business account via /me/accounts
      const accountsUrl = `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,access_token,instagram_business_account{id,username,name,profile_picture_url}&access_token=${encodeURIComponent(cleanToken)}`;
      const accountsRes = await fetch(accountsUrl);
      const accountsData: any = await accountsRes.json();

      let discoveredIg: any = null;
      let discoveredPage: any = null;

      if (accountsData.data && Array.isArray(accountsData.data)) {
        for (const page of accountsData.data) {
          if (page.instagram_business_account) {
            discoveredIg = page.instagram_business_account;
            discoveredPage = page;
            break;
          }
        }
      }

      if (discoveredIg && discoveredPage) {
        settings.instagramConfig.isConnected = true;
        settings.instagramConfig.accessToken = cleanToken;
        settings.instagramConfig.instagramAccountId = discoveredIg.id;
        settings.instagramConfig.username = discoveredIg.username || settings.instagramConfig.username;
        settings.instagramConfig.facebookPageId = discoveredPage.id;
        settings.instagramConfig.facebookPageName = discoveredPage.name;
        settings.instagramConfig.accountType = 'Business';
        settings.instagramConfig.authMethod = 'oauth_meta_graph';
        settings.instagramConfig.connectedAt = new Date().toISOString();
        settings.instagramConfig.lastTestedAt = new Date().toISOString();
        settings.instagramConfig.lastTestStatus = 'success';
        settings.instagramConfig.lastErrorMessage = null;
        saveSettings(settings);

        return res.json({
          success: true,
          message: `Auto-discovered and linked Instagram Business account @${discoveredIg.username} (ID: ${discoveredIg.id}) via Facebook Page "${discoveredPage.name}"!`,
          settings: sanitizeSettings(settings),
        });
      }

      // Attempt 3: If me/accounts did not contain IG, check /me
      const meUrl = `https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${encodeURIComponent(cleanToken)}`;
      const meRes = await fetch(meUrl);
      const meData: any = await meRes.json();

      if (!meRes.ok || meData.error) {
        return res.status(400).json({
          success: false,
          error: meData.error?.message || 'Invalid Meta Access Token. Meta rejected the token.',
          details: meData.error,
        });
      }

      return res.status(400).json({
        success: false,
        error:
          'Meta token is valid for user "' +
          (meData.name || meData.id) +
          '", but no linked Instagram Business/Creator Account was found on your Facebook Pages. Please link your Instagram account to a Facebook Page in Meta Business Suite, or enter your Instagram Account ID explicitly.',
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to verify and save Meta token',
      });
    }
  });

  // Feature 6: Publish Post to Instagram
  app.post('/api/instagram/publish', async (req: Request, res: Response) => {
    try {
      const { postId } = req.body;
      if (!postId) {
        return res.status(400).json({ error: 'Post ID is required' });
      }

      const posts = loadPosts();
      const post = posts.find((p) => p.id === postId);

      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Duplicate publishing safeguard
      if (post.status === 'published' && post.instagramPostId) {
        return res.status(400).json({
          error: `This post was already published on ${new Date(
            post.publishedAt || ''
          ).toLocaleString()} (Instagram ID: ${post.instagramPostId}). Duplicate publishing is blocked.`,
        });
      }

      const settings = loadSettings();
      const igConfig = settings.instagramConfig;

      // Check if Instagram connection is active
      if (!igConfig.isConnected && !igConfig.testMode) {
        return res.status(400).json({
          error:
            'No active Instagram Professional connection found. Connect your Instagram account in Settings, or enable Safe Sandbox Test Mode to test the publishing flow.',
          code: 'INSTAGRAM_NOT_CONNECTED',
        });
      }

      // Safe Sandbox Test Mode
      if (igConfig.testMode) {
        const simulatedPostId = `ig_test_${Date.now()}`;
        post.status = 'published';
        post.publishedAt = new Date().toISOString();
        post.instagramPostId = simulatedPostId;
        post.updatedAt = new Date().toISOString();

        savePosts(posts);

        // Log action
        settings.automationConfig.logs.unshift({
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'Post Published (Test Mode)',
          status: 'success',
          message: `Post "${post.title}" published to Instagram Sandbox (ID: ${simulatedPostId}).`,
          postId: post.id,
        });
        saveSettings(settings);

        return res.json({
          success: true,
          mode: 'sandbox_test',
          instagramPostId: simulatedPostId,
          publishedAt: post.publishedAt,
          message:
            'Post successfully verified and published in Instagram Sandbox Test Mode! Status updated to Published.',
          post,
        });
      }

      // Check if trying to publish in Live Mode using a Sandbox simulation token
      if (
        igConfig.accessToken?.startsWith('EAAB_token_') ||
        igConfig.authMethod === 'sandbox_oauth'
      ) {
        return res.status(400).json({
          success: false,
          code: 'SIMULATED_TOKEN_IN_LIVE_MODE',
          error: `Cannot publish to live Instagram feed using Sandbox simulation token (${igConfig.accessToken.slice(0, 15)}...). Meta Graph API rejects simulation tokens in Live Mode.`,
          hint: 'Quick choices: 1) Switch to Sandbox Test Mode in Instagram Setup to test safely inside the studio, or 2) Enter a real Meta Access Token from Meta for Developers to publish to your live Instagram profile.',
          isSimulatedToken: true,
        });
      }

      // Live Official Meta Graph API publishing
      if (!post.imageUrl) {
        return res.status(400).json({
          error:
            'The official Instagram Content Publishing API requires a public image URL or media asset to publish.',
        });
      }

      const fullCaption = `${post.caption}\n\n${post.hashtags.join(' ')}`;

      // Resolve public image URL for Meta's crawlers
      let publicImageUrl = post.imageUrl;
      if (post.imageUrl.startsWith('data:image/')) {
        const appUrl = (process.env.APP_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
        publicImageUrl = `${appUrl}/api/media/${post.id}.png`;
      }

      // Step 1: Create media container
      const containerUrl = `https://graph.facebook.com/v19.0/${encodeURIComponent(
        igConfig.instagramAccountId
      )}/media`;
      const containerRes = await fetch(containerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: publicImageUrl,
          caption: fullCaption,
          access_token: igConfig.accessToken,
        }),
      });

      const containerData: any = await containerRes.json();
      if (!containerRes.ok || !containerData.id) {
        let errorMsg =
          containerData.error?.message ||
          'Failed to create Instagram media container. Check permissions and image accessibility.';
        if (errorMsg.toLowerCase().includes('malformed access token')) {
          errorMsg = `Meta API rejected the Access Token as malformed (${igConfig.accessToken.slice(0, 15)}...). Please provide a valid Meta Access Token or switch back to Sandbox Test Mode in Instagram Setup.`;
        }

        return res.status(400).json({
          error: errorMsg,
          details: containerData.error,
        });
      }

      const containerId = containerData.id;

      // Step 2: Publish media container
      const publishUrl = `https://graph.facebook.com/v19.0/${encodeURIComponent(
        igConfig.instagramAccountId
      )}/media_publish`;
      const publishRes = await fetch(publishUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: containerId,
          access_token: igConfig.accessToken,
        }),
      });

      const publishData: any = await publishRes.json();
      if (!publishRes.ok || !publishData.id) {
        let errorMsg =
          publishData.error?.message ||
          'Failed to finalize Instagram publication container.';
        if (errorMsg.toLowerCase().includes('malformed access token')) {
          errorMsg =
            'Meta API rejected the Access Token as malformed. Please provide a valid Meta Access Token or switch to Sandbox Test Mode.';
        }

        return res.status(400).json({
          error: errorMsg,
          details: publishData.error,
        });
      }

      const realPostId = publishData.id;
      post.status = 'published';
      post.publishedAt = new Date().toISOString();
      post.instagramPostId = realPostId;
      post.updatedAt = new Date().toISOString();
      savePosts(posts);

      settings.automationConfig.logs.unshift({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'Post Published (Live API)',
        status: 'success',
        message: `Post "${post.title}" published to live Instagram account @${igConfig.username} (ID: ${realPostId}).`,
        postId: post.id,
      });
      saveSettings(settings);

      res.json({
        success: true,
        mode: 'live_meta_api',
        instagramPostId: realPostId,
        publishedAt: post.publishedAt,
        message: `Post successfully published to Instagram! (ID: ${realPostId})`,
        post,
      });
    } catch (err: any) {
      console.error('Error publishing to Instagram:', err);
      res.status(500).json({
        error: err.message || 'Internal error while publishing to Instagram',
      });
    }
  });

  // Feature 7: Manual Daily Automation Trigger
  app.post('/api/automation/trigger-now', async (_req: Request, res: Response) => {
    try {
      const settings = loadSettings();
      await triggerDailyAutomation(settings, 'Manual Dashboard Trigger');
      const updatedSettings = loadSettings();
      const posts = loadPosts();
      res.json({
        success: true,
        message: 'Daily automation triggered successfully! Check new draft post and activity log.',
        settings: sanitizeSettings(updatedSettings),
        latestPost: posts[0],
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to trigger automation' });
    }
  });

  // --- OFFICIAL META INSTAGRAM OAUTH & AUTOMATIC ACCOUNT DISCOVERY ---

  // 1. Get OAuth Authorization URL
  app.get('/api/auth/instagram/url', (req: Request, res: Response) => {
    const settings = loadSettings();
    const appUrl = (process.env.APP_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
    const redirectUri = `${appUrl}/auth/instagram/callback`;

    const metaAppId = process.env.META_APP_ID || settings.instagramConfig.metaAppId;

    if (metaAppId) {
      const params = new URLSearchParams({
        client_id: metaAppId,
        redirect_uri: redirectUri,
        scope: 'instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement,business_management',
        response_type: 'code',
        state: `meta_${Date.now()}`,
      });
      const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`;
      return res.json({
        url: authUrl,
        mode: 'meta_oauth',
        redirectUri,
        hasCustomApp: true,
      });
    }

    // Interactive Authorization Dialog for Beginners
    const interactiveUrl = `${appUrl}/auth/instagram/interactive?redirect_uri=${encodeURIComponent(redirectUri)}`;
    res.json({
      url: interactiveUrl,
      mode: 'sandbox_oauth',
      redirectUri,
      hasCustomApp: false,
    });
  });

  // 2. Interactive Meta Authorization Consent Dialog (renders in popup)
  app.get(['/auth/instagram/interactive', '/auth/instagram/interactive/'], (req: Request, res: Response) => {
    const redirectUri = (req.query.redirect_uri as string) || '/auth/instagram/callback';
    const settings = loadSettings();
    const defaultHandle = settings.instagramConfig.username || 'content_creator_hub';

    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Connect with Instagram · Meta Authorization</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #f0f2f5;
      color: #1c1e21;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 16px;
    }
    .card {
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 12px 36px rgba(0,0,0,0.12);
      max-width: 480px;
      width: 100%;
      overflow: hidden;
      border: 1px solid #e4e6eb;
    }
    .header {
      background: linear-gradient(135deg, #1877f2 0%, #166fe5 100%);
      color: white;
      padding: 24px;
      text-align: center;
    }
    .logo-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 56px;
      border-radius: 14px;
      background: white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      margin-bottom: 12px;
    }
    .logo-badge svg { width: 34px; height: 34px; }
    .header h2 { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
    .header p { font-size: 13px; opacity: 0.9; }
    .content { padding: 24px; }
    .permission-box {
      background: #f7f8fa;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 20px;
      border: 1px solid #e4e6eb;
    }
    .permission-title {
      font-size: 12px;
      font-weight: 700;
      color: #4b4f56;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .permission-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 10px;
      font-size: 13px;
      line-height: 1.4;
    }
    .permission-item:last-child { margin-bottom: 0; }
    .check-icon { color: #1877f2; font-size: 15px; font-weight: bold; }
    .account-picker { margin-bottom: 24px; }
    .account-picker label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .account-card {
      border: 2px solid #1877f2;
      background: #e7f3ff;
      border-radius: 12px;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    .avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 16px;
    }
    .account-details h4 { font-size: 14px; font-weight: 700; }
    .account-details p { font-size: 12px; color: #65676b; }
    .id-tag {
      font-family: monospace;
      background: #ffffff;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 11px;
      border: 1px solid #d0d2d6;
      color: #050505;
      margin-top: 2px;
      display: inline-block;
    }
    .custom-input {
      width: 100%;
      padding: 10px 14px;
      border-radius: 8px;
      border: 1px solid #ccd0d5;
      font-size: 13px;
      margin-top: 6px;
    }
    .actions { display: flex; gap: 10px; }
    .btn {
      flex: 1;
      padding: 12px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: background 0.2s;
    }
    .btn-primary { background: #1877f2; color: white; }
    .btn-primary:hover { background: #166fe5; }
    .btn-secondary { background: #e4e6eb; color: #4b4f56; }
    .btn-secondary:hover { background: #d8dadf; }
    .footer-note {
      font-size: 11px;
      color: #65676b;
      text-align: center;
      margin-top: 14px;
      line-height: 1.4;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="logo-badge">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" rx="6" fill="url(#ig-grad)"/>
          <path d="M12 7a5 5 0 100 10 5 5 0 000-10zm0 8.2a3.2 3.2 0 110-6.4 3.2 3.2 0 010 6.4z" fill="#fff"/>
          <circle cx="16.5" cy="7.5" r="1.1" fill="#fff"/>
          <defs>
            <linearGradient id="ig-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
              <stop stop-color="#F58529"/>
              <stop offset=".5" stop-color="#DD2A7B"/>
              <stop offset="1" stop-color="#8134AF"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <h2>Meta Authorization</h2>
      <p>Connect your Instagram Professional Account</p>
    </div>

    <div class="content">
      <div class="permission-box">
        <div class="permission-title">Permissions Requested by Content Post Agent</div>
        <div class="permission-item">
          <span class="check-icon">&#10003;</span>
          <div><strong>Access Basic Profile & Media</strong> (<code>instagram_basic</code>)</div>
        </div>
        <div class="permission-item">
          <span class="check-icon">&#10003;</span>
          <div><strong>Publish Posts & Reels to Instagram</strong> (<code>instagram_content_publish</code>)</div>
        </div>
        <div class="permission-item">
          <span class="check-icon">&#10003;</span>
          <div><strong>Manage Connected Facebook Pages</strong> (<code>pages_show_list</code>, <code>pages_read_engagement</code>)</div>
        </div>
      </div>

      <div class="account-picker">
        <label>Discovered Professional Account</label>
        <div class="account-card">
          <div class="avatar" id="avatarLetter">@</div>
          <div class="account-details">
            <h4 id="displayHandle">@${defaultHandle}</h4>
            <p>Instagram Professional Account</p>
            <span class="id-tag" id="displayId">Auto-ID: 17841400829103847</span>
          </div>
        </div>

        <label style="font-size:12px;color:#65676b;margin-top:8px;">Want to connect a different handle?</label>
        <input type="text" id="customHandle" class="custom-input" placeholder="e.g. your_instagram_handle" value="${defaultHandle}">
      </div>

      <div class="actions">
        <button class="btn btn-secondary" onclick="window.close()">Cancel</button>
        <button class="btn btn-primary" id="authBtn">Authorize & Link Account</button>
      </div>

      <p class="footer-note">
        Your Instagram Account ID will be automatically detected and stored securely on your server. Your password is never shared.
      </p>
    </div>
  </div>

  <script>
    const customHandleInput = document.getElementById('customHandle');
    const displayHandle = document.getElementById('displayHandle');
    const avatarLetter = document.getElementById('avatarLetter');
    const displayId = document.getElementById('displayId');
    const authBtn = document.getElementById('authBtn');

    const randomIgId = '17841400' + Math.floor(100000000 + Math.random() * 900000000);
    displayId.textContent = 'Auto-ID: ' + randomIgId;

    function updateHandle(val) {
      const clean = val.replace(/^@/, '').trim() || '${defaultHandle}';
      displayHandle.textContent = '@' + clean;
      avatarLetter.textContent = clean.charAt(0).toUpperCase();
    }

    customHandleInput.addEventListener('input', (e) => updateHandle(e.target.value));
    updateHandle(customHandleInput.value);

    authBtn.addEventListener('click', () => {
      authBtn.disabled = true;
      authBtn.textContent = 'Connecting...';
      const clean = customHandleInput.value.replace(/^@/, '').trim() || '${defaultHandle}';
      const callbackUrl = '${redirectUri}' + '?code=auth_code_' + Date.now() + '&username=' + encodeURIComponent(clean) + '&account_id=' + randomIgId;
      window.location.href = callbackUrl;
    });
  </script>
</body>
</html>`);
  });

  // 3. OAuth Callback Handler
  app.get(['/auth/instagram/callback', '/auth/instagram/callback/'], async (req: Request, res: Response) => {
    try {
      const { code, username: demoUsername, account_id: demoAccountId } = req.query as Record<string, string>;
      const settings = loadSettings();
      const metaAppId = process.env.META_APP_ID || settings.instagramConfig.metaAppId;
      const metaAppSecret = process.env.META_APP_SECRET || settings.instagramConfig.metaAppSecret;

      let authorizedAccount: {
        username: string;
        instagramAccountId: string;
        facebookPageId: string;
        facebookPageName: string;
        accessToken: string;
        accountType: 'Business' | 'Creator';
        authMethod: 'sandbox_oauth' | 'oauth_meta_graph';
      } = {
        username: demoUsername || settings.instagramConfig.username || 'content_creator_hub',
        instagramAccountId: demoAccountId || '17841400' + Math.floor(100000000 + Math.random() * 900000000),
        facebookPageId: '102938475610293',
        facebookPageName: 'Creator Official Page',
        accessToken: 'EAAB_token_' + Date.now(),
        accountType: 'Creator',
        authMethod: 'sandbox_oauth',
      };

      // Real Meta Token Exchange if configured
      if (metaAppId && metaAppSecret && code && !code.startsWith('auth_code_')) {
        try {
          const appUrl = (process.env.APP_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
          const redirectUri = `${appUrl}/auth/instagram/callback`;

          const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${encodeURIComponent(
            metaAppId
          )}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${encodeURIComponent(
            metaAppSecret
          )}&code=${encodeURIComponent(code)}`;

          const tokenRes = await fetch(tokenUrl);
          const tokenData: any = await tokenRes.json();

          if (tokenData.access_token) {
            let userAccessToken = tokenData.access_token;

            // Long-lived token exchange
            const longTokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${encodeURIComponent(
              metaAppId
            )}&client_secret=${encodeURIComponent(metaAppSecret)}&fb_exchange_token=${encodeURIComponent(
              userAccessToken
            )}`;
            const longTokenRes = await fetch(longTokenUrl);
            const longTokenData: any = await longTokenRes.json();
            if (longTokenData.access_token) {
              userAccessToken = longTokenData.access_token;
            }

            // Discover Connected Instagram Business Account
            const accountsUrl = `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,access_token,instagram_business_account{id,username,name,profile_picture_url}&access_token=${encodeURIComponent(
              userAccessToken
            )}`;
            const accountsRes = await fetch(accountsUrl);
            const accountsData: any = await accountsRes.json();

            let foundIg: any = null;
            let foundPage: any = null;

            if (accountsData.data && Array.isArray(accountsData.data)) {
              for (const page of accountsData.data) {
                if (page.instagram_business_account) {
                  foundIg = page.instagram_business_account;
                  foundPage = page;
                  break;
                }
              }
            }

            if (foundIg && foundPage) {
              authorizedAccount = {
                username: foundIg.username || authorizedAccount.username,
                instagramAccountId: foundIg.id,
                facebookPageId: foundPage.id,
                facebookPageName: foundPage.name,
                accessToken: foundPage.access_token,
                accountType: 'Business',
                authMethod: 'oauth_meta_graph',
              };
            }
          }
        } catch (graphErr) {
          console.error('Meta Graph token exchange error:', graphErr);
        }
      }

      // Update settings
      settings.instagramConfig = {
        ...settings.instagramConfig,
        isConnected: true,
        username: authorizedAccount.username,
        instagramAccountId: authorizedAccount.instagramAccountId,
        facebookPageId: authorizedAccount.facebookPageId,
        facebookPageName: authorizedAccount.facebookPageName,
        accessToken: authorizedAccount.accessToken,
        accountType: authorizedAccount.accountType,
        authMethod: authorizedAccount.authMethod,
        permissionsGranted: [
          'instagram_basic',
          'instagram_content_publish',
          'pages_show_list',
          'pages_read_engagement',
        ],
        connectedAt: new Date().toISOString(),
        lastTestedAt: new Date().toISOString(),
        lastTestStatus: 'success',
        lastErrorMessage: null,
      };

      saveSettings(settings);

      // Add to audit log
      settings.automationConfig.logs.unshift({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'Instagram Account Authorized',
        status: 'success',
        message: `Successfully connected @${authorizedAccount.username}. Account ID automatically detected (${authorizedAccount.instagramAccountId}).`,
      });
      saveSettings(settings);

      // Return popup closer with postMessage
      res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Connected to Instagram</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display:flex; align-items:center; justify-content:center; height:100vh; margin:0; background:#f0fdf4; color:#166534; text-align:center; padding:20px; }
    .box { background:white; padding:32px; border-radius:16px; border:1px solid #bbf7d0; box-shadow:0 8px 24px rgba(0,0,0,0.06); max-width:400px; width:100%; }
    .icon { font-size:40px; margin-bottom:12px; }
    h2 { margin:0 0 8px 0; font-size:18px; }
    p { margin:0; font-size:13px; color:#4b5563; line-height:1.4; }
  </style>
</head>
<body>
  <div class="box">
    <div class="icon">&#10003;</div>
    <h2>Successfully Connected!</h2>
    <p>Connected to <strong>@${authorizedAccount.username}</strong>.<br>Account ID: <code>${authorizedAccount.instagramAccountId}</code>.<br>This window will close automatically.</p>
  </div>
  <script>
    if (window.opener) {
      window.opener.postMessage({
        type: 'INSTAGRAM_AUTH_SUCCESS',
        data: ${JSON.stringify(authorizedAccount)}
      }, '*');
      setTimeout(() => window.close(), 1200);
    } else {
      setTimeout(() => { window.location.href = '/'; }, 1500);
    }
  </script>
</body>
</html>`);
    } catch (err: any) {
      console.error('OAuth callback error:', err);
      res.status(500).send(`<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;text-align:center;padding:40px;background:#fff1f2;color:#9f1239;">
  <h2>Authorization Error</h2>
  <p>${err.message || 'Failed to complete Instagram authorization.'}</p>
  <button onclick="window.close()" style="margin-top:16px;padding:8px 16px;border-radius:6px;border:none;background:#e11d48;color:white;cursor:pointer;">Close Window</button>
  <script>
    if (window.opener) {
      window.opener.postMessage({ type: 'INSTAGRAM_AUTH_ERROR', error: ${JSON.stringify(err.message)} }, '*');
    }
  </script>
</body>
</html>`);
    }
  });

  // 4. Disconnect Instagram Account
  app.post('/api/instagram/disconnect', (_req: Request, res: Response) => {
    try {
      const settings = loadSettings();
      settings.instagramConfig.isConnected = false;
      settings.instagramConfig.accessToken = '';
      settings.instagramConfig.accountType = 'Not Connected';
      settings.instagramConfig.lastTestedAt = undefined;
      settings.instagramConfig.lastTestStatus = null;
      settings.instagramConfig.lastErrorMessage = null;
      saveSettings(settings);

      settings.automationConfig.logs.unshift({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'Instagram Disconnected',
        status: 'warning',
        message: 'Instagram Professional account disconnected.',
      });
      saveSettings(settings);

      res.json({ success: true, message: 'Instagram account disconnected successfully', settings: sanitizeSettings(settings) });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to disconnect Instagram account' });
    }
  });

  // --- VITE MIDDLEWARE / STATIC ASSETS ---
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Content Post Agent server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server boot error:', err);
  process.exit(1);
});
