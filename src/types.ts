export type PostType = 'image' | 'carousel' | 'reel';

export type Language =
  | 'English'
  | 'Telugu'
  | 'Hindi'
  | 'Bilingual (English + Telugu)'
  | 'Bilingual (English + Hindi)';

export type Tone =
  | 'Friendly'
  | 'Professional'
  | 'Funny'
  | 'Inspirational'
  | 'Educational';

export type Niche =
  | 'Technology'
  | 'AI'
  | 'Education'
  | 'Motivation'
  | 'Business'
  | 'Art'
  | 'Custom';

export type PostStatus = 'draft' | 'approved' | 'scheduled' | 'published';

export interface ReelScene {
  sceneNumber: number;
  durationSeconds: number;
  visualCue: string;
  voiceover: string;
  onScreenText: string;
}

export interface CarouselSlide {
  slideNumber: number;
  header: string;
  body: string;
  visualStyle: string;
}

export interface Post {
  id: string;
  title: string;
  caption: string;
  hashtags: string[];
  callToAction: string;
  imagePrompt: string;
  imageUrl: string | null;
  postType: PostType;
  niche: string;
  language: Language;
  tone: Tone;
  targetAudience: string;
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
  scheduledDate: string | null;
  publishedAt: string | null;
  instagramPostId: string | null;
  reelScript?: ReelScene[];
  carouselSlides?: CarouselSlide[];
  isAutomated?: boolean;
}

export interface ContentSettings {
  platform: 'Instagram';
  niche: Niche;
  customNiche?: string;
  targetAudience: string;
  language: Language;
  tone: Tone;
  postType: PostType;
  frequency: 'Daily' | '3 times a week' | 'Weekdays' | 'Custom';
  preferredPostingTime: string;
  timezone: string;
}

export interface InstagramConfig {
  isConnected: boolean;
  accountType: 'Business' | 'Creator' | 'Not Connected';
  instagramAccountId: string;
  facebookPageId: string;
  facebookPageName?: string;
  accessToken: string;
  username: string;
  name?: string;
  profilePictureUrl?: string;
  testMode: boolean;
  permissionsGranted?: string[];
  connectedAt?: string;
  metaAppId?: string;
  metaAppSecret?: string;
  authMethod?: 'oauth_meta_graph' | 'sandbox_oauth';
  isSimulatedToken?: boolean;
  lastTestedAt?: string;
  lastTestStatus?: 'success' | 'error' | null;
  lastErrorMessage?: string | null;
}

export interface AutomationLog {
  id: string;
  timestamp: string;
  action: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  postId?: string;
}

export interface AutomationConfig {
  dailyAutomationEnabled: boolean;
  dailyPostingTime: string;
  timezone: string;
  autoPublish: boolean;
  lastRunAt?: string;
  nextRunAt?: string;
  logs: AutomationLog[];
}

export interface AppSettings {
  contentSettings: ContentSettings;
  instagramConfig: InstagramConfig;
  automationConfig: AutomationConfig;
}
