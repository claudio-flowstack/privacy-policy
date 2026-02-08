/**
 * LinkedIn Dashboard - FULLY FUNCTIONAL
 * Outreach, Posts, Message Templates mit A/B Testing
 */

import { useState, useEffect, useMemo, ReactNode } from "react";
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
} from "lucide-react";
import { LanguageProvider, useLanguage } from '../i18n/LanguageContext';

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

type ActiveSection = "dashboard" | "outreach" | "messages" | "posts" | "leads" | "analytics" | "scheduler" | "settings";
type DateRange = "today" | "7d" | "30d" | "90d";
type PostFilter = "all" | "published" | "scheduled" | "draft";

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

const formatNumber = (v: number) => v >= 1000000 ? (v / 1000000).toFixed(1) + "M" : v >= 1000 ? (v / 1000).toFixed(1) + "K" : v.toString();

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
  if (!campaign) return null;
  const template = templates.find(t => t.id === campaign.messageTemplateId);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"><X className="w-5 h-5 text-gray-400" /></button>
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-4 h-4 rounded-full ${campaign.status === "active" ? "bg-emerald-500" : campaign.status === "paused" ? "bg-yellow-500" : "bg-gray-400"}`} />
          <h2 className="text-2xl font-bold">{campaign.name}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4"><p className="text-xs text-gray-500 mb-1">{tx("Anfragen", "Requests")}</p><p className="text-2xl font-bold">{campaign.connectionsSent}</p></div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4"><p className="text-xs text-gray-500 mb-1">{tx("Verbunden", "Connected")}</p><p className="text-2xl font-bold text-sky-500">{campaign.connectionsAccepted}</p><p className="text-xs text-emerald-500">{campaign.acceptRate}%</p></div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4"><p className="text-xs text-gray-500 mb-1">{tx("Antworten", "Replies")}</p><p className="text-2xl font-bold text-purple-500">{campaign.messagesReplied}</p><p className="text-xs text-emerald-500">{campaign.replyRate}%</p></div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4"><p className="text-xs text-gray-500 mb-1">Leads</p><p className="text-2xl font-bold text-orange-500">{campaign.leadsGenerated}</p></div>
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
          <button onClick={() => { onAction("delete", campaign.id); onClose(); }} className="py-3 px-6 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 flex items-center justify-center gap-2"><Trash2 className="w-4 h-4" /></button>
        </div>
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

  useEffect(() => {
    setNotes(lead?.notes || "");
    setNotesSaved(false);
  }, [lead]);

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
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"><X className="w-5 h-5 text-gray-400" /></button>
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
          <button onClick={() => { onDelete(lead.id); onClose(); }} className="py-3 px-4 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
        </div>
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

  useEffect(() => {
    setEditTemplate(template);
    setSelectedVersion(template?.activeVersionId || "");
  }, [template]);

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
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"><X className="w-5 h-5 text-gray-400" /></button>
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
              <button onClick={handleAddVersion} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><Plus className="w-4 h-4 text-gray-500" /></button>
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
                  <span className="text-emerald-500">{v.replyRate}% Reply</span>
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
                <textarea
                  value={currentVersion.content}
                  onChange={e => handleVersionChange(currentVersion.id, e.target.value)}
                  className="w-full h-64 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm resize-none focus:ring-2 focus:ring-sky-500 outline-none"
                  placeholder={tx("Nachricht eingeben... Verwende {{firstName}}, {{company}} als Platzhalter", "Enter message... Use {{firstName}}, {{company}} as placeholders")}
                />
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
          <button onClick={() => { onDelete(editTemplate.id); onClose(); }} className="py-3 px-4 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
};

// Post Modal
const PostModal = ({ post, onClose, onAction }: { post: LinkedInPost | null; onClose: () => void; onAction: (action: string, id: string) => void }) => {
  const { lang } = useLanguage();
  const tx = (de: string, en: string) => lang === 'de' ? de : en;
  if (!post) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-2xl w-full mx-4 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"><X className="w-5 h-5 text-gray-400" /></button>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">{postTypeIcons[post.type]}</div>
          <div>
            <span className={`text-xs px-2 py-1 rounded-full ${post.status === "published" ? "bg-emerald-100 text-emerald-600" : post.status === "scheduled" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}`}>
              {post.status === "published" ? tx("Veröffentlicht", "Published") : post.status === "scheduled" ? tx("Geplant", "Scheduled") : tx("Entwurf", "Draft")}
            </span>
            <p className="text-sm text-gray-500 mt-1">{post.publishedAt}</p>
          </div>
        </div>
        <p className="text-lg mb-6">{post.content}</p>
        {post.status === "published" && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center"><p className="text-2xl font-bold">{formatNumber(post.impressions)}</p><p className="text-xs text-gray-500">{tx("Impressionen", "Impressions")}</p></div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center"><p className="text-2xl font-bold">{formatNumber(post.likes)}</p><p className="text-xs text-gray-500">Likes</p></div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center"><p className="text-2xl font-bold">{post.comments}</p><p className="text-xs text-gray-500">{tx("Kommentare", "Comments")}</p></div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-sky-500">{post.engagementRate}%</p><p className="text-xs text-gray-500">Engagement</p></div>
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={() => { onAction("edit", post.id); onClose(); }} className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium rounded-xl hover:bg-gray-200 flex items-center justify-center gap-2"><Edit3 className="w-4 h-4" />{tx("Bearbeiten", "Edit")}</button>
          <button onClick={() => { onAction("duplicate", post.id); onClose(); }} className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium rounded-xl hover:bg-gray-200 flex items-center justify-center gap-2"><Copy className="w-4 h-4" />{tx("Duplizieren", "Duplicate")}</button>
          <button onClick={() => { onAction("delete", post.id); onClose(); }} className="py-3 px-6 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
        </div>
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
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"><X className="w-5 h-5 text-gray-400" /></button>
        <h2 className="text-2xl font-bold mb-6">{tx("Neue Kampagne erstellen", "Create new campaign")}</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500 block mb-2">{tx("Kampagnenname", "Campaign name")}</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={tx("z.B. CEO & Founder DACH", "e.g. CEO & Founder DACH")} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
          </div>
          <div>
            <label className="text-sm text-gray-500 block mb-2">{tx("Nachrichten-Template", "Message template")}</label>
            <select value={templateId} onChange={e => setTemplateId(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none">
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
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"><X className="w-5 h-5 text-gray-400" /></button>
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
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"><X className="w-5 h-5 text-gray-400" /></button>
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

  useEffect(() => {
    setMessage(data?.message || "");
  }, [data]);

  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-lg w-full mx-4 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"><X className="w-5 h-5 text-gray-400" /></button>
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
  const [section, setSection] = useState<ActiveSection>("dashboard");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [postFilter, setPostFilter] = useState<PostFilter>("all");
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>("all");

  // Data State
  const [notifications, setNotifications] = useState(initialNotifications);
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [templates, setTemplates] = useState(initialTemplates);
  const [posts, setPosts] = useState(initialPosts);
  const [leads, setLeads] = useState(initialLeads);
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

  // Metrics
  const metrics = useMemo(() => {
    const totalConnSent = campaigns.reduce((s, c) => s + c.connectionsSent, 0);
    const totalConnAccepted = campaigns.reduce((s, c) => s + c.connectionsAccepted, 0);
    const totalMsgSent = campaigns.reduce((s, c) => s + c.messagesSent, 0);
    const totalMsgReplied = campaigns.reduce((s, c) => s + c.messagesReplied, 0);
    const totalLeads = campaigns.reduce((s, c) => s + c.leadsGenerated, 0);
    const publishedPosts = posts.filter(p => p.status === "published");
    const totalImpressions = publishedPosts.reduce((s, p) => s + p.impressions, 0);
    const totalEngagements = publishedPosts.reduce((s, p) => s + p.engagements, 0);
    const avgEngRate = publishedPosts.length > 0 ? publishedPosts.reduce((s, p) => s + p.engagementRate, 0) / publishedPosts.length : 0;
    return { totalConnSent, totalConnAccepted, acceptRate: totalConnSent > 0 ? (totalConnAccepted / totalConnSent) * 100 : 0, totalMsgSent, totalMsgReplied, replyRate: totalMsgSent > 0 ? (totalMsgReplied / totalMsgSent) * 100 : 0, totalLeads, totalImpressions, totalEngagements, avgEngRate, totalPosts: publishedPosts.length };
  }, [campaigns, posts]);

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
    if (action === "pause") setCampaigns(c => c.map(x => x.id === id ? { ...x, status: "paused" } : x));
    else if (action === "resume") setCampaigns(c => c.map(x => x.id === id ? { ...x, status: "active" } : x));
    else if (action === "delete") setCampaigns(c => c.filter(x => x.id !== id));
    else if (action === "duplicate") {
      const orig = campaigns.find(c => c.id === id);
      if (orig) setCampaigns(c => [...c, { ...orig, id: Date.now().toString(), name: orig.name + (lang === 'de' ? " (Kopie)" : " (Copy)"), connectionsSent: 0, connectionsAccepted: 0, messagesSent: 0, messagesReplied: 0, leadsGenerated: 0 }]);
    }
    else if (action === "updateLimit" && typeof data === "number") setCampaigns(c => c.map(x => x.id === id ? { ...x, dailyLimit: data } : x));
  };

  const handleLeadStatusChange = (id: string, status: string) => setLeads(l => l.map(x => x.id === id ? { ...x, status: status as OutreachLead["status"] } : x));

  const handleTemplateUpdate = (template: MessageTemplate) => setTemplates(t => t.map(x => x.id === template.id ? template : x));
  const handleDeleteTemplate = (id: string) => setTemplates(t => t.filter(x => x.id !== id));
  const handleDeleteLead = (id: string) => setLeads(l => l.filter(x => x.id !== id));

  const handlePostAction = (action: string, id: string) => {
    if (action === "delete") setPosts(p => p.filter(x => x.id !== id));
    else if (action === "duplicate") {
      const orig = posts.find(p => p.id === id);
      if (orig) setPosts(p => [...p, { ...orig, id: Date.now().toString(), status: "draft", publishedAt: "-", impressions: 0, engagements: 0, likes: 0, comments: 0, shares: 0, saves: 0, clicks: 0, engagementRate: 0 }]);
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
  };

  // Create/Update post
  const handleSavePost = (post: LinkedInPost) => {
    if (posts.find(p => p.id === post.id)) {
      setPosts(p => p.map(x => x.id === post.id ? post : x));
    } else {
      setPosts(p => [...p, post]);
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

  // Dark mode
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  useEffect(() => { document.title = "LinkedIn Dashboard | Flowstack"; }, []);

  const dateLabels: Record<DateRange, string> = lang === 'de' ? { today: "Heute", "7d": "Letzte 7 Tage", "30d": "Letzte 30 Tage", "90d": "Letzte 90 Tage" } : { today: "Today", "7d": "Last 7 days", "30d": "Last 30 days", "90d": "Last 90 days" };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
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
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 z-40 hidden lg:flex flex-col">
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </div>
            LinkedIn
          </h1>
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
            {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-500" />}
          </button>
        </div>
        <nav className="px-4 space-y-1 flex-1 overflow-y-auto">
          <p className="text-xs text-gray-400 uppercase font-medium px-4 mb-2">{tx("Übersicht", "Overview")}</p>
          {([
            { icon: <BarChart3 className="w-5 h-5" />, label: "Dashboard", key: "dashboard" },
            { icon: <UserPlus className="w-5 h-5" />, label: "Outreach", key: "outreach" },
            { icon: <MessageSquare className="w-5 h-5" />, label: tx("Nachrichten", "Messages"), key: "messages" },
            { icon: <FileText className="w-5 h-5" />, label: "Posts", key: "posts" },
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
      <main className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold">{{ dashboard: "Dashboard", outreach: "Outreach", messages: tx("Nachrichten-Templates", "Message Templates"), posts: "Posts", leads: "Leads", analytics: "Analytics", scheduler: "Scheduler", settings: tx("Einstellungen", "Settings") }[section]}</h1>
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
              <CustomDropdown value={dateRange} onChange={setDateRange} options={[{ value: "today", label: tx("Heute", "Today") }, { value: "7d", label: tx("Letzte 7 Tage", "Last 7 days") }, { value: "30d", label: tx("Letzte 30 Tage", "Last 30 days") }, { value: "90d", label: tx("Letzte 90 Tage", "Last 90 days") }]} icon={<Calendar className="w-4 h-4 text-gray-500" />} />
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
                          <p className="text-xs text-gray-400">Leads</p>
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
                      <div><p className="text-xs text-gray-500 mb-1">{tx("Verbindungen", "Connections")}</p><p className="text-lg font-bold">{campaign.connectionsAccepted}<span className="text-gray-400 font-normal">/{campaign.connectionsSent}</span></p><p className="text-xs text-emerald-500">{campaign.acceptRate}%</p></div>
                      <div><p className="text-xs text-gray-500 mb-1">{tx("Antworten", "Replies")}</p><p className="text-lg font-bold">{campaign.messagesReplied}<span className="text-gray-400 font-normal">/{campaign.messagesSent}</span></p><p className="text-xs text-emerald-500">{campaign.replyRate}%</p></div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2"><Target className="w-4 h-4 text-sky-500" /><span className="text-sm font-medium text-sky-500">{campaign.leadsGenerated} Leads</span></div>
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
                      <button onClick={() => setSelectedTemplate(template)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><Edit3 className="w-4 h-4 text-gray-500" /></button>
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
                    <p className="text-xs text-gray-400 mb-4">{post.publishedAt}</p>
                    {post.status === "published" && (
                      <div className="grid grid-cols-4 gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="text-center"><p className="text-lg font-bold">{formatNumber(post.impressions)}</p><p className="text-xs text-gray-500">Views</p></div>
                        <div className="text-center"><p className="text-lg font-bold">{formatNumber(post.likes)}</p><p className="text-xs text-gray-500">Likes</p></div>
                        <div className="text-center"><p className="text-lg font-bold">{post.comments}</p><p className="text-xs text-gray-500">Comments</p></div>
                        <div className="text-center"><p className="text-lg font-bold text-sky-500">{post.engagementRate}%</p><p className="text-xs text-gray-500">Eng.</p></div>
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
                          <td className="py-3 px-4"><a href={lead.profileUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg inline-flex"><ExternalLink className="w-4 h-4 text-gray-400 hover:text-sky-500" /></a></td>
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
                    <thead><tr className="text-left text-sm text-gray-500 border-b border-gray-100 dark:border-gray-800"><th className="pb-3 font-medium">{tx("Kampagne", "Campaign")}</th><th className="pb-3 font-medium text-right">{tx("Gesendet", "Sent")}</th><th className="pb-3 font-medium text-right">Accept %</th><th className="pb-3 font-medium text-right">Reply %</th><th className="pb-3 font-medium text-right">Leads</th><th className="pb-3 font-medium text-right">Conv. %</th></tr></thead>
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
                              + Post
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
                      <div className="flex-1"><p className="font-medium truncate">{post.content}</p><p className="text-sm text-gray-500">{post.publishedAt}</p></div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSelectedPost(post)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"><Edit3 className="w-4 h-4 text-gray-500" /></button>
                        <button onClick={() => handlePostAction("delete", post.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {section === "settings" && (
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
                      <button onClick={() => handleToggleSetting(setting.key)} className={`w-12 h-6 rounded-full relative transition-colors ${settingsData[setting.key] ? "bg-sky-500" : "bg-gray-300"}`}>
                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${settingsData[setting.key] ? "left-6" : "left-0.5"}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
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
