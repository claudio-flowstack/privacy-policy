/**
 * Content Dashboard – YouTube, Instagram & Facebook/LinkedIn Content Hub
 * Ideen sammeln, Drafts erstellen, Content-Pipeline verwalten
 */

import { useState, useEffect, useMemo, useCallback, ReactNode } from "react";
import {
  BarChart3, Video, Camera, Calendar, Search, Settings,
  Lightbulb, Plus, X, Edit3, Trash2, Copy, Download, Upload,
  ChevronDown, ChevronRight, ChevronLeft, Check, Filter,
  Sun, Moon, Sparkles,
  FileText, Target,
  Layers, ExternalLink,
  Play, Share2, TrendingUp, Star,
  Columns3, Bell, Menu, CheckSquare, Users,
  Eye, Hash, Percent, AlertCircle, Bookmark,
  FolderOpen, ClipboardList, Code, DollarSign,
  ChevronUp, RefreshCw, GitBranch, List, Maximize2, ArrowLeft, Link2
} from "lucide-react";
import { useTheme } from '@/components/theme-provider';
import { LanguageProvider, useLanguage } from '../i18n/LanguageContext';
import { saveContentItems, saveResearchNotes, saveFileLinks, savePlans } from '../data/contentStorage';
import ConfirmDialog, { useModalEsc } from '../components/ui/ConfirmDialog';

// ============================================
// TYPES
// ============================================
type Platform = 'youtube' | 'instagram' | 'facebook-linkedin';
type ContentStatus = 'idea' | 'draft' | 'ready' | 'scheduled' | 'live' | 'archived';
type Priority = 'high' | 'medium' | 'low';
type IdeaQuality = 'good' | 'bad' | 'neutral';
type InstagramPostType = 'reel' | 'carousel' | 'story' | 'post';
type FBPostType = 'post' | 'carousel' | 'video' | 'story' | 'article';
type ActiveSection = 'overview' | 'ideas' | 'youtube' | 'instagram' | 'facebook-linkedin' | 'pipeline' | 'calendar' | 'files' | 'planning' | 'performance' | 'templates' | 'research' | 'settings';
type SortField = 'date' | 'priority' | 'status' | 'title' | 'score';
type SortDir = 'asc' | 'desc';
interface ThumbnailFile {
  id: string;
  name: string;
  dataUrl: string;
  createdAt: string;
}

interface MediaFile {
  id: string;
  name: string;
  dataUrl: string;
  type: 'image' | 'video';
  createdAt: string;
}

interface ContentVersion {
  id: string;
  label: string;
  createdAt: string;
  title: string;
  description: string;
  notes: string;
}

interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

interface PerformanceData {
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  clicks?: number;
  impressions?: number;
}

interface ContentSeries {
  id: string;
  name: string;
  color: string;
  description: string;
}

interface ContentTemplate {
  id: string;
  name: string;
  platform: Platform;
  description: string;
  defaultTags: string[];
  defaultChecklist: string[];
  concept: string;
  angle: string;
}

interface ContentItem {
  id: string;
  platform: Platform;
  status: ContentStatus;
  priority: Priority;
  quality: IdeaQuality;
  createdAt: string;
  updatedAt: string;
  scheduledDate?: string;
  publishedDate?: string;
  title: string;
  concept: string;
  angle: string;
  notes: string;
  tags: string[];
  pinned?: boolean;
  seriesId?: string;
  assignee?: string;
  checklist?: ChecklistItem[];
  performance?: PerformanceData;
  recurring?: { frequency: 'weekly' | 'biweekly' | 'monthly'; dayOfWeek?: number };
  yt?: {
    videoTitle: string;
    videoDescription: string;
    keywords: string[];
    thumbnails: ThumbnailFile[];
    category: string;
    targetAudience: string;
  };
  ig?: {
    caption: string;
    hashtags: string[];
    coverImage?: ThumbnailFile;
    postType: InstagramPostType;
    audioReference: string;
  };
  fb?: {
    caption: string;
    hashtags: string[];
    postType: FBPostType;
    linkUrl: string;
    coverImage?: ThumbnailFile;
  };
  media?: MediaFile[];
  versions: ContentVersion[];
}

interface ResearchNote {
  id: string;
  title: string;
  content: string;
  links: string[];
  tags: string[];
  platform: Platform | 'general';
  createdAt: string;
  updatedAt: string;
}

// ---- File Links ----
type FileCategory = 'marketing' | 'dev' | 'sales' | 'content' | 'operations' | 'other';

interface FileLink {
  id: string;
  name: string;
  url: string;
  description: string;
  category: FileCategory;
  labels: string[];
  createdAt: string;
  updatedAt: string;
}

// ---- Marketing Plans ----
type PlanChannel =
  | 'youtube' | 'instagram' | 'linkedin' | 'tiktok' | 'podcast'
  | 'cold-calls' | 'cold-emails' | 'dmc' | 'pvc'
  | 'ads'
  | 'homepage' | 'funnel';
type ChannelCategory = 'content' | 'outreach' | 'paid' | 'assets';
interface FunnelStep {
  label: string;
  rate: number; // % transition rate to this step from previous
}

interface ChannelConfig {
  postingFrequency?: string;
  countPerDay?: number;
  timeStart?: string;
  timeEnd?: string;
  adsPlatforms?: string[];
  funnelType?: string;
  // Per-channel conversion funnel
  funnelSteps?: FunnelStep[];
  // Deprecated — kept for backward compat
  conversionToMeeting?: number;
  conversionToCustomer?: number;
}
type TaskFrequency = 'once' | 'daily' | 'weekly' | 'biweekly' | 'monthly';

type TaskPriority = 'high' | 'medium' | 'low';
type TaskStatus = 'todo' | 'in-progress' | 'done';

interface PlanSubtask {
  id: string;
  title: string;
  done: boolean;
  subtasks?: PlanSubtask[];
}

interface PlanTask {
  id: string;
  title: string;
  description: string;
  frequency: TaskFrequency;
  dayOfWeek?: number;
  done: boolean;
  order: number;
  // V2 extensions
  priority?: TaskPriority;
  dueDate?: string;
  isMMA?: boolean;
  status?: TaskStatus;
  linkedDashboard?: string;
  linkedItemId?: string;
  linkedItemTitle?: string;
  linkedFiles?: string[];
  linkedContentIds?: string[];
  dependsOn?: string[];
  assignee?: string;
  subtasks?: PlanSubtask[];
}

interface TeamMember {
  id: string;
  name: string;
  color: string;
  initials: string;
}

interface PlanSection {
  id: string;
  name: string;
  color: string;
  tasks: PlanTask[];
  phase?: number;
  notes?: string;
}

interface MarketingPlan {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  sections: PlanSection[];
  // V2 extensions
  strategy?: string;
  deadline?: string;
  notes?: string;
  // Plan-Builder fields
  goal?: string;
  targetAudience?: string;
  channels?: PlanChannel[];
  channelConfig?: Record<string, ChannelConfig>;
  contentPlanningDay?: number;
  contentPlanningCycle?: string;
  // Revenue & Strategy Calculations
  revenueGoal?: number;
  productPrice?: number;
  conversionLow?: number;   // deprecated — kept for backward compat
  conversionHigh?: number;  // deprecated — kept for backward compat
  // Team
  teamMembers?: TeamMember[];
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface Notification {
  id: string;
  message: string;
  itemId?: string;
  read: boolean;
  createdAt: string;
}

// ============================================
// HELPERS
// ============================================

/** Content-Score: 0-100 based on filled fields */
const calcContentScore = (item: ContentItem): number => {
  let score = 0;
  const max = 10;
  if (item.title) score++;
  if (item.concept) score++;
  if (item.angle) score++;
  if (item.tags.length > 0) score++;
  if (item.scheduledDate) score++;
  if (item.platform === 'youtube' && item.yt) {
    if (item.yt.videoTitle) score++;
    if (item.yt.videoDescription) score++;
    if (item.yt.keywords.length > 0) score++;
    if (item.yt.thumbnails.length > 0) score++;
    if (item.yt.targetAudience) score++;
  } else if (item.platform === 'instagram' && item.ig) {
    if (item.ig.caption) score++;
    if (item.ig.hashtags.length > 0) score++;
    if (item.ig.coverImage) score++;
    if (item.ig.audioReference) score++;
    if (item.ig.postType) score++;
  } else if (item.platform === 'facebook-linkedin' && item.fb) {
    if (item.fb.caption) score++;
    if (item.fb.hashtags.length > 0) score++;
    if (item.fb.linkUrl) score++;
    if (item.fb.coverImage) score++;
    if (item.fb.postType) score++;
  } else {
    score += 5; // neutral if no platform-specific data yet
  }
  if (item.checklist && item.checklist.length > 0) {
    const done = item.checklist.filter(c => c.done).length;
    score = Math.round((score / max) * 70 + (done / item.checklist.length) * 30);
  } else {
    score = Math.round((score / max) * 100);
  }
  return Math.min(100, score);
};

const TEAM_MEMBERS = ['Claudio', 'Anna', 'Max', 'Lisa', 'Tom'];

const DEFAULT_CHECKLIST: Record<Platform, string[]> = {
  youtube: ['Script schreiben', 'Aufnahme machen', 'Schnitt', 'Thumbnail erstellen', 'SEO optimieren', 'Upload & Beschreibung'],
  instagram: ['Konzept/Storyboard', 'Aufnahme/Design', 'Beitragstext schreiben', 'Hashtags recherchieren', 'Audio wählen', 'Veröffentlichen'],
  'facebook-linkedin': ['Text schreiben', 'Bild/Visual erstellen', 'Hashtags setzen', 'Link einfügen', 'Veröffentlichen'],
};

// ============================================
// COLOR MAPS
// ============================================
const statusConfig: Record<ContentStatus, { bg: string; text: string; de: string; en: string }> = {
  idea:      { bg: 'bg-blue-100 dark:bg-blue-500/20',    text: 'text-blue-600 dark:text-blue-400',    de: 'Idee',      en: 'Idea' },
  draft:     { bg: 'bg-purple-100 dark:bg-purple-500/20', text: 'text-purple-600 dark:text-purple-400', de: 'Entwurf',   en: 'Draft' },
  ready:     { bg: 'bg-amber-100 dark:bg-amber-500/20',   text: 'text-amber-600 dark:text-amber-400',   de: 'Bereit',    en: 'Ready' },
  scheduled: { bg: 'bg-orange-100 dark:bg-orange-500/20',  text: 'text-orange-600 dark:text-orange-400', de: 'Geplant',   en: 'Scheduled' },
  live:      { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', de: 'Live', en: 'Live' },
  archived:  { bg: 'bg-gray-100 dark:bg-gray-500/20',      text: 'text-gray-500 dark:text-gray-400',     de: 'Archiviert', en: 'Archived' },
};

const contentPriorityConfig: Record<Priority, { bg: string; text: string; de: string; en: string }> = {
  high:   { bg: 'bg-red-100 dark:bg-red-500/20',    text: 'text-red-600 dark:text-red-400',    de: 'Hoch',    en: 'High' },
  medium: { bg: 'bg-yellow-100 dark:bg-yellow-500/20', text: 'text-yellow-600 dark:text-yellow-400', de: 'Mittel', en: 'Medium' },
  low:    { bg: 'bg-gray-100 dark:bg-gray-500/20',   text: 'text-gray-500 dark:text-gray-400',   de: 'Niedrig', en: 'Low' },
};

const qualityConfig: Record<IdeaQuality, { bg: string; text: string; icon: string; de: string; en: string }> = {
  good:    { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-600', icon: '👍', de: 'Gute Idee', en: 'Good Idea' },
  bad:     { bg: 'bg-red-100 dark:bg-red-500/20',        text: 'text-red-600',     icon: '👎', de: 'Schlechte Idee', en: 'Bad Idea' },
  neutral: { bg: 'bg-gray-100 dark:bg-gray-500/20',       text: 'text-gray-600',    icon: '🤔', de: 'Neutral', en: 'Neutral' },
};

const platformConfig: Record<Platform, { bg: string; text: string; de: string; en: string; color: string; icon: typeof Video }> = {
  youtube:            { bg: 'bg-red-100 dark:bg-red-500/20',   text: 'text-red-600 dark:text-red-400',   de: 'YouTube',   en: 'YouTube',   color: 'red',  icon: Video },
  instagram:          { bg: 'bg-pink-100 dark:bg-pink-500/20',  text: 'text-pink-600 dark:text-pink-400',  de: 'Instagram', en: 'Instagram', color: 'pink', icon: Camera },
  'facebook-linkedin': { bg: 'bg-blue-100 dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-400', de: 'Facebook & LinkedIn', en: 'Facebook & LinkedIn', color: 'blue', icon: Share2 },
};

const igPostTypeLabels: Record<InstagramPostType, { de: string; en: string }> = {
  reel:      { de: 'Reel', en: 'Reel' },
  carousel:  { de: 'Karussell', en: 'Carousel' },
  story:     { de: 'Story', en: 'Story' },
  post:      { de: 'Beitrag', en: 'Post' },
};

const fbPostTypeLabels: Record<FBPostType, { de: string; en: string }> = {
  post:      { de: 'Beitrag', en: 'Post' },
  carousel:  { de: 'Karussell', en: 'Carousel' },
  video:     { de: 'Video', en: 'Video' },
  story:     { de: 'Story', en: 'Story' },
  article:   { de: 'Artikel', en: 'Article' },
};

const ytCategories = ['Entertainment', 'Education', 'Business', 'Tech', 'Lifestyle', 'Marketing', 'Tutorial', 'Vlog'];


const seriesColorMap: Record<string, { bg: string; text: string; border: string }> = {
  sky:     { bg: 'bg-sky-100 dark:bg-sky-500/20',     text: 'text-sky-600',     border: 'border-sky-300 dark:border-sky-500/30' },
  violet:  { bg: 'bg-violet-100 dark:bg-violet-500/20', text: 'text-violet-600',  border: 'border-violet-300 dark:border-violet-500/30' },
  amber:   { bg: 'bg-amber-100 dark:bg-amber-500/20',   text: 'text-amber-600',   border: 'border-amber-300 dark:border-amber-500/30' },
  emerald: { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-600', border: 'border-emerald-300 dark:border-emerald-500/30' },
  rose:    { bg: 'bg-rose-100 dark:bg-rose-500/20',     text: 'text-rose-600',    border: 'border-rose-300 dark:border-rose-500/30' },
  indigo:  { bg: 'bg-indigo-100 dark:bg-indigo-500/20',  text: 'text-indigo-600',  border: 'border-indigo-300 dark:border-indigo-500/30' },
};

const statusOrder: ContentStatus[] = ['idea', 'draft', 'ready', 'scheduled', 'live', 'archived'];

// File category config
const categoryConfig: Record<FileCategory, { icon: typeof Video; bg: string; text: string; de: string; en: string }> = {
  marketing:   { icon: TrendingUp, bg: 'bg-blue-100 dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-400', de: 'Marketing', en: 'Marketing' },
  dev:         { icon: Code, bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', de: 'Dev', en: 'Dev' },
  sales:       { icon: DollarSign, bg: 'bg-amber-100 dark:bg-amber-500/20', text: 'text-amber-600 dark:text-amber-400', de: 'Sales', en: 'Sales' },
  content:     { icon: Video, bg: 'bg-red-100 dark:bg-red-500/20', text: 'text-red-600 dark:text-red-400', de: 'Content', en: 'Content' },
  operations:  { icon: Settings, bg: 'bg-gray-100 dark:bg-gray-500/20', text: 'text-gray-600 dark:text-gray-400', de: 'Operations', en: 'Operations' },
  other:       { icon: FileText, bg: 'bg-purple-100 dark:bg-purple-500/20', text: 'text-purple-600 dark:text-purple-400', de: 'Sonstiges', en: 'Other' },
};

const frequencyConfig: Record<TaskFrequency, { de: string; en: string; color: string }> = {
  once:     { de: 'Einmalig', en: 'Once', color: 'text-gray-500' },
  daily:    { de: 'Täglich', en: 'Daily', color: 'text-emerald-600 dark:text-emerald-400' },
  weekly:   { de: 'Wöchentlich', en: 'Weekly', color: 'text-blue-600 dark:text-blue-400' },
  biweekly: { de: '2x/Monat', en: 'Biweekly', color: 'text-purple-600 dark:text-purple-400' },
  monthly:  { de: 'Monatlich', en: 'Monthly', color: 'text-gray-600 dark:text-gray-400' },
};

const SUGGESTED_LABELS = ['ZG Analyse', 'Copy', 'Sales Skript', 'Onboarding Skript', 'Transkript', 'Pitch Deck', 'SOP', 'Vorlage', 'Template', 'Briefing', 'Analyse', 'Checkliste', 'Leitfaden'];

const SECTION_COLORS = ['red', 'pink', 'blue', 'amber', 'emerald', 'purple'];

const sectionColorMap: Record<string, { bg: string; text: string; border: string }> = {
  red:     { bg: 'bg-red-50 dark:bg-red-500/10',     text: 'text-red-600 dark:text-red-400',     border: 'border-red-200 dark:border-red-500/20' },
  pink:    { bg: 'bg-pink-50 dark:bg-pink-500/10',    text: 'text-pink-600 dark:text-pink-400',   border: 'border-pink-200 dark:border-pink-500/20' },
  blue:    { bg: 'bg-blue-50 dark:bg-blue-500/10',    text: 'text-blue-600 dark:text-blue-400',   border: 'border-blue-200 dark:border-blue-500/20' },
  amber:   { bg: 'bg-amber-50 dark:bg-amber-500/10',  text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-500/20' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-500/20' },
  purple:  { bg: 'bg-purple-50 dark:bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-500/20' },
};

const dayOfWeekLabels = { de: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'], en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] };

const priorityConfig: Record<TaskPriority, { de: string; en: string; bg: string; text: string; dot: string; border: string }> = {
  high: { de: 'Hoch', en: 'High', bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-600 dark:text-red-400', dot: '#ef4444', border: 'border-red-200 dark:border-red-500/30' },
  medium: { de: 'Mittel', en: 'Medium', bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', dot: '#f59e0b', border: 'border-amber-200 dark:border-amber-500/30' },
  low: { de: 'Niedrig', en: 'Low', bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', dot: '#10b981', border: 'border-emerald-200 dark:border-emerald-500/30' },
};

const statusColumnsConfig: Record<TaskStatus, { de: string; en: string; bg: string; text: string }> = {
  'todo': { de: 'Offen', en: 'To Do', bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400' },
  'in-progress': { de: 'In Arbeit', en: 'In Progress', bg: 'bg-sky-100 dark:bg-sky-500/20', text: 'text-sky-600 dark:text-sky-400' },
  'done': { de: 'Erledigt', en: 'Done', bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400' },
};

const dashboardLinkOptions = [
  { key: 'content', de: 'Content', en: 'Content', icon: 'Video', storageKey: 'flowstack-content-items', titleField: 'title', route: '/content' },
  { key: 'files', de: 'Dateien', en: 'Files', icon: 'FolderOpen', storageKey: 'flowstack-content-files', titleField: 'name', route: '/content' },
  { key: 'linkedin', de: 'LinkedIn', en: 'LinkedIn', icon: 'Users', storageKey: 'flowstack-linkedin-posts', titleField: 'title', route: '/linkedin' },
  { key: 'coldmail', de: 'Cold Mail', en: 'Cold Mail', icon: 'Mail', storageKey: 'flowstack-coldmail-campaigns', titleField: 'name', route: '/coldmail' },
  { key: 'systems', de: 'Automation', en: 'Automation', icon: 'Zap', storageKey: 'flowstack-automation-systems', titleField: 'name', route: '/systems' },
];

// ============================================
// DEMO DATA (dates relative to today)
// ============================================
const _d = (daysOffset: number, hours = 12) => {
  const d = new Date(); d.setDate(d.getDate() + daysOffset); d.setHours(hours, 0, 0, 0);
  return d.toISOString();
};

const DEMO_SERIES: ContentSeries[] = [
  { id: 's1', name: 'KI-Tools Serie', color: 'sky', description: 'Wöchentliche KI-Tool Reviews und Tutorials' },
  { id: 's2', name: 'Quick Tips', color: 'amber', description: 'Kurze Tipps als Reels und Short-Posts' },
  { id: 's3', name: 'Case Studies', color: 'emerald', description: 'Kundenbeispiele mit echten Zahlen' },
];

const DEMO_TEMPLATES: ContentTemplate[] = [
  { id: 't1', name: 'YouTube Tutorial', platform: 'youtube', description: 'Schritt-für-Schritt Tutorial Format', defaultTags: ['Tutorial'], defaultChecklist: ['Script schreiben', 'Screen Recording', 'Intro/Outro', 'Schnitt', 'Thumbnail', 'SEO Keywords', 'Upload'], concept: 'Schritt-für-Schritt Anleitung für [Thema]', angle: 'Kein Vorwissen nötig – in X Minuten zum Ergebnis' },
  { id: 't2', name: 'Instagram Reel', platform: 'instagram', description: 'Kurzes Reel mit Hook und CTA', defaultTags: ['Reel', 'Quick Tip'], defaultChecklist: ['Hook-Text schreiben', 'Aufnahme', 'Schnitt & Effekte', 'Beitragstext & Hashtags', 'Audio wählen', 'Posten'], concept: 'Kurzer Tipp/Fakt zu [Thema] in 15-30 Sekunden', angle: 'Hook in den ersten 2 Sekunden' },
  { id: 't3', name: 'LinkedIn Thought Leadership', platform: 'facebook-linkedin', description: 'Längerer Fachbeitrag mit Mehrwert', defaultTags: ['Thought Leadership', 'Business'], defaultChecklist: ['Kernaussage definieren', 'Text schreiben', 'Visual erstellen', 'Hashtags recherchieren', 'Veröffentlichen'], concept: 'Fachbeitrag über [Thema] mit eigener Perspektive', angle: 'Persönliche Erfahrung + Daten als Beweis' },
  { id: 't4', name: 'Carousel Post', platform: 'instagram', description: 'Mehrere Slides mit Tipps/Infos', defaultTags: ['Carousel', 'Infografik'], defaultChecklist: ['Inhalte recherchieren', 'Slides designen', 'Beitragstext schreiben', 'Hashtags', 'Posten'], concept: 'X Tipps/Facts zu [Thema] als Carousel', angle: 'Jede Slide = 1 wertvoller Tipp, einfach erklärt' },
];

const DEMO_CONTENT: ContentItem[] = [
  {
    id: '1', platform: 'youtube', status: 'live', priority: 'high', quality: 'good',
    createdAt: _d(-21, 10), updatedAt: _d(-16, 14), publishedDate: _d(-14, 12),
    title: '5 KI-Tools die dein Business verändern', concept: 'Top 5 KI-Tools für Unternehmer vorgestellt mit Live-Demos und ROI-Analyse.',
    angle: 'Hook: Die meisten Unternehmer nutzen nur ChatGPT – dabei gibt es Tools die 10x mehr bringen.',
    notes: 'Performance: 12k Views in 3 Tagen. Kommentare sehr positiv.',
    tags: ['KI', 'Tools', 'Business'], pinned: true, seriesId: 's1', assignee: 'Claudio',
    performance: { views: 12400, likes: 890, comments: 156, shares: 234 },
    checklist: [{ id: 'c1', label: 'Script schreiben', done: true }, { id: 'c2', label: 'Aufnahme', done: true }, { id: 'c3', label: 'Schnitt', done: true }, { id: 'c4', label: 'Thumbnail', done: true }, { id: 'c5', label: 'SEO optimieren', done: true }, { id: 'c6', label: 'Upload', done: true }],
    yt: { videoTitle: '5 KI-Tools die dein Business verändern werden', videoDescription: 'In diesem Video zeige ich dir 5 KI-Tools, die dein Business auf das nächste Level bringen...', keywords: ['KI Tools', 'Business Automation', 'ChatGPT Alternative'], thumbnails: [], category: 'Business', targetAudience: 'Unternehmer, Selbstständige, 25-45' },
    versions: [{ id: 'v1', label: 'v1', createdAt: _d(-21, 10), title: 'KI-Tools für Business', description: 'Erster Entwurf', notes: '' },
               { id: 'v2', label: 'Final', createdAt: _d(-18, 16), title: '5 KI-Tools die dein Business verändern', description: 'Finaler Titel mit Zahl', notes: 'Zahl im Titel performt besser' }],
  },
  {
    id: '2', platform: 'youtube', status: 'draft', priority: 'high', quality: 'good',
    createdAt: _d(-7, 9), updatedAt: _d(-3, 11),
    title: 'Automatisierte Lead-Generierung mit Make.com', concept: 'Schritt-für-Schritt Tutorial: Wie man mit Make.com automatisch Leads generiert und in ein CRM pusht.',
    angle: 'Ich zeige den kompletten Workflow den wir für unsere Kunden nutzen.',
    notes: 'Screencapture vorbereiten. Make.com Account aufsetzen für Demo.',
    tags: ['Automation', 'Leads', 'Make.com', 'Tutorial'], assignee: 'Claudio',
    checklist: [{ id: 'c1', label: 'Script schreiben', done: true }, { id: 'c2', label: 'Screen Recording', done: false }, { id: 'c3', label: 'Schnitt', done: false }, { id: 'c4', label: 'Thumbnail', done: false }, { id: 'c5', label: 'Upload', done: false }],
    yt: { videoTitle: 'Automatisierte Lead-Generierung mit Make.com (kompletter Workflow)', videoDescription: '', keywords: ['Make.com', 'Lead Generierung', 'Automation', 'No Code'], thumbnails: [], category: 'Tutorial', targetAudience: 'Marketing Manager, Agenturinhaber' },
    versions: [{ id: 'v1', label: 'v1', createdAt: _d(-7, 9), title: 'Lead Gen Automation', description: '', notes: '' }],
  },
  {
    id: '3', platform: 'instagram', status: 'scheduled', priority: 'medium', quality: 'good',
    createdAt: _d(-5, 14), updatedAt: _d(-2, 10), scheduledDate: _d(1, 18),
    title: 'KI-Automation in 30 Sekunden erklärt', concept: 'Kurzes Reel das zeigt wie ein komplexer Workflow in 30 Sekunden automatisiert wird.',
    angle: 'Vorher/Nachher: 4 Stunden manuelle Arbeit vs. 1 Klick.',
    notes: 'Schnelle Cuts, Text-Overlays, trending Audio verwenden.',
    tags: ['KI', 'Automation', 'Quick Tip'], seriesId: 's2', assignee: 'Anna',
    checklist: [{ id: 'c1', label: 'Konzept', done: true }, { id: 'c2', label: 'Aufnahme', done: true }, { id: 'c3', label: 'Schnitt', done: true }, { id: 'c4', label: 'Beitragstext', done: true }, { id: 'c5', label: 'Audio', done: true }],
    ig: { caption: '🤖 4 Stunden manuelle Arbeit → 1 Klick.\n\nSo sieht KI-Automation in der Praxis aus.\n\nSpeicher dir das Reel für später! 💡', hashtags: ['#kiautomation', '#automation', '#business2025', '#marketingtips', '#workflow'], postType: 'reel', audioReference: 'Trending: Original Audio – Tech vibes' },
    versions: [],
  },
  {
    id: '4', platform: 'instagram', status: 'idea', priority: 'low', quality: 'neutral',
    createdAt: _d(-4, 8), updatedAt: _d(-4, 8),
    title: 'Behind the Scenes: Unser Tech-Stack', concept: 'Carousel Post der unseren kompletten Tech-Stack zeigt.',
    angle: 'Jede Slide ein Tool mit kurzer Erklärung warum wir es nutzen.',
    notes: '', tags: ['Behind the Scenes', 'Tech Stack'],
    ig: { caption: '', hashtags: ['#techstack', '#tools', '#agency'], postType: 'carousel', audioReference: '' },
    versions: [],
  },
  {
    id: '5', platform: 'youtube', status: 'idea', priority: 'medium', quality: 'good',
    createdAt: _d(-3, 12), updatedAt: _d(-3, 12),
    title: 'LinkedIn Outreach: 0 bis 50 Leads in 30 Tagen', concept: 'Case Study Video: Wie wir für einen Kunden in 30 Tagen 50 qualifizierte Leads über LinkedIn generiert haben.',
    angle: 'Echte Zahlen, echte Screenshots, keine Theorie.',
    notes: 'Kunde fragen ob wir die Zahlen zeigen dürfen.', tags: ['LinkedIn', 'Case Study', 'Leads'], seriesId: 's3',
    yt: { videoTitle: '', videoDescription: '', keywords: ['LinkedIn Outreach', 'B2B Leads', 'Case Study'], thumbnails: [], category: 'Business', targetAudience: 'B2B Unternehmer, Sales Teams' },
    versions: [],
  },
  {
    id: '6', platform: 'youtube', status: 'ready', priority: 'high', quality: 'good',
    createdAt: _d(-10, 9), updatedAt: _d(-1, 15), scheduledDate: _d(3, 15),
    title: 'Google Ads für Anfänger: Erste Kampagne in 20 Min', concept: 'Komplettes Anfänger-Tutorial für Google Ads. Vom Account-Setup bis zur ersten laufenden Kampagne.',
    angle: 'Kein Vorwissen nötig. In 20 Minuten live eine Kampagne aufsetzen.',
    notes: 'Video ist fertig geschnitten. Thumbnail A/B Test läuft.',
    tags: ['Google Ads', 'Tutorial', 'Anfänger'], assignee: 'Max', pinned: true,
    checklist: [{ id: 'c1', label: 'Script', done: true }, { id: 'c2', label: 'Aufnahme', done: true }, { id: 'c3', label: 'Schnitt', done: true }, { id: 'c4', label: 'Thumbnail A/B', done: false }, { id: 'c5', label: 'Upload', done: false }],
    yt: { videoTitle: 'Google Ads Tutorial: Erste Kampagne in 20 Minuten (Komplett-Anleitung)', videoDescription: 'Du willst mit Google Ads starten aber weißt nicht wie? In diesem Video zeige ich dir Schritt für Schritt...', keywords: ['Google Ads Tutorial', 'Google Ads Anfänger', 'PPC'], thumbnails: [], category: 'Tutorial', targetAudience: 'Anfänger, Selbstständige, kleine Unternehmen' },
    versions: [{ id: 'v1', label: 'v1', createdAt: _d(-10, 9), title: 'Google Ads Basics', description: '', notes: '' }, { id: 'v2', label: 'Final', createdAt: _d(-3, 11), title: 'Google Ads für Anfänger: Erste Kampagne in 20 Min', description: 'Komplett-Anleitung', notes: 'Titel optimiert für Search' }],
  },
  {
    id: '7', platform: 'instagram', status: 'live', priority: 'medium', quality: 'good',
    createdAt: _d(-12, 10), updatedAt: _d(-8, 18), publishedDate: _d(-8, 18),
    title: '3 Fehler bei Facebook Ads', concept: 'Reel: Die 3 häufigsten Fehler die Anfänger bei Facebook Ads machen.',
    angle: 'Schnelle Aufzählung mit Text-Overlays und Beispielen.',
    notes: '8.2k Views, 340 Likes, 52 Saves. Gut performt!',
    tags: ['Facebook Ads', 'Fehler', 'Tips'], seriesId: 's2',
    performance: { views: 8200, likes: 340, comments: 45, saves: 52, shares: 28 },
    ig: { caption: '❌ Diese 3 Fehler kosten dich bei Facebook Ads tausende Euro:\n\n1. Zu breites Targeting\n2. Kein Conversion-Tracking\n3. Budget zu früh skalieren\n\nSpeichern & Teilen! 💡', hashtags: ['#facebookads', '#marketingfehler', '#onlinemarketing', '#paidads'], postType: 'reel', audioReference: 'Trending Audio – Mistake compilation' },
    versions: [],
  },
  {
    id: '8', platform: 'youtube', status: 'archived', priority: 'low', quality: 'bad',
    createdAt: _d(-28, 8), updatedAt: _d(-26, 9),
    title: 'Was ist Marketing Automation?', concept: 'Erklärvideo: Was ist Marketing Automation und warum braucht man es.',
    angle: 'Grundlagen-Erklärung.',
    notes: 'Zu generisch, gibt es schon 1000 mal. Verworfen.',
    tags: ['Automation', 'Grundlagen'],
    performance: { views: 320, likes: 12, comments: 2 },
    yt: { videoTitle: '', videoDescription: '', keywords: ['Marketing Automation'], thumbnails: [], category: 'Education', targetAudience: '' },
    versions: [],
  },
  {
    id: '9', platform: 'instagram', status: 'scheduled', priority: 'high', quality: 'good',
    createdAt: _d(-2, 11), updatedAt: _d(-1, 14), scheduledDate: _d(0, 17),
    title: 'ROI von KI-Automation: Echte Zahlen', concept: 'Reel mit realen ROI-Zahlen aus unseren Kundenprojekten.',
    angle: 'Vorher/Nachher Zahlen mit schnellen Cuts.',
    notes: 'Kundendaten anonymisiert. Audio: Trending Tech Beat.',
    tags: ['KI', 'ROI', 'Case Study'], seriesId: 's3', assignee: 'Anna',
    checklist: [{ id: 'c1', label: 'Zahlen sammeln', done: true }, { id: 'c2', label: 'Aufnahme', done: true }, { id: 'c3', label: 'Schnitt', done: true }, { id: 'c4', label: 'Beitragstext', done: true }],
    ig: { caption: '📊 ROI von KI-Automation – echte Zahlen:\n\n→ 40h/Monat gespart\n→ 3x schnellere Durchlaufzeit\n→ 67% weniger Fehler\n\nDas ist kein Hype, das sind Fakten. 💡', hashtags: ['#kiautomation', '#roi', '#businessautomation', '#facts'], postType: 'reel', audioReference: 'Trending: Data visualization beats' },
    versions: [],
  },
  {
    id: '10', platform: 'youtube', status: 'scheduled', priority: 'medium', quality: 'good',
    createdAt: _d(-6, 10), updatedAt: _d(-1, 16), scheduledDate: _d(5, 15),
    title: 'ChatGPT vs Claude: Welche KI ist besser für Business?', concept: 'Direkter Vergleich beider KI-Modelle für Business-Anwendungen mit Live-Tests.',
    angle: 'Gleiche Aufgaben an beide AIs geben und Ergebnisse vergleichen.',
    notes: 'Beide Tools parallel testen. Screen Recording vorbereiten.',
    tags: ['KI', 'ChatGPT', 'Claude', 'Vergleich'], seriesId: 's1', assignee: 'Claudio',
    yt: { videoTitle: 'ChatGPT vs Claude: Der ultimative Business-Vergleich', videoDescription: 'Welche KI ist besser für dein Business? Ich teste beide mit den gleichen Aufgaben...', keywords: ['ChatGPT vs Claude', 'KI Vergleich', 'Business AI'], thumbnails: [], category: 'Tech', targetAudience: 'Unternehmer, Tech-Interessierte, 25-45' },
    versions: [],
  },
  // Facebook & LinkedIn items
  {
    id: '11', platform: 'facebook-linkedin', status: 'live', priority: 'high', quality: 'good',
    createdAt: _d(-10, 9), updatedAt: _d(-7, 14), publishedDate: _d(-7, 10),
    title: 'Warum 80% der KI-Projekte scheitern', concept: 'Thought Leadership Post über die häufigsten Gründe warum KI-Implementierungen fehlschlagen.',
    angle: 'Aus eigener Erfahrung: Was wir bei Kundenprojekten gelernt haben.',
    notes: 'LinkedIn: 45 Likes, 12 Kommentare, 5 Reposts. Überdurchschnittlich.',
    tags: ['KI', 'Thought Leadership', 'Business'], assignee: 'Claudio', pinned: true,
    performance: { views: 3200, likes: 45, comments: 12, shares: 5, clicks: 89 },
    fb: { caption: '80% der KI-Projekte scheitern. Nicht an der Technologie – sondern an diesen 3 Fehlern:\n\n1. Kein klares Problem definiert\n2. Zu viel auf einmal\n3. Team nicht mitgenommen\n\nWir haben das bei 20+ Kundenprojekten gesehen. Die erfolgreichen 20% machen es anders:\n\n→ Klein anfangen\n→ Einen Prozess automatisieren\n→ ROI messen, dann skalieren\n\nWas sind eure Erfahrungen?', hashtags: ['#ki', '#automation', '#business', '#digitalisierung', '#leadership'], postType: 'article', linkUrl: '', coverImage: undefined },
    versions: [],
  },
  {
    id: '12', platform: 'facebook-linkedin', status: 'scheduled', priority: 'medium', quality: 'good',
    createdAt: _d(-3, 11), updatedAt: _d(-1, 15), scheduledDate: _d(2, 10),
    title: 'Tool der Woche: Make.com', concept: 'Kurzer Carousel-Post der Make.com vorstellt und einen Use Case zeigt.',
    angle: 'Praxisbeispiel: Lead-Qualifizierung automatisiert.',
    notes: 'Screenshots aus echtem Workflow verwenden.',
    tags: ['Tools', 'Make.com', 'Automation'], seriesId: 's1',
    fb: { caption: '🔧 Tool der Woche: Make.com\n\nDamit automatisieren wir Workflows die früher Stunden gedauert haben.\n\nBeispiel: Lead kommt rein → Daten angereichert → CRM-Eintrag → Follow-up Mail.\n\nAlles in unter 5 Minuten eingerichtet. 🚀\n\n→ Swipe für den kompletten Workflow', hashtags: ['#makecom', '#automation', '#nocode', '#tools', '#workflow'], postType: 'carousel', linkUrl: 'https://www.make.com', coverImage: undefined },
    versions: [],
  },
  {
    id: '13', platform: 'facebook-linkedin', status: 'idea', priority: 'low', quality: 'neutral',
    createdAt: _d(-1, 16), updatedAt: _d(-1, 16),
    title: 'Team-Vorstellung: Wer steckt hinter Flowstack?', concept: 'Authentischer Post der das Team vorstellt.',
    angle: 'Persönlich, nahbar, mit echten Fotos.',
    notes: '', tags: ['Team', 'Behind the Scenes'],
    fb: { caption: '', hashtags: ['#team', '#agency', '#behindthescenes'], postType: 'carousel', linkUrl: '', coverImage: undefined },
    versions: [],
  },
];

const DEMO_RESEARCH: ResearchNote[] = [
  { id: 'r1', title: 'Trending YouTube Topics', content: 'AI Tools Videos performen gerade sehr gut. Besonders "Top X" Listen und Tutorials.\n\nBeste Upload-Zeit: Di/Do 15-17 Uhr.\n\nTrending Formate:\n- Tool Reviews\n- Case Studies mit echten Zahlen\n- "Ich habe X getestet" Videos', links: ['https://www.youtube.com/trends'], tags: ['YouTube', 'Trends', 'Research'], platform: 'youtube', createdAt: _d(-7, 10), updatedAt: _d(-7, 10) },
  { id: 'r2', title: 'Instagram Reels Best Practices', content: 'Optimale Reel-Länge: 15-30 Sekunden für maximale Retention.\n\nHook in den ersten 1-2 Sekunden.\n\nText-Overlays erhöhen Engagement um 40%.\n\nTrending Audios wöchentlich checken.', links: [], tags: ['Instagram', 'Reels', 'Best Practices'], platform: 'instagram', createdAt: _d(-5, 14), updatedAt: _d(-5, 14) },
];

// ============================================
// TOAST HOOK
// ============================================
function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);
  const dismissToast = useCallback((id: string) => setToasts(prev => prev.filter(t => t.id !== id)), []);
  return { toasts, addToast, dismissToast };
}

const ToastContainer = ({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) => (
  <div className="fixed bottom-6 right-6 z-[100] space-y-2">
    {toasts.map(t => (
      <div key={t.id} onClick={() => onDismiss(t.id)} className={`px-5 py-3 rounded-2xl text-white text-sm font-medium shadow-2xl cursor-pointer animate-slide-in-right ${t.type === 'success' ? 'bg-emerald-500' : t.type === 'error' ? 'bg-red-500' : 'bg-purple-500'}`}>
        {t.message}
      </div>
    ))}
  </div>
);

// ---- Demo File Links ----
const DEMO_FILES: FileLink[] = [
  { id: 'f1', name: 'Q1 Marketing Strategie', url: 'https://docs.google.com/document/d/example1', description: 'Gesamtstrategie für Q1 mit Zielen und KPIs', category: 'marketing', labels: ['ZG Analyse', 'Copy'], createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 'f2', name: 'Sales Skript v3', url: 'https://docs.google.com/document/d/example2', description: 'Aktuelles Sales Skript für Erstgespräche', category: 'sales', labels: ['Sales Skript'], createdAt: new Date(Date.now() - 86400000 * 20).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: 'f3', name: 'Video Transkript - AI Workshop', url: 'https://drive.google.com/file/d/example3', description: 'Vollständiges Transkript vom AI Workshop Video', category: 'dev', labels: ['Transkript'], createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: 'f4', name: 'Onboarding Checkliste', url: 'https://notion.so/example4', description: 'Onboarding-Prozess für neue Teammitglieder', category: 'operations', labels: ['Onboarding Skript', 'SOP', 'Checkliste'], createdAt: new Date(Date.now() - 86400000 * 30).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 7).toISOString() },
  { id: 'f5', name: 'YouTube Thumbnail Vorlagen', url: 'https://www.canva.com/design/example5', description: 'Canva Vorlagen für YouTube Thumbnails', category: 'content', labels: ['Vorlage'], createdAt: new Date(Date.now() - 86400000 * 15).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 15).toISOString() },
  { id: 'f6', name: 'Pitch Deck Flowstack', url: 'https://docs.google.com/presentation/d/example6', description: 'Investor Pitch Deck - letzte Version', category: 'sales', labels: ['Pitch Deck'], createdAt: new Date(Date.now() - 86400000 * 45).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 1).toISOString() },
];

// ---- File prefix mapping from labels ----
const FILE_PREFIX_MAP: Record<string, { de: string; en: string }> = {
  'Sales Skript': { de: 'Skript', en: 'Script' },
  'Onboarding Skript': { de: 'Onboarding', en: 'Onboarding' },
  'Transkript': { de: 'Transkript', en: 'Transcript' },
  'Pitch Deck': { de: 'Pitch Deck', en: 'Pitch Deck' },
  'SOP': { de: 'SOP', en: 'SOP' },
  'Vorlage': { de: 'Vorlage', en: 'Template' },
  'Briefing': { de: 'Briefing', en: 'Briefing' },
  'Analyse': { de: 'Analyse', en: 'Analysis' },
  'Checkliste': { de: 'Checkliste', en: 'Checklist' },
  'Leitfaden': { de: 'Anleitung', en: 'Guide' },
  'Template': { de: 'Template', en: 'Template' },
  'ZG Analyse': { de: 'Strategie', en: 'Strategy' },
  'Copy': { de: 'Copy', en: 'Copy' },
};

// Translate file name prefix between de/en at render time
const translateFilePrefix = (name: string, targetLang: 'de' | 'en'): string => {
  const srcLang = targetLang === 'de' ? 'en' : 'de';
  for (const pfx of Object.values(FILE_PREFIX_MAP)) {
    const src = pfx[srcLang];
    const tgt = pfx[targetLang];
    if (src !== tgt && name.startsWith(src + ': ')) {
      return tgt + ': ' + name.slice(src.length + 2);
    }
  }
  return name;
};

// ---- Demo Plans ----
const DEMO_PLANS: MarketingPlan[] = [
  {
    id: 'plan1', name: 'Q1 Content Plan', description: 'Content-Strategie für YouTube, Instagram und LinkedIn',
    strategy: 'Fokus auf YouTube als Hauptplattform. Content-Repurposing für Instagram und LinkedIn. Ziel: 1000 Subscriber in Q1. Wöchentlich 1 Video, 3 Reels, 2 LinkedIn-Posts.',
    deadline: new Date(Date.now() + 86400000 * 60).toISOString().split('T')[0],
    notes: '',
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    sections: [
      { id: 's1', name: 'YouTube', color: 'red', tasks: [
        { id: 't1', title: 'Kanal-Branding überarbeiten', description: 'Banner, Logo, About-Sektion', frequency: 'once', done: true, order: 0, priority: 'high', status: 'done', isMMA: false },
        { id: 't2', title: 'SEO-Keyword-Recherche', description: '50 Keywords pro Nische', frequency: 'once', done: false, order: 1, priority: 'high', status: 'in-progress', isMMA: true, dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0] },
        { id: 't3', title: 'Content aufbereiten (Script + Aufnahme)', description: 'Wöchentlicher Content-Block', frequency: 'weekly', dayOfWeek: 0, done: false, order: 2, priority: 'high', isMMA: true },
        { id: 't4', title: 'Video schneiden & hochladen', description: '', frequency: 'weekly', dayOfWeek: 2, done: false, order: 3, priority: 'medium', isMMA: true },
        { id: 't5', title: 'Analytics pruefen', description: 'Views, CTR, Retention', frequency: 'weekly', dayOfWeek: 4, done: false, order: 4, priority: 'low' },
        { id: 't6', title: 'Performance-Review', description: 'Monatliche Strategie-Anpassung', frequency: 'monthly', done: false, order: 5, priority: 'medium' },
      ]},
      { id: 's2', name: 'Instagram', color: 'pink', tasks: [
        { id: 't7', title: 'Grid-Layout planen', description: 'Feed-Aesthetik festlegen', frequency: 'once', done: false, order: 0, priority: 'medium', status: 'todo' },
        { id: 't8', title: 'Content aufbereiten (Reels + Posts)', description: '', frequency: 'weekly', dayOfWeek: 0, done: false, order: 1, priority: 'high', isMMA: true },
        { id: 't9', title: 'Stories vorbereiten', description: 'Behind-the-scenes + Engagement', frequency: 'weekly', dayOfWeek: 3, done: false, order: 2, priority: 'low' },
        { id: 't10', title: 'Kommentare beantworten', description: '', frequency: 'daily', done: false, order: 3, priority: 'medium' },
      ]},
      { id: 's3', name: 'LinkedIn', color: 'blue', tasks: [
        { id: 't11', title: 'Content-Strategie definieren', description: 'Themen, Tone, Posting-Frequenz', frequency: 'once', done: true, order: 0, priority: 'high', status: 'done', isMMA: true },
        { id: 't12', title: 'Posts schreiben & planen', description: '2-3 Posts pro Woche', frequency: 'weekly', dayOfWeek: 1, done: false, order: 1, priority: 'high', isMMA: true },
      ]},
      { id: 's4', name: 'Allgemein', color: 'amber', tasks: [
        { id: 't13', title: 'Content-Kalender aufsetzen', description: 'Alle Plattformen in einem Kalender', frequency: 'once', done: true, order: 0, priority: 'high', status: 'done' },
        { id: 't14', title: 'Wochenplanung', description: 'Montags: Überblick & Prioritäten', frequency: 'weekly', dayOfWeek: 0, done: false, order: 1, priority: 'medium' },
        { id: 't15', title: 'Wochen-Review', description: 'Freitags: Was lief gut, was nicht?', frequency: 'weekly', dayOfWeek: 4, done: false, order: 2, priority: 'low' },
      ]},
    ],
  },
];

// ============================================
// PLAN GENERATION
// ============================================

const channelMeta: Record<PlanChannel, { icon: string; label: string; color: string; category: ChannelCategory }> = {
  youtube:      { icon: '🎬', label: 'YouTube',     color: 'red',     category: 'content' },
  instagram:    { icon: '📸', label: 'Instagram',   color: 'pink',    category: 'content' },
  linkedin:     { icon: '💼', label: 'LinkedIn',    color: 'blue',    category: 'content' },
  tiktok:       { icon: '🎵', label: 'TikTok',     color: 'purple',  category: 'content' },
  podcast:      { icon: '🎙️', label: 'Podcast',     color: 'emerald', category: 'content' },
  'cold-calls': { icon: '📞', label: 'Cold Calls',  color: 'sky',     category: 'outreach' },
  'cold-emails':{ icon: '✉️', label: 'Cold Emails', color: 'amber',   category: 'outreach' },
  dmc:          { icon: '📬', label: 'Direct Mail',  color: 'red',     category: 'outreach' },
  pvc:          { icon: '📹', label: 'PVC',          color: 'indigo',  category: 'outreach' },
  ads:          { icon: '📣', label: 'Ads',          color: 'rose',    category: 'paid' },
  homepage:     { icon: '🌐', label: 'Homepage',     color: 'sky',     category: 'assets' },
  funnel:       { icon: '🔄', label: 'Funnel',       color: 'purple',  category: 'assets' },
};

// SVG brand logos & icons for channels
const channelSvgIcon = (ch: string, size = 18): React.ReactNode => {
  const s = { width: size, height: size, className: 'flex-shrink-0' };
  switch (ch) {
    case 'youtube': return <svg {...s} viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#FF0000"/><path d="M9.5 7.5v9l7.5-4.5-7.5-4.5z" fill="#fff"/></svg>;
    case 'instagram': return <svg {...s} viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#E1306C"/><rect x="4.5" y="4.5" width="15" height="15" rx="4" fill="none" stroke="#fff" strokeWidth="1.5"/><circle cx="12" cy="12" r="3.8" fill="none" stroke="#fff" strokeWidth="1.5"/><circle cx="17" cy="7" r="1.2" fill="#fff"/></svg>;
    case 'linkedin': return <svg {...s} viewBox="0 0 24 24"><rect width="24" height="24" rx="3" fill="#0A66C2"/><path d="M8.2 19H5.7v-8.5h2.5V19zm-1.25-9.7a1.45 1.45 0 110-2.9 1.45 1.45 0 010 2.9zM19 19h-2.5v-4.2c0-1.1-.4-1.8-1.4-1.8-.8 0-1.2.5-1.4 1v5h-2.5s.03-8.5 0-9.5h2.5v1.4c.3-.6 1-1.3 2.3-1.3 1.7 0 2.9 1.1 2.9 3.5V19z" fill="#fff"/></svg>;
    case 'tiktok': return <svg {...s} viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#010101"/><path d="M16.8 8.6A4.1 4.1 0 0114.3 8v5.4a4.3 4.3 0 11-3.6-4.2v2.2a2.1 2.1 0 101.4 2V5.2h2.3a4.1 4.1 0 002.4 3.4z" fill="#fff"/></svg>;
    case 'podcast': return <svg {...s} viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#9333EA"/><path d="M12 5a3.5 3.5 0 00-3.5 3.5V12a3.5 3.5 0 007 0V8.5A3.5 3.5 0 0012 5zm-1 14.5v-1.6a5.5 5.5 0 01-4.5-5.4h1.5a4 4 0 008 0H17.5a5.5 5.5 0 01-4.5 5.4v1.6H15v1h-6v-1h2z" fill="#fff"/></svg>;
    case 'cold-calls': return <svg {...s} viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#0EA5E9"/><path d="M8 6a2 2 0 00-2 2v1a8 8 0 008 8h1a2 2 0 002-2v-1.5a1 1 0 00-.7-1l-2.3-.7a1 1 0 00-1 .3l-.7.8a6 6 0 01-3.2-3.2l.8-.7a1 1 0 00.3-1L9.5 6.7a1 1 0 00-1-.7H8z" fill="#fff"/></svg>;
    case 'cold-emails': return <svg {...s} viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#F59E0B"/><path d="M5 8.5l7 4.5 7-4.5M5 8a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 01-1 1H6a1 1 0 01-1-1V8z" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round"/></svg>;
    case 'dmc': return <svg {...s} viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#EF4444"/><path d="M5 9l7 4 7-4M4 8a1 1 0 011-1h14a1 1 0 011 1v8a1 1 0 01-1 1H5a1 1 0 01-1-1V8z" fill="none" stroke="#fff" strokeWidth="1.3" strokeLinejoin="round"/><path d="M15 5l2 2-2 2" fill="none" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    case 'pvc': return <svg {...s} viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#6366F1"/><path d="M6 7h8a1 1 0 011 1v8a1 1 0 01-1 1H6a1 1 0 01-1-1V8a1 1 0 011-1zm10 2.5l3-1.5v8l-3-1.5" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round"/></svg>;
    case 'ads': return <svg {...s} viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#F43F5E"/><path d="M14 8l4-2v12l-4-2V8zM6 9h8v6H6a1 1 0 01-1-1v-4a1 1 0 011-1z" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round"/></svg>;
    case 'homepage': return <svg {...s} viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#0EA5E9"/><circle cx="12" cy="12" r="6" fill="none" stroke="#fff" strokeWidth="1.3"/><ellipse cx="12" cy="12" rx="3" ry="6" fill="none" stroke="#fff" strokeWidth="1.3"/><path d="M6 12h12M12 6v12" fill="none" stroke="#fff" strokeWidth="1" opacity=".6"/></svg>;
    case 'funnel': return <svg {...s} viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#8B5CF6"/><path d="M5 7h14l-4.5 5.5V17l-5 2v-6.5L5 7z" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round"/></svg>;
    default: return null;
  }
};

// Default funnel steps per outreach channel — each step: label + % transition rate from previous
const defaultFunnels: Record<string, FunnelStep[]> = {
  'cold-calls': [
    { label: 'Erreicht', rate: 40 },
    { label: 'Entscheider', rate: 50 },
    { label: 'Termin', rate: 15 },
    { label: 'Kunde', rate: 20 },
  ],
  'cold-emails': [
    { label: 'Geöffnet', rate: 35 },
    { label: 'Geantwortet', rate: 8 },
    { label: 'Termin', rate: 30 },
    { label: 'Kunde', rate: 20 },
  ],
  linkedin: [
    { label: 'Angenommen', rate: 30 },
    { label: 'Nachricht gesendet', rate: 90 },
    { label: 'Antwort', rate: 20 },
    { label: 'Termin', rate: 25 },
    { label: 'Kunde', rate: 20 },
  ],
  pvc: [
    { label: 'Erreicht', rate: 40 },
    { label: 'Video akzeptiert', rate: 60 },
    { label: 'Video gesehen', rate: 70 },
    { label: 'Follow-up Call', rate: 80 },
    { label: 'Termin', rate: 30 },
    { label: 'Kunde', rate: 25 },
  ],
  dmc: [
    { label: 'Zugestellt', rate: 95 },
    { label: 'Rückmeldung', rate: 3 },
    { label: 'Termin', rate: 40 },
    { label: 'Kunde', rate: 20 },
  ],
};

// Calculate total conversion through all funnel steps
const calcFunnelOutput = (perDay: number, steps: FunnelStep[]) => {
  let current = perDay;
  const throughput: number[] = [perDay];
  for (const step of steps) {
    current = current * (step.rate / 100);
    throughput.push(current);
  }
  return { finalPerDay: current, throughput };
};

const generatePlanSections = (
  channels: PlanChannel[],
  config: Record<string, ChannelConfig>,
  planningDay: number,
  _planningCycle: string,
  revenueMetrics?: { revenueGoal: number; productPrice: number; conversionLow: number; conversionHigh: number; weeksLeft: number | null }
): PlanSection[] => {
  const sections: PlanSection[] = [];
  const now = Date.now();
  let taskCounter = 0;
  const tid = () => `gen-t${++taskCounter}-${now}`;
  const pf = (ch: string): TaskFrequency => {
    const f = config[ch]?.postingFrequency;
    return f === 'daily' ? 'daily' : f === '3x-week' ? 'weekly' : f === '2x-week' ? 'weekly' : 'weekly';
  };

  const has = (ch: PlanChannel) => channels.includes(ch);
  const hasYT = has('youtube');

  // ── ASSETS (first — prerequisites) ──
  if (has('homepage')) {
    const t: PlanTask[] = [];
    const designId = tid(); const textsId = tid();
    t.push({ id: designId, title: 'Homepage Design erstellen', description: 'Layout, Wireframes, UI Design', frequency: 'once', done: false, order: 0, priority: 'high', status: 'todo', isMMA: true });
    t.push({ id: textsId, title: 'Homepage Texte schreiben', description: 'Copy, Headlines, CTAs', frequency: 'once', done: false, order: 1, priority: 'high', status: 'todo', isMMA: true });
    const devId = tid();
    t.push({ id: devId, title: 'Homepage Entwicklung', description: 'Umsetzung / Entwicklung', frequency: 'once', done: false, order: 2, priority: 'high', status: 'todo', isMMA: true, dependsOn: [designId, textsId] });
    t.push({ id: tid(), title: 'SEO-Setup', description: 'Meta Tags, Sitemap, Search Console', frequency: 'once', done: false, order: 3, priority: 'medium', status: 'todo', dependsOn: [devId] });
    t.push({ id: tid(), title: 'Analytics einrichten', description: 'Google Analytics, Tracking Pixel', frequency: 'once', done: false, order: 4, priority: 'medium', status: 'todo', dependsOn: [devId] });
    sections.push({ id: `sec-${now}-hp`, name: 'Homepage', color: 'sky', tasks: t });
  }
  if (has('funnel')) {
    const t: PlanTask[] = [];
    const fType = config.funnel?.funnelType || 'homepage';
    const fLabel = fType === 'vsl' ? 'VSL' : fType === 'webinar' ? 'Webinar' : 'Homepage';
    t.push({ id: tid(), title: `${fLabel}-Funnel Strategie planen`, description: 'Zielgruppe, Offer, Conversion-Ziele', frequency: 'once', done: false, order: 0, priority: 'high', status: 'todo', isMMA: true });
    const lpId = tid();
    t.push({ id: lpId, title: 'Landingpage erstellen', description: 'Design, Copy, Opt-in Form', frequency: 'once', done: false, order: 1, priority: 'high', status: 'todo', isMMA: true });
    const emailId = tid();
    t.push({ id: emailId, title: 'E-Mail-Sequenz aufsetzen', description: 'Follow-up Mails, Nurturing', frequency: 'once', done: false, order: 2, priority: 'high', status: 'todo', dependsOn: [lpId] });
    if (fType === 'vsl') t.push({ id: tid(), title: 'VSL Video erstellen', description: 'Video Sales Letter produzieren', frequency: 'once', done: false, order: 3, priority: 'high', status: 'todo', isMMA: true });
    if (fType === 'webinar') t.push({ id: tid(), title: 'Webinar aufsetzen', description: 'Slides, Plattform, Registrierung', frequency: 'once', done: false, order: 3, priority: 'high', status: 'todo', isMMA: true });
    t.push({ id: tid(), title: 'Traffic-Quelle einrichten', description: 'Ads, Organic, Partnerships', frequency: 'once', done: false, order: 4, priority: 'high', status: 'todo', dependsOn: [lpId] });
    t.push({ id: tid(), title: 'Funnel testen & optimieren', description: 'Conversion-Rate, A/B Tests', frequency: 'once', done: false, order: 5, priority: 'medium', status: 'todo' });
    sections.push({ id: `sec-${now}-fn`, name: `Funnel (${fLabel})`, color: 'purple', tasks: t });
  }

  // ── CONTENT CHANNELS ──
  if (hasYT) {
    const t: PlanTask[] = [];
    const scriptId = tid();
    t.push({ id: scriptId, title: 'Script schreiben', description: 'Recherche + Outline + Script', frequency: pf('youtube'), dayOfWeek: planningDay, done: false, order: 0, priority: 'high', status: 'todo', isMMA: true });
    const recordId = tid();
    t.push({ id: recordId, title: 'Video aufnehmen', description: 'Kamera + Audio Setup', frequency: pf('youtube'), done: false, order: 1, priority: 'high', status: 'todo', isMMA: true, dependsOn: [scriptId] });
    const editVidId = tid();
    t.push({ id: editVidId, title: 'Video schneiden', description: 'Schnitt, Grafiken, Color Grading', frequency: pf('youtube'), done: false, order: 2, priority: 'high', status: 'todo', isMMA: true, dependsOn: [recordId] });
    const thumbId = tid();
    t.push({ id: thumbId, title: 'Thumbnail erstellen', description: 'A/B-Varianten erstellen', frequency: pf('youtube'), done: false, order: 3, priority: 'medium', status: 'todo' });
    t.push({ id: tid(), title: 'Upload & SEO', description: 'Title, Description, Tags, Endscreens', frequency: pf('youtube'), done: false, order: 4, priority: 'high', status: 'todo', isMMA: true, dependsOn: [editVidId, thumbId] });
    t.push({ id: tid(), title: 'Analytics prüfen', description: 'Views, CTR, Retention', frequency: 'weekly', dayOfWeek: 5, done: false, order: 5, priority: 'low', status: 'todo' });
    sections.push({ id: `sec-${now}-yt`, name: 'YouTube', color: 'red', tasks: t });
  }
  if (has('instagram')) {
    const t: PlanTask[] = [];
    const ytSec = sections.find(s => s.name === 'YouTube');
    const ytEdit = ytSec?.tasks.find(tk => tk.title === 'Video schneiden');
    const ytScript = ytSec?.tasks.find(tk => tk.title === 'Script schreiben');
    t.push({ id: tid(), title: 'Reels schneiden', description: hasYT ? 'Hooks + Reels aus YT-Video' : 'Reels erstellen', frequency: pf('instagram'), done: false, order: 0, priority: 'high', status: 'todo', isMMA: true, ...(ytEdit ? { dependsOn: [ytEdit.id] } : {}) });
    t.push({ id: tid(), title: 'Carousel erstellen', description: hasYT ? 'Key Points aus YT-Script' : 'Carousel-Inhalte', frequency: pf('instagram'), done: false, order: 1, priority: 'medium', status: 'todo', ...(ytScript ? { dependsOn: [ytScript.id] } : {}) });
    t.push({ id: tid(), title: 'Stories posten', description: 'Behind-the-scenes + Engagement', frequency: 'weekly', done: false, order: 2, priority: 'low', status: 'todo' });
    t.push({ id: tid(), title: 'Community-Engagement', description: 'Kommentare, DMs, Interaktion', frequency: 'daily', done: false, order: 3, priority: 'medium', status: 'todo' });
    sections.push({ id: `sec-${now}-ig`, name: 'Instagram', color: 'pink', tasks: t });
  }
  if (has('linkedin')) {
    const t: PlanTask[] = [];
    const ytScript = sections.find(s => s.name === 'YouTube')?.tasks.find(tk => tk.title === 'Script schreiben');
    const ytUpload = sections.find(s => s.name === 'YouTube')?.tasks.find(tk => tk.title === 'Upload & SEO');
    t.push({ id: tid(), title: 'Fachartikel schreiben', description: hasYT ? 'Aus YT-Script ableiten' : 'Fachthema aufbereiten', frequency: pf('linkedin'), done: false, order: 0, priority: 'high', status: 'todo', isMMA: true, ...(ytScript ? { dependsOn: [ytScript.id] } : {}) });
    t.push({ id: tid(), title: 'Post schreiben', description: hasYT ? 'YT-Promotion + Insights' : 'Thought Leadership', frequency: 'weekly', dayOfWeek: 2, done: false, order: 1, priority: 'high', status: 'todo', isMMA: true, ...(ytUpload ? { dependsOn: [ytUpload.id] } : {}) });
    t.push({ id: tid(), title: 'Netzwerk-Engagement', description: 'Kommentare, Connections, Gruppen', frequency: 'daily', done: false, order: 2, priority: 'medium', status: 'todo' });
    sections.push({ id: `sec-${now}-li`, name: 'LinkedIn', color: 'blue', tasks: t });
  }
  if (has('tiktok')) {
    const t: PlanTask[] = [];
    const ytEdit = sections.find(s => s.name === 'YouTube')?.tasks.find(tk => tk.title === 'Video schneiden');
    t.push({ id: tid(), title: 'Shorts schneiden', description: hasYT ? 'Aus YT-Video Shorts' : 'Kurzvideos erstellen', frequency: pf('tiktok'), done: false, order: 0, priority: 'high', status: 'todo', isMMA: true, ...(ytEdit ? { dependsOn: [ytEdit.id] } : {}) });
    t.push({ id: tid(), title: 'Trends recherchieren', description: 'Trending Sounds, Hashtags', frequency: 'weekly', done: false, order: 1, priority: 'medium', status: 'todo' });
    sections.push({ id: `sec-${now}-tt`, name: 'TikTok', color: 'purple', tasks: t });
  }
  if (has('podcast')) {
    const t: PlanTask[] = [];
    const ytRecord = sections.find(s => s.name === 'YouTube')?.tasks.find(tk => tk.title === 'Video aufnehmen');
    const exId = tid();
    t.push({ id: exId, title: 'Audio extrahieren', description: hasYT ? 'Audio aus YT-Video' : 'Audio aufnehmen', frequency: pf('podcast'), done: false, order: 0, priority: 'high', status: 'todo', isMMA: true, ...(ytRecord ? { dependsOn: [ytRecord.id] } : {}) });
    const aeId = tid();
    t.push({ id: aeId, title: 'Audio editieren', description: 'Schnitt, Intro/Outro, Mastering', frequency: pf('podcast'), done: false, order: 1, priority: 'high', status: 'todo', dependsOn: [exId] });
    t.push({ id: tid(), title: 'Podcast hochladen', description: 'Spotify, Apple, Show Notes', frequency: pf('podcast'), done: false, order: 2, priority: 'high', status: 'todo', isMMA: true, dependsOn: [aeId] });
    sections.push({ id: `sec-${now}-pod`, name: 'Podcast', color: 'emerald', tasks: t });
  }

  // ── OUTREACH CHANNELS ──
  if (has('cold-calls')) {
    const t: PlanTask[] = [];
    const cnt = config['cold-calls']?.countPerDay || 20;
    const tStart = config['cold-calls']?.timeStart || '09:00';
    const tEnd = config['cold-calls']?.timeEnd || '12:00';
    t.push({ id: tid(), title: 'Kontaktliste aufbauen', description: 'Zielkontakte recherchieren & pflegen', frequency: 'once', done: false, order: 0, priority: 'high', status: 'todo', isMMA: true });
    t.push({ id: tid(), title: 'Skript/Leitfaden erstellen', description: 'Gesprächsleitfaden + Einwandbehandlung', frequency: 'once', done: false, order: 1, priority: 'high', status: 'todo', isMMA: true });
    t.push({ id: tid(), title: `Cold Calls durchführen (${cnt}/Tag)`, description: `${tStart}–${tEnd} Uhr, ${cnt} Anrufe/Tag`, frequency: 'daily', done: false, order: 2, priority: 'high', status: 'todo', isMMA: true });
    t.push({ id: tid(), title: 'Follow-ups nachfassen', description: 'Callbacks & Nachfassen', frequency: 'daily', done: false, order: 3, priority: 'medium', status: 'todo' });
    sections.push({ id: `sec-${now}-cc`, name: 'Cold Calls', color: 'sky', tasks: t });
  }
  if (has('cold-emails')) {
    const t: PlanTask[] = [];
    const cnt = config['cold-emails']?.countPerDay || 30;
    t.push({ id: tid(), title: 'E-Mail-Templates erstellen', description: 'Cold-Email Vorlagen + Follow-up Sequenz', frequency: 'once', done: false, order: 0, priority: 'high', status: 'todo', isMMA: true });
    t.push({ id: tid(), title: 'Lead-Liste aufbauen', description: 'E-Mail-Adressen recherchieren', frequency: 'once', done: false, order: 1, priority: 'high', status: 'todo', isMMA: true });
    t.push({ id: tid(), title: `Cold Emails versenden (${cnt}/Tag)`, description: `${cnt} Mails pro Tag`, frequency: 'daily', done: false, order: 2, priority: 'high', status: 'todo', isMMA: true });
    t.push({ id: tid(), title: 'Follow-up Sequenz prüfen', description: 'Automatische Follow-ups checken', frequency: 'weekly', done: false, order: 3, priority: 'medium', status: 'todo' });
    t.push({ id: tid(), title: 'Bounce/Reply-Rate analysieren', description: 'Deliverability & Performance', frequency: 'weekly', done: false, order: 4, priority: 'low', status: 'todo' });
    sections.push({ id: `sec-${now}-ce`, name: 'Cold Emails', color: 'amber', tasks: t });
  }
  if (has('dmc')) {
    const t: PlanTask[] = [];
    const designId = tid(); const listeId = tid();
    t.push({ id: designId, title: 'Mailer/Flyer designen', description: 'Design + Druckvorlage erstellen', frequency: 'once', done: false, order: 0, priority: 'high', status: 'todo', isMMA: true });
    t.push({ id: listeId, title: 'Mailing-Liste zusammenstellen', description: 'Adressen recherchieren & aufbereiten', frequency: 'once', done: false, order: 1, priority: 'high', status: 'todo' });
    const sendId = tid();
    t.push({ id: sendId, title: 'Mailer drucken & versenden', description: 'Druckerei + Versand', frequency: 'once', done: false, order: 2, priority: 'high', status: 'todo', isMMA: true, dependsOn: [designId, listeId] });
    t.push({ id: tid(), title: 'Rückmeldungen nachfassen', description: 'Responses tracken & Follow-up', frequency: 'weekly', done: false, order: 3, priority: 'medium', status: 'todo', dependsOn: [sendId] });
    sections.push({ id: `sec-${now}-dmc`, name: 'Direct Mail', color: 'red', tasks: t });
  }
  if (has('pvc')) {
    const t: PlanTask[] = [];
    const cnt = config.pvc?.countPerDay || 15;
    const tStart = config.pvc?.timeStart || '09:00';
    const tEnd = config.pvc?.timeEnd || '12:00';
    t.push({ id: tid(), title: 'Kontaktliste aufbauen', description: 'Zielkontakte recherchieren', frequency: 'once', done: false, order: 0, priority: 'high', status: 'todo', isMMA: true });
    t.push({ id: tid(), title: 'Video-Template erstellen', description: 'Personalisiertes Video-Script', frequency: 'once', done: false, order: 1, priority: 'high', status: 'todo', isMMA: true });
    const step1Id = tid();
    t.push({ id: step1Id, title: `Schritt 1: Anruf (${cnt}/Tag)`, description: `${tStart}–${tEnd} Uhr — Fragen ob Video gewünscht`, frequency: 'daily', done: false, order: 2, priority: 'high', status: 'todo', isMMA: true });
    const step2Id = tid();
    t.push({ id: step2Id, title: 'Schritt 2: Video per Mail senden', description: 'Personalisiertes Video verschicken', frequency: 'daily', done: false, order: 3, priority: 'high', status: 'todo', dependsOn: [step1Id] });
    t.push({ id: tid(), title: 'Schritt 3: Follow-up Call (+2 Tage)', description: 'Nachfassen & Lead abschließen', frequency: 'daily', done: false, order: 4, priority: 'high', status: 'todo', isMMA: true, dependsOn: [step2Id] });
    t.push({ id: tid(), title: 'Ergebnisse tracken', description: 'Conversion-Rate, Pipeline', frequency: 'weekly', done: false, order: 5, priority: 'medium', status: 'todo' });
    sections.push({ id: `sec-${now}-pvc`, name: 'PVC (Video-Strategie)', color: 'indigo', tasks: t });
  }

  // ── ADS ──
  if (has('ads')) {
    const t: PlanTask[] = [];
    const hpSec = sections.find(s => s.name === 'Homepage');
    const hpDev = hpSec?.tasks.find(tk => tk.title === 'Homepage Entwicklung');
    t.push({ id: tid(), title: 'Ad-Strategie definieren', description: 'Zielgruppen, Budget, Kampagnenstruktur', frequency: 'once', done: false, order: 0, priority: 'high', status: 'todo', isMMA: true });
    const creativeId = tid();
    t.push({ id: creativeId, title: 'Creatives erstellen', description: 'Bilder, Videos, Copy für Ads', frequency: 'once', done: false, order: 1, priority: 'high', status: 'todo', isMMA: true });
    const platforms = config.ads?.adsPlatforms || ['meta'];
    platforms.forEach((plat, i) => {
      const label = plat === 'meta' ? 'Meta' : plat === 'google' ? 'Google' : plat === 'linkedin' ? 'LinkedIn' : plat === 'tiktok' ? 'TikTok' : plat;
      t.push({ id: tid(), title: `${label} Ads Kampagne aufsetzen`, description: `${label} Ads konfigurieren & starten`, frequency: 'once', done: false, order: 2 + i, priority: 'high', status: 'todo', isMMA: true, dependsOn: [creativeId, ...(hpDev ? [hpDev.id] : [])] });
    });
    t.push({ id: tid(), title: 'Ads optimieren', description: 'A/B Tests, Budget-Shifts', frequency: 'weekly', done: false, order: 10, priority: 'medium', status: 'todo' });
    t.push({ id: tid(), title: 'Performance analysieren', description: 'ROAS, CPA, Conversions', frequency: 'weekly', done: false, order: 11, priority: 'medium', status: 'todo' });
    t.push({ id: tid(), title: 'Budget-Review', description: 'Monatliche Budget-Auswertung', frequency: 'monthly', done: false, order: 12, priority: 'low', status: 'todo' });
    sections.push({ id: `sec-${now}-ads`, name: 'Ads / Werbeanzeigen', color: 'rose', tasks: t });
  }

  // ── ALLGEMEIN (always) ──
  const contentChannels = channels.filter(c => channelMeta[c].category === 'content');
  const genTasks: PlanTask[] = [
    { id: tid(), title: 'Wochenplanung', description: 'Überblick & Prioritäten setzen', frequency: 'weekly', dayOfWeek: 0, done: false, order: 0, priority: 'medium', status: 'todo' },
    { id: tid(), title: 'Wochen-Review', description: 'Was lief gut, was nicht?', frequency: 'weekly', dayOfWeek: 4, done: false, order: 1, priority: 'low', status: 'todo' },
  ];
  if (contentChannels.length > 0) {
    genTasks.push({ id: tid(), title: 'Content planen & vorbereiten', description: `Planungstag: ${['Mo','Di','Mi','Do','Fr','Sa','So'][planningDay]}`, frequency: 'weekly', dayOfWeek: planningDay, done: false, order: 2, priority: 'high', status: 'todo', isMMA: true });
  }
  if (revenueMetrics) {
    const { revenueGoal, productPrice, conversionLow, conversionHigh, weeksLeft } = revenueMetrics;
    const cust = Math.ceil(revenueGoal / productPrice);
    const leadsOpt = Math.ceil(cust / (conversionHigh / 100));
    const leadsCons = Math.ceil(cust / (conversionLow / 100));
    const daily = weeksLeft ? `~${Math.ceil(leadsOpt / (weeksLeft * 5))} – ${Math.ceil(leadsCons / (weeksLeft * 5))}/Tag` : '';
    genTasks.push({ id: tid(), title: 'Ziel-Tracking & KPIs prüfen', description: `Ziel: ${revenueGoal.toLocaleString('de-DE')}€ → ${cust} Kunden → ${leadsOpt}–${leadsCons} Leads benötigt${daily ? ` (${daily})` : ''}`, frequency: 'weekly', dayOfWeek: 4, done: false, order: genTasks.length, priority: 'high', status: 'todo' });
  }
  sections.push({ id: `sec-${now}-gen`, name: 'Allgemein', color: 'gray', tasks: genTasks });
  // Auto-assign phase numbers based on chronological order
  const phaseOrder = (name: string) => {
    if (['Homepage', 'Funnel'].some(k => name.includes(k))) return 0;
    if (['YouTube', 'Instagram', 'LinkedIn', 'TikTok', 'Podcast', 'Content'].some(k => name.includes(k))) return 1;
    if (['Cold Calls', 'Cold Emails', 'Direct Mail', 'DMC', 'PVC'].some(k => name.includes(k))) return 2;
    if (['Ads', 'Werbeanzeigen'].some(k => name.includes(k))) return 3;
    if (['Allgemein', 'General'].some(k => name.includes(k))) return 99;
    return 3;
  };
  sections.sort((a, b) => phaseOrder(a.name) - phaseOrder(b.name));
  sections.forEach((s, i) => { s.phase = i + 1; });
  return sections;
};

// ============================================
// HELPER COMPONENTS
// ============================================
const StatusBadge = ({ status, lang }: { status: ContentStatus; lang: string }) => {
  const c = statusConfig[status];
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>{lang === 'de' ? c.de : c.en}</span>;
};

const PriorityBadge = ({ priority, lang }: { priority: Priority; lang: string }) => {
  const c = contentPriorityConfig[priority];
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>{lang === 'de' ? c.de : c.en}</span>;
};

const PlatformBadge = ({ platform }: { platform: Platform }) => {
  const c = platformConfig[platform];
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      <Icon className="w-3 h-3" />
      {c.en}
    </span>
  );
};

const CustomDropdown = ({ value, onChange, options, icon }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; icon?: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find(o => o.value === value);
  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
        {icon}<span className="text-sm font-medium">{selected?.label}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 min-w-[180px] bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden">
            {options.map(opt => (
              <button key={opt.value} onClick={() => { onChange(opt.value); setIsOpen(false); }} className={`w-full px-4 py-3 text-left text-sm transition-colors flex items-center justify-between ${value === opt.value ? "bg-sky-50 dark:bg-sky-500/10 text-sky-600 font-medium" : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"}`}>
                {opt.label}{value === opt.value && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Content type prefix helper
const getContentPrefix = (platform: Platform, postType?: string): string => {
  if (platform === 'youtube') return 'Video: ';
  if (platform === 'instagram') {
    if (postType === 'carousel') return 'Carousel: ';
    if (postType === 'story') return 'Story: ';
    return 'Reel: ';
  }
  if (platform === 'facebook-linkedin') {
    if (postType === 'video') return 'Video: ';
    if (postType === 'carousel') return 'Carousel: ';
    if (postType === 'story') return 'Story: ';
    if (postType === 'article') return 'Artikel: ';
    return 'Beitrag: ';
  }
  return '';
};

// ============================================
// CONTENT ITEM MODAL (Detail-Editor)
// ============================================
const ContentItemModal = ({ item, lang, onClose, onSave, onDelete, onDuplicate, addToast }: {
  item: ContentItem | null; lang: string; onClose: () => void;
  onSave: (item: ContentItem) => void; onDelete: (id: string) => void; onDuplicate: (id: string) => void;
  addToast: (msg: string, type?: Toast['type']) => void;
}) => {
  const tx = (de: string, en: string) => lang === 'de' ? de : en;
  const [tab, setTab] = useState<'details' | 'preview' | 'versions' | 'thumbnails'>('details');
  const [editItem, setEditItem] = useState<ContentItem | null>(null);
  const [previewTextExpanded, setPreviewTextExpanded] = useState(false);
  const [previewEditing, setPreviewEditing] = useState(false);
  const [previewFbLi, setPreviewFbLi] = useState<'facebook' | 'linkedin'>('facebook');
  const [newTag, setNewTag] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [newHashtag, setNewHashtag] = useState('');
  const [versionLabel, setVersionLabel] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useModalEsc(!!item, onClose);
  useEffect(() => { if (item) setEditItem(JSON.parse(JSON.stringify(item))); }, [item]);

  // Ctrl+S / Cmd+S to save
  useEffect(() => {
    if (!item || !editItem) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        onSave({ ...editItem, updatedAt: new Date().toISOString() });
        addToast(tx('Gespeichert!', 'Saved!'));
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [item, editItem, onSave, onClose, addToast, tx]);

  if (!item || !editItem) return null;

  const updateField = (field: string, value: unknown) => setEditItem(prev => prev ? { ...prev, [field]: value } : prev);
  const updateYt = (field: string, value: unknown) => setEditItem(prev => prev ? { ...prev, yt: prev.yt ? { ...prev.yt, [field]: value } : prev.yt } : prev);
  const updateIg = (field: string, value: unknown) => setEditItem(prev => prev ? { ...prev, ig: prev.ig ? { ...prev.ig, [field]: value } : prev.ig } : prev);
  const updateFb = (field: string, value: unknown) => setEditItem(prev => prev ? { ...prev, fb: prev.fb ? { ...prev.fb, [field]: value } : prev.fb } : prev);

  const handleSave = () => {
    if (editItem) {
      onSave({ ...editItem, updatedAt: new Date().toISOString() });
      addToast(tx('Gespeichert!', 'Saved!'));
      onClose();
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && editItem && !editItem.tags.includes(newTag.trim())) {
      updateField('tags', [...editItem.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => updateField('tags', editItem.tags.filter(t => t !== tag));

  const handleAddKeyword = () => {
    if (newKeyword.trim() && editItem?.yt && !editItem.yt.keywords.includes(newKeyword.trim())) {
      updateYt('keywords', [...editItem.yt.keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const handleAddHashtag = () => {
    const ht = newHashtag.trim().startsWith('#') ? newHashtag.trim() : '#' + newHashtag.trim();
    if (ht.length > 1 && editItem) {
      if (editItem.platform === 'instagram' && editItem.ig && !editItem.ig.hashtags.includes(ht)) {
        updateIg('hashtags', [...editItem.ig.hashtags, ht]);
      } else if (editItem.platform === 'facebook-linkedin' && editItem.fb && !editItem.fb.hashtags.includes(ht)) {
        updateFb('hashtags', [...editItem.fb.hashtags, ht]);
      }
      setNewHashtag('');
    }
  };

  const handleSaveVersion = () => {
    if (versionLabel.trim() && editItem) {
      const v: ContentVersion = {
        id: Date.now().toString(), label: versionLabel.trim(), createdAt: new Date().toISOString(),
        title: editItem.title, description: editItem.platform === 'youtube' ? (editItem.yt?.videoDescription || '') : editItem.platform === 'instagram' ? (editItem.ig?.caption || '') : (editItem.fb?.caption || ''), notes: editItem.notes,
      };
      updateField('versions', [...editItem.versions, v]);
      setVersionLabel('');
      addToast(tx('Version gespeichert!', 'Version saved!'));
    }
  };

  const handleLoadVersion = (v: ContentVersion) => {
    setEditItem(prev => {
      if (!prev) return prev;
      const updated = { ...prev, title: v.title, notes: v.notes };
      if (prev.platform === 'youtube' && prev.yt) updated.yt = { ...prev.yt, videoDescription: v.description };
      if (prev.platform === 'instagram' && prev.ig) updated.ig = { ...prev.ig, caption: v.description };
      if (prev.platform === 'facebook-linkedin' && prev.fb) updated.fb = { ...prev.fb, caption: v.description };
      return updated;
    });
    addToast(tx('Version geladen!', 'Version loaded!'), 'info');
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !editItem?.yt) return;
    if (editItem.yt.thumbnails.length >= 3) { addToast(tx('Max. 3 Thumbnails', 'Max. 3 thumbnails'), 'error'); return; }
    Array.from(files).slice(0, 3 - editItem.yt.thumbnails.length).forEach(file => {
      if (file.size > 512000) { addToast(tx('Datei zu groß (max. 500KB)', 'File too large (max. 500KB)'), 'error'); return; }
      const reader = new FileReader();
      reader.onload = () => {
        const thumb: ThumbnailFile = { id: Date.now().toString() + Math.random(), name: file.name, dataUrl: reader.result as string, createdAt: new Date().toISOString() };
        setEditItem(prev => prev?.yt ? { ...prev, yt: { ...prev.yt, thumbnails: [...prev.yt.thumbnails, thumb] } } : prev);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleThumbnailDrag = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragActive(e.type === 'dragenter' || e.type === 'dragover'); };
  const handleThumbnailDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    if (e.dataTransfer.files) {
      const input = { target: { files: e.dataTransfer.files } } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleThumbnailUpload(input);
    }
  };
  const removeThumbnail = (id: string) => setEditItem(prev => prev?.yt ? { ...prev, yt: { ...prev.yt, thumbnails: prev.yt.thumbnails.filter(t => t.id !== id) } } : prev);

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editItem?.ig) return;
    if (file.size > 512000) { addToast(tx('Datei zu groß (max. 500KB)', 'File too large (max. 500KB)'), 'error'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const cover: ThumbnailFile = { id: Date.now().toString(), name: file.name, dataUrl: reader.result as string, createdAt: new Date().toISOString() };
      updateIg('coverImage', cover);
    };
    reader.readAsDataURL(file);
  };

  // Media upload (all platforms)
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !editItem) return;
    const current = editItem.media?.length || 0;
    if (current >= 5) { addToast(tx('Max. 5 Medien', 'Max. 5 media files'), 'error'); return; }
    Array.from(files).slice(0, 5 - current).forEach(file => {
      if (file.size > 2097152) { addToast(tx('Datei zu groß (max. 2MB)', 'File too large (max. 2MB)'), 'error'); return; }
      const reader = new FileReader();
      reader.onload = () => {
        const m: MediaFile = { id: Date.now().toString() + Math.random(), name: file.name, dataUrl: reader.result as string, type: file.type.startsWith('video') ? 'video' : 'image', createdAt: new Date().toISOString() };
        setEditItem(prev => prev ? { ...prev, media: [...(prev.media || []), m] } : prev);
      };
      reader.readAsDataURL(file);
    });
  };
  const removeMedia = (id: string) => setEditItem(prev => prev ? { ...prev, media: (prev.media || []).filter(m => m.id !== id) } : prev);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-3xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl" title={tx('Schließen', 'Close')}><X className="w-5 h-5 text-gray-400" /></button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <PlatformBadge platform={editItem.platform} />
          <StatusBadge status={editItem.status} lang={lang} />
          <PriorityBadge priority={editItem.priority} lang={lang} />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {(['details', 'preview', 'versions', ...(editItem.platform === 'youtube' ? ['thumbnails'] : [])] as ('details' | 'preview' | 'versions' | 'thumbnails')[]).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {t === 'details' ? tx('Details', 'Details') : t === 'preview' ? tx('Vorschau', 'Preview') : t === 'versions' ? tx('Versionen', 'Versions') : 'Thumbnails'}
            </button>
          ))}
        </div>

        {/* Details Tab */}
        {tab === 'details' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500 block mb-2">{tx('Titel', 'Title')}</label>
              <input type="text" value={editItem.title} onChange={e => updateField('title', e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-2">{tx('Konzept / Idee', 'Concept / Idea')}</label>
              <textarea value={editItem.concept} onChange={e => updateField('concept', e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none resize-none h-24" />
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-2">{tx('Angle / Hook', 'Angle / Hook')}</label>
              <input type="text" value={editItem.angle} onChange={e => updateField('angle', e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
            </div>

            {/* Status */}
            <div>
              <label className="text-sm text-gray-500 block mb-2">Status</label>
              <div className="flex flex-wrap gap-2">
                {statusOrder.map(s => (
                  <button key={s} onClick={() => updateField('status', s)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${editItem.status === s ? `${statusConfig[s].bg} ${statusConfig[s].text}` : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                    {lang === 'de' ? statusConfig[s].de : statusConfig[s].en}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority + Quality */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500 block mb-2">{tx('Priorität', 'Priority')}</label>
                <div className="flex gap-2">
                  {(['high', 'medium', 'low'] as Priority[]).map(p => (
                    <button key={p} onClick={() => updateField('priority', p)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${editItem.priority === p ? `${contentPriorityConfig[p].bg} ${contentPriorityConfig[p].text}` : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                      {lang === 'de' ? contentPriorityConfig[p].de : contentPriorityConfig[p].en}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500 block mb-2">{tx('Bewertung', 'Rating')}</label>
                <div className="flex gap-2">
                  {(['good', 'neutral', 'bad'] as IdeaQuality[]).map(q => (
                    <button key={q} onClick={() => updateField('quality', q)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${editItem.quality === q ? `${qualityConfig[q].bg} ${qualityConfig[q].text}` : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                      {qualityConfig[q].icon} {lang === 'de' ? qualityConfig[q].de : qualityConfig[q].en}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Scheduled Date */}
            {(editItem.status === 'scheduled' || editItem.status === 'ready') && (
              <div>
                <label className="text-sm text-gray-500 block mb-2">{tx('Geplantes Datum', 'Scheduled Date')}</label>
                <input type="datetime-local" value={editItem.scheduledDate?.slice(0, 16) || ''} onChange={e => updateField('scheduledDate', e.target.value ? new Date(e.target.value).toISOString() : undefined)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
              </div>
            )}

            {/* Tags */}
            <div>
              <label className="text-sm text-gray-500 block mb-2">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {editItem.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-100 dark:bg-sky-500/20 text-sky-600 rounded-full text-xs font-medium">
                    {tag}<button onClick={() => handleRemoveTag(tag)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddTag()} placeholder={tx('Tag hinzufügen...', 'Add tag...')} className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
                <button onClick={handleAddTag} className="px-3 py-2 bg-sky-500 text-white rounded-xl text-sm hover:bg-sky-600"><Plus className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Media Upload */}
            <div>
              <label className="text-sm text-gray-500 block mb-2">{tx('Medien', 'Media')} ({editItem.media?.length || 0}/5)</label>
              {(editItem.media?.length || 0) > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {editItem.media!.map(m => (
                    <div key={m.id} className="relative group w-20 h-20">
                      {m.type === 'image' ? (
                        <img src={m.dataUrl} alt={m.name} className="w-20 h-20 object-cover rounded-lg" />
                      ) : (
                        <div className="w-20 h-20 bg-gray-800 rounded-lg flex items-center justify-center"><Play className="w-6 h-6 text-white" /></div>
                      )}
                      <button onClick={() => removeMedia(m.id)} className="absolute -top-1.5 -right-1.5 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              )}
              {(editItem.media?.length || 0) < 5 && (
                <label className="block border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-4 cursor-pointer hover:border-sky-400 transition-colors text-center">
                  <input type="file" accept="image/*,video/*" multiple onChange={handleMediaUpload} className="hidden" />
                  <Upload className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                  <p className="text-xs text-gray-400">{tx('Bilder oder Videos hochladen (max. 2MB)', 'Upload images or videos (max. 2MB)')}</p>
                </label>
              )}
            </div>

            {/* YouTube Fields */}
            {editItem.platform === 'youtube' && editItem.yt && (
              <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <p className="text-sm font-semibold text-red-500 flex items-center gap-2"><Video className="w-4 h-4" /> YouTube</p>
                <div>
                  <label className="text-sm text-gray-500 block mb-2">{tx('Video-Titel', 'Video Title')}</label>
                  <input type="text" value={editItem.yt.videoTitle} onChange={e => updateYt('videoTitle', e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
                  <p className="text-xs text-gray-400 mt-1">{editItem.yt.videoTitle.length}/100 {tx('Zeichen', 'characters')}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-2">{tx('Video-Beschreibung', 'Video Description')}</label>
                  <textarea value={editItem.yt.videoDescription} onChange={e => updateYt('videoDescription', e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none resize-y min-h-[8rem]" />
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-2">Keywords</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {editItem.yt.keywords.map(kw => (
                      <span key={kw} className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 dark:bg-red-500/20 text-red-600 rounded-full text-xs font-medium">
                        {kw}<button onClick={() => updateYt('keywords', editItem.yt!.keywords.filter(k => k !== kw))} className="hover:text-red-800"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={newKeyword} onChange={e => setNewKeyword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddKeyword()} placeholder={tx('Keyword hinzufügen...', 'Add keyword...')} className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
                    <button onClick={handleAddKeyword} className="px-3 py-2 bg-red-500 text-white rounded-xl text-sm hover:bg-red-600"><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500 block mb-2">{tx('Kategorie', 'Category')}</label>
                    <select value={editItem.yt.category} onChange={e => updateYt('category', e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 hover:border-gray-300 dark:hover:border-gray-600 outline-none transition-colors">
                      {ytCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 block mb-2">{tx('Zielgruppe', 'Target Audience')}</label>
                    <input type="text" value={editItem.yt.targetAudience} onChange={e => updateYt('targetAudience', e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
                  </div>
                </div>
              </div>
            )}

            {/* Instagram Fields */}
            {editItem.platform === 'instagram' && editItem.ig && (
              <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <p className="text-sm font-semibold text-pink-500 flex items-center gap-2"><Camera className="w-4 h-4" /> Instagram</p>
                <div>
                  <label className="text-sm text-gray-500 block mb-2">{tx('Beitragstyp', 'Post Type')}</label>
                  <div className="flex gap-2">
                    {(['reel', 'carousel', 'story', 'post'] as InstagramPostType[]).map(pt => (
                      <button key={pt} onClick={() => { updateIg('postType', pt); const stripped = editItem.title.replace(/^(Video|Reel|Beitrag|Post|Carousel|Story|Artikel):\s*/i, ''); updateField('title', getContentPrefix('instagram', pt) + stripped); }} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${editItem.ig?.postType === pt ? 'bg-pink-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200'}`}>
                        {lang === 'de' ? igPostTypeLabels[pt].de : igPostTypeLabels[pt].en}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-2">{tx('Beitragstext', 'Post Text')}</label>
                  <textarea value={editItem.ig.caption} onChange={e => updateIg('caption', e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none resize-y min-h-[8rem]" />
                  <p className="text-xs text-gray-400 mt-1">{editItem.ig.caption.length}/2200 {tx('Zeichen', 'characters')}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-2">Hashtags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {editItem.ig.hashtags.map(ht => (
                      <span key={ht} className="inline-flex items-center gap-1 px-2.5 py-1 bg-pink-100 dark:bg-pink-500/20 text-pink-600 rounded-full text-xs font-medium">
                        {ht}<button onClick={() => updateIg('hashtags', editItem.ig!.hashtags.filter(h => h !== ht))} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={newHashtag} onChange={e => setNewHashtag(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddHashtag()} placeholder="#hashtag" className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
                    <button onClick={handleAddHashtag} className="px-3 py-2 bg-pink-500 text-white rounded-xl text-sm hover:bg-pink-600"><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-2">{tx('Audio / Musik', 'Audio / Music')}</label>
                  <input type="text" value={editItem.ig.audioReference} onChange={e => updateIg('audioReference', e.target.value)} placeholder={tx('z.B. Trending Audio Name', 'e.g. Trending Audio Name')} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
                </div>
                {/* Cover Image Upload */}
                <div>
                  <label className="text-sm text-gray-500 block mb-2">{tx('Cover-Bild', 'Cover Image')}</label>
                  {editItem.ig.coverImage ? (
                    <div className="relative group w-48">
                      <img src={editItem.ig.coverImage.dataUrl} alt="Cover" className="w-48 h-48 object-cover rounded-xl" />
                      <button onClick={() => updateIg('coverImage', undefined)} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <label className="block w-48 h-48 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:border-pink-500 transition-colors flex items-center justify-center">
                      <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                      <div className="text-center"><Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" /><p className="text-xs text-gray-400">Max 500KB</p></div>
                    </label>
                  )}
                </div>
              </div>
            )}

            {/* Facebook & LinkedIn Fields */}
            {editItem.platform === 'facebook-linkedin' && editItem.fb && (
              <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <p className="text-sm font-semibold text-blue-500 flex items-center gap-2"><Share2 className="w-4 h-4" /> Facebook & LinkedIn</p>
                <div>
                  <label className="text-sm text-gray-500 block mb-2">{tx('Beitragstyp', 'Post Type')}</label>
                  <div className="flex flex-wrap gap-2">
                    {(['post', 'carousel', 'video', 'story', 'article'] as FBPostType[]).map(pt => (
                      <button key={pt} onClick={() => { updateFb('postType', pt); const stripped = editItem.title.replace(/^(Video|Reel|Beitrag|Post|Carousel|Story|Artikel):\s*/i, ''); updateField('title', getContentPrefix('facebook-linkedin', pt) + stripped); }} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${editItem.fb?.postType === pt ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200'}`}>
                        {lang === 'de' ? fbPostTypeLabels[pt].de : fbPostTypeLabels[pt].en}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-2">{tx('Beitragstext', 'Post Text')}</label>
                  <textarea value={editItem.fb.caption} onChange={e => updateFb('caption', e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none resize-y min-h-[8rem]" />
                  <p className="text-xs text-gray-400 mt-1">{editItem.fb.caption.length}/3000 {tx('Zeichen', 'characters')}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-2">Hashtags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {editItem.fb.hashtags.map(ht => (
                      <span key={ht} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-600 rounded-full text-xs font-medium">
                        {ht}<button onClick={() => updateFb('hashtags', editItem.fb!.hashtags.filter(h => h !== ht))} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={newHashtag} onChange={e => setNewHashtag(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddHashtag()} placeholder="#hashtag" className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
                    <button onClick={handleAddHashtag} className="px-3 py-2 bg-blue-500 text-white rounded-xl text-sm hover:bg-blue-600"><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-2">Link URL</label>
                  <input type="text" value={editItem.fb.linkUrl} onChange={e => updateFb('linkUrl', e.target.value)} placeholder="https://..." className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
                </div>
              </div>
            )}

            {/* Checklist */}
            {editItem.checklist && editItem.checklist.length > 0 && (
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <label className="text-sm text-gray-500 block mb-2">{tx('Checkliste', 'Checklist')} ({editItem.checklist.filter(c => c.done).length}/{editItem.checklist.length})</label>
                <div className="space-y-1">
                  {editItem.checklist.map(c => (
                    <button key={c.id} onClick={() => updateField('checklist', editItem.checklist!.map(ci => ci.id === c.id ? { ...ci, done: !ci.done } : ci))} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left ${c.done ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-200'} hover:bg-gray-50 dark:hover:bg-gray-800`}>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${c.done ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 dark:border-gray-600'}`}>
                        {c.done && <Check className="w-3 h-3 text-white" />}
                      </div>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Team Assignment */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
              <label className="text-sm text-gray-500 block mb-2">{tx('Zugewiesen an', 'Assigned to')}</label>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => updateField('assignee', undefined)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${!editItem.assignee ? 'bg-sky-100 dark:bg-sky-500/20 text-sky-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200'}`}>{tx('Niemand', 'Nobody')}</button>
                {TEAM_MEMBERS.map(m => (
                  <button key={m} onClick={() => updateField('assignee', m)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${editItem.assignee === m ? 'bg-sky-100 dark:bg-sky-500/20 text-sky-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200'}`}>{m}</button>
                ))}
              </div>
            </div>

            {/* Performance (read-only display for live items) */}
            {editItem.performance && editItem.status === 'live' && (
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <label className="text-sm text-gray-500 block mb-2">{tx('Performance', 'Performance')}</label>
                <div className="grid grid-cols-4 gap-3">
                  {editItem.performance.views != null && <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-center"><p className="text-lg font-bold">{editItem.performance.views.toLocaleString()}</p><p className="text-xs text-gray-400">Views</p></div>}
                  {editItem.performance.likes != null && <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-center"><p className="text-lg font-bold">{editItem.performance.likes.toLocaleString()}</p><p className="text-xs text-gray-400">Likes</p></div>}
                  {editItem.performance.comments != null && <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-center"><p className="text-lg font-bold">{editItem.performance.comments.toLocaleString()}</p><p className="text-xs text-gray-400">{tx('Kommentare', 'Comments')}</p></div>}
                  {editItem.performance.shares != null && <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-center"><p className="text-lg font-bold">{editItem.performance.shares.toLocaleString()}</p><p className="text-xs text-gray-400">Shares</p></div>}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="text-sm text-gray-500 block mb-2">{tx('Notizen', 'Notes')}</label>
              <textarea value={editItem.notes} onChange={e => updateField('notes', e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none resize-none h-20" />
            </div>
          </div>
        )}

        {/* Preview Tab */}
        {tab === 'preview' && (() => {
          const mediaUrl = editItem.media?.[0]?.dataUrl || (editItem.platform === 'youtube' ? editItem.yt?.thumbnails?.[0]?.dataUrl : editItem.platform === 'instagram' ? editItem.ig?.coverImage?.dataUrl : editItem.fb?.coverImage?.dataUrl) || null;
          const isVideo = editItem.media?.[0]?.type === 'video';
          const formatText = (text: string) => text.split(/(#\w[\w]*|https?:\/\/\S+)/g).map((part, i) =>
            part.startsWith('#') ? <span key={i} className="text-blue-500">{part}</span> :
            part.startsWith('http') ? <a key={i} href={part} className="text-blue-500 hover:underline" target="_blank" rel="noreferrer">{part}</a> :
            <span key={i}>{part}</span>
          );
          const TRUNC = 125;

          // Auto-format: cleans up text into platform-optimized formatting
          const autoFormat = (text: string): string => {
            if (!text.trim()) return text;

            // 1. Extract hashtags (preserve them, reattach at end)
            const hashtagMatches = text.match(/#\w[\w]*/g) || [];
            let clean = text.replace(/#\w[\w]*/g, '').trim();

            // 2. Normalize whitespace
            clean = clean.replace(/\r\n/g, '\n');           // normalize line endings
            clean = clean.replace(/[ \t]+\n/g, '\n');       // remove trailing spaces per line
            clean = clean.replace(/\n{3,}/g, '\n\n');       // collapse 3+ newlines to 2
            clean = clean.replace(/[ \t]{2,}/g, ' ');       // collapse multiple spaces to one

            // 3. Split into paragraphs (by double newline or single newline)
            const rawParas = clean.split(/\n\n+/);
            const formatted: string[] = [];

            for (const para of rawParas) {
              const trimmed = para.trim();
              if (!trimmed) continue;

              // If paragraph has no line breaks and is long (>200 chars), split by sentences
              if (!trimmed.includes('\n') && trimmed.length > 200) {
                const sentences = trimmed.split(/(?<=[.!?])\s+/);
                if (sentences.length > 2) {
                  // Group 1-2 sentences per paragraph
                  const chunks: string[] = [];
                  for (let i = 0; i < sentences.length; i += 2) {
                    chunks.push(sentences.slice(i, i + 2).join(' '));
                  }
                  formatted.push(...chunks);
                  continue;
                }
              }

              // If paragraph has single newlines but no double → keep as-is (list/bullets)
              formatted.push(trimmed);
            }

            // 4. Ensure first line (hook) stands alone if it ends with punctuation
            if (formatted.length === 1 && formatted[0].length > 100) {
              const first = formatted[0];
              const hookEnd = first.search(/[.!?]\s/);
              if (hookEnd > 10 && hookEnd < 150) {
                const hook = first.slice(0, hookEnd + 1).trim();
                const rest = first.slice(hookEnd + 1).trim();
                if (rest.length > 20) {
                  formatted.splice(0, 1, hook, rest);
                }
              }
            }

            // 5. Clean up bullet/list lines: normalize dashes/dots to consistent format
            const result = formatted.map(p => {
              // Normalize bullet chars at start of lines within a paragraph
              return p.replace(/^[\-–—•]\s*/gm, '- ').replace(/^\*\s+/gm, '- ');
            });

            // 6. Re-join paragraphs with double newlines
            let output = result.join('\n\n');

            // 7. Re-add hashtags at end with proper spacing
            if (hashtagMatches.length > 0) {
              // Group hashtags: max 5 per line for readability
              const lines: string[] = [];
              for (let i = 0; i < hashtagMatches.length; i += 5) {
                lines.push(hashtagMatches.slice(i, i + 5).join(' '));
              }
              output = output.trimEnd() + '\n\n' + lines.join('\n');
            }

            return output;
          };

          const handleAutoFormat = () => {
            if (editItem.platform === 'youtube' && editItem.yt) {
              updateYt('videoDescription', autoFormat(editItem.yt.videoDescription));
            } else if (editItem.platform === 'instagram' && editItem.ig) {
              updateIg('caption', autoFormat(editItem.ig.caption));
            } else if (editItem.platform === 'facebook-linkedin' && editItem.fb) {
              updateFb('caption', autoFormat(editItem.fb.caption));
            }
            addToast(tx('Text formatiert!', 'Text formatted!'));
          };

          // Get/set current text for the platform
          const currentText = editItem.platform === 'youtube' ? (editItem.yt?.videoDescription || '') : editItem.platform === 'instagram' ? (editItem.ig?.caption || '') : (editItem.fb?.caption || '');
          const setCurrentText = (v: string) => {
            if (editItem.platform === 'youtube') updateYt('videoDescription', v);
            else if (editItem.platform === 'instagram') updateIg('caption', v);
            else updateFb('caption', v);
          };

          const CollapsibleText = ({ text, bold, onEdit }: { text: string; bold?: string; onEdit: () => void }) => {
            const needsTrunc = text.length > TRUNC && !previewTextExpanded;
            const shown = needsTrunc ? text.slice(0, TRUNC) : text;
            return (
              <div onClick={onEdit} className="cursor-text">
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {bold && <span className="font-semibold mr-1">{bold}</span>}
                  {formatText(shown)}
                  {needsTrunc && <span className="text-gray-400">... </span>}
                  {text.length > TRUNC && <button onClick={e => { e.stopPropagation(); setPreviewTextExpanded(!previewTextExpanded); }} className="text-gray-400 text-sm hover:text-gray-600 ml-0.5">{previewTextExpanded ? tx('weniger', 'less') : tx('mehr', 'more')}</button>}
                </p>
              </div>
            );
          };

          const EditableTextArea = () => (
            <div className="relative">
              <textarea
                value={currentText}
                onChange={e => setCurrentText(e.target.value)}
                onBlur={() => setPreviewEditing(false)}
                autoFocus
                className="w-full text-sm whitespace-pre-wrap leading-relaxed bg-transparent border border-sky-300 dark:border-sky-500/50 rounded-lg p-2 outline-none focus:ring-2 focus:ring-sky-500/30 resize-y min-h-[4rem]"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{currentText.length} {tx('Zeichen', 'chars')}</p>
            </div>
          );

          const MediaBlock = ({ aspect }: { aspect?: string }) => (
            <div className={`${aspect || ''} bg-gray-100 dark:bg-gray-800 relative flex items-center justify-center`} style={!aspect && !mediaUrl ? { minHeight: 200 } : undefined}>
              {mediaUrl ? (
                isVideo ? <video src={mediaUrl} className="w-full h-full object-cover" /> : <img src={mediaUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center py-8"><Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" /><p className="text-gray-400 text-xs">{tx('Kein Bild/Video', 'No image/video')}</p></div>
              )}
              {mediaUrl && isVideo && <div className="absolute inset-0 flex items-center justify-center"><div className="w-14 h-14 bg-black/50 rounded-full flex items-center justify-center"><Play className="w-7 h-7 text-white ml-0.5" /></div></div>}
            </div>
          );

          const isLI = previewFbLi === 'linkedin';

          return (
            <div className="space-y-3">
              {/* Toolbar */}
              <div className="flex items-center gap-2">
                {editItem.platform === 'facebook-linkedin' && (
                  <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
                    <button onClick={() => setPreviewFbLi('facebook')} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${!isLI ? 'bg-blue-500 text-white' : 'text-gray-500 hover:text-gray-700'}`}>Facebook</button>
                    <button onClick={() => setPreviewFbLi('linkedin')} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${isLI ? 'bg-sky-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}>LinkedIn</button>
                  </div>
                )}
                <div className="flex-1" />
                <button onClick={handleAutoFormat} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-500/10 text-purple-600 rounded-lg text-xs font-medium hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-colors">
                  <Sparkles className="w-3.5 h-3.5" />{tx('Auto-Format', 'Auto-Format')}
                </button>
              </div>

              {/* YouTube Preview */}
              {editItem.platform === 'youtube' && editItem.yt && (
                <div className="bg-white dark:bg-gray-950 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
                  <MediaBlock aspect="aspect-video" />
                  <div className="p-4">
                    <h3 className="font-bold text-lg leading-tight mb-1">{editItem.yt.videoTitle || editItem.title || tx('Ohne Titel', 'Untitled')}</h3>
                    <p className="text-xs text-gray-500 mb-3">0 {tx('Aufrufe', 'views')} · {tx('Gerade veröffentlicht', 'Just published')}</p>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">FS</div>
                      <div><p className="font-semibold text-sm">Flowstack Systems</p><p className="text-xs text-gray-500">0 {tx('Abonnenten', 'subscribers')}</p></div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800/50 rounded-xl p-3">
                      {previewEditing ? <EditableTextArea /> : <CollapsibleText text={editItem.yt.videoDescription || ''} onEdit={() => { setPreviewTextExpanded(true); setPreviewEditing(true); }} />}
                      {previewTextExpanded && editItem.yt.keywords.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">{editItem.yt.keywords.map((k, i) => <span key={i} className="text-blue-500 text-xs">#{k}</span>)}</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Instagram Preview */}
              {editItem.platform === 'instagram' && editItem.ig && (
                <div className="bg-white dark:bg-gray-950 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 max-w-sm mx-auto">
                  <div className="flex items-center gap-3 p-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400 flex items-center justify-center text-white font-bold text-xs">FS</div>
                    <p className="font-semibold text-sm flex-1">flowstack.systems</p>
                    <span className="text-gray-400">···</span>
                  </div>
                  <div className="relative">
                    <MediaBlock aspect="aspect-square" />
                    {editItem.ig.postType !== 'post' && <span className="absolute top-3 right-3 px-2 py-0.5 bg-black/60 text-white rounded text-xs font-medium">{editItem.ig.postType === 'reel' ? 'Reel' : editItem.ig.postType === 'carousel' ? 'Carousel' : 'Story'}</span>}
                  </div>
                  <div className="px-3 pt-3 flex items-center gap-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    <div className="flex-1" />
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                  </div>
                  <div className="px-3 py-2 pb-4">
                    {previewEditing ? <EditableTextArea /> : <CollapsibleText text={editItem.ig.caption} bold="flowstack.systems" onEdit={() => { setPreviewTextExpanded(true); setPreviewEditing(true); }} />}
                    {(previewTextExpanded || editItem.ig.caption.length <= TRUNC) && editItem.ig.hashtags.length > 0 && (
                      <p className="text-sm text-blue-500 mt-1">{editItem.ig.hashtags.map(h => h.startsWith('#') ? h : `#${h}`).join(' ')}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Facebook / LinkedIn Preview */}
              {editItem.platform === 'facebook-linkedin' && editItem.fb && (
                <div className={`bg-white dark:bg-gray-950 rounded-2xl overflow-hidden border ${isLI ? 'border-gray-300 dark:border-gray-700' : 'border-gray-200 dark:border-gray-800'}`}>
                  {/* Header */}
                  <div className="flex items-center gap-3 p-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${isLI ? 'bg-gradient-to-br from-sky-600 to-blue-700' : 'bg-gradient-to-br from-sky-500 to-indigo-600'}`}>FS</div>
                    <div>
                      <p className="font-semibold text-sm">Flowstack Systems</p>
                      <p className="text-xs text-gray-500">{tx('Gerade eben', 'Just now')} · {isLI ? <svg className="w-3 h-3 inline" fill="currentColor" viewBox="0 0 16 16"><path d="M0 8a8 8 0 1116 0A8 8 0 010 8zm7.5-6.923c-.67.204-1.335.82-1.887 1.855A7.97 7.97 0 005.145 4H7.5V1.077zM4.09 4a9.267 9.267 0 01.64-1.539 6.7 6.7 0 01.597-.933A7.025 7.025 0 002.255 4H4.09zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a6.958 6.958 0 00-.656 2.5h2.49zM4.847 5a12.5 12.5 0 00-.338 2.5H7.5V5H4.847zM8.5 5v2.5h2.99a12.495 12.495 0 00-.337-2.5H8.5zM4.51 8.5a12.5 12.5 0 00.337 2.5H7.5V8.5H4.51zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5H8.5zM5.145 12c.138.386.295.744.468 1.068.552 1.035 1.218 1.65 1.887 1.855V12H5.145zm.182 2.472a6.696 6.696 0 01-.597-.933A9.268 9.268 0 014.09 12H2.255a7.024 7.024 0 003.072 2.472zM3.82 11a13.652 13.652 0 01-.312-2.5h-2.49c.062.89.291 1.733.656 2.5H3.82zm6.853 3.472A7.024 7.024 0 0013.745 12H11.91a9.27 9.27 0 01-.64 1.539 6.688 6.688 0 01-.597.933zM8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855.173-.324.33-.682.468-1.068H8.5zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.65 13.65 0 01-.312 2.5zm2.802-3.5a6.959 6.959 0 00-.656-2.5H12.18c.174.782.282 1.623.312 2.5h2.49zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7.024 7.024 0 00-3.072-2.472c.218.284.418.598.597.933zM10.855 4a7.966 7.966 0 00-.468-1.068C9.835 1.897 9.17 1.282 8.5 1.077V4h2.355z"/></svg> : <svg className="w-3 h-3 inline" fill="currentColor" viewBox="0 0 16 16"><path d="M0 8a8 8 0 1116 0A8 8 0 010 8zm7.5-6.923c-.67.204-1.335.82-1.887 1.855A7.97 7.97 0 005.145 4H7.5V1.077zM4.09 4a9.267 9.267 0 01.64-1.539 6.7 6.7 0 01.597-.933A7.025 7.025 0 002.255 4H4.09zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a6.958 6.958 0 00-.656 2.5h2.49zM4.847 5a12.5 12.5 0 00-.338 2.5H7.5V5H4.847zM8.5 5v2.5h2.99a12.495 12.495 0 00-.337-2.5H8.5zM4.51 8.5a12.5 12.5 0 00.337 2.5H7.5V8.5H4.51zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5H8.5zM5.145 12c.138.386.295.744.468 1.068.552 1.035 1.218 1.65 1.887 1.855V12H5.145zm.182 2.472a6.696 6.696 0 01-.597-.933A9.268 9.268 0 014.09 12H2.255a7.024 7.024 0 003.072 2.472zM3.82 11a13.652 13.652 0 01-.312-2.5h-2.49c.062.89.291 1.733.656 2.5H3.82zm6.853 3.472A7.024 7.024 0 0013.745 12H11.91a9.27 9.27 0 01-.64 1.539 6.688 6.688 0 01-.597.933zM8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855.173-.324.33-.682.468-1.068H8.5zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.65 13.65 0 01-.312 2.5zm2.802-3.5a6.959 6.959 0 00-.656-2.5H12.18c.174.782.282 1.623.312 2.5h2.49zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7.024 7.024 0 00-3.072-2.472c.218.284.418.598.597.933zM10.855 4a7.966 7.966 0 00-.468-1.068C9.835 1.897 9.17 1.282 8.5 1.077V4h2.355z"/></svg>}</p>
                    </div>
                  </div>
                  {/* Text */}
                  <div className="px-4 pb-3">
                    {previewEditing ? <EditableTextArea /> : <CollapsibleText text={editItem.fb.caption} onEdit={() => { setPreviewTextExpanded(true); setPreviewEditing(true); }} />}
                    {(previewTextExpanded || editItem.fb.caption.length <= TRUNC) && editItem.fb.hashtags.length > 0 && (
                      <p className="text-sm text-blue-500 mt-1">{editItem.fb.hashtags.map(h => h.startsWith('#') ? h : `#${h}`).join(' ')}</p>
                    )}
                  </div>
                  {/* Media */}
                  <div className="relative">
                    <MediaBlock />
                    {editItem.fb.postType !== 'post' && <span className="absolute top-3 right-3 px-2 py-0.5 bg-black/60 text-white rounded text-xs font-medium">{editItem.fb.postType === 'carousel' ? 'Carousel' : editItem.fb.postType === 'video' ? 'Video' : editItem.fb.postType === 'story' ? 'Story' : editItem.fb.postType === 'article' ? tx('Artikel', 'Article') : 'Post'}</span>}
                  </div>
                  {editItem.fb.linkUrl && (
                    <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
                      <p className="text-xs text-gray-500 truncate">{editItem.fb.linkUrl}</p>
                    </div>
                  )}
                  {/* Action bar */}
                  <div className="flex border-t border-gray-100 dark:border-gray-800">
                    {isLI ? (<>
                      <button className="flex-1 py-2.5 text-sm text-gray-500 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center gap-1.5"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>{tx('Empfehlen', 'Like')}</button>
                      <button className="flex-1 py-2.5 text-sm text-gray-500 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center gap-1.5"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>{tx('Kommentieren', 'Comment')}</button>
                      <button className="flex-1 py-2.5 text-sm text-gray-500 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center gap-1.5"><RefreshCw className="w-5 h-5" />{tx('Reposten', 'Repost')}</button>
                      <button className="flex-1 py-2.5 text-sm text-gray-500 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center gap-1.5"><Share2 className="w-5 h-5" />{tx('Senden', 'Send')}</button>
                    </>) : (<>
                      <button className="flex-1 py-2.5 text-sm text-gray-500 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center gap-1.5"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>{tx('Gefällt mir', 'Like')}</button>
                      <button className="flex-1 py-2.5 text-sm text-gray-500 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center gap-1.5"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>{tx('Kommentar', 'Comment')}</button>
                      <button className="flex-1 py-2.5 text-sm text-gray-500 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center gap-1.5"><Share2 className="w-5 h-5" />{tx('Teilen', 'Share')}</button>
                    </>)}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {!editItem.yt && !editItem.ig && !editItem.fb && (
                <div className="text-center py-12 text-gray-400"><Eye className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>{tx('Keine Plattform-Daten', 'No platform data')}</p></div>
              )}
            </div>
          );
        })()}

        {/* Versions Tab */}
        {tab === 'versions' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input type="text" value={versionLabel} onChange={e => setVersionLabel(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSaveVersion()} placeholder={tx('Versions-Name (z.B. "v2", "Final")', 'Version name (e.g. "v2", "Final")')} className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
              <button onClick={handleSaveVersion} disabled={!versionLabel.trim()} className="px-4 py-3 bg-sky-500 text-white rounded-xl text-sm font-medium hover:bg-sky-600 disabled:opacity-50">{tx('Version speichern', 'Save version')}</button>
            </div>
            {editItem.versions.length === 0 ? (
              <div className="text-center py-12 text-gray-400"><FileText className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>{tx('Noch keine Versionen', 'No versions yet')}</p></div>
            ) : (
              <div className="space-y-2">
                {[...editItem.versions].reverse().map(v => (
                  <div key={v.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div>
                      <p className="font-medium text-sm">{v.label}</p>
                      <p className="text-xs text-gray-500">{new Date(v.createdAt).toLocaleDateString('de-DE')} – {v.title}</p>
                    </div>
                    <button onClick={() => handleLoadVersion(v)} className="px-3 py-1.5 bg-sky-100 dark:bg-sky-500/20 text-sky-600 rounded-lg text-xs font-medium hover:bg-sky-200">{tx('Laden', 'Load')}</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Thumbnails Tab (YouTube only) */}
        {tab === 'thumbnails' && editItem.platform === 'youtube' && editItem.yt && (
          <div className="space-y-4">
            <div onDragEnter={handleThumbnailDrag} onDragLeave={handleThumbnailDrag} onDragOver={handleThumbnailDrag} onDrop={handleThumbnailDrop}
              className={`relative border-2 border-dashed rounded-xl p-6 transition-colors ${dragActive ? 'border-sky-500 bg-sky-50 dark:bg-sky-500/10' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
              <input type="file" accept="image/*" multiple onChange={handleThumbnailUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <div className="text-center">
                <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{tx('Thumbnails hierher ziehen oder', 'Drag thumbnails here or')} <span className="text-sky-500 font-medium">{tx('durchsuchen', 'browse')}</span></p>
                <p className="text-xs text-gray-400">PNG, JPG – max. 500KB – {editItem.yt.thumbnails.length}/3</p>
              </div>
            </div>
            {editItem.yt.thumbnails.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {editItem.yt.thumbnails.map(thumb => (
                  <div key={thumb.id} className="relative group">
                    <img src={thumb.dataUrl} alt={thumb.name} className="w-full aspect-video object-cover rounded-xl" />
                    <button onClick={() => removeThumbnail(thumb.id)} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                    <p className="text-xs text-gray-500 mt-1 truncate">{thumb.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
          <button onClick={handleSave} className="flex-1 py-3 bg-sky-500 text-white font-medium rounded-xl hover:bg-sky-600 transition-colors">{tx('Speichern', 'Save')}</button>
          <button onClick={() => { onDuplicate(item.id); onClose(); }} className="p-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700" title={tx('Duplizieren', 'Duplicate')}><Copy className="w-5 h-5" /></button>
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)} className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20" title={tx('Löschen', 'Delete')}><Trash2 className="w-5 h-5" /></button>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => { onDelete(item.id); onClose(); }} className="px-4 py-3 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600">{tx('Ja, löschen', 'Yes, delete')}</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm">{tx('Nein', 'No')}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// NEW CONTENT MODAL
// ============================================
const NewContentModal = ({ isOpen, lang, onClose, onCreate }: {
  isOpen: boolean; lang: string; onClose: () => void;
  onCreate: (platform: Platform, title: string, concept: string) => void;
}) => {
  const tx = (de: string, en: string) => lang === 'de' ? de : en;
  const [platform, setPlatform] = useState<Platform>('youtube');
  const [title, setTitle] = useState('');
  const [concept, setConcept] = useState('');

  useModalEsc(isOpen, onClose);

  if (!isOpen) return null;

  const handleCreate = () => {
    if (title.trim()) {
      onCreate(platform, title.trim(), concept.trim());
      setTitle(''); setConcept(''); setPlatform('youtube');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-lg w-full mx-4 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl" title={tx('Schließen', 'Close')}><X className="w-5 h-5 text-gray-400" /></button>
        <h2 className="text-2xl font-bold mb-6">{tx('Neue Content-Idee', 'New Content Idea')}</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500 block mb-2">{tx('Plattform', 'Platform')}</label>
            <div className="grid grid-cols-3 gap-2">
              {(['youtube', 'instagram', 'facebook-linkedin'] as Platform[]).map(p => {
                const Icon = platformConfig[p].icon;
                const activeColors: Record<Platform, string> = { youtube: 'bg-red-500 text-white', instagram: 'bg-pink-500 text-white', 'facebook-linkedin': 'bg-blue-500 text-white' };
                return (
                  <button key={p} onClick={() => setPlatform(p)} className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${platform === p ? activeColors[p] : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200'}`}>
                    <Icon className="w-4 h-4" />{platformConfig[p].en}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-500 block mb-2">{tx('Titel / Arbeitstitel', 'Title / Working Title')}</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreate()} placeholder={tx('z.B. 5 KI-Tools für mehr Umsatz', 'e.g. 5 AI Tools for More Revenue')} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
          </div>
          <div>
            <label className="text-sm text-gray-500 block mb-2">{tx('Konzept (optional)', 'Concept (optional)')}</label>
            <textarea value={concept} onChange={e => setConcept(e.target.value)} placeholder={tx('Worum geht es in dem Video/Reel?', 'What is the video/reel about?')} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none resize-none h-24" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={handleCreate} disabled={!title.trim()} className="flex-1 py-3 bg-sky-500 text-white font-medium rounded-xl hover:bg-sky-600 disabled:opacity-50">{tx('Idee erstellen', 'Create Idea')}</button>
          <button onClick={onClose} className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium rounded-xl hover:bg-gray-200">{tx('Abbrechen', 'Cancel')}</button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// RESEARCH NOTE MODAL
// ============================================
const ResearchNoteModal = ({ note, lang, onClose, onSave, onDelete, addToast }: {
  note: ResearchNote | null; lang: string; onClose: () => void;
  onSave: (note: ResearchNote) => void; onDelete: (id: string) => void;
  addToast: (msg: string, type?: Toast['type']) => void;
}) => {
  const tx = (de: string, en: string) => lang === 'de' ? de : en;
  const [editNote, setEditNote] = useState<ResearchNote | null>(null);
  const [newLink, setNewLink] = useState('');
  const [newTag, setNewTag] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useModalEsc(!!note, onClose);

  useEffect(() => { if (note) setEditNote(JSON.parse(JSON.stringify(note))); }, [note]);

  // Ctrl+S / Cmd+S to save
  useEffect(() => {
    if (!note || !editNote) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        onSave({ ...editNote, updatedAt: new Date().toISOString() });
        addToast(tx('Gespeichert!', 'Saved!'));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [note, editNote, onSave, addToast, tx]);

  if (!note || !editNote) return null;

  const handleSave = () => {
    if (editNote) { onSave({ ...editNote, updatedAt: new Date().toISOString() }); addToast(tx('Gespeichert!', 'Saved!')); }
  };

  const handleAddLink = () => {
    if (newLink.trim()) { setEditNote(prev => prev ? { ...prev, links: [...prev.links, newLink.trim()] } : prev); setNewLink(''); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl" title={tx('Schließen', 'Close')}><X className="w-5 h-5 text-gray-400" /></button>
        <h2 className="text-2xl font-bold mb-6">{tx('Research-Notiz', 'Research Note')}</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500 block mb-2">{tx('Titel', 'Title')}</label>
            <input type="text" value={editNote.title} onChange={e => setEditNote(prev => prev ? { ...prev, title: e.target.value } : prev)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
          </div>
          <div>
            <label className="text-sm text-gray-500 block mb-2">{tx('Plattform', 'Platform')}</label>
            <div className="flex gap-2">
              {(['general', 'youtube', 'instagram', 'facebook-linkedin'] as (Platform | 'general')[]).map(p => (
                <button key={p} onClick={() => setEditNote(prev => prev ? { ...prev, platform: p } : prev)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${editNote.platform === p ? 'bg-sky-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200'}`}>
                  {p === 'general' ? tx('Allgemein', 'General') : platformConfig[p as Platform].en}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-500 block mb-2">{tx('Inhalt', 'Content')}</label>
            <textarea value={editNote.content} onChange={e => setEditNote(prev => prev ? { ...prev, content: e.target.value } : prev)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none resize-none h-48" />
          </div>
          <div>
            <label className="text-sm text-gray-500 block mb-2">Links</label>
            {editNote.links.map((link, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <a href={link} target="_blank" rel="noopener noreferrer" className="flex-1 text-sm text-sky-500 hover:underline truncate">{link}</a>
                <button onClick={() => setEditNote(prev => prev ? { ...prev, links: prev.links.filter((_, idx) => idx !== i) } : prev)} className="text-red-400 hover:text-red-500" title={tx('Link entfernen', 'Remove link')}><X className="w-4 h-4" /></button>
              </div>
            ))}
            <div className="flex gap-2">
              <input type="text" value={newLink} onChange={e => setNewLink(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddLink()} placeholder="https://..." className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
              <button onClick={handleAddLink} className="px-3 py-2 bg-sky-500 text-white rounded-xl text-sm hover:bg-sky-600"><Plus className="w-4 h-4" /></button>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-500 block mb-2">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {editNote.tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 dark:bg-purple-500/20 text-purple-600 rounded-full text-xs font-medium">
                  {tag}<button onClick={() => setEditNote(prev => prev ? { ...prev, tags: prev.tags.filter(t => t !== tag) } : prev)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && newTag.trim()) { setEditNote(prev => prev && !prev.tags.includes(newTag.trim()) ? { ...prev, tags: [...prev.tags, newTag.trim()] } : prev); setNewTag(''); }}} placeholder={tx('Tag hinzufügen...', 'Add tag...')} className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
              <button onClick={() => { if (newTag.trim()) { setEditNote(prev => prev && !prev.tags.includes(newTag.trim()) ? { ...prev, tags: [...prev.tags, newTag.trim()] } : prev); setNewTag(''); }}} className="px-3 py-2 bg-purple-500 text-white rounded-xl text-sm hover:bg-purple-600"><Plus className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
          <button onClick={handleSave} className="flex-1 py-3 bg-sky-500 text-white font-medium rounded-xl hover:bg-sky-600">{tx('Speichern', 'Save')}</button>
          <button onClick={() => setShowDeleteConfirm(true)} className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-xl hover:bg-red-100" title={tx('Löschen', 'Delete')}><Trash2 className="w-5 h-5" /></button>
        </div>
        <ConfirmDialog
          open={showDeleteConfirm}
          title={tx('Notiz löschen?', 'Delete note?')}
          message={tx('Diese Notiz wird unwiderruflich gelöscht.', 'This note will be permanently deleted.')}
          confirmLabel={tx('Löschen', 'Delete')}
          cancelLabel={tx('Abbrechen', 'Cancel')}
          variant="danger"
          onConfirm={() => { setShowDeleteConfirm(false); onDelete(note.id); onClose(); }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
const ContentDashboardContent = () => {
  const { lang, setLang } = useLanguage();
  const tx = (de: string, en: string) => lang === 'de' ? de : en;

  // UI
  const { theme, setTheme } = useTheme();
  const darkMode = theme === 'dark';
  const [section, setSection] = useState<ActiveSection>('overview');
  const [search, setSearch] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set());
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [series] = useState<ContentSeries[]>(DEMO_SERIES);
  const [templates] = useState<ContentTemplate[]>(DEMO_TEMPLATES);
  const [previewTemplate, setPreviewTemplate] = useState<ContentTemplate | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Data — lazy init: distinguish "never stored" (null) from "stored empty" ([])
  const [contentItems, setContentItems] = useState<ContentItem[]>(() => {
    const raw = localStorage.getItem('flowstack-content-items');
    if (raw !== null) { try { return JSON.parse(raw); } catch { /* fall through */ } }
    return DEMO_CONTENT;
  });
  const [researchNotes, setResearchNotes] = useState<ResearchNote[]>(() => {
    const raw = localStorage.getItem('flowstack-content-research');
    if (raw !== null) { try { return JSON.parse(raw); } catch { /* fall through */ } }
    return DEMO_RESEARCH;
  });

  // File Links
  const [fileLinks, setFileLinks] = useState<FileLink[]>(() => {
    const raw = localStorage.getItem('flowstack-content-files');
    if (raw !== null) { try { return JSON.parse(raw); } catch { /* fall through */ } }
    return DEMO_FILES;
  });
  const [fileCategoryFilter, setFileCategoryFilter] = useState<string>('all');
  const [fileLabelFilter, setFileLabelFilter] = useState<string[]>([]);
  const [fileSearch, setFileSearch] = useState('');
  const [editingFile, setEditingFile] = useState<FileLink | null>(null);
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [deleteFileId, setDeleteFileId] = useState<string | null>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showLabelDropdown, setShowLabelDropdown] = useState(false);
  const [modalLabels, setModalLabels] = useState<string[]>([]);
  const [modalCustomLabel, setModalCustomLabel] = useState('');
  const [modalCategory, setModalCategory] = useState<FileCategory>('other');

  // Plans
  const [plans, setPlans] = useState<MarketingPlan[]>(() => {
    const raw = localStorage.getItem('flowstack-content-plans');
    if (raw !== null) { try { return JSON.parse(raw); } catch { /* fall through */ } }
    return DEMO_PLANS;
  });
  const [activePlanId, setActivePlanId] = useState<string>(() => {
    const raw = localStorage.getItem('flowstack-content-plans');
    if (raw !== null) { try { const p = JSON.parse(raw); return p.length > 0 ? p[0].id : DEMO_PLANS[0].id; } catch { /* fall through */ } }
    return DEMO_PLANS[0].id;
  });

  // Planning
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [v2ShowDepDD, setV2ShowDepDD] = useState(false);
  const [planSearch, setPlanSearch] = useState('');
  const [showPlanBuilder, setShowPlanBuilder] = useState(false);
  const [planBuilderName, setPlanBuilderName] = useState('');
  const [planBuilderDesc, setPlanBuilderDesc] = useState('');
  const [planBuilderGoal, setPlanBuilderGoal] = useState('');
  const [planBuilderAudience, setPlanBuilderAudience] = useState('');
  const [planBuilderDeadline, setPlanBuilderDeadline] = useState('');
  const [pbChannels, setPbChannels] = useState<PlanChannel[]>([]);
  const [pbConfig, setPbConfig] = useState<Record<string, ChannelConfig>>({});
  const [pbPlanningDay, setPbPlanningDay] = useState(0);
  const [pbPlanningCycle, setPbPlanningCycle] = useState('1-week');
  const [pbRevenueGoal, setPbRevenueGoal] = useState('');
  const [pbProductPrice, setPbProductPrice] = useState('');
  const [pbConversionLow, setPbConversionLow] = useState('2');
  const [pbConversionHigh, setPbConversionHigh] = useState('5');
  const [pbTeamMembers, setPbTeamMembers] = useState<TeamMember[]>([
    { id: 'tm-1', name: 'Claudio', color: 'indigo', initials: 'CD' },
    { id: 'tm-2', name: 'Anak', color: 'emerald', initials: 'AN' },
  ]);
  const [v2Mode, setV2Mode] = useState<'plan' | 'todos' | 'mindmap' | 'week'>('plan');
  const [planQuickFilter, setPlanQuickFilter] = useState<'all' | 'mma' | 'overdue' | 'week' | 'mine'>('all');
  const [sectionSortBy, setSectionSortBy] = useState<Record<string, 'default' | 'priority' | 'due' | 'status'>>({});
  const [v2TodoView, setV2TodoView] = useState<'list' | 'board'>('list');
  const [v2DetailTask, setV2DetailTask] = useState<{ sectionId: string; task: PlanTask } | null>(null);
  const [v2ExpandedSections, setV2ExpandedSections] = useState<Set<string>>(new Set(['s1', 's2', 's3', 's4']));
  const [v2PrioFilter, setV2PrioFilter] = useState<string>('all');
  const [v2MMAFilter, setV2MMAFilter] = useState(false);
  const [v2SectionFilter, setV2SectionFilter] = useState<string>('all');
  const [v2StatusFilter, setV2StatusFilter] = useState<string>('all');
  const [v2ShowLinkPicker, setV2ShowLinkPicker] = useState(false);
  const [v2LinkDashboard, setV2LinkDashboard] = useState('');
  const [v2LinkItems, setV2LinkItems] = useState<{ id: string; title: string }[]>([]);
  const [v2ShowFilePicker, setV2ShowFilePicker] = useState(false);
  const [v2ShowContentPicker, setV2ShowContentPicker] = useState(false);
  const [v2SelectedPlan, setV2SelectedPlan] = useState<string | null>(null);
  const [v2MindmapStyle, setV2MindmapStyle] = useState<'tree' | 'radial' | 'horizontal' | 'kanban'>('tree');
  const [mindmapExpandedSections, setMindmapExpandedSections] = useState<Set<string>>(new Set());
  const [v2ShowStatusDD, setV2ShowStatusDD] = useState(false);
  const [v2ShowFreqDD, setV2ShowFreqDD] = useState(false);
  const [v2ShowSecDD, setV2ShowSecDD] = useState(false);
  const [v2ShowSecFilterDD, setV2ShowSecFilterDD] = useState(false);
  const [v2ShowStatusFilterDD, setV2ShowStatusFilterDD] = useState(false);
  const [v2PlanFilter, setV2PlanFilter] = useState<string>('current');
  const [v2ShowPlanFilterDD, setV2ShowPlanFilterDD] = useState(false);

  // Modals
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<ResearchNote | null>(null);
  const [, setShowNewResearchModal] = useState(false);

  // Settings
  const [settingsTab, setSettingsTab] = useState<'general' | 'export' | 'data'>('general');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [defaultPlatform, setDefaultPlatform] = useState<Platform>('youtube');

  // Calendar
  const [calendarWeek, setCalendarWeek] = useState<Date>(() => {
    const d = new Date(); const day = d.getDay();
    d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
    d.setHours(0, 0, 0, 0); return d;
  });

  // Toast
  const { toasts, addToast, dismissToast } = useToast();

  // Close mobile sidebar on section change
  useEffect(() => { setMobileSidebarOpen(false); }, [section]);

  // Persistence (load happens via lazy useState init above)
  useEffect(() => { saveContentItems(contentItems); }, [contentItems]);
  useEffect(() => { saveResearchNotes(researchNotes); }, [researchNotes]);
  useEffect(() => { saveFileLinks(fileLinks); }, [fileLinks]);
  useEffect(() => { savePlans(plans); }, [plans]);

  // ESC-key hooks for modals in the main component
  const closeFileModal = useCallback(() => { setShowNewFileModal(false); setEditingFile(null); }, []);
  const closePreviewTemplate = useCallback(() => setPreviewTemplate(null), []);
  const closePlanBuilder = useCallback(() => setShowPlanBuilder(false), []);
  const closeNotifications = useCallback(() => setShowNotifications(false), []);
  useModalEsc(showNewFileModal, closeFileModal);
  useModalEsc(!!previewTemplate, closePreviewTemplate);
  useModalEsc(showPlanBuilder, closePlanBuilder);
  useModalEsc(showNotifications, closeNotifications);

  // Keyboard shortcuts for planning
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (section !== 'planning' || !v2SelectedPlan) return;
      if (e.key === 'Escape') {
        if (v2DetailTask) { setV2DetailTask(null); }
        else { setV2SelectedPlan(null); setPlanSearch(''); }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [section, v2SelectedPlan, v2DetailTask]);

  // Filtered files
  const filteredFiles = useMemo(() => {
    let result = fileLinks;
    if (fileCategoryFilter !== 'all') result = result.filter(f => f.category === fileCategoryFilter);
    if (fileLabelFilter.length > 0) result = result.filter(f => fileLabelFilter.every(l => f.labels.includes(l)));
    if (fileSearch) {
      const q = fileSearch.toLowerCase();
      result = result.filter(f => f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q));
    }
    return result.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [fileLinks, fileCategoryFilter, fileLabelFilter, fileSearch]);

  // All unique labels from files
  const allFileLabels = useMemo(() => {
    const labels = new Set<string>();
    fileLinks.forEach(f => f.labels.forEach(l => labels.add(l)));
    return Array.from(labels).sort();
  }, [fileLinks]);

  // Active plan
  const activePlan = useMemo(() => plans.find(p => p.id === activePlanId) || plans[0], [plans, activePlanId]);

  // Filtered items
  const filteredItems = useMemo(() => {
    let items = contentItems.filter(item => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (platformFilter !== 'all' && item.platform !== platformFilter) return false;
      if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        if (!item.title.toLowerCase().includes(s) && !item.concept.toLowerCase().includes(s) && !item.tags.some(t => t.toLowerCase().includes(s))) return false;
      }
      return true;
    });
    // Section platform filter
    if (section === 'youtube') items = items.filter(i => i.platform === 'youtube');
    if (section === 'instagram') items = items.filter(i => i.platform === 'instagram');
    if (section === 'facebook-linkedin') items = items.filter(i => i.platform === 'facebook-linkedin');
    // Sort
    items.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'date') cmp = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      else if (sortField === 'priority') cmp = (['high', 'medium', 'low'].indexOf(a.priority)) - (['high', 'medium', 'low'].indexOf(b.priority));
      else if (sortField === 'status') cmp = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
      else if (sortField === 'title') cmp = a.title.localeCompare(b.title);
      else if (sortField === 'score') cmp = calcContentScore(a) - calcContentScore(b);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return items;
  }, [contentItems, statusFilter, platformFilter, priorityFilter, search, section, sortField, sortDir]);

  // Stats
  const stats = useMemo(() => ({
    total: contentItems.length,
    ideas: contentItems.filter(i => i.status === 'idea').length,
    drafts: contentItems.filter(i => i.status === 'draft').length,
    ready: contentItems.filter(i => i.status === 'ready').length,
    scheduled: contentItems.filter(i => i.status === 'scheduled').length,
    live: contentItems.filter(i => i.status === 'live').length,
    archived: contentItems.filter(i => i.status === 'archived').length,
    youtube: contentItems.filter(i => i.platform === 'youtube').length,
    instagram: contentItems.filter(i => i.platform === 'instagram').length,
    facebookLinkedin: contentItems.filter(i => i.platform === 'facebook-linkedin').length,
  }), [contentItems]);


  // CRUD
  const handleCreateContent = (platform: Platform, title: string, concept: string) => {
    const now = new Date().toISOString();
    const defaultPostType = platform === 'instagram' ? 'reel' : platform === 'facebook-linkedin' ? 'post' : undefined;
    const prefix = getContentPrefix(platform, defaultPostType);
    const prefixedTitle = title.match(/^(Video|Reel|Beitrag|Post|Carousel|Story|Artikel):\s/i) ? title : prefix + title;
    const newItem: ContentItem = {
      id: Date.now().toString(), platform, status: 'idea', priority: 'medium', quality: 'neutral',
      createdAt: now, updatedAt: now, title: prefixedTitle, concept, angle: '', notes: '', tags: [],
      ...(platform === 'youtube' ? { yt: { videoTitle: '', videoDescription: '', keywords: [], thumbnails: [], category: 'Business', targetAudience: '' } } : {}),
      ...(platform === 'instagram' ? { ig: { caption: '', hashtags: [], postType: 'reel' as InstagramPostType, audioReference: '' } } : {}),
      ...(platform === 'facebook-linkedin' ? { fb: { caption: '', hashtags: [], postType: 'post' as FBPostType, linkUrl: '', coverImage: undefined } } : {}),
      checklist: DEFAULT_CHECKLIST[platform].map((label, i) => ({ id: `c${i}`, label, done: false })),
      versions: [],
    };
    setContentItems(prev => [...prev, newItem]);
    setShowNewModal(false);
    addToast(tx('Content-Idee erstellt!', 'Content idea created!'));
  };

  const handleSaveItem = (item: ContentItem) => setContentItems(prev => prev.map(i => i.id === item.id ? item : i));
  const handleDeleteItem = (id: string) => { setContentItems(prev => prev.filter(i => i.id !== id)); addToast(tx('Gelöscht!', 'Deleted!')); };
  const handleDuplicateItem = (id: string) => {
    const orig = contentItems.find(i => i.id === id);
    if (orig) {
      const now = new Date().toISOString();
      setContentItems(prev => [...prev, { ...JSON.parse(JSON.stringify(orig)), id: Date.now().toString(), title: orig.title + (lang === 'de' ? ' (Kopie)' : ' (Copy)'), status: 'idea' as ContentStatus, createdAt: now, updatedAt: now }]);
      addToast(tx('Dupliziert!', 'Duplicated!'));
    }
  };

  // Research CRUD
  const handleCreateResearch = () => {
    const now = new Date().toISOString();
    const note: ResearchNote = { id: Date.now().toString(), title: tx('Neue Notiz', 'New Note'), content: '', links: [], tags: [], platform: 'general', createdAt: now, updatedAt: now };
    setResearchNotes(prev => [...prev, note]);
    setSelectedNote(note);
    setShowNewResearchModal(false);
  };
  const handleSaveNote = (note: ResearchNote) => setResearchNotes(prev => prev.map(n => n.id === note.id ? note : n));
  const handleDeleteNote = (id: string) => { setResearchNotes(prev => prev.filter(n => n.id !== id)); addToast(tx('Notiz gelöscht!', 'Note deleted!')); };

  // Export
  const handleExportCSV = () => {
    const headers = ['ID', 'Platform', 'Status', 'Priority', 'Title', 'Concept', 'Angle', 'Tags', 'Created', 'Updated'];
    const rows = contentItems.map(i => [i.id, i.platform, i.status, i.priority, `"${i.title}"`, `"${i.concept}"`, `"${i.angle}"`, `"${i.tags.join(', ')}"`, i.createdAt, i.updatedAt]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'content-items.csv'; a.click();
    URL.revokeObjectURL(url);
    addToast(tx('CSV exportiert!', 'CSV exported!'));
  };

  const handleExportJSON = () => {
    const data = { contentItems, researchNotes, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'content-dashboard-backup.json'; a.click();
    URL.revokeObjectURL(url);
    addToast(tx('JSON exportiert!', 'JSON exported!'));
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (data.contentItems) setContentItems(data.contentItems);
        if (data.researchNotes) setResearchNotes(data.researchNotes);
        addToast(tx('Daten importiert!', 'Data imported!'));
      } catch { addToast(tx('Fehler beim Import', 'Import error'), 'error'); }
    };
    reader.readAsText(file);
  };

  const handleResetAll = () => {
    setContentItems(DEMO_CONTENT);
    setResearchNotes(DEMO_RESEARCH);
    setShowResetConfirm(false);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
    addToast(tx('Daten zurückgesetzt!', 'Data reset!'));
  };

  // Calendar helpers
  const getWeekDays = () => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(calendarWeek);
      d.setDate(calendarWeek.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const getItemsForDate = (date: Date) => contentItems.filter(item => {
    if (!item.scheduledDate) return false;
    const d = new Date(item.scheduledDate);
    return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth() && d.getDate() === date.getDate();
  });

  const weekDays = getWeekDays();
  const weekLabel = `KW ${Math.ceil(((calendarWeek.getTime() - new Date(calendarWeek.getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7)} – ${weekDays[0].toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })} - ${weekDays[6].toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;

  const sectionTitles: Record<ActiveSection, string> = {
    overview: 'Dashboard',
    ideas: tx('Content-Ideen', 'Content Ideas'),
    youtube: 'YouTube',
    instagram: 'Instagram',
    'facebook-linkedin': 'Facebook & LinkedIn',
    pipeline: tx('Pipeline Board', 'Pipeline Board'),
    calendar: tx('Content-Kalender', 'Content Calendar'),
    files: tx('Dateien', 'Files'),
    planning: tx('Planung', 'Planning'),
    performance: tx('Performance', 'Performance'),
    templates: tx('Vorlagen', 'Templates'),
    research: 'Research',
    settings: tx('Einstellungen', 'Settings'),
  };

  // Toggle pinned
  const togglePinned = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setContentItems(prev => prev.map(i => i.id === id ? { ...i, pinned: !i.pinned } : i));
  };

  // Inline status change
  const cycleStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setContentItems(prev => prev.map(i => {
      if (i.id !== id) return i;
      const idx = statusOrder.indexOf(i.status);
      const next = statusOrder[Math.min(idx + 1, statusOrder.length - 2)];
      return { ...i, status: next, updatedAt: new Date().toISOString() };
    }));
  };

  // Content Card renderer (clean: only Platform + Status colored)
  const renderContentCard = (item: ContentItem) => {
    const isSelected = bulkSelected.has(item.id);
    const relTime = (() => {
      const diffMs = Date.now() - new Date(item.updatedAt).getTime();
      const diffMin = Math.floor(diffMs / 60000);
      const diffHrs = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      if (diffMin < 60) return tx(`vor ${diffMin} Min`, `${diffMin}m ago`);
      if (diffHrs < 24) return tx(`vor ${diffHrs} Std`, `${diffHrs}h ago`);
      if (diffDays < 30) return tx(`vor ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`, `${diffDays}d ago`);
      return new Date(item.updatedAt).toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', { day: 'numeric', month: 'short' });
    })();

    return (
      <div key={item.id} onClick={() => bulkMode ? setBulkSelected(prev => { const n = new Set(prev); if (n.has(item.id)) n.delete(item.id); else n.add(item.id); return n; }) : setSelectedItem(item)} className={`bg-white dark:bg-gray-900 rounded-2xl p-5 border transition-all cursor-pointer group relative ${isSelected ? 'border-sky-500 ring-2 ring-sky-500/30' : 'border-gray-100 dark:border-gray-800 hover:border-sky-200 dark:hover:border-sky-500/30 hover:shadow-lg'}`}>
        {bulkMode && (
          <div className={`absolute top-3 left-3 w-5 h-5 rounded border-2 flex items-center justify-center ${isSelected ? 'bg-sky-500 border-sky-500' : 'border-gray-300 dark:border-gray-600'}`}>
            {isSelected && <Check className="w-3 h-3 text-white" />}
          </div>
        )}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <PlatformBadge platform={item.platform} />
            <button onClick={(e) => cycleStatus(item.id, e)} title={tx('Status weiterschalten', 'Advance status')}>
              <StatusBadge status={item.status} lang={lang} />
            </button>
          </div>
          <button onClick={(e) => togglePinned(item.id, e)} className={`p-1 rounded-lg transition-colors ${item.pinned ? 'text-amber-500' : 'text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100'}`} title={tx(item.pinned ? 'Loslösen' : 'Anpinnen', item.pinned ? 'Unpin' : 'Pin')}>
            <Star className={`w-4 h-4 ${item.pinned ? 'fill-amber-500' : ''}`} />
          </button>
        </div>
        <h3 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-sky-600 transition-colors">{item.title}</h3>
        {item.concept && <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{item.concept}</p>}
        {item.platform === 'youtube' && item.yt && item.yt.thumbnails.length > 0 && (
          <img src={item.yt.thumbnails[0].dataUrl} alt="" className="w-full aspect-video object-cover rounded-xl mb-3" />
        )}
        {item.platform === 'instagram' && item.ig?.coverImage && (
          <img src={item.ig.coverImage.dataUrl} alt="" className="w-full aspect-square object-cover rounded-xl mb-3" />
        )}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-full text-xs">{tag}</span>
            ))}
            {item.tags.length > 3 && <span className="text-xs text-gray-400">+{item.tags.length - 3}</span>}
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap ml-2">{relTime}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Modals */}
      <ContentItemModal item={selectedItem} lang={lang} onClose={() => setSelectedItem(null)} onSave={handleSaveItem} onDelete={handleDeleteItem} onDuplicate={handleDuplicateItem} addToast={addToast} />
      <NewContentModal isOpen={showNewModal} lang={lang} onClose={() => setShowNewModal(false)} onCreate={handleCreateContent} />
      <ResearchNoteModal note={selectedNote} lang={lang} onClose={() => setSelectedNote(null)} onSave={handleSaveNote} onDelete={handleDeleteNote} addToast={addToast} />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 z-50 flex flex-col transition-transform duration-300 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${sidebarCollapsed ? 'lg:-translate-x-full' : 'lg:translate-x-0'}`}>
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
              <Play className="w-4 h-4 text-white" />
            </div>
            Content Hub
          </h1>
          <div className="flex items-center gap-1">
            <button onClick={() => setTheme(darkMode ? 'light' : 'dark')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors" title={tx('Design wechseln', 'Toggle theme')}>
              {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-500" />}
            </button>
            <button onClick={() => { setSidebarCollapsed(true); setMobileSidebarOpen(false); }} className="hidden lg:flex p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors" title="Sidebar einklappen">
              <ChevronLeft className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
        <nav className="px-4 space-y-1 flex-1 overflow-y-auto">
          <p className="text-xs text-gray-400 uppercase font-medium px-4 mb-2">{tx('Übersicht', 'Overview')}</p>
          {([
            { icon: <BarChart3 className="w-5 h-5" />, label: 'Dashboard', key: 'overview' as ActiveSection },
            { icon: <Lightbulb className="w-5 h-5" />, label: tx('Content-Ideen', 'Content Ideas'), key: 'ideas' as ActiveSection },
          ]).map(i => (
            <button key={i.key} onClick={() => setSection(i.key)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${section === i.key ? 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 font-medium' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>{i.icon}{i.label}</button>
          ))}
          <p className="text-xs text-gray-400 uppercase font-medium px-4 mt-6 mb-2">{tx('Plattformen', 'Platforms')}</p>
          {([
            { icon: <Video className="w-5 h-5" />, label: 'YouTube', key: 'youtube' as ActiveSection, count: stats.youtube },
            { icon: <Camera className="w-5 h-5" />, label: 'Instagram', key: 'instagram' as ActiveSection, count: stats.instagram },
            { icon: <Share2 className="w-5 h-5" />, label: 'FB & LinkedIn', key: 'facebook-linkedin' as ActiveSection, count: stats.facebookLinkedin },
          ]).map(i => (
            <button key={i.key} onClick={() => setSection(i.key)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${section === i.key ? 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 font-medium' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>{i.icon}{i.label}
              <span className="ml-auto text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{i.count}</span>
            </button>
          ))}
          <p className="text-xs text-gray-400 uppercase font-medium px-4 mt-6 mb-2">{tx('Planung', 'Planning')}</p>
          {([
            { icon: <Columns3 className="w-5 h-5" />, label: 'Pipeline', key: 'pipeline' as ActiveSection },
            { icon: <Calendar className="w-5 h-5" />, label: tx('Kalender', 'Calendar'), key: 'calendar' as ActiveSection },
            { icon: <FolderOpen className="w-5 h-5" />, label: tx('Dateien', 'Files'), key: 'files' as ActiveSection },
            { icon: <ClipboardList className="w-5 h-5" />, label: tx('Planung', 'Planning'), key: 'planning' as ActiveSection },
            { icon: <TrendingUp className="w-5 h-5" />, label: 'Performance', key: 'performance' as ActiveSection },
            { icon: <Layers className="w-5 h-5" />, label: tx('Vorlagen', 'Templates'), key: 'templates' as ActiveSection },
            { icon: <Search className="w-5 h-5" />, label: 'Research', key: 'research' as ActiveSection },
          ]).map(i => (
            <button key={i.key} onClick={() => setSection(i.key)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${section === i.key ? 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 font-medium' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>{i.icon}{i.label}</button>
          ))}
          <p className="text-xs text-gray-400 uppercase font-medium px-4 mt-6 mb-2">Tools</p>
          {([
            { icon: <Settings className="w-5 h-5" />, label: tx('Einstellungen', 'Settings'), key: 'settings' as ActiveSection },
          ]).map(i => (
            <button key={i.key} onClick={() => setSection(i.key)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${section === i.key ? 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 font-medium' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>{i.icon}{i.label}</button>
          ))}
        </nav>
        <div className="p-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 text-white">
            <div className="flex items-center gap-2 mb-2"><Sparkles className="w-5 h-5" /><p className="font-semibold">{tx('Pro Tipp', 'Pro Tip')}</p></div>
            <p className="text-sm text-white/80">{tx('Plane deinen Content wöchentlich vor für konsistente Uploads.', 'Plan your content weekly for consistent uploads.')}</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className={`transition-all duration-300 ${sidebarCollapsed ? '' : 'lg:ml-64'}`}>
        {/* Header */}
        <header className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileSidebarOpen(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl lg:hidden" title={tx('Menü öffnen', 'Open menu')}><Menu className="w-5 h-5" /></button>
              {sidebarCollapsed && <button onClick={() => setSidebarCollapsed(false)} className="hidden lg:flex p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors" title={tx('Sidebar einblenden', 'Show sidebar')}><ChevronRight className="w-5 h-5 text-gray-500" /></button>}
              <div>
                <h1 className="text-2xl font-bold">{sectionTitles[section]}</h1>
                <p className="text-sm text-gray-500">{stats.total} {tx('Inhalte', 'items')} · {stats.live} Live · {stats.scheduled} {tx('Geplant', 'Scheduled')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder={tx('Suchen...', 'Search...')} value={search} onChange={e => setSearch(e.target.value)} className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm w-64 focus:ring-2 focus:ring-sky-500 outline-none" />
                {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2" title={tx('Suche leeren', 'Clear search')}><X className="w-4 h-4 text-gray-400" /></button>}
              </div>
              {/* Notification Bell */}
              <div className="relative">
                <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors relative" title={tx('Benachrichtigungen', 'Notifications')}>
                  <Bell className="w-5 h-5 text-gray-500" />
                  {notifications.filter(n => !n.read).length > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />}
                </button>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden">
                      <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <p className="font-semibold text-sm">{tx('Benachrichtigungen', 'Notifications')}</p>
                        {notifications.length > 0 && <button onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))} className="text-xs text-sky-500">{tx('Alle gelesen', 'Mark all read')}</button>}
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="p-6 text-center text-sm text-gray-400">{tx('Keine Benachrichtigungen', 'No notifications')}</p>
                        ) : notifications.map(n => (
                          <div key={n.id} className={`px-4 py-3 text-sm border-b border-gray-50 dark:border-gray-800 ${!n.read ? 'bg-sky-50/50 dark:bg-sky-500/5' : ''}`}>
                            <p className={!n.read ? 'font-medium' : 'text-gray-500'}>{n.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleDateString('de-DE')}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
                <button onClick={() => setLang('de')} className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${lang === 'de' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>DE</button>
                <button onClick={() => setLang('en')} className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${lang === 'en' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>EN</button>
              </div>
              <button onClick={() => setShowNewModal(true)} className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white text-sm font-medium rounded-xl hover:bg-sky-600 transition-colors"><Plus className="w-4 h-4" /><span className="hidden sm:inline">{tx('Neue Idee', 'New Idea')}</span><span className="sm:hidden"><Plus className="w-4 h-4" /></span></button>
            </div>
          </div>
          {(section === 'ideas' || section === 'youtube' || section === 'instagram' || section === 'facebook-linkedin') && (
            <div className="flex items-center gap-3 px-6 py-3 border-t border-gray-100 dark:border-gray-800 flex-wrap">
              {section === 'ideas' && (
                <CustomDropdown value={platformFilter} onChange={setPlatformFilter} options={[{ value: 'all', label: tx('Alle Plattformen', 'All Platforms') }, { value: 'youtube', label: 'YouTube' }, { value: 'instagram', label: 'Instagram' }, { value: 'facebook-linkedin', label: 'FB & LinkedIn' }]} icon={<Layers className="w-4 h-4 text-gray-500" />} />
              )}
              <CustomDropdown value={statusFilter} onChange={setStatusFilter} options={[{ value: 'all', label: tx('Alle Status', 'All Status') }, ...statusOrder.map(s => ({ value: s, label: lang === 'de' ? statusConfig[s].de : statusConfig[s].en }))]} icon={<Filter className="w-4 h-4 text-gray-500" />} />
              <CustomDropdown value={priorityFilter} onChange={setPriorityFilter} options={[{ value: 'all', label: tx('Alle Prioritäten', 'All Priorities') }, { value: 'high', label: tx('Hoch', 'High') }, { value: 'medium', label: tx('Mittel', 'Medium') }, { value: 'low', label: tx('Niedrig', 'Low') }]} icon={<Target className="w-4 h-4 text-gray-500" />} />
              {(search || statusFilter !== 'all' || platformFilter !== 'all' || priorityFilter !== 'all') && (
                <span className="text-xs text-gray-400">{filteredItems.length} / {contentItems.length}</span>
              )}
              <div className="flex-1" />
              {/* Bulk mode toggle */}
              <button onClick={() => { setBulkMode(!bulkMode); setBulkSelected(new Set()); }} className={`p-2 rounded-xl transition-colors ${bulkMode ? 'bg-sky-100 dark:bg-sky-500/20 text-sky-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`} title={tx('Mehrfachauswahl', 'Multi-select')}>
                <CheckSquare className="w-4 h-4" />
              </button>
              <CustomDropdown value={sortField} onChange={v => setSortField(v as SortField)} options={[{ value: 'date', label: tx('Datum', 'Date') }, { value: 'priority', label: tx('Priorität', 'Priority') }, { value: 'status', label: 'Status' }, { value: 'title', label: tx('Titel', 'Title') }, { value: 'score', label: 'Score' }]} icon={<BarChart3 className="w-4 h-4 text-gray-500" />} />
              <button onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${sortDir === 'asc' ? 'rotate-180' : ''}`} />
              </button>
            </div>
          )}
          {/* Bulk actions bar */}
          {bulkMode && (
            <div className="flex items-center gap-3 px-6 py-2 bg-sky-50 dark:bg-sky-500/10 border-t border-sky-100 dark:border-sky-500/20">
              <button onClick={() => { const allIds = filteredItems.map(i => i.id); const allSelected = allIds.length > 0 && allIds.every(id => bulkSelected.has(id)); setBulkSelected(allSelected ? new Set() : new Set(allIds)); }} className="px-2.5 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                {filteredItems.length > 0 && filteredItems.every(i => bulkSelected.has(i.id)) ? tx('Alle abwählen', 'Deselect all') : tx('Alle auswählen', 'Select all')} ({filteredItems.length})
              </button>
              <span className="text-sm font-medium text-sky-600">{bulkSelected.size} {tx('ausgewählt', 'selected')}</span>
              <div className="flex-1" />
              {bulkSelected.size > 0 && (<>
              <select onChange={e => { if (e.target.value) { setContentItems(prev => prev.map(i => bulkSelected.has(i.id) ? { ...i, status: e.target.value as ContentStatus, updatedAt: new Date().toISOString() } : i)); addToast(tx(`Status auf "${statusConfig[e.target.value as ContentStatus]?.de}" geändert`, `Status changed to "${statusConfig[e.target.value as ContentStatus]?.en}"`)); setBulkSelected(new Set()); } }} className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs" defaultValue="">
                <option value="" disabled>{tx('Status ändern...', 'Change status...')}</option>
                {statusOrder.map(s => <option key={s} value={s}>{lang === 'de' ? statusConfig[s].de : statusConfig[s].en}</option>)}
              </select>
              <select onChange={e => { if (e.target.value) { setContentItems(prev => prev.map(i => bulkSelected.has(i.id) ? { ...i, priority: e.target.value as Priority, updatedAt: new Date().toISOString() } : i)); addToast(tx('Priorität geändert', 'Priority changed')); setBulkSelected(new Set()); } }} className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs" defaultValue="">
                <option value="" disabled>{tx('Priorität...', 'Priority...')}</option>
                {(['high', 'medium', 'low'] as Priority[]).map(p => <option key={p} value={p}>{lang === 'de' ? contentPriorityConfig[p].de : contentPriorityConfig[p].en}</option>)}
              </select>
              <button onClick={() => { if (!window.confirm(tx(`${bulkSelected.size} Items wirklich löschen?`, `Delete ${bulkSelected.size} items?`))) return; setContentItems(prev => prev.filter(i => !bulkSelected.has(i.id))); addToast(tx(`${bulkSelected.size} Items gelöscht`, `${bulkSelected.size} items deleted`)); setBulkSelected(new Set()); setBulkMode(false); }} className="px-3 py-1.5 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100"><Trash2 className="w-3.5 h-3.5 inline mr-1" />{tx('Löschen', 'Delete')}</button>
              </>)}
            </div>
          )}
        </header>

        <div className="p-6 space-y-6">
          {/* OVERVIEW */}
          {section === 'overview' && (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { t: tx('Ideen', 'Ideas'), v: stats.ideas, i: <Lightbulb className="w-5 h-5 text-blue-500" />, bg: 'bg-blue-100 dark:bg-blue-500/20' },
                  { t: tx('Entwürfe', 'Drafts'), v: stats.drafts, i: <Edit3 className="w-5 h-5 text-purple-500" />, bg: 'bg-purple-100 dark:bg-purple-500/20' },
                  { t: tx('Geplant', 'Scheduled'), v: stats.scheduled, i: <Calendar className="w-5 h-5 text-orange-500" />, bg: 'bg-orange-100 dark:bg-orange-500/20' },
                  { t: 'Live', v: stats.live, i: <Play className="w-5 h-5 text-emerald-500" />, bg: 'bg-emerald-100 dark:bg-emerald-500/20' },
                ].map(card => (
                  <div key={card.t} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2.5 rounded-xl ${card.bg}`}>{card.i}</div>
                    </div>
                    <p className="text-3xl font-bold">{card.v}</p>
                    <p className="text-sm text-gray-500 mt-1">{card.t}</p>
                  </div>
                ))}
              </div>

              {/* Platform Split + Pipeline */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                  <h3 className="font-semibold mb-4">{tx('Plattform-Verteilung', 'Platform Distribution')}</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1"><span className="text-sm flex items-center gap-2"><Video className="w-4 h-4 text-red-500" />YouTube</span><span className="text-sm font-medium">{stats.youtube}</span></div>
                      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${stats.total ? (stats.youtube / stats.total) * 100 : 0}%` }} /></div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1"><span className="text-sm flex items-center gap-2"><Camera className="w-4 h-4 text-pink-500" />Instagram</span><span className="text-sm font-medium">{stats.instagram}</span></div>
                      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-pink-500 rounded-full transition-all" style={{ width: `${stats.total ? (stats.instagram / stats.total) * 100 : 0}%` }} /></div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1"><span className="text-sm flex items-center gap-2"><Share2 className="w-4 h-4 text-blue-500" />FB & LinkedIn</span><span className="text-sm font-medium">{stats.facebookLinkedin}</span></div>
                      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${stats.total ? (stats.facebookLinkedin / stats.total) * 100 : 0}%` }} /></div>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                  <h3 className="font-semibold mb-4">{tx('Content-Pipeline', 'Content Pipeline')}</h3>
                  <div className="space-y-3">
                    {statusOrder.filter(s => s !== 'archived').map(s => (
                      <div key={s}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">{lang === 'de' ? statusConfig[s].de : statusConfig[s].en}</span>
                          <span className="text-sm font-medium">{contentItems.filter(i => i.status === s).length}</span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${s === 'idea' ? 'bg-blue-500' : s === 'draft' ? 'bg-purple-500' : s === 'ready' ? 'bg-amber-500' : s === 'scheduled' ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{ width: `${stats.total ? (contentItems.filter(i => i.status === s).length / stats.total) * 100 : 0}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3">
                <button onClick={() => setShowNewModal(true)} className="flex items-center gap-2 px-5 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"><Video className="w-5 h-5" />{tx('YouTube-Idee', 'YouTube Idea')}</button>
                <button onClick={() => setShowNewModal(true)} className="flex items-center gap-2 px-5 py-3 bg-pink-500 text-white rounded-xl font-medium hover:bg-pink-600 transition-colors"><Camera className="w-5 h-5" />{tx('Instagram-Idee', 'Instagram Idea')}</button>
                <button onClick={() => setShowNewModal(true)} className="flex items-center gap-2 px-5 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"><Share2 className="w-5 h-5" />{tx('FB/LinkedIn-Idee', 'FB/LinkedIn Idea')}</button>
              </div>

              {/* Recent Items */}
              <div>
                <h3 className="font-semibold mb-4">{tx('Zuletzt bearbeitet', 'Recently Updated')}</h3>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {[...contentItems].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 6).map(renderContentCard)}
                </div>
              </div>
            </>
          )}

          {/* IDEAS / YOUTUBE / INSTAGRAM / FB&LINKEDIN */}
          {(section === 'ideas' || section === 'youtube' || section === 'instagram' || section === 'facebook-linkedin') && (
            <>
              {filteredItems.length === 0 ? (
                <div className="text-center py-20">
                  <Lightbulb className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-400">{tx('Keine Inhalte gefunden', 'No content found')}</h3>
                  <p className="text-sm text-gray-400 mt-1">{tx('Erstelle eine neue Idee oder ändere die Filter.', 'Create a new idea or adjust filters.')}</p>
                  <button onClick={() => setShowNewModal(true)} className="mt-4 px-6 py-3 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-600"><Plus className="w-4 h-4 inline mr-2" />{tx('Neue Idee', 'New Idea')}</button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredItems.map(renderContentCard)}
                </div>
              )}
            </>
          )}

          {/* PIPELINE BOARD (Kanban) */}
          {section === 'pipeline' && (() => {
            const pipelineStatuses: ContentStatus[] = ['idea', 'draft', 'ready', 'scheduled', 'live'];
            const handlePipelineDrop = (status: ContentStatus, e: React.DragEvent) => {
              e.preventDefault();
              const itemId = e.dataTransfer.getData('text/plain');
              if (itemId) {
                setContentItems(prev => prev.map(i => i.id === itemId ? { ...i, status, updatedAt: new Date().toISOString() } : i));
                addToast(tx(`Status → ${statusConfig[status].de}`, `Status → ${statusConfig[status].en}`));
                setDraggedItemId(null);
              }
            };
            return (
              <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: 'calc(100vh - 200px)' }}>
                {pipelineStatuses.map(status => {
                  const colItems = contentItems.filter(i => i.status === status);
                  const statusColor = status === 'idea' ? 'blue' : status === 'draft' ? 'purple' : status === 'ready' ? 'amber' : status === 'scheduled' ? 'orange' : 'emerald';
                  return (
                    <div key={status}
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => handlePipelineDrop(status, e)}
                      className="flex-shrink-0 w-72 bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-3"
                    >
                      <div className="flex items-center justify-between mb-3 px-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full bg-${statusColor}-500`} />
                          <h4 className="font-semibold text-sm">{lang === 'de' ? statusConfig[status].de : statusConfig[status].en}</h4>
                        </div>
                        <span className="text-xs bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded-full">{colItems.length}</span>
                      </div>
                      <div className="space-y-2">
                        {colItems.map(item => (
                          <div key={item.id}
                            draggable
                            onDragStart={e => { e.dataTransfer.setData('text/plain', item.id); setDraggedItemId(item.id); }}
                            onDragEnd={() => setDraggedItemId(null)}
                            onClick={() => setSelectedItem(item)}
                            className={`bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-100 dark:border-gray-800 cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${draggedItemId === item.id ? 'opacity-50' : ''}`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <PlatformBadge platform={item.platform} />
                              <PriorityBadge priority={item.priority} lang={lang} />
                              {item.pinned && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
                            </div>
                            <p className="text-sm font-medium mb-1 line-clamp-2">{item.title}</p>
                            <div className="flex items-center justify-between mt-2">
                              {item.assignee && <span className="text-xs text-gray-400 flex items-center gap-1"><Users className="w-3 h-3" />{item.assignee}</span>}
                              {item.checklist && item.checklist.length > 0 && (
                                <span className="text-xs text-gray-400 flex items-center gap-1"><CheckSquare className="w-3 h-3" />{item.checklist.filter(c => c.done).length}/{item.checklist.length}</span>
                              )}
                            </div>
                          </div>
                        ))}
                        {colItems.length === 0 && (
                          <div className="text-center py-8 text-gray-300 dark:text-gray-600 text-xs">{tx('Keine Items', 'No items')}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* CALENDAR */}
          {section === 'calendar' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{tx('Content Kalender', 'Content Calendar')}</h2>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCalendarWeek(prev => { const d = new Date(prev); d.setDate(d.getDate() - 7); return d; })} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors" title={tx('Vorherige Woche', 'Previous week')}><ChevronLeft className="w-5 h-5" /></button>
                  <button onClick={() => setCalendarWeek(new Date())} className="px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">{tx('Heute', 'Today')}</button>
                  <button onClick={() => setCalendarWeek(prev => { const d = new Date(prev); d.setDate(d.getDate() + 7); return d; })} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors" title={tx('Nächste Woche', 'Next week')}><ChevronRight className="w-5 h-5" /></button>
                  <button onClick={() => setShowNewModal(true)} className="ml-2 px-4 py-2 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-600 flex items-center gap-2"><Plus className="w-4 h-4" />{tx('Content planen', 'Schedule Content')}</button>
                </div>
              </div>
              {/* Week label */}
              <p className="text-sm text-gray-500 dark:text-gray-400">{weekLabel}</p>
              {/* Week Grid */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                <div className="grid grid-cols-7 gap-4">
                  {weekDays.map((day, di) => {
                    const items = getItemsForDate(day);
                    const isToday = new Date().toDateString() === day.toDateString();
                    const dayName = (lang === 'de' ? ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])[di];
                    return (
                      <div key={di}>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-medium text-gray-500 text-center">{dayName}</p>
                          <p className={`text-sm font-semibold ${isToday ? 'text-sky-600 dark:text-sky-400' : 'text-gray-900 dark:text-white'}`}>{day.getDate()}</p>
                        </div>
                        <div className="space-y-2 min-h-[200px]">
                          {items.map(item => {
                            const pConfig = platformConfig[item.platform];
                            return (
                              <div key={item.id} onClick={() => setSelectedItem(item)} className={`p-2 ${pConfig.bg} border ${item.platform === 'youtube' ? 'border-red-200 dark:border-red-500/20' : item.platform === 'instagram' ? 'border-pink-200 dark:border-pink-500/20' : 'border-blue-200 dark:border-blue-500/20'} rounded-lg cursor-pointer hover:opacity-80 transition-opacity`}>
                                <p className={`text-xs font-medium ${pConfig.text}`}>{item.scheduledDate ? new Date(item.scheduledDate).toLocaleTimeString(lang === 'de' ? 'de-DE' : 'en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-300 truncate">{item.title}</p>
                              </div>
                            );
                          })}
                          {items.length === 0 && (
                            <button onClick={() => setShowNewModal(true)} className="w-full p-2 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-gray-400 hover:border-sky-300 hover:text-sky-500 transition-colors text-xs">+ Content</button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Scheduled Items List */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                <h3 className="font-semibold mb-4">{tx('Geplante Inhalte', 'Scheduled Content')}</h3>
                <div className="space-y-3">
                  {contentItems.filter(p => p.status === 'scheduled').length === 0 && (
                    <p className="text-sm text-gray-400 py-4">{tx('Noch keine geplanten Inhalte', 'No scheduled content yet')}</p>
                  )}
                  {contentItems.filter(p => p.status === 'scheduled').map(item => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <Calendar className="w-5 h-5 text-sky-600" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.title}</p>
                        <p className="text-sm text-gray-500">{item.scheduledDate ? new Date(item.scheduledDate).toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</p>
                      </div>
                      <PlatformBadge platform={item.platform} />
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSelectedItem(item)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg" title={tx('Bearbeiten', 'Edit')}><Edit3 className="w-4 h-4 text-gray-500" /></button>
                        <button onClick={() => handleDeleteItem(item.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg" title={tx('Löschen', 'Delete')}><Trash2 className="w-4 h-4 text-red-500" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* FILES / DATEIEN */}
          {section === 'files' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{tx('Dateien & Dokumente', 'Files & Documents')}</h2>
                <button onClick={() => { setEditingFile(null); setModalLabels([]); setModalCustomLabel(''); setModalCategory('other'); setShowNewFileModal(true); }} className="px-4 py-2 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-600 flex items-center gap-2"><Plus className="w-4 h-4" />{tx('Datei hinzufügen', 'Add File')}</button>
              </div>
              {/* Filters */}
              <div className="flex flex-wrap gap-3 items-center">
                {/* Category Dropdown */}
                <div className="relative">
                  <button onClick={() => { setShowCategoryDropdown(p => !p); setShowLabelDropdown(false); }} className={`flex items-center gap-2 pl-3 pr-3 py-2 text-sm border rounded-xl transition-colors ${fileCategoryFilter !== 'all' ? 'bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/30 text-sky-700 dark:text-sky-300' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                    {fileCategoryFilter !== 'all' ? (() => { const c = categoryConfig[fileCategoryFilter as FileCategory]; const I = c.icon; return <><I className="w-3.5 h-3.5" />{lang === 'de' ? c.de : c.en}</>; })() : <>{tx('Kategorie', 'Category')}</>}
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                  {showCategoryDropdown && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setShowCategoryDropdown(false)} />
                      <div className="absolute left-0 top-full mt-1 z-40 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden py-1">
                        <button onClick={() => { setFileCategoryFilter('all'); setShowCategoryDropdown(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${fileCategoryFilter === 'all' ? 'bg-sky-50 dark:bg-sky-500/10 text-sky-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                          <div className="w-5 h-5 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center"><Filter className="w-3 h-3 text-gray-400" /></div>
                          {tx('Alle Kategorien', 'All Categories')}
                          {fileCategoryFilter === 'all' && <Check className="w-4 h-4 ml-auto text-sky-500" />}
                        </button>
                        {(Object.keys(categoryConfig) as FileCategory[]).map(k => {
                          const c = categoryConfig[k]; const I = c.icon;
                          return (
                            <button key={k} onClick={() => { setFileCategoryFilter(k); setShowCategoryDropdown(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${fileCategoryFilter === k ? 'bg-sky-50 dark:bg-sky-500/10 text-sky-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                              <div className={`w-5 h-5 rounded-lg ${c.bg} flex items-center justify-center`}><I className={`w-3 h-3 ${c.text}`} /></div>
                              {lang === 'de' ? c.de : c.en}
                              {fileCategoryFilter === k && <Check className="w-4 h-4 ml-auto text-sky-500" />}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
                {/* Label Dropdown */}
                <div className="relative">
                  <button onClick={() => { setShowLabelDropdown(p => !p); setShowCategoryDropdown(false); }} className={`flex items-center gap-2 pl-3 pr-3 py-2 text-sm border rounded-xl transition-colors ${fileLabelFilter.length > 0 ? 'bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/30 text-sky-700 dark:text-sky-300' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                    <Hash className="w-3.5 h-3.5" />
                    Labels
                    {fileLabelFilter.length > 0 && <span className="w-5 h-5 rounded-full bg-sky-500 text-white text-xs flex items-center justify-center font-medium">{fileLabelFilter.length}</span>}
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                  {showLabelDropdown && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setShowLabelDropdown(false)} />
                      <div className="absolute left-0 top-full mt-1 z-40 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden">
                        <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Labels</span>
                          {fileLabelFilter.length > 0 && <button onClick={() => setFileLabelFilter([])} className="text-xs text-sky-500 hover:text-sky-600">{tx('Alle entfernen', 'Clear all')}</button>}
                        </div>
                        <div className="max-h-[240px] overflow-y-auto py-1">
                          {allFileLabels.map(label => {
                            const isSelected = fileLabelFilter.includes(label);
                            const count = fileLinks.filter(f => f.labels.includes(label)).length;
                            return (
                              <button key={label} onClick={() => setFileLabelFilter(prev => prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label])} className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${isSelected ? 'bg-sky-50 dark:bg-sky-500/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'bg-sky-500 border-sky-500' : 'border-gray-300 dark:border-gray-600'}`}>
                                  {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                                </div>
                                <span className={`flex-1 text-left ${isSelected ? 'text-sky-700 dark:text-sky-300 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>{label}</span>
                                <span className="text-xs text-gray-400">{count}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                {/* Active label chips */}
                {fileLabelFilter.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {fileLabelFilter.map(label => (
                      <button key={label} onClick={() => setFileLabelFilter(prev => prev.filter(l => l !== label))} className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-300 rounded-full text-xs font-medium hover:bg-sky-200 dark:hover:bg-sky-500/30 transition-colors">
                        {label}
                        <X className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input value={fileSearch} onChange={e => setFileSearch(e.target.value)} placeholder={tx('Suchen...', 'Search...')} className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30" />
                  </div>
                </div>
                {(fileSearch || fileCategoryFilter !== 'all' || fileLabelFilter.length > 0) && (
                  <span className="text-xs text-gray-400">{filteredFiles.length} / {fileLinks.length}</span>
                )}
              </div>
              {/* Table */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">{tx('Name', 'Name')}</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">{tx('Kategorie', 'Category')}</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Labels</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">{tx('Datum', 'Date')}</th>
                      <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {filteredFiles.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">{tx('Keine Dateien gefunden', 'No files found')}</td></tr>
                    )}
                    {filteredFiles.map(file => {
                      const cat = categoryConfig[file.category];
                      const CatIcon = cat.icon;
                      return (
                        <tr key={file.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="px-4 py-3">
                            <button onClick={() => { setEditingFile(file); setModalLabels(file.labels); setModalCustomLabel(''); setModalCategory(file.category); setShowNewFileModal(true); }} className="text-sm font-medium text-gray-900 dark:text-white hover:text-sky-600 transition-colors text-left">{translateFilePrefix(file.name, lang)}</button>
                            {file.description && <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[300px]">{file.description}</p>}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cat.bg} ${cat.text}`}>
                              <CatIcon className="w-3 h-3" />{lang === 'de' ? cat.de : cat.en}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {file.labels.map(l => <span key={l} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-full text-xs">{l}</span>)}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">{new Date(file.updatedAt).toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', { day: 'numeric', month: 'short' })}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => window.open(file.url, '_blank')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title={tx('Öffnen', 'Open')}><ExternalLink className="w-4 h-4 text-gray-500" /></button>
                              <button onClick={() => { setEditingFile(file); setModalLabels(file.labels); setModalCustomLabel(''); setModalCategory(file.category); setShowNewFileModal(true); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title={tx('Bearbeiten', 'Edit')}><Edit3 className="w-4 h-4 text-gray-500" /></button>
                              <button onClick={() => setDeleteFileId(file.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors" title={tx('Löschen', 'Delete')}><Trash2 className="w-4 h-4 text-red-500" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* File Modal */}
              {showNewFileModal && (() => {
                const isEditing = !!editingFile;
                return (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => { setShowNewFileModal(false); setEditingFile(null); }}>
                    <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg p-6 border border-gray-200 dark:border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold">{isEditing ? tx('Datei bearbeiten', 'Edit File') : tx('Neue Datei', 'New File')}</h3>
                        <button onClick={() => { setShowNewFileModal(false); setEditingFile(null); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl" title={tx('Schließen', 'Close')}><X className="w-5 h-5" /></button>
                      </div>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const now = new Date().toISOString();
                        // Auto-prefix: find first matching label prefix
                        let rawName = (formData.get('fname') as string || 'Untitled').trim();
                        if (!isEditing) {
                          const matchedLabel = modalLabels.find(l => FILE_PREFIX_MAP[l]);
                          const pfx = matchedLabel ? FILE_PREFIX_MAP[matchedLabel] : null;
                          if (pfx) {
                            const p = lang === 'de' ? pfx.de : pfx.en;
                            if (!rawName.startsWith(p + ':') && !rawName.startsWith(p + ' :')) {
                              rawName = p + ': ' + rawName;
                            }
                          }
                        }
                        const newFile: FileLink = {
                          id: editingFile?.id || Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
                          name: rawName,
                          url: formData.get('furl') as string || '',
                          description: formData.get('fdesc') as string || '',
                          category: modalCategory,
                          labels: modalLabels,
                          createdAt: editingFile?.createdAt || now,
                          updatedAt: now,
                        };
                        if (isEditing) {
                          setFileLinks(prev => prev.map(f => f.id === newFile.id ? newFile : f));
                        } else {
                          setFileLinks(prev => [newFile, ...prev]);
                        }
                        setShowNewFileModal(false);
                        setEditingFile(null);
                        addToast(isEditing ? tx('Datei aktualisiert', 'File updated') : tx('Datei hinzugefügt', 'File added'));
                      }} className="space-y-5">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">{tx('Name', 'Name')}</label>
                          <input name="fname" defaultValue={editingFile?.name || ''} required className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30" />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">URL / Link</label>
                          <input name="furl" defaultValue={editingFile?.url || ''} placeholder="https://..." className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30" />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">{tx('Beschreibung', 'Description')}</label>
                          <input name="fdesc" defaultValue={editingFile?.description || ''} className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30" />
                        </div>
                        {/* Category as visual tiles */}
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">{tx('Kategorie', 'Category')}</label>
                          <div className="grid grid-cols-3 gap-2">
                            {(Object.keys(categoryConfig) as FileCategory[]).map(k => {
                              const c = categoryConfig[k]; const I = c.icon;
                              const isActive = modalCategory === k;
                              return (
                                <button key={k} type="button" onClick={() => setModalCategory(k)} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${isActive ? `${c.bg} ${c.text} border-current` : 'border-gray-100 dark:border-gray-800 text-gray-500 hover:border-gray-200 dark:hover:border-gray-700'}`}>
                                  <I className="w-4 h-4 flex-shrink-0" />
                                  <span className="truncate">{lang === 'de' ? c.de : c.en}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        {/* Labels as toggle chips */}
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Labels</label>
                          {/* Selected labels */}
                          {modalLabels.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {modalLabels.map(l => (
                                <button key={l} type="button" onClick={() => setModalLabels(prev => prev.filter(x => x !== l))} className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 rounded-full text-xs font-medium hover:bg-sky-200 dark:hover:bg-sky-500/30 transition-colors">
                                  {l}
                                  <X className="w-3 h-3" />
                                </button>
                              ))}
                            </div>
                          )}
                          {/* Suggested labels */}
                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-100 dark:border-gray-800">
                            <p className="text-xs text-gray-400 mb-2">{tx('Vorschläge', 'Suggestions')}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {SUGGESTED_LABELS.filter(l => !modalLabels.includes(l)).map(l => (
                                <button key={l} type="button" onClick={() => setModalLabels(prev => [...prev, l])} className="px-2.5 py-1 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs font-medium border border-gray-200 dark:border-gray-700 hover:border-sky-300 hover:text-sky-600 dark:hover:border-sky-500/40 dark:hover:text-sky-400 transition-colors">
                                  + {l}
                                </button>
                              ))}
                            </div>
                            {/* Custom label input */}
                            <div className="flex items-center gap-2 mt-2.5">
                              <input value={modalCustomLabel} onChange={e => setModalCustomLabel(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); const v = modalCustomLabel.trim(); if (v && !modalLabels.includes(v)) { setModalLabels(prev => [...prev, v]); setModalCustomLabel(''); } } }} placeholder={tx('Eigenes Label...', 'Custom label...')} className="flex-1 px-2.5 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/30" />
                              <button type="button" onClick={() => { const v = modalCustomLabel.trim(); if (v && !modalLabels.includes(v)) { setModalLabels(prev => [...prev, v]); setModalCustomLabel(''); } }} className="px-2.5 py-1.5 text-xs font-medium text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-500/10 rounded-lg transition-colors"><Plus className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                          <button type="button" onClick={() => { setShowNewFileModal(false); setEditingFile(null); }} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">{tx('Abbrechen', 'Cancel')}</button>
                          <button type="submit" className="px-4 py-2 text-sm bg-sky-500 text-white rounded-xl hover:bg-sky-600 font-medium">{isEditing ? tx('Speichern', 'Save') : tx('Hinzufügen', 'Add')}</button>
                        </div>
                      </form>
                    </div>
                  </div>
                );
              })()}
              <ConfirmDialog
                open={!!deleteFileId}
                title={tx('Datei löschen?', 'Delete file?')}
                message={tx('Diese Dateiverknüpfung wird entfernt.', 'This file link will be removed.')}
                confirmLabel={tx('Löschen', 'Delete')}
                cancelLabel={tx('Abbrechen', 'Cancel')}
                variant="danger"
                onConfirm={() => { if (deleteFileId) { setFileLinks(prev => prev.filter(f => f.id !== deleteFileId)); addToast(tx('Datei gelöscht', 'File deleted')); } setDeleteFileId(null); }}
                onCancel={() => setDeleteFileId(null)}
              />

            </div>
          )}

          {/* PLANNING — Strategic Planning + Todos + Mindmap */}
          {section === 'planning' && (
            <div className="space-y-6">
              {/* ═══ PLAN CARDS OVERVIEW ═══ */}
              {!v2SelectedPlan ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{tx('Planung', 'Planning')}</h2>
                      <p className="text-sm text-gray-500">{plans.length} {tx('Pläne', 'Plans')}</p>
                    </div>
                    <button onClick={() => setShowPlanBuilder(true)} className="px-4 py-2 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-600 flex items-center gap-2"><Plus className="w-4 h-4" />{tx('Neuer Plan', 'New Plan')}</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {plans.map(plan => {
                      const totalTasks = plan.sections.reduce((s, sec) => s + sec.tasks.length, 0);
                      const onceTotal = plan.sections.reduce((s, sec) => s + sec.tasks.filter(t => t.frequency === 'once').length, 0);
                      const onceDone = plan.sections.reduce((s, sec) => s + sec.tasks.filter(t => t.frequency === 'once' && t.done).length, 0);
                      const pct = onceTotal > 0 ? Math.round((onceDone / onceTotal) * 100) : 0;
                      const mmaCount = plan.sections.reduce((s, sec) => s + sec.tasks.filter(t => t.isMMA).length, 0);
                      return (
                        <div key={plan.id} onClick={() => { setV2SelectedPlan(plan.id); setActivePlanId(plan.id); }} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all group">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"><Sparkles className="w-5 h-5 text-white" /></div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-900 dark:text-white truncate">{plan.name}</h3>
                              <p className="text-xs text-gray-500 truncate">{plan.description || tx('Kein Beschreibung', 'No description')}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{plan.sections.length} {tx('Sektionen', 'Sections')}</span>
                            <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{totalTasks} Tasks</span>
                            {mmaCount > 0 && <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full">MMA: {mmaCount}</span>}
                            {plan.deadline && <span className="text-xs text-gray-400 ml-auto">{new Date(plan.deadline + 'T00:00:00').toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', { day: 'numeric', month: 'short' })}</span>}
                          </div>
                          <div className="flex items-center justify-between">
                            {/* Mini donut chart */}
                            <div className="relative w-10 h-10 flex-shrink-0">
                              <svg viewBox="0 0 36 36" className="w-10 h-10">
                                <circle cx="18" cy="18" r="14" fill="none" stroke={darkMode ? '#374151' : '#e5e7eb'} strokeWidth="3" />
                                <circle cx="18" cy="18" r="14" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray={`${pct * 0.88} ${88 - pct * 0.88}`} strokeDashoffset="22" strokeLinecap="round" />
                              </svg>
                              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-emerald-600">{pct}%</span>
                            </div>
                            <span className="text-[10px] text-gray-400">{onceDone}/{onceTotal} {tx('erledigt', 'done')}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
              <>
              {/* ═══ PLAN DETAIL ═══ */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => { setV2SelectedPlan(null); setV2DetailTask(null); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors" title={tx('Zurück', 'Back')}><ArrowLeft className="w-5 h-5 text-gray-500" /></button>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{activePlan?.name}</h2>
                </div>
                <div className="flex items-center gap-2">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input value={planSearch} onChange={e => setPlanSearch(e.target.value)} placeholder={tx('Suchen...', 'Search...')} className="pl-8 pr-3 py-1.5 w-36 rounded-lg text-xs bg-gray-100 dark:bg-gray-800 border-none focus:outline-none focus:ring-2 focus:ring-sky-500/30 text-gray-900 dark:text-white placeholder-gray-400" />
                  </div>
                  <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-0.5">
                    <button onClick={() => setV2Mode('plan')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${v2Mode === 'plan' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><ClipboardList className="w-3.5 h-3.5" />{tx('Plan', 'Plan')}</button>
                    <button onClick={() => setV2Mode('week')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${v2Mode === 'week' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><Calendar className="w-3.5 h-3.5" />{tx('Woche', 'Week')}</button>
                    <button onClick={() => setV2Mode('todos')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${v2Mode === 'todos' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><CheckSquare className="w-3.5 h-3.5" />Todos</button>
                    <button onClick={() => setV2Mode('mindmap')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${v2Mode === 'mindmap' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><GitBranch className="w-3.5 h-3.5" />Mindmap</button>
                  </div>
                </div>
              </div>

              {activePlan && v2Mode === 'plan' && (
                <>
                  {/* ── STRATEGY CARD ── */}
                  <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-indigo-950/30 dark:via-gray-900 dark:to-purple-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 overflow-hidden">
                    <div className="p-6 space-y-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0"><Sparkles className="w-5 h-5 text-white" /></div>
                          <div className="min-w-0 flex-1">
                            <input value={activePlan.name} onChange={e => setPlans(prev => prev.map(p => p.id === activePlanId ? { ...p, name: e.target.value, updatedAt: new Date().toISOString() } : p))} className="text-lg font-bold bg-transparent border-none focus:outline-none focus:ring-0 w-full text-gray-900 dark:text-white" />
                            <textarea value={activePlan.description} onChange={e => { const ta = e.target; setPlans(prev => prev.map(p => p.id === activePlanId ? { ...p, description: ta.value } : p)); ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; }} onFocus={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }} rows={1} placeholder={tx('Kurzbeschreibung...', 'Short description...')} className="text-sm text-gray-500 bg-transparent border-none focus:outline-none focus:ring-0 w-full resize-none overflow-hidden" />
                          </div>
                        </div>
                        <button onClick={() => { if (!window.confirm(tx('Plan wirklich löschen?', 'Really delete this plan?'))) return; const remaining = plans.filter(p => p.id !== activePlanId); setPlans(remaining); if (remaining.length > 0) { setActivePlanId(remaining[0].id); } else { setV2SelectedPlan(null); setActivePlanId(''); } addToast(tx('Plan gelöscht', 'Plan deleted')); }} className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg" title={tx('Plan löschen', 'Delete plan')}><Trash2 className="w-4 h-4 text-red-500" /></button>
                      </div>

                      {/* Meta row: Deadline + Stats */}
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-xl px-3 py-2 border border-gray-200 dark:border-gray-700">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-500">{tx('Deadline', 'Deadline')}:</span>
                          <input type="date" value={activePlan.deadline || ''} onChange={e => setPlans(prev => prev.map(p => p.id === activePlanId ? { ...p, deadline: e.target.value } : p))} className="text-sm bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 dark:text-white" />
                        </div>
                        {(() => {
                          const totalTasks = activePlan.sections.reduce((s, sec) => s + sec.tasks.length, 0);
                          const onceDone = activePlan.sections.reduce((s, sec) => s + sec.tasks.filter(t => t.frequency === 'once' && t.done).length, 0);
                          const onceTotal = activePlan.sections.reduce((s, sec) => s + sec.tasks.filter(t => t.frequency === 'once').length, 0);
                          const mmaCount = activePlan.sections.reduce((s, sec) => s + sec.tasks.filter(t => t.isMMA).length, 0);
                          const pct = onceTotal > 0 ? Math.round((onceDone / onceTotal) * 100) : 0;
                          return (
                            <>
                              <span className="text-xs text-gray-500 bg-white dark:bg-gray-900 rounded-xl px-3 py-2 border border-gray-200 dark:border-gray-700">{activePlan.sections.length} {tx('Sektionen', 'Sections')} · {totalTasks} {tx('Aufgaben', 'Tasks')}</span>
                              {mmaCount > 0 && <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-500/10 rounded-xl px-3 py-2 border border-amber-200 dark:border-amber-500/30">MMA: {mmaCount}</span>}
                              <div className="flex items-center gap-2 ml-auto">
                                <div className="w-20 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} /></div>
                                <span className="text-xs font-bold text-emerald-600">{pct}%</span>
                              </div>
                            </>
                          );
                        })()}
                      </div>

                      {/* Structured Fields — grouped with icons */}
                      {activePlan.goal !== undefined || activePlan.targetAudience !== undefined || (activePlan.channels && activePlan.channels.length > 0) ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Grundlagen Card */}
                          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                            <div className="flex items-center gap-2 mb-1"><Target className="w-4 h-4 text-indigo-500" /><span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">{tx('Grundlagen', 'Basics')}</span></div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Users className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                <input value={activePlan.targetAudience || ''} onChange={e => setPlans(prev => prev.map(p => p.id === activePlanId ? { ...p, targetAudience: e.target.value } : p))} placeholder={tx('Zielgruppe...', 'Audience...')} className="flex-1 text-sm bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 dark:text-white" />
                              </div>
                              {activePlan.deadline && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                  <span className="text-sm text-gray-600 dark:text-gray-400">{new Date(activePlan.deadline + 'T00:00:00').toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Kanäle Card */}
                          {activePlan.channels && activePlan.channels.length > 0 && (
                            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                              <div className="flex items-center gap-2 mb-1"><Layers className="w-4 h-4 text-purple-500" /><span className="text-xs font-bold text-purple-500 uppercase tracking-widest">{tx('Kanäle', 'Channels')}</span></div>
                              <div className="flex flex-wrap gap-1.5">
                                {activePlan.channels.map(ch => {
                                  const m = channelMeta[ch];
                                  return <span key={ch} className="inline-flex items-center gap-1.5 text-xs bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-lg font-medium text-gray-700 dark:text-gray-300">{channelSvgIcon(ch, 14)}{m?.label}</span>;
                                })}
                              </div>
                            </div>
                          )}

                          {/* Team Card */}
                          {activePlan.teamMembers && activePlan.teamMembers.length > 0 && (
                            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                              <div className="flex items-center gap-2 mb-1"><Users className="w-4 h-4 text-emerald-500" /><span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Team</span></div>
                              <div className="flex flex-wrap gap-2">
                                {activePlan.teamMembers.map(m => {
                                  const taskCount = activePlan.sections.reduce((s, sec) => s + sec.tasks.filter(t => t.assignee === m.id).length, 0);
                                  const cols: Record<string, string> = { indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400', emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400', sky: 'bg-sky-100 text-sky-700', amber: 'bg-amber-100 text-amber-700', rose: 'bg-rose-100 text-rose-700', purple: 'bg-purple-100 text-purple-700' };
                                  return (
                                    <div key={m.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${cols[m.color] || cols.indigo}`}>
                                      <span className="w-6 h-6 rounded-full bg-current/10 flex items-center justify-center text-[10px] font-bold">{m.initials}</span>
                                      {m.name}
                                      {taskCount > 0 && <span className="opacity-60 text-[10px]">({taskCount})</span>}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Revenue & Berechnung Card — per-channel conversion */}
                          {activePlan.revenueGoal && activePlan.productPrice && (() => {
                            const cust = Math.ceil(activePlan.revenueGoal / activePlan.productPrice);
                            const dl = activePlan.deadline ? new Date(activePlan.deadline) : null;
                            const wks = dl ? Math.max(1, Math.ceil((dl.getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000))) : null;
                            const workdays = wks ? wks * 5 : null;
                            const fmt = (n: number) => n.toLocaleString('de-DE');

                            // Per-channel breakdown using funnel steps
                            const outreachChs = (activePlan.channels || []).filter(ch => ['cold-calls','cold-emails','pvc','dmc'].includes(ch));
                            const chBreakdown = outreachChs.map(ch => {
                              const cfg = activePlan.channelConfig?.[ch] || {};
                              const perDay = cfg.countPerDay || (ch === 'cold-calls' ? 20 : ch === 'cold-emails' ? 50 : ch === 'pvc' ? 15 : ch === 'dmc' ? 10 : 30);
                              const steps = cfg.funnelSteps || defaultFunnels[ch] || [];
                              const { finalPerDay } = calcFunnelOutput(perDay, steps);
                              return { ch, label: channelMeta[ch].label, perDay, custD: finalPerDay };
                            });
                            const totalCustDay = chBreakdown.reduce((s, c) => s + c.custD, 0);
                            const totalCustWeek = totalCustDay * 5;
                            const totalInPeriod = workdays ? totalCustDay * workdays : null;
                            const reachesGoal = totalInPeriod !== null ? totalInPeriod >= cust : null;
                            const weeksNeeded = totalCustWeek > 0 ? Math.ceil(cust / totalCustWeek) : null;

                            return (
                              <div className="md:col-span-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-500/5 dark:to-purple-500/5 rounded-xl border border-indigo-100 dark:border-indigo-500/20 p-4 space-y-3">
                                <div className="flex items-center gap-2 mb-1"><BarChart3 className="w-4 h-4 text-indigo-500" /><span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">{tx('Strategie-Berechnung', 'Strategy Calculation')}</span></div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  <div className="bg-white/70 dark:bg-gray-900/50 rounded-lg p-3 text-center">
                                    <p className="text-[10px] text-gray-500 mb-1">{tx('Ziel-Umsatz', 'Revenue Goal')}</p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">{fmt(activePlan.revenueGoal)}€</p>
                                  </div>
                                  <div className="bg-white/70 dark:bg-gray-900/50 rounded-lg p-3 text-center">
                                    <p className="text-[10px] text-gray-500 mb-1">{tx('Produktpreis', 'Product Price')}</p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">{fmt(activePlan.productPrice)}€</p>
                                  </div>
                                  <div className="bg-white/70 dark:bg-gray-900/50 rounded-lg p-3 text-center">
                                    <p className="text-[10px] text-gray-500 mb-1">{tx('Kunden benötigt', 'Customers Needed')}</p>
                                    <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{fmt(cust)}</p>
                                  </div>
                                  {wks && (
                                    <div className="bg-white/70 dark:bg-gray-900/50 rounded-lg p-3 text-center">
                                      <p className="text-[10px] text-gray-500 mb-1">{tx('Verbleibend', 'Remaining')}</p>
                                      <p className="text-lg font-bold text-gray-900 dark:text-white">{wks} {tx('Wo.', 'Wks')}</p>
                                    </div>
                                  )}
                                </div>
                                {chBreakdown.length > 0 && (
                                  <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">{tx('Kanal-Prognose', 'Channel Forecast')}</p>
                                    <div className="space-y-1">
                                      {chBreakdown.map(cb => (
                                        <div key={cb.ch} className="flex items-center justify-between text-xs bg-white/50 dark:bg-gray-900/30 rounded-lg px-3 py-1.5">
                                          <span className="font-medium text-gray-700 dark:text-gray-300">{cb.label}</span>
                                          <span className="flex items-center gap-1.5">
                                            <span className="text-gray-400">{cb.perDay}/{tx('Tag', 'd')}</span>
                                            <span className="text-gray-300 dark:text-gray-600">→</span>
                                            <span className="text-emerald-600 font-bold">{cb.custD < 0.01 ? cb.custD.toFixed(3) : cb.custD < 0.1 ? cb.custD.toFixed(2) : cb.custD.toFixed(1)} {tx('Kunden/Tag', 'cust./day')}</span>
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                    <div className="flex items-center justify-between bg-white/70 dark:bg-gray-900/50 rounded-lg px-3 py-2">
                                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{tx('Gesamt/Woche', 'Total/Week')}</span>
                                      <span className="text-sm font-bold text-indigo-600">{totalCustWeek < 1 ? totalCustWeek.toFixed(1) : Math.round(totalCustWeek)} {tx('Kunden', 'customers')}</span>
                                    </div>
                                    {weeksNeeded && <div className="flex items-center justify-between bg-white/70 dark:bg-gray-900/50 rounded-lg px-3 py-2">
                                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{tx('Wochen bis Ziel', 'Weeks to Goal')}</span>
                                      <span className="text-sm font-bold text-gray-900 dark:text-white">{weeksNeeded}</span>
                                    </div>}
                                    {reachesGoal !== null && (
                                      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold ${reachesGoal ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' : 'bg-red-50 dark:bg-red-500/10 text-red-500'}`}>
                                        {reachesGoal ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                                        {reachesGoal
                                          ? tx('Ziel erreichbar!', 'Goal achievable!')
                                          : tx(`Es fehlen ~${fmt(cust - Math.round(totalInPeriod!))} Kunden`, `~${fmt(cust - Math.round(totalInPeriod!))} customers short`)}
                                      </div>
                                    )}
                                    {reachesGoal === false && workdays && chBreakdown.length > 0 && (() => {
                                      const factor = totalCustDay > 0 ? cust / (totalCustDay * workdays) : 0;
                                      const deficitPerDay = (cust - totalInPeriod!) / workdays;
                                      const soloSuggestions = chBreakdown.map(cb => {
                                        const convPerUnit = cb.custD / cb.perDay;
                                        return { ...cb, needed: Math.ceil(cb.perDay + deficitPerDay / convPerUnit) };
                                      });
                                      return (
                                        <div className="bg-amber-50 dark:bg-amber-500/5 rounded-lg border border-amber-200/60 dark:border-amber-500/20 p-3 space-y-2.5">
                                          <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">{tx('Vorschläge zur Zielerreichung', 'Suggestions to Reach Goal')}</p>
                                          <div className="space-y-1">
                                            <p className="text-[10px] text-gray-500">{chBreakdown.length > 1 ? tx('Alle Kanäle proportional erhöhen:', 'Increase all channels proportionally:') : tx('Schlagzahl erhöhen:', 'Increase activity:')}</p>
                                            {chBreakdown.map(cb => (
                                              <div key={cb.ch} className="flex items-center justify-between text-xs bg-white/60 dark:bg-gray-900/30 rounded-lg px-2.5 py-1.5">
                                                <span className="text-gray-600 dark:text-gray-400">{cb.label}</span>
                                                <span className="flex items-center gap-1"><span className="text-gray-400">{cb.perDay}</span><span className="text-amber-500">→</span><span className="font-bold text-amber-600 dark:text-amber-400">{Math.ceil(cb.perDay * factor)}/{tx('Tag', 'd')}</span></span>
                                              </div>
                                            ))}
                                          </div>
                                          {chBreakdown.length > 1 && (
                                            <div className="space-y-1">
                                              <p className="text-[10px] text-gray-500">{tx('Oder nur einen Kanal erhöhen:', 'Or increase just one channel:')}</p>
                                              {soloSuggestions.map(s => (
                                                <div key={s.ch} className="flex items-center justify-between text-xs bg-white/60 dark:bg-gray-900/30 rounded-lg px-2.5 py-1.5">
                                                  <span className="text-gray-600 dark:text-gray-400">{s.label}</span>
                                                  <span className="flex items-center gap-1"><span className="text-gray-400">{s.perDay}</span><span className="text-amber-500">→</span><span className="font-bold text-amber-600 dark:text-amber-400">{s.needed}/{tx('Tag', 'd')}</span></span>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })()}
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      ) : (
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 text-xs text-gray-400 italic">{tx('Keine strukturierten Felder — erstelle Pläne über den Plan-Builder für volle Features.', 'No structured fields — create plans via the Plan Builder for full features.')}</div>
                      )}

                      {/* Strategy textarea */}
                      <div>
                        <label className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2 block flex items-center gap-1.5"><Target className="w-3.5 h-3.5" />{tx('Strategie', 'Strategy')}</label>
                        <textarea value={activePlan.strategy || ''} onChange={e => { const ta = e.target; setPlans(prev => prev.map(p => p.id === activePlanId ? { ...p, strategy: ta.value, updatedAt: new Date().toISOString() } : p)); ta.style.height = 'auto'; ta.style.height = Math.max(112, ta.scrollHeight) + 'px'; }} onFocus={e => { e.target.style.height = 'auto'; e.target.style.height = Math.max(112, e.target.scrollHeight) + 'px'; }} placeholder={tx('Was ist die übergeordnete Strategie? Ziele, Zielgruppe, Kernbotschaft, Kanäle...', 'What is the overarching strategy? Goals, audience, core message, channels...')} className="w-full min-h-[112px] px-4 py-3 rounded-xl text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 overflow-hidden" />
                      </div>

                      {/* Free notes textarea */}
                      <div>
                        <label className="text-xs font-bold text-purple-500 uppercase tracking-widest mb-2 block flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" />{tx('Notizen', 'Notes')}</label>
                        <textarea value={activePlan.notes || ''} onChange={e => { const ta = e.target; setPlans(prev => prev.map(p => p.id === activePlanId ? { ...p, notes: ta.value, updatedAt: new Date().toISOString() } : p)); ta.style.height = 'auto'; ta.style.height = Math.max(80, ta.scrollHeight) + 'px'; }} onFocus={e => { e.target.style.height = 'auto'; e.target.style.height = Math.max(80, e.target.scrollHeight) + 'px'; }} placeholder={tx('Freie Notizen, Gedanken, Links, Ideen...', 'Free notes, thoughts, links, ideas...')} className="w-full min-h-[80px] px-4 py-3 rounded-xl text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/30 overflow-hidden" />
                      </div>
                    </div>
                  </div>

                  {/* ── SUMMARY CARDS ── */}
                  {(() => {
                    const allT = activePlan.sections.flatMap(s => s.tasks);
                    const today = new Date(); today.setHours(0,0,0,0);
                    const endOfWeek = new Date(today); endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
                    const overdue = allT.filter(t => !t.done && t.dueDate && new Date(t.dueDate + 'T23:59:59') < today);
                    const dueThisWeek = allT.filter(t => !t.done && t.dueDate && (() => { const d = new Date(t.dueDate + 'T23:59:59'); return d >= today && d <= endOfWeek; })());
                    const mmaOpen = allT.filter(t => t.isMMA && !t.done);
                    const onceDone = allT.filter(t => t.frequency === 'once' && t.done).length;
                    const onceTotal = allT.filter(t => t.frequency === 'once').length;
                    const pct = onceTotal > 0 ? Math.round((onceDone / onceTotal) * 100) : 0;
                    return (
                      <div className="grid grid-cols-4 gap-3">
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-3 text-center">
                          <p className="text-[10px] text-gray-400 mb-1">{tx('Fortschritt', 'Progress')}</p>
                          <p className="text-xl font-bold text-emerald-600">{pct}%</p>
                          <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-1.5 overflow-hidden"><div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} /></div>
                        </div>
                        <div className={`bg-white dark:bg-gray-900 rounded-xl border p-3 text-center cursor-pointer transition-colors ${planQuickFilter === 'mma' ? 'border-amber-300 bg-amber-50 dark:bg-amber-500/5' : 'border-gray-100 dark:border-gray-800 hover:border-amber-200'}`} onClick={() => setPlanQuickFilter(prev => prev === 'mma' ? 'all' : 'mma')}>
                          <p className="text-[10px] text-gray-400 mb-1">MMA {tx('offen', 'open')}</p>
                          <p className="text-xl font-bold text-amber-600">{mmaOpen.length}</p>
                        </div>
                        <div className={`bg-white dark:bg-gray-900 rounded-xl border p-3 text-center cursor-pointer transition-colors ${planQuickFilter === 'overdue' ? 'border-red-300 bg-red-50 dark:bg-red-500/5' : 'border-gray-100 dark:border-gray-800 hover:border-red-200'}`} onClick={() => setPlanQuickFilter(prev => prev === 'overdue' ? 'all' : 'overdue')}>
                          <p className="text-[10px] text-gray-400 mb-1">{tx('Überfällig', 'Overdue')}</p>
                          <p className={`text-xl font-bold ${overdue.length > 0 ? 'text-red-500' : 'text-gray-300'}`}>{overdue.length}</p>
                        </div>
                        <div className={`bg-white dark:bg-gray-900 rounded-xl border p-3 text-center cursor-pointer transition-colors ${planQuickFilter === 'week' ? 'border-sky-300 bg-sky-50 dark:bg-sky-500/5' : 'border-gray-100 dark:border-gray-800 hover:border-sky-200'}`} onClick={() => setPlanQuickFilter(prev => prev === 'week' ? 'all' : 'week')}>
                          <p className="text-[10px] text-gray-400 mb-1">{tx('Diese Woche', 'This Week')}</p>
                          <p className="text-xl font-bold text-sky-600">{dueThisWeek.length}</p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* ── QUICK FILTERS ── */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {[
                      { key: 'all' as const, label: tx('Alle', 'All') },
                      { key: 'mma' as const, label: 'MMA' },
                      { key: 'overdue' as const, label: tx('Überfällig', 'Overdue') },
                      { key: 'week' as const, label: tx('Diese Woche', 'This Week') },
                      { key: 'mine' as const, label: tx('Meine', 'Mine') },
                    ].map(f => (
                      <button key={f.key} onClick={() => setPlanQuickFilter(f.key)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${planQuickFilter === f.key ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>{f.label}</button>
                    ))}
                    {planQuickFilter !== 'all' && <button onClick={() => setPlanQuickFilter('all')} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400" title={tx('Filter zurücksetzen', 'Reset filter')}><X className="w-3.5 h-3.5" /></button>}
                  </div>

                  {/* ── SECTIONS + TASKS (with detail panel) ── */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">{tx('Sektionen & Aufgaben', 'Sections & Tasks')}</h3>
                  </div>

                  {v2Mode === 'plan' && (
                    <div className={`${v2DetailTask ? 'grid grid-cols-12 gap-6' : ''}`}>
                      <div className={v2DetailTask ? 'col-span-7 space-y-3' : 'space-y-3'}>
                        {activePlan.sections.map((sec, secIdx) => {
                          const isExpanded = v2ExpandedSections.has(sec.id);
                          const todayStr = new Date().toISOString().slice(0, 10);
                          const endOfWeekDate = new Date(); endOfWeekDate.setDate(endOfWeekDate.getDate() + (7 - endOfWeekDate.getDay()));
                          const endOfWeekStr = endOfWeekDate.toISOString().slice(0, 10);
                          const searchFiltered = sec.tasks.filter(t => !planSearch || t.title.toLowerCase().includes(planSearch.toLowerCase()) || t.description.toLowerCase().includes(planSearch.toLowerCase()));
                          const quickFiltered = searchFiltered.filter(t => {
                            if (planQuickFilter === 'all') return true;
                            if (planQuickFilter === 'mma') return t.isMMA && !t.done;
                            if (planQuickFilter === 'overdue') return !t.done && t.dueDate && t.dueDate < todayStr;
                            if (planQuickFilter === 'week') return !t.done && t.dueDate && t.dueDate >= todayStr && t.dueDate <= endOfWeekStr;
                            if (planQuickFilter === 'mine') return t.assignee === (activePlan.teamMembers?.[0]?.id || '');
                            return true;
                          });
                          const sortKey = sectionSortBy[sec.id] || 'default';
                          const allTasks = [...quickFiltered].sort((a, b) => {
                            if (sortKey === 'priority') { const po: Record<string, number> = { high: 0, medium: 1, low: 2 }; return (po[a.priority || 'medium'] ?? 1) - (po[b.priority || 'medium'] ?? 1); }
                            if (sortKey === 'due') { if (!a.dueDate && !b.dueDate) return 0; if (!a.dueDate) return 1; if (!b.dueDate) return -1; return a.dueDate.localeCompare(b.dueDate); }
                            if (sortKey === 'status') { const so: Record<string, number> = { 'in-progress': 0, todo: 1, done: 2 }; return (so[a.status || 'todo'] ?? 1) - (so[b.status || 'todo'] ?? 1); }
                            return a.order - b.order;
                          });
                          const onceInSec = sec.tasks.filter(t => t.frequency === 'once');
                          const doneCount = onceInSec.filter(t => t.done).length;
                          const secPct = onceInSec.length > 0 ? Math.round((doneCount / onceInSec.length) * 100) : 0;
                          if (planSearch && allTasks.length === 0 && !sec.name.toLowerCase().includes(planSearch.toLowerCase())) return null;
                          if (planQuickFilter !== 'all' && allTasks.length === 0) return null;
                          const phaseNum = sec.phase || (secIdx + 1);

                          return (
                            <div key={sec.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                              <div className="flex items-center">
                                {/* Reorder buttons */}
                                <div className="flex flex-col items-center pl-2" onClick={e => e.stopPropagation()}>
                                  <button disabled={secIdx === 0} onClick={() => { setPlans(prev => prev.map(p => { if (p.id !== activePlanId) return p; const secs = [...p.sections]; const idx = secs.findIndex(s => s.id === sec.id); if (idx <= 0) return p; [secs[idx - 1], secs[idx]] = [secs[idx], secs[idx - 1]]; secs.forEach((s, i) => { s.phase = i + 1; }); return { ...p, updatedAt: new Date().toISOString(), sections: secs }; })); }} className={`p-0.5 rounded transition-colors ${secIdx === 0 ? 'text-gray-200 dark:text-gray-700 cursor-default' : 'text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10'}`}><ChevronUp className="w-3.5 h-3.5" /></button>
                                  <button disabled={secIdx === activePlan.sections.length - 1} onClick={() => { setPlans(prev => prev.map(p => { if (p.id !== activePlanId) return p; const secs = [...p.sections]; const idx = secs.findIndex(s => s.id === sec.id); if (idx < 0 || idx >= secs.length - 1) return p; [secs[idx], secs[idx + 1]] = [secs[idx + 1], secs[idx]]; secs.forEach((s, i) => { s.phase = i + 1; }); return { ...p, updatedAt: new Date().toISOString(), sections: secs }; })); }} className={`p-0.5 rounded transition-colors ${secIdx === activePlan.sections.length - 1 ? 'text-gray-200 dark:text-gray-700 cursor-default' : 'text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10'}`}><ChevronDown className="w-3.5 h-3.5" /></button>
                                </div>
                                <button onClick={() => setV2ExpandedSections(prev => { const n = new Set(prev); if (n.has(sec.id)) n.delete(sec.id); else n.add(sec.id); return n; })} className="flex-1 flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                  <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0">{phaseNum}</span>
                                  {(() => { const chKey = Object.entries(channelMeta).find(([_, m]) => m.label === sec.name)?.[0]; return chKey ? channelSvgIcon(chKey, 18) : <span className="w-[18px] h-[18px] rounded flex items-center justify-center text-xs flex-shrink-0 bg-gray-200 dark:bg-gray-700">{sec.name.includes('Planung') || sec.name.includes('Planning') ? '📅' : sec.name.includes('Allgemein') || sec.name.includes('General') ? '📌' : '📋'}</span>; })()}
                                  {editingSectionId === sec.id ? (
                                    <input autoFocus value={sec.name} onClick={e => e.stopPropagation()} onChange={e => { setPlans(prev => prev.map(p => p.id === activePlanId ? { ...p, updatedAt: new Date().toISOString(), sections: p.sections.map(s => s.id === sec.id ? { ...s, name: e.target.value } : s) } : p)); }} onBlur={() => setEditingSectionId(null)} onKeyDown={e => { if (e.key === 'Enter') setEditingSectionId(null); }} className="text-sm font-bold bg-transparent border-none focus:outline-none focus:ring-0 flex-1 text-left text-gray-900 dark:text-white" placeholder={tx('Sektion benennen...', 'Name section...')} />
                                  ) : (
                                    <span onDoubleClick={e => { e.stopPropagation(); setEditingSectionId(sec.id); }} className="text-sm font-bold text-gray-900 dark:text-white flex-1 text-left cursor-text" title={tx('Doppelklick zum Bearbeiten', 'Double-click to edit')}>{sec.name}</span>
                                  )}
                                  <span className="text-xs text-gray-400">{doneCount}/{onceInSec.length}</span>
                                  {/* Progress bar */}
                                  <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex-shrink-0"><div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${secPct}%` }} /></div>
                                  <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{allTasks.length}</span>
                                  {/* Sort button */}
                                  <div className="flex-shrink-0" onClick={e => e.stopPropagation()}>
                                    <button onClick={() => setSectionSortBy(prev => { const cur = prev[sec.id] || 'default'; const order = ['default', 'priority', 'due', 'status'] as const; const next = order[(order.indexOf(cur) + 1) % order.length]; return { ...prev, [sec.id]: next }; })} className={`p-1 rounded-md transition-colors ${sortKey !== 'default' ? 'text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'text-gray-300 hover:text-gray-500'}`} title={sortKey === 'default' ? tx('Sortieren', 'Sort') : sortKey === 'priority' ? tx('Nach Priorität', 'By priority') : sortKey === 'due' ? tx('Nach Fälligkeit', 'By due date') : tx('Nach Status', 'By status')}><Filter className="w-3 h-3" /></button>
                                  </div>
                                  {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                </button>
                              </div>
                              {isExpanded && (
                                <div className="border-t border-gray-100 dark:border-gray-800">
                                  {/* Section notes */}
                                  {(sec.notes || isExpanded) && (
                                    <div className="px-4 pt-2 pb-1">
                                      <input value={sec.notes || ''} onChange={e => setPlans(prev => prev.map(p => p.id === activePlanId ? { ...p, updatedAt: new Date().toISOString(), sections: p.sections.map(s => s.id === sec.id ? { ...s, notes: e.target.value } : s) } : p))} placeholder={tx('Notiz für diese Sektion...', 'Note for this section...')} className="w-full text-xs text-gray-400 bg-transparent border-none focus:outline-none focus:ring-0 placeholder-gray-300 dark:placeholder-gray-600 italic" />
                                    </div>
                                  )}
                                  {allTasks.map(task => {
                                    const prio = task.priority ? priorityConfig[task.priority] : null;
                                    const isRecurring = task.frequency !== 'once';
                                    const freq = frequencyConfig[task.frequency];
                                    const isOverdue = !task.done && task.dueDate && task.dueDate < todayStr;
                                    const isDueToday = !task.done && task.dueDate === todayStr;
                                    return (
                                      <div key={task.id} onClick={() => setV2DetailTask({ sectionId: sec.id, task })} className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-all group border-b border-gray-50 dark:border-gray-800/50 last:border-b-0 ${v2DetailTask?.task.id === task.id ? 'bg-sky-50 dark:bg-sky-500/10' : isOverdue ? 'bg-red-50/50 dark:bg-red-500/5' : isDueToday ? 'bg-amber-50/50 dark:bg-amber-500/5' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                                        {prio && <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: prio.dot }} />}
                                        {!prio && <div className="w-2 h-2 rounded-full flex-shrink-0 bg-gray-300 dark:bg-gray-600" />}
                                        {!isRecurring ? (
                                          <button onClick={(e) => { e.stopPropagation(); setPlans(prev => prev.map(p => p.id === activePlanId ? { ...p, updatedAt: new Date().toISOString(), sections: p.sections.map(s => s.id === sec.id ? { ...s, tasks: s.tasks.map(t => t.id === task.id ? { ...t, done: !t.done, status: t.done ? 'todo' : 'done' } : t) } : s) } : p)); }} className={`w-4.5 h-4.5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${task.done ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 dark:border-gray-600 hover:border-emerald-500'}`}>{task.done && <Check className="w-2.5 h-2.5 text-white" />}</button>
                                        ) : (
                                          <RefreshCw className={`w-3.5 h-3.5 flex-shrink-0 ${freq.color}`} />
                                        )}
                                        <span className={`flex-1 text-sm ${task.done ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>{task.title || tx('Aufgabe...', 'Task...')}</span>
                                        {(task.dependsOn || []).length > 0 && (() => { const allDone2 = (task.dependsOn || []).every(depId => { let found = false; activePlan.sections.forEach(s => { const t2 = s.tasks.find(t3 => t3.id === depId); if (t2?.done) found = true; }); return found; }); return !allDone2 ? <span className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-300 rounded text-[9px] font-bold flex-shrink-0">{tx('Blockiert', 'Blocked')}</span> : <Link2 className="w-3 h-3 text-orange-400 flex-shrink-0" />; })()}
                                        {task.isMMA && <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded text-[9px] font-bold flex-shrink-0">MMA</span>}
                                        {task.assignee && activePlan.teamMembers && (() => { const m = activePlan.teamMembers.find(tm => tm.id === task.assignee); if (!m) return null; const cols: Record<string, string> = { indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400', emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400', sky: 'bg-sky-100 text-sky-600', amber: 'bg-amber-100 text-amber-600', rose: 'bg-rose-100 text-rose-600', purple: 'bg-purple-100 text-purple-600' }; return <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium flex-shrink-0 ${cols[m.color] || cols.indigo}`}>{m.initials}</span>; })()}
                                        {task.linkedItemTitle && <span className="px-1.5 py-0.5 bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-300 rounded text-[9px] font-medium flex-shrink-0 truncate max-w-[80px]">{task.linkedItemTitle}</span>}
                                        {task.subtasks && task.subtasks.length > 0 && <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 rounded text-[9px] font-medium flex-shrink-0">{task.subtasks.filter(s => s.done).length}/{task.subtasks.length}</span>}
                                        {task.dueDate && <span className={`text-[10px] flex-shrink-0 font-medium ${isOverdue ? 'text-red-500' : isDueToday ? 'text-amber-500' : 'text-gray-400'}`}>{new Date(task.dueDate + 'T00:00:00').toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', { day: 'numeric', month: 'short' })}</span>}
                                        {isRecurring && <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${freq.color}`}>{lang === 'de' ? freq.de : freq.en}</span>}
                                        <Maximize2 className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 flex-shrink-0" />
                                      </div>
                                    );
                                  })}
                                  {allTasks.length === 0 && <p className="px-4 py-4 text-sm text-gray-400">{planQuickFilter !== 'all' ? tx('Keine Aufgaben mit diesem Filter', 'No tasks match this filter') : tx('Noch keine Aufgaben', 'No tasks yet')}</p>}
                                  {/* Inline quick-add */}
                                  <form onSubmit={e => { e.preventDefault(); const input = (e.target as HTMLFormElement).elements.namedItem(`qa-${sec.id}`) as HTMLInputElement; const val = input.value.trim(); if (!val) return; const taskId = Date.now().toString(36) + Math.random().toString(36).slice(2, 5); setPlans(prev => prev.map(p => p.id === activePlanId ? { ...p, updatedAt: new Date().toISOString(), sections: p.sections.map(s => s.id === sec.id ? { ...s, tasks: [...s.tasks, { id: taskId, title: val, description: '', frequency: 'once' as TaskFrequency, done: false, order: s.tasks.length, priority: 'medium' as TaskPriority, status: 'todo' as TaskStatus }] } : s) } : p)); input.value = ''; }} className="flex items-center gap-2 px-4 py-2.5 border-t border-gray-50 dark:border-gray-800/50">
                                    <Plus className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                                    <input name={`qa-${sec.id}`} placeholder={tx('Aufgabe hinzufügen + Enter', 'Add task + Enter')} className="flex-1 text-sm bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600" />
                                  </form>
                                  <div className="flex gap-2 px-4 py-2 border-t border-gray-50 dark:border-gray-800/50">
                                    <button onClick={() => { const taskId = Date.now().toString(36) + Math.random().toString(36).slice(2, 5); const newTask: PlanTask = { id: taskId, title: '', description: '', frequency: 'once', done: false, order: sec.tasks.length, priority: 'medium', status: 'todo' }; setPlans(prev => prev.map(p => p.id === activePlanId ? { ...p, updatedAt: new Date().toISOString(), sections: p.sections.map(s => s.id === sec.id ? { ...s, tasks: [...s.tasks, newTask] } : s) } : p)); setV2DetailTask({ sectionId: sec.id, task: newTask }); }} className="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-500/10 rounded-lg transition-colors flex items-center gap-1"><Plus className="w-3 h-3" />{tx('Detail', 'Detail')}</button>
                                    <div className="flex-1" />
                                    <button onClick={() => { if (window.confirm(tx('Sektion wirklich löschen?', 'Really delete this section?'))) { setPlans(prev => prev.map(p => p.id === activePlanId ? { ...p, updatedAt: new Date().toISOString(), sections: p.sections.filter(s => s.id !== sec.id) } : p)); addToast(tx('Sektion gelöscht', 'Section deleted')); } }} className="px-2 py-1 text-xs text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors" title={tx('Sektion löschen', 'Delete section')}><Trash2 className="w-3 h-3" /></button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                        <button onClick={() => {
                          const secId = Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
                          const usedColors = activePlan.sections.map(s => s.color);
                          const nextColor = SECTION_COLORS.find(c => !usedColors.includes(c)) || SECTION_COLORS[0];
                          setPlans(prev => prev.map(p => p.id === activePlanId ? { ...p, updatedAt: new Date().toISOString(), sections: [...p.sections, { id: secId, name: tx('Neue Sektion', 'New Section'), color: nextColor, tasks: [], phase: p.sections.length + 1 }] } : p));
                          setV2ExpandedSections(prev => new Set([...prev, secId]));
                        }} className="w-full p-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-gray-400 hover:border-sky-300 hover:text-sky-500 transition-colors flex items-center justify-center gap-2 text-sm"><Plus className="w-4 h-4" />{tx('Sektion hinzufügen', 'Add Section')}</button>
                      </div>

                      {/* ── DETAIL PANEL (ClickUp-style) ── */}
                      {v2DetailTask && (() => {
                        const dt = v2DetailTask;
                        const sec = activePlan.sections.find(s => s.id === dt.sectionId);
                        const task = sec?.tasks.find(t => t.id === dt.task.id) || dt.task;
                        const secColors = sec ? (sectionColorMap[sec.color] || sectionColorMap.amber) : sectionColorMap.amber;
                        const updateTask = (updates: Partial<PlanTask>) => {
                          setPlans(prev => prev.map(p => p.id === activePlanId ? { ...p, updatedAt: new Date().toISOString(), sections: p.sections.map(s => s.id === dt.sectionId ? { ...s, tasks: s.tasks.map(t => t.id === dt.task.id ? { ...t, ...updates } : t) } : s) } : p));
                        };
                        return (
                          <div className="col-span-5">
                            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 sticky top-20 overflow-hidden max-h-[80vh] overflow-y-auto">
                              <div className={`px-5 py-3 ${secColors.bg} border-b ${secColors.border} flex items-center justify-between`}>
                                <span className={`text-xs font-bold ${secColors.text} uppercase tracking-wider`}>{sec?.name}</span>
                                <button onClick={() => setV2DetailTask(null)} className="p-1 rounded-lg hover:bg-white/50 dark:hover:bg-black/20" title={tx('Schließen', 'Close')}><X className="w-4 h-4 text-gray-500" /></button>
                              </div>
                              <div className="p-6 space-y-5">
                                <input value={task.title} onChange={e => updateTask({ title: e.target.value })} placeholder={tx('Aufgabe eingeben...', 'Enter task...')} className="text-xl font-bold w-full bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 dark:text-white" autoFocus={!task.title} />

                                {/* Properties – ClickUp-style rows */}
                                <div className="divide-y divide-gray-50 dark:divide-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                                  {/* Status */}
                                  <div className="flex items-center gap-3 px-4 py-2.5">
                                    <span className="text-xs font-medium text-gray-500 w-24 flex-shrink-0">Status</span>
                                    <div className="flex-1 relative">
                                      <button onClick={() => setV2ShowStatusDD(!v2ShowStatusDD)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <div className={`w-2 h-2 rounded-full ${statusColumnsConfig[(task.status || (task.done ? 'done' : 'todo')) as TaskStatus].bg}`} />
                                        <span className={statusColumnsConfig[(task.status || (task.done ? 'done' : 'todo')) as TaskStatus].text}>{lang === 'de' ? statusColumnsConfig[(task.status || (task.done ? 'done' : 'todo')) as TaskStatus].de : statusColumnsConfig[(task.status || (task.done ? 'done' : 'todo')) as TaskStatus].en}</span>
                                        <ChevronDown className="w-3 h-3 text-gray-400" />
                                      </button>
                                      {v2ShowStatusDD && (<>
                                        <div className="fixed inset-0 z-30" onClick={() => setV2ShowStatusDD(false)} />
                                        <div className="absolute left-0 top-full mt-1 z-40 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden py-1">
                                          {(Object.keys(statusColumnsConfig) as TaskStatus[]).map(s => (
                                            <button key={s} onClick={() => { updateTask({ status: s, done: s === 'done' }); setV2ShowStatusDD(false); }} className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${(task.status || (task.done ? 'done' : 'todo')) === s ? 'bg-sky-50 dark:bg-sky-500/10 text-sky-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                                              <span>{lang === 'de' ? statusColumnsConfig[s].de : statusColumnsConfig[s].en}</span>
                                              {(task.status || (task.done ? 'done' : 'todo')) === s && <Check className="w-3.5 h-3.5" />}
                                            </button>
                                          ))}
                                        </div>
                                      </>)}
                                    </div>
                                  </div>
                                  {/* Priority */}
                                  <div className="flex items-center gap-3 px-4 py-2.5">
                                    <span className="text-xs font-medium text-gray-500 w-24 flex-shrink-0">{tx('Priorität', 'Priority')}</span>
                                    <div className="flex gap-1 flex-1">
                                      {(['high', 'medium', 'low'] as TaskPriority[]).map(p => {
                                        const pc = priorityConfig[p];
                                        return <button key={p} onClick={() => updateTask({ priority: p })} className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors border ${(task.priority || 'medium') === p ? `${pc.bg} ${pc.text} ${pc.border}` : 'border-transparent text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>{lang === 'de' ? pc.de : pc.en}</button>;
                                      })}
                                    </div>
                                  </div>
                                  {/* Due date */}
                                  <div className="flex items-center gap-3 px-4 py-2.5">
                                    <span className="text-xs font-medium text-gray-500 w-24 flex-shrink-0">{tx('Deadline', 'Due Date')}</span>
                                    <input type="date" value={task.dueDate || ''} onChange={e => updateTask({ dueDate: e.target.value })} className="px-3 py-1.5 rounded-lg text-sm bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 dark:text-white" />
                                  </div>
                                  {/* Frequency */}
                                  <div className="flex items-center gap-3 px-4 py-2.5">
                                    <span className="text-xs font-medium text-gray-500 w-24 flex-shrink-0">{tx('Frequenz', 'Frequency')}</span>
                                    <div className="flex-1 relative">
                                      <button onClick={() => setV2ShowFreqDD(!v2ShowFreqDD)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <span className={frequencyConfig[task.frequency].color}>{lang === 'de' ? frequencyConfig[task.frequency].de : frequencyConfig[task.frequency].en}</span>
                                        <ChevronDown className="w-3 h-3 text-gray-400" />
                                      </button>
                                      {v2ShowFreqDD && (<>
                                        <div className="fixed inset-0 z-30" onClick={() => setV2ShowFreqDD(false)} />
                                        <div className="absolute left-0 top-full mt-1 z-40 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden py-1">
                                          {(Object.keys(frequencyConfig) as TaskFrequency[]).map(f => (
                                            <button key={f} onClick={() => { updateTask({ frequency: f }); setV2ShowFreqDD(false); }} className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${task.frequency === f ? 'bg-sky-50 dark:bg-sky-500/10 text-sky-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                                              <span className={frequencyConfig[f].color}>{lang === 'de' ? frequencyConfig[f].de : frequencyConfig[f].en}</span>
                                              {task.frequency === f && <Check className="w-3.5 h-3.5" />}
                                            </button>
                                          ))}
                                        </div>
                                      </>)}
                                    </div>
                                  </div>
                                  {/* Section */}
                                  <div className="flex items-center gap-3 px-4 py-2.5">
                                    <span className="text-xs font-medium text-gray-500 w-24 flex-shrink-0">{tx('Sektion', 'Section')}</span>
                                    <div className="flex-1 relative">
                                      <button onClick={() => setV2ShowSecDD(!v2ShowSecDD)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: secColors.text.includes('red') ? '#ef4444' : secColors.text.includes('pink') ? '#ec4899' : secColors.text.includes('blue') ? '#3b82f6' : secColors.text.includes('emerald') ? '#10b981' : '#f59e0b' }} />
                                        <span className="text-gray-900 dark:text-white">{sec?.name}</span>
                                        <ChevronDown className="w-3 h-3 text-gray-400" />
                                      </button>
                                      {v2ShowSecDD && (<>
                                        <div className="fixed inset-0 z-30" onClick={() => setV2ShowSecDD(false)} />
                                        <div className="absolute left-0 top-full mt-1 z-40 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden py-1">
                                          {activePlan.sections.map(s => {
                                            const sc = sectionColorMap[s.color] || sectionColorMap.amber;
                                            return (
                                              <button key={s.id} onClick={() => {
                                                const newSecId = s.id;
                                                setPlans(prev => prev.map(p => p.id === activePlanId ? { ...p, updatedAt: new Date().toISOString(), sections: p.sections.map(ps => {
                                                  if (ps.id === dt.sectionId) return { ...ps, tasks: ps.tasks.filter(t => t.id !== dt.task.id) };
                                                  if (ps.id === newSecId) return { ...ps, tasks: [...ps.tasks, task] };
                                                  return ps;
                                                }) } : p));
                                                setV2DetailTask({ sectionId: newSecId, task });
                                                setV2ShowSecDD(false);
                                              }} className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${dt.sectionId === s.id ? 'bg-sky-50 dark:bg-sky-500/10 text-sky-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ background: sc.text.includes('red') ? '#ef4444' : sc.text.includes('pink') ? '#ec4899' : sc.text.includes('blue') ? '#3b82f6' : sc.text.includes('emerald') ? '#10b981' : '#f59e0b' }} />
                                                <span className="flex-1 text-left">{s.name}</span>
                                                {dt.sectionId === s.id && <Check className="w-3.5 h-3.5" />}
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </>)}
                                    </div>
                                  </div>
                                  {/* MMA */}
                                  <div className="flex items-center gap-3 px-4 py-2.5">
                                    <span className="text-xs font-medium text-gray-500 w-24 flex-shrink-0">MMA</span>
                                    <button onClick={() => updateTask({ isMMA: !task.isMMA })} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${task.isMMA ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                                      <DollarSign className="w-3.5 h-3.5" />{task.isMMA ? tx('Aktiv', 'Active') : tx('Nicht aktiv', 'Inactive')}
                                    </button>
                                  </div>
                                  {/* Assignee */}
                                  {activePlan.teamMembers && activePlan.teamMembers.length > 0 && (
                                    <div className="flex items-center gap-3 px-4 py-2.5">
                                      <span className="text-xs font-medium text-gray-500 w-24 flex-shrink-0">{tx('Zugewiesen', 'Assignee')}</span>
                                      <div className="flex gap-1.5 flex-1 flex-wrap">
                                        <button onClick={() => updateTask({ assignee: undefined })} className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${!task.assignee ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>—</button>
                                        {activePlan.teamMembers.map(m => {
                                          const isActive = task.assignee === m.id;
                                          const cols: Record<string, string> = { indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 border-indigo-300 dark:border-indigo-500/40', emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/40', sky: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400 border-sky-300 dark:border-sky-500/40', amber: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-300 dark:border-amber-500/40', rose: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-rose-300 dark:border-rose-500/40', purple: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border-purple-300 dark:border-purple-500/40' };
                                          return <button key={m.id} onClick={() => updateTask({ assignee: m.id })} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${isActive ? cols[m.color] || cols.indigo : 'border-transparent text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}><span className="w-4 h-4 rounded-full bg-current/10 flex items-center justify-center text-[8px] font-bold">{m.initials}</span>{m.name}</button>;
                                        })}
                                      </div>
                                    </div>
                                  )}
                                  {/* Day of week (when weekly) */}
                                  {task.frequency === 'weekly' && (
                                    <div className="flex items-center gap-3 px-4 py-2.5">
                                      <span className="text-xs font-medium text-gray-500 w-24 flex-shrink-0">{tx('Wochentag', 'Day')}</span>
                                      <div className="flex gap-1 flex-1">{dayOfWeekLabels[lang === 'de' ? 'de' : 'en'].map((d, i) => <button key={i} onClick={() => updateTask({ dayOfWeek: i })} className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${(task.dayOfWeek ?? 0) === i ? 'bg-sky-500 text-white' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>{d}</button>)}</div>
                                    </div>
                                  )}
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{tx('Beschreibung', 'Description')}</label>
                                  <textarea value={task.description} onChange={e => updateTask({ description: e.target.value })} placeholder={tx('Füge eine Beschreibung hinzu oder formuliere mit Details, Kontext, Schritte...', 'Add a description with details, context, steps...')} className="w-full h-32 px-4 py-3 rounded-xl text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 resize-y focus:outline-none focus:ring-2 focus:ring-sky-500/30" />
                                </div>

                                {/* Dependencies */}
                                <div className="space-y-2">
                                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><Link2 className="w-3.5 h-3.5" />{tx('Abhängigkeiten', 'Dependencies')}</label>
                                  {(task.dependsOn || []).length > 0 && (
                                    <div className="space-y-1">
                                      {(task.dependsOn || []).map(depId => {
                                        let depTask: PlanTask | undefined; let depSecName = '';
                                        activePlan.sections.forEach(s => { const found = s.tasks.find(t => t.id === depId); if (found) { depTask = found; depSecName = s.name; } });
                                        if (!depTask) return null;
                                        return (
                                          <div key={depId} className="flex items-center gap-2 px-3 py-2 bg-orange-50 dark:bg-orange-500/10 rounded-lg border border-orange-200 dark:border-orange-500/20">
                                            <Link2 className="w-3 h-3 text-orange-500 flex-shrink-0" />
                                            <span className={`text-sm flex-1 truncate ${depTask.done ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>{depTask.title || tx('Aufgabe...', 'Task...')}</span>
                                            <span className="text-[9px] text-orange-500 bg-orange-100 dark:bg-orange-500/20 px-1.5 py-0.5 rounded">{depSecName}</span>
                                            {depTask.done && <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />}
                                            <button onClick={() => updateTask({ dependsOn: (task.dependsOn || []).filter(id => id !== depId) })} className="p-0.5 hover:bg-orange-100 dark:hover:bg-orange-500/20 rounded"><X className="w-3 h-3 text-orange-400" /></button>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                  <div className="relative">
                                    <button onClick={() => setV2ShowDepDD(!v2ShowDepDD)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"><Plus className="w-3 h-3" />{tx('Abhängigkeit hinzufügen', 'Add dependency')}</button>
                                    {v2ShowDepDD && (<>
                                      <div className="fixed inset-0 z-30" onClick={() => setV2ShowDepDD(false)} />
                                      <div className="absolute left-0 top-full mt-1 z-40 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden max-h-[250px] overflow-y-auto">
                                        {activePlan.sections.map(depSec => {
                                          const availTasks = depSec.tasks.filter(t => t.id !== task.id && !(task.dependsOn || []).includes(t.id));
                                          if (availTasks.length === 0) return null;
                                          const sc = sectionColorMap[depSec.color] || sectionColorMap.amber;
                                          return (
                                            <div key={depSec.id}>
                                              <div className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest ${sc.text} ${sc.bg}`}>{depSec.name}</div>
                                              {availTasks.map(t => (
                                                <button key={t.id} onClick={() => { updateTask({ dependsOn: [...(task.dependsOn || []), t.id] }); setV2ShowDepDD(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: t.priority ? priorityConfig[t.priority].dot : '#9ca3af' }} />
                                                  <span className="truncate">{t.title || tx('Aufgabe...', 'Task...')}</span>
                                                  {t.done && <Check className="w-3 h-3 text-emerald-500 flex-shrink-0 ml-auto" />}
                                                </button>
                                              ))}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </>)}
                                  </div>
                                </div>
                                {/* Dashboard Link */}
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{tx('Verknüpfung', 'Link')}</label>
                                  {task.linkedItemTitle ? (
                                    <div className="flex items-center gap-2 px-3 py-2 bg-sky-50 dark:bg-sky-500/10 rounded-xl border border-sky-200 dark:border-sky-500/30">
                                      <ExternalLink className="w-3.5 h-3.5 text-sky-500" />
                                      <span className="text-sm text-sky-700 dark:text-sky-300 flex-1 truncate">{task.linkedDashboard}: {task.linkedItemTitle}</span>
                                      <button onClick={() => updateTask({ linkedDashboard: undefined, linkedItemId: undefined, linkedItemTitle: undefined })} className="p-0.5 hover:bg-sky-100 dark:hover:bg-sky-500/20 rounded"><X className="w-3 h-3 text-sky-500" /></button>
                                    </div>
                                  ) : (
                                    <div className="relative">
                                      <button onClick={() => setV2ShowLinkPicker(!v2ShowLinkPicker)} className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-500 hover:border-sky-300 transition-colors">
                                        <ExternalLink className="w-3.5 h-3.5" />{tx('Dashboard-Element verknüpfen...', 'Link dashboard item...')}
                                      </button>
                                      {v2ShowLinkPicker && (
                                        <>
                                          <div className="fixed inset-0 z-30" onClick={() => { setV2ShowLinkPicker(false); setV2LinkDashboard(''); }} />
                                          <div className="absolute left-0 bottom-full mb-1 z-40 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
                                            {!v2LinkDashboard ? (
                                              <div className="py-1">
                                                {dashboardLinkOptions.map(opt => (
                                                  <button key={opt.key} onClick={() => {
                                                    setV2LinkDashboard(opt.key);
                                                    try { const raw = localStorage.getItem(opt.storageKey); const items = raw ? JSON.parse(raw) : []; setV2LinkItems(items.map((i: Record<string, string>) => ({ id: i.id, title: i[opt.titleField] || 'Untitled' })).slice(0, 20)); } catch { setV2LinkItems([]); }
                                                  }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                    {lang === 'de' ? opt.de : opt.en}
                                                  </button>
                                                ))}
                                              </div>
                                            ) : (
                                              <div>
                                                <button onClick={() => setV2LinkDashboard('')} className="w-full flex items-center gap-2 px-4 py-2 text-xs text-gray-400 hover:text-gray-600 border-b border-gray-100 dark:border-gray-800"><ArrowLeft className="w-3 h-3" />{tx('Zurück', 'Back')}</button>
                                                <div className="max-h-[200px] overflow-y-auto py-1">
                                                  {v2LinkItems.length === 0 && <p className="px-4 py-3 text-xs text-gray-400">{tx('Keine Einträge', 'No items')}</p>}
                                                  {v2LinkItems.map(item => (
                                                    <button key={item.id} onClick={() => { updateTask({ linkedDashboard: v2LinkDashboard, linkedItemId: item.id, linkedItemTitle: item.title }); setV2ShowLinkPicker(false); setV2LinkDashboard(''); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors truncate">{item.title}</button>
                                                  ))}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  )}
                                </div>
                                {/* Subtasks — recursive tree */}
                                {(() => {
                                  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

                                  const countDone = (items: PlanSubtask[]): [number, number] => {
                                    let d = 0, t = 0;
                                    for (const s of items) {
                                      t++; if (s.done) d++;
                                      if (s.subtasks) { const [cd, ct] = countDone(s.subtasks); d += cd; t += ct; }
                                    }
                                    return [d, t];
                                  };

                                  const updateInTree = (items: PlanSubtask[], targetId: string, fn: (s: PlanSubtask) => PlanSubtask | null): PlanSubtask[] =>
                                    items.reduce<PlanSubtask[]>((acc, s) => {
                                      if (s.id === targetId) { const r = fn(s); return r ? [...acc, r] : acc; }
                                      return [...acc, { ...s, subtasks: s.subtasks ? updateInTree(s.subtasks, targetId, fn) : undefined }];
                                    }, []);

                                  const addChild = (items: PlanSubtask[], parentId: string | null, child: PlanSubtask): PlanSubtask[] => {
                                    if (!parentId) return [...items, child];
                                    return items.map(s => s.id === parentId ? { ...s, subtasks: [...(s.subtasks || []), child] } : { ...s, subtasks: s.subtasks ? addChild(s.subtasks, parentId, child) : undefined });
                                  };

                                  const subs = task.subtasks || [];
                                  const [doneCount, totalCount] = countDone(subs);

                                  const renderTree = (items: PlanSubtask[], depth: number) => (
                                    <div className={depth > 0 ? 'ml-5 border-l-2 border-gray-100 dark:border-gray-800 pl-3' : ''}>
                                      {items.map(st => (
                                        <div key={st.id}>
                                          <div className="flex items-center gap-2 group py-1">
                                            <button onClick={() => updateTask({ subtasks: updateInTree(subs, st.id, s => ({ ...s, done: !s.done })) })} className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${st.done ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 dark:border-gray-600 hover:border-sky-400'}`}>{st.done && <Check className="w-3 h-3 text-white" />}</button>
                                            <span className={`text-sm flex-1 ${st.done ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>{st.title}</span>
                                            {(st.subtasks || []).length > 0 && <span className="text-[10px] text-gray-400">{(st.subtasks || []).filter(c => c.done).length}/{(st.subtasks || []).length}</span>}
                                            {depth < 2 && (
                                              <button onClick={() => {
                                                const title = window.prompt(tx('Unter-Aufgabe:', 'Sub-task:'));
                                                if (title?.trim()) updateTask({ subtasks: addChild(subs, st.id, { id: uid(), title: title.trim(), done: false }) });
                                              }} className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-all" title={tx('Unteraufgabe hinzufügen', 'Add subtask')}><Plus className="w-3 h-3 text-sky-400" /></button>
                                            )}
                                            <button onClick={() => updateTask({ subtasks: updateInTree(subs, st.id, () => null) })} className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"><X className="w-3 h-3 text-red-400" /></button>
                                          </div>
                                          {(st.subtasks || []).length > 0 && renderTree(st.subtasks!, depth + 1)}
                                        </div>
                                      ))}
                                    </div>
                                  );

                                  return (
                                    <div className="space-y-2">
                                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">{tx('Unteraufgaben', 'Subtasks')} {totalCount > 0 && <span className="text-[10px] font-medium text-gray-400">({doneCount}/{totalCount})</span>}</label>
                                      {subs.length > 0 && renderTree(subs, 0)}
                                      <form onSubmit={e => { e.preventDefault(); const input = (e.target as HTMLFormElement).elements.namedItem('subtask-input') as HTMLInputElement; const val = input.value.trim(); if (!val) return; updateTask({ subtasks: [...subs, { id: uid(), title: val, done: false }] }); input.value = ''; }} className="flex items-center gap-2">
                                        <input name="subtask-input" placeholder={tx('Unteraufgabe hinzufügen...', 'Add subtask...')} className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/30" />
                                        <button type="submit" className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-sky-100 dark:hover:bg-sky-500/10 text-gray-500 hover:text-sky-500 transition-colors"><Plus className="w-3.5 h-3.5" /></button>
                                      </form>
                                    </div>
                                  );
                                })()}

                                {/* Linked Files */}
                                <div className="space-y-2">
                                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{tx('Dateien', 'Files')}</label>
                                  {(task.linkedFiles || []).length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                      {(task.linkedFiles || []).map(fid => {
                                        const file = fileLinks.find(f => f.id === fid);
                                        if (!file) return null;
                                        const cat = categoryConfig[file.category];
                                        const CatIcon = cat.icon;
                                        return (
                                          <span key={fid} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cat.bg} ${cat.text}`}>
                                            <CatIcon className="w-3 h-3" />{translateFilePrefix(file.name, lang)}
                                            <button onClick={() => updateTask({ linkedFiles: (task.linkedFiles || []).filter(id => id !== fid) })} className="hover:opacity-70"><X className="w-3 h-3" /></button>
                                          </span>
                                        );
                                      })}
                                    </div>
                                  )}
                                  <div className="relative">
                                    <button onClick={() => setV2ShowFilePicker(p => !p)} className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-500 hover:border-sky-300 transition-colors">
                                      <FolderOpen className="w-3.5 h-3.5" />{tx('Datei verknüpfen...', 'Link file...')}
                                    </button>
                                    {v2ShowFilePicker && (
                                      <>
                                        <div className="fixed inset-0 z-30" onClick={() => setV2ShowFilePicker(false)} />
                                        <div className="absolute left-0 bottom-full mb-1 z-40 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
                                          <div className="max-h-[200px] overflow-y-auto py-1">
                                            {fileLinks.length === 0 && <p className="px-4 py-3 text-xs text-gray-400">{tx('Keine Dateien', 'No files')}</p>}
                                            {fileLinks.map(f => {
                                              const linked = (task.linkedFiles || []).includes(f.id);
                                              const fCat = categoryConfig[f.category];
                                              const FIcon = fCat.icon;
                                              return (
                                                <button key={f.id} disabled={linked} onClick={() => { updateTask({ linkedFiles: [...(task.linkedFiles || []), f.id] }); setV2ShowFilePicker(false); }} className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors ${linked ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                                                  <span className={`p-1 rounded ${fCat.bg}`}><FIcon className={`w-3 h-3 ${fCat.text.split(' ')[0]}`} /></span>
                                                  <span className="truncate flex-1 text-left">{translateFilePrefix(f.name, lang)}</span>
                                                  {linked && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>

                                {/* Linked Content Ideas */}
                                <div className="space-y-2">
                                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{tx('Content-Ideen', 'Content Ideas')}</label>
                                  {(task.linkedContentIds || []).length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                      {(task.linkedContentIds || []).map(cid => {
                                        const ci = contentItems.find(c => c.id === cid);
                                        if (!ci) return null;
                                        const plat = platformConfig[ci.platform];
                                        const PIcon = plat.icon;
                                        return (
                                          <span key={cid} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${plat.bg} ${plat.text.split(' ')[0]}`}>
                                            <PIcon className="w-3 h-3" />{ci.title}
                                            <button onClick={() => updateTask({ linkedContentIds: (task.linkedContentIds || []).filter(id => id !== cid) })} className="hover:opacity-70"><X className="w-3 h-3" /></button>
                                          </span>
                                        );
                                      })}
                                    </div>
                                  )}
                                  <div className="relative">
                                    <button onClick={() => setV2ShowContentPicker(p => !p)} className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-500 hover:border-sky-300 transition-colors">
                                      <Lightbulb className="w-3.5 h-3.5" />{tx('Content verknüpfen...', 'Link content...')}
                                    </button>
                                    {v2ShowContentPicker && (
                                      <>
                                        <div className="fixed inset-0 z-30" onClick={() => setV2ShowContentPicker(false)} />
                                        <div className="absolute left-0 bottom-full mb-1 z-40 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
                                          <div className="max-h-[200px] overflow-y-auto py-1">
                                            {contentItems.length === 0 && <p className="px-4 py-3 text-xs text-gray-400">{tx('Keine Content-Ideen', 'No content ideas')}</p>}
                                            {contentItems.map(ci => {
                                              const linked = (task.linkedContentIds || []).includes(ci.id);
                                              const plat = platformConfig[ci.platform];
                                              const PIcon = plat.icon;
                                              return (
                                                <button key={ci.id} disabled={linked} onClick={() => { updateTask({ linkedContentIds: [...(task.linkedContentIds || []), ci.id] }); setV2ShowContentPicker(false); }} className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors ${linked ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                                                  <span className={`p-1 rounded ${plat.bg}`}><PIcon className={`w-3 h-3 ${plat.text.split(' ')[0]}`} /></span>
                                                  <span className="truncate flex-1 text-left">{ci.title}</span>
                                                  {linked && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>

                                {/* Quick link button (existing dashboard link) */}
                                {!task.linkedItemTitle && (
                                  <button onClick={() => setV2ShowLinkPicker(true)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg border border-dashed border-gray-200 dark:border-gray-700 transition-colors"><ExternalLink className="w-3.5 h-3.5" />{tx('Dashboard verknüpfen', 'Link dashboard')}</button>
                                )}
                                {/* Metadata */}
                                <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                                  <p className="text-[10px] text-gray-400">{tx('Erstellt', 'Created')}: {new Date(activePlan.createdAt).toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US')}</p>
                                  <p className="text-[10px] text-gray-400">{tx('Bearbeitet', 'Updated')}: {new Date(activePlan.updatedAt).toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US')}</p>
                                </div>
                                {/* Delete / Close */}
                                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                                  <button onClick={() => { setPlans(prev => prev.map(p => p.id === activePlanId ? { ...p, updatedAt: new Date().toISOString(), sections: p.sections.map(s => s.id === dt.sectionId ? { ...s, tasks: s.tasks.filter(t => t.id !== dt.task.id) } : s) } : p)); setV2DetailTask(null); addToast(tx('Aufgabe gelöscht', 'Task deleted')); }} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" />{tx('Löschen', 'Delete')}</button>
                                  <button onClick={() => setV2DetailTask(null)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">{tx('Schließen', 'Close')}</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                </>
              )}

              {/* ═══ MINDMAP MODE ═══ */}
              {activePlan && v2Mode === 'mindmap' && (() => {
                const sections = activePlan.sections;
                if (sections.length === 0) return <p className="text-center text-gray-400 py-12">{tx('Füge Sektionen hinzu um die Mindmap zu sehen', 'Add sections to see the mindmap')}</p>;
                const dotColor = (c: string) => ({ red: '#ef4444', pink: '#ec4899', blue: '#3b82f6', sky: '#0ea5e9', emerald: '#10b981', amber: '#f59e0b', purple: '#a855f7', gray: '#6b7280', orange: '#f97316', rose: '#f43f5e', indigo: '#6366f1', violet: '#8b5cf6' }[c] || '#f59e0b');

                // Sort sections by user-defined phase (from reorder buttons), fallback to category order
                const catFallback = (name: string) => {
                  if (['Homepage', 'Funnel'].some(k => name.includes(k))) return 0;
                  if (['YouTube', 'Instagram', 'LinkedIn', 'TikTok', 'Podcast', 'Content'].some(k => name.includes(k))) return 1;
                  if (['Cold Calls', 'Cold Emails', 'Direct Mail', 'DMC', 'PVC'].some(k => name.includes(k))) return 2;
                  if (['Ads', 'Werbeanzeigen'].some(k => name.includes(k))) return 3;
                  if (['Allgemein', 'General'].some(k => name.includes(k))) return 99;
                  return 3;
                };
                const sortedSections = [...sections].sort((a, b) => (a.phase || catFallback(a.name)) - (b.phase || catFallback(b.name)));

                // Build dependency pairs
                const depPairs: { fromId: string; toId: string }[] = [];
                sections.forEach(sec => sec.tasks.forEach(task => {
                  (task.dependsOn || []).forEach(depId => { depPairs.push({ fromId: depId, toId: task.id }); });
                }));
                const depMarker = <marker id="dep-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" /></marker>;

                // Toggle section expansion
                const toggleSection = (secId: string) => {
                  setMindmapExpandedSections(prev => {
                    const next = new Set(prev);
                    if (next.has(secId)) next.delete(secId); else next.add(secId);
                    return next;
                  });
                };
                const allExpanded = sortedSections.every(s => mindmapExpandedSections.has(s.id));
                const toggleAll = () => {
                  if (allExpanded) setMindmapExpandedSections(new Set());
                  else setMindmapExpandedSections(new Set(sortedSections.map(s => s.id)));
                };

                return (
                  <div className="space-y-4">
                    {/* Controls */}
                    <div className="flex items-center gap-2">
                      {([
                        { key: 'tree' as const, de: 'Baum', en: 'Tree' },
                        { key: 'radial' as const, de: 'Radial', en: 'Radial' },
                        { key: 'horizontal' as const, de: 'Horizontal', en: 'Horizontal' },
                        { key: 'kanban' as const, de: 'Spalten', en: 'Columns' },
                      ]).map(style => (
                        <button key={style.key} onClick={() => setV2MindmapStyle(style.key)} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${v2MindmapStyle === style.key ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30' : 'text-gray-500 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>{lang === 'de' ? style.de : style.en}</button>
                      ))}
                      <div className="flex-1" />
                      <button onClick={toggleAll} className="px-3 py-1.5 rounded-xl text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        {allExpanded ? tx('Alle einklappen', 'Collapse All') : tx('Alle ausklappen', 'Expand All')}
                      </button>
                    </div>

                    {/* ── TREE VIEW ── */}
                    {v2MindmapStyle === 'tree' && (() => {
                      const svgW = 1100; const centerX = svgW / 2; const rootY = 60; const secY = 180;
                      const secSpacing = svgW / (sortedSections.length + 1);
                      let maxTasksBelow = 0;
                      sortedSections.forEach(sec => { if (mindmapExpandedSections.has(sec.id)) maxTasksBelow = Math.max(maxTasksBelow, sec.tasks.length); });
                      const taskStartY = secY + 50;
                      const svgH = Math.max(280, taskStartY + maxTasksBelow * 28 + 40);
                      return (
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 overflow-x-auto">
                          <svg width={svgW} height={svgH} className="w-full" viewBox={`0 0 ${svgW} ${svgH}`}>
                            <line x1={centerX} y1={rootY + 20} x2={centerX} y2={rootY + 45} stroke={darkMode ? '#374151' : '#e5e7eb'} strokeWidth="2" />
                            {sortedSections.length > 1 && <line x1={secSpacing} y1={secY - 35} x2={svgW - secSpacing} y2={secY - 35} stroke={darkMode ? '#374151' : '#e5e7eb'} strokeWidth="2" />}
                            {sortedSections.length > 1 && <line x1={centerX} y1={rootY + 45} x2={centerX} y2={secY - 35} stroke={darkMode ? '#374151' : '#e5e7eb'} strokeWidth="2" />}
                            {sortedSections.map((sec, si) => {
                              const sx = secSpacing * (si + 1); const nc = dotColor(sec.color);
                              const isExp = mindmapExpandedSections.has(sec.id);
                              const tl = sec.tasks.sort((a, b) => a.order - b.order);
                              const doneCount = tl.filter(t => t.done).length;
                              return (
                                <g key={sec.id}>
                                  <line x1={sx} y1={secY - 35} x2={sx} y2={secY - 16} stroke={darkMode ? '#374151' : '#e5e7eb'} strokeWidth="2" />
                                  {sortedSections.length === 1 && <line x1={centerX} y1={rootY + 45} x2={sx} y2={secY - 16} stroke={darkMode ? '#374151' : '#e5e7eb'} strokeWidth="2" />}
                                  {/* Section node — clickable with phase number */}
                                  <g className="cursor-pointer" onClick={() => toggleSection(sec.id)}>
                                    {/* Phase number badge */}
                                    <circle cx={sx - 68} cy={secY + 2} r="10" fill="#6366f1" fillOpacity="0.2" stroke="#6366f1" strokeWidth="1" />
                                    <text x={sx - 68} y={secY + 6} textAnchor="middle" fill="#6366f1" fontSize="9" fontWeight="800" fontFamily="system-ui">{sec.phase || (si + 1)}</text>
                                    <rect x={sx - 55} y={secY - 16} width="123" height="36" rx="18" fill={nc} fillOpacity="0.15" stroke={nc} strokeWidth="1.5" />
                                    <text x={sx - 38} y={secY + 4} fill={nc} fontSize="11" fontFamily="system-ui">{isExp ? '▾' : '▸'}</text>
                                    <text x={sx + 2} y={secY + 4} textAnchor="middle" fill={nc} fontSize="11" fontWeight="700" fontFamily="system-ui">{sec.name.length > 12 ? sec.name.slice(0, 10) + '..' : sec.name}</text>
                                    <rect x={sx + 38} y={secY - 10} width="26" height="16" rx="8" fill={nc} fillOpacity="0.25" />
                                    <text x={sx + 51} y={secY + 3} textAnchor="middle" fill={nc} fontSize="8" fontWeight="700" fontFamily="system-ui">{doneCount}/{tl.length}</text>
                                  </g>
                                  {/* Tasks — only when expanded */}
                                  {isExp && tl.length > 0 && (
                                    <g>
                                      <line x1={sx} y1={secY + 20} x2={sx} y2={taskStartY - 8} stroke={darkMode ? '#374151' : '#e5e7eb'} strokeWidth="1.5" />
                                      {tl.map((task, ti) => {
                                        const ty = taskStartY + ti * 28; const isOnce = task.frequency === 'once'; const pc = task.priority ? priorityConfig[task.priority].dot : '#9ca3af';
                                        return (
                                          <g key={task.id} className="cursor-pointer" onClick={() => { setV2Mode('plan'); setV2DetailTask({ sectionId: sec.id, task }); }}>
                                            <line x1={sx} y1={ty - 8} x2={sx} y2={ty + 6} stroke={darkMode ? '#374151' : '#e5e7eb'} strokeWidth="1" />
                                            {isOnce ? <rect x={sx - 5} y={ty} width="10" height="10" rx="2" fill={task.done ? '#10b981' : 'transparent'} stroke={task.done ? '#10b981' : pc} strokeWidth="1.5" /> : <circle cx={sx} cy={ty + 5} r="5" fill={nc} fillOpacity="0.3" stroke={nc} strokeWidth="1.5" />}
                                            {isOnce && task.done && <polyline points={`${sx - 2.5},${ty + 5} ${sx},${ty + 8} ${sx + 3},${ty + 2}`} fill="none" stroke="white" strokeWidth="1.5" />}
                                            {task.isMMA && <circle cx={sx + (task.title || '...').length * 5.5 + 20} cy={ty + 5} r="3" fill="#f59e0b" />}
                                            <text x={sx + 14} y={ty + 8} fill={darkMode ? (task.done ? '#6b7280' : '#d1d5db') : (task.done ? '#9ca3af' : '#374151')} fontSize="11" fontFamily="system-ui" textDecoration={task.done ? 'line-through' : 'none'}>{(task.title || '...').length > 18 ? (task.title || '...').slice(0, 16) + '..' : (task.title || '...')}</text>
                                          </g>
                                        );
                                      })}
                                    </g>
                                  )}
                                </g>
                              );
                            })}
                            {/* Root node */}
                            <circle cx={centerX} cy={rootY} r="22" fill={darkMode ? '#1f2937' : '#f8fafc'} stroke="#6366f1" strokeWidth="2.5" />
                            <text x={centerX} y={rootY + 4} textAnchor="middle" fill={darkMode ? '#e5e7eb' : '#1f2937'} fontSize="10" fontWeight="800" fontFamily="system-ui">{activePlan.name.length > 10 ? activePlan.name.slice(0, 8) + '..' : activePlan.name}</text>
                            {/* Dependency arrows — only between visible (expanded) tasks */}
                            <defs>{depMarker}</defs>
                            {depPairs.map(({ fromId, toId }) => {
                              let fx = 0, fy = 0, tx2 = 0, ty2 = 0, found = 0;
                              sortedSections.forEach((s, si) => { if (!mindmapExpandedSections.has(s.id)) return; const sxp = secSpacing * (si + 1); s.tasks.sort((a, b) => a.order - b.order).forEach((t, ti) => { const typ = taskStartY + ti * 28 + 5; if (t.id === fromId) { fx = sxp + 14; fy = typ; found++; } if (t.id === toId) { tx2 = sxp - 8; ty2 = typ; found++; } }); });
                              if (found < 2) return null;
                              return <line key={`dep-${fromId}-${toId}`} x1={fx} y1={fy} x2={tx2} y2={ty2} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="6 3" markerEnd="url(#dep-arrow)" opacity="0.7" />;
                            })}
                          </svg>
                        </div>
                      );
                    })()}

                    {/* ── RADIAL VIEW ── */}
                    {v2MindmapStyle === 'radial' && (() => {
                      const size = 800; const cx = size / 2; const cy = size / 2; const secR = 180; const taskR = 320;
                      return (
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 overflow-x-auto flex justify-center">
                          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="max-w-full">
                            {sortedSections.map((sec, si) => {
                              const angle = (2 * Math.PI * si) / sortedSections.length - Math.PI / 2;
                              const sx = cx + Math.cos(angle) * secR; const sy = cy + Math.sin(angle) * secR;
                              const nc = dotColor(sec.color);
                              const isExp = mindmapExpandedSections.has(sec.id);
                              const tl = sec.tasks.sort((a, b) => a.order - b.order);
                              const doneCount = tl.filter(t => t.done).length;
                              const taskAngleSpread = Math.PI / (Math.max(tl.length, 1) + 1) * 0.8;
                              const baseAngle = angle - (tl.length - 1) * taskAngleSpread / 2;
                              return (
                                <g key={sec.id}>
                                  <line x1={cx} y1={cy} x2={sx} y2={sy} stroke={darkMode ? '#374151' : '#e5e7eb'} strokeWidth="1.5" />
                                  {/* Section node — clickable with phase */}
                                  <g className="cursor-pointer" onClick={() => toggleSection(sec.id)}>
                                    <circle cx={sx} cy={sy} r="32" fill={nc} fillOpacity="0.15" stroke={nc} strokeWidth="1.5" />
                                    {/* Phase badge top-left of section circle */}
                                    <circle cx={sx - 22} cy={sy - 22} r="8" fill="#6366f1" fillOpacity="0.25" stroke="#6366f1" strokeWidth="1" />
                                    <text x={sx - 22} y={sy - 18} textAnchor="middle" fill="#6366f1" fontSize="8" fontWeight="800" fontFamily="system-ui">{sec.phase || (si + 1)}</text>
                                    <text x={sx} y={sy - 2} textAnchor="middle" fill={nc} fontSize="9" fontWeight="700" fontFamily="system-ui">{sec.name.length > 10 ? sec.name.slice(0, 8) + '..' : sec.name}</text>
                                    <text x={sx} y={sy + 11} textAnchor="middle" fill={nc} fontSize="8" fontWeight="600" fontFamily="system-ui" opacity="0.7">{doneCount}/{tl.length} {isExp ? '▾' : '▸'}</text>
                                  </g>
                                  {/* Tasks — only when expanded */}
                                  {isExp && tl.map((task, ti) => {
                                    const ta = baseAngle + ti * taskAngleSpread;
                                    const tx2 = cx + Math.cos(ta) * taskR; const ty2 = cy + Math.sin(ta) * taskR;
                                    const pc = task.priority ? priorityConfig[task.priority].dot : '#9ca3af';
                                    return (
                                      <g key={task.id} className="cursor-pointer" onClick={() => { setV2Mode('plan'); setV2DetailTask({ sectionId: sec.id, task }); }}>
                                        <line x1={sx} y1={sy} x2={tx2} y2={ty2} stroke={darkMode ? '#374151' : '#e5e7eb'} strokeWidth="1" strokeDasharray="4 2" />
                                        <circle cx={tx2} cy={ty2} r="6" fill={task.done ? '#10b981' : pc} fillOpacity={task.done ? 1 : 0.3} stroke={task.done ? '#10b981' : pc} strokeWidth="1.5" />
                                        <text x={tx2 + 10} y={ty2 + 4} fill={darkMode ? '#d1d5db' : '#374151'} fontSize="10" fontFamily="system-ui" textDecoration={task.done ? 'line-through' : 'none'}>{(task.title || '...').slice(0, 16)}</text>
                                      </g>
                                    );
                                  })}
                                </g>
                              );
                            })}
                            {/* Root node */}
                            <circle cx={cx} cy={cy} r="30" fill={darkMode ? '#1f2937' : '#f8fafc'} stroke="#6366f1" strokeWidth="2.5" />
                            <text x={cx} y={cy + 4} textAnchor="middle" fill={darkMode ? '#e5e7eb' : '#1f2937'} fontSize="10" fontWeight="800" fontFamily="system-ui">{activePlan.name.length > 10 ? activePlan.name.slice(0, 8) + '..' : activePlan.name}</text>
                            {/* Dependency arrows — only between visible tasks */}
                            <defs>{depMarker}</defs>
                            {depPairs.map(({ fromId, toId }) => {
                              let fx = 0, fy = 0, txx = 0, tyy = 0, found = 0;
                              sortedSections.forEach((s, si) => { if (!mindmapExpandedSections.has(s.id)) return; const a = (2 * Math.PI * si) / sortedSections.length - Math.PI / 2; const tl = s.tasks.sort((aa, bb) => aa.order - bb.order); const tas = Math.PI / (Math.max(tl.length, 1) + 1) * 0.8; const ba = a - (tl.length - 1) * tas / 2; tl.forEach((t, ti) => { const ta = ba + ti * tas; const px = cx + Math.cos(ta) * taskR; const py = cy + Math.sin(ta) * taskR; if (t.id === fromId) { fx = px; fy = py; found++; } if (t.id === toId) { txx = px; tyy = py; found++; } }); });
                              if (found < 2) return null;
                              return <line key={`dep-${fromId}-${toId}`} x1={fx} y1={fy} x2={txx} y2={tyy} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="6 3" markerEnd="url(#dep-arrow)" opacity="0.7" />;
                            })}
                          </svg>
                        </div>
                      );
                    })()}

                    {/* ── HORIZONTAL VIEW ── */}
                    {v2MindmapStyle === 'horizontal' && (() => {
                      const colW = 200; const svgW = 120 + sortedSections.length * (colW + 40);
                      let maxTasks = 0;
                      sortedSections.forEach(sec => { if (mindmapExpandedSections.has(sec.id)) maxTasks = Math.max(maxTasks, sec.tasks.length); });
                      const svgH = Math.max(200, 110 + maxTasks * 32 + 40);
                      return (
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 overflow-x-auto">
                          <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
                            {sortedSections.map((sec, si) => {
                              const sx = 80 + si * (colW + 40); const nc = dotColor(sec.color);
                              const isExp = mindmapExpandedSections.has(sec.id);
                              const tl = sec.tasks.sort((a, b) => a.order - b.order);
                              const doneCount = tl.filter(t => t.done).length;
                              return (
                                <g key={sec.id}>
                                  <line x1={40} y1={40} x2={sx + colW / 2} y2={40} stroke={darkMode ? '#374151' : '#e5e7eb'} strokeWidth="1.5" />
                                  <line x1={sx + colW / 2} y1={40} x2={sx + colW / 2} y2={70} stroke={darkMode ? '#374151' : '#e5e7eb'} strokeWidth="1.5" />
                                  {/* Section header — clickable with phase */}
                                  <g className="cursor-pointer" onClick={() => toggleSection(sec.id)}>
                                    {/* Phase badge */}
                                    <circle cx={sx - 10} cy={86} r="9" fill="#6366f1" fillOpacity="0.2" stroke="#6366f1" strokeWidth="1" />
                                    <text x={sx - 10} y={90} textAnchor="middle" fill="#6366f1" fontSize="8" fontWeight="800" fontFamily="system-ui">{sec.phase || (si + 1)}</text>
                                    <rect x={sx} y={70} width={colW} height="32" rx="16" fill={nc} fillOpacity="0.15" stroke={nc} strokeWidth="1.5" />
                                    <text x={sx + 16} y={90} fill={nc} fontSize="10" fontFamily="system-ui">{isExp ? '▾' : '▸'}</text>
                                    <text x={sx + colW / 2} y={90} textAnchor="middle" fill={nc} fontSize="11" fontWeight="700" fontFamily="system-ui">{sec.name.length > 14 ? sec.name.slice(0, 12) + '..' : sec.name}</text>
                                    <text x={sx + colW - 16} y={90} textAnchor="end" fill={nc} fontSize="9" fontWeight="600" fontFamily="system-ui" opacity="0.6">{doneCount}/{tl.length}</text>
                                  </g>
                                  {/* Tasks — only when expanded */}
                                  {isExp && tl.map((task, ti) => {
                                    const ty = 110 + ti * 32; const pc = task.priority ? priorityConfig[task.priority].dot : '#9ca3af';
                                    return (
                                      <g key={task.id} className="cursor-pointer" onClick={() => { setV2Mode('plan'); setV2DetailTask({ sectionId: sec.id, task }); }}>
                                        <line x1={sx + colW / 2} y1={ty} x2={sx + colW / 2} y2={ty + 12} stroke={darkMode ? '#374151' : '#e5e7eb'} strokeWidth="1" />
                                        <rect x={sx + 10} y={ty + 12} width={colW - 20} height="22" rx="6" fill={task.done ? (darkMode ? '#064e3b' : '#ecfdf5') : (darkMode ? '#111827' : '#f9fafb')} stroke={task.done ? '#10b981' : pc} strokeWidth="1" />
                                        <circle cx={sx + 22} cy={ty + 23} r="3" fill={pc} />
                                        <text x={sx + 30} y={ty + 27} fill={darkMode ? '#d1d5db' : '#374151'} fontSize="10" fontFamily="system-ui" textDecoration={task.done ? 'line-through' : 'none'}>{(task.title || '...').slice(0, 20)}</text>
                                        {task.isMMA && <circle cx={sx + colW - 18} cy={ty + 23} r="3" fill="#f59e0b" />}
                                      </g>
                                    );
                                  })}
                                </g>
                              );
                            })}
                            {/* Root */}
                            <circle cx={40} cy={40} r="18" fill={darkMode ? '#1f2937' : '#f8fafc'} stroke="#6366f1" strokeWidth="2" />
                            <text x={40} y={44} textAnchor="middle" fill={darkMode ? '#e5e7eb' : '#1f2937'} fontSize="8" fontWeight="800" fontFamily="system-ui">{activePlan.name.slice(0, 6)}</text>
                            <defs>{depMarker}</defs>
                            {depPairs.map(({ fromId, toId }) => {
                              let fx = 0, fy = 0, txx = 0, tyy = 0, found = 0;
                              sortedSections.forEach((s, si) => { if (!mindmapExpandedSections.has(s.id)) return; const sxp = 80 + si * (colW + 40); s.tasks.sort((a, b) => a.order - b.order).forEach((t, ti) => { const typ = 110 + ti * 32 + 23; if (t.id === fromId) { fx = sxp + colW - 10; fy = typ; found++; } if (t.id === toId) { txx = sxp + 10; tyy = typ; found++; } }); });
                              if (found < 2) return null;
                              return <line key={`dep-${fromId}-${toId}`} x1={fx} y1={fy} x2={txx} y2={tyy} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="6 3" markerEnd="url(#dep-arrow)" opacity="0.7" />;
                            })}
                          </svg>
                        </div>
                      );
                    })()}

                    {/* ── KANBAN/COLUMNS VIEW ── */}
                    {v2MindmapStyle === 'kanban' && (
                      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(sortedSections.length, 5)}, minmax(200px, 1fr))` }}>
                        {sortedSections.map((sec, si) => {
                          const nc = dotColor(sec.color); const colors = sectionColorMap[sec.color] || sectionColorMap.amber;
                          const isExp = mindmapExpandedSections.has(sec.id);
                          return (
                            <div key={sec.id} className="space-y-2">
                              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${colors.bg} ${colors.border} border cursor-pointer`} onClick={() => toggleSection(sec.id)}>
                                <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[9px] font-bold flex items-center justify-center flex-shrink-0">{sec.phase || (si + 1)}</span>
                                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: nc }} />
                                <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>{sec.name}</span>
                                <span className={`text-xs ${colors.text} opacity-60 ml-auto`}>{sec.tasks.filter(t => t.done).length}/{sec.tasks.length}</span>
                                <span className={`text-xs ${colors.text} opacity-40`}>{isExp ? '▾' : '▸'}</span>
                              </div>
                              {isExp && (
                                <div className="space-y-2 min-h-[40px]">
                                  {sec.tasks.sort((a, b) => a.order - b.order).map(task => {
                                    const pc = task.priority ? priorityConfig[task.priority] : null;
                                    return (
                                      <div key={task.id} onClick={() => { setV2Mode('plan'); setV2DetailTask({ sectionId: sec.id, task }); }} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-2.5 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all" style={pc ? { borderLeftWidth: '3px', borderLeftColor: pc.dot } : {}}>
                                        <span className={`text-xs ${task.done ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>{task.title || '...'}</span>
                                        <div className="flex flex-wrap items-center gap-1 mt-1">
                                          {(task.dependsOn || []).length > 0 && <span className="px-1 py-0.5 bg-orange-100 dark:bg-orange-500/20 text-orange-600 rounded text-[7px] font-bold flex items-center gap-0.5"><Link2 className="w-2 h-2" />{task.dependsOn!.length}</span>}
                                          {task.isMMA && <span className="px-1 py-0.5 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded text-[7px] font-bold">MMA</span>}
                                          {task.frequency !== 'once' && <span className={`text-[7px] font-medium ${frequencyConfig[task.frequency].color}`}>{lang === 'de' ? frequencyConfig[task.frequency].de : frequencyConfig[task.frequency].en}</span>}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* ════════════════════════════════════════════ */}
              {/* ── WEEK VIEW ── */}
              {/* ════════════════════════════════════════════ */}
              {activePlan && v2Mode === 'week' && (() => {
                const today = new Date(); today.setHours(0,0,0,0);
                const dayOfWeek = today.getDay(); // 0=Sun
                const monday = new Date(today); monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
                const weekDays = Array.from({ length: 7 }, (_, i) => { const d = new Date(monday); d.setDate(monday.getDate() + i); return d; });
                const dayLabels = lang === 'de' ? ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'] : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                const allTasks = activePlan.sections.flatMap(s => s.tasks.map(t => ({ ...t, sectionId: s.id, sectionName: s.name })));
                // Group: tasks with dueDate in this week OR recurring tasks matched by dayOfWeek
                const dayTasks = weekDays.map((wd, i) => {
                  const dateStr = wd.toISOString().slice(0, 10);
                  const isToday = dateStr === today.toISOString().slice(0, 10);
                  const tasks = allTasks.filter(t => {
                    if (t.dueDate === dateStr) return true;
                    if (t.frequency === 'daily' && !t.done) return true;
                    if (t.frequency === 'weekly' && (t.dayOfWeek ?? 0) === i && !t.done) return true;
                    return false;
                  });
                  return { date: wd, dateStr, dayLabel: dayLabels[i], isToday, tasks };
                });
                // Unscheduled (no dueDate, once, not done)
                const unscheduled = allTasks.filter(t => !t.dueDate && t.frequency === 'once' && !t.done);

                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">{tx('Wochenansicht', 'Weekly View')} — {monday.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', { day: 'numeric', month: 'short' })} – {weekDays[6].toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', { day: 'numeric', month: 'short' })}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      {dayTasks.slice(0, 5).map(day => (
                        <div key={day.dateStr} className={`rounded-2xl border overflow-hidden ${day.isToday ? 'border-sky-300 dark:border-sky-500/40 bg-sky-50/30 dark:bg-sky-500/5' : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900'}`}>
                          <div className={`px-3 py-2 text-xs font-bold ${day.isToday ? 'text-sky-600 bg-sky-100/50 dark:bg-sky-500/10' : 'text-gray-500 bg-gray-50 dark:bg-gray-800/50'}`}>
                            {day.dayLabel} <span className="font-normal text-gray-400 ml-1">{day.date.getDate()}.</span>
                            {day.isToday && <span className="ml-1.5 px-1.5 py-0.5 bg-sky-500 text-white rounded text-[9px]">{tx('Heute', 'Today')}</span>}
                          </div>
                          <div className="p-2 space-y-1 min-h-[80px]">
                            {day.tasks.length === 0 && <p className="text-[10px] text-gray-300 dark:text-gray-600 text-center py-4">—</p>}
                            {day.tasks.map(task => {
                              const pc = task.priority ? priorityConfig[task.priority] : null;
                              return (
                                <div key={task.id} onClick={() => { setV2Mode('plan'); setV2DetailTask({ sectionId: task.sectionId, task }); setV2ExpandedSections(prev => new Set([...prev, task.sectionId])); }} className={`px-2.5 py-2 rounded-lg cursor-pointer transition-all text-xs hover:shadow-sm ${task.done ? 'bg-gray-50 dark:bg-gray-800/50 opacity-60' : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800'}`} style={pc && !task.done ? { borderLeftWidth: '3px', borderLeftColor: pc.dot } : {}}>
                                  <div className="flex items-center gap-1.5">
                                    <button onClick={e => { e.stopPropagation(); const secId = task.sectionId; setPlans(prev => prev.map(p => p.id === activePlanId ? { ...p, updatedAt: new Date().toISOString(), sections: p.sections.map(s => s.id === secId ? { ...s, tasks: s.tasks.map(t => t.id === task.id ? { ...t, done: !t.done, status: t.done ? 'todo' : 'done' } : t) } : s) } : p)); }} className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${task.done ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 dark:border-gray-600'}`}>{task.done && <Check className="w-2 h-2 text-white" />}</button>
                                    <span className={`flex-1 truncate ${task.done ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200 font-medium'}`}>{task.title}</span>
                                  </div>
                                  <p className="text-[9px] text-gray-400 mt-0.5 truncate">{task.sectionName}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Weekend */}
                    {(dayTasks[5].tasks.length > 0 || dayTasks[6].tasks.length > 0) && (
                      <div className="grid grid-cols-2 gap-3">
                        {dayTasks.slice(5).map(day => (
                          <div key={day.dateStr} className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
                            <div className="px-3 py-2 text-xs font-bold text-gray-400 bg-gray-50 dark:bg-gray-800/50">{day.dayLabel} <span className="font-normal ml-1">{day.date.getDate()}.</span></div>
                            <div className="p-2 space-y-1">
                              {day.tasks.map(task => (
                                <div key={task.id} onClick={() => { setV2Mode('plan'); setV2DetailTask({ sectionId: task.sectionId, task }); }} className="px-2.5 py-2 rounded-lg cursor-pointer bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-xs hover:shadow-sm">
                                  <span className="text-gray-800 dark:text-gray-200 font-medium truncate">{task.title}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Unscheduled */}
                    {unscheduled.length > 0 && (
                      <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
                        <div className="px-4 py-2 text-xs font-bold text-gray-400 bg-gray-50 dark:bg-gray-800/50">{tx('Ohne Datum', 'Unscheduled')} ({unscheduled.length})</div>
                        <div className="p-3 flex flex-wrap gap-2">
                          {unscheduled.slice(0, 12).map(task => (
                            <span key={task.id} onClick={() => { setV2Mode('plan'); setV2DetailTask({ sectionId: task.sectionId, task }); setV2ExpandedSections(prev => new Set([...prev, task.sectionId])); }} className="px-2.5 py-1.5 rounded-lg border border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-400 cursor-pointer hover:border-sky-300 hover:text-sky-600 transition-colors">{task.title || '...'}</span>
                          ))}
                          {unscheduled.length > 12 && <span className="text-xs text-gray-400 self-center">+{unscheduled.length - 12}</span>}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* ════════════════════════════════════════════ */}
              {/* ── TODOS MODE ── */}
              {/* ════════════════════════════════════════════ */}
              {activePlan && v2Mode === 'todos' && (() => {
                // Determine which plans to show tasks from
                const sourcePlans = v2PlanFilter === 'current' ? [activePlan]
                  : v2PlanFilter === 'all' ? plans
                  : plans.filter(p => p.id === v2PlanFilter);

                // Flatten all tasks with plan info
                const allTodos: (PlanTask & { sectionId: string; sectionName: string; sectionColor: string; planId: string; planName: string })[] = [];
                sourcePlans.forEach(plan => {
                  plan.sections.forEach(sec => {
                    sec.tasks.forEach(t => allTodos.push({ ...t, sectionId: sec.id, sectionName: sec.name, sectionColor: sec.color, planId: plan.id, planName: plan.name }));
                  });
                });
                // Collect all sections from source plans for the section filter
                const sourceSections = sourcePlans.flatMap(p => p.sections);

                // Apply filters
                let filtered = allTodos;
                if (v2PrioFilter !== 'all') filtered = filtered.filter(t => (t.priority || 'medium') === v2PrioFilter);
                if (v2MMAFilter) filtered = filtered.filter(t => t.isMMA);
                if (v2SectionFilter !== 'all') filtered = filtered.filter(t => t.sectionId === v2SectionFilter);
                if (v2StatusFilter !== 'all') filtered = filtered.filter(t => (t.status || (t.done ? 'done' : 'todo')) === v2StatusFilter);
                if (planSearch) { const q = planSearch.toLowerCase(); filtered = filtered.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)); }

                const updateTodoTask = (planId: string, sectionId: string, taskId: string, updates: Partial<PlanTask>) => {
                  setPlans(prev => prev.map(p => p.id === planId ? { ...p, updatedAt: new Date().toISOString(), sections: p.sections.map(s => s.id === sectionId ? { ...s, tasks: s.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t) } : s) } : p));
                };
                const showPlanBadge = v2PlanFilter !== 'current';

                return (
                  <div className="space-y-4">
                    {/* Filters */}
                    <div className="flex flex-wrap gap-2 items-center">
                      {/* Plan filter */}
                      <div className="relative">
                        <button onClick={() => setV2ShowPlanFilterDD(!v2ShowPlanFilterDD)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 transition-colors">
                          <span className="text-gray-700 dark:text-gray-300">{v2PlanFilter === 'current' ? tx('Aktueller Plan', 'Current Plan') : v2PlanFilter === 'all' ? tx('Alle Pläne', 'All Plans') : plans.find(p => p.id === v2PlanFilter)?.name || '...'}</span>
                          <ChevronDown className="w-3 h-3 text-gray-400" />
                        </button>
                        {v2ShowPlanFilterDD && (<>
                          <div className="fixed inset-0 z-30" onClick={() => setV2ShowPlanFilterDD(false)} />
                          <div className="absolute left-0 top-full mt-1 z-40 min-w-[200px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden py-1">
                            <button onClick={() => { setV2PlanFilter('current'); setV2SectionFilter('all'); setV2ShowPlanFilterDD(false); }} className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors ${v2PlanFilter === 'current' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>{tx('Aktueller Plan', 'Current Plan')}{v2PlanFilter === 'current' && <Check className="w-3 h-3" />}</button>
                            <button onClick={() => { setV2PlanFilter('all'); setV2SectionFilter('all'); setV2ShowPlanFilterDD(false); }} className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors ${v2PlanFilter === 'all' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>{tx('Alle Pläne', 'All Plans')} <span className="text-gray-400 text-[10px]">{plans.reduce((s, p) => s + p.sections.reduce((ss, sec) => ss + sec.tasks.length, 0), 0)}</span>{v2PlanFilter === 'all' && <Check className="w-3 h-3" />}</button>
                            <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
                            {plans.map(p => (
                              <button key={p.id} onClick={() => { setV2PlanFilter(p.id); setV2SectionFilter('all'); setV2ShowPlanFilterDD(false); }} className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors ${v2PlanFilter === p.id ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>{p.name} <span className="text-gray-400 text-[10px]">{p.sections.reduce((s, sec) => s + sec.tasks.length, 0)}</span>{v2PlanFilter === p.id && <Check className="w-3 h-3" />}</button>
                            ))}
                          </div>
                        </>)}
                      </div>
                      {/* Priority filter */}
                      <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-0.5">
                        <button onClick={() => setV2PrioFilter('all')} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${v2PrioFilter === 'all' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'}`}>{tx('Alle', 'All')}</button>
                        {(['high', 'medium', 'low'] as TaskPriority[]).map(p => {
                          const pc = priorityConfig[p];
                          return <button key={p} onClick={() => setV2PrioFilter(p)} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${v2PrioFilter === p ? 'bg-white dark:bg-gray-700 shadow-sm' : ''} ${pc.text}`}><div className="w-2 h-2 rounded-full" style={{ background: pc.dot }} />{lang === 'de' ? pc.de : pc.en}</button>;
                        })}
                      </div>
                      {/* MMA toggle */}
                      <button onClick={() => setV2MMAFilter(!v2MMAFilter)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors border-2 ${v2MMAFilter ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-500/30' : 'text-gray-400 border-gray-200 dark:border-gray-700 hover:border-amber-200'}`}><DollarSign className="w-3 h-3" />MMA</button>
                      {/* Section filter */}
                      <div className="relative">
                        <button onClick={() => setV2ShowSecFilterDD(!v2ShowSecFilterDD)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-sky-300 transition-colors">
                          <span className="text-gray-700 dark:text-gray-300">{v2SectionFilter === 'all' ? tx('Alle Sektionen', 'All Sections') : sourceSections.find(s => s.id === v2SectionFilter)?.name}</span>
                          <ChevronDown className="w-3 h-3 text-gray-400" />
                        </button>
                        {v2ShowSecFilterDD && (<>
                          <div className="fixed inset-0 z-30" onClick={() => setV2ShowSecFilterDD(false)} />
                          <div className="absolute left-0 top-full mt-1 z-40 min-w-[180px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden py-1 max-h-[300px] overflow-y-auto">
                            <button onClick={() => { setV2SectionFilter('all'); setV2ShowSecFilterDD(false); }} className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors ${v2SectionFilter === 'all' ? 'bg-sky-50 dark:bg-sky-500/10 text-sky-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>{tx('Alle Sektionen', 'All Sections')}{v2SectionFilter === 'all' && <Check className="w-3 h-3" />}</button>
                            {sourceSections.map(s => (
                              <button key={s.id} onClick={() => { setV2SectionFilter(s.id); setV2ShowSecFilterDD(false); }} className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors ${v2SectionFilter === s.id ? 'bg-sky-50 dark:bg-sky-500/10 text-sky-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>{s.name}{v2SectionFilter === s.id && <Check className="w-3 h-3" />}</button>
                            ))}
                          </div>
                        </>)}
                      </div>
                      {/* Status filter */}
                      <div className="relative">
                        <button onClick={() => setV2ShowStatusFilterDD(!v2ShowStatusFilterDD)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-sky-300 transition-colors">
                          <span className="text-gray-700 dark:text-gray-300">{v2StatusFilter === 'all' ? tx('Alle Status', 'All Status') : (lang === 'de' ? statusColumnsConfig[v2StatusFilter as TaskStatus].de : statusColumnsConfig[v2StatusFilter as TaskStatus].en)}</span>
                          <ChevronDown className="w-3 h-3 text-gray-400" />
                        </button>
                        {v2ShowStatusFilterDD && (<>
                          <div className="fixed inset-0 z-30" onClick={() => setV2ShowStatusFilterDD(false)} />
                          <div className="absolute left-0 top-full mt-1 z-40 min-w-[160px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden py-1">
                            <button onClick={() => { setV2StatusFilter('all'); setV2ShowStatusFilterDD(false); }} className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors ${v2StatusFilter === 'all' ? 'bg-sky-50 dark:bg-sky-500/10 text-sky-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>{tx('Alle Status', 'All Status')}{v2StatusFilter === 'all' && <Check className="w-3 h-3" />}</button>
                            {(Object.keys(statusColumnsConfig) as TaskStatus[]).map(s => (
                              <button key={s} onClick={() => { setV2StatusFilter(s); setV2ShowStatusFilterDD(false); }} className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors ${v2StatusFilter === s ? 'bg-sky-50 dark:bg-sky-500/10 text-sky-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>{lang === 'de' ? statusColumnsConfig[s].de : statusColumnsConfig[s].en}{v2StatusFilter === s && <Check className="w-3 h-3" />}</button>
                            ))}
                          </div>
                        </>)}
                      </div>
                      <div className="flex-1" />
                      {/* View toggle: List / Board */}
                      <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-0.5">
                        <button onClick={() => setV2TodoView('list')} className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${v2TodoView === 'list' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'}`}><List className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setV2TodoView('board')} className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${v2TodoView === 'board' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'}`}><Columns3 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>

                    {/* Count */}
                    <p className="text-xs text-gray-400">{filtered.length} {tx('Aufgaben', 'tasks')}{v2MMAFilter ? ' (MMA)' : ''}</p>

                    {/* ── TODO LIST VIEW ── */}
                    {v2TodoView === 'list' && (
                      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden divide-y divide-gray-50 dark:divide-gray-800">
                        {filtered.length === 0 && <p className="px-4 py-8 text-center text-sm text-gray-400">{tx('Keine Aufgaben mit diesen Filtern', 'No tasks match filters')}</p>}
                        {filtered.sort((a, b) => { const po = { high: 0, medium: 1, low: 2 }; return (po[(a.priority || 'medium') as TaskPriority] || 1) - (po[(b.priority || 'medium') as TaskPriority] || 1); }).map(task => {
                          const prio = priorityConfig[(task.priority || 'medium') as TaskPriority];
                          const secCol = sectionColorMap[task.sectionColor] || sectionColorMap.amber;
                          const statusLabel = statusColumnsConfig[(task.status || (task.done ? 'done' : 'todo')) as TaskStatus];
                          return (
                            <div key={task.id} onClick={() => { setV2Mode('plan'); setV2DetailTask({ sectionId: task.sectionId, task }); setV2ExpandedSections(prev => new Set([...prev, task.sectionId])); }} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors group">
                              {/* Priority bar */}
                              <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ background: prio.dot }} />
                              {/* Checkbox */}
                              <button onClick={(e) => { e.stopPropagation(); updateTodoTask(task.planId, task.sectionId, task.id, { done: !task.done, status: task.done ? 'todo' : 'done' }); }} className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors flex-shrink-0 ${task.done ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 dark:border-gray-600 hover:border-emerald-500'}`}>{task.done && <Check className="w-3 h-3 text-white" />}</button>
                              {/* Title */}
                              <div className="flex-1 min-w-0">
                                <span className={`text-sm ${task.done ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>{task.title || tx('Aufgabe...', 'Task...')}</span>
                                {task.description && <p className="text-xs text-gray-400 truncate">{task.description}</p>}
                              </div>
                              {/* Badges */}
                              {task.isMMA && <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded text-[9px] font-bold flex-shrink-0">MMA</span>}
                              {task.assignee && (() => { const p = plans.find(pp => pp.id === task.planId); const m = p?.teamMembers?.find(tm => tm.id === task.assignee); if (!m) return null; const cols: Record<string, string> = { indigo: 'bg-indigo-100 text-indigo-600', emerald: 'bg-emerald-100 text-emerald-600', sky: 'bg-sky-100 text-sky-600', amber: 'bg-amber-100 text-amber-600', rose: 'bg-rose-100 text-rose-600', purple: 'bg-purple-100 text-purple-600' }; return <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium flex-shrink-0 ${cols[m.color] || cols.indigo}`}>{m.initials}</span>; })()}
                              {task.linkedItemTitle && <span className="px-1.5 py-0.5 bg-sky-100 dark:bg-sky-500/20 text-sky-600 rounded text-[9px] flex-shrink-0 truncate max-w-[80px]">{task.linkedItemTitle}</span>}
                              {showPlanBadge && <span className="px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded text-[9px] font-medium flex-shrink-0 truncate max-w-[80px]">{task.planName}</span>}
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${secCol.bg} ${secCol.text} flex-shrink-0`}>{task.sectionName}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${statusLabel.bg} ${statusLabel.text} flex-shrink-0`}>{lang === 'de' ? statusLabel.de : statusLabel.en}</span>
                              {task.dueDate && <span className="text-[10px] text-gray-400 flex-shrink-0">{new Date(task.dueDate + 'T00:00:00').toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', { day: 'numeric', month: 'short' })}</span>}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* ── TODO BOARD VIEW ── */}
                    {v2TodoView === 'board' && (
                      <div className="grid grid-cols-3 gap-4">
                        {(Object.keys(statusColumnsConfig) as TaskStatus[]).map(colStatus => {
                          const colConfig = statusColumnsConfig[colStatus];
                          const colTasks = filtered.filter(t => (t.status || (t.done ? 'done' : 'todo')) === colStatus).sort((a, b) => { const po = { high: 0, medium: 1, low: 2 }; return (po[(a.priority || 'medium') as TaskPriority] || 1) - (po[(b.priority || 'medium') as TaskPriority] || 1); });
                          return (
                            <div key={colStatus} className="space-y-3">
                              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${colConfig.bg}`}>
                                <span className={`text-xs font-bold uppercase tracking-widest ${colConfig.text}`}>{lang === 'de' ? colConfig.de : colConfig.en}</span>
                                <span className={`text-xs font-medium ${colConfig.text} opacity-60`}>{colTasks.length}</span>
                              </div>
                              <div className="space-y-2 min-h-[100px]">
                                {colTasks.map(task => {
                                  const prio = priorityConfig[(task.priority || 'medium') as TaskPriority];
                                  return (
                                    <div key={task.id} onClick={() => { setV2Mode('plan'); setV2DetailTask({ sectionId: task.sectionId, task }); setV2ExpandedSections(prev => new Set([...prev, task.sectionId])); }} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-3 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all group" style={{ borderLeftWidth: '3px', borderLeftColor: prio.dot }}>
                                      <div className="flex items-start justify-between gap-2 mb-1.5">
                                        <span className={`text-sm font-medium ${task.done ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>{task.title || '...'}</span>
                                        {/* Status cycle button */}
                                        <button onClick={(e) => { e.stopPropagation(); const cycle: TaskStatus[] = ['todo', 'in-progress', 'done']; const curr = (task.status || (task.done ? 'done' : 'todo')) as TaskStatus; const next = cycle[(cycle.indexOf(curr) + 1) % 3]; updateTodoTask(task.planId, task.sectionId, task.id, { status: next, done: next === 'done' }); }} className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0 opacity-0 group-hover:opacity-100"><ChevronRight className="w-3.5 h-3.5 text-gray-400" /></button>
                                      </div>
                                      {task.description && <p className="text-xs text-gray-400 mb-2 line-clamp-2">{task.description}</p>}
                                      <div className="flex flex-wrap items-center gap-1">
                                        {task.isMMA && <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded text-[8px] font-bold">MMA</span>}
                                        {task.assignee && (() => { const p = plans.find(pp => pp.id === task.planId); const m = p?.teamMembers?.find(tm => tm.id === task.assignee); if (!m) return null; const cols: Record<string, string> = { indigo: 'bg-indigo-100 text-indigo-600', emerald: 'bg-emerald-100 text-emerald-600', sky: 'bg-sky-100 text-sky-600', amber: 'bg-amber-100 text-amber-600', rose: 'bg-rose-100 text-rose-600', purple: 'bg-purple-100 text-purple-600' }; return <span className={`px-1.5 py-0.5 rounded text-[8px] font-medium ${cols[m.color] || cols.indigo}`}>{m.initials}</span>; })()}
                                        {showPlanBadge && <span className="px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded text-[8px] font-medium truncate max-w-[60px]">{task.planName}</span>}
                                        <span className="text-[9px] text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{task.sectionName}</span>
                                        {task.dueDate && <span className="text-[9px] text-gray-400">{new Date(task.dueDate + 'T00:00:00').toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', { day: 'numeric', month: 'short' })}</span>}
                                        {task.linkedItemTitle && <span className="text-[9px] text-sky-500 truncate max-w-[60px]">{task.linkedItemTitle}</span>}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}
              </>
              )}
            </div>
          )}

          {/* PERFORMANCE */}
          {section === 'performance' && (() => {
            const liveItems = contentItems.filter(i => i.status === 'live' && i.performance);
            const bestPerformers = [...liveItems].sort((a, b) => (b.performance?.views || 0) - (a.performance?.views || 0));
            const totalViews = liveItems.reduce((sum, i) => sum + (i.performance?.views || 0), 0);
            const totalLikes = liveItems.reduce((sum, i) => sum + (i.performance?.likes || 0), 0);
            const totalComments = liveItems.reduce((sum, i) => sum + (i.performance?.comments || 0), 0);
            const totalShares = liveItems.reduce((sum, i) => sum + (i.performance?.shares || 0), 0);
            const avgScore = contentItems.length > 0 ? Math.round(contentItems.reduce((sum, i) => sum + calcContentScore(i), 0) / contentItems.length) : 0;

            return (
              <>
                {/* KPI Row */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: 'Views', value: totalViews.toLocaleString(), icon: <Eye className="w-5 h-5 text-sky-500" />, bg: 'bg-sky-100 dark:bg-sky-500/20' },
                    { label: 'Likes', value: totalLikes.toLocaleString(), icon: <Star className="w-5 h-5 text-amber-500" />, bg: 'bg-amber-100 dark:bg-amber-500/20' },
                    { label: tx('Kommentare', 'Comments'), value: totalComments.toLocaleString(), icon: <Hash className="w-5 h-5 text-purple-500" />, bg: 'bg-purple-100 dark:bg-purple-500/20' },
                    { label: 'Shares', value: totalShares.toLocaleString(), icon: <Share2 className="w-5 h-5 text-emerald-500" />, bg: 'bg-emerald-100 dark:bg-emerald-500/20' },
                    { label: tx('Ø Score', 'Avg Score'), value: `${avgScore}%`, icon: <Percent className="w-5 h-5 text-pink-500" />, bg: 'bg-pink-100 dark:bg-pink-500/20' },
                  ].map(k => (
                    <div key={k.label} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                      <div className={`p-2.5 rounded-xl ${k.bg} w-fit mb-3`}>{k.icon}</div>
                      <p className="text-2xl font-bold">{k.value}</p>
                      <p className="text-sm text-gray-500 mt-1">{k.label}</p>
                    </div>
                  ))}
                </div>

                {/* Best & Worst performers */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                    <h3 className="font-semibold mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-500" />{tx('Top Performer', 'Top Performers')}</h3>
                    {bestPerformers.length === 0 ? (
                      <p className="text-sm text-gray-400 py-4">{tx('Noch keine Live-Inhalte mit Daten', 'No live content with data yet')}</p>
                    ) : (
                      <div className="space-y-3">
                        {bestPerformers.slice(0, 5).map((item, idx) => (
                          <div key={item.id} onClick={() => setSelectedItem(item)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>{idx + 1}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.title}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <PlatformBadge platform={item.platform} />
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold">{(item.performance?.views || 0).toLocaleString()}</p>
                              <p className="text-xs text-gray-400">Views</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                    <h3 className="font-semibold mb-4 flex items-center gap-2"><AlertCircle className="w-5 h-5 text-amber-500" />{tx('Niedrigster Score', 'Lowest Score')}</h3>
                    <div className="space-y-3">
                      {[...contentItems].filter(i => i.status !== 'archived').sort((a, b) => calcContentScore(a) - calcContentScore(b)).slice(0, 5).map(item => (
                        <div key={item.id} onClick={() => setSelectedItem(item)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <PlatformBadge platform={item.platform} />
                              <StatusBadge status={item.status} lang={lang} />
                            </div>
                          </div>
                          <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${calcContentScore(item) < 30 ? 'bg-red-100 dark:bg-red-500/20 text-red-600' : 'bg-amber-100 dark:bg-amber-500/20 text-amber-600'}`}>{calcContentScore(item)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Per-platform breakdown */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                  <h3 className="font-semibold mb-4">{tx('Performance pro Plattform', 'Performance per Platform')}</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {(['youtube', 'instagram', 'facebook-linkedin'] as Platform[]).map(p => {
                      const pItems = liveItems.filter(i => i.platform === p);
                      const pViews = pItems.reduce((s, i) => s + (i.performance?.views || 0), 0);
                      const pLikes = pItems.reduce((s, i) => s + (i.performance?.likes || 0), 0);
                      const Icon = platformConfig[p].icon;
                      return (
                        <div key={p} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                          <div className="flex items-center gap-2 mb-3">
                            <Icon className={`w-5 h-5 ${platformConfig[p].text.split(' ')[0]}`} />
                            <span className="font-medium text-sm">{platformConfig[p].en}</span>
                            <span className="ml-auto text-xs text-gray-400">{pItems.length} {tx('Items', 'items')}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div><p className="text-lg font-bold">{pViews.toLocaleString()}</p><p className="text-xs text-gray-400">Views</p></div>
                            <div><p className="text-lg font-bold">{pLikes.toLocaleString()}</p><p className="text-xs text-gray-400">Likes</p></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            );
          })()}

          {/* TEMPLATES */}
          {section === 'templates' && (
            <>
              <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-500/10 to-purple-500/10 border border-sky-200 dark:border-sky-500/30 mb-6">
                <div className="flex items-center gap-3 mb-2"><Layers className="w-6 h-6 text-sky-500" /><h3 className="font-semibold text-sky-700 dark:text-sky-400">{tx('Content-Vorlagen', 'Content Templates')}</h3></div>
                <p className="text-sm text-sky-600/70 dark:text-sky-400/70">{tx('Starte neuen Content schneller mit vorgefertigten Vorlagen.', 'Start new content faster with pre-built templates.')}</p>
              </div>

              {/* Series / Campaigns */}
              <div className="mb-8">
                <h3 className="font-semibold mb-4 flex items-center gap-2"><Bookmark className="w-5 h-5 text-purple-500" />{tx('Content-Serien', 'Content Series')}</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {series.map(s => {
                    const sItems = contentItems.filter(i => i.seriesId === s.id);
                    const colors = seriesColorMap[s.color] || seriesColorMap.sky;
                    return (
                      <div key={s.id} className={`rounded-2xl p-5 border ${colors.border} ${colors.bg}`}>
                        <h4 className={`font-semibold text-sm ${colors.text}`}>{s.name}</h4>
                        <p className="text-xs text-gray-500 mt-1 mb-3">{s.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">{sItems.length} {tx('Items', 'items')}</span>
                          <div className="flex -space-x-1">
                            {sItems.slice(0, 3).map(item => {
                              const Icon = platformConfig[item.platform].icon;
                              return <div key={item.id} className="w-6 h-6 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center"><Icon className="w-3 h-3 text-gray-500" /></div>;
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Template gallery */}
              <h3 className="font-semibold mb-4">{tx('Vorlagen', 'Templates')}</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {templates.map(tpl => {
                  const Icon = platformConfig[tpl.platform].icon;
                  return (
                    <div key={tpl.id} onClick={() => setPreviewTemplate(tpl)} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 hover:border-sky-200 dark:hover:border-sky-500/30 hover:shadow-lg transition-all cursor-pointer">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-xl ${platformConfig[tpl.platform].bg}`}>
                          <Icon className={`w-5 h-5 ${platformConfig[tpl.platform].text.split(' ')[0]}`} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">{tpl.name}</h4>
                          <p className="text-xs text-gray-500">{tpl.description}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {tpl.defaultTags.slice(0, 3).map(tag => <span key={tag} className="px-2 py-0.5 bg-sky-100 dark:bg-sky-500/20 text-sky-600 rounded-full text-xs">{tag}</span>)}
                        {tpl.defaultTags.length > 3 && <span className="text-xs text-gray-400">+{tpl.defaultTags.length - 3}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Template Preview Modal */}
              {previewTemplate && (() => {
                const tpl = previewTemplate;
                const Icon = platformConfig[tpl.platform].icon;
                return (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setPreviewTemplate(null)}>
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                    <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                      <div className="p-6">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-5">
                          <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${platformConfig[tpl.platform].bg}`}>
                              <Icon className={`w-6 h-6 ${platformConfig[tpl.platform].text.split(' ')[0]}`} />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg">{tpl.name}</h3>
                              <p className="text-sm text-gray-500">{tpl.description}</p>
                            </div>
                          </div>
                          <button onClick={() => setPreviewTemplate(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl" title={tx('Schließen', 'Close')}><X className="w-5 h-5 text-gray-400" /></button>
                        </div>

                        {/* Concept */}
                        {tpl.concept && (
                          <div className="mb-4">
                            <h4 className="text-xs font-semibold text-gray-400 uppercase mb-1.5">{tx('Konzept', 'Concept')}</h4>
                            <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">{tpl.concept}</p>
                          </div>
                        )}

                        {/* Angle */}
                        {tpl.angle && (
                          <div className="mb-4">
                            <h4 className="text-xs font-semibold text-gray-400 uppercase mb-1.5">{tx('Blickwinkel', 'Angle')}</h4>
                            <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">{tpl.angle}</p>
                          </div>
                        )}

                        {/* Tags */}
                        <div className="mb-4">
                          <h4 className="text-xs font-semibold text-gray-400 uppercase mb-1.5">Tags</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {tpl.defaultTags.map(tag => <span key={tag} className="px-2.5 py-1 bg-sky-100 dark:bg-sky-500/20 text-sky-600 rounded-full text-xs">{tag}</span>)}
                          </div>
                        </div>

                        {/* Checklist preview */}
                        <div className="mb-6">
                          <h4 className="text-xs font-semibold text-gray-400 uppercase mb-1.5">{tx('Checkliste', 'Checklist')} ({tpl.defaultChecklist.length})</h4>
                          <ul className="space-y-1">
                            {tpl.defaultChecklist.map((step, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <div className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600 flex-shrink-0" />
                                {step}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                          <button onClick={() => setPreviewTemplate(null)} className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            {tx('Abbrechen', 'Cancel')}
                          </button>
                          <button onClick={() => {
                            const now = new Date().toISOString();
                            const newItem: ContentItem = {
                              id: Date.now().toString(), platform: tpl.platform, status: 'idea', priority: 'medium', quality: 'neutral',
                              createdAt: now, updatedAt: now, title: tpl.name + ' – ' + tx('Kopie', 'Copy'), concept: tpl.concept, angle: tpl.angle, notes: '', tags: [...tpl.defaultTags],
                              checklist: tpl.defaultChecklist.map((label, i) => ({ id: `c${i}`, label, done: false })),
                              ...(tpl.platform === 'youtube' ? { yt: { videoTitle: '', videoDescription: '', keywords: [], thumbnails: [], category: 'Business', targetAudience: '' } } : {}),
                              ...(tpl.platform === 'instagram' ? { ig: { caption: '', hashtags: [], postType: 'reel' as InstagramPostType, audioReference: '' } } : {}),
                              ...(tpl.platform === 'facebook-linkedin' ? { fb: { caption: '', hashtags: [], postType: 'post' as FBPostType, linkUrl: '', coverImage: undefined } } : {}),
                              versions: [],
                            };
                            setContentItems(prev => [...prev, newItem]);
                            setPreviewTemplate(null);
                            addToast(tx('Vorlage dupliziert!', 'Template duplicated!'));
                            setSelectedItem(newItem);
                          }} className="flex-1 px-4 py-2.5 bg-sky-500 text-white rounded-xl text-sm font-medium hover:bg-sky-600 transition-colors flex items-center justify-center gap-2">
                            <Copy className="w-4 h-4" />{tx('Duplizieren', 'Duplicate')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </>
          )}

          {/* RESEARCH */}
          {section === 'research' && (
            <>
              <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200 dark:border-purple-500/30 mb-6">
                <div className="flex items-center gap-3 mb-2"><Sparkles className="w-6 h-6 text-purple-500" /><h3 className="font-semibold text-purple-700 dark:text-purple-400">{tx('AI-Recherche kommt bald', 'AI Research Coming Soon')}</h3></div>
                <p className="text-sm text-purple-600/70 dark:text-purple-400/70">{tx('Bald recherchiert eine AI automatisch trending Topics, YouTube-Videos und Instagram Reels für dich.', 'Soon an AI will automatically research trending topics, YouTube videos and Instagram reels for you.')}</p>
              </div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">{tx('Research-Notizen', 'Research Notes')} ({researchNotes.length})</h3>
                <button onClick={handleCreateResearch} className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-xl text-sm font-medium hover:bg-purple-600"><Plus className="w-4 h-4" />{tx('Neue Notiz', 'New Note')}</button>
              </div>
              {researchNotes.length === 0 ? (
                <div className="text-center py-16 text-gray-400"><Search className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>{tx('Noch keine Notizen', 'No notes yet')}</p></div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {researchNotes.map(note => (
                    <div key={note.id} onClick={() => setSelectedNote(note)} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 hover:border-purple-200 dark:hover:border-purple-500/30 hover:shadow-lg transition-all cursor-pointer">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-sm">{note.title}</h4>
                        {note.platform !== 'general' && <PlatformBadge platform={note.platform as Platform} />}
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-3 mb-3">{note.content}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          {note.tags.slice(0, 3).map(tag => <span key={tag} className="px-2 py-0.5 bg-purple-100 dark:bg-purple-500/20 text-purple-600 rounded-full text-xs">{tag}</span>)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          {note.links.length > 0 && <span className="flex items-center gap-1"><ExternalLink className="w-3 h-3" />{note.links.length}</span>}
                          <span>{new Date(note.updatedAt).toLocaleDateString('de-DE')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* SETTINGS */}
          {section === 'settings' && (
            <>
              <div className="flex gap-2 mb-6">
                {(['general', 'export', 'data'] as const).map(t => (
                  <button key={t} onClick={() => setSettingsTab(t)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${settingsTab === t ? 'bg-sky-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200'}`}>
                    {t === 'general' ? tx('Allgemein', 'General') : t === 'export' ? 'Export' : tx('Daten', 'Data')}
                  </button>
                ))}
              </div>

              {settingsTab === 'general' && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                    <h3 className="font-semibold mb-4">{tx('Standard-Plattform', 'Default Platform')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {(['youtube', 'instagram', 'facebook-linkedin'] as Platform[]).map(p => {
                        const Icon = platformConfig[p].icon;
                        const activeColors: Record<Platform, string> = { youtube: 'bg-red-500 text-white', instagram: 'bg-pink-500 text-white', 'facebook-linkedin': 'bg-blue-500 text-white' };
                        return (
                          <button key={p} onClick={() => setDefaultPlatform(p)} className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${defaultPlatform === p ? activeColors[p] : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200'}`}>
                            <Icon className="w-4 h-4" />{platformConfig[p].en}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                    <h3 className="font-semibold mb-4">{tx('Statistiken', 'Statistics')}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"><p className="text-sm text-gray-500 mb-1">{tx('Gesamt', 'Total')}</p><p className="text-2xl font-bold">{stats.total}</p></div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"><p className="text-sm text-gray-500 mb-1">YouTube</p><p className="text-2xl font-bold">{stats.youtube}</p></div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"><p className="text-sm text-gray-500 mb-1">Instagram</p><p className="text-2xl font-bold">{stats.instagram}</p></div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"><p className="text-sm text-gray-500 mb-1">FB & LinkedIn</p><p className="text-2xl font-bold">{stats.facebookLinkedin}</p></div>
                    </div>
                  </div>
                </div>
              )}

              {settingsTab === 'export' && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                    <h3 className="font-semibold mb-4">CSV Export</h3>
                    <p className="text-sm text-gray-500 mb-4">{tx('Exportiere alle Content-Items als CSV-Datei.', 'Export all content items as a CSV file.')}</p>
                    <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-xl text-sm font-medium hover:bg-sky-600"><Download className="w-4 h-4" />CSV Export</button>
                  </div>
                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                    <h3 className="font-semibold mb-4">JSON Backup</h3>
                    <p className="text-sm text-gray-500 mb-4">{tx('Exportiere oder importiere ein komplettes Backup (inkl. Research-Notizen).', 'Export or import a complete backup (incl. research notes).')}</p>
                    <div className="flex gap-3">
                      <button onClick={handleExportJSON} className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-xl text-sm font-medium hover:bg-sky-600"><Download className="w-4 h-4" />JSON Export</button>
                      <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-medium hover:bg-gray-200 cursor-pointer">
                        <Upload className="w-4 h-4" />JSON Import
                        <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {settingsTab === 'data' && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-red-200 dark:border-red-500/30">
                    <h3 className="font-semibold mb-2 text-red-600">{tx('Daten zurücksetzen', 'Reset Data')}</h3>
                    <p className="text-sm text-gray-500 mb-4">{tx('Setzt alle Daten auf die Demo-Daten zurück. Diese Aktion kann nicht rückgängig gemacht werden.', 'Resets all data to demo data. This action cannot be undone.')}</p>
                    {resetSuccess && (
                      <div className="mb-4 px-4 py-2 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 rounded-xl text-sm font-medium inline-flex items-center gap-2"><Check className="w-4 h-4" />{tx('Daten zurückgesetzt!', 'Data reset!')}</div>
                    )}
                    {!showResetConfirm ? (
                      <button onClick={() => setShowResetConfirm(true)} className="px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 dark:hover:bg-red-500/20 flex items-center gap-2"><Trash2 className="w-4 h-4" />{tx('Alle Daten zurücksetzen', 'Reset all data')}</button>
                    ) : (
                      <div className="flex items-center gap-3">
                        <p className="text-sm text-red-600 font-medium">{tx('Bist du sicher?', 'Are you sure?')}</p>
                        <button onClick={handleResetAll} className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600">{tx('Ja, zurücksetzen', 'Yes, reset')}</button>
                        <button onClick={() => setShowResetConfirm(false)} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-medium hover:bg-gray-200">{tx('Abbrechen', 'Cancel')}</button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ═══ PLAN-BUILDER MODAL V2 ═══ */}
        {showPlanBuilder && (() => {
          const closePB = () => {
            setShowPlanBuilder(false);
            setPlanBuilderName(''); setPlanBuilderDesc(''); setPlanBuilderGoal('');
            setPlanBuilderAudience(''); setPlanBuilderDeadline('');
            setPbChannels([]); setPbConfig({}); setPbPlanningDay(0); setPbPlanningCycle('1-week');
            setPbRevenueGoal(''); setPbProductPrice(''); setPbConversionLow('2'); setPbConversionHigh('5');
          };
          const createPlan = (generate: boolean) => {
            const now = new Date().toISOString();
            const newPlan: MarketingPlan = {
              id: `plan-${Date.now()}`, name: planBuilderName || tx('Neuer Plan', 'New Plan'), description: planBuilderDesc,
              createdAt: now, updatedAt: now,
              sections: generate && pbChannels.length > 0 ? generatePlanSections(pbChannels, pbConfig, pbPlanningDay, pbPlanningCycle,
                pbRevenueGoal && pbProductPrice ? {
                  revenueGoal: parseFloat(pbRevenueGoal), productPrice: parseFloat(pbProductPrice),
                  conversionLow: parseFloat(pbConversionLow) || 2, conversionHigh: parseFloat(pbConversionHigh) || 5,
                  weeksLeft: planBuilderDeadline ? Math.max(1, Math.ceil((new Date(planBuilderDeadline).getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000))) : null,
                } : undefined
              ) : [{ id: `sec-${Date.now()}-1`, name: 'Allgemein', color: 'amber', tasks: [] }],
              goal: planBuilderGoal || undefined, targetAudience: planBuilderAudience || undefined,
              channels: pbChannels.length > 0 ? pbChannels : undefined, channelConfig: Object.keys(pbConfig).length > 0 ? pbConfig : undefined,
              contentPlanningDay: pbPlanningDay, contentPlanningCycle: pbPlanningCycle,
              deadline: planBuilderDeadline || undefined, strategy: '', notes: '',
              revenueGoal: pbRevenueGoal ? parseFloat(pbRevenueGoal) : undefined,
              productPrice: pbProductPrice ? parseFloat(pbProductPrice) : undefined,
              conversionLow: pbConversionLow ? parseFloat(pbConversionLow) : undefined,
              conversionHigh: pbConversionHigh ? parseFloat(pbConversionHigh) : undefined,
              teamMembers: pbTeamMembers.length > 0 ? pbTeamMembers : undefined,
            };
            setPlans(prev => [...prev, newPlan]); setActivePlanId(newPlan.id); setV2SelectedPlan(newPlan.id);
            addToast(generate ? tx('Plan generiert!', 'Plan generated!') : tx('Leerer Plan erstellt', 'Empty plan created'));
            closePB();
          };
          const toggleCh = (ch: PlanChannel) => setPbChannels(prev => prev.includes(ch) ? prev.filter(x => x !== ch) : [...prev, ch]);
          const setCfg = (ch: string, key: string, val: unknown) => setPbConfig(prev => ({ ...prev, [ch]: { ...prev[ch], [key]: val } }));
          const inputCls = "w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/30 outline-none text-gray-900 dark:text-white";
          const hasContentCh = pbChannels.some(ch => channelMeta[ch].category === 'content');
          const hasYTSel = pbChannels.includes('youtube');

          const categories: { key: ChannelCategory; label: string; icon: string; channels: PlanChannel[] }[] = [
            { key: 'content', label: tx('Content', 'Content'), icon: '📢', channels: ['youtube', 'instagram', 'linkedin', 'tiktok', 'podcast'] },
            { key: 'outreach', label: tx('Outreach', 'Outreach'), icon: '📞', channels: ['cold-calls', 'cold-emails', 'dmc', 'pvc'] },
            { key: 'paid', label: tx('Bezahlte Werbung', 'Paid Advertising'), icon: '💰', channels: ['ads'] },
            { key: 'assets', label: 'Assets', icon: '🏗️', channels: ['homepage', 'funnel'] },
          ];

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closePB} />
              <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <button onClick={closePB} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl z-10" title={tx('Schließen', 'Close')}><X className="w-5 h-5 text-gray-400" /></button>
                <div className="p-8 space-y-6">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"><Sparkles className="w-5 h-5 text-white" /></div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{tx('Neuen Plan erstellen', 'Create New Plan')}</h2>
                      <p className="text-sm text-gray-500">{tx('Wähle Kanäle & Aktivitäten — wir generieren deinen Plan', 'Choose channels & activities — we generate your plan')}</p>
                    </div>
                  </div>

                  {/* GRUNDLAGEN */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{tx('Grundlagen', 'Basics')}</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2"><label className="text-xs text-gray-500 mb-1 block">{tx('Name', 'Name')}</label><input value={planBuilderName} onChange={e => setPlanBuilderName(e.target.value)} placeholder={tx('z.B. Q1 Growth Plan', 'e.g. Q1 Growth Plan')} className={inputCls} /></div>
                      <div className="col-span-2"><label className="text-xs text-gray-500 mb-1 block">{tx('Beschreibung', 'Description')}</label><input value={planBuilderDesc} onChange={e => setPlanBuilderDesc(e.target.value)} placeholder={tx('Kurze Beschreibung...', 'Short description...')} className={inputCls} /></div>
                      <div><label className="text-xs text-gray-500 mb-1 block">{tx('Zielgruppe', 'Target Audience')}</label><input value={planBuilderAudience} onChange={e => setPlanBuilderAudience(e.target.value)} placeholder={tx('z.B. B2B SaaS Gründer', 'e.g. B2B SaaS Founders')} className={inputCls} /></div>
                      <div><label className="text-xs text-gray-500 mb-1 block">Deadline</label><input type="date" value={planBuilderDeadline} onChange={e => setPlanBuilderDeadline(e.target.value)} className={inputCls} /></div>
                    </div>
                  </div>

                  {/* ZIELE & ZAHLEN */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{tx('Ziele & Zahlen', 'Goals & Numbers')}</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">{tx('Ziel-Umsatz (€)', 'Revenue Goal (€)')}</label>
                        <input type="number" min={0} value={pbRevenueGoal} onChange={e => setPbRevenueGoal(e.target.value)} placeholder={tx('z.B. 100000', 'e.g. 100000')} className={inputCls} />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">{tx('Produktpreis (€)', 'Product Price (€)')}</label>
                        <input type="number" min={0} value={pbProductPrice} onChange={e => setPbProductPrice(e.target.value)} placeholder={tx('z.B. 2000', 'e.g. 2000')} className={inputCls} />
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-400">{tx('Conversion-Raten werden pro Kanal in der Konfiguration weiter unten angegeben.', 'Conversion rates are set per channel in the configuration below.')}</p>
                    {/* Auto-calculated summary based on per-channel conversions */}
                    {(() => {
                      const rev = parseFloat(pbRevenueGoal);
                      const price = parseFloat(pbProductPrice);
                      if (!rev || !price || price <= 0) return null;
                      const customersNeeded = Math.ceil(rev / price);
                      const deadlineDate = planBuilderDeadline ? new Date(planBuilderDeadline) : null;
                      const weeksLeft = deadlineDate ? Math.max(1, Math.ceil((deadlineDate.getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000))) : null;
                      const workdays = weeksLeft ? weeksLeft * 5 : null;

                      // Calculate per-channel customer contribution using funnel steps
                      const outreachChannels = pbChannels.filter(ch => ['cold-calls', 'cold-emails', 'dmc', 'pvc'].includes(ch));
                      const channelBreakdown: { channel: PlanChannel; label: string; perDay: number; customersPerDay: number }[] = [];
                      outreachChannels.forEach(ch => {
                        const cfg = pbConfig[ch] || {};
                        const perDay = cfg.countPerDay || (ch === 'cold-calls' ? 20 : ch === 'cold-emails' ? 50 : ch === 'pvc' ? 15 : 10);
                        const steps = cfg.funnelSteps || defaultFunnels[ch] || [];
                        const { finalPerDay } = calcFunnelOutput(perDay, steps);
                        channelBreakdown.push({ channel: ch, label: channelMeta[ch].label, perDay, customersPerDay: finalPerDay });
                      });

                      const totalCustomersPerDay = channelBreakdown.reduce((sum, c) => sum + c.customersPerDay, 0);
                      const totalCustomersPerWeek = totalCustomersPerDay * 5;
                      const totalCustomersInPeriod = workdays ? totalCustomersPerDay * workdays : null;
                      const reachesGoal = totalCustomersInPeriod !== null ? totalCustomersInPeriod >= customersNeeded : null;
                      const weeksNeeded = totalCustomersPerWeek > 0 ? Math.ceil(customersNeeded / totalCustomersPerWeek) : null;
                      const fmt = (n: number) => n.toLocaleString('de-DE');

                      return (
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/5 dark:to-purple-500/5 rounded-xl p-4 space-y-3 border border-indigo-100 dark:border-indigo-500/20">
                          <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5" />{tx('Hochrechnung', 'Projection')}</p>
                          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                            <div className="flex justify-between"><span className="text-xs text-gray-500">{tx('Benötigte Kunden', 'Customers Needed')}</span><span className="text-sm font-bold text-gray-900 dark:text-white">{fmt(customersNeeded)}</span></div>
                            {weeksLeft !== null && <div className="flex justify-between"><span className="text-xs text-gray-500">{tx('Wochen bis Deadline', 'Weeks to Deadline')}</span><span className="text-sm font-bold text-gray-900 dark:text-white">{weeksLeft}</span></div>}
                          </div>

                          {channelBreakdown.length > 0 && (
                            <div className="border-t border-indigo-200/50 dark:border-indigo-500/20 pt-2 space-y-2">
                              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">{tx('Pro Kanal', 'Per Channel')}</p>
                              <div className="space-y-1.5">
                                {channelBreakdown.map(cb => (
                                  <div key={cb.channel} className="flex items-center justify-between text-xs">
                                    <span className="text-gray-600 dark:text-gray-400 font-medium">{cb.label}</span>
                                    <span className="flex items-center gap-1.5">
                                      <span className="text-gray-400">{cb.perDay}/{tx('Tag', 'd')}</span>
                                      <span className="text-gray-300">→</span>
                                      <span className="text-emerald-600 font-bold">{cb.customersPerDay < 0.01 ? cb.customersPerDay.toFixed(3) : cb.customersPerDay < 0.1 ? cb.customersPerDay.toFixed(2) : cb.customersPerDay.toFixed(1)} {tx('Kunden/Tag', 'cust./day')}</span>
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {channelBreakdown.length > 0 && (
                            <div className="border-t border-indigo-200/50 dark:border-indigo-500/20 pt-2 space-y-2">
                              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">{tx('Gesamt-Prognose', 'Total Forecast')}</p>
                              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                                <div className="flex justify-between"><span className="text-xs text-gray-500">{tx('Kunden/Woche', 'Customers/Week')}</span><span className="text-sm font-bold text-gray-900 dark:text-white">{totalCustomersPerWeek < 1 ? totalCustomersPerWeek.toFixed(1) : Math.round(totalCustomersPerWeek).toString()}</span></div>
                                {weeksNeeded && <div className="flex justify-between"><span className="text-xs text-gray-500">{tx('Wochen bis Ziel', 'Weeks to Goal')}</span><span className="text-sm font-bold text-gray-900 dark:text-white">{weeksNeeded}</span></div>}
                                {totalCustomersInPeriod !== null && <div className="flex justify-between"><span className="text-xs text-gray-500">{tx('Kunden bis Deadline', 'Customers by Deadline')}</span><span className={`text-sm font-bold ${reachesGoal ? 'text-emerald-600' : 'text-red-500'}`}>{Math.round(totalCustomersInPeriod)}</span></div>}
                              </div>
                              {reachesGoal !== null && (
                                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold ${reachesGoal ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' : 'bg-red-50 dark:bg-red-500/10 text-red-500'}`}>
                                  {reachesGoal ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                  {reachesGoal
                                    ? tx('Ziel erreichbar mit diesen Aktivitäten!', 'Goal achievable with these activities!')
                                    : tx(`Ziel nicht erreichbar — es fehlen ~${fmt(customersNeeded - Math.round(totalCustomersInPeriod!))} Kunden`, `Goal not achievable — ~${fmt(customersNeeded - Math.round(totalCustomersInPeriod!))} customers short`)}
                                </div>
                              )}
                              {reachesGoal === false && workdays && channelBreakdown.length > 0 && (() => {
                                const factor = totalCustomersPerDay > 0 ? customersNeeded / (totalCustomersPerDay * workdays) : 0;
                                const deficitPerDay = (customersNeeded - totalCustomersInPeriod!) / workdays;
                                const soloSuggestions = channelBreakdown.map(cb => {
                                  const convPerUnit = cb.customersPerDay / cb.perDay;
                                  return { ...cb, needed: Math.ceil(cb.perDay + deficitPerDay / convPerUnit) };
                                });
                                return (
                                  <div className="bg-amber-50 dark:bg-amber-500/5 rounded-lg border border-amber-200/60 dark:border-amber-500/20 p-3 space-y-2.5">
                                    <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">{tx('Vorschläge zur Zielerreichung', 'Suggestions to Reach Goal')}</p>
                                    <div className="space-y-1">
                                      <p className="text-[10px] text-gray-500">{channelBreakdown.length > 1 ? tx('Alle Kanäle proportional erhöhen:', 'Increase all channels proportionally:') : tx('Schlagzahl erhöhen:', 'Increase activity:')}</p>
                                      {channelBreakdown.map(cb => (
                                        <div key={cb.channel} className="flex items-center justify-between text-xs bg-white/60 dark:bg-gray-900/30 rounded-lg px-2.5 py-1.5">
                                          <span className="text-gray-600 dark:text-gray-400">{cb.label}</span>
                                          <span className="flex items-center gap-1"><span className="text-gray-400">{cb.perDay}</span><span className="text-amber-500">→</span><span className="font-bold text-amber-600 dark:text-amber-400">{Math.ceil(cb.perDay * factor)}/{tx('Tag', 'd')}</span></span>
                                        </div>
                                      ))}
                                    </div>
                                    {channelBreakdown.length > 1 && (
                                      <div className="space-y-1">
                                        <p className="text-[10px] text-gray-500">{tx('Oder nur einen Kanal erhöhen:', 'Or increase just one channel:')}</p>
                                        {soloSuggestions.map(s => (
                                          <div key={s.channel} className="flex items-center justify-between text-xs bg-white/60 dark:bg-gray-900/30 rounded-lg px-2.5 py-1.5">
                                            <span className="text-gray-600 dark:text-gray-400">{s.label}</span>
                                            <span className="flex items-center gap-1"><span className="text-gray-400">{s.perDay}</span><span className="text-amber-500">→</span><span className="font-bold text-amber-600 dark:text-amber-400">{s.needed}/{tx('Tag', 'd')}</span></span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          )}

                          {channelBreakdown.length === 0 && (
                            <p className="text-xs text-gray-400 italic">{tx('Wähle Outreach-Kanäle unten aus, um die Hochrechnung zu sehen.', 'Select outreach channels below to see the projection.')}</p>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* TEAM */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{tx('Team', 'Team')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {([
                        { id: 'tm-1', name: 'Claudio', color: 'indigo', initials: 'CD' },
                        { id: 'tm-2', name: 'Anak', color: 'emerald', initials: 'AN' },
                      ] as TeamMember[]).map(m => {
                        const isSelected = pbTeamMembers.some(tm => tm.id === m.id);
                        const cols: Record<string, { active: string; inactive: string }> = {
                          indigo: { active: 'bg-indigo-500 text-white', inactive: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700' },
                          emerald: { active: 'bg-emerald-500 text-white', inactive: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700' },
                        };
                        const c = cols[m.color] || cols.indigo;
                        return (
                          <button key={m.id} onClick={() => setPbTeamMembers(prev => isSelected ? prev.filter(x => x.id !== m.id) : [...prev, m])} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${isSelected ? c.active : c.inactive}`}>
                            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">{m.initials}</span>
                            {m.name}
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* KANÄLE & AKTIVITÄTEN */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{tx('Kanäle & Aktivitäten', 'Channels & Activities')}</h3>
                    {categories.map(cat => (
                      <div key={cat.key} className="space-y-2">
                        <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5"><span>{cat.icon}</span>{cat.label}</p>
                        <div className="grid grid-cols-2 gap-2">
                          {cat.channels.map(ch => {
                            const m = channelMeta[ch]; const sel = pbChannels.includes(ch);
                            const chStr = ch as string;
                            const hint = chStr === 'youtube' ? tx('Basis-Plattform', 'Foundation') : chStr === 'pvc' ? tx('3-Schritt-Strategie', '3-step strategy') : hasYTSel && m.category === 'content' && chStr !== 'youtube' ? tx('Repurposing aus YT', 'Repurposed from YT') : undefined;
                            return (
                              <button key={ch} onClick={() => toggleCh(ch)} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${sel ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'}`}>
                                {channelSvgIcon(ch as string, 22)}
                                <div className="flex-1 min-w-0">
                                  <span className={`text-sm font-medium block ${sel ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'}`}>{m.label}</span>
                                  {hint && <p className="text-[10px] text-gray-400 truncate">{hint}</p>}
                                </div>
                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${sel ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300 dark:border-gray-600'}`}>{sel && <Check className="w-3 h-3 text-white" />}</div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    {/* Contextual hints */}
                    {hasYTSel && pbChannels.filter(c => channelMeta[c].category === 'content').length > 1 && (
                      <p className="text-xs text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg px-3 py-2 flex items-center gap-1.5"><GitBranch className="w-3.5 h-3.5 flex-shrink-0" />{tx('YouTube als Basis: Abhängigkeiten werden automatisch erstellt.', 'YouTube as foundation: Dependencies are created automatically.')}</p>
                    )}
                    {pbChannels.includes('pvc') && (
                      <p className="text-xs text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg px-3 py-2 flex items-center gap-1.5"><GitBranch className="w-3.5 h-3.5 flex-shrink-0" />{tx('PVC: Anruf → Video per Mail → Follow-up Call nach 2 Tagen', 'PVC: Call → Video via email → Follow-up call after 2 days')}</p>
                    )}
                  </div>

                  {/* DYNAMISCHE KONFIGURATION */}
                  {pbChannels.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{tx('Konfiguration', 'Configuration')}</h3>

                      {/* Content Planning */}
                      {hasContentCh && (
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-3">
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{tx('Content-Planung', 'Content Planning')}</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] text-gray-500 mb-1 block">{tx('Planungstag', 'Planning Day')}</label>
                              <div className="flex flex-wrap gap-1">{[{v:0,l:'Mo'},{v:1,l:'Di'},{v:2,l:'Mi'},{v:3,l:'Do'},{v:4,l:'Fr'},{v:5,l:'Sa'},{v:6,l:'So'}].map(d => (
                                <button key={d.v} onClick={() => setPbPlanningDay(d.v)} className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${pbPlanningDay === d.v ? 'bg-indigo-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>{d.l}</button>
                              ))}</div>
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-500 mb-1 block">{tx('Vorlauf', 'Lead Time')}</label>
                              <div className="flex gap-1">
                                {[{v:'1-week',l:tx('1 Woche','1 Week')},{v:'2-weeks',l:tx('2 Wochen','2 Weeks')}].map(c => (
                                  <button key={c.v} onClick={() => setPbPlanningCycle(c.v)} className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${pbPlanningCycle === c.v ? 'bg-indigo-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>{c.l}</button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Per-channel config */}
                      {pbChannels.filter(ch => channelMeta[ch].category === 'content').map(ch => (
                        <div key={ch} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-2">
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1.5">{channelSvgIcon(ch as string, 14)} {channelMeta[ch].label}</p>
                          <div>
                            <label className="text-[10px] text-gray-500 mb-1 block">{tx('Posting-Frequenz', 'Posting Frequency')}</label>
                            <div className="flex flex-wrap gap-1.5 items-center">
                              {[{v:'1x-week',l:'1x/'+tx('Wo','Wk')},{v:'2x-week',l:'2x/'+tx('Wo','Wk')},{v:'3x-week',l:'3x/'+tx('Wo','Wk')},{v:'daily',l:tx('Täglich','Daily')},{v:'custom',l:tx('Eigene','Custom')}].map(f => (
                                <button key={f.v} onClick={() => setCfg(ch, 'postingFrequency', f.v)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${(pbConfig[ch]?.postingFrequency || '1x-week') === f.v ? 'bg-indigo-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{f.l}</button>
                              ))}
                              {pbConfig[ch]?.postingFrequency === 'custom' && (
                                <div className="flex items-center gap-1.5 ml-1">
                                  <input type="number" min={1} max={20} value={pbConfig[ch]?.countPerDay ?? ''} onChange={e => { const n = parseInt(e.target.value); setCfg(ch, 'countPerDay', isNaN(n) ? undefined : n); }} className="w-14 px-2 py-1.5 bg-white dark:bg-gray-800 rounded-lg text-sm text-center focus:ring-2 focus:ring-indigo-500/30 outline-none text-gray-900 dark:text-white" />
                                  <span className="text-xs text-gray-500">x/{tx('Tag', 'Day')}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Outreach config — per-step conversion funnel */}
                      {pbChannels.filter(ch => ['cold-calls','cold-emails','pvc','dmc'].includes(ch)).map(ch => {
                        const chStr = ch as string;
                        const hasTimeSlot = chStr === 'cold-calls' || chStr === 'pvc';
                        const defaultCount = chStr === 'cold-calls' ? 20 : chStr === 'cold-emails' ? 50 : chStr === 'pvc' ? 15 : 10;
                        const steps = pbConfig[ch]?.funnelSteps || defaultFunnels[chStr] || [];
                        const startLabel = chStr === 'cold-calls' ? tx('Anwahlen', 'Dials') : chStr === 'cold-emails' ? tx('Gesendet', 'Sent') : chStr === 'pvc' ? tx('Angerufen', 'Called') : tx('Versendet', 'Sent');
                        const inputSmall = "w-full px-2 py-1.5 bg-white dark:bg-gray-800 rounded-lg text-sm text-center font-medium focus:ring-2 focus:ring-indigo-500/30 outline-none text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700";

                        // Initialize funnelSteps in config if not set yet
                        const ensureSteps = () => {
                          if (!pbConfig[ch]?.funnelSteps) {
                            setCfg(ch, 'funnelSteps', defaultFunnels[chStr] || []);
                          }
                        };

                        const updateStep = (idx: number, rate: number) => {
                          ensureSteps();
                          const current = [...(pbConfig[ch]?.funnelSteps || defaultFunnels[chStr] || [])];
                          current[idx] = { ...current[idx], rate };
                          setCfg(ch, 'funnelSteps', current);
                        };

                        // Calculate throughput
                        const cnt = pbConfig[ch]?.countPerDay || defaultCount;
                        const { finalPerDay, throughput } = calcFunnelOutput(cnt, steps);

                        return (
                          <div key={ch} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-3">
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1.5">{channelSvgIcon(ch as string, 14)} {channelMeta[ch].label}</p>

                            {/* Count + Time row */}
                            <div className={`grid gap-3 ${hasTimeSlot ? 'grid-cols-3' : 'grid-cols-1 max-w-[200px]'}`}>
                              <div>
                                <label className="text-[10px] text-gray-500 mb-1.5 block">{startLabel}/{tx('Tag', 'Day')}</label>
                                <input type="number" min={1} value={pbConfig[ch]?.countPerDay ?? ''} onChange={e => { const n = parseInt(e.target.value); setCfg(ch, 'countPerDay', isNaN(n) ? undefined : n); }} className="w-full px-3 py-2 bg-white dark:bg-gray-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/30 outline-none text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700" />
                              </div>
                              {hasTimeSlot && (
                                <>
                                  <div>
                                    <label className="text-[10px] text-gray-500 mb-1.5 block">{tx('Von', 'From')}</label>
                                    <input type="time" value={pbConfig[ch]?.timeStart || '09:00'} onChange={e => setCfg(ch, 'timeStart', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/30 outline-none text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700" />
                                  </div>
                                  <div>
                                    <label className="text-[10px] text-gray-500 mb-1.5 block">{tx('Bis', 'To')}</label>
                                    <input type="time" value={pbConfig[ch]?.timeEnd || '12:00'} onChange={e => setCfg(ch, 'timeEnd', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/30 outline-none text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700" />
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Funnel Steps — visual chain */}
                            <div className="space-y-1">
                              <label className="text-[10px] text-gray-500 block font-medium">{tx('Übergangsraten', 'Transition Rates')}</label>
                              <div className="flex flex-wrap items-center gap-1">
                                <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700">{cnt} {startLabel}</span>
                                {steps.map((step, si) => (
                                  <div key={si} className="flex items-center gap-1">
                                    <span className="text-gray-300 dark:text-gray-600">→</span>
                                    <div className="flex items-center gap-0.5">
                                      <input type="number" min={0.1} max={100} step={0.5} value={step.rate || ''} onChange={e => { const n = parseFloat(e.target.value); updateStep(si, isNaN(n) ? 0 : n); }} className={`${inputSmall} w-14`} />
                                      <span className="text-[9px] text-gray-400">%</span>
                                    </div>
                                    <span className={`text-[10px] font-medium px-2 py-1 rounded-lg ${si === steps.length - 1 ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>{step.label}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Live throughput preview */}
                            <div className="flex flex-wrap items-center gap-1 text-[10px] text-gray-400">
                              <span className="font-medium text-gray-500">{cnt}</span>
                              {steps.map((_step, si) => (
                                <span key={si} className="flex items-center gap-1">
                                  <span className="text-gray-300">→</span>
                                  <span className={si === steps.length - 1 ? 'text-emerald-500 font-bold' : ''}>{throughput[si + 1] < 1 ? throughput[si + 1].toFixed(2) : throughput[si + 1].toFixed(1)}</span>
                                </span>
                              ))}
                              <span className="ml-1 text-emerald-500 font-medium">= {finalPerDay < 0.01 ? finalPerDay.toFixed(3) : finalPerDay < 0.1 ? finalPerDay.toFixed(2) : finalPerDay.toFixed(1)} {tx('Kunden/Tag', 'cust./day')}</span>
                            </div>
                          </div>
                        );
                      })}

                      {/* Ads config */}
                      {pbChannels.includes('ads') && (
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-2">
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">📣 Ads</p>
                          <label className="text-[10px] text-gray-500 mb-1 block">{tx('Plattformen', 'Platforms')}</label>
                          <div className="flex flex-wrap gap-2">
                            {[{v:'meta',l:'Meta (FB/IG)'},{v:'google',l:'Google'},{v:'linkedin',l:'LinkedIn'},{v:'tiktok',l:'TikTok'}].map(p => {
                              const sel = (pbConfig.ads?.adsPlatforms || ['meta']).includes(p.v);
                              return (
                                <button key={p.v} onClick={() => { const cur = pbConfig.ads?.adsPlatforms || ['meta']; setCfg('ads', 'adsPlatforms', sel ? cur.filter((x: string) => x !== p.v) : [...cur, p.v]); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${sel ? 'bg-indigo-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>{p.l}</button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Funnel config */}
                      {pbChannels.includes('funnel') && (
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-2">
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">🔄 Funnel</p>
                          <label className="text-[10px] text-gray-500 mb-1 block">{tx('Funnel-Typ', 'Funnel Type')}</label>
                          <div className="flex gap-2">
                            {[{v:'vsl',l:'VSL'},{v:'webinar',l:'Webinar'},{v:'homepage',l:'Homepage'}].map(f => (
                              <button key={f.v} onClick={() => setCfg('funnel', 'funnelType', f.v)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${(pbConfig.funnel?.funnelType || 'homepage') === f.v ? 'bg-indigo-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>{f.l}</button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ACTIONS */}
                  <div className="flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <button onClick={() => createPlan(false)} className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">{tx('Leeren Plan erstellen', 'Create Empty Plan')}</button>
                    <button onClick={() => createPlan(true)} className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2"><Sparkles className="w-4 h-4" />{tx('Plan generieren', 'Generate Plan')}</button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </main>
    </div>
  );
};

// ============================================
// EXPORT
// ============================================
export default function ContentDashboardPage() {
  return (
    <LanguageProvider>
      <ContentDashboardContent />
    </LanguageProvider>
  );
}
