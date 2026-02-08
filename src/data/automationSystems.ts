import type { AutomationSystem } from '@/types/automation';

/**
 * Position helper: convert column/row indices to pixel coordinates.
 *
 * Grid layout:
 *   x = 40 + column * 340   (340px horizontal spacing)
 *   y = 40 + row    * 108   (108px vertical spacing)
 *
 * Column 0 is the leftmost position (x=40).
 * Row 0 is the topmost position (y=40).
 *
 * Example: p(2, 1) → { x: 720, y: 148 }
 */
const p = (col: number, row: number) => ({ x: 40 + col * 340, y: 58 + row * 108 });

export const DEMO_SYSTEMS: AutomationSystem[] = [
  {
    id: 'demo-1',
    name: 'Client Onboarding',
    description: 'Vom Erstgespräch zur fertigen Website, Werbetexten und Google Ads – vollautomatisch.',
    category: 'Marketing',
    icon: 'users',
    status: 'active',
    webhookUrl: '',
    nodes: [
      { id: 'n1', label: 'Onboarding-Gespräch', description: 'Erstgespräch mit dem Kunden', icon: 'users', type: 'trigger', ...p(0, 0) },
      { id: 'n2', label: 'KI-Transkription', description: 'Gespräch wird transkribiert', icon: 'logo-openai', type: 'ai', ...p(1, 0) },
      { id: 'n3', label: 'Werbetexte', description: 'Copy & Headlines generiert', icon: 'logo-google-docs', type: 'output', ...p(2, 0) },
      { id: 'n4', label: 'Website', description: 'Landing Page erstellt', icon: 'globe', type: 'output', ...p(2, 1) },
      { id: 'n5', label: 'Google Ads', description: 'Kampagne aufgesetzt', icon: 'target', type: 'output', ...p(2, 2) },
    ],
    connections: [
      { from: 'n1', to: 'n2' },
      { from: 'n2', to: 'n3' },
      { from: 'n2', to: 'n4' },
      { from: 'n2', to: 'n5' },
    ],
    groups: [
      { id: 'g1', label: 'Eingang', x: 15, y: 8, width: 280, height: 148, color: 'blue' },
      { id: 'g2', label: 'KI-Verarbeitung', x: 355, y: 8, width: 280, height: 148, color: 'purple' },
      { id: 'g3', label: 'Ergebnisse', x: 695, y: 8, width: 280, height: 364, color: 'green' },
    ],
    outputs: [
      { id: 'o1', name: 'Kundenmappe – Schmidt GmbH', type: 'folder', link: 'https://drive.google.com/drive/folders/example1', createdAt: '2025-01-28T14:30:00Z' },
      { id: 'o2', name: 'Gesprächstranskript – Schmidt', type: 'document', link: 'https://docs.google.com/document/d/example2', createdAt: '2025-01-28T15:00:00Z' },
      { id: 'o3', name: 'Werbetext-Paket – Schmidt GmbH', type: 'document', link: 'https://docs.google.com/document/d/example3', createdAt: '2025-01-28T16:30:00Z' },
      { id: 'o4', name: 'Landing Page – schmidt-gmbh.de', type: 'website', link: 'https://schmidt-gmbh.example.com', createdAt: '2025-01-29T10:00:00Z' },
      { id: 'o5', name: 'Google Ads Kampagne – Schmidt', type: 'other', link: 'https://ads.google.com/campaigns/example5', createdAt: '2025-01-29T11:30:00Z' },
    ],
    lastExecuted: '2025-01-29T11:30:00Z',
    executionCount: 12,
  },
  {
    id: 'demo-2',
    name: 'Content Pipeline',
    description: 'Von der Content-Idee zum fertigen Blogpost, Social Media Post und LinkedIn Carousel.',
    category: 'Marketing',
    icon: 'type',
    status: 'active',
    webhookUrl: '',
    nodes: [
      { id: 'n1', label: 'Content-Briefing', description: 'Thema & Zielgruppe definiert', icon: 'clipboard', type: 'trigger', ...p(0, 0) },
      { id: 'n2', label: 'KI-Recherche', description: 'Quellen & Daten gesammelt', icon: 'logo-openai', type: 'ai', ...p(1, 0) },
      { id: 'n3', label: 'Content-Erstellung', description: 'Texte KI-generiert', icon: 'logo-claude', type: 'ai', ...p(2, 0) },
      { id: 'n4', label: 'Blogpost', description: 'Artikel formatiert & bereit', icon: 'logo-notion', type: 'output', ...p(3, 0) },
      { id: 'n5', label: 'Social Media', description: 'Posts für alle Kanäle', icon: 'logo-meta', type: 'output', ...p(3, 1) },
      { id: 'n6', label: 'LinkedIn Carousel', description: 'Slides generiert', icon: 'logo-linkedin', type: 'output', ...p(3, 2) },
    ],
    connections: [
      { from: 'n1', to: 'n2' },
      { from: 'n2', to: 'n3' },
      { from: 'n3', to: 'n4' },
      { from: 'n3', to: 'n5' },
      { from: 'n3', to: 'n6' },
    ],
    outputs: [
      { id: 'o1', name: 'Blog: KI im Mittelstand', type: 'document', link: 'https://docs.google.com/document/d/blog1', createdAt: '2025-01-25T09:00:00Z' },
      { id: 'o2', name: 'Social Media Posts – KW 04', type: 'document', link: 'https://docs.google.com/document/d/social1', createdAt: '2025-01-25T10:30:00Z' },
      { id: 'o3', name: 'LinkedIn Carousel – KI Guide', type: 'image', link: 'https://drive.google.com/file/d/carousel1', createdAt: '2025-01-25T11:00:00Z' },
    ],
    lastExecuted: '2025-01-25T11:00:00Z',
    executionCount: 23,
  },
  {
    id: 'demo-3',
    name: 'Lead Qualifikation',
    description: 'Eingehende Leads automatisch anreichern, bewerten und ins CRM überführen.',
    category: 'Sales',
    icon: 'target',
    status: 'active',
    webhookUrl: '',
    nodes: [
      { id: 'n1', label: 'Lead-Eingang', description: 'Neuer Kontakt empfangen', icon: 'logo-gmail', type: 'trigger', ...p(0, 0) },
      { id: 'n2', label: 'Datenanreicherung', description: 'Firmendaten ergänzt', icon: 'database', type: 'process', ...p(1, 0) },
      { id: 'n3', label: 'KI-Scoring', description: 'Lead-Qualität bewertet', icon: 'logo-openai', type: 'ai', ...p(2, 0) },
      { id: 'n4', label: 'CRM-Eintrag', description: 'In HubSpot angelegt', icon: 'logo-hubspot', type: 'output', ...p(3, 0) },
      { id: 'n5', label: 'Follow-up Mail', description: 'Personalisierte E-Mail', icon: 'logo-gmail', type: 'output', ...p(3, 1) },
      { id: 'n6', label: 'Team-Benachrichtigung', description: 'Sales-Team informiert', icon: 'logo-slack', type: 'output', ...p(2, 1) },
    ],
    connections: [
      { from: 'n1', to: 'n2' },
      { from: 'n2', to: 'n3' },
      { from: 'n3', to: 'n4' },
      { from: 'n3', to: 'n5' },
      { from: 'n2', to: 'n6' },
    ],
    outputs: [
      { id: 'o1', name: 'Lead-Report Januar 2025', type: 'spreadsheet', link: 'https://docs.google.com/spreadsheets/d/report1', createdAt: '2025-01-27T16:00:00Z' },
      { id: 'o2', name: 'Follow-up Mail – Müller AG', type: 'email', link: 'https://mail.google.com/mail/example', createdAt: '2025-01-28T09:00:00Z' },
      { id: 'o3', name: 'CRM Update – 12 neue Kontakte', type: 'other', link: 'https://app.hubspot.com/contacts/example', createdAt: '2025-01-29T14:00:00Z' },
    ],
    lastExecuted: '2025-01-29T14:00:00Z',
    executionCount: 47,
  },
  {
    id: 'demo-4',
    name: 'Report Generator',
    description: 'Daten aus verschiedenen Quellen sammeln, analysieren und als fertigen Report versenden.',
    category: 'Operations',
    icon: 'bar-chart',
    status: 'draft',
    webhookUrl: '',
    nodes: [
      { id: 'n1a', label: 'Google Sheets Import', description: 'Daten aus Sheets', icon: 'logo-google-sheets', type: 'trigger', x: 40, y: 58 },
      { id: 'n1b', label: 'HubSpot Export', description: 'CRM-Daten exportiert', icon: 'logo-hubspot', type: 'trigger', x: 40, y: 58 + 108 },
      { id: 'n2', label: 'Daten zusammenführen', description: 'Quellen vereint', icon: 'database', type: 'process', ...p(1, 0) },
      { id: 'n3', label: 'KI-Analyse', description: 'Muster & Trends erkannt', icon: 'logo-openai', type: 'ai', ...p(2, 0) },
      { id: 'n4', label: 'Report erstellen', description: 'Bericht formatiert', icon: 'logo-google-docs', type: 'process', ...p(3, 0) },
      { id: 'n5', label: 'PDF in Drive', description: 'Als PDF gespeichert', icon: 'logo-google-drive', type: 'output', ...p(4, 0) },
      { id: 'n6', label: 'Dashboard', description: 'Live-Ansicht aktualisiert', icon: 'bar-chart', type: 'output', x: 40 + 4 * 340, y: 58 + 108 },
      { id: 'n7', label: 'E-Mail Versand', description: 'An Team versendet', icon: 'logo-gmail', type: 'output', x: 40 + 4 * 340, y: 58 + 2 * 108 },
    ],
    connections: [
      { from: 'n1a', to: 'n2' },
      { from: 'n1b', to: 'n2' },
      { from: 'n2', to: 'n3' },
      { from: 'n3', to: 'n4' },
      { from: 'n4', to: 'n5' },
      { from: 'n4', to: 'n6' },
      { from: 'n4', to: 'n7' },
    ],
    groups: [
      { id: 'g1', label: 'Datenquellen', x: 15, y: 8, width: 280, height: 256, color: 'blue' },
      { id: 'g2', label: 'Analyse & Verarbeitung', x: 355, y: 8, width: 960, height: 148, color: 'purple' },
      { id: 'g3', label: 'Distribution', x: 1375, y: 8, width: 280, height: 364, color: 'green' },
    ],
    outputs: [
      { id: 'o1', name: 'Monatsbericht Dezember', type: 'document', link: 'https://docs.google.com/document/d/report-dec', createdAt: '2025-01-20T08:00:00Z' },
      { id: 'o2', name: 'Performance Dashboard Q4', type: 'website', link: 'https://dashboard.example.com/q4', createdAt: '2025-01-20T09:00:00Z' },
      { id: 'o3', name: 'Executive Summary Q4', type: 'document', link: 'https://docs.google.com/document/d/exec-q4', createdAt: '2025-01-22T10:00:00Z' },
    ],
    lastExecuted: '2025-01-22T10:00:00Z',
    executionCount: 8,
  },
];

