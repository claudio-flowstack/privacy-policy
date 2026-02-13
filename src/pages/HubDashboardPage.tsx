/**
 * Hub Dashboard – Zentrales Master-Dashboard (Redesigned)
 * Premium design with real KPIs from all dashboards
 */

import { useState, useEffect, useMemo, useCallback, useRef } from "react";

import {
  BarChart3, Mail, Video, Calendar,
  Sun, Moon, Zap, GitBranch, Users,
  ChevronLeft, ChevronRight, ArrowRight,
  FileText, Activity, Sparkles, Save,
  ChevronDown, ChevronUp, DollarSign,
  TrendingUp, Layers, MessageSquare
} from "lucide-react";
import { useTheme } from '@/components/theme-provider';
import { LanguageProvider, useLanguage } from '../i18n/LanguageContext';
import { loadHubNotes, saveHubNotes } from '../data/hubStorage';
import { useModalEsc } from '../components/ui/ConfirmDialog';

// ============================================
// TYPES
// ============================================

interface HubNote {
  id: string;
  text: string;
  weekStart: string;
  createdAt: string;
  updatedAt: string;
}

interface AggregatedItem {
  id: string;
  title: string;
  source: 'content' | 'coldmail-campaign' | 'coldmail-lead' | 'automation' | 'funnel' | 'marketing' | 'linkedin';
  sourceLabel: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  scheduledDate?: string;
  route: string;
}

// ============================================
// HELPERS
// ============================================

const tx = (de: string, en: string, lang: string) => lang === 'de' ? de : en;

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

