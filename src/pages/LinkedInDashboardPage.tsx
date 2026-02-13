/**
 * LinkedIn Dashboard - FULLY FUNCTIONAL
 * Outreach, Posts, Message Templates mit A/B Testing
 */

import { useState, useEffect, useMemo, useRef, useCallback, ReactNode } from "react";
import {
  loadLinkedinCampaigns, saveLinkedinCampaigns,
  loadLinkedinPosts, saveLinkedinPosts,
  loadLinkedinLeads, saveLinkedinLeads,
  loadLinkedinTemplates, saveLinkedinTemplates,
  loadLinkedinSequences, saveLinkedinSequences,
} from '../data/linkedinStorage';
import {
  TrendingUp,
  Users,
  Target,
  BarChart3,
  ArrowUpRight,
  Calendar,
  ChevronDown,
  RefreshCw,
  Download,
  Settings,
  Bell,
  Search,
  Activity,
  Check,
  MessageSquare,
  UserPlus,
  UserCheck,
  Heart,
  Send,
  Edit3,
  Trash2,
  Play,
  Pause,
  Sun,
  Moon,
  Image,
  FileText,
  Video,
  LayoutGrid,
  ExternalLink,
  Award,
  Sparkles,
  X,
  Plus,
  Copy,
  Mail,
  Filter,
  GitBranch,
  Upload,
  Inbox,
  Link,
  Clock,
  Shield,
  Zap,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ArrowDownCircle,
  Globe,
  Layers,
} from "lucide-react";
import { LanguageProvider, useLanguage } from '../i18n/LanguageContext';
import ConfirmDialog, { useModalEsc } from '../components/ui/ConfirmDialog';

// ============================================
// TYPES
// ============================================
interface OutreachCampaign {
  id: string;
  name: string;
  status: "active" | "paused" | "completed";
  connectionsSent: number;
  connectionsAccepted: number;
  messagesSent: number;
  messagesReplied: number;
  acceptRate: number;
  replyRate: number;
  leadsGenerated: number;
  startDate: string;
  dailyLimit: number;
  messageTemplateId: string;
}

interface MessageTemplate {
  id: string;
  name: string;
  type: "connection" | "followup1" | "followup2" | "followup3";
  versions: MessageVersion[];
  activeVersionId: string;
}

interface MessageVersion {
  id: string;
  name: string;
  content: string;
  sent: number;
  replied: number;
  replyRate: number;
  isActive: boolean;
}

interface LinkedInPost {
  id: string;
  content: string;
  type: "text" | "image" | "video" | "carousel" | "document";
  status: "published" | "scheduled" | "draft";
  publishedAt: string;
  impressions: number;
  engagements: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  clicks: number;
  engagementRate: number;
}

interface OutreachLead {
  id: string;
  name: string;
  title: string;
  company: string;
  profileUrl: string;
  campaign: string;
  status: "connected" | "messaged" | "replied" | "qualified" | "converted" | "not_interested";
  lastActivity: string;
  notes: string;
  messageHistory: { date: string; type: string; content: string }[];
}

interface Notification {
  id: string;
  type: "connection" | "reply" | "engagement" | "milestone";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

type ActiveSection = "dashboard" | "outreach" | "messages" | "posts" | "leads" | "analytics" | "scheduler" | "settings" | "sequences" | "inbox" | "import";
type DateRange = "today" | "7d" | "30d" | "90d" | "6m" | "12m" | "custom";
type PostFilter = "all" | "published" | "scheduled" | "draft";

// Automation Sequences
interface SequenceStep {
  id: string;
  type: 'connection_request' | 'message' | 'inmail' | 'profile_visit' | 'endorse' | 'like' | 'follow';
  content?: string;
  delay: { value: number; unit: 'hours' | 'days' };
  condition?: 'if_accepted' | 'if_not_accepted' | 'if_replied' | 'if_not_replied' | 'always';
}

interface AutomationSequence {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'draft';
  steps: SequenceStep[];
  stopOnReply: boolean;
  totalLeads: number;
  completedLeads: number;
  replyRate: number;
  createdAt: string;
}

// Smart Inbox
interface InboxMessage {
  id: string;
  content: string;
  sentAt: string;
  isOutgoing: boolean;
  isScheduled?: boolean;
  scheduledFor?: string;
}

interface InboxConversation {
  id: string;
  contactName: string;
  contactTitle: string;
  contactCompany: string;
  lastMessage: string;
  lastMessageAt: string;
  isUnread: boolean;
  isArchived: boolean;
  messages: InboxMessage[];
}

// Import
interface ImportedLead {
  id: string;
  name: string;
  title: string;
  company: string;
  industry: string;
  location: string;
  profileUrl: string;
  isSelected: boolean;
  isDuplicate: boolean;
  isBlacklisted: boolean;
}

interface BlacklistEntry {
  id: string;
  type: 'person' | 'company';
  value: string;
  reason: string;
  addedAt: string;
}

interface ImportHistoryEntry {
  id: string;
  source: 'sales_navigator' | 'csv' | 'linkedin_search';
  query: string;
  totalFound: number;
  imported: number;
  skipped: number;
  date: string;
}

// Safety & Integrations
interface WebhookConfig {
  id: string;
  event: string;
  url: string;
  isActive: boolean;
}

interface EventTrigger {
  id: string;
  event: 'job_change' | 'birthday' | 'promotion' | 'new_post';
  action: 'message' | 'like' | 'comment';
  templateId: string;
  isActive: boolean;
}

// ============================================
// MOCK DATA
// ============================================
const initialCampaigns: OutreachCampaign[] = [
  { id: "1", name: "CEO & Founder DACH", status: "active", connectionsSent: 450, connectionsAccepted: 162, messagesSent: 145, messagesReplied: 48, acceptRate: 36, replyRate: 33.1, leadsGenerated: 12, startDate: "01.01.2025", dailyLimit: 25, messageTemplateId: "1" },
  { id: "2", name: "Marketing Manager Tech", status: "active", connectionsSent: 320, connectionsAccepted: 134, messagesSent: 120, messagesReplied: 42, acceptRate: 41.9, replyRate: 35, leadsGenerated: 8, startDate: "05.01.2025", dailyLimit: 20, messageTemplateId: "2" },
  { id: "3", name: "Sales Director SaaS", status: "paused", connectionsSent: 280, connectionsAccepted: 89, messagesSent: 78, messagesReplied: 19, acceptRate: 31.8, replyRate: 24.4, leadsGenerated: 4, startDate: "10.01.2025", dailyLimit: 15, messageTemplateId: "1" },
  { id: "4", name: "HR Leaders Startup", status: "active", connectionsSent: 180, connectionsAccepted: 72, messagesSent: 65, messagesReplied: 28, acceptRate: 40, replyRate: 43.1, leadsGenerated: 6, startDate: "15.01.2025", dailyLimit: 20, messageTemplateId: "3" },
  { id: "5", name: "E-Commerce Gründer", status: "completed", connectionsSent: 500, connectionsAccepted: 185, messagesSent: 170, messagesReplied: 51, acceptRate: 37, replyRate: 30, leadsGenerated: 15, startDate: "20.12.2024", dailyLimit: 25, messageTemplateId: "2" },
];

const initialTemplates: MessageTemplate[] = [
  {
    id: "1",
    name: "CEO Outreach",
    type: "connection",
    activeVersionId: "1a",
    versions: [
      { id: "1a", name: "Version A", content: "Hallo {{firstName}},\n\nich bin beeindruckt von {{company}} und würde mich gerne vernetzen.\n\nViele Grüße", sent: 245, replied: 89, replyRate: 36.3, isActive: true },
      { id: "1b", name: "Version B", content: "Hi {{firstName}},\n\nals Fellow-Gründer finde ich {{company}} sehr spannend. Lass uns connecten!\n\nBeste Grüße", sent: 205, replied: 73, replyRate: 35.6, isActive: false },
    ]
  },
  {
    id: "2",
    name: "Follow-up 1",
    type: "followup1",
    activeVersionId: "2a",
    versions: [
      { id: "2a", name: "Version A", content: "Hi {{firstName}},\n\ndanke fürs Vernetzen! Ich helfe Unternehmen wie {{company}} dabei, ihre LinkedIn-Präsenz zu skalieren.\n\nHättest du 15 Min für einen kurzen Austausch?", sent: 312, replied: 98, replyRate: 31.4, isActive: true },
      { id: "2b", name: "Version B", content: "Hey {{firstName}},\n\nschön, dass wir vernetzt sind! Kurze Frage: Nutzt ihr bei {{company}} LinkedIn aktiv für Lead-Gen?\n\nWürde mich interessieren.", sent: 288, replied: 112, replyRate: 38.9, isActive: false },
    ]
  },
  {
    id: "3",
    name: "Follow-up 2",
    type: "followup2",
    activeVersionId: "3a",
    versions: [
      { id: "3a", name: "Version A", content: "Hi {{firstName}},\n\nich wollte nochmal nachhaken. Wir haben gerade einige Case Studies von Unternehmen wie {{company}} veröffentlicht.\n\nSoll ich dir eine schicken?", sent: 156, replied: 42, replyRate: 26.9, isActive: true },
    ]
  },
  {
    id: "4",
    name: "HR Spezifisch",
    type: "connection",
    activeVersionId: "4a",
    versions: [
      { id: "4a", name: "Version A", content: "Hallo {{firstName}},\n\nRecruiting über LinkedIn wird immer wichtiger. Würde mich freuen, mich mit HR-Experten wie dir zu vernetzen!\n\nLG", sent: 180, replied: 72, replyRate: 40.0, isActive: true },
      { id: "4b", name: "Version B", content: "Hi {{firstName}},\n\nich sehe, du bist im HR-Bereich bei {{company}} tätig. Spannend! Lass uns connecten.\n\nBeste Grüße", sent: 95, replied: 41, replyRate: 43.2, isActive: false },
      { id: "4c", name: "Version C (Test)", content: "Moin {{firstName}}! 👋\n\nHR trifft auf Tech – ich finde das Thema super spannend. Connect?\n\nCheers", sent: 45, replied: 22, replyRate: 48.9, isActive: false },
    ]
  },
];

const initialPosts: LinkedInPost[] = [
  { id: "1", content: "5 Fehler die 90% aller Startups bei LinkedIn Ads machen...", type: "carousel", status: "published", publishedAt: "Heute, 09:00", impressions: 12450, engagements: 847, likes: 523, comments: 89, shares: 45, saves: 156, clicks: 234, engagementRate: 6.8 },
  { id: "2", content: "Wie wir unseren ROAS von 2x auf 5x gesteigert haben - Ein Thread 🧵", type: "text", status: "published", publishedAt: "Gestern, 11:30", impressions: 8920, engagements: 612, likes: 412, comments: 67, shares: 28, saves: 89, clicks: 156, engagementRate: 6.9 },
  { id: "3", content: "Behind the Scenes: So sieht unser Marketing Dashboard aus", type: "image", status: "published", publishedAt: "20.01.2025", impressions: 15680, engagements: 1234, likes: 834, comments: 156, shares: 89, saves: 234, clicks: 321, engagementRate: 7.9 },
  { id: "4", content: "Video: 3 LinkedIn Hacks die sofort mehr Reichweite bringen", type: "video", status: "published", publishedAt: "18.01.2025", impressions: 24500, engagements: 1890, likes: 1234, comments: 245, shares: 178, saves: 312, clicks: 521, engagementRate: 7.7 },
  { id: "5", content: "Case Study PDF: Wie Kunde X 150 Leads in 30 Tagen generiert hat", type: "document", status: "published", publishedAt: "15.01.2025", impressions: 6780, engagements: 456, likes: 287, comments: 45, shares: 34, saves: 178, clicks: 412, engagementRate: 6.7 },
  { id: "6", content: "Warum Personal Branding der wichtigste Marketing-Kanal 2025 ist", type: "text", status: "scheduled", publishedAt: "Morgen, 09:00", impressions: 0, engagements: 0, likes: 0, comments: 0, shares: 0, saves: 0, clicks: 0, engagementRate: 0 },
  { id: "7", content: "Infografik: Der perfekte LinkedIn Post (Struktur + Beispiele)", type: "carousel", status: "draft", publishedAt: "-", impressions: 0, engagements: 0, likes: 0, comments: 0, shares: 0, saves: 0, clicks: 0, engagementRate: 0 },
];

const initialLeads: OutreachLead[] = [
  { id: "1", name: "Thomas Müller", title: "CEO", company: "TechStartup GmbH", profileUrl: "#", campaign: "CEO & Founder DACH", status: "qualified", lastActivity: "Heute, 14:30", notes: "Interesse an Demo", messageHistory: [{ date: "20.01", type: "connection", content: "Anfrage gesendet" }, { date: "21.01", type: "accepted", content: "Verbindung angenommen" }, { date: "21.01", type: "followup1", content: "Erste Nachricht gesendet" }, { date: "22.01", type: "reply", content: "Hat geantwortet - interessiert" }] },
  { id: "2", name: "Sarah Weber", title: "Head of Marketing", company: "SaaS Solutions AG", profileUrl: "#", campaign: "Marketing Manager Tech", status: "replied", lastActivity: "Heute, 11:15", notes: "Termin nächste Woche", messageHistory: [{ date: "18.01", type: "connection", content: "Anfrage gesendet" }, { date: "19.01", type: "accepted", content: "Verbindung angenommen" }, { date: "20.01", type: "followup1", content: "Erste Nachricht gesendet" }, { date: "23.01", type: "reply", content: "Termin vereinbart" }] },
  { id: "3", name: "Michael Schmidt", title: "Founder", company: "E-Commerce Pro", profileUrl: "#", campaign: "E-Commerce Gründer", status: "converted", lastActivity: "Gestern", notes: "Kunde geworden!", messageHistory: [{ date: "10.01", type: "connection", content: "Anfrage gesendet" }, { date: "11.01", type: "accepted", content: "Verbindung angenommen" }, { date: "12.01", type: "followup1", content: "Erste Nachricht" }, { date: "15.01", type: "reply", content: "Interesse bekundet" }, { date: "18.01", type: "call", content: "Demo gehalten" }, { date: "22.01", type: "converted", content: "Vertrag unterschrieben" }] },
  { id: "4", name: "Lisa Hoffmann", title: "Sales Director", company: "Growth Inc.", profileUrl: "#", campaign: "Sales Director SaaS", status: "messaged", lastActivity: "Vor 2 Tagen", notes: "Follow-up senden", messageHistory: [{ date: "19.01", type: "connection", content: "Anfrage gesendet" }, { date: "20.01", type: "accepted", content: "Verbindung angenommen" }, { date: "21.01", type: "followup1", content: "Erste Nachricht gesendet" }] },
  { id: "5", name: "David Koch", title: "CMO", company: "Digital Agency", profileUrl: "#", campaign: "Marketing Manager Tech", status: "connected", lastActivity: "Vor 3 Tagen", notes: "Erste Nachricht senden", messageHistory: [{ date: "20.01", type: "connection", content: "Anfrage gesendet" }, { date: "22.01", type: "accepted", content: "Verbindung angenommen" }] },
  { id: "6", name: "Anna Fischer", title: "HR Director", company: "Startup Hub", profileUrl: "#", campaign: "HR Leaders Startup", status: "not_interested", lastActivity: "Vor 1 Woche", notes: "Kein Bedarf aktuell", messageHistory: [{ date: "15.01", type: "connection", content: "Anfrage gesendet" }, { date: "16.01", type: "accepted", content: "Verbindung angenommen" }, { date: "17.01", type: "followup1", content: "Erste Nachricht" }, { date: "18.01", type: "reply", content: "Kein Interesse" }] },
];

const liNotificationData: Record<string, { de: { title: string; message: string; time: string }; en: { title: string; message: string; time: string } }> = {
  "1": { de: { title: "Neue Antwort", message: "Thomas Müller hat auf deine Nachricht geantwortet", time: "Vor 5 Min" }, en: { title: "New reply", message: "Thomas Müller replied to your message", time: "5 min ago" } },
  "2": { de: { title: "Verbindung akzeptiert", message: "Sarah Weber hat deine Anfrage angenommen", time: "Vor 1 Std" }, en: { title: "Connection accepted", message: "Sarah Weber accepted your request", time: "1 hr ago" } },
  "3": { de: { title: "Post viral!", message: "Dein Carousel hat 10.000+ Impressionen erreicht", time: "Vor 2 Std" }, en: { title: "Post viral!", message: "Your carousel reached 10,000+ impressions", time: "2 hrs ago" } },
  "4": { de: { title: "Meilenstein", message: "100 neue Verbindungen diese Woche!", time: "Vor 3 Std" }, en: { title: "Milestone", message: "100 new connections this week!", time: "3 hrs ago" } },
};
const initialNotifications: Notification[] = [
  { id: "1", type: "reply", title: "Neue Antwort", message: "Thomas Müller hat auf deine Nachricht geantwortet", time: "Vor 5 Min", read: false },
  { id: "2", type: "connection", title: "Verbindung akzeptiert", message: "Sarah Weber hat deine Anfrage angenommen", time: "Vor 1 Std", read: false },
  { id: "3", type: "engagement", title: "Post viral!", message: "Dein Carousel hat 10.000+ Impressionen erreicht", time: "Vor 2 Std", read: false },
  { id: "4", type: "milestone", title: "Meilenstein", message: "100 neue Verbindungen diese Woche!", time: "Vor 3 Std", read: true },
];

const statusColors: Record<string, { bg: string; text: string }> = {
  connected: { bg: "bg-blue-100 dark:bg-blue-500/20", text: "text-blue-600" },
  messaged: { bg: "bg-purple-100 dark:bg-purple-500/20", text: "text-purple-600" },
  replied: { bg: "bg-emerald-100 dark:bg-emerald-500/20", text: "text-emerald-600" },
  qualified: { bg: "bg-orange-100 dark:bg-orange-500/20", text: "text-orange-600" },
  converted: { bg: "bg-green-100 dark:bg-green-500/20", text: "text-green-600" },
  not_interested: { bg: "bg-gray-100 dark:bg-gray-500/20", text: "text-gray-600" },
};

const getStatusLabels = (lang: string): Record<string, string> => lang === 'de' ? {
  connected: "Verbunden", messaged: "Angeschrieben", replied: "Geantwortet",
  qualified: "Qualifiziert", converted: "Konvertiert", not_interested: "Kein Interesse",
} : {
  connected: "Connected", messaged: "Messaged", replied: "Replied",
  qualified: "Qualified", converted: "Converted", not_interested: "Not Interested",
};

const postTypeIcons: Record<string, ReactNode> = {
  text: <FileText className="w-4 h-4" />,
  image: <Image className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />,
  carousel: <LayoutGrid className="w-4 h-4" />,
  document: <FileText className="w-4 h-4" />,
};

const getPostTypeLabels = (lang: string): Record<string, string> => lang === 'de' ? { text: "Text", image: "Bild", video: "Video", carousel: "Carousel", document: "Dokument" } : { text: "Text", image: "Image", video: "Video", carousel: "Carousel", document: "Document" };

const initialSequences: AutomationSequence[] = [
  {
    id: "seq1", name: "CEO DACH Outreach", status: "active", stopOnReply: true, totalLeads: 245, completedLeads: 142, replyRate: 34.2, createdAt: "01.01.2025",
    steps: [
      { id: "s1a", type: "profile_visit", delay: { value: 0, unit: "hours" }, condition: "always" },
      { id: "s1b", type: "connection_request", content: "Hallo {{firstName}}, als Fellow-Unternehmer finde ich {{company}} sehr spannend. Lass uns connecten!", delay: { value: 1, unit: "days" }, condition: "always" },
      { id: "s1c", type: "message", content: "Hi {{firstName}}, danke fürs Vernetzen! Ich helfe Unternehmen wie {{company}} dabei, ihre LinkedIn-Präsenz zu skalieren. Hättest du 15 Min für einen kurzen Austausch?", delay: { value: 2, unit: "days" }, condition: "if_accepted" },
      { id: "s1d", type: "like", delay: { value: 1, unit: "days" }, condition: "if_not_replied" },
      { id: "s1e", type: "message", content: "Hi {{firstName}}, wollte nochmal nachhaken - wir haben gerade einige Case Studies veröffentlicht. Soll ich dir eine schicken?", delay: { value: 4, unit: "days" }, condition: "if_not_replied" },
    ]
  },
  {
    id: "seq2", name: "Marketing Manager Warm-up", status: "paused", stopOnReply: true, totalLeads: 180, completedLeads: 67, replyRate: 28.5, createdAt: "10.01.2025",
    steps: [
      { id: "s2a", type: "profile_visit", delay: { value: 0, unit: "hours" }, condition: "always" },
      { id: "s2b", type: "like", delay: { value: 12, unit: "hours" }, condition: "always" },
      { id: "s2c", type: "endorse", delay: { value: 1, unit: "days" }, condition: "always" },
      { id: "s2d", type: "connection_request", content: "Hi {{firstName}}, mir gefällt was du bei {{company}} im Marketing machst. Lass uns vernetzen!", delay: { value: 1, unit: "days" }, condition: "always" },
      { id: "s2e", type: "message", content: "Hey {{firstName}}, danke fürs Connecten! Nutzt ihr bei {{company}} schon LinkedIn Outreach automatisiert?", delay: { value: 3, unit: "days" }, condition: "if_accepted" },
      { id: "s2f", type: "inmail", content: "Hi {{firstName}}, ich wollte mich kurz vorstellen - wir helfen Marketing-Teams bei der LinkedIn Lead-Gen. Kurzer Call?", delay: { value: 5, unit: "days" }, condition: "if_not_accepted" },
    ]
  },
  {
    id: "seq3", name: "Event Follow-up SaaS", status: "draft", stopOnReply: false, totalLeads: 0, completedLeads: 0, replyRate: 0, createdAt: "20.01.2025",
    steps: [
      { id: "s3a", type: "connection_request", content: "Hi {{firstName}}, wir haben uns auf der SaaS Conference getroffen. War super spannend mit dir zu sprechen!", delay: { value: 0, unit: "hours" }, condition: "always" },
      { id: "s3b", type: "message", content: "Hey {{firstName}}, schön dass wir jetzt vernetzt sind! Wie besprochen, hier der Link zu unserem Tool: flowstack.com", delay: { value: 1, unit: "days" }, condition: "if_accepted" },
      { id: "s3c", type: "message", content: "Hi {{firstName}}, hattest du schon die Chance, dir das anzuschauen? Würde mich über dein Feedback freuen.", delay: { value: 3, unit: "days" }, condition: "if_not_replied" },
      { id: "s3d", type: "follow", delay: { value: 5, unit: "days" }, condition: "if_not_replied" },
    ]
  },
];

const initialConversations: InboxConversation[] = [
  {
    id: "conv1", contactName: "Thomas Müller", contactTitle: "CEO", contactCompany: "TechStartup GmbH",
    lastMessage: "Ja, klingt super! Lass uns einen Termin machen.", lastMessageAt: "Vor 5 Min", isUnread: true, isArchived: false,
    messages: [
      { id: "m1a", content: "Hallo Thomas, als Fellow-Unternehmer finde ich TechStartup GmbH sehr spannend. Lass uns connecten!", sentAt: "20.01, 09:00", isOutgoing: true },
      { id: "m1b", content: "Hi! Danke für die Anfrage. Was genau macht ihr bei Flowstack?", sentAt: "20.01, 14:30", isOutgoing: false },
      { id: "m1c", content: "Wir helfen Unternehmen ihre LinkedIn-Präsenz zu skalieren und automatisiert Leads zu generieren. Hättest du 15 Min für einen kurzen Austausch?", sentAt: "21.01, 09:15", isOutgoing: true },
      { id: "m1d", content: "Ja, klingt super! Lass uns einen Termin machen.", sentAt: "21.01, 16:45", isOutgoing: false },
    ]
  },
  {
    id: "conv2", contactName: "Sarah Weber", contactTitle: "Head of Marketing", contactCompany: "SaaS Solutions AG",
    lastMessage: "Schicke dir gleich den Calendly-Link!", lastMessageAt: "Vor 1 Std", isUnread: true, isArchived: false,
    messages: [
      { id: "m2a", content: "Hi Sarah, mir gefällt was du bei SaaS Solutions im Marketing machst. Lass uns vernetzen!", sentAt: "18.01, 10:00", isOutgoing: true },
      { id: "m2b", content: "Danke! Vernetzen wir uns gerne.", sentAt: "18.01, 11:30", isOutgoing: false },
      { id: "m2c", content: "Super! Nutzt ihr bei SaaS Solutions schon LinkedIn Outreach automatisiert?", sentAt: "19.01, 09:00", isOutgoing: true },
      { id: "m2d", content: "Noch nicht wirklich, wir machen das aktuell manuell. Wie macht ihr das?", sentAt: "19.01, 15:00", isOutgoing: false },
      { id: "m2e", content: "Wir haben da ein Tool gebaut das genau dabei hilft. Soll ich dir in einem kurzen Call zeigen wie das funktioniert?", sentAt: "20.01, 09:00", isOutgoing: true },
      { id: "m2f", content: "Ja, sehr gerne! Wann hättest du Zeit?", sentAt: "20.01, 12:00", isOutgoing: false },
      { id: "m2g", content: "Schicke dir gleich den Calendly-Link!", sentAt: "20.01, 12:15", isOutgoing: true },
    ]
  },
  {
    id: "conv3", contactName: "Michael Schmidt", contactTitle: "Founder", contactCompany: "E-Commerce Pro",
    lastMessage: "Die Case Study hat mich überzeugt. Lasst uns starten!", lastMessageAt: "Gestern", isUnread: false, isArchived: false,
    messages: [
      { id: "m3a", content: "Hi Michael, als E-Commerce Gründer interessiert dich bestimmt wie man über LinkedIn Kunden gewinnt. Lass uns vernetzen!", sentAt: "10.01, 09:00", isOutgoing: true },
      { id: "m3b", content: "Klar, bin immer offen für Networking!", sentAt: "10.01, 16:00", isOutgoing: false },
      { id: "m3c", content: "Super! Wir haben gerade eine Case Study veröffentlicht: 150 Leads in 30 Tagen für einen E-Commerce Store. Soll ich sie dir schicken?", sentAt: "12.01, 09:00", isOutgoing: true },
      { id: "m3d", content: "Ja bitte, das klingt interessant!", sentAt: "12.01, 10:30", isOutgoing: false },
      { id: "m3e", content: "Hier ist der Link: flowstack.com/case-study. Was denkst du?", sentAt: "12.01, 11:00", isOutgoing: true },
      { id: "m3f", content: "Die Case Study hat mich überzeugt. Lasst uns starten!", sentAt: "15.01, 09:00", isOutgoing: false },
    ]
  },
  {
    id: "conv4", contactName: "Lisa Hoffmann", contactTitle: "Sales Director", contactCompany: "Growth Inc.",
    lastMessage: "Danke für die Info, ich melde mich nächste Woche.", lastMessageAt: "Vor 2 Tagen", isUnread: false, isArchived: false,
    messages: [
      { id: "m4a", content: "Hi Lisa, als Sales Director kennst du sicher die Herausforderung gute Leads zu finden. Lass uns connecten!", sentAt: "19.01, 09:00", isOutgoing: true },
      { id: "m4b", content: "Hi! Ja, das ist immer ein Thema. Gerne connecten!", sentAt: "19.01, 14:00", isOutgoing: false },
      { id: "m4c", content: "Danke für die Info, ich melde mich nächste Woche.", sentAt: "21.01, 10:00", isOutgoing: false },
    ]
  },
  {
    id: "conv5", contactName: "David Koch", contactTitle: "CMO", contactCompany: "Digital Agency",
    lastMessage: "Vielen Dank, aber aktuell kein Bedarf.", lastMessageAt: "Vor 5 Tagen", isUnread: false, isArchived: true,
    messages: [
      { id: "m5a", content: "Hi David, als CMO einer Digital Agency bist du sicher an innovativen Marketing-Tools interessiert. Lass uns vernetzen!", sentAt: "15.01, 09:00", isOutgoing: true },
      { id: "m5b", content: "Hi, ja gerne!", sentAt: "15.01, 12:00", isOutgoing: false },
      { id: "m5c", content: "Cool! Wir helfen Agenturen wie euch bei der LinkedIn Lead-Gen. Hättest du 15 Min?", sentAt: "16.01, 09:00", isOutgoing: true },
      { id: "m5d", content: "Vielen Dank, aber aktuell kein Bedarf.", sentAt: "16.01, 15:00", isOutgoing: false },
    ]
  },
];

const initialImportedLeads: ImportedLead[] = [
  { id: "il1", name: "Alexander Braun", title: "CTO", company: "CloudTech GmbH", industry: "Software", location: "Berlin", profileUrl: "#", isSelected: false, isDuplicate: false, isBlacklisted: false },
  { id: "il2", name: "Julia Krause", title: "VP Sales", company: "ScaleUp AG", industry: "SaaS", location: "München", profileUrl: "#", isSelected: false, isDuplicate: false, isBlacklisted: false },
  { id: "il3", name: "Stefan Wolf", title: "CEO", company: "DataDriven GmbH", industry: "Analytics", location: "Hamburg", profileUrl: "#", isSelected: false, isDuplicate: true, isBlacklisted: false },
  { id: "il4", name: "Maria Lang", title: "Head of Growth", company: "FinTech Solutions", industry: "Finance", location: "Frankfurt", profileUrl: "#", isSelected: false, isDuplicate: false, isBlacklisted: false },
  { id: "il5", name: "Peter Richter", title: "Founder", company: "Konkurrenz GmbH", industry: "Marketing", location: "Köln", profileUrl: "#", isSelected: false, isDuplicate: false, isBlacklisted: true },
  { id: "il6", name: "Katrin Neumann", title: "CMO", company: "RetailPro GmbH", industry: "E-Commerce", location: "Stuttgart", profileUrl: "#", isSelected: false, isDuplicate: false, isBlacklisted: false },
  { id: "il7", name: "Markus Becker", title: "Sales Director", company: "SaaS Solutions AG", industry: "SaaS", location: "Düsseldorf", profileUrl: "#", isSelected: false, isDuplicate: true, isBlacklisted: false },
  { id: "il8", name: "Sandra Klein", title: "COO", company: "GreenEnergy AG", industry: "Energy", location: "Bremen", profileUrl: "#", isSelected: false, isDuplicate: false, isBlacklisted: false },
];

const initialBlacklist: BlacklistEntry[] = [
  { id: "bl1", type: "company", value: "Konkurrenz GmbH", reason: "Wettbewerber", addedAt: "01.01.2025" },
  { id: "bl2", type: "company", value: "Spam Corp", reason: "Unseriös", addedAt: "05.01.2025" },
  { id: "bl3", type: "person", value: "Peter Richter", reason: "Ausdrücklich gewünscht", addedAt: "10.01.2025" },
];

const initialImportHistory: ImportHistoryEntry[] = [
  { id: "ih1", source: "sales_navigator", query: "CEO DACH SaaS", totalFound: 450, imported: 420, skipped: 30, date: "20.01.2025" },
  { id: "ih2", source: "csv", query: "konferenz-teilnehmer.csv", totalFound: 120, imported: 115, skipped: 5, date: "18.01.2025" },
  { id: "ih3", source: "linkedin_search", query: "Marketing Manager Berlin", totalFound: 280, imported: 260, skipped: 20, date: "15.01.2025" },
  { id: "ih4", source: "sales_navigator", query: "HR Director Startup", totalFound: 190, imported: 180, skipped: 10, date: "10.01.2025" },
];

const initialWebhooks: WebhookConfig[] = [
  { id: "wh1", event: "new_lead", url: "https://hooks.zapier.com/hooks/catch/123456/abcdef", isActive: true },
  { id: "wh2", event: "reply_received", url: "https://hooks.zapier.com/hooks/catch/123456/ghijkl", isActive: true },
  { id: "wh3", event: "connection_accepted", url: "https://api.hubspot.com/webhooks/v1/abc123", isActive: false },
];

const initialEventTriggers: EventTrigger[] = [
  { id: "et1", event: "job_change", action: "message", templateId: "1", isActive: true },
  { id: "et2", event: "birthday", action: "message", templateId: "2", isActive: true },
  { id: "et3", event: "new_post", action: "like", templateId: "1", isActive: false },
];

const formatNumber = (v: number) => v >= 1000000 ? (v / 1000000).toFixed(1) + "M" : v >= 1000 ? (v / 1000).toFixed(1) + "K" : v.toString();

/** Consistent date formatting helper — pass lang from component context */
const formatDate = (dateStr: string, lang: string) => {
  // Skip relative dates like "Vor 5 Min", "Heute, 09:00", "Gestern", "Morgen, 09:00", "-"
  if (!dateStr || dateStr === '-' || /^(Vor |Heute|Gestern|Morgen|Gerade|Just now)/i.test(dateStr) || /^\d+ (min|hr|hrs|std|tag|days?|woche)/i.test(dateStr)) return dateStr;
  // Try parsing "DD.MM.YYYY" format
  const dotMatch = dateStr.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (dotMatch) {
    const d = new Date(Number(dotMatch[3]), Number(dotMatch[2]) - 1, Number(dotMatch[1]));
    if (!isNaN(d.getTime())) return d.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  // Try parsing ISO or other standard formats
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });
  return dateStr;
};

