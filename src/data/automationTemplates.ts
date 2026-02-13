import type { AutomationSystem } from '@/types/automation';

/**
 * Position helper: convert column/row indices to pixel coordinates.
 * Row spacing 160 = NODE_H(92) + 40(label pad) + 16(bottom pad) + 12(gap)
 */
const p = (col: number, row: number) => ({ x: 40 + col * 340, y: 58 + row * 160 });

// ─── User Templates Storage ───────────────────────────────────────────────────

const USER_TEMPLATES_KEY = 'flowstack-user-templates';

export function loadUserTemplates(): AutomationSystem[] {
  try {
    const stored = localStorage.getItem(USER_TEMPLATES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveUserTemplates(templates: AutomationSystem[]): void {
  try {
    localStorage.setItem(USER_TEMPLATES_KEY, JSON.stringify(templates));
  } catch (e) {
    console.warn('localStorage Fehler beim Speichern:', e);
  }
}

export function deleteUserTemplate(id: string): AutomationSystem[] {
  const templates = loadUserTemplates().filter(t => t.id !== id);
  saveUserTemplates(templates);
  return templates;
}

// ─── Built-in Templates ───────────────────────────────────────────────────────

export const WORKFLOW_TEMPLATES: AutomationSystem[] = [
  // ─── Lead Generation & Nurturing ─────────────────────────────────────────────
  {
    id: 'tpl-lead-gen',
    name: 'Lead Generation & Nurturing',
    description: 'Vom Lead-Eingang über KI-Qualifizierung und Multi-Channel-Nurturing bis zur Sales-Übergabe — vollautomatisiert.',
    category: 'Agentur',
    icon: 'target',
    status: 'draft',
    webhookUrl: '',
    nodes: [
      // Phase 1: Lead-Erfassung (col 0-1)
      { id: 'lg1',  label: 'Formular-Eingang',      description: 'Neue Anfrage über Typeform erhalten',          icon: 'logo-typeform',        type: 'trigger', ...p(0, 1) },
      { id: 'lg2',  label: 'Website Lead',           description: 'Lead über Landing Page erfasst',               icon: 'logo-wordpress',       type: 'trigger', ...p(0, 2) },
      { id: 'lg3',  label: 'CRM-Eintrag',            description: 'Kontakt in HubSpot anlegen & taggen',          icon: 'logo-hubspot',         type: 'process', ...p(1, 1) },
      { id: 'lg4',  label: 'Eingangsbestätigung',    description: 'Automatische Bestätigungs-Mail',               icon: 'logo-gmail',           type: 'output',  ...p(1, 2) },

      // Phase 2: Qualifizierung (col 2)
      { id: 'lg5',  label: 'KI-Lead-Scoring',        description: 'Automatische Bewertung nach Kriterien',        icon: 'logo-openai',          type: 'ai',      ...p(2, 1) },
      { id: 'lg6',  label: 'Segmentierung',          description: 'Hot / Warm / Cold einstufen',                  icon: 'logo-google-sheets',   type: 'process', ...p(2, 2) },

      // Phase 3: Nurturing Lanes (col 3-5)
      // Lane A: E-Mail (row 0)
      { id: 'lg7',  label: 'E-Mail Sequenz',         description: 'Mehrstufige Nurturing-Sequenz planen',         icon: 'logo-gmail',           type: 'process', ...p(3, 0) },
      { id: 'lg8',  label: 'KI-Personalisierung',    description: 'Texte auf Lead-Profil zuschneiden',            icon: 'logo-claude',          type: 'ai',      ...p(4, 0) },
      { id: 'lg9',  label: 'Follow-up Mail',         description: 'Personalisierte Nachfass-Mails senden',        icon: 'logo-gmail',           type: 'output',  ...p(5, 0) },

      // Lane B: Social Retargeting (row 1-2)
      { id: 'lg10', label: 'Retargeting-Audience',   description: 'Custom Audience aus Leads erstellen',          icon: 'logo-meta',            type: 'process', ...p(3, 1) },
      { id: 'lg11', label: 'Ad-Erstellung',          description: 'KI-generierte Anzeigen-Creatives',             icon: 'logo-openai',          type: 'ai',      ...p(4, 1) },
      { id: 'lg12', label: 'Meta Ads',               description: 'Retargeting-Kampagne starten',                 icon: 'logo-meta',            type: 'output',  ...p(5, 1) },
      { id: 'lg13', label: 'Google Ads',             description: 'Such-Retargeting aktivieren',                  icon: 'logo-google-ads',      type: 'output',  ...p(5, 2) },

      // Lane C: Content Nurture (row 3)
      { id: 'lg14', label: 'Content-Auswahl',        description: 'Passende Inhalte für Lead auswählen',          icon: 'logo-notion',          type: 'process', ...p(3, 3) },
      { id: 'lg15', label: 'Blog/Guide senden',      description: 'Relevante Ressourcen teilen',                  icon: 'logo-google-docs',     type: 'output',  ...p(4, 3) },
      { id: 'lg16', label: 'LinkedIn Connect',       description: 'Automatischer Vernetzungsvorschlag',           icon: 'logo-linkedin',        type: 'output',  ...p(5, 3) },

      // Phase 4: Sales-Übergabe (col 6-7)
      { id: 'lg17', label: 'Hot-Lead Alert',         description: 'Slack-Benachrichtigung an Sales-Team',         icon: 'logo-slack',           type: 'output',  ...p(6, 0) },
      { id: 'lg18', label: 'Meeting-Buchung',        description: 'Automatischer Kalender-Link',                  icon: 'logo-google-calendar', type: 'output',  ...p(6, 1) },
      { id: 'lg19', label: 'Übergabe-Dokument',      description: 'Lead-Profil & Historie zusammenstellen',       icon: 'logo-claude',          type: 'ai',      ...p(6, 2) },
      { id: 'lg20', label: 'Pipeline-Update',        description: 'Deal-Stage in HubSpot aktualisieren',          icon: 'logo-hubspot',         type: 'output',  ...p(7, 1) },
      { id: 'lg21', label: 'Sales-Report',           description: 'KI-generierte Lead-Zusammenfassung',           icon: 'logo-google-docs',     type: 'output',  ...p(7, 2) },
      { id: 'lg22', label: 'Tracking-Sheet',         description: 'Conversion-Daten in Sheets',                   icon: 'logo-google-sheets',   type: 'output',  ...p(7, 0) },
    ],
    connections: [
      // Erfassung
      { from: 'lg1', to: 'lg3' }, { from: 'lg2', to: 'lg3' },
      { from: 'lg3', to: 'lg4' }, { from: 'lg3', to: 'lg5' },
      // Qualifizierung
      { from: 'lg5', to: 'lg6' },
      // Fan-out zu 3 Lanes
      { from: 'lg6', to: 'lg7' }, { from: 'lg6', to: 'lg10' }, { from: 'lg6', to: 'lg14' },
      // Lane A: E-Mail
      { from: 'lg7', to: 'lg8' }, { from: 'lg8', to: 'lg9' },
      // Lane B: Social
      { from: 'lg10', to: 'lg11' }, { from: 'lg11', to: 'lg12' }, { from: 'lg11', to: 'lg13' },
      // Lane C: Content
      { from: 'lg14', to: 'lg15' }, { from: 'lg15', to: 'lg16' },
      // Merge → Sales
      { from: 'lg9', to: 'lg17' }, { from: 'lg12', to: 'lg17' }, { from: 'lg16', to: 'lg17' },
      { from: 'lg17', to: 'lg18' }, { from: 'lg17', to: 'lg19' },
      { from: 'lg19', to: 'lg20' }, { from: 'lg19', to: 'lg21' }, { from: 'lg18', to: 'lg22' },
    ],
    groups: [
      { id: 'gl1', label: 'Lead-Erfassung',                 x: 15,   y: 178, width: 280,  height: 308, color: 'blue' },
      { id: 'gl2', label: 'CRM & Bestätigung',              x: 355,  y: 178, width: 280,  height: 308, color: 'blue' },
      { id: 'gl3', label: 'KI-Qualifizierung',              x: 695,  y: 178, width: 280,  height: 308, color: 'purple' },
      { id: 'gl4', label: 'E-Mail · Nurturing → Follow-up', x: 1035, y: 18,  width: 960,  height: 148, color: 'blue' },
      { id: 'gl5', label: 'Social · Retargeting → Ads',     x: 1035, y: 178, width: 960,  height: 308, color: 'orange' },
      { id: 'gl6', label: 'Content · Nurture → Connect',    x: 1035, y: 498, width: 960,  height: 148, color: 'green' },
      { id: 'gl7', label: 'Sales-Übergabe',                 x: 2055, y: 18,  width: 280,  height: 468, color: 'purple' },
      { id: 'gl8', label: 'Abschluss & Tracking',           x: 2395, y: 18,  width: 280,  height: 468, color: 'red' },
    ],
    outputs: [],
    executionCount: 0,
  },
  // ─── Content Production Pipeline ──────────────────────────────────────────────
  {
    id: 'tpl-content-production',
    name: 'Content Production Pipeline',
    description: 'Vom Content-Brief über KI-Erstellung und Multi-Channel-Publishing bis zur Performance-Analyse — alles automatisiert.',
    category: 'Agentur',
    icon: 'file-text',
    status: 'draft',
    webhookUrl: '',
    nodes: [
      // Phase 1: Brief & Research (col 0-1)
      { id: 'cp1',  label: 'Content-Brief',         description: 'Neuer Auftrag über Notion-Board',              icon: 'logo-notion',          type: 'trigger', ...p(0, 1) },
      { id: 'cp2',  label: 'Themen-Research',        description: 'KI-basierte Recherche zu Thema & Markt',       icon: 'logo-openai',          type: 'ai',      ...p(1, 1) },
      { id: 'cp3',  label: 'Keyword-Analyse',        description: 'SEO-Keywords & Suchvolumen ermitteln',         icon: 'logo-google-sheets',   type: 'process', ...p(1, 2) },

      // Phase 2: KI-Erstellung (col 2-3)
      { id: 'cp4',  label: 'KI-Copywriting',         description: 'Blog-Artikel, Headlines & CTAs',               icon: 'logo-claude',          type: 'ai',      ...p(2, 0) },
      { id: 'cp5',  label: 'Social-Texte',           description: 'Captions, Hashtags & Hooks',                   icon: 'logo-claude',          type: 'ai',      ...p(2, 1) },
      { id: 'cp6',  label: 'Newsletter-Text',        description: 'E-Mail-Copy & Betreffzeilen',                  icon: 'logo-claude',          type: 'ai',      ...p(2, 2) },
      { id: 'cp7',  label: 'Visual-Generierung',     description: 'Bilder, Grafiken & Thumbnails via KI',         icon: 'logo-openai',          type: 'ai',      ...p(3, 0) },
      { id: 'cp8',  label: 'Video-Script',           description: 'Reel- & Video-Skripte generieren',             icon: 'logo-claude',          type: 'ai',      ...p(3, 1) },

      // Phase 3: Publishing Lanes (col 4-6)
      // Lane A: Blog (row 0)
      { id: 'cp9',  label: 'SEO-Optimierung',        description: 'Meta-Tags, Struktur & interne Links',          icon: 'logo-google-sheets',   type: 'process', ...p(4, 0) },
      { id: 'cp10', label: 'Blog-Upload',            description: 'Artikel in WordPress/CMS hochladen',           icon: 'logo-wordpress',       type: 'process', ...p(5, 0) },
      { id: 'cp11', label: 'Blog Live',              description: 'Beitrag veröffentlichen',                      icon: 'logo-wordpress',       type: 'output',  ...p(6, 0) },

      // Lane B: Social (row 1-2)
      { id: 'cp12', label: 'Post-Planung',           description: 'Content-Kalender & Posting-Zeiten',            icon: 'logo-notion',          type: 'process', ...p(4, 1) },
      { id: 'cp13', label: 'Instagram Post',         description: 'Feed-Post & Reel veröffentlichen',             icon: 'logo-instagram',       type: 'output',  ...p(5, 1) },
      { id: 'cp14', label: 'LinkedIn Post',          description: 'Beitrag auf LinkedIn posten',                  icon: 'logo-linkedin',        type: 'output',  ...p(5, 2) },
      { id: 'cp15', label: 'Meta Post',              description: 'Facebook-Beitrag veröffentlichen',             icon: 'logo-meta',            type: 'output',  ...p(6, 1) },

      // Lane C: Newsletter (row 3)
      { id: 'cp16', label: 'E-Mail Design',          description: 'Newsletter-Template gestalten',                icon: 'logo-gmail',           type: 'process', ...p(4, 3) },
      { id: 'cp17', label: 'Empfänger-Liste',        description: 'Segmente aus CRM laden',                      icon: 'logo-hubspot',         type: 'process', ...p(5, 3) },
      { id: 'cp18', label: 'Newsletter senden',      description: 'E-Mail-Kampagne starten',                     icon: 'logo-gmail',           type: 'output',  ...p(6, 3) },

      // Phase 4: Analytics (col 7-8)
      { id: 'cp19', label: 'Performance-Tracking',   description: 'Views, Clicks & Engagement messen',            icon: 'logo-google-analytics', type: 'process', ...p(7, 1) },
      { id: 'cp20', label: 'KI-Report',              description: 'Automatischer Performance-Bericht',            icon: 'logo-claude',          type: 'ai',      ...p(8, 0) },
      { id: 'cp21', label: 'Team-Update',            description: 'Ergebnisse via Slack teilen',                  icon: 'logo-slack',           type: 'output',  ...p(8, 1) },
      { id: 'cp22', label: 'Content-Archiv',         description: 'Alles in Notion dokumentieren',                icon: 'logo-notion',          type: 'output',  ...p(8, 2) },
    ],
    connections: [
      // Brief → Research
      { from: 'cp1', to: 'cp2' }, { from: 'cp2', to: 'cp3' },
      // Research → KI-Erstellung (fan-out)
      { from: 'cp2', to: 'cp4' }, { from: 'cp2', to: 'cp5' }, { from: 'cp2', to: 'cp6' },
      { from: 'cp4', to: 'cp7' }, { from: 'cp5', to: 'cp8' },
      // Lane A: Blog
      { from: 'cp4', to: 'cp9' }, { from: 'cp7', to: 'cp9' },
      { from: 'cp9', to: 'cp10' }, { from: 'cp10', to: 'cp11' },
      // Lane B: Social
      { from: 'cp5', to: 'cp12' }, { from: 'cp8', to: 'cp12' },
      { from: 'cp12', to: 'cp13' }, { from: 'cp12', to: 'cp14' },
      { from: 'cp13', to: 'cp15' },
      // Lane C: Newsletter
      { from: 'cp6', to: 'cp16' }, { from: 'cp16', to: 'cp17' }, { from: 'cp17', to: 'cp18' },
      // Merge → Analytics
      { from: 'cp11', to: 'cp19' }, { from: 'cp15', to: 'cp19' }, { from: 'cp18', to: 'cp19' },
      { from: 'cp19', to: 'cp20' }, { from: 'cp19', to: 'cp21' },
      { from: 'cp20', to: 'cp22' },
    ],
    groups: [
      { id: 'gc1', label: 'Brief & Research',                  x: 15,   y: 178, width: 620,  height: 308, color: 'blue' },
      { id: 'gc2', label: 'KI-Erstellung',                     x: 695,  y: 18,  width: 620,  height: 468, color: 'purple' },
      { id: 'gc3', label: 'Blog · SEO → Publish',              x: 1375, y: 18,  width: 960,  height: 148, color: 'blue' },
      { id: 'gc4', label: 'Social · Planung → Posting',        x: 1375, y: 178, width: 960,  height: 308, color: 'purple' },
      { id: 'gc5', label: 'Newsletter · Design → Versand',     x: 1375, y: 498, width: 960,  height: 148, color: 'green' },
      { id: 'gc6', label: 'Analytics & Reporting',             x: 2395, y: 18,  width: 620,  height: 468, color: 'green' },
    ],
    outputs: [],
    executionCount: 0,
  },
  // ─── Client Reporting ─────────────────────────────────────────────────────────
  {
    id: 'tpl-client-reporting',
    name: 'Client Reporting Automation',
    description: 'Daten aus allen Kanälen automatisch sammeln, KI-analysieren und als professionellen Report an den Kunden senden.',
    category: 'Agentur',
    icon: 'bar-chart',
    status: 'draft',
    webhookUrl: '',
    nodes: [
      // Phase 1: Daten sammeln (col 0-1, parallel)
      { id: 'cr1',  label: 'Google Analytics',       description: 'Website-Traffic & Conversions abrufen',         icon: 'logo-google-analytics', type: 'trigger', ...p(0, 0) },
      { id: 'cr2',  label: 'Google Ads Daten',       description: 'Kampagnen-Performance exportieren',             icon: 'logo-google-ads',      type: 'trigger', ...p(0, 1) },
      { id: 'cr3',  label: 'Meta Ads Daten',         description: 'Facebook & Instagram Ads-Metriken',             icon: 'logo-meta',            type: 'trigger', ...p(0, 2) },
      { id: 'cr4',  label: 'Social-Metriken',        description: 'Follower, Engagement & Reichweite',             icon: 'logo-instagram',       type: 'trigger', ...p(0, 3) },
      { id: 'cr5',  label: 'CRM-Daten',              description: 'Pipeline, Deals & Umsatz aus HubSpot',         icon: 'logo-hubspot',         type: 'trigger', ...p(0, 4) },

      // Phase 2: Aggregation (col 1-2)
      { id: 'cr6',  label: 'Daten-Zusammenführung',  description: 'Alle Quellen in Google Sheets mergen',          icon: 'logo-google-sheets',   type: 'process', ...p(1, 2) },
      { id: 'cr7',  label: 'Daten-Bereinigung',      description: 'Duplikate entfernen & formatieren',             icon: 'logo-google-sheets',   type: 'process', ...p(2, 2) },

      // Phase 3: KI-Analyse (col 3-4)
      { id: 'cr8',  label: 'Trend-Erkennung',        description: 'Muster & Trends identifizieren',               icon: 'logo-openai',          type: 'ai',      ...p(3, 1) },
      { id: 'cr9',  label: 'Empfehlungen',           description: 'KI-basierte Handlungsempfehlungen',             icon: 'logo-claude',          type: 'ai',      ...p(3, 2) },
      { id: 'cr10', label: 'Benchmark-Vergleich',    description: 'Branchenvergleich & Rankings',                  icon: 'logo-openai',          type: 'ai',      ...p(3, 3) },
      { id: 'cr11', label: 'ROI-Berechnung',         description: 'Return on Ad Spend berechnen',                 icon: 'logo-google-sheets',   type: 'process', ...p(4, 2) },

      // Phase 4: Report-Erstellung (col 5-6)
      { id: 'cr12', label: 'Report-Template',        description: 'Kunden-spezifisches Template laden',            icon: 'logo-google-docs',     type: 'process', ...p(5, 1) },
      { id: 'cr13', label: 'KI-Report-Texte',        description: 'Executive Summary & Insights',                  icon: 'logo-claude',          type: 'ai',      ...p(5, 2) },
      { id: 'cr14', label: 'Visualisierungen',       description: 'Charts & Dashboards generieren',                icon: 'logo-google-sheets',   type: 'process', ...p(5, 3) },
      { id: 'cr15', label: 'PDF-Export',             description: 'Formatierten Report als PDF erstellen',         icon: 'logo-google-docs',     type: 'output',  ...p(6, 2) },

      // Phase 5: Delivery (col 7)
      { id: 'cr16', label: 'Kunden-Mail',            description: 'Report per E-Mail an Kunden senden',           icon: 'logo-gmail',           type: 'output',  ...p(7, 1) },
      { id: 'cr17', label: 'Slack-Update',           description: 'Team über Versand informieren',                icon: 'logo-slack',           type: 'output',  ...p(7, 2) },
      { id: 'cr18', label: 'Archivierung',           description: 'Report in Google Drive ablegen',               icon: 'logo-google-drive',    type: 'output',  ...p(7, 3) },
    ],
    connections: [
      // Daten → Merge
      { from: 'cr1', to: 'cr6' }, { from: 'cr2', to: 'cr6' }, { from: 'cr3', to: 'cr6' },
      { from: 'cr4', to: 'cr6' }, { from: 'cr5', to: 'cr6' },
      // Aggregation
      { from: 'cr6', to: 'cr7' },
      // KI-Analyse
      { from: 'cr7', to: 'cr8' }, { from: 'cr7', to: 'cr9' }, { from: 'cr7', to: 'cr10' },
      { from: 'cr8', to: 'cr11' }, { from: 'cr9', to: 'cr11' }, { from: 'cr10', to: 'cr11' },
      // Report
      { from: 'cr11', to: 'cr12' }, { from: 'cr11', to: 'cr13' }, { from: 'cr11', to: 'cr14' },
      { from: 'cr12', to: 'cr15' }, { from: 'cr13', to: 'cr15' }, { from: 'cr14', to: 'cr15' },
      // Delivery
      { from: 'cr15', to: 'cr16' }, { from: 'cr15', to: 'cr17' }, { from: 'cr15', to: 'cr18' },
    ],
    groups: [
      { id: 'gr1', label: 'Datenquellen',                     x: 15,   y: 18,  width: 280,  height: 788, color: 'blue' },
      { id: 'gr2', label: 'Aggregation & Bereinigung',        x: 355,  y: 338, width: 620,  height: 148, color: 'blue' },
      { id: 'gr3', label: 'KI-Analyse & Insights',            x: 1035, y: 178, width: 620,  height: 468, color: 'purple' },
      { id: 'gr4', label: 'Report-Erstellung',                x: 1715, y: 178, width: 620,  height: 468, color: 'orange' },
      { id: 'gr5', label: 'Delivery & Archiv',                x: 2395, y: 178, width: 280,  height: 468, color: 'green' },
    ],
    outputs: [],
    executionCount: 0,
  },
  // ─── Marketing Agentur Fulfillment ────────────────────────────────────────────
  {
    id: 'tpl-agentur-fulfillment',
    name: 'Marketing Agentur Fulfillment',
    description: 'Kompletter Agentur-Workflow mit 4 parallelen Lanes: Website, Social Media, Ads und E-Mail — vom Onboarding bis zum Abschluss-Reporting.',
    category: 'Agentur',
    icon: 'target',
    status: 'draft',
    webhookUrl: '',
    nodes: [
      // ═══ Shared: Onboarding (c0–c3) ═══
      { id: 'f1',  label: 'Neukunde eingeht',       description: 'Deal in HubSpot gewonnen – Trigger',              icon: 'logo-hubspot',         type: 'trigger', ...p(0, 2) },
      { id: 'f2',  label: 'CRM-Setup',              description: 'Kundenprofil, Pipeline & Tags anlegen',           icon: 'logo-hubspot',         type: 'process', ...p(1, 2) },
      // Setup fan-out (star from CRM)
      { id: 'f3',  label: 'Willkommens-Mail',       description: 'Automatische Begrüßungs-Sequenz',                icon: 'logo-gmail',           type: 'output',  ...p(2, 0) },
      { id: 'f4',  label: 'Kundenordner',           description: 'Google Drive Struktur erstellen',                 icon: 'logo-google-drive',    type: 'output',  ...p(2, 1) },
      { id: 'f5',  label: 'Projekt-Board',          description: 'Notion-Projekt mit Aufgaben anlegen',             icon: 'logo-notion',          type: 'process', ...p(2, 2) },
      { id: 'f6',  label: 'Kick-off Termin',        description: 'Google Calendar Einladung',                       icon: 'logo-google-calendar', type: 'output',  ...p(2, 3) },
      { id: 'f7',  label: 'Team-Slack',             description: 'Team wird im Kanal informiert',                   icon: 'logo-slack',           type: 'output',  ...p(2, 4) },
      // Analyse
      { id: 'f8',  label: 'KI-Marktanalyse',        description: 'Branche, Wettbewerb & Trends analysieren',        icon: 'logo-openai',          type: 'ai',      ...p(3, 2) },

      // ═══ Strategie fan-out → 4 unabhängige Lanes (c4) ═══
      { id: 'f9',  label: 'Zielgruppen-Analyse',    description: 'KI-basiertes Audience Profiling für Website',     icon: 'logo-claude',          type: 'ai',      ...p(4, 0) },
      { id: 'f10', label: 'Social-Strategie',       description: 'Content-Typen, Formate & Posting-Plan',           icon: 'logo-instagram',       type: 'process', ...p(4, 1) },
      { id: 'f11', label: 'Strategie-Dokument',     description: 'Gesamt-Strategie & Positionierung',               icon: 'logo-google-docs',     type: 'output',  ...p(4, 2) },
      { id: 'f12', label: 'Ad-Strategie',           description: 'Targeting, Budgets & Kampagnenstruktur',          icon: 'logo-google-ads',      type: 'process', ...p(4, 3) },
      { id: 'f13', label: 'E-Mail-Strategie',       description: 'Sequenzen, Segmente & Automationen',              icon: 'logo-gmail',           type: 'process', ...p(4, 5) },

      // ═══ LANE W – Website (r0, komplett horizontal) ═══
      { id: 'f14', label: 'KI-Copywriting',         description: 'Website-Texte, Headlines & CTAs',                 icon: 'logo-claude',          type: 'ai',      ...p(5, 0) },
      { id: 'f15', label: 'Website-Erstellung',     description: 'Landing Page mit Copy aufbauen',                  icon: 'logo-wordpress',       type: 'process', ...p(6, 0) },
      { id: 'f16', label: 'Website Live',           description: 'Landing Page veröffentlichen',                    icon: 'logo-wordpress',       type: 'output',  ...p(7, 0) },

      // ═══ LANE S – Social Media (r1, komplett horizontal) ═══
      { id: 'f17', label: 'Visual-Erstellung',      description: 'Bilder, Reels & Grafiken via KI',                 icon: 'logo-openai',          type: 'ai',      ...p(5, 1) },
      { id: 'f18', label: 'Social Content',         description: 'Posts mit Captions & Visuals zusammenstellen',    icon: 'logo-meta',            type: 'process', ...p(6, 1) },
      { id: 'f19', label: 'Instagram Posting',      description: 'Posts automatisch veröffentlichen',               icon: 'logo-instagram',       type: 'output',  ...p(7, 1) },

      // ═══ LANE A – Advertising (r3–r4, komplett horizontal) ═══
      { id: 'f20', label: 'Kampagnen-Planung',      description: 'Zielgruppen, Budgets & Anzeigengruppen',          icon: 'logo-google-ads',      type: 'process', ...p(5, 3) },
      { id: 'f21', label: 'Ad-Creatives',           description: 'Anzeigen-Texte, Bilder & Videos',                 icon: 'logo-google-ads',      type: 'process', ...p(6, 3) },
      { id: 'f22', label: 'Meta Ads Upload',        description: 'Anzeigen direkt in Meta hochladen',               icon: 'logo-meta',            type: 'output',  ...p(7, 3) },
      { id: 'f23', label: 'Google Ads Upload',      description: 'Anzeigen direkt in Google Ads hochladen',         icon: 'logo-google-ads',      type: 'output',  ...p(7, 4) },

      // ═══ LANE E – E-Mail (r5, komplett horizontal) ═══
      { id: 'f24', label: 'E-Mail Texte',           description: 'Newsletter-Copy & Betreffzeilen via KI',          icon: 'logo-claude',          type: 'ai',      ...p(5, 5) },
      { id: 'f25', label: 'E-Mail Design',          description: 'Templates & Layouts gestalten',                   icon: 'logo-gmail',           type: 'process', ...p(6, 5) },
      { id: 'f26', label: 'E-Mail Kampagne',        description: 'Newsletter-Sequenz starten',                      icon: 'logo-gmail',           type: 'output',  ...p(7, 5) },

      // ═══ Shared: Monitoring & Abschluss (c8–c11) ═══
      { id: 'f27', label: 'Performance-Tracking',   description: 'KPIs aller Kanäle in Echtzeit',                  icon: 'logo-google-analytics', type: 'process', ...p(8, 2) },
      { id: 'f28', label: 'KI-Optimierung',         description: 'Automatische Kampagnen-Anpassung',               icon: 'logo-openai',          type: 'ai',      ...p(9, 1) },
      { id: 'f29', label: 'Wöchentliches Update',   description: 'Status-Report via Slack an Kunden',              icon: 'logo-slack',           type: 'output',  ...p(9, 2) },
      { id: 'f30', label: 'Ergebnis-Report',        description: 'KI-generierter Abschlussbericht',                icon: 'logo-claude',          type: 'ai',      ...p(10, 2) },
      { id: 'f31', label: 'Abschluss-PDF',          description: 'Formatierter PDF-Report für den Kunden',         icon: 'logo-google-docs',     type: 'output',  ...p(11, 1) },
      { id: 'f32', label: 'Kundenfeedback',         description: 'Bewertungs-Formular senden',                     icon: 'logo-typeform',        type: 'output',  ...p(11, 2) },
      { id: 'f33', label: 'Archivierung',           description: 'Projekt archivieren & übergeben',                icon: 'logo-google-drive',    type: 'output',  ...p(11, 3) },
    ],
    connections: [
      // ── Shared: Trigger → CRM → Setup → Analyse ──
      { from: 'f1', to: 'f2' },
      { from: 'f2', to: 'f3' },
      { from: 'f2', to: 'f4' },
      { from: 'f2', to: 'f5' },
      { from: 'f2', to: 'f6' },
      { from: 'f2', to: 'f7' },
      { from: 'f5', to: 'f8' },

      // ── Analyse → 4 Lane-Starter + Strategie-Dok (star fan-out) ──
      { from: 'f8', to: 'f9' },     // → Zielgruppen (r0)
      { from: 'f8', to: 'f10' },    // → Social-Strategie (r1)
      { from: 'f8', to: 'f11' },    // → Strategie-Dok (r2)
      { from: 'f8', to: 'f12' },    // → Ad-Strategie (r3)
      { from: 'f8', to: 'f13' },    // → E-Mail-Strategie (r5)

      // ── LANE W: Website (r0, horizontal, unabhängig) ──
      { from: 'f9',  to: 'f14' },   // ZG-Analyse → Copy
      { from: 'f14', to: 'f15' },   // Copy → Website bauen
      { from: 'f15', to: 'f16' },   // Website → Live

      // ── LANE S: Social Media (r1, horizontal, unabhängig) ──
      { from: 'f10', to: 'f17' },   // Social-Strategie → Visuals
      { from: 'f17', to: 'f18' },   // Visuals → Social Content
      { from: 'f18', to: 'f19' },   // Social Content → Instagram

      // ── LANE A: Advertising (r3, horizontal, unabhängig) ──
      { from: 'f12', to: 'f20' },   // Ad-Strategie → Kampagnen-Plan
      { from: 'f20', to: 'f21' },   // Plan → Creatives
      { from: 'f21', to: 'f22' },   // Creatives → Meta Ads
      { from: 'f21', to: 'f23' },   // Creatives → Google Ads

      // ── LANE E: E-Mail (r5, horizontal, unabhängig) ──
      { from: 'f13', to: 'f24' },   // E-Mail-Strategie → Texte
      { from: 'f24', to: 'f25' },   // Texte → Design
      { from: 'f25', to: 'f26' },   // Design → Kampagne

      // ── Alle Lanes → Tracking (merge) ──
      { from: 'f16', to: 'f27' },   // Website Live → Tracking
      { from: 'f19', to: 'f27' },   // Instagram → Tracking
      { from: 'f22', to: 'f27' },   // Meta Ads → Tracking
      { from: 'f23', to: 'f27' },   // Google Ads → Tracking
      { from: 'f26', to: 'f27' },   // E-Mail → Tracking

      // ── Monitoring → Report → Abschluss ──
      { from: 'f27', to: 'f28' },
      { from: 'f27', to: 'f29' },
      { from: 'f28', to: 'f30' },
      { from: 'f29', to: 'f30' },
      { from: 'f30', to: 'f31' },
      { from: 'f30', to: 'f32' },
      { from: 'f30', to: 'f33' },
    ],
    groups: [
      // Rows: r0=58, r1=218, r2=378, r3=538, r4=698, r5=858 | NODE_H=92
      // Group formula: top = first_node_y - 40 (label space), bottom = last_node_y + 92 + 16
      // 1-row h=148, 2-row h=308, 3-row h=468 | gap between adjacent = 12px
      // ── Shared start ──
      { id: 'gf1', label: 'Kunden-Eingang',            x: 15,   y: 338, width: 620,  height: 148, color: 'blue' },
      { id: 'gf2', label: 'Projekt-Setup',              x: 695,  y: 18,  width: 280,  height: 788, color: 'blue' },
      { id: 'gf3', label: 'KI-Analyse',                 x: 1035, y: 338, width: 280,  height: 148, color: 'purple' },
      // ── 4 Lane-Gruppen (12px gap between adjacent lanes) ──
      { id: 'gf4', label: 'Website · Konzeption → Live',       x: 1375, y: 18,  width: 1300, height: 148, color: 'blue' },
      { id: 'gf5', label: 'Social Media · Content → Posting',  x: 1375, y: 178, width: 1300, height: 148, color: 'purple' },
      { id: 'gf6', label: 'Advertising · Creatives → Upload',  x: 1375, y: 498, width: 1300, height: 308, color: 'orange' },
      { id: 'gf7', label: 'E-Mail · Texte → Versand',          x: 1375, y: 818, width: 1300, height: 148, color: 'green' },
      // ── Shared end ──
      { id: 'gf8', label: 'Monitoring & Optimierung',   x: 2735, y: 178, width: 620,  height: 308, color: 'green' },
      { id: 'gf9', label: 'Abschluss & Übergabe',       x: 3415, y: 178, width: 620,  height: 468, color: 'red' },
    ],
    outputs: [],
    executionCount: 0,
  },
];

// ─── English Translations ────────────────────────────────────────────────────

export const TEMPLATE_META_EN: Record<string, { name: string; description: string }> = {
  'tpl-lead-gen':            { name: 'Lead Generation & Nurturing',     description: 'From lead intake through AI qualification and multi-channel nurturing to sales handoff — fully automated.' },
  'tpl-content-production':  { name: 'Content Production Pipeline',     description: 'From content brief through AI creation and multi-channel publishing to performance analysis — all automated.' },
  'tpl-client-reporting':    { name: 'Client Reporting Automation',     description: 'Automatically collect data from all channels, AI-analyze, and send as a professional report to the client.' },
  'tpl-agentur-fulfillment': { name: 'Marketing Agency Fulfillment',    description: 'Complete agency workflow with 4 parallel lanes: Website, Social Media, Ads, and Email — from onboarding to final reporting.' },
};

export const TEMPLATE_NODE_EN: Record<string, { label: string; description: string }> = {
  // ─── Lead Generation ───
  'lg1':  { label: 'Form Intake',             description: 'New inquiry received via Typeform' },
  'lg2':  { label: 'Website Lead',            description: 'Lead captured via landing page' },
  'lg3':  { label: 'CRM Entry',              description: 'Create & tag contact in HubSpot' },
  'lg4':  { label: 'Confirmation Email',      description: 'Automatic confirmation email' },
  'lg5':  { label: 'AI Lead Scoring',         description: 'Automatic evaluation by criteria' },
  'lg6':  { label: 'Segmentation',            description: 'Classify as Hot / Warm / Cold' },
  'lg7':  { label: 'Email Sequence',          description: 'Plan multi-step nurturing sequence' },
  'lg8':  { label: 'AI Personalization',      description: 'Tailor copy to lead profile' },
  'lg9':  { label: 'Follow-up Email',         description: 'Send personalized follow-up emails' },
  'lg10': { label: 'Retargeting Audience',    description: 'Create custom audience from leads' },
  'lg11': { label: 'Ad Creation',             description: 'AI-generated ad creatives' },
  'lg12': { label: 'Meta Ads',               description: 'Launch retargeting campaign' },
  'lg13': { label: 'Google Ads',             description: 'Activate search retargeting' },
  'lg14': { label: 'Content Selection',       description: 'Select relevant content for lead' },
  'lg15': { label: 'Send Blog/Guide',        description: 'Share relevant resources' },
  'lg16': { label: 'LinkedIn Connect',        description: 'Automatic connection suggestion' },
  'lg17': { label: 'Hot Lead Alert',          description: 'Slack notification to sales team' },
  'lg18': { label: 'Meeting Booking',         description: 'Automatic calendar link' },
  'lg19': { label: 'Handoff Document',        description: 'Compile lead profile & history' },
  'lg20': { label: 'Pipeline Update',         description: 'Update deal stage in HubSpot' },
  'lg21': { label: 'Sales Report',            description: 'AI-generated lead summary' },
  'lg22': { label: 'Tracking Sheet',          description: 'Conversion data in Sheets' },

  // ─── Content Production ───
  'cp1':  { label: 'Content Brief',           description: 'New assignment via Notion board' },
  'cp2':  { label: 'Topic Research',          description: 'AI-based research on topic & market' },
  'cp3':  { label: 'Keyword Analysis',        description: 'Determine SEO keywords & search volume' },
  'cp4':  { label: 'AI Copywriting',          description: 'Blog articles, headlines & CTAs' },
  'cp5':  { label: 'Social Copy',             description: 'Captions, hashtags & hooks' },
  'cp6':  { label: 'Newsletter Copy',         description: 'Email copy & subject lines' },
  'cp7':  { label: 'Visual Generation',       description: 'Images, graphics & thumbnails via AI' },
  'cp8':  { label: 'Video Script',            description: 'Generate reel & video scripts' },
  'cp9':  { label: 'SEO Optimization',        description: 'Meta tags, structure & internal links' },
  'cp10': { label: 'Blog Upload',             description: 'Upload article to WordPress/CMS' },
  'cp11': { label: 'Blog Live',               description: 'Publish post' },
  'cp12': { label: 'Post Scheduling',         description: 'Content calendar & posting times' },
  'cp13': { label: 'Instagram Post',          description: 'Publish feed post & reel' },
  'cp14': { label: 'LinkedIn Post',           description: 'Post on LinkedIn' },
  'cp15': { label: 'Meta Post',               description: 'Publish Facebook post' },
  'cp16': { label: 'Email Design',            description: 'Design newsletter template' },
  'cp17': { label: 'Recipient List',          description: 'Load segments from CRM' },
  'cp18': { label: 'Send Newsletter',         description: 'Launch email campaign' },
  'cp19': { label: 'Performance Tracking',    description: 'Measure views, clicks & engagement' },
  'cp20': { label: 'AI Report',               description: 'Automatic performance report' },
  'cp21': { label: 'Team Update',             description: 'Share results via Slack' },
  'cp22': { label: 'Content Archive',         description: 'Document everything in Notion' },

  // ─── Client Reporting ───
  'cr1':  { label: 'Google Analytics',        description: 'Fetch website traffic & conversions' },
  'cr2':  { label: 'Google Ads Data',         description: 'Export campaign performance' },
  'cr3':  { label: 'Meta Ads Data',           description: 'Facebook & Instagram ads metrics' },
  'cr4':  { label: 'Social Metrics',          description: 'Followers, engagement & reach' },
  'cr5':  { label: 'CRM Data',               description: 'Pipeline, deals & revenue from HubSpot' },
  'cr6':  { label: 'Data Consolidation',      description: 'Merge all sources in Google Sheets' },
  'cr7':  { label: 'Data Cleaning',           description: 'Remove duplicates & format' },
  'cr8':  { label: 'Trend Detection',         description: 'Identify patterns & trends' },
  'cr9':  { label: 'Recommendations',         description: 'AI-based action recommendations' },
  'cr10': { label: 'Benchmark Comparison',    description: 'Industry comparison & rankings' },
  'cr11': { label: 'ROI Calculation',         description: 'Calculate return on ad spend' },
  'cr12': { label: 'Report Template',         description: 'Load client-specific template' },
  'cr13': { label: 'AI Report Copy',          description: 'Executive summary & insights' },
  'cr14': { label: 'Visualizations',          description: 'Generate charts & dashboards' },
  'cr15': { label: 'PDF Export',              description: 'Create formatted report as PDF' },
  'cr16': { label: 'Client Email',            description: 'Send report via email to client' },
  'cr17': { label: 'Slack Update',            description: 'Inform team about delivery' },
  'cr18': { label: 'Archiving',              description: 'Store report in Google Drive' },

  // ─── Agentur Fulfillment ───
  'f1':  { label: 'New Client Arrives',       description: 'Deal won in HubSpot — Trigger' },
  'f2':  { label: 'CRM Setup',               description: 'Create client profile, pipeline & tags' },
  'f3':  { label: 'Welcome Email',            description: 'Automatic welcome sequence' },
  'f4':  { label: 'Client Folder',            description: 'Create Google Drive structure' },
  'f5':  { label: 'Project Board',            description: 'Create Notion project with tasks' },
  'f6':  { label: 'Kick-off Meeting',         description: 'Google Calendar invitation' },
  'f7':  { label: 'Team Slack',               description: 'Team notified in channel' },
  'f8':  { label: 'AI Market Analysis',       description: 'Analyze industry, competition & trends' },
  'f9':  { label: 'Audience Analysis',        description: 'AI-based audience profiling for website' },
  'f10': { label: 'Social Strategy',          description: 'Content types, formats & posting plan' },
  'f11': { label: 'Strategy Document',        description: 'Overall strategy & positioning' },
  'f12': { label: 'Ad Strategy',              description: 'Targeting, budgets & campaign structure' },
  'f13': { label: 'Email Strategy',           description: 'Sequences, segments & automations' },
  'f14': { label: 'AI Copywriting',           description: 'Website copy, headlines & CTAs' },
  'f15': { label: 'Website Creation',         description: 'Build landing page with copy' },
  'f16': { label: 'Website Live',             description: 'Publish landing page' },
  'f17': { label: 'Visual Creation',          description: 'Images, reels & graphics via AI' },
  'f18': { label: 'Social Content',           description: 'Assemble posts with captions & visuals' },
  'f19': { label: 'Instagram Posting',        description: 'Publish posts automatically' },
  'f20': { label: 'Campaign Planning',        description: 'Audiences, budgets & ad groups' },
  'f21': { label: 'Ad Creatives',             description: 'Ad copy, images & videos' },
  'f22': { label: 'Meta Ads Upload',          description: 'Upload ads directly to Meta' },
  'f23': { label: 'Google Ads Upload',        description: 'Upload ads directly to Google Ads' },
  'f24': { label: 'Email Copy',               description: 'Newsletter copy & subject lines via AI' },
  'f25': { label: 'Email Design',             description: 'Design templates & layouts' },
  'f26': { label: 'Email Campaign',           description: 'Launch newsletter sequence' },
  'f27': { label: 'Performance Tracking',     description: 'Real-time KPIs across all channels' },
  'f28': { label: 'AI Optimization',          description: 'Automatic campaign adjustment' },
  'f29': { label: 'Weekly Update',            description: 'Status report via Slack to client' },
  'f30': { label: 'Results Report',           description: 'AI-generated final report' },
  'f31': { label: 'Final PDF',                description: 'Formatted PDF report for the client' },
  'f32': { label: 'Client Feedback',          description: 'Send review form' },
  'f33': { label: 'Archiving',               description: 'Archive project & hand over' },
};

export const TEMPLATE_GROUP_EN: Record<string, string> = {
  // Lead Gen
  'gl1': 'Lead Capture',        'gl2': 'CRM & Confirmation',     'gl3': 'AI Qualification',
  'gl4': 'Email · Nurturing → Follow-up', 'gl5': 'Social · Retargeting → Ads',
  'gl6': 'Content · Nurture → Connect',   'gl7': 'Sales Handoff',  'gl8': 'Closing & Tracking',
  // Content Production
  'gc1': 'Brief & Research',    'gc2': 'AI Creation',
  'gc3': 'Blog · SEO → Publish', 'gc4': 'Social · Planning → Posting',
  'gc5': 'Newsletter · Design → Delivery', 'gc6': 'Analytics & Reporting',
  // Client Reporting
  'gr1': 'Data Sources',        'gr2': 'Aggregation & Cleaning',
  'gr3': 'AI Analysis & Insights', 'gr4': 'Report Creation', 'gr5': 'Delivery & Archive',
  // Fulfillment
  'gf1': 'Client Intake',       'gf2': 'Project Setup',          'gf3': 'AI Analysis',
  'gf4': 'Website · Concept → Live',       'gf5': 'Social Media · Content → Posting',
  'gf6': 'Advertising · Creatives → Upload', 'gf7': 'Email · Copy → Delivery',
  'gf8': 'Monitoring & Optimization', 'gf9': 'Closing & Handoff',
};

export function getLocalizedTemplate(tpl: AutomationSystem, lang: 'de' | 'en'): AutomationSystem {
  if (lang === 'de') return tpl;
  const meta = TEMPLATE_META_EN[tpl.id];
  return {
    ...tpl,
    name: meta?.name || tpl.name,
    description: meta?.description || tpl.description,
    nodes: tpl.nodes.map(n => {
      const en = TEMPLATE_NODE_EN[n.id];
      return en ? { ...n, label: en.label, description: en.description } : n;
    }),
    groups: tpl.groups?.map(g => {
      const en = TEMPLATE_GROUP_EN[g.id];
      return en ? { ...g, label: en } : g;
    }),
  };
}
