/**
 * Cold Mail Dashboard – E-Mail Outreach & Sequenzen
 * Kampagnen verwalten, Leads importieren, Templates erstellen, Antworten tracken
 */

import { useState, useEffect, useMemo, useCallback, ReactNode } from "react";
import {
  BarChart3, Mail, Send, Calendar, Search, Settings,
  Plus, X, Trash2, Download, Upload,
  ChevronDown, ChevronLeft, ChevronRight, Check, Filter,
  Sun, Moon, Sparkles,
  FileText, Users, Activity,
  Eye, MessageSquare,
  Inbox, GitBranch, Menu,
  LayoutDashboard, Cpu, Linkedin
} from "lucide-react";
import { LanguageProvider, useLanguage } from '../i18n/LanguageContext';
import { loadCampaigns, saveCampaigns, loadLeads, saveLeads, loadTemplates, saveTemplates } from '../data/coldMailStorage';
import ConfirmDialog, { useModalEsc } from '../components/ui/ConfirmDialog';

// ============================================
// TYPES
// ============================================
type CampaignStatus = 'active' | 'paused' | 'completed' | 'draft';
type LeadStatus = 'new' | 'contacted' | 'replied' | 'interested' | 'meeting_booked' | 'not_interested' | 'bounced';
type SequenceStepType = 'initial' | 'followup' | 'breakup';
type ActiveSection = 'overview' | 'campaigns' | 'leads' | 'templates' | 'inbox' | 'analytics' | 'settings';

interface SequenceStep {
  id: string;
  type: SequenceStepType;
  templateId: string;
  delayDays: number;
  subject: string;
  body: string;
}

interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  createdAt: string;
  updatedAt: string;
  steps: SequenceStep[];
  leadListId: string;
  stats: {
    totalLeads: number;
    sent: number;
    opened: number;
    replied: number;
    bounced: number;
    interested: number;
    meetingsBooked: number;
  };
  sendingSchedule: {
    startTime: string;
    endTime: string;
    maxPerDay: number;
    activeDays: boolean[];
    timezone: string;
  };
}

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  position: string;
  website?: string;
  linkedinUrl?: string;
  phone?: string;
  status: LeadStatus;
  campaignId?: string;
  lastContactedAt?: string;
  notes: string;
  tags: string[];
  customFields: Record<string, string>;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: SequenceStepType;
  variables: string[];
  createdAt: string;
  updatedAt: string;
  stats: {
    sent: number;
    opened: number;
    replied: number;
    openRate: number;
    replyRate: number;
  };
}