const exportCSV = (data: object[], filename: string) => {
  const headers = Object.keys(data[0] || {});
  const csv = [headers.join(","), ...data.map(row => headers.map(h => (row as Record<string, unknown>)[h]).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

// ============================================
// COMPONENTS
// ============================================

// Custom Dropdown
const CustomDropdown = <T extends string>({ value, onChange, options, icon }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; icon?: ReactNode }) => {
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

// Notification Dropdown
const NotificationDropdown = ({ notifications, onMarkRead, onClear }: { notifications: Notification[]; onMarkRead: (id: string) => void; onClear: () => void }) => {
  const { lang } = useLanguage();
  const tx = (de: string, en: string) => lang === 'de' ? de : en;
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;
  const iconMap: Record<string, ReactNode> = { connection: <UserCheck className="w-4 h-4 text-sky-500" />, reply: <MessageSquare className="w-4 h-4 text-emerald-500" />, engagement: <Heart className="w-4 h-4 text-pink-500" />, milestone: <Award className="w-4 h-4 text-amber-500" /> };
  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
        <Bell className="w-5 h-5 text-gray-500" />
        {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{unreadCount}</span>}
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-semibold">{tx("Benachrichtigungen", "Notifications")}</h3>
              {notifications.length > 0 && <button onClick={onClear} className="text-xs text-gray-500 hover:text-gray-700">{tx("Alle löschen", "Clear all")}</button>}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? <div className="p-6 text-center text-gray-400">{tx("Keine Benachrichtigungen", "No notifications")}</div> : notifications.map(n => {
                const nd = liNotificationData[n.id]?.[lang] || { title: n.title, message: n.message, time: n.time };
                return (
                <div key={n.id} onClick={() => onMarkRead(n.id)} className={`p-4 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${!n.read ? "bg-sky-50/50 dark:bg-sky-500/5" : ""}`}>
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{iconMap[n.type]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2"><p className="font-medium text-sm">{nd.title}</p>{!n.read && <div className="w-2 h-2 bg-sky-500 rounded-full" />}</div>
                      <p className="text-sm text-gray-500 truncate">{nd.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{nd.time}</p>
                    </div>
                  </div>
                </div>
              );})}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Campaign Modal
const CampaignModal = ({ campaign, templates, onClose, onAction }: { campaign: OutreachCampaign | null; templates: MessageTemplate[]; onClose: () => void; onAction: (action: string, id: string, data?: unknown) => void }) => {
  const { lang } = useLanguage();
  const tx = (de: string, en: string) => lang === 'de' ? de : en;
  const [editLimit, setEditLimit] = useState(campaign?.dailyLimit || 25);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  useModalEsc(!!campaign, onClose);
  if (!campaign) return null;
  const template = templates.find(t => t.id === campaign.messageTemplateId);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl" title={tx("Schließen", "Close")}><X className="w-5 h-5 text-gray-400" /></button>
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-4 h-4 rounded-full ${campaign.status === "active" ? "bg-emerald-500" : campaign.status === "paused" ? "bg-yellow-500" : "bg-gray-400"}`} />
          <h2 className="text-2xl font-bold">{campaign.name}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4"><p className="text-xs text-gray-500 mb-1">{tx("Anfragen", "Requests")}</p><p className="text-2xl font-bold">{campaign.connectionsSent}</p></div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4"><p className="text-xs text-gray-500 mb-1">{tx("Verbunden", "Connected")}</p><p className="text-2xl font-bold text-sky-500">{campaign.connectionsAccepted}</p><p className="text-xs text-emerald-500">{campaign.acceptRate}%</p></div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4"><p className="text-xs text-gray-500 mb-1">{tx("Antworten", "Replies")}</p><p className="text-2xl font-bold text-purple-500">{campaign.messagesReplied}</p><p className="text-xs text-emerald-500">{campaign.replyRate}%</p></div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4"><p className="text-xs text-gray-500 mb-1">{tx("Leads", "Leads")}</p><p className="text-2xl font-bold text-orange-500">{campaign.leadsGenerated}</p></div>
        </div>
        {template && (
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">{tx("Verwendete Nachricht", "Used message")}</p>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{template.name}</span>
                <span className="text-xs px-2 py-1 bg-sky-100 text-sky-600 rounded-full">{template.versions.find(v => v.id === template.activeVersionId)?.name}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{template.versions.find(v => v.id === template.activeVersionId)?.content}</p>
            </div>
          </div>
        )}
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-2">{tx("Tägliches Limit", "Daily limit")}</p>
          <div className="flex items-center gap-4">
            <input type="range" min="5" max="50" value={editLimit} onChange={e => setEditLimit(Number(e.target.value))} className="flex-1" />
            <span className="font-bold w-12 text-right">{editLimit}</span>
            <button onClick={() => onAction("updateLimit", campaign.id, editLimit)} className="px-4 py-2 bg-sky-500 text-white rounded-xl text-sm font-medium hover:bg-sky-600">{tx("Speichern", "Save")}</button>
          </div>
        </div>
        <div className="flex gap-3">
          {campaign.status === "active" ? (
            <button onClick={() => { onAction("pause", campaign.id); onClose(); }} className="flex-1 py-3 bg-yellow-100 text-yellow-700 font-medium rounded-xl hover:bg-yellow-200 flex items-center justify-center gap-2"><Pause className="w-4 h-4" />{tx("Pausieren", "Pause")}</button>
          ) : campaign.status === "paused" ? (
            <button onClick={() => { onAction("resume", campaign.id); onClose(); }} className="flex-1 py-3 bg-emerald-100 text-emerald-700 font-medium rounded-xl hover:bg-emerald-200 flex items-center justify-center gap-2"><Play className="w-4 h-4" />{tx("Fortsetzen", "Resume")}</button>
          ) : null}
          <button onClick={() => { onAction("duplicate", campaign.id); onClose(); }} className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium rounded-xl hover:bg-gray-200 flex items-center justify-center gap-2"><Copy className="w-4 h-4" />{tx("Duplizieren", "Duplicate")}</button>
          <button onClick={() => setShowDeleteConfirm(true)} className="py-3 px-6 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 flex items-center justify-center gap-2" title={tx("Kampagne löschen", "Delete campaign")}><Trash2 className="w-4 h-4" /></button>
        </div>
        <ConfirmDialog
          open={showDeleteConfirm}
          title={tx("Kampagne löschen?", "Delete campaign?")}
          message={tx("Diese Kampagne und alle zugehörigen Daten werden unwiderruflich gelöscht.", "This campaign and all associated data will be permanently deleted.")}
          confirmLabel={tx("Löschen", "Delete")}
          cancelLabel={tx("Abbrechen", "Cancel")}
          variant="danger"
          onConfirm={() => { setShowDeleteConfirm(false); onAction("delete", campaign.id); onClose(); }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      </div>
    </div>
  );
};

// Lead Modal
const LeadModal = ({ lead, onClose, onStatusChange, onSaveNotes, onSendMessage, onDelete }: { lead: OutreachLead | null; onClose: () => void; onStatusChange: (id: string, status: string) => void; onSaveNotes: (id: string, notes: string) => void; onSendMessage: (lead: OutreachLead) => void; onDelete: (id: string) => void }) => {
  const { lang } = useLanguage();
  const tx = (de: string, en: string) => lang === 'de' ? de : en;
  const statusLabels = getStatusLabels(lang);
  const [notes, setNotes] = useState(lead?.notes || "");
  const [notesSaved, setNotesSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  useModalEsc(!!lead, onClose);

  useEffect(() => {
    setNotes(lead?.notes || "");
    setNotesSaved(false);
  }, [lead]);

  // Ctrl+S / Cmd+S to save notes
  useEffect(() => {
    if (!lead) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        onSaveNotes(lead.id, notes);
        setNotesSaved(true);
        setTimeout(() => setNotesSaved(false), 2000);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lead, notes, onSaveNotes]);

  if (!lead) return null;

  const handleSaveNotes = () => {
    onSaveNotes(lead.id, notes);
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl" title={tx("Schließen", "Close")}><X className="w-5 h-5 text-gray-400" /></button>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-sky-500 flex items-center justify-center text-white text-2xl font-bold">{lead.name.charAt(0)}</div>
          <div>
            <h2 className="text-2xl font-bold">{lead.name}</h2>
            <p className="text-gray-500">{lead.title} @ {lead.company}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"><p className="text-xs text-gray-500 mb-1">{tx("Kampagne", "Campaign")}</p><p className="font-medium">{lead.campaign}</p></div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"><p className="text-xs text-gray-500 mb-1">{tx("Letzte Aktivität", "Last activity")}</p><p className="font-medium">{lead.lastActivity}</p></div>
        </div>
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-3">{tx("Status ändern", "Change status")}</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(statusLabels).map(([key, label]) => (
              <button key={key} onClick={() => { onStatusChange(lead.id, key); }} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${lead.status === key ? `${statusColors[key].bg} ${statusColors[key].text}` : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{label}</button>
            ))}
          </div>
        </div>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">{tx("Notizen", "Notes")}</p>
            <button onClick={handleSaveNotes} className={`px-3 py-1 text-sm rounded-lg transition-colors ${notesSaved ? "bg-emerald-100 text-emerald-600" : "bg-sky-100 text-sky-600 hover:bg-sky-200"}`}>
              {notesSaved ? <><Check className="w-3 h-3 inline mr-1" />{tx("Gespeichert", "Saved")}</> : tx("Speichern", "Save")}
            </button>
          </div>
          <textarea className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm resize-none focus:ring-2 focus:ring-sky-500 outline-none" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder={tx("Notizen hinzufügen...", "Add notes...")} />
        </div>
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-3">{tx("Nachrichtenverlauf", "Message history")}</p>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {lead.messageHistory.map((msg, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className={`w-2 h-2 mt-2 rounded-full ${msg.type === "reply" || msg.type === "converted" ? "bg-emerald-500" : msg.type === "accepted" ? "bg-sky-500" : "bg-gray-400"}`} />
                <div>
                  <p className="text-sm font-medium">{msg.content}</p>
                  <p className="text-xs text-gray-400">{msg.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <a href={lead.profileUrl} target="_blank" rel="noopener noreferrer" className="flex-1 py-3 bg-sky-500 text-white font-medium rounded-xl hover:bg-sky-600 flex items-center justify-center gap-2"><ExternalLink className="w-4 h-4" />{tx("Profil öffnen", "Open profile")}</a>
          <button onClick={() => onSendMessage(lead)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium rounded-xl hover:bg-gray-200 flex items-center justify-center gap-2"><Mail className="w-4 h-4" />{tx("Nachricht", "Message")}</button>
          <button onClick={() => setShowDeleteConfirm(true)} className="py-3 px-4 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100" title={tx("Lead löschen", "Delete lead")}><Trash2 className="w-4 h-4" /></button>
        </div>
        <ConfirmDialog
          open={showDeleteConfirm}
          title={tx("Lead löschen?", "Delete lead?")}
          message={tx("Dieser Lead wird unwiderruflich gelöscht.", "This lead will be permanently deleted.")}
          confirmLabel={tx("Löschen", "Delete")}
          cancelLabel={tx("Abbrechen", "Cancel")}
          variant="danger"
          onConfirm={() => { setShowDeleteConfirm(false); onDelete(lead.id); onClose(); }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      </div>
    </div>
  );
};

// Message Template Editor Modal
const TemplateModal = ({ template, onClose, onSave, onDelete }: { template: MessageTemplate | null; onClose: () => void; onSave: (template: MessageTemplate) => void; onDelete: (id: string) => void }) => {
  const { lang } = useLanguage();
  const tx = (de: string, en: string) => lang === 'de' ? de : en;
  const [editTemplate, setEditTemplate] = useState<MessageTemplate | null>(template);
  const [selectedVersion, setSelectedVersion] = useState<string>(template?.activeVersionId || "");
  const templateTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  useModalEsc(!!template, onClose);

  useEffect(() => {
    setEditTemplate(template);
    setSelectedVersion(template?.activeVersionId || "");
  }, [template]);

  // Ctrl+S / Cmd+S to save
  useEffect(() => {
    if (!editTemplate) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        onSave(editTemplate);
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [editTemplate, onSave, onClose]);

  if (!editTemplate) return null;

  const handleVersionChange = (versionId: string, content: string) => {
    setEditTemplate({
      ...editTemplate,
      versions: editTemplate.versions.map(v => v.id === versionId ? { ...v, content } : v)
    });
  };

  const handleAddVersion = () => {
    const newVersion: MessageVersion = {
      id: `${editTemplate.id}${String.fromCharCode(97 + editTemplate.versions.length)}`,
      name: `Version ${String.fromCharCode(65 + editTemplate.versions.length)}`,
      content: "",
      sent: 0,
      replied: 0,
      replyRate: 0,
      isActive: false
    };
    setEditTemplate({ ...editTemplate, versions: [...editTemplate.versions, newVersion] });
  };

  const handleSetActive = (versionId: string) => {
    setEditTemplate({
      ...editTemplate,
      activeVersionId: versionId,
      versions: editTemplate.versions.map(v => ({ ...v, isActive: v.id === versionId }))
    });
  };

  const currentVersion = editTemplate.versions.find(v => v.id === selectedVersion);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-4xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl" title={tx("Schließen", "Close")}><X className="w-5 h-5 text-gray-400" /></button>
        <div className="flex items-center gap-3 mb-6">
          <GitBranch className="w-6 h-6 text-sky-500" />
          <h2 className="text-2xl font-bold">{editTemplate.name}</h2>
          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">{editTemplate.type}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Version List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-500">{tx("Versionen", "Versions")}</p>
              <button onClick={handleAddVersion} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg" title={tx("Version hinzufügen", "Add version")}><Plus className="w-4 h-4 text-gray-500" /></button>
            </div>
            {editTemplate.versions.map(v => (
              <button
                key={v.id}
                onClick={() => setSelectedVersion(v.id)}
                className={`w-full p-4 rounded-xl text-left transition-colors ${selectedVersion === v.id ? "bg-sky-50 dark:bg-sky-500/10 border-2 border-sky-500" : "bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:border-gray-200"}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{v.name}</span>
                  {editTemplate.activeVersionId === v.id && <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-full">{tx("Aktiv", "Active")}</span>}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{v.sent} {tx("gesendet", "sent")}</span>
                  <span className="text-emerald-500">{v.replyRate}% {tx("Antwort", "Reply")}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Editor */}
          <div className="lg:col-span-2">
            {currentVersion && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <input
                    type="text"
                    value={currentVersion.name}
                    onChange={e => setEditTemplate({
                      ...editTemplate,
                      versions: editTemplate.versions.map(v => v.id === currentVersion.id ? { ...v, name: e.target.value } : v)
                    })}
                    className="text-lg font-semibold bg-transparent border-b border-transparent hover:border-gray-300 focus:border-sky-500 outline-none"
                  />
                  {editTemplate.activeVersionId !== currentVersion.id && (
                    <button onClick={() => handleSetActive(currentVersion.id)} className="px-3 py-1 text-sm bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200">{tx("Als aktiv setzen", "Set as active")}</button>
                  )}
                </div>
                {/* Variables Toolbar */}
                <div className="mb-2">
                  <p className="text-xs text-gray-500 mb-2">{tx("Variablen einfügen", "Insert Variables")}</p>
                  <div className="flex flex-wrap gap-2">
                    {["{{firstName}}", "{{company}}", "{{jobTitle}}", "{{industry}}", "{{mutualConnections}}"].map(variable => (
                      <button key={variable} onClick={() => {
                        const textarea = templateTextareaRef.current;
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const text = currentVersion.content;
                          const newContent = text.substring(0, start) + variable + text.substring(end);
                          handleVersionChange(currentVersion.id, newContent);
                          requestAnimationFrame(() => {
                            textarea.focus();
                            const newPos = start + variable.length;
                            textarea.setSelectionRange(newPos, newPos);
                          });
                        } else {
                          handleVersionChange(currentVersion.id, currentVersion.content + variable);
                        }
                      }} className="px-3 py-1.5 bg-sky-50 dark:bg-sky-500/10 text-sky-600 rounded-lg text-xs font-mono hover:bg-sky-100 dark:hover:bg-sky-500/20 transition-colors">{variable}</button>
                    ))}
                  </div>
                </div>
                <textarea
                  ref={templateTextareaRef}
                  value={currentVersion.content}
                  onChange={e => handleVersionChange(currentVersion.id, e.target.value)}
                  className="w-full h-48 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm resize-none focus:ring-2 focus:ring-sky-500 outline-none"
                  placeholder={tx("Nachricht eingeben... Verwende {{firstName}}, {{company}} als Platzhalter", "Enter message... Use {{firstName}}, {{company}} as placeholders")}
                />
                {/* Preview */}
                {currentVersion.content && (
                  <div className="mt-3 p-4 bg-sky-50 dark:bg-sky-500/5 border border-sky-200 dark:border-sky-500/20 rounded-xl">
                    <p className="text-xs text-sky-600 font-medium mb-2">{tx("Vorschau", "Preview")} — Thomas Müller, CEO @ TechStartup GmbH</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {currentVersion.content
                        .replace(/\{\{firstName\}\}/g, "Thomas")
                        .replace(/\{\{company\}\}/g, "TechStartup GmbH")
                        .replace(/\{\{jobTitle\}\}/g, "CEO")
                        .replace(/\{\{industry\}\}/g, "Software")
                        .replace(/\{\{mutualConnections\}\}/g, "12")
                      }
                    </p>
                  </div>
                )}
                <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Send className="w-4 h-4" />{currentVersion.sent} {tx("gesendet", "sent")}</span>
                  <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4" />{tx(`${currentVersion.replied} Antworten`, `${currentVersion.replied} replies`)}</span>
                  <span className="flex items-center gap-1 text-emerald-500"><TrendingUp className="w-4 h-4" />{currentVersion.replyRate}% {tx("Reply-Rate", "Reply rate")}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
          <button onClick={() => { onSave(editTemplate); onClose(); }} className="flex-1 py-3 bg-sky-500 text-white font-medium rounded-xl hover:bg-sky-600">{tx("Speichern", "Save")}</button>
          <button onClick={onClose} className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium rounded-xl hover:bg-gray-200">{tx("Abbrechen", "Cancel")}</button>
          <button onClick={() => setShowDeleteConfirm(true)} className="py-3 px-4 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100" title={tx("Template löschen", "Delete template")}><Trash2 className="w-4 h-4" /></button>
        </div>
        <ConfirmDialog
          open={showDeleteConfirm}
          title={tx("Template löschen?", "Delete template?")}
          message={tx("Dieses Template wird unwiderruflich gelöscht.", "This template will be permanently deleted.")}
          confirmLabel={tx("Löschen", "Delete")}
          cancelLabel={tx("Abbrechen", "Cancel")}
          variant="danger"
          onConfirm={() => { setShowDeleteConfirm(false); onDelete(editTemplate.id); onClose(); }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      </div>
    </div>
  );
};

// Post Modal
const PostModal = ({ post, onClose, onAction }: { post: LinkedInPost | null; onClose: () => void; onAction: (action: string, id: string) => void }) => {
  const { lang } = useLanguage();
  const tx = (de: string, en: string) => lang === 'de' ? de : en;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  useModalEsc(!!post, onClose);
  if (!post) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-2xl w-full mx-4 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl" title={tx("Schließen", "Close")}><X className="w-5 h-5 text-gray-400" /></button>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">{postTypeIcons[post.type]}</div>
          <div>
            <span className={`text-xs px-2 py-1 rounded-full ${post.status === "published" ? "bg-emerald-100 text-emerald-600" : post.status === "scheduled" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}`}>
              {post.status === "published" ? tx("Veröffentlicht", "Published") : post.status === "scheduled" ? tx("Geplant", "Scheduled") : tx("Entwurf", "Draft")}
            </span>
            <p className="text-sm text-gray-500 mt-1">{formatDate(post.publishedAt, lang)}</p>
          </div>
        </div>
        <p className="text-lg mb-6">{post.content}</p>
        {post.status === "published" && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center"><p className="text-2xl font-bold">{formatNumber(post.impressions)}</p><p className="text-xs text-gray-500">{tx("Impressionen", "Impressions")}</p></div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center"><p className="text-2xl font-bold">{formatNumber(post.likes)}</p><p className="text-xs text-gray-500">{tx("Likes", "Likes")}</p></div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center"><p className="text-2xl font-bold">{post.comments}</p><p className="text-xs text-gray-500">{tx("Kommentare", "Comments")}</p></div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-sky-500">{post.engagementRate}%</p><p className="text-xs text-gray-500">{tx("Engagement", "Engagement")}</p></div>
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={() => { onAction("edit", post.id); onClose(); }} className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium rounded-xl hover:bg-gray-200 flex items-center justify-center gap-2"><Edit3 className="w-4 h-4" />{tx("Bearbeiten", "Edit")}</button>
          <button onClick={() => { onAction("duplicate", post.id); onClose(); }} className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium rounded-xl hover:bg-gray-200 flex items-center justify-center gap-2"><Copy className="w-4 h-4" />{tx("Duplizieren", "Duplicate")}</button>
          <button onClick={() => setShowDeleteConfirm(true)} className="py-3 px-6 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100" title={tx("Post löschen", "Delete post")}><Trash2 className="w-4 h-4" /></button>
        </div>
        <ConfirmDialog
          open={showDeleteConfirm}
          title={tx("Post löschen?", "Delete post?")}
          message={tx("Dieser Post wird unwiderruflich gelöscht.", "This post will be permanently deleted.")}
          confirmLabel={tx("Löschen", "Delete")}
          cancelLabel={tx("Abbrechen", "Cancel")}
          variant="danger"
          onConfirm={() => { setShowDeleteConfirm(false); onAction("delete", post.id); onClose(); }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      </div>
    </div>
  );
};

// New Campaign Modal
const NewCampaignModal = ({ isOpen, templates, onClose, onCreate }: { isOpen: boolean; templates: MessageTemplate[]; onClose: () => void; onCreate: (name: string, templateId: string, limit: number) => void }) => {
  const { lang } = useLanguage();
  const tx = (de: string, en: string) => lang === 'de' ? de : en;
  const [name, setName] = useState("");
  const [templateId, setTemplateId] = useState(templates[0]?.id || "");
  const [dailyLimit, setDailyLimit] = useState(25);
  useModalEsc(isOpen, onClose);

  if (!isOpen) return null;

  const handleCreate = () => {
    if (name.trim()) {
      onCreate(name.trim(), templateId, dailyLimit);
      setName("");
      setDailyLimit(25);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-lg w-full mx-4 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl" title={tx("Schließen", "Close")}><X className="w-5 h-5 text-gray-400" /></button>
        <h2 className="text-2xl font-bold mb-6">{tx("Neue Kampagne erstellen", "Create new campaign")}</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500 block mb-2">{tx("Kampagnenname", "Campaign name")}</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={tx("z.B. CEO & Founder DACH", "e.g. CEO & Founder DACH")} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
          </div>
          <div>
            <label className="text-sm text-gray-500 block mb-2">{tx("Nachrichten-Template", "Message template")}</label>
            <select value={templateId} onChange={e => setTemplateId(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 hover:border-gray-300 dark:hover:border-gray-600 outline-none transition-colors">
              {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-500 block mb-2">{tx("Tägliches Limit", "Daily limit")}: {dailyLimit}</label>
            <input type="range" min="5" max="50" value={dailyLimit} onChange={e => setDailyLimit(Number(e.target.value))} className="w-full" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={handleCreate} className="flex-1 py-3 bg-sky-500 text-white font-medium rounded-xl hover:bg-sky-600">{tx("Kampagne erstellen", "Create campaign")}</button>
          <button onClick={onClose} className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium rounded-xl hover:bg-gray-200">{tx("Abbrechen", "Cancel")}</button>
        </div>
      </div>
    </div>
  );
};

// New Template Modal
const NewTemplateModal = ({ isOpen, onClose, onCreate }: { isOpen: boolean; onClose: () => void; onCreate: (name: string, type: MessageTemplate["type"]) => void }) => {
  const { lang } = useLanguage();
  const tx = (de: string, en: string) => lang === 'de' ? de : en;
  const [name, setName] = useState("");
  const [type, setType] = useState<MessageTemplate["type"]>("connection");
  useModalEsc(isOpen, onClose);

  if (!isOpen) return null;

  const handleCreate = () => {
    if (name.trim()) {
      onCreate(name.trim(), type);
      setName("");
      setType("connection");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-lg w-full mx-4 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl" title={tx("Schließen", "Close")}><X className="w-5 h-5 text-gray-400" /></button>
        <h2 className="text-2xl font-bold mb-6">{tx("Neues Template erstellen", "Create new template")}</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500 block mb-2">{tx("Template-Name", "Template name")}</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={tx("z.B. Sales Outreach", "e.g. Sales Outreach")} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
          </div>
          <div>
            <label className="text-sm text-gray-500 block mb-2">{tx("Template-Typ", "Template type")}</label>
            <div className="grid grid-cols-2 gap-2">
              {([["connection", tx("Verbindungsanfrage", "Connection request")], ["followup1", "Follow-up 1"], ["followup2", "Follow-up 2"], ["followup3", "Follow-up 3"]] as const).map(([value, label]) => (
                <button key={value} onClick={() => setType(value)} className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${type === value ? "bg-sky-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200"}`}>{label}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={handleCreate} className="flex-1 py-3 bg-sky-500 text-white font-medium rounded-xl hover:bg-sky-600">{tx("Template erstellen", "Create template")}</button>
          <button onClick={onClose} className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium rounded-xl hover:bg-gray-200">{tx("Abbrechen", "Cancel")}</button>
        </div>
      </div>
    </div>
  );
};

// Post Editor Modal with Media Upload
const PostEditorModal = ({ post, isOpen, onClose, onSave }: { post: LinkedInPost | null; isOpen: boolean; onClose: () => void; onSave: (post: LinkedInPost) => void }) => {
  const { lang } = useLanguage();
  const tx = (de: string, en: string) => lang === 'de' ? de : en;
  useModalEsc(isOpen, onClose);
  const [content, setContent] = useState(post?.content || "");
  const [type, setType] = useState<LinkedInPost["type"]>(post?.type || "text");
  const [status, setStatus] = useState<LinkedInPost["status"]>(post?.status || "draft");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("09:00");
  const [mediaFiles, setMediaFiles] = useState<{ file: File; preview: string }[]>([]);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (post) {
      setContent(post.content);
      setType(post.type);
      setStatus(post.status);
    } else {
      setContent("");
      setType("text");
      setStatus("draft");
    }
    setMediaFiles([]);
  }, [post, isOpen]);

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      mediaFiles.forEach(m => URL.revokeObjectURL(m.preview));
    };
  }, [mediaFiles]);

  if (!isOpen && !post) return null;
  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    addFiles(Array.from(files));
  };

  const addFiles = (files: File[]) => {
    const newMedia = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    if (type === "carousel") {
      setMediaFiles(prev => [...prev, ...newMedia].slice(0, 10)); // Max 10 for carousel
    } else {
      setMediaFiles(newMedia.slice(0, 1)); // Single file for image/video/document
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const getAcceptType = () => {
    switch (type) {
      case "image": return "image/*";
      case "video": return "video/*";
      case "document": return ".pdf,.doc,.docx,.ppt,.pptx";
      case "carousel": return "image/*";
      default: return "";
    }
  };

  const handleSave = () => {
    const newPost: LinkedInPost = post ? {
      ...post,
      content,
      type,
      status,
      publishedAt: status === "scheduled" ? `${scheduledDate}, ${scheduledTime}` : post.publishedAt,
    } : {
      id: Date.now().toString(),
      content,
      type,
      status,
      publishedAt: status === "scheduled" ? `${scheduledDate}, ${scheduledTime}` : status === "draft" ? "-" : new Date().toLocaleDateString("de-DE"),
      impressions: 0,
      engagements: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      clicks: 0,
      engagementRate: 0,
    };
    onSave(newPost);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl" title={tx("Schließen", "Close")}><X className="w-5 h-5 text-gray-400" /></button>
        <h2 className="text-2xl font-bold mb-6">{post ? tx("Post bearbeiten", "Edit post") : tx("Neuer Post", "New post")}</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500 block mb-2">{tx("Inhalt", "Content")}</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} placeholder={tx("Was möchtest du teilen?", "What do you want to share?")} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none resize-none h-32" />
          </div>
          <div>
            <label className="text-sm text-gray-500 block mb-2">{tx("Post-Typ", "Post type")}</label>
            <div className="flex flex-wrap gap-2">
              {([["text", "Text", <FileText key="t" className="w-4 h-4" />], ["image", tx("Bild", "Image"), <Image key="i" className="w-4 h-4" />], ["video", "Video", <Video key="v" className="w-4 h-4" />], ["carousel", "Carousel", <LayoutGrid key="c" className="w-4 h-4" />], ["document", tx("Dokument", "Document"), <FileText key="d" className="w-4 h-4" />]] as const).map(([value, label, icon]) => (
                <button key={value} onClick={() => { setType(value); setMediaFiles([]); }} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${type === value ? "bg-sky-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200"}`}>{icon}{label}</button>
              ))}
            </div>
          </div>

          {/* Media Upload Area */}
          {type !== "text" && (
            <div>
              <label className="text-sm text-gray-500 block mb-2">
                {type === "image" ? tx("Bild hochladen", "Upload image") : type === "video" ? tx("Video hochladen", "Upload video") : type === "carousel" ? tx("Bilder hochladen (max. 10)", "Upload images (max. 10)") : tx("Dokument hochladen", "Upload document")}
              </label>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-6 transition-colors ${dragActive ? "border-sky-500 bg-sky-50 dark:bg-sky-500/10" : "border-gray-200 dark:border-gray-700 hover:border-gray-300"}`}
              >
                <input
                  type="file"
                  accept={getAcceptType()}
                  multiple={type === "carousel"}
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="text-center">
                  <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                    {tx("Dateien hierher ziehen oder", "Drag files here or")} <span className="text-sky-500 font-medium">{tx("durchsuchen", "browse")}</span>
                  </p>
                  <p className="text-xs text-gray-400">
                    {type === "image" && tx("PNG, JPG, GIF bis 5MB", "PNG, JPG, GIF up to 5MB")}
                    {type === "video" && tx("MP4, MOV bis 200MB", "MP4, MOV up to 200MB")}
                    {type === "carousel" && tx("PNG, JPG bis 5MB pro Bild", "PNG, JPG up to 5MB per image")}
                    {type === "document" && tx("PDF, DOC, PPT bis 10MB", "PDF, DOC, PPT up to 10MB")}
                  </p>
                </div>
              </div>

              {/* Media Preview */}
              {mediaFiles.length > 0 && (
                <div className={`mt-4 ${type === "carousel" ? "grid grid-cols-4 gap-2" : ""}`}>
                  {mediaFiles.map((media, index) => (
                    <div key={index} className="relative group">
                      {(type === "image" || type === "carousel") && (
                        <img src={media.preview} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover rounded-xl" />
                      )}
                      {type === "video" && (
                        <video src={media.preview} className="w-full h-48 object-cover rounded-xl" controls />
                      )}
                      {type === "document" && (
                        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                          <FileText className="w-10 h-10 text-sky-500" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{media.file.name}</p>
                            <p className="text-xs text-gray-500">{(media.file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                      )}
                      <button
                        onClick={() => removeMedia(index)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title={tx("Entfernen", "Remove")}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {type === "carousel" && mediaFiles.length < 10 && (
                    <label className="h-32 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center cursor-pointer hover:border-sky-500 transition-colors">
                      <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
                      <Plus className="w-8 h-8 text-gray-400" />
                    </label>
                  )}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="text-sm text-gray-500 block mb-2">{tx("Status", "Status")}</label>
            <div className="flex gap-2">
              {([["draft", tx("Entwurf", "Draft")], ["scheduled", tx("Geplant", "Scheduled")], ["published", tx("Veröffentlichen", "Publish")]] as const).map(([value, label]) => (
                <button key={value} onClick={() => setStatus(value)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${status === value ? "bg-sky-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200"}`}>{label}</button>
              ))}
            </div>
          </div>
          {status === "scheduled" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500 block mb-2">{tx("Datum", "Date")}</label>
                <input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
              </div>
              <div>
                <label className="text-sm text-gray-500 block mb-2">{tx("Uhrzeit", "Time")}</label>
                <input type="time" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={handleSave} disabled={!content.trim()} className="flex-1 py-3 bg-sky-500 text-white font-medium rounded-xl hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed">{post ? tx("Speichern", "Save") : tx("Post erstellen", "Create post")}</button>
          <button onClick={onClose} className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium rounded-xl hover:bg-gray-200">{tx("Abbrechen", "Cancel")}</button>
        </div>
      </div>
    </div>
  );
};

// Message Modal
const MessageModal = ({ data, onClose, onSend }: { data: { lead: OutreachLead; message: string } | null; onClose: () => void; onSend: (leadId: string, message: string) => void }) => {
  const { lang } = useLanguage();
  const tx = (de: string, en: string) => lang === 'de' ? de : en;
  const [message, setMessage] = useState("");
  useModalEsc(!!data, onClose);

  useEffect(() => {
    setMessage(data?.message || "");
  }, [data]);

  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-lg w-full mx-4 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl" title={tx("Schließen", "Close")}><X className="w-5 h-5 text-gray-400" /></button>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center text-white text-xl font-bold">{data.lead.name.charAt(0)}</div>
          <div>
            <h2 className="text-xl font-bold">{tx("Nachricht an", "Message to")} {data.lead.name}</h2>
            <p className="text-sm text-gray-500">{data.lead.title} @ {data.lead.company}</p>
          </div>
        </div>
        <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder={tx("Deine Nachricht...", "Your message...")} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none resize-none h-32 mb-4" />
        <div className="flex gap-3">
          <button onClick={() => { onSend(data.lead.id, message); setMessage(""); }} disabled={!message.trim()} className="flex-1 py-3 bg-sky-500 text-white font-medium rounded-xl hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"><Send className="w-4 h-4" />{tx("Senden", "Send")}</button>
          <button onClick={onClose} className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium rounded-xl hover:bg-gray-200">{tx("Abbrechen", "Cancel")}</button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
const LinkedInDashboardContent = () => {
  const { lang, setLang } = useLanguage();
  const tx = (de: string, en: string) => lang === 'de' ? de : en;
  const statusLabels = getStatusLabels(lang);
  const postTypeLabels = getPostTypeLabels(lang);
  const [dateRange, setDateRange] = useState<DateRange>("7d");
  const [customDateFrom, setCustomDateFrom] = useState(() => { const d = new Date(); d.setDate(d.getDate() - 14); return d.toISOString().split("T")[0]; });
  const [customDateTo, setCustomDateTo] = useState(() => new Date().toISOString().split("T")[0]);
  const [section, setSection] = useState<ActiveSection>("dashboard");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [postFilter, setPostFilter] = useState<PostFilter>("all");
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>("all");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Data State
  const [notifications, setNotifications] = useState(initialNotifications);
  const [campaigns, setCampaigns] = useState(() => { const s = loadLinkedinCampaigns<OutreachCampaign>(); return s.length ? s : initialCampaigns; });
  const [templates, setTemplates] = useState(() => { const s = loadLinkedinTemplates<MessageTemplate>(); return s.length ? s : initialTemplates; });
  const [posts, setPosts] = useState(() => { const s = loadLinkedinPosts<LinkedInPost>(); return s.length ? s : initialPosts; });
  const [leads, setLeads] = useState(() => { const s = loadLinkedinLeads<OutreachLead>(); return s.length ? s : initialLeads; });
  const [settingsData, setSettingsData] = useState({
    dailyConnections: 25,
    dailyMessages: 50,
    dailyViews: 80,
    notifyConnections: true,
    notifyReplies: true,
    notifyEngagement: true,
    dailyReport: false,
  });

  // Modals
  const [selectedCampaign, setSelectedCampaign] = useState<OutreachCampaign | null>(null);
  const [selectedLead, setSelectedLead] = useState<OutreachLead | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [selectedPost, setSelectedPost] = useState<LinkedInPost | null>(null);

  // Create/Edit Modals
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [showNewTemplateModal, setShowNewTemplateModal] = useState(false);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [editingPost, setEditingPost] = useState<LinkedInPost | null>(null);
  const [showMessageModal, setShowMessageModal] = useState<{ lead: OutreachLead; message: string } | null>(null);

  // Sequences
  const [sequences, setSequences] = useState(() => { const s = loadLinkedinSequences<AutomationSequence>(); return s.length ? s : initialSequences; });
  const [selectedSequence, setSelectedSequence] = useState<AutomationSequence | null>(null);
  const [showNewSequenceModal, setShowNewSequenceModal] = useState(false);

  // Inbox
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedConversation, setSelectedConversation] = useState<InboxConversation | null>(null);
  const [inboxFilter, setInboxFilter] = useState<'all' | 'unread' | 'archived'>('all');
  const [inboxReply, setInboxReply] = useState('');

  // Import
  const [importedLeads, setImportedLeads] = useState(initialImportedLeads);
  const [blacklist, setBlacklist] = useState(initialBlacklist);
  const [importHistory, setImportHistory] = useState(initialImportHistory);
  const [importUrl, setImportUrl] = useState('');
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [blacklistFormType, setBlacklistFormType] = useState<'person' | 'company'>('company');
  const [blacklistFormValue, setBlacklistFormValue] = useState('');
  const [blacklistFormReason, setBlacklistFormReason] = useState('');
  const [linkedinSearchUrl, setLinkedinSearchUrl] = useState('');
  const [importSuccessCount, setImportSuccessCount] = useState<number | null>(null);
  const csvFileInputRef = useRef<HTMLInputElement>(null);
  const [crmConnections, setCrmConnections] = useState<Record<string, boolean>>({ HubSpot: false, Salesforce: false, Pipedrive: false, 'Zoho CRM': false });
  const [webhookTestId, setWebhookTestId] = useState<string | null>(null);
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState('');
  const [googleSheetsConnected, setGoogleSheetsConnected] = useState(false);

  // Safety & Integrations
  const [webhooks, setWebhooks] = useState(initialWebhooks);
  const [eventTriggers, setEventTriggers] = useState(initialEventTriggers);
  const [safetySettings, setSafetySettings] = useState({
    warmupEnabled: true,
    warmupStartLimit: 5,
    warmupTargetLimit: 50,
    warmupDays: 14,
    workingHoursStart: '09:00',
    workingHoursEnd: '18:00',
    workingDays: [true, true, true, true, true, false, false],
    minDelay: 30,
    maxDelay: 120,
    accountHealthScore: 87,
  });
  const [settingsTab, setSettingsTab] = useState<'account' | 'safety' | 'integrations' | 'triggers'>('account');

  // ESC key support for inline modals
  useModalEsc(showNewSequenceModal, () => setShowNewSequenceModal(false));
  useModalEsc(showBlacklistModal, () => setShowBlacklistModal(false));

  // Toast notifications
  const [toasts, setToasts] = useState<{id:string;msg:string;type:string}[]>([]);
  const addToast = (msg:string, type='success') => { const id=Date.now().toString(); setToasts(t=>[...t,{id,msg,type}]); setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3000); };

  // Persist data to localStorage
  useEffect(() => { saveLinkedinCampaigns(campaigns); }, [campaigns]);
  useEffect(() => { saveLinkedinTemplates(templates); }, [templates]);
  useEffect(() => { saveLinkedinPosts(posts); }, [posts]);
  useEffect(() => { saveLinkedinLeads(leads); }, [leads]);
  useEffect(() => { saveLinkedinSequences(sequences); }, [sequences]);

  // Date range multiplier
  const dateMultiplier = useMemo(() => {
    if (dateRange === "custom") {
      const from = new Date(customDateFrom);
      const to = new Date(customDateTo);
      const days = Math.max(1, Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)));
      return days / 30;
    }
    const multipliers: Record<string, number> = { today: 0.04, "7d": 0.25, "30d": 1.0, "90d": 2.8, "6m": 5.5, "12m": 11 };
    return multipliers[dateRange] ?? 1;
  }, [dateRange, customDateFrom, customDateTo]);

  // Metrics
  const metrics = useMemo(() => {
    const m = dateMultiplier;
    const totalConnSent = Math.round(campaigns.reduce((s, c) => s + c.connectionsSent, 0) * m);
    const totalConnAccepted = Math.round(campaigns.reduce((s, c) => s + c.connectionsAccepted, 0) * m);
    const totalMsgSent = Math.round(campaigns.reduce((s, c) => s + c.messagesSent, 0) * m);
    const totalMsgReplied = Math.round(campaigns.reduce((s, c) => s + c.messagesReplied, 0) * m);
    const totalLeads = Math.round(campaigns.reduce((s, c) => s + c.leadsGenerated, 0) * m);
    const publishedPosts = posts.filter(p => p.status === "published");
    const totalImpressions = Math.round(publishedPosts.reduce((s, p) => s + p.impressions, 0) * m);
    const totalEngagements = Math.round(publishedPosts.reduce((s, p) => s + p.engagements, 0) * m);
    const avgEngRate = publishedPosts.length > 0 ? publishedPosts.reduce((s, p) => s + p.engagementRate, 0) / publishedPosts.length : 0;
    return { totalConnSent, totalConnAccepted, acceptRate: totalConnSent > 0 ? (totalConnAccepted / totalConnSent) * 100 : 0, totalMsgSent, totalMsgReplied, replyRate: totalMsgSent > 0 ? (totalMsgReplied / totalMsgSent) * 100 : 0, totalLeads, totalImpressions, totalEngagements, avgEngRate, totalPosts: publishedPosts.length };
  }, [campaigns, posts, dateMultiplier]);

  // Filtered Data
  const filteredCampaigns = campaigns.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()));
  const filteredPosts = posts.filter(p => (!search || p.content.toLowerCase().includes(search.toLowerCase())) && (postFilter === "all" || p.status === postFilter));
  const filteredLeads = leads.filter(l =>
    (!search || l.name.toLowerCase().includes(search.toLowerCase()) || l.company.toLowerCase().includes(search.toLowerCase())) &&
    (leadStatusFilter === "all" || l.status === leadStatusFilter)
  );

  // Handlers
  const handleRefresh = () => { setIsLoading(true); setTimeout(() => setIsLoading(false), 1500); };
  const handleMarkRead = (id: string) => setNotifications(n => n.map(x => x.id === id ? { ...x, read: true } : x));
  const handleClearNotifications = () => setNotifications([]);

  const handleCampaignAction = (action: string, id: string, data?: unknown) => {
    if (action === "pause") { setCampaigns(c => c.map(x => x.id === id ? { ...x, status: "paused" } : x)); addToast(tx("Kampagne pausiert", "Campaign paused")); }
    else if (action === "resume") { setCampaigns(c => c.map(x => x.id === id ? { ...x, status: "active" } : x)); addToast(tx("Kampagne fortgesetzt", "Campaign resumed")); }
    else if (action === "delete") { setCampaigns(c => c.filter(x => x.id !== id)); addToast(tx("Kampagne gelöscht", "Campaign deleted")); }
    else if (action === "duplicate") {
      const orig = campaigns.find(c => c.id === id);
      if (orig) { setCampaigns(c => [...c, { ...orig, id: Date.now().toString(), name: orig.name + (lang === 'de' ? " (Kopie)" : " (Copy)"), connectionsSent: 0, connectionsAccepted: 0, messagesSent: 0, messagesReplied: 0, leadsGenerated: 0 }]); addToast(tx("Kampagne dupliziert", "Campaign duplicated")); }
    }
    else if (action === "updateLimit" && typeof data === "number") { setCampaigns(c => c.map(x => x.id === id ? { ...x, dailyLimit: data } : x)); addToast(tx("Limit gespeichert", "Limit saved")); }
  };

  const handleLeadStatusChange = (id: string, status: string) => setLeads(l => l.map(x => x.id === id ? { ...x, status: status as OutreachLead["status"] } : x));

  const handleTemplateUpdate = (template: MessageTemplate) => { setTemplates(t => t.map(x => x.id === template.id ? template : x)); addToast(tx("Template gespeichert", "Template saved")); };
  const handleDeleteTemplate = (id: string) => { setTemplates(t => t.filter(x => x.id !== id)); addToast(tx("Template gelöscht", "Template deleted")); };
  const handleDeleteLead = (id: string) => { setLeads(l => l.filter(x => x.id !== id)); addToast(tx("Lead gelöscht", "Lead deleted")); };

  const handlePostAction = (action: string, id: string) => {
    if (action === "delete") { setPosts(p => p.filter(x => x.id !== id)); addToast(tx("Post gelöscht", "Post deleted")); }
    else if (action === "duplicate") {
      const orig = posts.find(p => p.id === id);
      if (orig) { setPosts(p => [...p, { ...orig, id: Date.now().toString(), status: "draft", publishedAt: "-", impressions: 0, engagements: 0, likes: 0, comments: 0, shares: 0, saves: 0, clicks: 0, engagementRate: 0 }]); addToast(tx("Post dupliziert", "Post duplicated")); }
    } else if (action === "edit") {
      const post = posts.find(p => p.id === id);
      if (post) setEditingPost(post);
    }
  };

  // Create new campaign
  const handleCreateCampaign = (name: string, templateId: string, dailyLimit: number) => {
    const newCampaign: OutreachCampaign = {
      id: Date.now().toString(),
      name,
      status: "active",
      connectionsSent: 0,
      connectionsAccepted: 0,
      messagesSent: 0,
      messagesReplied: 0,
      acceptRate: 0,
      replyRate: 0,
      leadsGenerated: 0,
      startDate: new Date().toLocaleDateString("de-DE"),
      dailyLimit,
      messageTemplateId: templateId,
    };
    setCampaigns(c => [...c, newCampaign]);
    setShowNewCampaignModal(false);
    addToast(tx("Kampagne erstellt", "Campaign created"));
  };

  // Create new template
  const handleCreateTemplate = (name: string, type: MessageTemplate["type"]) => {
    const newTemplate: MessageTemplate = {
      id: Date.now().toString(),
      name,
      type,
      activeVersionId: `${Date.now()}a`,
      versions: [{
        id: `${Date.now()}a`,
        name: "Version A",
        content: "",
        sent: 0,
        replied: 0,
        replyRate: 0,
        isActive: true,
      }],
    };
    setTemplates(t => [...t, newTemplate]);
    setShowNewTemplateModal(false);
    setSelectedTemplate(newTemplate);
    addToast(tx("Template erstellt", "Template created"));
  };

  // Create/Update post
  const handleSavePost = (post: LinkedInPost) => {
    const isNew = !posts.find(p => p.id === post.id);
    if (isNew) {
      setPosts(p => [...p, post]);
      addToast(tx("Post erstellt", "Post created"));
    } else {
      setPosts(p => p.map(x => x.id === post.id ? post : x));
      addToast(tx("Post gespeichert", "Post saved"));
    }
    setEditingPost(null);
    setShowNewPostModal(false);
  };

  // Update lead notes
  const handleUpdateLeadNotes = (id: string, notes: string) => {
    setLeads(l => l.map(x => x.id === id ? { ...x, notes } : x));
  };

  // Send message to lead
  const handleSendMessage = (leadId: string, message: string) => {
    setLeads(l => l.map(x => x.id === leadId ? {
      ...x,
      status: x.status === "connected" ? "messaged" : x.status,
      lastActivity: tx("Gerade eben", "Just now"),
      messageHistory: [...x.messageHistory, { date: new Date().toLocaleDateString("de-DE"), type: "message", content: message }]
    } : x));
    setShowMessageModal(null);
    addToast(tx("Nachricht gesendet", "Message sent"));
  };

  const handleToggleSetting = (key: keyof typeof settingsData) => {
    if (typeof settingsData[key] === "boolean") {
      setSettingsData(s => ({ ...s, [key]: !s[key] }));
    }
  };

  const handleExport = () => {
    if (section === "outreach") exportCSV(campaigns.map(c => ({ name: c.name, status: c.status, sent: c.connectionsSent, accepted: c.connectionsAccepted, replies: c.messagesReplied, leads: c.leadsGenerated })), "linkedin-campaigns.csv");
    else if (section === "leads") exportCSV(leads.map(l => ({ name: l.name, company: l.company, status: l.status, campaign: l.campaign })), "linkedin-leads.csv");
    else if (section === "posts") exportCSV(posts.filter(p => p.status === "published").map(p => ({ content: p.content.slice(0, 50), impressions: p.impressions, engagement: p.engagementRate })), "linkedin-posts.csv");
  };

  // Reset Data
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const handleResetAllData = () => {
    setCampaigns(initialCampaigns);
    setTemplates(initialTemplates);
    setPosts(initialPosts);
    setLeads(initialLeads);
    setNotifications(initialNotifications);
    setSettingsData({ dailyConnections: 25, dailyMessages: 50, dailyViews: 80, notifyConnections: true, notifyReplies: true, notifyEngagement: true, dailyReport: false });
    setSequences(initialSequences);
    setConversations(initialConversations);
    setImportedLeads(initialImportedLeads);
    setBlacklist(initialBlacklist);
    setImportHistory(initialImportHistory);
    setWebhooks(initialWebhooks);
    setEventTriggers(initialEventTriggers);
    setCrmConnections({ HubSpot: false, Salesforce: false, Pipedrive: false, 'Zoho CRM': false });
    setGoogleSheetsUrl('');
    setGoogleSheetsConnected(false);
    setSafetySettings({ warmupEnabled: true, warmupStartLimit: 5, warmupTargetLimit: 50, warmupDays: 14, workingHoursStart: '09:00', workingHoursEnd: '18:00', workingDays: [true, true, true, true, true, false, false], minDelay: 30, maxDelay: 120, accountHealthScore: 87 });
    setShowResetConfirm(false);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  // CSV file upload handler for import
  const handleCsvFileUpload = useCallback((file: File) => {
    const totalFound = Math.floor(Math.random() * 200) + 50;
    const skipped = Math.floor(Math.random() * 15) + 2;
    const imported = totalFound - skipped;
    const newEntry: ImportHistoryEntry = {
      id: Date.now().toString(),
      source: 'csv',
      query: file.name,
      totalFound,
      imported,
      skipped,
      date: new Date().toLocaleDateString("de-DE"),
    };
    setImportHistory(h => [newEntry, ...h]);
  }, []);

  // Dark mode
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  useEffect(() => { document.title = "LinkedIn Dashboard | Flowstack"; }, []);

  useEffect(() => {
    document.documentElement.style.backgroundColor = darkMode ? '#000' : '#f9fafb';
    document.body.style.backgroundColor = darkMode ? '#000' : '#f9fafb';
    return () => {
      document.documentElement.style.removeProperty('background-color');
      document.body.style.removeProperty('background-color');
    };
  }, [darkMode]);

  const customLabel = dateRange === "custom" ? `${customDateFrom} – ${customDateTo}` : "";
  const dateLabels: Record<DateRange, string> = lang === 'de'
    ? { today: "Heute", "7d": "Letzte 7 Tage", "30d": "Letzte 30 Tage", "90d": "Letzte 90 Tage", "6m": "Letzte 6 Monate", "12m": "Letzte 12 Monate", custom: customLabel || "Benutzerdefiniert" }
    : { today: "Today", "7d": "Last 7 days", "30d": "Last 30 days", "90d": "Last 90 days", "6m": "Last 6 months", "12m": "Last 12 months", custom: customLabel || "Custom" };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-[110] flex flex-col gap-2">
          {toasts.map(t => (
            <div key={t.id} className={`px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-in slide-in-from-right fade-in duration-200 ${t.type === 'success' ? 'bg-emerald-500 text-white' : t.type === 'error' ? 'bg-red-500 text-white' : 'bg-gray-800 text-white'}`}>
              {t.msg}
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <CampaignModal campaign={selectedCampaign} templates={templates} onClose={() => setSelectedCampaign(null)} onAction={handleCampaignAction} />
      <LeadModal lead={selectedLead} onClose={() => setSelectedLead(null)} onStatusChange={handleLeadStatusChange} onSaveNotes={handleUpdateLeadNotes} onSendMessage={(lead) => { setSelectedLead(null); setShowMessageModal({ lead, message: "" }); }} onDelete={handleDeleteLead} />
      <TemplateModal template={selectedTemplate} onClose={() => setSelectedTemplate(null)} onSave={handleTemplateUpdate} onDelete={handleDeleteTemplate} />
      <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} onAction={handlePostAction} />
      <NewCampaignModal isOpen={showNewCampaignModal} templates={templates} onClose={() => setShowNewCampaignModal(false)} onCreate={handleCreateCampaign} />
      <NewTemplateModal isOpen={showNewTemplateModal} onClose={() => setShowNewTemplateModal(false)} onCreate={handleCreateTemplate} />
      <PostEditorModal post={editingPost} isOpen={showNewPostModal || !!editingPost} onClose={() => { setShowNewPostModal(false); setEditingPost(null); }} onSave={handleSavePost} />
      <MessageModal data={showMessageModal} onClose={() => setShowMessageModal(null)} onSend={handleSendMessage} />

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 z-40 hidden ${sidebarCollapsed ? '' : 'lg:flex'} flex-col transition-transform duration-300`}>
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </div>
            LinkedIn
          </h1>
          <div className="flex items-center gap-1">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors" title={darkMode ? tx("Heller Modus", "Light mode") : tx("Dunkler Modus", "Dark mode")}>
              {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-500" />}
            </button>
            <button onClick={() => setSidebarCollapsed(true)} className="hidden lg:flex p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors" title={tx("Sidebar einklappen", "Collapse sidebar")}>
              <ChevronLeft className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
        <nav className="px-4 space-y-1 flex-1 overflow-y-auto">
          <p className="text-xs text-gray-400 uppercase font-medium px-4 mb-2">{tx("Übersicht", "Overview")}</p>
          {([
            { icon: <BarChart3 className="w-5 h-5" />, label: "Dashboard", key: "dashboard" },
            { icon: <UserPlus className="w-5 h-5" />, label: tx("Kampagnen", "Campaigns"), key: "outreach" },
            { icon: <MessageSquare className="w-5 h-5" />, label: tx("Nachrichten", "Messages"), key: "messages" },
            { icon: <FileText className="w-5 h-5" />, label: "Posts", key: "posts" },
          ] as const).map(i => (
            <button key={i.key} onClick={() => setSection(i.key)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${section === i.key ? "bg-sky-50 dark:bg-sky-500/10 text-sky-600 font-medium" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>{i.icon}{i.label}</button>
          ))}
          <p className="text-xs text-gray-400 uppercase font-medium px-4 mt-6 mb-2">{tx("Automation", "Automation")}</p>
          {([
            { icon: <GitBranch className="w-5 h-5" />, label: tx("Sequenzen", "Sequences"), key: "sequences" },
            { icon: <Upload className="w-5 h-5" />, label: "Import", key: "import" },
          ] as const).map(i => (
            <button key={i.key} onClick={() => setSection(i.key)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${section === i.key ? "bg-sky-50 dark:bg-sky-500/10 text-sky-600 font-medium" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>{i.icon}{i.label}</button>
          ))}
          <p className="text-xs text-gray-400 uppercase font-medium px-4 mt-6 mb-2">{tx("Pipeline", "Pipeline")}</p>
          {([
            { icon: <Users className="w-5 h-5" />, label: "Leads", key: "leads" },
            { icon: <Activity className="w-5 h-5" />, label: "Analytics", key: "analytics" },
          ] as const).map(i => (
            <button key={i.key} onClick={() => setSection(i.key)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${section === i.key ? "bg-sky-50 dark:bg-sky-500/10 text-sky-600 font-medium" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>{i.icon}{i.label}</button>
          ))}
          <p className="text-xs text-gray-400 uppercase font-medium px-4 mt-6 mb-2">{tx("Tools", "Tools")}</p>
          {([
            { icon: <Calendar className="w-5 h-5" />, label: "Scheduler", key: "scheduler" },
            { icon: <Settings className="w-5 h-5" />, label: tx("Einstellungen", "Settings"), key: "settings" },
          ] as const).map(i => (
            <button key={i.key} onClick={() => setSection(i.key)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${section === i.key ? "bg-sky-50 dark:bg-sky-500/10 text-sky-600 font-medium" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>{i.icon}{i.label}</button>
          ))}
        </nav>
        <div className="p-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white">
            <div className="flex items-center gap-2 mb-2"><Sparkles className="w-5 h-5" /><p className="font-semibold">{tx("Pro Tipp", "Pro Tip")}</p></div>
            <p className="text-sm text-white/80">{tx("A/B teste deine Nachrichten für 30% mehr Antworten.", "A/B test your messages for 30% more replies.")}</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className={`transition-all duration-300 ${sidebarCollapsed ? '' : 'lg:ml-64'}`}>
        {/* Header */}
        <header className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            {sidebarCollapsed && <button onClick={() => setSidebarCollapsed(false)} className="hidden lg:flex p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors" title={tx("Sidebar ausklappen", "Expand sidebar")}><ChevronRight className="w-5 h-5 text-gray-500" /></button>}
            <div>
              <h1 className="text-2xl font-bold">{{ dashboard: "Dashboard", outreach: tx("Kampagnen", "Campaigns"), messages: tx("Nachrichten-Templates", "Message Templates"), posts: "Posts", leads: "Leads", analytics: "Analytics", scheduler: "Scheduler", settings: tx("Einstellungen", "Settings"), sequences: tx("Sequenzen", "Sequences"), inbox: "Smart Inbox", import: tx("Lead Import", "Lead Import") }[section]}</h1>
              <p className="text-sm text-gray-500">{dateLabels[dateRange]}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder={tx("Suchen...", "Search...")} value={search} onChange={e => setSearch(e.target.value)} className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm w-64 focus:ring-2 focus:ring-sky-500 outline-none" />
              </div>
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
                <button onClick={() => setLang('de')} className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${lang === 'de' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>DE</button>
                <button onClick={() => setLang('en')} className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${lang === 'en' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>EN</button>
              </div>
              <NotificationDropdown notifications={notifications} onMarkRead={handleMarkRead} onClear={handleClearNotifications} />
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold">K</div>
            </div>
          </div>
          {(section === "dashboard" || section === "outreach" || section === "posts") && (
            <div className="flex items-center gap-4 px-6 py-3 border-t border-gray-100 dark:border-gray-800">
              <CustomDropdown value={dateRange} onChange={setDateRange} options={[{ value: "today", label: tx("Heute", "Today") }, { value: "7d", label: tx("Letzte 7 Tage", "Last 7 days") }, { value: "30d", label: tx("Letzte 30 Tage", "Last 30 days") }, { value: "90d", label: tx("Letzte 90 Tage", "Last 90 days") }, { value: "6m", label: tx("Letzte 6 Monate", "Last 6 months") }, { value: "12m", label: tx("Letzte 12 Monate", "Last 12 months") }, { value: "custom", label: tx("Benutzerdefiniert", "Custom") }]} icon={<Calendar className="w-4 h-4 text-gray-500" />} />
              {dateRange === "custom" && (
                <div className="flex items-center gap-2">
                  <input type="date" value={customDateFrom} onChange={e => setCustomDateFrom(e.target.value)} className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
                  <span className="text-gray-400 text-sm">–</span>
                  <input type="date" value={customDateTo} onChange={e => setCustomDateTo(e.target.value)} className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
                </div>
              )}
              {section === "posts" && (
                <CustomDropdown value={postFilter} onChange={setPostFilter} options={[{ value: "all", label: tx("Alle", "All") }, { value: "published", label: tx("Veröffentlicht", "Published") }, { value: "scheduled", label: tx("Geplant", "Scheduled") }, { value: "draft", label: tx("Entwürfe", "Drafts") }]} icon={<Filter className="w-4 h-4 text-gray-500" />} />
              )}
              <div className="flex-1" />
              <button onClick={handleRefresh} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"><RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />{tx("Aktualisieren", "Refresh")}</button>
              <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white text-sm font-medium rounded-xl hover:bg-sky-600"><Download className="w-4 h-4" />Export</button>
            </div>
          )}
        </header>

        <div className="p-6 space-y-6">
          {/* DASHBOARD */}
          {section === "dashboard" && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { t: tx("Anfragen", "Requests"), v: metrics.totalConnSent, c: 12.5, i: <Send className="w-5 h-5 text-sky-500" />, bg: "bg-sky-100" },
                  { t: tx("Verbunden", "Connected"), v: metrics.totalConnAccepted, c: metrics.acceptRate, sub: `${metrics.acceptRate.toFixed(1)}%`, i: <UserCheck className="w-5 h-5 text-emerald-500" />, bg: "bg-emerald-100" },
                  { t: tx("Antworten", "Replies"), v: metrics.totalMsgReplied, c: metrics.replyRate, sub: `${metrics.replyRate.toFixed(1)}%`, i: <MessageSquare className="w-5 h-5 text-purple-500" />, bg: "bg-purple-100" },
                  { t: "Leads", v: metrics.totalLeads, c: 28.5, i: <Target className="w-5 h-5 text-orange-500" />, bg: "bg-orange-100" },
                ].map((m, i) => (
                  <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl ${m.bg} flex items-center justify-center`}>{m.i}</div>
                      <div className="flex items-center gap-1 text-sm font-medium text-emerald-500"><ArrowUpRight className="w-4 h-4" />{m.c.toFixed(1)}%</div>
                    </div>
                    <p className="text-gray-500 text-sm mb-1">{m.t}</p>
                    <p className="text-3xl font-bold">{m.v}</p>
                    {m.sub && <p className="text-xs text-gray-400 mt-1">{m.sub} Rate</p>}
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold">{tx("Aktive Kampagnen", "Active Campaigns")}</h3>
                    <button onClick={() => setSection("outreach")} className="text-sm text-sky-500 hover:text-sky-600">{tx("Alle anzeigen", "View all")}</button>
                  </div>
                  <div className="space-y-3">
                    {campaigns.filter(c => c.status === "active").slice(0, 4).map(c => (
                      <div key={c.id} onClick={() => setSelectedCampaign(c)} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{c.name}</p>
                          <p className="text-sm text-gray-500">{c.connectionsAccepted}/{c.connectionsSent} {tx("verbunden", "connected")}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sky-500">{c.leadsGenerated}</p>
                          <p className="text-xs text-gray-400">{tx("Leads", "Leads")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold">{tx("Top Nachrichten-Versionen", "Top Message Versions")}</h3>
                    <button onClick={() => setSection("messages")} className="text-sm text-sky-500 hover:text-sky-600">{tx("Alle anzeigen", "View all")}</button>
                  </div>
                  <div className="space-y-3">
                    {templates.flatMap(t => t.versions).sort((a, b) => b.replyRate - a.replyRate).slice(0, 4).map((v, i) => (
                      <div key={v.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-500/20 flex items-center justify-center text-sky-600 font-bold text-sm">#{i + 1}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{v.name}</p>
                          <p className="text-sm text-gray-500">{v.sent} {tx("gesendet", "sent")}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-emerald-500">{v.replyRate}%</p>
                          <p className="text-xs text-gray-400">{tx("Reply-Rate", "Reply rate")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold">{tx("Neueste Leads", "Recent Leads")}</h3>
                  <button onClick={() => setSection("leads")} className="text-sm text-sky-500 hover:text-sky-600">{tx("Alle anzeigen", "View all")}</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="text-left text-sm text-gray-500 border-b border-gray-100 dark:border-gray-800"><th className="pb-3 font-medium">{tx("Name", "Name")}</th><th className="pb-3 font-medium">{tx("Unternehmen", "Company")}</th><th className="pb-3 font-medium">{tx("Status", "Status")}</th><th className="pb-3 font-medium">{tx("Letzte Aktivität", "Last activity")}</th></tr></thead>
                    <tbody>
                      {leads.slice(0, 5).map(l => {
                        const sc = statusColors[l.status];
                        return (
                          <tr key={l.id} onClick={() => setSelectedLead(l)} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                            <td className="py-3"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-white text-sm font-medium">{l.name.charAt(0)}</div><span className="font-medium">{l.name}</span></div></td>
                            <td className="py-3 text-gray-500">{l.company}</td>
                            <td className="py-3"><span className={`text-xs px-2 py-1 rounded-full ${sc.bg} ${sc.text}`}>{statusLabels[l.status]}</span></td>
                            <td className="py-3 text-gray-400 text-sm">{l.lastActivity}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* OUTREACH */}
          {section === "outreach" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-sm"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />{campaigns.filter(c => c.status === "active").length} {tx("aktiv", "active")}</div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-600 rounded-full text-sm">{campaigns.filter(c => c.status === "paused").length} {tx("pausiert", "paused")}</div>
                </div>
                <button onClick={() => setShowNewCampaignModal(true)} className="px-4 py-2 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-600 flex items-center gap-2"><Plus className="w-4 h-4" />{tx("Neue Kampagne", "New Campaign")}</button>
              </div>
              {search && (
                <span className="text-xs text-gray-400">{filteredCampaigns.length} / {campaigns.length}</span>
              )}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCampaigns.map(campaign => (
                  <div key={campaign.id} onClick={() => setSelectedCampaign(campaign)} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:border-sky-200 cursor-pointer transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${campaign.status === "active" ? "bg-emerald-500" : campaign.status === "paused" ? "bg-yellow-500" : "bg-gray-400"}`} />
                        <h3 className="font-semibold">{campaign.name}</h3>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div><p className="text-xs text-gray-500 mb-1">{tx("Verbindungen", "Connections")}</p><p className="text-lg font-bold">{Math.round(campaign.connectionsAccepted * dateMultiplier)}<span className="text-gray-400 font-normal">/{Math.round(campaign.connectionsSent * dateMultiplier)}</span></p><p className="text-xs text-emerald-500">{campaign.acceptRate}%</p></div>
                      <div><p className="text-xs text-gray-500 mb-1">{tx("Antworten", "Replies")}</p><p className="text-lg font-bold">{Math.round(campaign.messagesReplied * dateMultiplier)}<span className="text-gray-400 font-normal">/{Math.round(campaign.messagesSent * dateMultiplier)}</span></p><p className="text-xs text-emerald-500">{campaign.replyRate}%</p></div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2"><Target className="w-4 h-4 text-sky-500" /><span className="text-sm font-medium text-sky-500">{Math.round(campaign.leadsGenerated * dateMultiplier)} Leads</span></div>
                      <span className="text-xs text-gray-400">{tx("Limit", "Limit")}: {campaign.dailyLimit}/{tx("Tag", "day")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MESSAGES */}
          {section === "messages" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">{tx("Erstelle verschiedene Versionen deiner Nachrichten und teste welche besser performt.", "Create different versions of your messages and test which one performs better.")}</p>
                </div>
                <button onClick={() => setShowNewTemplateModal(true)} className="px-4 py-2 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-600 flex items-center gap-2"><Plus className="w-4 h-4" />{tx("Neues Template", "New Template")}</button>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {templates.map(template => (
                  <div key={template.id} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <GitBranch className="w-5 h-5 text-sky-500" />
                        <h3 className="font-semibold">{template.name}</h3>
                        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">{template.type}</span>
                      </div>
                      <button onClick={() => setSelectedTemplate(template)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg" title={tx("Template bearbeiten", "Edit template")}><Edit3 className="w-4 h-4 text-gray-500" /></button>
                    </div>
                    <div className="space-y-3">
                      {template.versions.map(v => (
                        <div key={v.id} className={`p-4 rounded-xl ${template.activeVersionId === v.id ? "bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/30" : "bg-gray-50 dark:bg-gray-800"}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{v.name}</span>
                            {template.activeVersionId === v.id && <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-full">{tx("Aktiv", "Active")}</span>}
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-500">{v.sent} {tx("gesendet", "sent")}</span>
                            <span className="text-gray-500">{v.replied} {tx("Antworten", "replies")}</span>
                            <span className={`font-medium ${v.replyRate >= 35 ? "text-emerald-500" : v.replyRate >= 25 ? "text-yellow-500" : "text-gray-500"}`}>{v.replyRate}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setSelectedTemplate(template)} className="w-full mt-4 py-2 text-sm text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-500/10 rounded-lg transition-colors">{tx("+ Neue Version hinzufügen", "+ Add new version")}</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* POSTS */}
          {section === "posts" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">{filteredPosts.length} Posts</span>
                  {(search || postFilter !== "all") && (
                    <span className="text-xs text-gray-400">{filteredPosts.length} / {posts.length}</span>
                  )}
                </div>
                <button onClick={() => setShowNewPostModal(true)} className="px-4 py-2 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-600 flex items-center gap-2"><Edit3 className="w-4 h-4" />{tx("Neuer Post", "New Post")}</button>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPosts.map(post => (
                  <div key={post.id} onClick={() => setSelectedPost(post)} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:border-sky-200 cursor-pointer transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${post.type === "text" ? "bg-gray-100 text-gray-600" : post.type === "image" ? "bg-blue-100 text-blue-600" : post.type === "video" ? "bg-red-100 text-red-600" : post.type === "carousel" ? "bg-purple-100 text-purple-600" : "bg-orange-100 text-orange-600"}`}>
                        {postTypeIcons[post.type]}{postTypeLabels[post.type]}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${post.status === "published" ? "bg-emerald-100 text-emerald-600" : post.status === "scheduled" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}`}>
                        {post.status === "published" ? tx("Veröffentlicht", "Published") : post.status === "scheduled" ? tx("Geplant", "Scheduled") : tx("Entwurf", "Draft")}
                      </span>
                    </div>
                    <p className="font-medium mb-3 line-clamp-2">{post.content}</p>
                    <p className="text-xs text-gray-400 mb-4">{formatDate(post.publishedAt, lang)}</p>
                    {post.status === "published" && (
                      <div className="grid grid-cols-4 gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="text-center"><p className="text-lg font-bold">{formatNumber(Math.round(post.impressions * dateMultiplier))}</p><p className="text-xs text-gray-500">{tx("Aufrufe", "Views")}</p></div>
                        <div className="text-center"><p className="text-lg font-bold">{formatNumber(Math.round(post.likes * dateMultiplier))}</p><p className="text-xs text-gray-500">{tx("Likes", "Likes")}</p></div>
                        <div className="text-center"><p className="text-lg font-bold">{Math.round(post.comments * dateMultiplier)}</p><p className="text-xs text-gray-500">{tx("Kommentare", "Comments")}</p></div>
                        <div className="text-center"><p className="text-lg font-bold text-sky-500">{post.engagementRate}%</p><p className="text-xs text-gray-500">{tx("Eng.", "Eng.")}</p></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LEADS */}
          {section === "leads" && (
            <div className="space-y-6">
              <div className="grid grid-cols-6 gap-4">
                {(Object.entries(statusLabels) as [string, string][]).map(([key, label]) => {
                  const count = leads.filter(l => l.status === key).length;
                  const sc = statusColors[key];
                  return (
                    <div key={key} className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                      <p className={`text-xs mb-1 ${sc.text}`}>{label}</p>
                      <p className="text-2xl font-bold">{count}</p>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4">
                <CustomDropdown
                  value={leadStatusFilter}
                  onChange={setLeadStatusFilter}
                  options={[
                    { value: "all", label: tx("Alle Status", "All statuses") },
                    { value: "connected", label: tx("Verbunden", "Connected") },
                    { value: "messaged", label: tx("Angeschrieben", "Messaged") },
                    { value: "replied", label: tx("Geantwortet", "Replied") },
                    { value: "qualified", label: tx("Qualifiziert", "Qualified") },
                    { value: "converted", label: tx("Konvertiert", "Converted") },
                    { value: "not_interested", label: tx("Kein Interesse", "Not interested") },
                  ]}
                  icon={<Filter className="w-4 h-4 text-gray-500" />}
                />
                <span className="text-sm text-gray-500">{filteredLeads.length} Leads</span>
                {(search || leadStatusFilter !== "all") && (
                  <span className="text-xs text-gray-400">{filteredLeads.length} / {leads.length}</span>
                )}
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <table className="w-full">
                  <thead><tr className="border-b border-gray-100 dark:border-gray-800 text-left text-sm text-gray-500"><th className="py-3 px-4 font-medium">{tx("Name", "Name")}</th><th className="py-3 px-4 font-medium">{tx("Position", "Position")}</th><th className="py-3 px-4 font-medium">{tx("Unternehmen", "Company")}</th><th className="py-3 px-4 font-medium">{tx("Kampagne", "Campaign")}</th><th className="py-3 px-4 font-medium">{tx("Status", "Status")}</th><th className="py-3 px-4 font-medium">{tx("Aktivität", "Activity")}</th><th className="py-3 px-4"></th></tr></thead>
                  <tbody>
                    {filteredLeads.map(lead => {
                      const sc = statusColors[lead.status];
                      return (
                        <tr key={lead.id} onClick={() => setSelectedLead(lead)} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
                          <td className="py-3 px-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-white font-medium text-sm">{lead.name.charAt(0)}</div><span className="font-medium">{lead.name}</span></div></td>
                          <td className="py-3 px-4 text-gray-500">{lead.title}</td>
                          <td className="py-3 px-4 text-gray-500">{lead.company}</td>
                          <td className="py-3 px-4 text-gray-500 text-sm">{lead.campaign}</td>
                          <td className="py-3 px-4"><span className={`text-xs px-2 py-1 rounded-full ${sc.bg} ${sc.text}`}>{statusLabels[lead.status]}</span></td>
                          <td className="py-3 px-4 text-gray-400 text-sm">{lead.lastActivity}</td>
                          <td className="py-3 px-4"><a href={lead.profileUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg inline-flex" title={tx("Profil öffnen", "Open profile")}><ExternalLink className="w-4 h-4 text-gray-400 hover:text-sky-500" /></a></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ANALYTICS */}
          {section === "analytics" && (
            <div className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                  <h3 className="font-semibold mb-6">{tx("Nachrichten-Performance (A/B Test)", "Message Performance (A/B Test)")}</h3>
                  <div className="space-y-4">
                    {templates.flatMap(t => t.versions).sort((a, b) => b.replyRate - a.replyRate).map((v, i) => (
                      <div key={v.id} className="flex items-center gap-4">
                        <div className="w-8 text-center font-bold text-gray-300">#{i + 1}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{v.name}</span>
                            <span className="text-sm font-bold text-emerald-500">{v.replyRate}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-sky-500 rounded-full" style={{ width: `${v.replyRate * 2}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                  <h3 className="font-semibold mb-6">{tx("Post-Typen Performance", "Post Type Performance")}</h3>
                  <div className="space-y-4">
                    {(["carousel", "video", "image", "text", "document"] as const).map(type => {
                      const typePosts = posts.filter(p => p.type === type && p.status === "published");
                      const avgEng = typePosts.length > 0 ? typePosts.reduce((s, p) => s + p.engagementRate, 0) / typePosts.length : 0;
                      return (
                        <div key={type} className="flex items-center gap-4">
                          <div className="w-24 flex items-center gap-2">{postTypeIcons[type]}<span className="text-sm">{postTypeLabels[type]}</span></div>
                          <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-sky-500 rounded-full" style={{ width: `${avgEng * 12}%` }} />
                          </div>
                          <span className="text-sm font-medium w-16 text-right">{avgEng.toFixed(1)}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                <h3 className="font-semibold mb-6">{tx("Kampagnen-Vergleich", "Campaign Comparison")}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="text-left text-sm text-gray-500 border-b border-gray-100 dark:border-gray-800"><th className="pb-3 font-medium">{tx("Kampagne", "Campaign")}</th><th className="pb-3 font-medium text-right">{tx("Gesendet", "Sent")}</th><th className="pb-3 font-medium text-right">{tx("Akzeptanz %", "Accept %")}</th><th className="pb-3 font-medium text-right">{tx("Antwort %", "Reply %")}</th><th className="pb-3 font-medium text-right">{tx("Leads", "Leads")}</th><th className="pb-3 font-medium text-right">{tx("Conv. %", "Conv. %")}</th></tr></thead>
                    <tbody>
                      {campaigns.map(c => (
                        <tr key={c.id} className="border-b border-gray-50 dark:border-gray-800">
                          <td className="py-3 font-medium">{c.name}</td>
                          <td className="py-3 text-right">{c.connectionsSent}</td>
                          <td className="py-3 text-right"><span className={c.acceptRate >= 35 ? "text-emerald-500" : "text-gray-500"}>{c.acceptRate}%</span></td>
                          <td className="py-3 text-right"><span className={c.replyRate >= 30 ? "text-emerald-500" : "text-gray-500"}>{c.replyRate}%</span></td>
                          <td className="py-3 text-right font-medium text-sky-500">{c.leadsGenerated}</td>
                          <td className="py-3 text-right">{c.messagesReplied > 0 ? ((c.leadsGenerated / c.messagesReplied) * 100).toFixed(1) : 0}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SCHEDULER */}
          {section === "scheduler" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{tx("Content Kalender", "Content Calendar")}</h2>
                <button onClick={() => setShowNewPostModal(true)} className="px-4 py-2 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-600 flex items-center gap-2"><Edit3 className="w-4 h-4" />{tx("Post planen", "Schedule Post")}</button>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                <div className="grid grid-cols-7 gap-4">
                  {(lang === 'de' ? ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"] : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]).map((day, di) => {
                    const scheduledPosts = posts.filter(p => p.status === "scheduled");
                    const dayPosts = scheduledPosts.filter((_, index) => index % 7 === di);
                    return (
                      <div key={day}>
                        <p className="text-sm font-medium text-gray-500 mb-4 text-center">{day}</p>
                        <div className="space-y-2 min-h-[200px]">
                          {dayPosts.map(post => {
                            const time = post.publishedAt.includes(",") ? post.publishedAt.split(", ")[1] : "09:00";
                            return (
                              <div
                                key={post.id}
                                onClick={() => setSelectedPost(post)}
                                className="p-2 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                              >
                                <p className="text-xs text-blue-600 font-medium">{time}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-300 truncate">{post.content.slice(0, 25)}...</p>
                              </div>
                            );
                          })}
                          {dayPosts.length === 0 && (
                            <button
                              onClick={() => setShowNewPostModal(true)}
                              className="w-full p-2 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-gray-400 hover:border-sky-300 hover:text-sky-500 transition-colors text-xs"
                            >
                              {tx("+ Post", "+ Post")}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                <h3 className="font-semibold mb-4">{tx("Geplante Posts", "Scheduled Posts")}</h3>
                <div className="space-y-3">
                  {posts.filter(p => p.status === "scheduled").map(post => (
                    <div key={post.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <div className="flex-1"><p className="font-medium truncate">{post.content}</p><p className="text-sm text-gray-500">{formatDate(post.publishedAt, lang)}</p></div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSelectedPost(post)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg" title={tx("Post bearbeiten", "Edit post")}><Edit3 className="w-4 h-4 text-gray-500" /></button>
                        <button onClick={() => handlePostAction("delete", post.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg" title={tx("Post löschen", "Delete post")}><Trash2 className="w-4 h-4 text-red-500" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SEQUENCES */}
          {section === "sequences" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-sm"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />{sequences.filter(s => s.status === "active").length} {tx("aktiv", "active")}</div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-600 rounded-full text-sm">{sequences.filter(s => s.status === "paused").length} {tx("pausiert", "paused")}</div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">{sequences.filter(s => s.status === "draft").length} {tx("Entwürfe", "drafts")}</div>
                </div>
                <button onClick={() => setShowNewSequenceModal(true)} className="px-4 py-2 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-600 flex items-center gap-2"><Plus className="w-4 h-4" />{tx("Neue Sequenz", "New Sequence")}</button>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sequences.map(seq => (
                  <div key={seq.id} onClick={() => setSelectedSequence(seq)} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:border-sky-200 cursor-pointer transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${seq.status === "active" ? "bg-emerald-500" : seq.status === "paused" ? "bg-yellow-500" : "bg-gray-400"}`} />
                        <h3 className="font-semibold">{seq.name}</h3>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${seq.status === "active" ? "bg-emerald-100 text-emerald-600" : seq.status === "paused" ? "bg-yellow-100 text-yellow-600" : "bg-gray-100 text-gray-600"}`}>
                        {seq.status === "active" ? tx("Aktiv", "Active") : seq.status === "paused" ? tx("Pausiert", "Paused") : tx("Entwurf", "Draft")}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div><p className="text-xs text-gray-500 mb-1">{tx("Leads", "Leads")}</p><p className="text-lg font-bold">{seq.totalLeads}</p></div>
                      <div><p className="text-xs text-gray-500 mb-1">{tx("Abgeschlossen", "Completed")}</p><p className="text-lg font-bold">{seq.completedLeads}</p></div>
                      <div><p className="text-xs text-gray-500 mb-1">{tx("Reply-Rate", "Reply rate")}</p><p className="text-lg font-bold text-emerald-500">{seq.replyRate}%</p></div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2"><Layers className="w-4 h-4 text-sky-500" /><span className="text-sm text-gray-500">{seq.steps.length} {tx("Schritte", "steps")}</span></div>
                      <span className="text-xs text-gray-400">{formatDate(seq.createdAt, lang)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sequence Editor Modal */}
              {selectedSequence && (() => {
                const SequenceEditor = () => {
                  const [editSeq, setEditSeq] = useState<AutomationSequence>({ ...selectedSequence, steps: selectedSequence.steps.map(s => ({ ...s })) });
                  const [showSeqDeleteConfirm, setShowSeqDeleteConfirm] = useState(false);
                  useModalEsc(!!selectedSequence, () => setSelectedSequence(null));
                  const stepTypeOptions: { value: SequenceStep['type']; label: string }[] = [
                    { value: 'connection_request', label: tx("Verbindungsanfrage", "Connection Request") },
                    { value: 'message', label: tx("Nachricht", "Message") },
                    { value: 'inmail', label: "InMail" },
                    { value: 'profile_visit', label: tx("Profil besuchen", "Profile Visit") },
                    { value: 'endorse', label: tx("Empfehlung", "Endorse") },
                    { value: 'like', label: "Like" },
                    { value: 'follow', label: tx("Folgen", "Follow") },
                  ];
                  const conditionOptions: { value: NonNullable<SequenceStep['condition']>; label: string }[] = [
                    { value: 'always', label: tx("Immer", "Always") },
                    { value: 'if_accepted', label: tx("Wenn akzeptiert", "If accepted") },
                    { value: 'if_not_accepted', label: tx("Wenn nicht akzeptiert", "If not accepted") },
                    { value: 'if_replied', label: tx("Wenn geantwortet", "If replied") },
                    { value: 'if_not_replied', label: tx("Wenn nicht geantwortet", "If not replied") },
                  ];
                  const unitOptions: { value: 'hours' | 'days'; label: string }[] = [
                    { value: 'hours', label: tx("Stunden", "Hours") },
                    { value: 'days', label: tx("Tage", "Days") },
                  ];
                  const handleStepChange = (idx: number, field: string, value: unknown) => {
                    setEditSeq(prev => ({
                      ...prev,
                      steps: prev.steps.map((s, i) => {
                        if (i !== idx) return s;
                        if (field === 'type') return { ...s, type: value as SequenceStep['type'] };
                        if (field === 'content') return { ...s, content: value as string };
                        if (field === 'condition') return { ...s, condition: value as SequenceStep['condition'] };
                        if (field === 'delayValue') return { ...s, delay: { ...s.delay, value: value as number } };
                        if (field === 'delayUnit') return { ...s, delay: { ...s.delay, unit: value as 'hours' | 'days' } };
                        return s;
                      }),
                    }));
                  };

                  const handleAddStep = () => {
                    setEditSeq(prev => ({
                      ...prev,
                      steps: [...prev.steps, { id: Date.now().toString(), type: 'message', content: '', delay: { value: 1, unit: 'days' }, condition: 'always' }],
                    }));
                  };

                  const handleRemoveStep = (idx: number) => {
                    setEditSeq(prev => ({ ...prev, steps: prev.steps.filter((_, i) => i !== idx) }));
                  };

                  const handleMoveStep = (idx: number, dir: -1 | 1) => {
                    const target = idx + dir;
                    if (target < 0 || target >= editSeq.steps.length) return;
                    setEditSeq(prev => {
                      const newSteps = [...prev.steps];
                      [newSteps[idx], newSteps[target]] = [newSteps[target], newSteps[idx]];
                      return { ...prev, steps: newSteps };
                    });
                  };

                  const handleSave = () => {
                    setSequences(s => s.map(x => x.id === editSeq.id ? editSeq : x));
                    setSelectedSequence(null);
                  };

                  const showContent = (type: string) => type === 'connection_request' || type === 'message' || type === 'inmail';

                  return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedSequence(null)} />
                      <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-3xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setSelectedSequence(null)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl" title={tx("Schließen", "Close")}><X className="w-5 h-5 text-gray-400" /></button>
                        {/* Editable Name */}
                        <div className="flex items-center gap-4 mb-6">
                          <div className={`w-4 h-4 rounded-full ${editSeq.status === "active" ? "bg-emerald-500" : editSeq.status === "paused" ? "bg-yellow-500" : "bg-gray-400"}`} />
                          <input
                            type="text"
                            value={editSeq.name}
                            onChange={e => setEditSeq(prev => ({ ...prev, name: e.target.value }))}
                            className="text-2xl font-bold bg-transparent border-b-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-sky-500 outline-none flex-1"
                          />
                        </div>
                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4"><p className="text-xs text-gray-500 mb-1">{tx("Gesamte Leads", "Total Leads")}</p><p className="text-2xl font-bold">{editSeq.totalLeads}</p></div>
                          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4"><p className="text-xs text-gray-500 mb-1">{tx("Abgeschlossen", "Completed")}</p><p className="text-2xl font-bold text-sky-500">{editSeq.completedLeads}</p></div>
                          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4"><p className="text-xs text-gray-500 mb-1">{tx("Reply-Rate", "Reply rate")}</p><p className="text-2xl font-bold text-emerald-500">{editSeq.replyRate}%</p></div>
                        </div>
                        {/* Stop on Reply Toggle */}
                        <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                          <div>
                            <p className="font-medium text-sm">{tx("Bei Antwort stoppen", "Stop on Reply")}</p>
                            <p className="text-xs text-gray-500">{tx("Sequenz automatisch pausieren wenn Lead antwortet", "Automatically pause sequence when lead replies")}</p>
                          </div>
                          <button onClick={() => setEditSeq(prev => ({ ...prev, stopOnReply: !prev.stopOnReply }))} className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200 ${editSeq.stopOnReply ? "bg-sky-500" : "bg-gray-200 dark:bg-gray-600"}`}>
                            <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-1 ring-black/5 transition-transform duration-200 ease-in-out ${editSeq.stopOnReply ? "translate-x-6" : "translate-x-1"}`} />
                          </button>
                        </div>
                        {/* Steps Editor */}
                        <div className="mb-6">
                          <p className="text-sm text-gray-500 mb-4">{tx("Sequenz-Schritte", "Sequence Steps")} ({editSeq.steps.length})</p>
                          <div className="space-y-4">
                            {editSeq.steps.map((step, i) => (
                              <div key={step.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-500/20 flex items-center justify-center text-sky-600 text-sm font-bold">{i + 1}</div>
                                  <div className="flex-1 relative">
                                    <select value={step.type} onChange={e => handleStepChange(i, 'type', e.target.value)} className="w-full px-3 py-2 pr-9 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:border-sky-500 hover:border-sky-300 dark:hover:border-gray-500 outline-none transition-all appearance-none cursor-pointer shadow-sm">
                                      {stepTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button onClick={() => handleMoveStep(i, -1)} disabled={i === 0} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-30" title={tx("Nach oben", "Move up")}><ChevronUp className="w-4 h-4 text-gray-500" /></button>
                                    <button onClick={() => handleMoveStep(i, 1)} disabled={i === editSeq.steps.length - 1} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-30" title={tx("Nach unten", "Move down")}><ChevronDown className="w-4 h-4 text-gray-500" /></button>
                                    <button onClick={() => handleRemoveStep(i)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg" title={tx("Schritt entfernen", "Remove step")}><X className="w-4 h-4 text-red-500" /></button>
                                  </div>
                                </div>
                                {showContent(step.type) && (
                                  <textarea
                                    value={step.content || ''}
                                    onChange={e => handleStepChange(i, 'content', e.target.value)}
                                    placeholder={tx("Nachrichtentext eingeben...", "Enter message text...")}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none resize-none mb-3"
                                    rows={3}
                                  />
                                )}
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <input type="number" min={0} value={step.delay.value} onChange={e => handleStepChange(i, 'delayValue', Number(e.target.value))} className="w-16 px-2 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
                                    <div className="relative">
                                      <select value={step.delay.unit} onChange={e => handleStepChange(i, 'delayUnit', e.target.value)} className="px-3 py-1.5 pr-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:border-sky-500 hover:border-sky-300 dark:hover:border-gray-500 outline-none transition-all appearance-none cursor-pointer shadow-sm">
                                        {unitOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                      </select>
                                      <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 flex-1">
                                    <Filter className="w-4 h-4 text-gray-400" />
                                    <div className="relative flex-1">
                                      <select value={step.condition || 'always'} onChange={e => handleStepChange(i, 'condition', e.target.value)} className="w-full px-3 py-1.5 pr-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:border-sky-500 hover:border-sky-300 dark:hover:border-gray-500 outline-none transition-all appearance-none cursor-pointer shadow-sm">
                                        {conditionOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                      </select>
                                      <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <button onClick={handleAddStep} className="w-full mt-4 py-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 hover:border-sky-300 hover:text-sky-500 transition-colors flex items-center justify-center gap-2 text-sm font-medium"><Plus className="w-4 h-4" />{tx("Schritt hinzufügen", "Add Step")}</button>
                        </div>
                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                          <button onClick={handleSave} className="flex-1 py-3 bg-sky-500 text-white font-medium rounded-xl hover:bg-sky-600 flex items-center justify-center gap-2"><Check className="w-4 h-4" />{tx("Speichern", "Save")}</button>
                          {editSeq.status === "active" ? (
                            <button onClick={() => { setSequences(s => s.map(x => x.id === selectedSequence.id ? { ...x, status: "paused" as const } : x)); setSelectedSequence(null); }} className="py-3 px-6 bg-yellow-100 text-yellow-700 font-medium rounded-xl hover:bg-yellow-200 flex items-center justify-center gap-2"><Pause className="w-4 h-4" />{tx("Pausieren", "Pause")}</button>
                          ) : editSeq.status === "paused" ? (
                            <button onClick={() => { setSequences(s => s.map(x => x.id === selectedSequence.id ? { ...x, status: "active" as const } : x)); setSelectedSequence(null); }} className="py-3 px-6 bg-emerald-100 text-emerald-700 font-medium rounded-xl hover:bg-emerald-200 flex items-center justify-center gap-2"><Play className="w-4 h-4" />{tx("Fortsetzen", "Resume")}</button>
                          ) : (
                            <button onClick={() => { setSequences(s => s.map(x => x.id === selectedSequence.id ? { ...x, status: "active" as const } : x)); setSelectedSequence(null); }} className="py-3 px-6 bg-emerald-100 text-emerald-700 font-medium rounded-xl hover:bg-emerald-200 flex items-center justify-center gap-2"><Play className="w-4 h-4" />{tx("Aktivieren", "Activate")}</button>
                          )}
                          <button onClick={() => setShowSeqDeleteConfirm(true)} className="py-3 px-6 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 flex items-center justify-center gap-2" title={tx("Sequenz löschen", "Delete sequence")}><Trash2 className="w-4 h-4" /></button>
                        </div>
                        <ConfirmDialog
                          open={showSeqDeleteConfirm}
                          title={tx("Sequenz löschen?", "Delete sequence?")}
                          message={tx("Diese Sequenz wird unwiderruflich gelöscht.", "This sequence will be permanently deleted.")}
                          confirmLabel={tx("Löschen", "Delete")}
                          cancelLabel={tx("Abbrechen", "Cancel")}
                          variant="danger"
                          onConfirm={() => { setShowSeqDeleteConfirm(false); setSequences(s => s.filter(x => x.id !== selectedSequence.id)); setSelectedSequence(null); }}
                          onCancel={() => setShowSeqDeleteConfirm(false)}
                        />
                      </div>
                    </div>
                  );
                };
                return <SequenceEditor />;
              })()}

              {/* New Sequence Modal */}
              {showNewSequenceModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowNewSequenceModal(false)} />
                  <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-lg w-full mx-4 shadow-2xl">
                    <button onClick={() => setShowNewSequenceModal(false)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl" title={tx("Schließen", "Close")}><X className="w-5 h-5 text-gray-400" /></button>
                    <h2 className="text-2xl font-bold mb-6">{tx("Neue Sequenz erstellen", "Create new sequence")}</h2>
                    <p className="text-gray-500 mb-6">{tx("Wähle eine Vorlage oder starte von Grund auf.", "Choose a template or start from scratch.")}</p>
                    <div className="space-y-3">
                      {[
                        {
                          name: tx("Kalt-Outreach", "Cold Outreach"),
                          desc: tx("Profil besuchen, Anfrage, Follow-up Nachrichten", "Profile visit, request, follow-up messages"),
                          stepCount: 5,
                          steps: [
                            { id: `${Date.now()}co1`, type: "profile_visit" as const, delay: { value: 0, unit: "hours" as const }, condition: "always" as const },
                            { id: `${Date.now()}co2`, type: "connection_request" as const, content: "Hallo {{firstName}}, ich bin beeindruckt von dem was {{company}} aufbaut. Würde mich freuen, mich mit dir zu vernetzen!", delay: { value: 1, unit: "days" as const }, condition: "always" as const },
                            { id: `${Date.now()}co3`, type: "message" as const, content: "Hi {{firstName}}, danke fürs Vernetzen! Ich helfe Unternehmen wie {{company}} dabei, ihre LinkedIn-Präsenz zu skalieren. Hättest du 15 Min für einen kurzen Austausch?", delay: { value: 2, unit: "days" as const }, condition: "if_accepted" as const },
                            { id: `${Date.now()}co4`, type: "like" as const, delay: { value: 1, unit: "days" as const }, condition: "if_not_replied" as const },
                            { id: `${Date.now()}co5`, type: "message" as const, content: "Hi {{firstName}}, wollte nochmal nachhaken. Wir haben gerade einige Case Studies von Unternehmen wie {{company}} veröffentlicht. Soll ich dir eine schicken?", delay: { value: 4, unit: "days" as const }, condition: "if_not_replied" as const },
                          ],
                        },
                        {
                          name: tx("Warm-up Sequenz", "Warm-up Sequence"),
                          desc: tx("Like, Empfehlung, dann Anfrage", "Like, endorse, then connect"),
                          stepCount: 6,
                          steps: [
                            { id: `${Date.now()}wu1`, type: "profile_visit" as const, delay: { value: 0, unit: "hours" as const }, condition: "always" as const },
                            { id: `${Date.now()}wu2`, type: "like" as const, delay: { value: 12, unit: "hours" as const }, condition: "always" as const },
                            { id: `${Date.now()}wu3`, type: "endorse" as const, delay: { value: 1, unit: "days" as const }, condition: "always" as const },
                            { id: `${Date.now()}wu4`, type: "connection_request" as const, content: "Hi {{firstName}}, mir gefällt was du bei {{company}} machst. Dein Profil ist super spannend - lass uns connecten!", delay: { value: 1, unit: "days" as const }, condition: "always" as const },
                            { id: `${Date.now()}wu5`, type: "message" as const, content: "Hey {{firstName}}, danke fürs Connecten! Nutzt ihr bei {{company}} schon LinkedIn Outreach automatisiert? Würde mich interessieren.", delay: { value: 3, unit: "days" as const }, condition: "if_accepted" as const },
                            { id: `${Date.now()}wu6`, type: "inmail" as const, content: "Hi {{firstName}}, ich wollte mich kurz vorstellen - wir helfen Teams wie deinem bei der LinkedIn Lead-Gen. Hättest du Lust auf einen kurzen Austausch?", delay: { value: 5, unit: "days" as const }, condition: "if_not_accepted" as const },
                          ],
                        },
                        {
                          name: tx("Event Follow-up", "Event Follow-up"),
                          desc: tx("Anfrage nach Veranstaltung, Follow-ups", "Connect after event, follow-ups"),
                          stepCount: 4,
                          steps: [
                            { id: `${Date.now()}ef1`, type: "connection_request" as const, content: "Hi {{firstName}}, wir haben uns auf der Konferenz getroffen. War super spannend mit dir zu sprechen!", delay: { value: 0, unit: "hours" as const }, condition: "always" as const },
                            { id: `${Date.now()}ef2`, type: "message" as const, content: "Hey {{firstName}}, schön dass wir jetzt vernetzt sind! Wie besprochen, hier der Link zu unserem Tool: flowstack.com", delay: { value: 1, unit: "days" as const }, condition: "if_accepted" as const },
                            { id: `${Date.now()}ef3`, type: "message" as const, content: "Hi {{firstName}}, hattest du schon die Chance, dir das anzuschauen? Würde mich über dein Feedback freuen.", delay: { value: 3, unit: "days" as const }, condition: "if_not_replied" as const },
                            { id: `${Date.now()}ef4`, type: "follow" as const, delay: { value: 5, unit: "days" as const }, condition: "if_not_replied" as const },
                          ],
                        },
                      ].map((tmpl, i) => (
                        <button key={i} onClick={() => {
                          const newSeq: AutomationSequence = {
                            id: Date.now().toString(), name: tmpl.name, status: "draft", stopOnReply: true, totalLeads: 0, completedLeads: 0, replyRate: 0, createdAt: new Date().toLocaleDateString("de-DE"),
                            steps: tmpl.steps,
                          };
                          setSequences(s => [...s, newSeq]);
                          setShowNewSequenceModal(false);
                          setSelectedSequence(newSeq);
                        }} className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-500/20 flex items-center justify-center"><GitBranch className="w-5 h-5 text-sky-600" /></div>
                          <div className="flex-1">
                            <p className="font-medium">{tmpl.name}</p>
                            <p className="text-sm text-gray-500">{tmpl.desc}</p>
                          </div>
                          <div className="text-sm text-gray-400">{tmpl.stepCount} {tx("Schritte", "steps")}</div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>
                      ))}
                    </div>
                    <button onClick={() => setShowNewSequenceModal(false)} className="w-full mt-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium rounded-xl hover:bg-gray-200">{tx("Abbrechen", "Cancel")}</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* INBOX */}
          {section === "inbox" && (
            <div className="flex gap-0 -m-6 h-[calc(100vh-140px)]">
              {/* Left: Conversation List */}
              <div className="w-80 border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                    {([
                      { key: "all" as const, label: tx("Alle", "All") },
                      { key: "unread" as const, label: tx("Ungelesen", "Unread") },
                      { key: "archived" as const, label: tx("Archiv", "Archived") },
                    ]).map(f => (
                      <button key={f.key} onClick={() => setInboxFilter(f.key)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${inboxFilter === f.key ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500"}`}>{f.label}</button>
                    ))}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {conversations
                    .filter(c => inboxFilter === "all" ? !c.isArchived : inboxFilter === "unread" ? c.isUnread : c.isArchived)
                    .map(conv => (
                    <div
                      key={conv.id}
                      onClick={() => { setSelectedConversation(conv); setConversations(cs => cs.map(c => c.id === conv.id ? { ...c, isUnread: false } : c)); }}
                      className={`p-4 border-b border-gray-50 dark:border-gray-800 cursor-pointer transition-colors ${selectedConversation?.id === conv.id ? "bg-sky-50 dark:bg-sky-500/10" : "hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{conv.contactName.charAt(0)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{conv.contactName}</span>
                            <span className="text-xs text-gray-400">{conv.lastMessageAt}</span>
                          </div>
                          <p className="text-xs text-gray-500">{conv.contactCompany}</p>
                          <p className="text-sm text-gray-400 truncate mt-1">{conv.lastMessage}</p>
                        </div>
                        {conv.isUnread && <div className="w-2.5 h-2.5 bg-sky-500 rounded-full flex-shrink-0 mt-2" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Chat View */}
              <div className="flex-1 flex flex-col bg-gray-50 dark:bg-black">
                {selectedConversation ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold text-sm">{selectedConversation.contactName.charAt(0)}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{selectedConversation.contactName}</h3>
                        <p className="text-sm text-gray-500">{selectedConversation.contactTitle} @ {selectedConversation.contactCompany}</p>
                      </div>
                      <button onClick={() => { setConversations(cs => cs.map(c => c.id === selectedConversation.id ? { ...c, isArchived: !c.isArchived } : c)); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl" title={tx("Archivieren", "Archive")}>
                        <ArrowDownCircle className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {selectedConversation.messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.isOutgoing ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${msg.isOutgoing ? "bg-sky-500 text-white" : "bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-800"}`}>
                            <p className="text-sm">{msg.content}</p>
                            <div className={`flex items-center gap-1 mt-1 ${msg.isOutgoing ? "text-sky-200" : "text-gray-400"}`}>
                              {msg.isScheduled && <Clock className="w-3 h-3" />}
                              <p className="text-xs">{msg.isScheduled ? `${tx("Geplant für", "Scheduled for")} ${msg.scheduledFor}` : msg.sentAt}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={inboxReply}
                          onChange={e => setInboxReply(e.target.value)}
                          placeholder={tx("Nachricht eingeben...", "Type a message...")}
                          className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                          onKeyDown={e => {
                            if (e.key === "Enter" && inboxReply.trim()) {
                              const newMsg: InboxMessage = { id: Date.now().toString(), content: inboxReply, sentAt: tx("Gerade eben", "Just now"), isOutgoing: true };
                              setConversations(cs => cs.map(c => c.id === selectedConversation.id ? { ...c, messages: [...c.messages, newMsg], lastMessage: inboxReply, lastMessageAt: tx("Gerade eben", "Just now") } : c));
                              setSelectedConversation(prev => prev ? { ...prev, messages: [...prev.messages, newMsg] } : null);
                              setInboxReply("");
                            }
                          }}
                        />
                        <button
                          onClick={() => {
                            if (inboxReply.trim()) {
                              const newMsg: InboxMessage = { id: Date.now().toString(), content: inboxReply, sentAt: tx("Gerade eben", "Just now"), isOutgoing: true };
                              setConversations(cs => cs.map(c => c.id === selectedConversation.id ? { ...c, messages: [...c.messages, newMsg], lastMessage: inboxReply, lastMessageAt: tx("Gerade eben", "Just now") } : c));
                              setSelectedConversation(prev => prev ? { ...prev, messages: [...prev.messages, newMsg] } : null);
                              setInboxReply("");
                            }
                          }}
                          className="p-3 bg-sky-500 text-white rounded-xl hover:bg-sky-600"
                          title={tx("Senden", "Send")}
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Inbox className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">{tx("Wähle eine Konversation", "Select a conversation")}</p>
                      <p className="text-sm">{tx("Klicke links auf einen Chat um ihn zu öffnen.", "Click on a chat on the left to open it.")}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* IMPORT */}
          {section === "import" && (
            <div className="space-y-6">
              {/* Import Methods */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center"><Globe className="w-5 h-5 text-blue-600" /></div>
                    <h3 className="font-semibold">Sales Navigator</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">{tx("Importiere Leads direkt aus einer Sales Navigator Suche.", "Import leads directly from a Sales Navigator search.")}</p>
                  <div className="flex gap-2">
                    <input type="text" value={importUrl} onChange={e => setImportUrl(e.target.value)} placeholder={tx("Sales Navigator URL...", "Sales Navigator URL...")} className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
                    <button onClick={() => {
                      if (importUrl.trim()) {
                        const totalFound = Math.floor(Math.random() * 400) + 100;
                        const skipped = Math.floor(Math.random() * 30) + 5;
                        const imported = totalFound - skipped;
                        const newEntry: ImportHistoryEntry = { id: Date.now().toString(), source: 'sales_navigator', query: importUrl.trim(), totalFound, imported, skipped, date: new Date().toLocaleDateString("de-DE") };
                        setImportHistory(h => [newEntry, ...h]);
                        setImportUrl('');
                      }
                    }} className="px-4 py-2 bg-sky-500 text-white rounded-xl text-sm font-medium hover:bg-sky-600">Import</button>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center"><Upload className="w-5 h-5 text-emerald-600" /></div>
                    <h3 className="font-semibold">CSV Upload</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">{tx("Lade eine CSV-Datei mit LinkedIn-Profilen hoch.", "Upload a CSV file with LinkedIn profiles.")}</p>
                  <input
                    ref={csvFileInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleCsvFileUpload(file);
                      e.target.value = '';
                    }}
                  />
                  <div
                    onClick={() => csvFileInputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      const file = e.dataTransfer.files?.[0];
                      if (file && file.name.endsWith('.csv')) handleCsvFileUpload(file);
                    }}
                    className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center hover:border-sky-300 transition-colors cursor-pointer"
                  >
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">{tx("CSV hierher ziehen", "Drag CSV here")}</p>
                    <p className="text-xs text-gray-400 mt-1">{tx("oder klicken zum Auswählen", "or click to browse")}</p>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center"><Search className="w-5 h-5 text-purple-600" /></div>
                    <h3 className="font-semibold">LinkedIn Search</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">{tx("Importiere aus einer LinkedIn-Suchergebnis-URL.", "Import from a LinkedIn search result URL.")}</p>
                  <div className="flex gap-2">
                    <input type="text" value={linkedinSearchUrl} onChange={e => setLinkedinSearchUrl(e.target.value)} placeholder={tx("LinkedIn Such-URL...", "LinkedIn search URL...")} className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
                    <button onClick={() => {
                      if (linkedinSearchUrl.trim()) {
                        const totalFound = Math.floor(Math.random() * 300) + 50;
                        const skipped = Math.floor(Math.random() * 25) + 3;
                        const imported = totalFound - skipped;
                        const newEntry: ImportHistoryEntry = { id: Date.now().toString(), source: 'linkedin_search', query: linkedinSearchUrl.trim(), totalFound, imported, skipped, date: new Date().toLocaleDateString("de-DE") };
                        setImportHistory(h => [newEntry, ...h]);
                        setLinkedinSearchUrl('');
                      }
                    }} className="px-4 py-2 bg-sky-500 text-white rounded-xl text-sm font-medium hover:bg-sky-600">Import</button>
                  </div>
                </div>
              </div>

              {/* Import Preview Table */}
              {importedLeads.length > 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <h3 className="font-semibold">{tx("Import-Vorschau", "Import Preview")}</h3>
                      <span className="text-sm text-gray-500">{importedLeads.filter(l => l.isSelected).length} {tx("ausgewählt", "selected")}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {importSuccessCount !== null && (
                        <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 rounded-full text-sm font-medium flex items-center gap-1"><Check className="w-3 h-3" />{importSuccessCount} {tx("Leads importiert", "Leads imported")}</span>
                      )}
                      <button onClick={() => {
                        const eligible = importedLeads.filter(l => l.isSelected && !l.isDuplicate && !l.isBlacklisted);
                        if (eligible.length === 0) return;
                        const count = eligible.length;
                        const eligibleIds = new Set(eligible.map(l => l.id));
                        setImportedLeads(ls => ls.filter(l => !eligibleIds.has(l.id)));
                        const newEntry: ImportHistoryEntry = {
                          id: Date.now().toString(),
                          source: 'csv',
                          query: tx('Manueller Import', 'Manual Import'),
                          totalFound: count,
                          imported: count,
                          skipped: 0,
                          date: new Date().toLocaleDateString("de-DE"),
                        };
                        setImportHistory(h => [newEntry, ...h]);
                        setImportSuccessCount(count);
                        setTimeout(() => setImportSuccessCount(null), 3000);
                      }} className="px-4 py-2 bg-sky-500 text-white rounded-xl text-sm font-medium hover:bg-sky-600 flex items-center gap-2"><Download className="w-4 h-4" />{tx("Importieren", "Import")}</button>
                    </div>
                  </div>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-sm text-gray-500">
                        <th className="py-3 px-4 font-medium">
                          <input type="checkbox" checked={importedLeads.filter(l => !l.isDuplicate && !l.isBlacklisted).every(l => l.isSelected)} onChange={e => setImportedLeads(ls => ls.map(l => l.isDuplicate || l.isBlacklisted ? l : { ...l, isSelected: e.target.checked }))} className="rounded" />
                        </th>
                        <th className="py-3 px-4 font-medium">{tx("Name", "Name")}</th>
                        <th className="py-3 px-4 font-medium">{tx("Position", "Title")}</th>
                        <th className="py-3 px-4 font-medium">{tx("Unternehmen", "Company")}</th>
                        <th className="py-3 px-4 font-medium">{tx("Branche", "Industry")}</th>
                        <th className="py-3 px-4 font-medium">{tx("Standort", "Location")}</th>
                        <th className="py-3 px-4 font-medium">{tx("Status", "Status")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importedLeads.map(lead => (
                        <tr key={lead.id} className={`border-b border-gray-50 dark:border-gray-800 ${lead.isDuplicate || lead.isBlacklisted ? "opacity-50" : ""}`}>
                          <td className="py-3 px-4">
                            <input type="checkbox" checked={lead.isSelected} disabled={lead.isDuplicate || lead.isBlacklisted} onChange={e => setImportedLeads(ls => ls.map(l => l.id === lead.id ? { ...l, isSelected: e.target.checked } : l))} className="rounded" />
                          </td>
                          <td className="py-3 px-4 font-medium">{lead.name}</td>
                          <td className="py-3 px-4 text-gray-500">{lead.title}</td>
                          <td className="py-3 px-4 text-gray-500">{lead.company}</td>
                          <td className="py-3 px-4 text-gray-500">{lead.industry}</td>
                          <td className="py-3 px-4 text-gray-500">{lead.location}</td>
                          <td className="py-3 px-4">
                            {lead.isDuplicate && <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-600 rounded-full">{tx("Duplikat", "Duplicate")}</span>}
                            {lead.isBlacklisted && <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-full">{tx("Blacklisted", "Blacklisted")}</span>}
                            {!lead.isDuplicate && !lead.isBlacklisted && <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-600 rounded-full">{tx("Bereit", "Ready")}</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Blacklist Manager */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2"><Shield className="w-5 h-5 text-red-500" />{tx("Blacklist", "Blacklist")}</h3>
                  <button onClick={() => setShowBlacklistModal(true)} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-medium hover:bg-gray-200 flex items-center gap-2"><Plus className="w-4 h-4" />{tx("Hinzufügen", "Add")}</button>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-sm text-gray-500">
                      <th className="py-3 px-4 font-medium">{tx("Typ", "Type")}</th>
                      <th className="py-3 px-4 font-medium">{tx("Wert", "Value")}</th>
                      <th className="py-3 px-4 font-medium">{tx("Grund", "Reason")}</th>
                      <th className="py-3 px-4 font-medium">{tx("Datum", "Date")}</th>
                      <th className="py-3 px-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {blacklist.map(entry => (
                      <tr key={entry.id} className="border-b border-gray-50 dark:border-gray-800">
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${entry.type === "company" ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"}`}>
                            {entry.type === "company" ? tx("Unternehmen", "Company") : tx("Person", "Person")}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium">{entry.value}</td>
                        <td className="py-3 px-4 text-gray-500">{entry.reason}</td>
                        <td className="py-3 px-4 text-gray-400 text-sm">{formatDate(entry.addedAt, lang)}</td>
                        <td className="py-3 px-4">
                          <button onClick={() => setBlacklist(b => b.filter(x => x.id !== entry.id))} className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg" title={tx("Entfernen", "Remove")}><Trash2 className="w-4 h-4 text-red-500" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Blacklist Add Modal */}
              {showBlacklistModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowBlacklistModal(false)} />
                  <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
                    <button onClick={() => setShowBlacklistModal(false)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl" title={tx("Schließen", "Close")}><X className="w-5 h-5 text-gray-400" /></button>
                    <h2 className="text-xl font-bold mb-6">{tx("Zur Blacklist hinzufügen", "Add to Blacklist")}</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-500 block mb-2">{tx("Typ", "Type")}</label>
                        <div className="flex gap-2">
                          <button onClick={() => setBlacklistFormType('company')} className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${blacklistFormType === 'company' ? 'bg-sky-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200'}`}>{tx("Unternehmen", "Company")}</button>
                          <button onClick={() => setBlacklistFormType('person')} className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${blacklistFormType === 'person' ? 'bg-sky-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200'}`}>{tx("Person", "Person")}</button>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500 block mb-2">{blacklistFormType === 'company' ? tx("Unternehmen", "Company") : tx("Name", "Name")}</label>
                        <input type="text" value={blacklistFormValue} onChange={e => setBlacklistFormValue(e.target.value)} placeholder={blacklistFormType === 'company' ? tx("z.B. Konkurrenz GmbH", "e.g. Competitor Inc.") : tx("z.B. Max Mustermann", "e.g. John Doe")} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
                      </div>
                      <div>
                        <label className="text-sm text-gray-500 block mb-2">{tx("Grund", "Reason")}</label>
                        <input type="text" value={blacklistFormReason} onChange={e => setBlacklistFormReason(e.target.value)} placeholder={tx("z.B. Wettbewerber", "e.g. Competitor")} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button
                        disabled={!blacklistFormValue.trim()}
                        onClick={() => {
                          const newEntry: BlacklistEntry = { id: Date.now().toString(), type: blacklistFormType, value: blacklistFormValue.trim(), reason: blacklistFormReason.trim(), addedAt: new Date().toLocaleDateString("de-DE") };
                          setBlacklist(b => [...b, newEntry]);
                          setBlacklistFormType('company');
                          setBlacklistFormValue('');
                          setBlacklistFormReason('');
                          setShowBlacklistModal(false);
                        }}
                        className="flex-1 py-3 bg-sky-500 text-white font-medium rounded-xl hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >{tx("Hinzufügen", "Add")}</button>
                      <button onClick={() => setShowBlacklistModal(false)} className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium rounded-xl hover:bg-gray-200">{tx("Abbrechen", "Cancel")}</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Import History */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="font-semibold">{tx("Import-Verlauf", "Import History")}</h3>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-sm text-gray-500">
                      <th className="py-3 px-4 font-medium">{tx("Quelle", "Source")}</th>
                      <th className="py-3 px-4 font-medium">{tx("Suchanfrage", "Query")}</th>
                      <th className="py-3 px-4 font-medium text-right">{tx("Gefunden", "Found")}</th>
                      <th className="py-3 px-4 font-medium text-right">{tx("Importiert", "Imported")}</th>
                      <th className="py-3 px-4 font-medium text-right">{tx("Übersprungen", "Skipped")}</th>
                      <th className="py-3 px-4 font-medium">{tx("Datum", "Date")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importHistory.map(entry => (
                      <tr key={entry.id} className="border-b border-gray-50 dark:border-gray-800">
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${entry.source === "sales_navigator" ? "bg-blue-100 text-blue-600" : entry.source === "csv" ? "bg-emerald-100 text-emerald-600" : "bg-purple-100 text-purple-600"}`}>
                            {entry.source === "sales_navigator" ? "Sales Nav" : entry.source === "csv" ? "CSV" : "LinkedIn"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500 text-sm">{entry.query}</td>
                        <td className="py-3 px-4 text-right">{entry.totalFound}</td>
                        <td className="py-3 px-4 text-right text-emerald-500 font-medium">{entry.imported}</td>
                        <td className="py-3 px-4 text-right text-gray-400">{entry.skipped}</td>
                        <td className="py-3 px-4 text-gray-400 text-sm">{formatDate(entry.date, lang)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {section === "settings" && (
            <div className="space-y-6 max-w-4xl">
              {/* Tab Navigation */}
              <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
                {([
                  { key: "account" as const, label: tx("Account", "Account") },
                  { key: "safety" as const, label: tx("Sicherheit", "Safety") },
                  { key: "integrations" as const, label: tx("Integrationen", "Integrations") },
                  { key: "triggers" as const, label: "Triggers" },
                ]).map(tab => (
                  <button key={tab.key} onClick={() => setSettingsTab(tab.key)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${settingsTab === tab.key ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>{tab.label}</button>
                ))}
              </div>

              {/* Account Tab */}
              {settingsTab === "account" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">{tx("LinkedIn Account", "LinkedIn Account")}</h2>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">K</div>
                        <div><h3 className="font-semibold text-lg">Klaus Müller</h3><p className="text-gray-500">CEO @ Flowstack GmbH</p><p className="text-sm text-emerald-500 flex items-center gap-1 mt-1"><Check className="w-4 h-4" />{tx("Verbunden", "Connected")}</p></div>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"><p className="text-sm text-gray-500 mb-1">{tx("Verbindungen", "Connections")}</p><p className="text-2xl font-bold">4,821</p></div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"><p className="text-sm text-gray-500 mb-1">{tx("Follower", "Followers")}</p><p className="text-2xl font-bold">12,450</p></div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"><p className="text-sm text-gray-500 mb-1">{tx("Profilaufrufe (7T)", "Profile views (7d)")}</p><p className="text-2xl font-bold">892</p></div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold mb-4">{tx("Outreach Limits", "Outreach Limits")}</h2>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 space-y-4">
                      {[{ key: "dailyConnections", label: tx("Verbindungsanfragen pro Tag", "Connection requests per day"), max: 100 }, { key: "dailyMessages", label: tx("Nachrichten pro Tag", "Messages per day"), max: 150 }, { key: "dailyViews", label: tx("Profilbesuche pro Tag", "Profile visits per day"), max: 200 }].map(limit => (
                        <div key={limit.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                          <span>{limit.label}</span>
                          <div className="flex items-center gap-4">
                            <input type="range" min="5" max={limit.max} value={settingsData[limit.key as keyof typeof settingsData] as number} onChange={e => setSettingsData(s => ({ ...s, [limit.key]: Number(e.target.value) }))} className="w-32" />
                            <span className="font-medium w-12 text-right">{settingsData[limit.key as keyof typeof settingsData]}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold mb-4">{tx("Benachrichtigungen", "Notifications")}</h2>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 space-y-4">
                      {([{ key: "notifyConnections", label: tx("Neue Verbindungen", "New connections") }, { key: "notifyReplies", label: tx("Neue Antworten", "New replies") }, { key: "notifyEngagement", label: tx("Post Performance Updates", "Post performance updates") }, { key: "dailyReport", label: tx("Täglicher Report", "Daily report") }] as const).map(setting => (
                        <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                          <span>{setting.label}</span>
                          <button onClick={() => handleToggleSetting(setting.key)} className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200 ${settingsData[setting.key] ? "bg-sky-500" : "bg-gray-200 dark:bg-gray-600"}`}>
                            <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-1 ring-black/5 transition-transform duration-200 ease-in-out ${settingsData[setting.key] ? "translate-x-6" : "translate-x-1"}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Reset Data */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4">{tx("Daten zurücksetzen", "Reset Data")}</h2>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-red-200 dark:border-red-500/30">
                      <p className="text-sm text-gray-500 mb-4">{tx("Setzt alle Demo-Daten (Sequenzen, Import, Blacklist, Webhooks, Trigger, CRM-Verbindungen, Safety-Einstellungen) auf den Ausgangszustand zurück.", "Resets all demo data (sequences, import, blacklist, webhooks, triggers, CRM connections, safety settings) to the initial state.")}</p>
                      {resetSuccess && (
                        <div className="mb-4 px-4 py-2 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 rounded-xl text-sm font-medium inline-flex items-center gap-2"><Check className="w-4 h-4" />{tx("Daten zurückgesetzt!", "Data reset!")}</div>
                      )}
                      {!showResetConfirm ? (
                        <button onClick={() => setShowResetConfirm(true)} className="px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 dark:hover:bg-red-500/20 flex items-center gap-2"><Trash2 className="w-4 h-4" />{tx("Alle Daten zurücksetzen", "Reset all data")}</button>
                      ) : (
                        <div className="flex items-center gap-3">
                          <p className="text-sm text-red-600 font-medium">{tx("Bist du sicher?", "Are you sure?")}</p>
                          <button onClick={handleResetAllData} className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600">{tx("Ja, zurücksetzen", "Yes, reset")}</button>
                          <button onClick={() => setShowResetConfirm(false)} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-medium hover:bg-gray-200">{tx("Abbrechen", "Cancel")}</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Safety Tab */}
              {settingsTab === "safety" && (
                <div className="space-y-6">
                  {/* Account Health Score */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                    <h3 className="font-semibold mb-6">{tx("Account-Gesundheit", "Account Health")}</h3>
                    <div className="flex items-center gap-8">
                      <div className="relative w-32 h-32">
                        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                          <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" className="text-gray-100 dark:text-gray-800" strokeWidth="10" />
                          <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" className="text-sky-500" strokeWidth="10" strokeDasharray={`${(safetySettings.accountHealthScore / 100) * 327} 327`} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <p className="text-3xl font-bold">{safetySettings.accountHealthScore}</p>
                            <p className="text-xs text-gray-500">/100</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-emerald-500">{safetySettings.accountHealthScore >= 80 ? tx("Gut", "Good") : safetySettings.accountHealthScore >= 50 ? tx("Mittel", "Fair") : tx("Niedrig", "Low")}</p>
                        <p className="text-sm text-gray-500 mt-1">{tx("Dein Account verhält sich natürlich und sicher.", "Your account behaves naturally and safely.")}</p>
                      </div>
                    </div>
                  </div>

                  {/* Warm-up Mode */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold flex items-center gap-2"><Zap className="w-5 h-5 text-sky-500" />{tx("Warm-up Modus", "Warm-up Mode")}</h3>
                      <button onClick={() => setSafetySettings(s => ({ ...s, warmupEnabled: !s.warmupEnabled }))} className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200 ${safetySettings.warmupEnabled ? "bg-sky-500" : "bg-gray-200 dark:bg-gray-600"}`}>
                        <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-1 ring-black/5 transition-transform duration-200 ease-in-out ${safetySettings.warmupEnabled ? "translate-x-6" : "translate-x-1"}`} />
                      </button>
                    </div>
                    {safetySettings.warmupEnabled && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">{tx("Start-Limit", "Start limit")}</label>
                            <input type="number" value={safetySettings.warmupStartLimit} onChange={e => setSafetySettings(s => ({ ...s, warmupStartLimit: Number(e.target.value) }))} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">{tx("Ziel-Limit", "Target limit")}</label>
                            <input type="number" value={safetySettings.warmupTargetLimit} onChange={e => setSafetySettings(s => ({ ...s, warmupTargetLimit: Number(e.target.value) }))} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">{tx("Tage", "Days")}</label>
                            <input type="number" value={safetySettings.warmupDays} onChange={e => setSafetySettings(s => ({ ...s, warmupDays: Number(e.target.value) }))} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
                          </div>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                          <p className="text-sm text-gray-500 mb-2">{tx("Hochlauf-Vorschau", "Ramp-up Preview")}</p>
                          <p className="text-sm font-medium">{tx("Tag", "Day")} 1: {safetySettings.warmupStartLimit} → {tx("Tag", "Day")} {Math.ceil(safetySettings.warmupDays / 2)}: {Math.round((safetySettings.warmupStartLimit + safetySettings.warmupTargetLimit) / 2)} → {tx("Tag", "Day")} {safetySettings.warmupDays}: {safetySettings.warmupTargetLimit}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Working Hours */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                    <h3 className="font-semibold mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-sky-500" />{tx("Arbeitszeiten", "Working Hours")}</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">{tx("Start", "Start")}</label>
                        <input type="time" value={safetySettings.workingHoursStart} onChange={e => setSafetySettings(s => ({ ...s, workingHoursStart: e.target.value }))} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">{tx("Ende", "End")}</label>
                        <input type="time" value={safetySettings.workingHoursEnd} onChange={e => setSafetySettings(s => ({ ...s, workingHoursEnd: e.target.value }))} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-2">{tx("Aktive Tage", "Active Days")}</label>
                      <div className="flex gap-2">
                        {(lang === "de" ? ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"] : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]).map((day, i) => (
                          <button key={day} onClick={() => setSafetySettings(s => ({ ...s, workingDays: s.workingDays.map((d, idx) => idx === i ? !d : d) }))} className={`w-12 h-10 rounded-xl text-sm font-medium transition-colors ${safetySettings.workingDays[i] ? "bg-sky-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}>{day}</button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Random Delays */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                    <h3 className="font-semibold mb-4">{tx("Zufällige Verzögerungen", "Random Delays")}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">{tx("Minimum (Sek.)", "Minimum (sec)")}</label>
                        <div className="flex items-center gap-3">
                          <input type="range" min="10" max="120" value={safetySettings.minDelay} onChange={e => setSafetySettings(s => ({ ...s, minDelay: Number(e.target.value) }))} className="flex-1" />
                          <span className="font-medium w-12 text-right">{safetySettings.minDelay}s</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">{tx("Maximum (Sek.)", "Maximum (sec)")}</label>
                        <div className="flex items-center gap-3">
                          <input type="range" min="30" max="300" value={safetySettings.maxDelay} onChange={e => setSafetySettings(s => ({ ...s, maxDelay: Number(e.target.value) }))} className="flex-1" />
                          <span className="font-medium w-12 text-right">{safetySettings.maxDelay}s</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Daily Activity */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                    <h3 className="font-semibold mb-4">{tx("Heutige Aktivität", "Today's Activity")}</h3>
                    <div className="space-y-4">
                      {[
                        { label: tx("Verbindungsanfragen", "Connection Requests"), used: 18, max: settingsData.dailyConnections, color: "bg-sky-500" },
                        { label: tx("Nachrichten", "Messages"), used: 32, max: settingsData.dailyMessages, color: "bg-emerald-500" },
                        { label: tx("Profilbesuche", "Profile Visits"), used: 45, max: settingsData.dailyViews, color: "bg-purple-500" },
                      ].map(item => (
                        <div key={item.label}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-500">{item.label}</span>
                            <span className="text-sm font-medium">{item.used}/{item.max}</span>
                          </div>
                          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${Math.min((item.used / item.max) * 100, 100)}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Integrations Tab */}
              {settingsTab === "integrations" && (
                <div className="space-y-6">
                  {/* CRM Cards */}
                  <div>
                    <h3 className="font-semibold mb-4">{tx("CRM-Integrationen", "CRM Integrations")}</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { name: "HubSpot", color: "bg-orange-100 dark:bg-orange-500/20 text-orange-600" },
                        { name: "Salesforce", color: "bg-blue-100 dark:bg-blue-500/20 text-blue-600" },
                        { name: "Pipedrive", color: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600" },
                        { name: "Zoho CRM", color: "bg-red-100 dark:bg-red-500/20 text-red-600" },
                      ].map(crm => {
                        const isConnected = crmConnections[crm.name] || false;
                        return (
                          <div key={crm.name} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 text-center">
                            <div className={`w-12 h-12 rounded-xl ${crm.color} flex items-center justify-center mx-auto mb-3`}>
                              <Link className="w-6 h-6" />
                            </div>
                            <h4 className="font-semibold mb-1">{crm.name}</h4>
                            <p className={`text-xs mb-4 ${isConnected ? 'text-emerald-500 font-medium' : 'text-gray-400'}`}>{isConnected ? tx("Verbunden", "Connected") : tx("Nicht verbunden", "Not connected")}</p>
                            <button onClick={() => setCrmConnections(prev => ({ ...prev, [crm.name]: !isConnected }))} className={`w-full py-2 rounded-xl text-sm font-medium transition-colors ${isConnected ? 'bg-red-50 dark:bg-red-500/10 text-red-600 hover:bg-red-100' : 'bg-sky-500 text-white hover:bg-sky-600'}`}>{isConnected ? tx("Trennen", "Disconnect") : tx("Verbinden", "Connect")}</button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Webhooks */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">{tx("Webhook-Konfiguration", "Webhook Configuration")}</h3>
                      <button onClick={() => setWebhooks(w => [...w, { id: Date.now().toString(), event: "new_lead", url: "", isActive: false }])} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg text-sm hover:bg-gray-200 flex items-center gap-1"><Plus className="w-3 h-3" />{tx("Hinzufügen", "Add")}</button>
                    </div>
                    <div className="space-y-3">
                      {webhooks.map(wh => (
                        <div key={wh.id} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                          <select value={wh.event} onChange={e => setWebhooks(w => w.map(x => x.id === wh.id ? { ...x, event: e.target.value } : x))} className="px-3 py-2 bg-white dark:bg-gray-900 rounded-lg text-sm border border-gray-200 dark:border-gray-700 w-48">
                            <option value="new_lead">{tx("Neuer Lead", "New Lead")}</option>
                            <option value="reply_received">{tx("Antwort erhalten", "Reply Received")}</option>
                            <option value="connection_accepted">{tx("Anfrage akzeptiert", "Connection Accepted")}</option>
                          </select>
                          <input type="text" value={wh.url} onChange={e => setWebhooks(w => w.map(x => x.id === wh.id ? { ...x, url: e.target.value } : x))} placeholder="https://..." className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 rounded-lg text-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-sky-500 outline-none" />
                          <button onClick={() => setWebhooks(w => w.map(x => x.id === wh.id ? { ...x, isActive: !x.isActive } : x))} className={`w-10 h-6 rounded-full relative transition-colors ${wh.isActive ? "bg-sky-500" : "bg-gray-300"}`}>
                            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${wh.isActive ? "left-4" : "left-0.5"}`} />
                          </button>
                          <button
                            onClick={() => { setWebhookTestId(wh.id); setTimeout(() => setWebhookTestId(null), 2000); }}
                            className={`px-3 py-2 rounded-lg text-sm ${webhookTestId === wh.id ? 'bg-emerald-100 text-emerald-600' : 'bg-sky-100 text-sky-600 hover:bg-sky-200'}`}
                          >
                            {webhookTestId === wh.id ? tx("Gesendet!", "Sent!") : tx("Test", "Test")}
                          </button>
                          <button onClick={() => setWebhooks(w => w.filter(x => x.id !== wh.id))} className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg" title={tx("Webhook löschen", "Delete webhook")}><Trash2 className="w-4 h-4 text-red-500" /></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Zapier / Make */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                    <h3 className="font-semibold mb-4">Zapier / Make</h3>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-1">{tx("API-Schlüssel", "API Key")}</p>
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono bg-white dark:bg-gray-900 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 flex-1">sk-****************************a4f2</code>
                          <button onClick={() => navigator.clipboard.writeText('sk-demo-key-1234567890abcdef-a4f2')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg" title={tx("Kopieren", "Copy")}><Copy className="w-4 h-4 text-gray-500" /></button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Google Sheets */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                    <h3 className="font-semibold mb-4">Google Sheets</h3>
                    {googleSheetsConnected ? (
                      <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-emerald-500" />
                          <div>
                            <p className="text-sm font-medium text-emerald-600">{tx("Verbunden", "Connected")}</p>
                            <p className="text-xs text-gray-500 truncate max-w-xs">{googleSheetsUrl}</p>
                          </div>
                        </div>
                        <button onClick={() => { setGoogleSheetsConnected(false); setGoogleSheetsUrl(''); }} className="px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100">{tx("Trennen", "Disconnect")}</button>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <input type="text" value={googleSheetsUrl} onChange={e => setGoogleSheetsUrl(e.target.value)} placeholder={tx("Google Sheets URL...", "Google Sheets URL...")} className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
                        <button onClick={() => { if (googleSheetsUrl.trim()) setGoogleSheetsConnected(true); }} className="px-6 py-3 bg-sky-500 text-white rounded-xl text-sm font-medium hover:bg-sky-600">{tx("Verbinden", "Connect")}</button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Triggers Tab */}
              {settingsTab === "triggers" && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <h3 className="font-semibold flex items-center gap-2"><Zap className="w-5 h-5 text-sky-500" />{tx("Event-basierte Trigger", "Event-based Triggers")}</h3>
                      <button onClick={() => setEventTriggers(t => [...t, { id: Date.now().toString(), event: "job_change", action: "message", templateId: "1", isActive: false }])} className="px-4 py-2 bg-sky-500 text-white rounded-xl text-sm font-medium hover:bg-sky-600 flex items-center gap-2"><Plus className="w-4 h-4" />{tx("Trigger hinzufügen", "Add Trigger")}</button>
                    </div>
                    <div className="divide-y divide-gray-50 dark:divide-gray-800">
                      {eventTriggers.map(trigger => {
                        const eventLabels: Record<string, string> = {
                          job_change: tx("Jobwechsel", "Job Change"),
                          birthday: tx("Geburtstag", "Birthday"),
                          promotion: tx("Beförderung", "Promotion"),
                          new_post: tx("Neuer Post", "New Post"),
                        };
                        const actionLabels: Record<string, string> = {
                          message: tx("Nachricht senden", "Send Message"),
                          like: tx("Liken", "Like"),
                          comment: tx("Kommentieren", "Comment"),
                        };
                        return (
                          <div key={trigger.id} className="p-4 flex items-center gap-4">
                            <div className="flex-1 grid grid-cols-3 gap-4">
                              <div>
                                <label className="text-xs text-gray-500 block mb-1">{tx("Event", "Event")}</label>
                                <select value={trigger.event} onChange={e => setEventTriggers(t => t.map(x => x.id === trigger.id ? { ...x, event: e.target.value as EventTrigger["event"] } : x))} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 hover:border-gray-300 dark:hover:border-gray-600 outline-none transition-colors">
                                  {Object.entries(eventLabels).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 block mb-1">{tx("Aktion", "Action")}</label>
                                <select value={trigger.action} onChange={e => setEventTriggers(t => t.map(x => x.id === trigger.id ? { ...x, action: e.target.value as EventTrigger["action"] } : x))} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 hover:border-gray-300 dark:hover:border-gray-600 outline-none transition-colors">
                                  {Object.entries(actionLabels).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 block mb-1">{tx("Template", "Template")}</label>
                                <select value={trigger.templateId} onChange={e => setEventTriggers(t => t.map(x => x.id === trigger.id ? { ...x, templateId: e.target.value } : x))} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 hover:border-gray-300 dark:hover:border-gray-600 outline-none transition-colors">
                                  {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                              </div>
                            </div>
                            <button onClick={() => setEventTriggers(t => t.map(x => x.id === trigger.id ? { ...x, isActive: !x.isActive } : x))} className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200 ${trigger.isActive ? "bg-sky-500" : "bg-gray-200 dark:bg-gray-600"}`}>
                              <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-1 ring-black/5 transition-transform duration-200 ease-in-out ${trigger.isActive ? "translate-x-6" : "translate-x-1"}`} />
                            </button>
                            <button onClick={() => setEventTriggers(t => t.filter(x => x.id !== trigger.id))} className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg" title={tx("Trigger löschen", "Delete trigger")}><Trash2 className="w-4 h-4 text-red-500" /></button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default function LinkedInDashboardPage() {
  return (
    <LanguageProvider>
      <LinkedInDashboardContent />
    </LanguageProvider>
  );
}