// ─── Storage Keys ──────────────────────────────────────────────────────────────

export const STORAGE_KEY = 'flowstack-automation-systems';
const HIDDEN_DEMOS_KEY = 'flowstack-hidden-demos';

// ─── User Systems CRUD ─────────────────────────────────────────────────────────

export function loadUserSystems(): AutomationSystem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveUserSystems(systems: AutomationSystem[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(systems));
    return true;
  } catch (e) {
    console.warn('localStorage Fehler beim Speichern:', e);
    return false;
  }
}

// ─── Hidden Demo Systems ───────────────────────────────────────────────────────

export function getHiddenDemoIds(): string[] {
  try {
    const stored = localStorage.getItem(HIDDEN_DEMOS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function hideDemoSystem(id: string): void {
  try {
    const hidden = getHiddenDemoIds();
    if (!hidden.includes(id)) {
      localStorage.setItem(HIDDEN_DEMOS_KEY, JSON.stringify([...hidden, id]));
    }
  } catch (e) {
    console.warn('localStorage Fehler:', e);
  }
}

export function unhideDemoSystem(id: string): void {
  try {
    const hidden = getHiddenDemoIds().filter(h => h !== id);
    localStorage.setItem(HIDDEN_DEMOS_KEY, JSON.stringify(hidden));
  } catch (e) {
    console.warn('localStorage Fehler:', e);
  }
}

// ─── Aggregation ───────────────────────────────────────────────────────────────

export function getVisibleDemoSystems(): AutomationSystem[] {
  const hidden = getHiddenDemoIds();
  return DEMO_SYSTEMS.filter(d => !hidden.includes(d.id));
}

export function getAllSystems(): AutomationSystem[] {
  return [...getVisibleDemoSystems(), ...loadUserSystems()];
}

export function findSystem(id: string): AutomationSystem | undefined {
  return getAllSystems().find(s => s.id === id);
}