interface InboxMessage {
  id: string;
  leadId: string;
  leadName: string;
  leadEmail: string;
  company: string;
  campaignName: string;
  subject: string;
  preview: string;
  receivedAt: string;
  isRead: boolean;
  sentiment: 'positive' | 'neutral' | 'negative';
  reply?: string;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

// ============================================
// COLOR MAPS
// ============================================
const campaignStatusConfig: Record<CampaignStatus, { bg: string; text: string; de: string; en: string }> = {
  active:    { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', de: 'Aktiv', en: 'Active' },
  paused:    { bg: 'bg-yellow-100 dark:bg-yellow-500/20',   text: 'text-yellow-600 dark:text-yellow-400',   de: 'Pausiert', en: 'Paused' },
  completed: { bg: 'bg-gray-100 dark:bg-gray-500/20',       text: 'text-gray-500 dark:text-gray-400',       de: 'Abgeschlossen', en: 'Completed' },
  draft:     { bg: 'bg-blue-100 dark:bg-blue-500/20',       text: 'text-blue-600 dark:text-blue-400',       de: 'Entwurf', en: 'Draft' },
};

const leadStatusConfig: Record<LeadStatus, { bg: string; text: string; de: string; en: string }> = {
  new:             { bg: 'bg-blue-100 dark:bg-blue-500/20',    text: 'text-blue-600 dark:text-blue-400',    de: 'Neu', en: 'New' },
  contacted:       { bg: 'bg-purple-100 dark:bg-purple-500/20', text: 'text-purple-600 dark:text-purple-400', de: 'Kontaktiert', en: 'Contacted' },
  replied:         { bg: 'bg-sky-100 dark:bg-sky-500/20',      text: 'text-sky-600 dark:text-sky-400',      de: 'Geantwortet', en: 'Replied' },
  interested:      { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', de: 'Interessiert', en: 'Interested' },
  meeting_booked:  { bg: 'bg-amber-100 dark:bg-amber-500/20',  text: 'text-amber-600 dark:text-amber-400',  de: 'Meeting gebucht', en: 'Meeting Booked' },
  not_interested:  { bg: 'bg-red-100 dark:bg-red-500/20',      text: 'text-red-600 dark:text-red-400',      de: 'Kein Interesse', en: 'Not Interested' },
  bounced:         { bg: 'bg-gray-100 dark:bg-gray-500/20',    text: 'text-gray-500 dark:text-gray-400',    de: 'Bounced', en: 'Bounced' },
};

const sentimentConfig: Record<string, { bg: string; text: string; de: string; en: string }> = {
  positive: { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-600', de: 'Positiv', en: 'Positive' },
  neutral:  { bg: 'bg-gray-100 dark:bg-gray-500/20',       text: 'text-gray-600',    de: 'Neutral', en: 'Neutral' },
  negative: { bg: 'bg-red-100 dark:bg-red-500/20',         text: 'text-red-600',     de: 'Negativ', en: 'Negative' },
};

const stepTypeLabels: Record<SequenceStepType, { de: string; en: string }> = {
  initial:  { de: 'Erstmail', en: 'Initial' },
  followup: { de: 'Follow-up', en: 'Follow-up' },
  breakup:  { de: 'Breakup', en: 'Breakup' },
};

const leadStatusOrder: LeadStatus[] = ['new', 'contacted', 'replied', 'interested', 'meeting_booked', 'not_interested', 'bounced'];

/** Consistent date formatting helper (respects current language) */
const formatDate = (dateStr: string, lang: string, options?: Intl.DateTimeFormatOptions): string => {
  const locale = lang === 'de' ? 'de-DE' : 'en-US';
  return new Date(dateStr).toLocaleDateString(locale, options ?? { day: '2-digit', month: '2-digit', year: 'numeric' });
};


// ============================================
// DEMO DATA
// ============================================
const DEMO_TEMPLATES: EmailTemplate[] = [
  {
    id: 't1', name: 'Cold Intro – Agentur-Pitch', subject: '{{firstName}}, kurze Frage zu {{company}}',
    body: 'Hi {{firstName}},\n\nich habe gesehen, dass {{company}} im Bereich {{industry}} aktiv ist.\n\nWir helfen Unternehmen wie euch, durch KI-gestützte Automatisierung 40% der manuellen Marketing-Arbeit einzusparen.\n\nHättest du nächste Woche 15 Minuten Zeit für ein kurzes Gespräch?\n\nBeste Grüße,\nKlaus',
    type: 'initial', variables: ['firstName', 'company', 'industry'], createdAt: '2025-01-10T10:00:00Z', updatedAt: '2025-01-10T10:00:00Z',
    stats: { sent: 342, opened: 198, replied: 47, openRate: 57.9, replyRate: 13.7 },
  },
  {
    id: 't2', name: 'Follow-up 1 – Value Add', subject: 'Re: {{firstName}}, kurze Frage zu {{company}}',
    body: 'Hi {{firstName}},\n\nwollte nur kurz nachfragen – ich hatte dir letzte Woche geschrieben.\n\nÜbrigens: Wir haben gerade eine Case Study veröffentlicht, wie wir für einen ähnlichen Kunden die Lead-Generierung um 300% gesteigert haben.\n\nSoll ich dir den Link schicken?\n\nVG Klaus',
    type: 'followup', variables: ['firstName', 'company'], createdAt: '2025-01-10T10:00:00Z', updatedAt: '2025-01-10T10:00:00Z',
    stats: { sent: 245, opened: 156, replied: 38, openRate: 63.7, replyRate: 15.5 },
  },
  {
    id: 't3', name: 'Follow-up 2 – Social Proof', subject: 'Wie {{referenceCompany}} 50 Leads/Monat generiert',
    body: 'Hi {{firstName}},\n\nich möchte nicht nerven – nur ein letztes Mal.\n\n{{referenceCompany}} nutzt unser System seit 3 Monaten und generiert jetzt 50+ qualifizierte Leads pro Monat automatisiert.\n\nFalls das Thema gerade nicht passt, kein Problem. Sag einfach Bescheid und ich melde mich nicht mehr.\n\nBeste Grüße,\nKlaus',
    type: 'followup', variables: ['firstName', 'referenceCompany'], createdAt: '2025-01-15T10:00:00Z', updatedAt: '2025-01-15T10:00:00Z',
    stats: { sent: 180, opened: 95, replied: 22, openRate: 52.8, replyRate: 12.2 },
  },
  {
    id: 't4', name: 'Breakup Mail', subject: 'Soll ich aufhören zu schreiben?',
    body: 'Hi {{firstName}},\n\nich habe dir ein paar Mal geschrieben und keine Antwort bekommen – das ist völlig okay.\n\nFalls du kein Interesse hast, schreib einfach kurz "Nein" und ich lösche dich aus meiner Liste.\n\nFalls du doch neugierig bist: Hier ist ein 2-Minuten-Video das zeigt was wir machen → {{videoLink}}\n\nAlles Gute,\nKlaus',
    type: 'breakup', variables: ['firstName', 'videoLink'], createdAt: '2025-01-20T10:00:00Z', updatedAt: '2025-01-20T10:00:00Z',
    stats: { sent: 120, opened: 78, replied: 31, openRate: 65.0, replyRate: 25.8 },
  },
];

const DEMO_LEADS: Lead[] = [
  { id: 'l1', firstName: 'Thomas', lastName: 'Weber', email: 'thomas.weber@techstart.de', company: 'TechStart GmbH', position: 'CEO', website: 'https://techstart.de', linkedinUrl: 'https://linkedin.com/in/thomasweber', status: 'meeting_booked', campaignId: 'c1', lastContactedAt: '2025-02-05T10:00:00Z', notes: 'Sehr interessiert, Meeting am 12.02.', tags: ['CEO', 'SaaS', 'DACH'], customFields: { industry: 'SaaS' } },
  { id: 'l2', firstName: 'Lisa', lastName: 'Müller', email: 'lisa.mueller@growthlab.io', company: 'GrowthLab', position: 'Head of Marketing', status: 'interested', campaignId: 'c1', lastContactedAt: '2025-02-04T14:00:00Z', notes: 'Will Case Study sehen.', tags: ['Marketing', 'Agency'], customFields: { industry: 'Marketing' } },
  { id: 'l3', firstName: 'Marco', lastName: 'Schmidt', email: 'marco@digitalcraft.de', company: 'DigitalCraft', position: 'Founder', status: 'replied', campaignId: 'c1', lastContactedAt: '2025-02-03T09:00:00Z', notes: '', tags: ['Founder', 'E-Commerce'], customFields: { industry: 'E-Commerce' } },
  { id: 'l4', firstName: 'Sarah', lastName: 'Fischer', email: 'sarah.fischer@brandflow.com', company: 'BrandFlow', position: 'CMO', status: 'contacted', campaignId: 'c1', lastContactedAt: '2025-02-06T11:00:00Z', notes: '', tags: ['CMO', 'B2B'], customFields: { industry: 'B2B Services' } },
  { id: 'l5', firstName: 'Andreas', lastName: 'Klein', email: 'andreas@scaleup.io', company: 'ScaleUp', position: 'CEO', status: 'not_interested', campaignId: 'c1', lastContactedAt: '2025-02-01T08:00:00Z', notes: 'Kein Budget aktuell.', tags: ['CEO', 'Startup'], customFields: { industry: 'FinTech' } },
  { id: 'l6', firstName: 'Julia', lastName: 'Braun', email: 'julia@marketpro.de', company: 'MarketPro GmbH', position: 'Geschäftsführerin', status: 'new', campaignId: 'c2', notes: '', tags: ['GF', 'Marketing'], customFields: { industry: 'Marketing' } },
  { id: 'l7', firstName: 'Florian', lastName: 'Hoffmann', email: 'flo@codecrew.dev', company: 'CodeCrew', position: 'CTO', status: 'bounced', campaignId: 'c1', notes: 'Email bounced – falsche Domain.', tags: ['CTO', 'Dev'], customFields: { industry: 'Software' } },
  { id: 'l8', firstName: 'Anna', lastName: 'Becker', email: 'anna.becker@salesforce-partner.de', company: 'CloudSales', position: 'VP Sales', status: 'contacted', campaignId: 'c2', lastContactedAt: '2025-02-07T15:00:00Z', notes: '', tags: ['VP Sales', 'Enterprise'], customFields: { industry: 'Enterprise Software' } },
  { id: 'l9', firstName: 'Patrick', lastName: 'Lange', email: 'patrick@revops.consulting', company: 'RevOps Consulting', position: 'Managing Partner', status: 'new', notes: '', tags: ['Partner', 'Consulting'], customFields: { industry: 'Consulting' } },
  { id: 'l10', firstName: 'Kathrin', lastName: 'Wolf', email: 'kathrin@innova-digital.de', company: 'Innova Digital', position: 'Head of Growth', status: 'interested', campaignId: 'c2', lastContactedAt: '2025-02-06T09:30:00Z', notes: 'Will Demo sehen nächste Woche.', tags: ['Growth', 'B2B SaaS'], customFields: { industry: 'SaaS' } },
];

const DEMO_CAMPAIGNS: Campaign[] = [
  {
    id: 'c1', name: 'DACH CEO Outreach – Q1', status: 'active',
    createdAt: '2025-01-15T10:00:00Z', updatedAt: '2025-02-07T10:00:00Z',
    steps: [
      { id: 's1', type: 'initial', templateId: 't1', delayDays: 0, subject: '{{firstName}}, kurze Frage zu {{company}}', body: '' },
      { id: 's2', type: 'followup', templateId: 't2', delayDays: 3, subject: 'Re: {{firstName}}, kurze Frage zu {{company}}', body: '' },
      { id: 's3', type: 'followup', templateId: 't3', delayDays: 5, subject: 'Wie {{referenceCompany}} 50 Leads/Monat generiert', body: '' },
      { id: 's4', type: 'breakup', templateId: 't4', delayDays: 7, subject: 'Soll ich aufhören zu schreiben?', body: '' },
    ],
    leadListId: 'list1',
    stats: { totalLeads: 150, sent: 342, opened: 198, replied: 47, bounced: 8, interested: 18, meetingsBooked: 7 },
    sendingSchedule: { startTime: '08:00', endTime: '17:00', maxPerDay: 40, activeDays: [true, true, true, true, true, false, false], timezone: 'Europe/Berlin' },
  },
  {
    id: 'c2', name: 'Marketing Heads – Agentur-Pitch', status: 'active',
    createdAt: '2025-02-01T10:00:00Z', updatedAt: '2025-02-07T14:00:00Z',
    steps: [
      { id: 's5', type: 'initial', templateId: 't1', delayDays: 0, subject: '{{firstName}}, kurze Frage zu {{company}}', body: '' },
      { id: 's6', type: 'followup', templateId: 't2', delayDays: 4, subject: 'Re: {{firstName}}, kurze Frage zu {{company}}', body: '' },
      { id: 's7', type: 'breakup', templateId: 't4', delayDays: 8, subject: 'Soll ich aufhören zu schreiben?', body: '' },
    ],
    leadListId: 'list2',
    stats: { totalLeads: 85, sent: 120, opened: 74, replied: 19, bounced: 3, interested: 8, meetingsBooked: 3 },
    sendingSchedule: { startTime: '09:00', endTime: '16:00', maxPerDay: 25, activeDays: [true, true, true, true, true, false, false], timezone: 'Europe/Berlin' },
  },
  {
    id: 'c3', name: 'E-Commerce Founders – Test', status: 'draft',
    createdAt: '2025-02-05T10:00:00Z', updatedAt: '2025-02-05T10:00:00Z',
    steps: [
      { id: 's8', type: 'initial', templateId: 't1', delayDays: 0, subject: '', body: '' },
    ],
    leadListId: '',
    stats: { totalLeads: 0, sent: 0, opened: 0, replied: 0, bounced: 0, interested: 0, meetingsBooked: 0 },
    sendingSchedule: { startTime: '08:00', endTime: '17:00', maxPerDay: 30, activeDays: [true, true, true, true, true, false, false], timezone: 'Europe/Berlin' },
  },
];

const DEMO_INBOX: InboxMessage[] = [
  { id: 'm1', leadId: 'l1', leadName: 'Thomas Weber', leadEmail: 'thomas.weber@techstart.de', company: 'TechStart GmbH', campaignName: 'DACH CEO Outreach – Q1', subject: 'Re: Thomas, kurze Frage zu TechStart GmbH', preview: 'Hi Klaus, danke für die Nachricht! Das klingt spannend. Lass uns nächste Woche Dienstag 14 Uhr telefonieren?', receivedAt: '2025-02-05T10:30:00Z', isRead: false, sentiment: 'positive' },
  { id: 'm2', leadId: 'l2', leadName: 'Lisa Müller', leadEmail: 'lisa.mueller@growthlab.io', company: 'GrowthLab', campaignName: 'DACH CEO Outreach – Q1', subject: 'Re: Wie ReferenceCompany 50 Leads/Monat generiert', preview: 'Hey Klaus, das ist interessant. Kannst du mir die Case Study schicken? Wir evaluieren gerade Tools.', receivedAt: '2025-02-04T15:20:00Z', isRead: true, sentiment: 'positive' },
  { id: 'm3', leadId: 'l3', leadName: 'Marco Schmidt', leadEmail: 'marco@digitalcraft.de', company: 'DigitalCraft', campaignName: 'DACH CEO Outreach – Q1', subject: 'Re: Marco, kurze Frage zu DigitalCraft', preview: 'Hi, worum geht es genau? Wir haben aktuell wenig Kapazität für neue Projekte.', receivedAt: '2025-02-03T11:00:00Z', isRead: true, sentiment: 'neutral' },
  { id: 'm4', leadId: 'l5', leadName: 'Andreas Klein', leadEmail: 'andreas@scaleup.io', company: 'ScaleUp', campaignName: 'DACH CEO Outreach – Q1', subject: 'Re: Soll ich aufhören zu schreiben?', preview: 'Bitte keine weiteren Mails. Danke.', receivedAt: '2025-02-01T09:00:00Z', isRead: true, sentiment: 'negative' },
  { id: 'm5', leadId: 'l10', leadName: 'Kathrin Wolf', leadEmail: 'kathrin@innova-digital.de', company: 'Innova Digital', campaignName: 'Marketing Heads – Agentur-Pitch', subject: 'Re: Kathrin, kurze Frage zu Innova Digital', preview: 'Klingt gut! Habt ihr eine Demo die ich mir anschauen kann? Können wir Ende nächster Woche mal sprechen?', receivedAt: '2025-02-06T10:00:00Z', isRead: false, sentiment: 'positive' },
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
  <div className="fixed bottom-20 md:bottom-6 right-6 z-[100] space-y-2">
    {toasts.map(t => (
      <div key={t.id} onClick={() => onDismiss(t.id)} className={`px-5 py-3 rounded-2xl text-white text-sm font-medium shadow-2xl cursor-pointer animate-slide-in-right ${t.type === 'success' ? 'bg-emerald-500' : t.type === 'error' ? 'bg-red-500' : 'bg-purple-500'}`}>
        {t.message}
      </div>
    ))}
  </div>
);

// ============================================
// HELPER COMPONENTS
// ============================================
const CampaignStatusBadge = ({ status, lang }: { status: CampaignStatus; lang: string }) => {
  const c = campaignStatusConfig[status];
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>{lang === 'de' ? c.de : c.en}</span>;
};

const LeadStatusBadge = ({ status, lang }: { status: LeadStatus; lang: string }) => {
  const c = leadStatusConfig[status];
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>{lang === 'de' ? c.de : c.en}</span>;
};

const SentimentBadge = ({ sentiment, lang }: { sentiment: string; lang: string }) => {
  const c = sentimentConfig[sentiment] || sentimentConfig.neutral;
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>{lang === 'de' ? c.de : c.en}</span>;
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

// ============================================
// CAMPAIGN DETAIL MODAL
// ============================================
const CampaignModal = ({ campaign, templates, lang, onClose, onSave, onDelete, addToast }: {
  campaign: Campaign | null; templates: EmailTemplate[]; lang: string; onClose: () => void;
  onSave: (c: Campaign) => void; onDelete: (id: string) => void;
  addToast: (msg: string, type?: Toast['type']) => void;
}) => {
  const tx = (de: string, en: string) => lang === 'de' ? de : en;
  const [editCampaign, setEditCampaign] = useState<Campaign | null>(null);
  const [tab, setTab] = useState<'overview' | 'steps' | 'schedule'>('overview');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useModalEsc(!!campaign, onClose);
  useEffect(() => { if (campaign) setEditCampaign(JSON.parse(JSON.stringify(campaign))); setTab('overview'); setShowDeleteConfirm(false); }, [campaign]);

  const handleSave = () => { if (editCampaign) { onSave({ ...editCampaign, updatedAt: new Date().toISOString() }); addToast(tx('Kampagne gespeichert!', 'Campaign saved!')); } };

  // Ctrl+S / Cmd+S keyboard shortcut
  useEffect(() => {
    if (!campaign) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); handleSave(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  if (!campaign || !editCampaign) return null;

  const handleAddStep = () => {
    const newStep: SequenceStep = { id: Date.now().toString(), type: editCampaign.steps.length === 0 ? 'initial' : 'followup', templateId: templates[0]?.id || '', delayDays: 3, subject: '', body: '' };
    setEditCampaign(prev => prev ? { ...prev, steps: [...prev.steps, newStep] } : prev);
  };

  const handleRemoveStep = (stepId: string) => setEditCampaign(prev => prev ? { ...prev, steps: prev.steps.filter(s => s.id !== stepId) } : prev);

  const updateStep = (stepId: string, field: string, value: unknown) => setEditCampaign(prev => prev ? { ...prev, steps: prev.steps.map(s => s.id === stepId ? { ...s, [field]: value } : s) } : prev);

  const openRate = editCampaign.stats.sent > 0 ? ((editCampaign.stats.opened / editCampaign.stats.sent) * 100).toFixed(1) : '0';
  const replyRate = editCampaign.stats.sent > 0 ? ((editCampaign.stats.replied / editCampaign.stats.sent) * 100).toFixed(1) : '0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-5 sm:p-8 max-w-3xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} title={tx('Schließen', 'Close')} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"><X className="w-5 h-5 text-gray-400" /></button>

        <div className="flex items-center gap-3 mb-6">
          <CampaignStatusBadge status={editCampaign.status} lang={lang} />
          <h2 className="text-2xl font-bold">{editCampaign.name}</h2>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {(['overview', 'steps', 'schedule'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {t === 'overview' ? tx('Übersicht', 'Overview') : t === 'steps' ? tx('Sequenz', 'Sequence') : tx('Zeitplan', 'Schedule')}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500 block mb-2">{tx('Kampagnenname', 'Campaign Name')}</label>
              <input type="text" value={editCampaign.name} onChange={e => setEditCampaign(prev => prev ? { ...prev, name: e.target.value } : prev)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-2">Status</label>
              <div className="flex gap-2">
                {(['draft', 'active', 'paused', 'completed'] as CampaignStatus[]).map(s => (
                  <button key={s} onClick={() => setEditCampaign(prev => prev ? { ...prev, status: s } : prev)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${editCampaign.status === s ? `${campaignStatusConfig[s].bg} ${campaignStatusConfig[s].text}` : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                    {lang === 'de' ? campaignStatusConfig[s].de : campaignStatusConfig[s].en}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
              {[
                { l: tx('Gesendet', 'Sent'), v: editCampaign.stats.sent, c: 'text-sky-600' },
                { l: tx('Geöffnet', 'Opened'), v: `${openRate}%`, c: 'text-purple-600' },
                { l: tx('Geantwortet', 'Replied'), v: `${replyRate}%`, c: 'text-emerald-600' },
                { l: 'Meetings', v: editCampaign.stats.meetingsBooked, c: 'text-amber-600' },
              ].map(s => (
                <div key={s.l} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
                  <p className={`text-xl font-bold ${s.c}`}>{s.v}</p>
                  <p className="text-xs text-gray-500 mt-1">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Steps Tab */}
        {tab === 'steps' && (
          <div className="space-y-4">
            {editCampaign.steps.length === 0 ? (
              <div className="text-center py-12 text-gray-400"><GitBranch className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>{tx('Noch keine Schritte', 'No steps yet')}</p></div>
            ) : (
              editCampaign.steps.map((step, idx) => (
                <div key={step.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-sky-500 text-white text-xs font-bold flex items-center justify-center">{idx + 1}</span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${step.type === 'initial' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600' : step.type === 'breakup' ? 'bg-red-100 dark:bg-red-500/20 text-red-600' : 'bg-purple-100 dark:bg-purple-500/20 text-purple-600'}`}>
                        {lang === 'de' ? stepTypeLabels[step.type].de : stepTypeLabels[step.type].en}
                      </span>
                    </div>
                    <button onClick={() => handleRemoveStep(step.id)} title={tx('Schritt entfernen', 'Remove step')} className="p-1 text-red-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">{tx('Typ', 'Type')}</label>
                      <select value={step.type} onChange={e => updateStep(step.id, 'type', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 hover:border-gray-300 dark:hover:border-gray-600 outline-none transition-colors">
                        <option value="initial">{tx('Erstmail', 'Initial')}</option>
                        <option value="followup">Follow-up</option>
                        <option value="breakup">Breakup</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">{tx('Verzögerung (Tage)', 'Delay (days)')}</label>
                      <input type="number" min="0" max="30" value={step.delayDays} onChange={e => updateStep(step.id, 'delayDays', Number(e.target.value))} className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Template</label>
                    <select value={step.templateId} onChange={e => updateStep(step.id, 'templateId', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 hover:border-gray-300 dark:hover:border-gray-600 outline-none transition-colors">
                      {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">{tx('Betreff (override)', 'Subject (override)')}</label>
                    <input type="text" value={step.subject} onChange={e => updateStep(step.id, 'subject', e.target.value)} placeholder={tx('Leer = Template-Betreff', 'Empty = template subject')} className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
                  </div>
                </div>
              ))
            )}
            <button onClick={handleAddStep} className="w-full py-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-500 hover:border-sky-500 hover:text-sky-500 transition-colors flex items-center justify-center gap-2"><Plus className="w-4 h-4" />{tx('Schritt hinzufügen', 'Add Step')}</button>
          </div>
        )}

        {/* Schedule Tab */}
        {tab === 'schedule' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">{tx('Start', 'Start')}</label>
                <input type="time" value={editCampaign.sendingSchedule.startTime} onChange={e => setEditCampaign(prev => prev ? { ...prev, sendingSchedule: { ...prev.sendingSchedule, startTime: e.target.value } } : prev)} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 outline-none transition-colors" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">{tx('Ende', 'End')}</label>
                <input type="time" value={editCampaign.sendingSchedule.endTime} onChange={e => setEditCampaign(prev => prev ? { ...prev, sendingSchedule: { ...prev.sendingSchedule, endTime: e.target.value } } : prev)} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 outline-none transition-colors" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-2">{tx('Max. E-Mails pro Tag', 'Max emails per day')}: {editCampaign.sendingSchedule.maxPerDay}</label>
              <input type="range" min="5" max="100" value={editCampaign.sendingSchedule.maxPerDay} onChange={e => setEditCampaign(prev => prev ? { ...prev, sendingSchedule: { ...prev.sendingSchedule, maxPerDay: Number(e.target.value) } } : prev)} className="w-full" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-2">{tx('Aktive Tage', 'Active Days')}</label>
              <div className="flex gap-2">
                {(lang === 'de' ? ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']).map((day, i) => (
                  <button key={day} onClick={() => setEditCampaign(prev => prev ? { ...prev, sendingSchedule: { ...prev.sendingSchedule, activeDays: prev.sendingSchedule.activeDays.map((d, idx) => idx === i ? !d : d) } } : prev)} className={`w-12 h-10 rounded-xl text-sm font-medium transition-colors ${editCampaign.sendingSchedule.activeDays[i] ? 'bg-sky-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>{day}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
          <button onClick={handleSave} className="flex-1 py-3 bg-sky-500 text-white font-medium rounded-xl hover:bg-sky-600 transition-colors">{tx('Speichern', 'Save')}</button>
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)} title={tx('Kampagne löschen', 'Delete campaign')} className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-xl hover:bg-red-100"><Trash2 className="w-5 h-5" /></button>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => { onDelete(campaign.id); onClose(); }} className="px-4 py-3 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600">{tx('Ja, löschen', 'Yes, delete')}</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm">{tx('Nein', 'No')}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// LEAD DETAIL MODAL
// ============================================
const LeadModal = ({ lead, lang, onClose, onSave, onDelete, addToast }: {
  lead: Lead | null; lang: string; onClose: () => void;
  onSave: (l: Lead) => void; onDelete: (id: string) => void;
  addToast: (msg: string, type?: Toast['type']) => void;
}) => {
  const tx = (de: string, en: string) => lang === 'de' ? de : en;
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [newTag, setNewTag] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useModalEsc(!!lead, onClose);
  useEffect(() => { if (lead) { setEditLead(JSON.parse(JSON.stringify(lead))); setShowDeleteConfirm(false); } }, [lead]);

  const handleSave = () => { if (editLead) { onSave(editLead); addToast(tx('Lead gespeichert!', 'Lead saved!')); } };

  // Ctrl+S / Cmd+S keyboard shortcut
  useEffect(() => {
    if (!lead) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); handleSave(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  if (!lead || !editLead) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-5 sm:p-8 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} title={tx('Schließen', 'Close')} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"><X className="w-5 h-5 text-gray-400" /></button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white text-lg font-bold">{editLead.firstName[0]}{editLead.lastName[0]}</div>
          <div>
            <h2 className="text-xl font-bold">{editLead.firstName} {editLead.lastName}</h2>
            <p className="text-sm text-gray-500">{editLead.position} @ {editLead.company}</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Status */}
          <div>
            <label className="text-sm text-gray-500 block mb-2">Status</label>
            <div className="flex flex-wrap gap-2">
              {leadStatusOrder.map(s => (
                <button key={s} onClick={() => setEditLead(prev => prev ? { ...prev, status: s } : prev)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${editLead.status === s ? `${leadStatusConfig[s].bg} ${leadStatusConfig[s].text}` : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                  {lang === 'de' ? leadStatusConfig[s].de : leadStatusConfig[s].en}
                </button>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500 block mb-2">{tx('Vorname', 'First Name')}</label>
              <input type="text" value={editLead.firstName} onChange={e => setEditLead(prev => prev ? { ...prev, firstName: e.target.value } : prev)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-2">{tx('Nachname', 'Last Name')}</label>
              <input type="text" value={editLead.lastName} onChange={e => setEditLead(prev => prev ? { ...prev, lastName: e.target.value } : prev)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-500 block mb-2">E-Mail</label>
            <input type="email" value={editLead.email} onChange={e => setEditLead(prev => prev ? { ...prev, email: e.target.value } : prev)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500 block mb-2">{tx('Unternehmen', 'Company')}</label>
              <input type="text" value={editLead.company} onChange={e => setEditLead(prev => prev ? { ...prev, company: e.target.value } : prev)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-2">Position</label>
              <input type="text" value={editLead.position} onChange={e => setEditLead(prev => prev ? { ...prev, position: e.target.value } : prev)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm text-gray-500 block mb-2">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {editLead.tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-100 dark:bg-sky-500/20 text-sky-600 rounded-full text-xs font-medium">
                  {tag}<button onClick={() => setEditLead(prev => prev ? { ...prev, tags: prev.tags.filter(t => t !== tag) } : prev)} title={tx('Tag entfernen', 'Remove tag')} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && newTag.trim()) { setEditLead(prev => prev && !prev.tags.includes(newTag.trim()) ? { ...prev, tags: [...prev.tags, newTag.trim()] } : prev); setNewTag(''); }}} placeholder={tx('Tag hinzufügen...', 'Add tag...')} className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
              <button onClick={() => { if (newTag.trim()) { setEditLead(prev => prev && !prev.tags.includes(newTag.trim()) ? { ...prev, tags: [...prev.tags, newTag.trim()] } : prev); setNewTag(''); }}} title={tx('Tag hinzufügen', 'Add tag')} className="px-3 py-2 bg-sky-500 text-white rounded-xl text-sm hover:bg-sky-600"><Plus className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm text-gray-500 block mb-2">{tx('Notizen', 'Notes')}</label>
            <textarea value={editLead.notes} onChange={e => setEditLead(prev => prev ? { ...prev, notes: e.target.value } : prev)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none resize-none h-20" />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
          <button onClick={handleSave} className="flex-1 py-3 bg-sky-500 text-white font-medium rounded-xl hover:bg-sky-600">{tx('Speichern', 'Save')}</button>
          <button onClick={() => setShowDeleteConfirm(true)} title={tx('Lead löschen', 'Delete lead')} className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-xl hover:bg-red-100"><Trash2 className="w-5 h-5" /></button>
        </div>

        <ConfirmDialog
          open={showDeleteConfirm}
          title={tx('Lead löschen?', 'Delete lead?')}
          message={tx('Dieser Lead wird unwiderruflich gelöscht.', 'This lead will be permanently deleted.')}
          confirmLabel={tx('Löschen', 'Delete')}
          cancelLabel={tx('Abbrechen', 'Cancel')}
          variant="danger"
          onConfirm={() => { onDelete(lead.id); onClose(); }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      </div>
    </div>
  );
};

// ============================================
// TEMPLATE EDITOR MODAL
// ============================================
const TemplateEditorModal = ({ template, lang, onClose, onSave, onDelete, addToast }: {
  template: EmailTemplate | null; lang: string; onClose: () => void;
  onSave: (t: EmailTemplate) => void; onDelete: (id: string) => void;
  addToast: (msg: string, type?: Toast['type']) => void;
}) => {
  const tx = (de: string, en: string) => lang === 'de' ? de : en;
  const [editTpl, setEditTpl] = useState<EmailTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useModalEsc(!!template, onClose);
  useEffect(() => { if (template) { setEditTpl(JSON.parse(JSON.stringify(template))); setShowPreview(false); setShowDeleteConfirm(false); } }, [template]);

  const handleSave = () => { if (editTpl) { onSave({ ...editTpl, updatedAt: new Date().toISOString() }); addToast(tx('Template gespeichert!', 'Template saved!')); } };

  // Ctrl+S / Cmd+S keyboard shortcut
  useEffect(() => {
    if (!template) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); handleSave(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  if (!template || !editTpl) return null;

  const previewBody = editTpl.body.replace(/\{\{(\w+)\}\}/g, (_m, key) => {
    const map: Record<string, string> = { firstName: 'Thomas', lastName: 'Weber', company: 'TechStart GmbH', industry: 'SaaS', position: 'CEO', referenceCompany: 'ClientX GmbH', videoLink: 'https://example.com/demo' };
    return `<span class="bg-sky-100 dark:bg-sky-500/20 text-sky-600 px-1 rounded">${map[key] || key}</span>`;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-5 sm:p-8 max-w-3xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} title={tx('Schließen', 'Close')} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"><X className="w-5 h-5 text-gray-400" /></button>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{tx('Template bearbeiten', 'Edit Template')}</h2>
          <button onClick={() => setShowPreview(!showPreview)} className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${showPreview ? 'bg-sky-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`}>
            <Eye className="w-4 h-4 inline mr-1" />{tx('Vorschau', 'Preview')}
          </button>
        </div>

        {!showPreview ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500 block mb-2">{tx('Template-Name', 'Template Name')}</label>
              <input type="text" value={editTpl.name} onChange={e => setEditTpl(prev => prev ? { ...prev, name: e.target.value } : prev)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-2">{tx('Typ', 'Type')}</label>
              <div className="flex gap-2">
                {(['initial', 'followup', 'breakup'] as SequenceStepType[]).map(t => (
                  <button key={t} onClick={() => setEditTpl(prev => prev ? { ...prev, type: t } : prev)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${editTpl.type === t ? 'bg-sky-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200'}`}>
                    {lang === 'de' ? stepTypeLabels[t].de : stepTypeLabels[t].en}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-2">{tx('Betreff', 'Subject')}</label>
              <input type="text" value={editTpl.subject} onChange={e => setEditTpl(prev => prev ? { ...prev, subject: e.target.value } : prev)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-2">{tx('Inhalt', 'Body')}</label>
              <textarea value={editTpl.body} onChange={e => setEditTpl(prev => prev ? { ...prev, body: e.target.value } : prev)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none resize-none h-48 font-mono" />
              <p className="text-xs text-gray-400 mt-1">{tx('Variablen: {{firstName}}, {{company}}, {{industry}}, ...', 'Variables: {{firstName}}, {{company}}, {{industry}}, ...')}</p>
            </div>
            {editTpl.stats.sent > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="text-center"><p className="text-lg font-bold">{editTpl.stats.sent}</p><p className="text-xs text-gray-500">{tx('Gesendet', 'Sent')}</p></div>
                <div className="text-center"><p className="text-lg font-bold">{editTpl.stats.openRate}%</p><p className="text-xs text-gray-500">{tx('Öffnungsrate', 'Open Rate')}</p></div>
                <div className="text-center"><p className="text-lg font-bold">{editTpl.stats.replyRate}%</p><p className="text-xs text-gray-500">{tx('Antwortrate', 'Reply Rate')}</p></div>
                <div className="text-center"><p className="text-lg font-bold">{editTpl.stats.replied}</p><p className="text-xs text-gray-500">{tx('Antworten', 'Replies')}</p></div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <p className="text-xs text-gray-400 mb-1">{tx('Betreff', 'Subject')}:</p>
              <p className="font-medium" dangerouslySetInnerHTML={{ __html: editTpl.subject.replace(/\{\{(\w+)\}\}/g, (_m, key) => `<span class="bg-sky-100 dark:bg-sky-500/20 text-sky-600 px-1 rounded">${key}</span>`) }} />
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <p className="text-xs text-gray-400 mb-2">{tx('Inhalt', 'Body')}:</p>
              <div className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: previewBody }} />
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
          <button onClick={handleSave} className="flex-1 py-3 bg-sky-500 text-white font-medium rounded-xl hover:bg-sky-600">{tx('Speichern', 'Save')}</button>
          <button onClick={() => setShowDeleteConfirm(true)} title={tx('Template löschen', 'Delete template')} className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-xl hover:bg-red-100"><Trash2 className="w-5 h-5" /></button>
        </div>

        <ConfirmDialog
          open={showDeleteConfirm}
          title={tx('Template löschen?', 'Delete template?')}
          message={tx('Dieses Template wird unwiderruflich gelöscht.', 'This template will be permanently deleted.')}
          confirmLabel={tx('Löschen', 'Delete')}
          cancelLabel={tx('Abbrechen', 'Cancel')}
          variant="danger"
          onConfirm={() => { onDelete(template.id); onClose(); }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      </div>
    </div>
  );
};

// ============================================
// NEW CAMPAIGN MODAL
// ============================================
const NewCampaignModal = ({ isOpen, lang, onClose, onCreate }: {
  isOpen: boolean; lang: string; onClose: () => void;
  onCreate: (name: string) => void;
}) => {
  const tx = (de: string, en: string) => lang === 'de' ? de : en;
  const [name, setName] = useState('');

  useModalEsc(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-5 sm:p-8 max-w-lg w-full mx-4 shadow-2xl">
        <button onClick={onClose} title={tx('Schließen', 'Close')} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"><X className="w-5 h-5 text-gray-400" /></button>
        <h2 className="text-2xl font-bold mb-6">{tx('Neue Kampagne', 'New Campaign')}</h2>
        <div>
          <label className="text-sm text-gray-500 block mb-2">{tx('Kampagnenname', 'Campaign Name')}</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && name.trim()) { onCreate(name.trim()); setName(''); }}} placeholder={tx('z.B. DACH CEO Outreach Q2', 'e.g. DACH CEO Outreach Q2')} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={() => { if (name.trim()) { onCreate(name.trim()); setName(''); }}} disabled={!name.trim()} className="flex-1 py-3 bg-sky-500 text-white font-medium rounded-xl hover:bg-sky-600 disabled:opacity-50">{tx('Erstellen', 'Create')}</button>
          <button onClick={onClose} className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium rounded-xl hover:bg-gray-200">{tx('Abbrechen', 'Cancel')}</button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// NEW LEAD MODAL
// ============================================
const NewLeadModal = ({ isOpen, lang, onClose, onCreate }: {
  isOpen: boolean; lang: string; onClose: () => void;
  onCreate: (firstName: string, lastName: string, email: string, company: string, position: string) => void;
}) => {
  const tx = (de: string, en: string) => lang === 'de' ? de : en;
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');

  useModalEsc(isOpen, onClose);

  if (!isOpen) return null;

  const handleCreate = () => {
    if (firstName.trim() && email.trim()) {
      onCreate(firstName.trim(), lastName.trim(), email.trim(), company.trim(), position.trim());
      setFirstName(''); setLastName(''); setEmail(''); setCompany(''); setPosition('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-5 sm:p-8 max-w-lg w-full mx-4 shadow-2xl">
        <button onClick={onClose} title={tx('Schließen', 'Close')} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"><X className="w-5 h-5 text-gray-400" /></button>
        <h2 className="text-2xl font-bold mb-6">{tx('Neuer Lead', 'New Lead')}</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500 block mb-2">{tx('Vorname', 'First Name')} *</label>
              <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-2">{tx('Nachname', 'Last Name')}</label>
              <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-500 block mb-2">E-Mail *</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500 block mb-2">{tx('Unternehmen', 'Company')}</label>
              <input type="text" value={company} onChange={e => setCompany(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-2">Position</label>
              <input type="text" value={position} onChange={e => setPosition(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={handleCreate} disabled={!firstName.trim() || !email.trim()} className="flex-1 py-3 bg-sky-500 text-white font-medium rounded-xl hover:bg-sky-600 disabled:opacity-50">{tx('Lead erstellen', 'Create Lead')}</button>
          <button onClick={onClose} className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium rounded-xl hover:bg-gray-200">{tx('Abbrechen', 'Cancel')}</button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
const ColdMailDashboardContent = () => {
  const { lang, setLang } = useLanguage();
  const tx = (de: string, en: string) => lang === 'de' ? de : en;

  // UI
  const [section, setSection] = useState<ActiveSection>('overview');
  const [search, setSearch] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  // Filters
  const [campaignStatusFilter, setCampaignStatusFilter] = useState<string>('all');
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>('all');
  const [inboxFilter, setInboxFilter] = useState<string>('all');

  // Data
  const [campaigns, setCampaigns] = useState<Campaign[]>(DEMO_CAMPAIGNS);
  const [leads, setLeads] = useState<Lead[]>(DEMO_LEADS);
  const [templates, setTemplates] = useState<EmailTemplate[]>(DEMO_TEMPLATES);
  const [inboxMessages, setInboxMessages] = useState<InboxMessage[]>(() => {
    try { const s = localStorage.getItem('flowstack-coldmail-inbox'); if (s) return JSON.parse(s); } catch {}
    return DEMO_INBOX;
  });

  // Modals
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);

  // Settings
  const [settingsTab, setSettingsTab] = useState<'general' | 'export' | 'data'>('general');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [dailySendLimit, setDailySendLimit] = useState(() => {
    try { const s = localStorage.getItem('flowstack-coldmail-dailylimit'); if (s) return Number(s); } catch {}
    return 50;
  });
  const [trackOpens, setTrackOpens] = useState(() => {
    try { const s = localStorage.getItem('flowstack-coldmail-trackopens'); if (s) return s === 'true'; } catch {}
    return true;
  });
  const [trackClicks, setTrackClicks] = useState(() => {
    try { const s = localStorage.getItem('flowstack-coldmail-trackclicks'); if (s) return s === 'true'; } catch {}
    return true;
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Toast
  const { toasts, addToast, dismissToast } = useToast();

  // Dark mode
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);
  useEffect(() => {
    document.documentElement.style.backgroundColor = darkMode ? '#000' : '#f9fafb';
    document.body.style.backgroundColor = darkMode ? '#000' : '#f9fafb';
    return () => { document.documentElement.style.removeProperty('background-color'); document.body.style.removeProperty('background-color'); };
  }, [darkMode]);

  // Persistence
  useEffect(() => {
    const sc = loadCampaigns<Campaign>(); if (sc.length > 0) setCampaigns(sc);
    const sl = loadLeads<Lead>(); if (sl.length > 0) setLeads(sl);
    const st = loadTemplates<EmailTemplate>(); if (st.length > 0) setTemplates(st);
  }, []);
  useEffect(() => { saveCampaigns(campaigns); }, [campaigns]);
  useEffect(() => { saveLeads(leads); }, [leads]);
  useEffect(() => { saveTemplates(templates); }, [templates]);
  useEffect(() => { try { localStorage.setItem('flowstack-coldmail-inbox', JSON.stringify(inboxMessages)); } catch {} }, [inboxMessages]);
  useEffect(() => { try { localStorage.setItem('flowstack-coldmail-dailylimit', String(dailySendLimit)); } catch {} }, [dailySendLimit]);
  useEffect(() => { try { localStorage.setItem('flowstack-coldmail-trackopens', String(trackOpens)); } catch {} }, [trackOpens]);
  useEffect(() => { try { localStorage.setItem('flowstack-coldmail-trackclicks', String(trackClicks)); } catch {} }, [trackClicks]);

  // Stats
  const stats = useMemo(() => {
    const allStats = campaigns.reduce((acc, c) => ({
      sent: acc.sent + c.stats.sent,
      opened: acc.opened + c.stats.opened,
      replied: acc.replied + c.stats.replied,
      bounced: acc.bounced + c.stats.bounced,
      interested: acc.interested + c.stats.interested,
      meetings: acc.meetings + c.stats.meetingsBooked,
    }), { sent: 0, opened: 0, replied: 0, bounced: 0, interested: 0, meetings: 0 });
    return {
      ...allStats,
      openRate: allStats.sent > 0 ? ((allStats.opened / allStats.sent) * 100).toFixed(1) : '0',
      replyRate: allStats.sent > 0 ? ((allStats.replied / allStats.sent) * 100).toFixed(1) : '0',
      totalLeads: leads.length,
      activeCampaigns: campaigns.filter(c => c.status === 'active').length,
      unreadInbox: inboxMessages.filter(m => !m.isRead).length,
    };
  }, [campaigns, leads, inboxMessages]);

  // Filtered data
  const filteredCampaigns = useMemo(() => campaigns.filter(c => {
    if (campaignStatusFilter !== 'all' && c.status !== campaignStatusFilter) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [campaigns, campaignStatusFilter, search]);

  const filteredLeads = useMemo(() => leads.filter(l => {
    if (leadStatusFilter !== 'all' && l.status !== leadStatusFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!l.firstName.toLowerCase().includes(s) && !l.lastName.toLowerCase().includes(s) && !l.email.toLowerCase().includes(s) && !l.company.toLowerCase().includes(s)) return false;
    }
    return true;
  }), [leads, leadStatusFilter, search]);

  const filteredInbox = useMemo(() => inboxMessages.filter(m => {
    if (inboxFilter === 'unread' && m.isRead) return false;
    if (inboxFilter === 'positive' && m.sentiment !== 'positive') return false;
    if (search && !m.leadName.toLowerCase().includes(search.toLowerCase()) && !m.subject.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [inboxMessages, inboxFilter, search]);

  // CRUD - Campaigns
  const handleCreateCampaign = (name: string) => {
    const now = new Date().toISOString();
    const c: Campaign = {
      id: Date.now().toString(), name, status: 'draft', createdAt: now, updatedAt: now,
      steps: [], leadListId: '',
      stats: { totalLeads: 0, sent: 0, opened: 0, replied: 0, bounced: 0, interested: 0, meetingsBooked: 0 },
      sendingSchedule: { startTime: '08:00', endTime: '17:00', maxPerDay: 30, activeDays: [true, true, true, true, true, false, false], timezone: 'Europe/Berlin' },
    };
    setCampaigns(prev => [...prev, c]);
    setShowNewCampaignModal(false);
    setSelectedCampaign(c);
    addToast(tx('Kampagne erstellt!', 'Campaign created!'));
  };
  const handleSaveCampaign = (c: Campaign) => setCampaigns(prev => prev.map(x => x.id === c.id ? c : x));
  const handleDeleteCampaign = (id: string) => { setCampaigns(prev => prev.filter(x => x.id !== id)); addToast(tx('Kampagne gelöscht!', 'Campaign deleted!')); };

  // CRUD - Leads
  const handleCreateLead = (firstName: string, lastName: string, email: string, company: string, position: string) => {
    const l: Lead = { id: Date.now().toString(), firstName, lastName, email, company, position, status: 'new', notes: '', tags: [], customFields: {} };
    setLeads(prev => [...prev, l]);
    setShowNewLeadModal(false);
    addToast(tx('Lead erstellt!', 'Lead created!'));
  };
  const handleSaveLead = (l: Lead) => setLeads(prev => prev.map(x => x.id === l.id ? l : x));
  const handleDeleteLead = (id: string) => { setLeads(prev => prev.filter(x => x.id !== id)); addToast(tx('Lead gelöscht!', 'Lead deleted!')); };

  // CRUD - Templates
  const handleCreateTemplate = () => {
    const now = new Date().toISOString();
    const t: EmailTemplate = { id: Date.now().toString(), name: tx('Neues Template', 'New Template'), subject: '', body: '', type: 'initial', variables: [], createdAt: now, updatedAt: now, stats: { sent: 0, opened: 0, replied: 0, openRate: 0, replyRate: 0 } };
    setTemplates(prev => [...prev, t]);
    setSelectedTemplate(t);
    addToast(tx('Template erstellt!', 'Template created!'));
  };
  const handleSaveTemplate = (t: EmailTemplate) => setTemplates(prev => prev.map(x => x.id === t.id ? t : x));
  const handleDeleteTemplate = (id: string) => { setTemplates(prev => prev.filter(x => x.id !== id)); addToast(tx('Template gelöscht!', 'Template deleted!')); };

  // Inbox
  const handleMarkRead = (id: string) => setInboxMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m));

  // Export
  const handleExportCSV = () => {
    const headers = ['FirstName', 'LastName', 'Email', 'Company', 'Position', 'Status', 'Tags', 'Notes'];
    const rows = leads.map(l => [l.firstName, l.lastName, l.email, `"${l.company}"`, `"${l.position}"`, l.status, `"${l.tags.join(', ')}"`, `"${l.notes}"`]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'coldmail-leads.csv'; a.click(); URL.revokeObjectURL(url);
    addToast(tx('CSV exportiert!', 'CSV exported!'));
  };

  const handleExportJSON = () => {
    const data = { campaigns, leads, templates, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'coldmail-backup.json'; a.click(); URL.revokeObjectURL(url);
    addToast(tx('JSON exportiert!', 'JSON exported!'));
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (data.campaigns) setCampaigns(data.campaigns);
        if (data.leads) setLeads(data.leads);
        if (data.templates) setTemplates(data.templates);
        addToast(tx('Daten importiert!', 'Data imported!'));
      } catch { addToast(tx('Fehler beim Import', 'Import error'), 'error'); }
    };
    reader.readAsText(file);
  };

  const handleResetAll = () => {
    setCampaigns(DEMO_CAMPAIGNS); setLeads(DEMO_LEADS); setTemplates(DEMO_TEMPLATES); setInboxMessages(DEMO_INBOX);
    setShowResetConfirm(false); setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
    addToast(tx('Daten zurückgesetzt!', 'Data reset!'));
  };

  const sectionTitles: Record<ActiveSection, string> = {
    overview: 'Dashboard', campaigns: tx('Kampagnen', 'Campaigns'), leads: 'Leads',
    templates: 'Templates', inbox: 'Inbox', analytics: 'Analytics', settings: tx('Einstellungen', 'Settings'),
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Modals */}
      <CampaignModal campaign={selectedCampaign} templates={templates} lang={lang} onClose={() => setSelectedCampaign(null)} onSave={handleSaveCampaign} onDelete={handleDeleteCampaign} addToast={addToast} />
      <LeadModal lead={selectedLead} lang={lang} onClose={() => setSelectedLead(null)} onSave={handleSaveLead} onDelete={handleDeleteLead} addToast={addToast} />
      <TemplateEditorModal template={selectedTemplate} lang={lang} onClose={() => setSelectedTemplate(null)} onSave={handleSaveTemplate} onDelete={handleDeleteTemplate} addToast={addToast} />
      <NewCampaignModal isOpen={showNewCampaignModal} lang={lang} onClose={() => setShowNewCampaignModal(false)} onCreate={handleCreateCampaign} />
      <NewLeadModal isOpen={showNewLeadModal} lang={lang} onClose={() => setShowNewLeadModal(false)} onCreate={handleCreateLead} />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden" onClick={() => setMobileSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 z-40 flex flex-col transition-transform duration-300 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${sidebarCollapsed ? 'lg:-translate-x-full' : 'lg:translate-x-0'}`}>
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center"><Mail className="w-4 h-4 text-white" /></div>
            Cold Mail
          </h1>
          <div className="flex items-center gap-1">
            <button onClick={() => setDarkMode(!darkMode)} title={tx('Dunkelmodus umschalten', 'Toggle dark mode')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
              {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-500" />}
            </button>
            <button onClick={() => { setSidebarCollapsed(true); setMobileSidebarOpen(false); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors" title={tx('Sidebar einklappen', 'Collapse sidebar')}>
              <ChevronLeft className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
        <nav className="px-4 space-y-1 flex-1 overflow-y-auto">
          <p className="text-xs text-gray-400 uppercase font-medium px-4 mb-2">{tx('Übersicht', 'Overview')}</p>
          {([
            { icon: <BarChart3 className="w-5 h-5" />, label: 'Dashboard', key: 'overview' as ActiveSection },
            { icon: <Send className="w-5 h-5" />, label: tx('Kampagnen', 'Campaigns'), key: 'campaigns' as ActiveSection },
          ]).map(i => (
            <button key={i.key} onClick={() => { setSection(i.key); setMobileSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${section === i.key ? 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 font-medium' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>{i.icon}{i.label}</button>
          ))}
          <p className="text-xs text-gray-400 uppercase font-medium px-4 mt-6 mb-2">{tx('Kontakte', 'Contacts')}</p>
          {([
            { icon: <Users className="w-5 h-5" />, label: 'Leads', key: 'leads' as ActiveSection, count: stats.totalLeads },
            { icon: <Inbox className="w-5 h-5" />, label: 'Inbox', key: 'inbox' as ActiveSection, count: stats.unreadInbox },
          ]).map(i => (
            <button key={i.key} onClick={() => { setSection(i.key); setMobileSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${section === i.key ? 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 font-medium' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>{i.icon}{i.label}
              {i.count !== undefined && <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${i.key === 'inbox' && stats.unreadInbox > 0 ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>{i.count}</span>}
            </button>
          ))}
          <p className="text-xs text-gray-400 uppercase font-medium px-4 mt-6 mb-2">Tools</p>
          {([
            { icon: <FileText className="w-5 h-5" />, label: 'Templates', key: 'templates' as ActiveSection },
            { icon: <Activity className="w-5 h-5" />, label: 'Analytics', key: 'analytics' as ActiveSection },
            { icon: <Settings className="w-5 h-5" />, label: tx('Einstellungen', 'Settings'), key: 'settings' as ActiveSection },
          ]).map(i => (
            <button key={i.key} onClick={() => { setSection(i.key); setMobileSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${section === i.key ? 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 font-medium' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>{i.icon}{i.label}</button>
          ))}
        </nav>
        <div className="p-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white">
            <div className="flex items-center gap-2 mb-2"><Sparkles className="w-5 h-5" /><p className="font-semibold">{tx('Pro Tipp', 'Pro Tip')}</p></div>
            <p className="text-sm text-white/80">{tx('Personalisierte Erstmails haben 3x höhere Antwortrate.', 'Personalized initial emails get 3x higher reply rates.')}</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className={`transition-all duration-300 pb-20 md:pb-0 ${sidebarCollapsed ? '' : 'lg:ml-64'}`}>
        <header className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 z-30">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4">
            <div className="flex items-center gap-2">
              <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors" title={tx('Menu offnen', 'Open menu')}><Menu className="w-5 h-5 text-gray-500" /></button>
              {sidebarCollapsed && <button onClick={() => setSidebarCollapsed(false)} title={tx('Sidebar ausklappen', 'Expand sidebar')} className="hidden lg:flex p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"><ChevronRight className="w-5 h-5 text-gray-500" /></button>}
              <div>
              <h1 className="text-xl sm:text-2xl font-bold">{sectionTitles[section]}</h1>
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">{stats.activeCampaigns} {tx('aktive Kampagnen', 'active campaigns')} · {stats.sent} {tx('gesendet', 'sent')} · {stats.replyRate}% {tx('Antwortrate', 'reply rate')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder={tx('Suchen...', 'Search...')} value={search} onChange={e => setSearch(e.target.value)} className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm w-64 focus:ring-2 focus:ring-sky-500 outline-none" />
                {search && <button onClick={() => setSearch('')} title={tx('Suche leeren', 'Clear search')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-gray-400" /></button>}
              </div>
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
                <button onClick={() => setLang('de')} className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${lang === 'de' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>DE</button>
                <button onClick={() => setLang('en')} className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${lang === 'en' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>EN</button>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 space-y-6">

          {/* OVERVIEW */}
          {section === 'overview' && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { t: tx('Gesendet', 'Sent'), v: stats.sent, i: <Send className="w-5 h-5 text-sky-500" />, bg: 'bg-sky-100 dark:bg-sky-500/20' },
                  { t: tx('Öffnungsrate', 'Open Rate'), v: `${stats.openRate}%`, i: <Eye className="w-5 h-5 text-purple-500" />, bg: 'bg-purple-100 dark:bg-purple-500/20' },
                  { t: tx('Antwortrate', 'Reply Rate'), v: `${stats.replyRate}%`, i: <MessageSquare className="w-5 h-5 text-emerald-500" />, bg: 'bg-emerald-100 dark:bg-emerald-500/20' },
                  { t: 'Meetings', v: stats.meetings, i: <Calendar className="w-5 h-5 text-amber-500" />, bg: 'bg-amber-100 dark:bg-amber-500/20' },
                ].map(card => (
                  <div key={card.t} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                    <div className={`p-2.5 rounded-xl ${card.bg} w-fit mb-3`}>{card.i}</div>
                    <p className="text-3xl font-bold">{card.v}</p>
                    <p className="text-sm text-gray-500 mt-1">{card.t}</p>
                  </div>
                ))}
              </div>

              {/* Campaign Overview + Lead Pipeline */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">{tx('Aktive Kampagnen', 'Active Campaigns')}</h3>
                    <button onClick={() => setShowNewCampaignModal(true)} className="text-sm text-sky-500 hover:text-sky-600 font-medium flex items-center gap-1"><Plus className="w-4 h-4" />{tx('Neu', 'New')}</button>
                  </div>
                  <div className="space-y-3">
                    {campaigns.filter(c => c.status === 'active').map(c => {
                      const rr = c.stats.sent > 0 ? ((c.stats.replied / c.stats.sent) * 100).toFixed(1) : '0';
                      return (
                        <div key={c.id} onClick={() => setSelectedCampaign(c)} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-sm">{c.name}</p>
                            <CampaignStatusBadge status={c.status} lang={lang} />
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{c.stats.sent} {tx('gesendet', 'sent')}</span>
                            <span>{rr}% {tx('Antworten', 'replies')}</span>
                            <span>{c.stats.meetingsBooked} Meetings</span>
                          </div>
                        </div>
                      );
                    })}
                    {campaigns.filter(c => c.status === 'active').length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">{tx('Keine aktiven Kampagnen', 'No active campaigns')}</p>
                    )}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                  <h3 className="font-semibold mb-4">{tx('Lead-Pipeline', 'Lead Pipeline')}</h3>
                  <div className="space-y-3">
                    {leadStatusOrder.map(s => {
                      const count = leads.filter(l => l.status === s).length;
                      return (
                        <div key={s}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm">{lang === 'de' ? leadStatusConfig[s].de : leadStatusConfig[s].en}</span>
                            <span className="text-sm font-medium">{count}</span>
                          </div>
                          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${s === 'new' ? 'bg-blue-500' : s === 'contacted' ? 'bg-purple-500' : s === 'replied' ? 'bg-sky-500' : s === 'interested' ? 'bg-emerald-500' : s === 'meeting_booked' ? 'bg-amber-500' : s === 'not_interested' ? 'bg-red-500' : 'bg-gray-400'}`} style={{ width: `${leads.length ? (count / leads.length) * 100 : 0}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Recent Inbox */}
              {inboxMessages.filter(m => !m.isRead).length > 0 && (
                <div>
                  <h3 className="font-semibold mb-4">{tx('Ungelesene Antworten', 'Unread Replies')}</h3>
                  <div className="space-y-2">
                    {inboxMessages.filter(m => !m.isRead).slice(0, 3).map(m => (
                      <div key={m.id} onClick={() => { handleMarkRead(m.id); setSection('inbox'); }} className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 hover:border-sky-200 dark:hover:border-sky-500/30 cursor-pointer transition-all">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-sky-500 rounded-full" />
                            <span className="font-medium text-sm">{m.leadName}</span>
                            <span className="text-xs text-gray-400">{m.company}</span>
                          </div>
                          <SentimentBadge sentiment={m.sentiment} lang={lang} />
                        </div>
                        <p className="text-sm text-gray-500 truncate">{m.preview}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* CAMPAIGNS */}
          {section === 'campaigns' && (
            <>
              <div className="flex items-center gap-3 flex-wrap">
                <CustomDropdown value={campaignStatusFilter} onChange={setCampaignStatusFilter} options={[{ value: 'all', label: tx('Alle Status', 'All Status') }, { value: 'active', label: tx('Aktiv', 'Active') }, { value: 'paused', label: tx('Pausiert', 'Paused') }, { value: 'draft', label: tx('Entwurf', 'Draft') }, { value: 'completed', label: tx('Abgeschlossen', 'Completed') }]} icon={<Filter className="w-4 h-4 text-gray-500" />} />
                {(search || campaignStatusFilter !== 'all') && filteredCampaigns.length !== campaigns.length && (
                  <span className="text-xs text-gray-400">{filteredCampaigns.length} / {campaigns.length}</span>
                )}
                <div className="flex-1" />
                <button onClick={() => setShowNewCampaignModal(true)} className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white text-sm font-medium rounded-xl hover:bg-sky-600"><Plus className="w-4 h-4" />{tx('Neue Kampagne', 'New Campaign')}</button>
              </div>
              {filteredCampaigns.length === 0 ? (
                <div className="text-center py-20"><Send className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" /><p className="text-gray-400">{tx('Keine Kampagnen gefunden', 'No campaigns found')}</p></div>
              ) : (
                <div className="space-y-4">
                  {filteredCampaigns.map(c => {
                    const or = c.stats.sent > 0 ? ((c.stats.opened / c.stats.sent) * 100).toFixed(1) : '0';
                    const rr = c.stats.sent > 0 ? ((c.stats.replied / c.stats.sent) * 100).toFixed(1) : '0';
                    return (
                      <div key={c.id} onClick={() => setSelectedCampaign(c)} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:border-sky-200 dark:hover:border-sky-500/30 hover:shadow-lg cursor-pointer transition-all">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold">{c.name}</h3>
                            <CampaignStatusBadge status={c.status} lang={lang} />
                          </div>
                          <span className="text-xs text-gray-400">{c.steps.length} {tx('Schritte', 'steps')}</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                          {[
                            { l: tx('Gesendet', 'Sent'), v: c.stats.sent },
                            { l: tx('Öffnungsrate', 'Open Rate'), v: `${or}%` },
                            { l: tx('Antwortrate', 'Reply Rate'), v: `${rr}%` },
                            { l: tx('Interessiert', 'Interested'), v: c.stats.interested },
                            { l: 'Meetings', v: c.stats.meetingsBooked },
                          ].map(s => (
                            <div key={s.l} className="text-center">
                              <p className="text-lg font-bold">{s.v}</p>
                              <p className="text-xs text-gray-500">{s.l}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* LEADS */}
          {section === 'leads' && (
            <>
              <div className="flex items-center gap-3 flex-wrap">
                <CustomDropdown value={leadStatusFilter} onChange={setLeadStatusFilter} options={[{ value: 'all', label: tx('Alle Status', 'All Status') }, ...leadStatusOrder.map(s => ({ value: s, label: lang === 'de' ? leadStatusConfig[s].de : leadStatusConfig[s].en }))]} icon={<Filter className="w-4 h-4 text-gray-500" />} />
                {(search || leadStatusFilter !== 'all') && filteredLeads.length !== leads.length && (
                  <span className="text-xs text-gray-400">{filteredLeads.length} / {leads.length}</span>
                )}
                <div className="flex-1" />
                <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-xl hover:bg-gray-200"><Download className="w-4 h-4" />CSV</button>
                <button onClick={() => setShowNewLeadModal(true)} className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white text-sm font-medium rounded-xl hover:bg-sky-600"><Plus className="w-4 h-4" />{tx('Neuer Lead', 'New Lead')}</button>
              </div>
              {filteredLeads.length === 0 ? (
                <div className="text-center py-20"><Users className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" /><p className="text-gray-400">{tx('Keine Leads gefunden', 'No leads found')}</p></div>
              ) : (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead><tr className="border-b border-gray-100 dark:border-gray-800">
                      {[tx('Name', 'Name'), 'E-Mail', tx('Unternehmen', 'Company'), 'Status', 'Tags'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {filteredLeads.map(l => (
                        <tr key={l.id} onClick={() => setSelectedLead(l)} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">{l.firstName[0]}{l.lastName[0]}</div>
                              <div><p className="font-medium text-sm">{l.firstName} {l.lastName}</p><p className="text-xs text-gray-500">{l.position}</p></div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">{l.email}</td>
                          <td className="px-4 py-3 text-sm">{l.company}</td>
                          <td className="px-4 py-3"><LeadStatusBadge status={l.status} lang={lang} /></td>
                          <td className="px-4 py-3"><div className="flex gap-1">{l.tags.slice(0, 2).map(t => <span key={t} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-full text-xs">{t}</span>)}{l.tags.length > 2 && <span className="text-xs text-gray-400">+{l.tags.length - 2}</span>}</div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* TEMPLATES */}
          {section === 'templates' && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{templates.length} Templates</p>
                <button onClick={handleCreateTemplate} className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white text-sm font-medium rounded-xl hover:bg-sky-600"><Plus className="w-4 h-4" />{tx('Neues Template', 'New Template')}</button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {templates.map(t => (
                  <div key={t.id} onClick={() => setSelectedTemplate(t)} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 hover:border-sky-200 dark:hover:border-sky-500/30 hover:shadow-lg cursor-pointer transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-sm">{t.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${t.type === 'initial' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600' : t.type === 'breakup' ? 'bg-red-100 dark:bg-red-500/20 text-red-600' : 'bg-purple-100 dark:bg-purple-500/20 text-purple-600'}`}>
                        {lang === 'de' ? stepTypeLabels[t.type].de : stepTypeLabels[t.type].en}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">{tx('Betreff', 'Subject')}: {t.subject}</p>
                    <p className="text-xs text-gray-400 line-clamp-2 mb-3">{t.body}</p>
                    {t.stats.sent > 0 && (
                      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <div className="text-center"><p className="text-sm font-bold">{t.stats.sent}</p><p className="text-xs text-gray-500">{tx('Gesendet', 'Sent')}</p></div>
                        <div className="text-center"><p className="text-sm font-bold text-purple-600">{t.stats.openRate}%</p><p className="text-xs text-gray-500">{tx('Öffnungen', 'Opens')}</p></div>
                        <div className="text-center"><p className="text-sm font-bold text-emerald-600">{t.stats.replyRate}%</p><p className="text-xs text-gray-500">{tx('Antworten', 'Replies')}</p></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* INBOX */}
          {section === 'inbox' && (
            <>
              <div className="flex items-center gap-3">
                <CustomDropdown value={inboxFilter} onChange={setInboxFilter} options={[{ value: 'all', label: tx('Alle', 'All') }, { value: 'unread', label: tx('Ungelesen', 'Unread') }, { value: 'positive', label: tx('Positiv', 'Positive') }]} icon={<Filter className="w-4 h-4 text-gray-500" />} />
                {(search || inboxFilter !== 'all') && filteredInbox.length !== inboxMessages.length && (
                  <span className="text-xs text-gray-400">{filteredInbox.length} / {inboxMessages.length}</span>
                )}
                <div className="flex-1" />
                <span className="text-sm text-gray-500">{stats.unreadInbox} {tx('ungelesen', 'unread')}</span>
              </div>
              {filteredInbox.length === 0 ? (
                <div className="text-center py-20"><Inbox className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" /><p className="text-gray-400">{tx('Keine Nachrichten', 'No messages')}</p></div>
              ) : (
                <div className="space-y-2">
                  {filteredInbox.map(m => (
                    <div key={m.id} onClick={() => handleMarkRead(m.id)} className={`bg-white dark:bg-gray-900 rounded-xl p-5 border transition-all cursor-pointer ${!m.isRead ? 'border-sky-200 dark:border-sky-500/30 bg-sky-50/30 dark:bg-sky-500/5' : 'border-gray-100 dark:border-gray-800 hover:border-gray-200'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">{m.leadName.split(' ').map(n => n[0]).join('')}</div>
                          <div>
                            <div className="flex items-center gap-2">
                              {!m.isRead && <div className="w-2 h-2 bg-sky-500 rounded-full" />}
                              <p className="font-medium text-sm">{m.leadName}</p>
                              <span className="text-xs text-gray-400">{m.company}</span>
                            </div>
                            <p className="text-xs text-gray-400">{m.campaignName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <SentimentBadge sentiment={m.sentiment} lang={lang} />
                          <span className="text-xs text-gray-400">{formatDate(m.receivedAt, lang)}</span>
                        </div>
                      </div>
                      <p className="text-sm font-medium mb-1">{m.subject}</p>
                      <p className="text-sm text-gray-500">{m.preview}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ANALYTICS */}
          {section === 'analytics' && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                {[
                  { l: tx('Gesendet', 'Sent'), v: stats.sent, c: 'text-sky-600' },
                  { l: tx('Geöffnet', 'Opened'), v: stats.opened, c: 'text-purple-600' },
                  { l: tx('Geantwortet', 'Replied'), v: stats.replied, c: 'text-emerald-600' },
                  { l: tx('Interessiert', 'Interested'), v: stats.interested, c: 'text-amber-600' },
                  { l: 'Meetings', v: stats.meetings, c: 'text-pink-600' },
                  { l: 'Bounced', v: stats.bounced, c: 'text-red-600' },
                ].map(s => (
                  <div key={s.l} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 text-center">
                    <p className={`text-2xl font-bold ${s.c}`}>{s.v}</p>
                    <p className="text-xs text-gray-500 mt-1">{s.l}</p>
                  </div>
                ))}
              </div>

              {/* Per Campaign Stats */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-gray-800 overflow-x-auto">
                <h3 className="font-semibold mb-4">{tx('Kampagnen-Performance', 'Campaign Performance')}</h3>
                <table className="w-full min-w-[500px]">
                  <thead><tr className="border-b border-gray-100 dark:border-gray-800">
                    {[tx('Kampagne', 'Campaign'), tx('Gesendet', 'Sent'), tx('Öffnungsrate', 'Open Rate'), tx('Antwortrate', 'Reply Rate'), 'Meetings'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {campaigns.map(c => {
                      const or = c.stats.sent > 0 ? ((c.stats.opened / c.stats.sent) * 100).toFixed(1) : '0';
                      const rr = c.stats.sent > 0 ? ((c.stats.replied / c.stats.sent) * 100).toFixed(1) : '0';
                      return (
                        <tr key={c.id} className="border-b border-gray-50 dark:border-gray-800">
                          <td className="px-4 py-3"><div className="flex items-center gap-2"><span className="font-medium text-sm">{c.name}</span><CampaignStatusBadge status={c.status} lang={lang} /></div></td>
                          <td className="px-4 py-3 text-sm">{c.stats.sent}</td>
                          <td className="px-4 py-3 text-sm font-medium text-purple-600">{or}%</td>
                          <td className="px-4 py-3 text-sm font-medium text-emerald-600">{rr}%</td>
                          <td className="px-4 py-3 text-sm font-medium text-amber-600">{c.stats.meetingsBooked}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Template Performance */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                <h3 className="font-semibold mb-4">{tx('Template-Performance', 'Template Performance')}</h3>
                <div className="space-y-3">
                  {templates.filter(t => t.stats.sent > 0).map(t => (
                    <div key={t.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <div>
                        <p className="font-medium text-sm">{t.name}</p>
                        <p className="text-xs text-gray-500">{t.stats.sent} {tx('gesendet', 'sent')}</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center"><p className="text-sm font-bold text-purple-600">{t.stats.openRate}%</p><p className="text-xs text-gray-500">{tx('Öffnungen', 'Opens')}</p></div>
                        <div className="text-center"><p className="text-sm font-bold text-emerald-600">{t.stats.replyRate}%</p><p className="text-xs text-gray-500">{tx('Antworten', 'Replies')}</p></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
                    <h3 className="font-semibold mb-4">{tx('Sende-Limits', 'Sending Limits')}</h3>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <span>{tx('Max. E-Mails pro Tag (global)', 'Max emails per day (global)')}</span>
                      <div className="flex items-center gap-4">
                        <input type="range" min="10" max="200" value={dailySendLimit} onChange={e => setDailySendLimit(Number(e.target.value))} className="w-32" />
                        <span className="font-medium w-12 text-right">{dailySendLimit}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 space-y-4">
                    <h3 className="font-semibold mb-4">Tracking</h3>
                    {[
                      { key: 'opens', label: tx('E-Mail Öffnungen tracken', 'Track email opens'), value: trackOpens, toggle: () => setTrackOpens(v => !v) },
                      { key: 'clicks', label: tx('Link-Klicks tracken', 'Track link clicks'), value: trackClicks, toggle: () => setTrackClicks(v => !v) },
                    ].map(s => (
                      <div key={s.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <span>{s.label}</span>
                        <button onClick={s.toggle} className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200 ${s.value ? 'bg-sky-500' : 'bg-gray-200 dark:bg-gray-600'}`}>
                          <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-1 ring-black/5 transition-transform duration-200 ease-in-out ${s.value ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {settingsTab === 'export' && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                    <h3 className="font-semibold mb-4">CSV Export</h3>
                    <p className="text-sm text-gray-500 mb-4">{tx('Exportiere alle Leads als CSV-Datei.', 'Export all leads as a CSV file.')}</p>
                    <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-xl text-sm font-medium hover:bg-sky-600"><Download className="w-4 h-4" />CSV Export</button>
                  </div>
                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                    <h3 className="font-semibold mb-4">JSON Backup</h3>
                    <p className="text-sm text-gray-500 mb-4">{tx('Exportiere oder importiere ein komplettes Backup.', 'Export or import a complete backup.')}</p>
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
                    <p className="text-sm text-gray-500 mb-4">{tx('Setzt alle Daten auf die Demo-Daten zurück.', 'Resets all data to demo data.')}</p>
                    {resetSuccess && <div className="mb-4 px-4 py-2 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 rounded-xl text-sm font-medium inline-flex items-center gap-2"><Check className="w-4 h-4" />{tx('Daten zurückgesetzt!', 'Data reset!')}</div>}
                    {!showResetConfirm ? (
                      <button onClick={() => setShowResetConfirm(true)} className="px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 flex items-center gap-2"><Trash2 className="w-4 h-4" />{tx('Alle Daten zurücksetzen', 'Reset all data')}</button>
                    ) : (
                      <div className="flex items-center gap-3">
                        <p className="text-sm text-red-600 font-medium">{tx('Bist du sicher?', 'Are you sure?')}</p>
                        <button onClick={handleResetAll} className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600">{tx('Ja, zurücksetzen', 'Yes, reset')}</button>
                        <button onClick={() => setShowResetConfirm(false)} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-medium">{tx('Abbrechen', 'Cancel')}</button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* ─── Mobile Bottom Navigation ─── */}
      <nav className="bottom-nav md:hidden">
        {[
          { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', active: false },
          { icon: Mail, label: 'Cold Mail', href: '/cold-mail', active: true },
          { icon: Linkedin, label: 'LinkedIn', href: '/linkedin', active: false },
          { icon: FileText, label: 'Content', href: '/content', active: false },
          { icon: Cpu, label: lang === 'de' ? 'Systeme' : 'Systems', href: '/system', active: false },
        ].map(item => (
          <a key={item.href} href={item.href} className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 transition-colors text-[10px] font-medium ${item.active ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400 dark:text-zinc-500'}`}>
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
};

// ============================================
// EXPORT
// ============================================
export default function ColdMailDashboardPage() {
  return (
    <LanguageProvider>
      <ColdMailDashboardContent />
    </LanguageProvider>
  );
}