function getWeekDays(weekStart: string): Date[] {
  const start = new Date(weekStart + 'T00:00:00');
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function formatRelativeTime(dateStr: string, lang: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return tx('Gerade eben', 'Just now', lang);
  if (diffMin < 60) return tx(`vor ${diffMin} Min`, `${diffMin}m ago`, lang);
  if (diffHrs < 24) return tx(`vor ${diffHrs} Std`, `${diffHrs}h ago`, lang);
  if (diffDays < 7) return tx(`vor ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`, `${diffDays}d ago`, lang);
  return date.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', { day: 'numeric', month: 'short' });
}

function safeLoadJSON<T>(key: string): T[] {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function getGreeting(lang: string): string {
  const hour = new Date().getHours();
  if (hour < 12) return tx('Guten Morgen', 'Good Morning', lang);
  if (hour < 18) return tx('Guten Tag', 'Good Afternoon', lang);
  return tx('Guten Abend', 'Good Evening', lang);
}

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'K';
  return n.toLocaleString('de-DE');
}

function formatCurrency(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M €';
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'K €';
  return n.toLocaleString('de-DE') + ' €';
}

// ============================================
// localStorage READERS
// ============================================

function readContentItems(): AggregatedItem[] {
  const items = safeLoadJSON<{
    id: string; title: string; status: string; platform: string;
    createdAt: string; updatedAt: string; scheduledDate?: string;
  }>('flowstack-content-items');
  return items.map(i => ({
    id: i.id,
    title: i.title || 'Untitled',
    source: 'content' as const,
    sourceLabel: i.platform === 'youtube' ? 'YouTube' : i.platform === 'instagram' ? 'Instagram' : 'FB/LinkedIn',
    status: i.status,
    createdAt: i.createdAt,
    updatedAt: i.updatedAt,
    scheduledDate: i.scheduledDate,
    route: '/content',
  }));
}

function readCampaigns(): AggregatedItem[] {
  const items = safeLoadJSON<{
    id: string; name: string; status: string;
    createdAt: string; updatedAt: string;
  }>('flowstack-coldmail-campaigns');
  return items.map(i => ({
    id: i.id,
    title: i.name || 'Untitled Campaign',
    source: 'coldmail-campaign' as const,
    sourceLabel: 'Cold Mail',
    status: i.status,
    createdAt: i.createdAt,
    updatedAt: i.updatedAt,
    route: '/coldmail',
  }));
}

function readLeads(): AggregatedItem[] {
  const items = safeLoadJSON<{
    id: string; firstName: string; lastName: string; company: string;
    status: string; lastContactedAt?: string;
  }>('flowstack-coldmail-leads');
  return items.map(i => ({
    id: i.id,
    title: `${i.firstName} ${i.lastName}` + (i.company ? ` (${i.company})` : ''),
    source: 'coldmail-lead' as const,
    sourceLabel: 'Lead',
    status: i.status,
    updatedAt: i.lastContactedAt,
    route: '/coldmail',
  }));
}

function readAutomationSystems(): AggregatedItem[] {
  const items = safeLoadJSON<{
    id: string; name: string; status: string;
    lastExecuted?: string; executionCount: number;
  }>('flowstack-automation-systems');
  return items.map(i => ({
    id: i.id,
    title: i.name || 'Untitled Workflow',
    source: 'automation' as const,
    sourceLabel: 'Automation',
    status: i.status,
    updatedAt: i.lastExecuted,
    route: '/systems',
  }));
}

function readFunnelBoards(): AggregatedItem[] {
  const items = safeLoadJSON<{
    id: string; name: string; createdAt: string; updatedAt: string;
  }>('flowstack-funnel-boards');
  return items.map(i => ({
    id: i.id,
    title: i.name || 'Untitled Board',
    source: 'funnel' as const,
    sourceLabel: 'Funnel',
    createdAt: i.createdAt,
    updatedAt: i.updatedAt,
    route: '/systems',
  }));
}

// ============================================
// KPI READERS
// ============================================

interface ContentKPIs {
  total: number;
  ideas: number;
  drafts: number;
  scheduled: number;
  live: number;
  active: number;
}

function getContentKPIs(): ContentKPIs {
  const items = safeLoadJSON<{ status: string }>('flowstack-content-items');
  return {
    total: items.length,
    ideas: items.filter(i => i.status === 'idea').length,
    drafts: items.filter(i => i.status === 'draft').length,
    scheduled: items.filter(i => i.status === 'scheduled').length,
    live: items.filter(i => i.status === 'live').length,
    active: items.filter(i => i.status !== 'archived').length,
  };
}

interface ColdMailKPIs {
  activeCampaigns: number;
  totalLeads: number;
  totalReplied: number;
  totalTemplates: number;
}

function getColdMailKPIs(): ColdMailKPIs {
  const campaigns = safeLoadJSON<{ status: string; stats: { replied: number } }>('flowstack-coldmail-campaigns');
  const leads = safeLoadJSON<Record<string, unknown>>('flowstack-coldmail-leads');
  const templates = safeLoadJSON<Record<string, unknown>>('flowstack-coldmail-templates');
  return {
    activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    totalLeads: leads.length,
    totalReplied: campaigns.reduce((sum, c) => sum + (c.stats?.replied || 0), 0),
    totalTemplates: templates.length,
  };
}

interface AutomationKPIs {
  total: number;
  active: number;
  totalExecutions: number;
}

function getAutomationKPIs(): AutomationKPIs {
  const items = safeLoadJSON<{ status: string; executionCount: number }>('flowstack-automation-systems');
  return {
    total: items.length,
    active: items.filter(i => i.status === 'active').length,
    totalExecutions: items.reduce((sum, i) => sum + (i.executionCount || 0), 0),
  };
}

function getFunnelKPIs(): { total: number } {
  const items = safeLoadJSON<Record<string, unknown>>('flowstack-funnel-boards');
  return { total: items.length };
}

interface MarketingKPIs {
  totalSpend: number;
  totalRevenue: number;
  avgRoas: number;
  totalLeads: number;
  activeCampaigns: number;
}

function getMarketingKPIs(): MarketingKPIs {
  const items = safeLoadJSON<{
    status: string; spend: number; revenue: number; roas: number; leads: number;
  }>('flowstack-marketing-campaigns');
  const totalSpend = items.reduce((s, i) => s + (i.spend || 0), 0);
  const totalRevenue = items.reduce((s, i) => s + (i.revenue || 0), 0);
  const avgRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
  return {
    totalSpend,
    totalRevenue,
    avgRoas: Math.round(avgRoas * 100) / 100,
    totalLeads: items.reduce((s, i) => s + (i.leads || 0), 0),
    activeCampaigns: items.filter(i => i.status === 'active').length,
  };
}

interface LinkedInKPIs {
  activeCampaigns: number;
  totalLeads: number;
  avgReplyRate: number;
  totalPosts: number;
  avgEngagement: number;
}

function getLinkedinKPIs(): LinkedInKPIs {
  const campaigns = safeLoadJSON<{
    status: string; leadsGenerated: number; messagesSent: number; messagesReplied: number;
  }>('flowstack-linkedin-campaigns');
  const posts = safeLoadJSON<{
    status: string; engagementRate: number;
  }>('flowstack-linkedin-posts');

  const totalSent = campaigns.reduce((s, c) => s + (c.messagesSent || 0), 0);
  const totalReplied = campaigns.reduce((s, c) => s + (c.messagesReplied || 0), 0);
  const published = posts.filter(p => p.status === 'published');

  return {
    activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    totalLeads: campaigns.reduce((s, c) => s + (c.leadsGenerated || 0), 0),
    avgReplyRate: totalSent > 0 ? Math.round((totalReplied / totalSent) * 100) : 0,
    totalPosts: published.length,
    avgEngagement: published.length > 0
      ? Math.round((published.reduce((s, p) => s + (p.engagementRate || 0), 0) / published.length) * 100) / 100
      : 0,
  };
}

// ============================================
// DASHBOARD CARD CONFIG
// ============================================

interface DashboardCardConfig {
  id: string;
  name: { de: string; en: string };
  description: { de: string; en: string };
  route: string;
  icon: React.ElementType;
  accentColor: string;
  borderAccent: string;
}

const dashboardCards: DashboardCardConfig[] = [
  {
    id: 'marketing',
    name: { de: 'Marketing KPIs', en: 'Marketing KPIs' },
    description: { de: 'Kampagnen & Performance', en: 'Campaigns & Performance' },
    route: '/dashboard',
    icon: BarChart3,
    accentColor: 'from-blue-500 to-blue-600',
    borderAccent: 'border-l-blue-500',
  },
  {
    id: 'linkedin',
    name: { de: 'LinkedIn', en: 'LinkedIn' },
    description: { de: 'Posts & Outreach', en: 'Posts & Outreach' },
    route: '/linkedin',
    icon: Users,
    accentColor: 'from-sky-500 to-sky-600',
    borderAccent: 'border-l-sky-500',
  },
  {
    id: 'automation',
    name: { de: 'Automation Systems', en: 'Automation Systems' },
    description: { de: 'Workflows & Automatisierung', en: 'Workflows & Automation' },
    route: '/systems',
    icon: Zap,
    accentColor: 'from-amber-500 to-orange-500',
    borderAccent: 'border-l-amber-500',
  },
  {
    id: 'content',
    name: { de: 'Content Hub', en: 'Content Hub' },
    description: { de: 'YouTube, Instagram & mehr', en: 'YouTube, Instagram & more' },
    route: '/content',
    icon: Video,
    accentColor: 'from-red-500 to-pink-500',
    borderAccent: 'border-l-red-500',
  },
  {
    id: 'coldmail',
    name: { de: 'Cold Mail', en: 'Cold Mail' },
    description: { de: 'E-Mail Outreach & Sequenzen', en: 'Email Outreach & Sequences' },
    route: '/coldmail',
    icon: Mail,
    accentColor: 'from-violet-500 to-purple-500',
    borderAccent: 'border-l-violet-500',
  },
  {
    id: 'funnel',
    name: { de: 'Funnel Visualizer', en: 'Funnel Visualizer' },
    description: { de: 'Marketing-Funnels', en: 'Marketing Funnels' },
    route: '/systems',
    icon: GitBranch,
    accentColor: 'from-emerald-500 to-teal-500',
    borderAccent: 'border-l-emerald-500',
  },
];

// ============================================
// STATUS COLORS
// ============================================

const statusColors: Record<string, string> = {
  idea: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  draft: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  ready: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  scheduled: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  live: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  archived: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  active: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  paused: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  new: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  contacted: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  replied: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  interested: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  meeting_booked: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
  not_interested: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  bounced: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const sourceColors: Record<string, string> = {
  content: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  'coldmail-campaign': 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  'coldmail-lead': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  automation: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  funnel: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  marketing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  linkedin: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
};

// ============================================
// PIPELINE CONFIG
// ============================================

interface PipelineConfig {
  label: { de: string; en: string };
  source: string;
  statuses: { key: string; label: { de: string; en: string }; color: string }[];
}

const pipelineConfigs: PipelineConfig[] = [
  {
    label: { de: 'Content', en: 'Content' },
    source: 'flowstack-content-items',
    statuses: [
      { key: 'idea', label: { de: 'Ideen', en: 'Ideas' }, color: 'bg-blue-500' },
      { key: 'draft', label: { de: 'Drafts', en: 'Drafts' }, color: 'bg-purple-500' },
      { key: 'ready', label: { de: 'Bereit', en: 'Ready' }, color: 'bg-amber-500' },
      { key: 'scheduled', label: { de: 'Geplant', en: 'Scheduled' }, color: 'bg-orange-500' },
      { key: 'live', label: { de: 'Live', en: 'Live' }, color: 'bg-green-500' },
      { key: 'archived', label: { de: 'Archiv', en: 'Archived' }, color: 'bg-gray-400' },
    ],
  },
  {
    label: { de: 'Cold Mail', en: 'Cold Mail' },
    source: 'flowstack-coldmail-campaigns',
    statuses: [
      { key: 'draft', label: { de: 'Entwurf', en: 'Draft' }, color: 'bg-purple-500' },
      { key: 'active', label: { de: 'Aktiv', en: 'Active' }, color: 'bg-green-500' },
      { key: 'paused', label: { de: 'Pausiert', en: 'Paused' }, color: 'bg-yellow-500' },
      { key: 'completed', label: { de: 'Abgeschlossen', en: 'Completed' }, color: 'bg-blue-500' },
    ],
  },
  {
    label: { de: 'Automation', en: 'Automation' },
    source: 'flowstack-automation-systems',
    statuses: [
      { key: 'active', label: { de: 'Aktiv', en: 'Active' }, color: 'bg-green-500' },
      { key: 'draft', label: { de: 'Entwurf', en: 'Draft' }, color: 'bg-purple-500' },
    ],
  },
];

// ============================================
// MAIN COMPONENT
// ============================================

function HubDashboardContent() {
  const { lang, setLang } = useLanguage();
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  // ---- Hub Notes ----
  const [notes, setNotes] = useState<HubNote[]>(() => loadHubNotes<HubNote>());
  const [showOlderNotes, setShowOlderNotes] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ESC key to collapse older notes
  useModalEsc(showOlderNotes, () => setShowOlderNotes(false));

  const currentWeekStart = getWeekStart(new Date());
  const currentNote = notes.find(n => n.weekStart === currentWeekStart);
  const [noteText, setNoteText] = useState(currentNote?.text || '');

  const olderNotes = useMemo(() =>
    notes
      .filter(n => n.weekStart !== currentWeekStart)
      .sort((a, b) => b.weekStart.localeCompare(a.weekStart)),
    [notes, currentWeekStart]
  );

  const handleNoteChange = useCallback((text: string) => {
    setNoteText(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const now = new Date().toISOString();
      setNotes(prev => {
        const existing = prev.find(n => n.weekStart === currentWeekStart);
        let updated: HubNote[];
        if (existing) {
          updated = prev.map(n => n.weekStart === currentWeekStart ? { ...n, text, updatedAt: now } : n);
        } else {
          updated = [...prev, { id: generateId(), text, weekStart: currentWeekStart, createdAt: now, updatedAt: now }];
        }
        saveHubNotes(updated);
        return updated;
      });
    }, 1000);
  }, [currentWeekStart]);

  // ---- Ctrl+S / Cmd+S: immediate save (bypass debounce) ----
  const [savedFlash, setSavedFlash] = useState(false);

  const saveNoteNow = useCallback(() => {
    // Cancel any pending debounce
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const now = new Date().toISOString();
    const text = noteText;
    setNotes(prev => {
      const existing = prev.find(n => n.weekStart === currentWeekStart);
      let updated: HubNote[];
      if (existing) {
        updated = prev.map(n => n.weekStart === currentWeekStart ? { ...n, text, updatedAt: now } : n);
      } else {
        updated = [...prev, { id: generateId(), text, weekStart: currentWeekStart, createdAt: now, updatedAt: now }];
      }
      saveHubNotes(updated);
      return updated;
    });
    // Flash "Saved" indicator
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  }, [noteText, currentWeekStart]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveNoteNow();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [saveNoteNow]);

  // ---- Week Navigation ----
  const [weekOffset, setWeekOffset] = useState(0);
  const displayedWeekStart = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + weekOffset * 7);
    return getWeekStart(d);
  }, [weekOffset]);
  const weekDays = useMemo(() => getWeekDays(displayedWeekStart), [displayedWeekStart]);

  // ---- Aggregated Data ----
  const allItems = useMemo(() => {
    return [
      ...readContentItems(),
      ...readCampaigns(),
      ...readLeads(),
      ...readAutomationSystems(),
      ...readFunnelBoards(),
    ];
  }, []);

  // Activity Feed: last 15 changes, grouped by day
  const activityFeed = useMemo(() => {
    return allItems
      .filter(i => i.updatedAt || i.createdAt)
      .map(i => ({
        ...i,
        sortDate: i.updatedAt || i.createdAt || '',
        isNew: i.createdAt === i.updatedAt,
      }))
      .sort((a, b) => b.sortDate.localeCompare(a.sortDate))
      .slice(0, 15);
  }, [allItems]);

  // Group activity by day
  const groupedActivity = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = (() => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split('T')[0]; })();

    const groups: { label: string; items: typeof activityFeed }[] = [
      { label: tx('Heute', 'Today', lang), items: [] },
      { label: tx('Gestern', 'Yesterday', lang), items: [] },
      { label: tx('Früher', 'Earlier', lang), items: [] },
    ];

    activityFeed.forEach(item => {
      const itemDay = item.sortDate.split('T')[0];
      if (itemDay === today) groups[0].items.push(item);
      else if (itemDay === yesterday) groups[1].items.push(item);
      else groups[2].items.push(item);
    });

    return groups.filter(g => g.items.length > 0);
  }, [activityFeed, lang]);

  // Week Items
  const weekItems = useMemo(() => {
    return allItems.filter(i => {
      if (!i.scheduledDate) return false;
      const sd = i.scheduledDate.split('T')[0];
      return weekDays.some(d => d.toISOString().split('T')[0] === sd);
    });
  }, [allItems, weekDays]);

  // KPIs
  const contentKPIs = useMemo(() => getContentKPIs(), []);
  const coldMailKPIs = useMemo(() => getColdMailKPIs(), []);
  const automationKPIs = useMemo(() => getAutomationKPIs(), []);
  const funnelKPIs = useMemo(() => getFunnelKPIs(), []);
  const marketingKPIs = useMemo(() => getMarketingKPIs(), []);
  const linkedinKPIs = useMemo(() => getLinkedinKPIs(), []);

  // Total leads across all dashboards
  const totalLeads = marketingKPIs.totalLeads + coldMailKPIs.totalLeads + linkedinKPIs.totalLeads;

  // Pipeline data
  const pipelineData = useMemo(() => {
    return pipelineConfigs.map(config => {
      const items = safeLoadJSON<{ status: string }>(config.source);
      const counts = config.statuses.map(s => ({
        ...s,
        count: items.filter(i => i.status === s.key).length,
      }));
      const total = items.length;
      return { ...config, counts, total };
    });
  }, []);

  // ---- KPI text for cards ----
  function getCardKPIs(cardId: string): { label: string; value: string | number }[] {
    switch (cardId) {
      case 'marketing':
        return marketingKPIs.totalSpend > 0 ? [
          { label: tx('Ausgaben', 'Spend', lang), value: formatCurrency(marketingKPIs.totalSpend) },
          { label: tx('Umsatz', 'Revenue', lang), value: formatCurrency(marketingKPIs.totalRevenue) },
          { label: 'ROAS', value: marketingKPIs.avgRoas + 'x' },
        ] : [
          { label: tx('Kampagnen', 'Campaigns', lang), value: marketingKPIs.activeCampaigns },
          { label: 'Leads', value: marketingKPIs.totalLeads },
        ];
      case 'linkedin':
        return linkedinKPIs.activeCampaigns > 0 || linkedinKPIs.totalPosts > 0 ? [
          { label: tx('Kampagnen', 'Campaigns', lang), value: linkedinKPIs.activeCampaigns },
          { label: 'Leads', value: linkedinKPIs.totalLeads },
          { label: tx('Antwortrate', 'Reply Rate', lang), value: linkedinKPIs.avgReplyRate + '%' },
        ] : [
          { label: 'Posts', value: linkedinKPIs.totalPosts },
          { label: tx('Engagement', 'Engagement', lang), value: linkedinKPIs.avgEngagement + '%' },
        ];
      case 'automation':
        return [
          { label: tx('Aktiv', 'Active', lang), value: automationKPIs.active },
          { label: tx('Gesamt', 'Total', lang), value: automationKPIs.total },
          { label: tx('Ausführungen', 'Executions', lang), value: automationKPIs.totalExecutions },
        ];
      case 'content':
        return [
          { label: tx('Ideen', 'Ideas', lang), value: contentKPIs.ideas },
          { label: tx('Drafts', 'Drafts', lang), value: contentKPIs.drafts },
          { label: tx('Live', 'Live', lang), value: contentKPIs.live },
        ];
      case 'coldmail':
        return [
          { label: tx('Kampagnen', 'Campaigns', lang), value: coldMailKPIs.activeCampaigns },
          { label: 'Leads', value: coldMailKPIs.totalLeads },
          { label: tx('Antworten', 'Replies', lang), value: coldMailKPIs.totalReplied },
        ];
      case 'funnel':
        return [
          { label: tx('Boards', 'Boards', lang), value: funnelKPIs.total },
        ];
      default:
        return [];
    }
  }

  function hasData(cardId: string): boolean {
    switch (cardId) {
      case 'marketing': return marketingKPIs.activeCampaigns > 0 || marketingKPIs.totalLeads > 0;
      case 'linkedin': return linkedinKPIs.activeCampaigns > 0 || linkedinKPIs.totalPosts > 0;
      case 'automation': return automationKPIs.total > 0;
      case 'content': return contentKPIs.total > 0;
      case 'coldmail': return coldMailKPIs.activeCampaigns > 0 || coldMailKPIs.totalLeads > 0;
      case 'funnel': return funnelKPIs.total > 0;
      default: return false;
    }
  }

  // ---- Day names ----
  const dayNames = lang === 'de'
    ? ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const todayStr = new Date().toISOString().split('T')[0];

  // ---- Top KPI cards config ----
  const topKPIs = [
    {
      label: tx('Umsatz', 'Revenue', lang),
      value: formatCurrency(marketingKPIs.totalRevenue),
      icon: DollarSign,
      gradient: 'from-blue-500 to-indigo-600',
      bgGlow: 'bg-blue-500/10',
    },
    {
      label: tx('Gesamt-Leads', 'Total Leads', lang),
      value: formatNumber(totalLeads),
      icon: Users,
      gradient: 'from-emerald-500 to-green-600',
      bgGlow: 'bg-emerald-500/10',
    },
    {
      label: tx('Aktive Inhalte', 'Active Content', lang),
      value: formatNumber(contentKPIs.active),
      icon: Layers,
      gradient: 'from-red-500 to-pink-600',
      bgGlow: 'bg-red-500/10',
    },
    {
      label: tx('Automations', 'Automations', lang),
      value: automationKPIs.active + ' / ' + automationKPIs.total,
      icon: Zap,
      gradient: 'from-amber-500 to-orange-500',
      bgGlow: 'bg-amber-500/10',
    },
    {
      label: tx('Engagement', 'Engagement', lang),
      value: linkedinKPIs.avgEngagement + '%',
      icon: MessageSquare,
      gradient: 'from-sky-500 to-blue-600',
      bgGlow: 'bg-sky-500/10',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Flowstack Hub
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(lang === 'de' ? 'en' : 'de')}
              className="px-3 py-1.5 text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={tx('Sprache wechseln', 'Switch language', lang)}
            >
              {lang === 'de' ? 'EN' : 'DE'}
            </button>
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={tx('Design wechseln', 'Toggle theme', lang)}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

        {/* ── 0. Welcome Banner ── */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6 sm:p-8 text-white">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZyIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48Y2lyY2xlIGN4PSIxMCIgY3k9IjEwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDcpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2cpIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIvPjwvc3ZnPg==')] opacity-40" />
          <div className="relative">
            <p className="text-white/70 text-sm font-medium mb-1">
              {getGreeting(lang)}
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
              {tx('Dein Dashboard auf einen Blick', 'Your Dashboard at a Glance', lang)}
            </h2>
            <p className="text-white/60 text-sm">
              {new Date().toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
              })}
            </p>
          </div>
        </section>

        {/* ── 1. Top KPI Row ── */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {topKPIs.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div
                key={idx}
                className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 p-5 hover:shadow-lg transition-all duration-200"
              >
                <div className={`absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 rounded-full ${kpi.bgGlow} blur-2xl`} />
                <div className="relative">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {kpi.value}
                  </div>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {kpi.label}
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* ── 2. Dashboard Navigation Cards ── */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-gray-400" />
            {tx('Deine Dashboards', 'Your Dashboards', lang)}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardCards.map(card => {
              const Icon = card.icon;
              const kpis = getCardKPIs(card.id);
              const active = hasData(card.id);
              return (
                <button
                  key={card.id}
                  onClick={() => window.open(card.route, '_blank')}
                  className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border-l-4 ${card.borderAccent} border border-gray-200/60 dark:border-gray-800/60 p-5 text-left hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-black/20 transition-all duration-200 hover:-translate-y-0.5`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.accentColor} flex items-center justify-center shadow-md`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                          {lang === 'de' ? card.name.de : card.name.en}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {lang === 'de' ? card.description.de : card.description.en}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${active ? 'bg-green-500 shadow-sm shadow-green-500/50' : 'bg-gray-300 dark:bg-gray-600'}`} />
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors group-hover:translate-x-0.5 transform" />
                    </div>
                  </div>

                  {/* KPIs */}
                  <div className="flex gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                    {kpis.map((kpi, idx) => (
                      <div key={idx}>
                        <div className="text-base font-bold text-gray-900 dark:text-white">
                          {kpi.value}
                        </div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {kpi.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Alle Seiten ── */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-gray-400" />
            {tx('Alle Seiten', 'All Pages', lang)}
          </h2>
          <div className="space-y-4">
            {[
              {
                cat: { de: 'Landing Pages', en: 'Landing Pages' },
                pages: [
                  { route: '/', name: { de: 'Startseite', en: 'Home' }, icon: Sparkles },
                  { route: '/lp', name: { de: 'Landing Page', en: 'Landing Page' }, icon: FileText },
                  { route: '/ap', name: { de: 'Apple Style', en: 'Apple Style' }, icon: Zap },
                ],
              },
              {
                cat: { de: 'Formulare & Tools', en: 'Forms & Tools' },
                pages: [
                  { route: '/kostenlose-beratung', name: { de: 'Kostenlose Beratung', en: 'Free Consultation' }, icon: MessageSquare },
                  { route: '/onboarding', name: { de: 'Onboarding Formular', en: 'Onboarding Form' }, icon: Users },
                ],
              },
              {
                cat: { de: 'Sonstige', en: 'Other' },
                pages: [
                  { route: '/danke', name: { de: 'Dankeseite', en: 'Thank You Page' }, icon: Sun },
                ],
              },
            ].map(group => (
              <div key={group.cat.de}>
                <h3 className="text-[10px] font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-2 px-1">
                  {lang === 'de' ? group.cat.de : group.cat.en}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.pages.map(page => {
                    const PageIcon = page.icon;
                    return (
                      <button
                        key={page.route}
                        onClick={() => window.open(page.route, '_blank')}
                        className="group flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 text-left hover:shadow-md hover:shadow-gray-200/40 dark:hover:shadow-black/20 transition-all duration-200 hover:-translate-y-0.5"
                      >
                        <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <PageIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {lang === 'de' ? page.name.de : page.name.en}
                          </div>
                          <div className="text-[10px] text-gray-400 dark:text-gray-600 font-mono">{page.route}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 dark:group-hover:text-gray-300 transition-colors group-hover:translate-x-0.5 transform" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 3. Two-Column Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column: Pipeline + Week Overview */}
          <div className="lg:col-span-7 space-y-6">

            {/* Pipeline Summary */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-gray-400" />
                {tx('Pipeline-Übersicht', 'Pipeline Overview', lang)}
              </h2>
              <div className="space-y-4">
                {pipelineData.map(pipeline => (
                  <div
                    key={pipeline.source}
                    className="rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white dark:bg-gray-900 p-5"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {lang === 'de' ? pipeline.label.de : pipeline.label.en}
                      </span>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                        {pipeline.total} {tx('Gesamt', 'Total', lang)}
                      </span>
                    </div>
                    {pipeline.total > 0 ? (
                      <>
                        <div className="flex h-3 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 mb-3">
                          {pipeline.counts.filter(s => s.count > 0).map(s => (
                            <div
                              key={s.key}
                              className={`${s.color} transition-all duration-500 relative group/seg`}
                              style={{ width: `${(s.count / pipeline.total) * 100}%` }}
                              title={`${s.count} ${lang === 'de' ? s.label.de : s.label.en}`}
                            />
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {pipeline.counts.filter(s => s.count > 0).map(s => (
                            <div key={s.key} className="flex items-center gap-1.5">
                              <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {s.count} {lang === 'de' ? s.label.de : s.label.en}
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-gray-400 dark:text-gray-600 py-3">
                        <p className="mb-1">
                          {pipeline.source === 'flowstack-content-items'
                            ? tx('Erstelle dein erstes Content-Stück im Content Hub.', 'Create your first content piece in Content Hub.', lang)
                            : pipeline.source === 'flowstack-coldmail-campaigns'
                            ? tx('Starte deine erste Cold-Mail-Kampagne.', 'Start your first cold mail campaign.', lang)
                            : pipeline.source === 'flowstack-automation-systems'
                            ? tx('Erstelle deinen ersten Automation-Workflow.', 'Create your first automation workflow.', lang)
                            : tx('Keine Daten vorhanden.', 'No data yet.', lang)
                          }
                        </p>
                        <button
                          onClick={() => window.open(
                            pipeline.source === 'flowstack-content-items' ? '/content'
                            : pipeline.source === 'flowstack-coldmail-campaigns' ? '/coldmail'
                            : pipeline.source === 'flowstack-automation-systems' ? '/systems'
                            : '/',
                            '_blank'
                          )}
                          className="text-xs text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium inline-flex items-center gap-1 transition-colors"
                        >
                          {tx('Jetzt starten', 'Get started', lang)}
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Week Overview */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  {tx('Wochenübersicht', 'Week Overview', lang)}
                </h2>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setWeekOffset(w => w - 1)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
                    title={tx('Vorherige Woche', 'Previous week', lang)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setWeekOffset(0)}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                      weekOffset === 0
                        ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                    title={tx('Zur aktuellen Woche', 'Go to current week', lang)}
                  >
                    {tx('Heute', 'Today', lang)}
                  </button>
                  <button
                    onClick={() => setWeekOffset(w => w + 1)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
                    title={tx('Nächste Woche', 'Next week', lang)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day, idx) => {
                  const dayStr = day.toISOString().split('T')[0];
                  const isToday = dayStr === todayStr;
                  const dayItems = weekItems.filter(i => i.scheduledDate?.split('T')[0] === dayStr);

                  return (
                    <div
                      key={idx}
                      className={`rounded-xl border p-2.5 min-h-[140px] transition-all ${
                        isToday
                          ? 'border-indigo-400 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-sm shadow-indigo-200/30 dark:shadow-indigo-900/20'
                          : 'border-gray-200/60 dark:border-gray-800/60 bg-white dark:bg-gray-900'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase">
                          {dayNames[idx]}
                        </span>
                        <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold ${
                          isToday
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {day.getDate()}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {dayItems.map(item => (
                          <button
                            key={item.id}
                            onClick={() => window.open(item.route, '_blank')}
                            title={item.title}
                            className={`w-full text-left px-2 py-1 rounded-lg text-[10px] font-medium truncate hover:opacity-80 transition-opacity ${
                              item.source === 'content' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' :
                              item.source === 'coldmail-campaign' ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300' :
                              'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                            }`}
                          >
                            {item.title}
                          </button>
                        ))}
                        {dayItems.length === 0 && (
                          <div className="text-[10px] text-gray-300 dark:text-gray-700 text-center pt-6">—</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right Column: Activity Feed + Notes */}
          <div className="lg:col-span-5 space-y-6">

            {/* Activity Feed */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-400" />
                {tx('Letzte Aktivitäten', 'Recent Activity', lang)}
              </h2>
              <div className="rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white dark:bg-gray-900 max-h-[420px] overflow-y-auto">
                {groupedActivity.length === 0 ? (
                  <div className="p-8 text-center">
                    <Activity className="w-8 h-8 text-gray-300 dark:text-gray-700 mx-auto mb-2" />
                    <p className="text-sm text-gray-400 dark:text-gray-600">
                      {tx('Noch keine Aktivitäten', 'No activity yet', lang)}
                    </p>
                  </div>
                ) : (
                  groupedActivity.map((group, gi) => (
                    <div key={gi}>
                      <div className="sticky top-0 z-10 px-4 py-2 bg-gray-50/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                          {group.label}
                        </span>
                      </div>
                      {group.items.map(item => (
                        <button
                          key={`${item.source}-${item.id}`}
                          onClick={() => window.open(item.route, '_blank')}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-start gap-3 border-b border-gray-50 dark:border-gray-800/50 last:border-b-0"
                        >
                          <span className={`mt-0.5 inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${sourceColors[item.source] || 'bg-gray-100 text-gray-600'}`}>
                            {item.sourceLabel}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900 dark:text-white truncate" title={item.title}>
                                {item.title}
                              </span>
                              {item.status && (
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium ${statusColors[item.status] || 'bg-gray-100 text-gray-600'}`}>
                                  {item.status}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                              {item.isNew
                                ? tx('Erstellt', 'Created', lang)
                                : tx('Aktualisiert', 'Updated', lang)
                              }
                              {' · '}
                              {formatRelativeTime(item.sortDate, lang)}
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-gray-400 mt-1 flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Weekly Notes */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Save className="w-5 h-5 text-gray-400" />
                {tx('Wochenplanung', 'Weekly Planning', lang)}
              </h2>
              <div className="rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white dark:bg-gray-900 p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {tx('KW', 'CW', lang)} {(() => {
                      const d = new Date(currentWeekStart + 'T00:00:00');
                      const oneJan = new Date(d.getFullYear(), 0, 1);
                      return Math.ceil((((d.getTime() - oneJan.getTime()) / 86400000) + oneJan.getDay() + 1) / 7);
                    })()}
                    {' · '}
                    {new Date(currentWeekStart + 'T00:00:00').toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', { day: 'numeric', month: 'short' })}
                    {' – '}
                    {(() => {
                      const end = new Date(currentWeekStart + 'T00:00:00');
                      end.setDate(end.getDate() + 6);
                      return end.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', { day: 'numeric', month: 'short' });
                    })()}
                  </span>
                  {(currentNote || savedFlash) && (
                    <span className={`text-[10px] font-medium flex items-center gap-1 transition-all ${savedFlash ? 'text-emerald-500 dark:text-emerald-400' : 'text-green-600 dark:text-green-400'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${savedFlash ? 'bg-emerald-500' : 'bg-green-500'}`} />
                      {savedFlash ? tx('Gespeichert!', 'Saved!', lang) : tx('Gespeichert', 'Saved', lang)}
                    </span>
                  )}
                </div>
                <textarea
                  value={noteText}
                  onChange={e => handleNoteChange(e.target.value)}
                  placeholder={tx(
                    'Was steht diese Woche an? z.B. 2 LinkedIn Posts, YouTube Video schneiden...',
                    'What\'s planned this week? e.g. 2 LinkedIn posts, edit YouTube video...',
                    lang
                  )}
                  className="w-full h-36 p-3 text-sm bg-gray-50 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-700/60 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                />

                {/* Older notes */}
                {olderNotes.length > 0 && (
                  <div className="mt-3">
                    <button
                      onClick={() => setShowOlderNotes(!showOlderNotes)}
                      className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                      title={tx(
                        showOlderNotes ? 'Frühere Notizen ausblenden' : 'Frühere Notizen anzeigen',
                        showOlderNotes ? 'Hide older notes' : 'Show older notes',
                        lang
                      )}
                    >
                      {showOlderNotes ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      {tx(`${olderNotes.length} frühere Notizen`, `${olderNotes.length} older notes`, lang)}
                    </button>
                    {showOlderNotes && (
                      <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                        {olderNotes.map(note => (
                          <div
                            key={note.id}
                            className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800"
                          >
                            <div className="text-[10px] text-gray-400 dark:text-gray-600 mb-1 font-medium">
                              {new Date(note.weekStart + 'T00:00:00').toLocaleDateString(
                                lang === 'de' ? 'de-DE' : 'en-US',
                                { day: 'numeric', month: 'short', year: 'numeric' }
                              )}
                            </div>
                            <div className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                              {note.text}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>

          </div>
        </div>

      </main>
    </div>
  );
}

// ============================================
// PAGE EXPORT
// ============================================

export default function HubDashboardPage() {
  return (
    <LanguageProvider>
      <HubDashboardContent />
    </LanguageProvider>
  );
}
