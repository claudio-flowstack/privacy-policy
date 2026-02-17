import type { AutomationSystem } from '@/types/automation';

/**
 * Position helper: convert column/row indices to pixel coordinates.
 *
 * Grid layout:
 *   x = 40 + column * 340   (340px horizontal spacing)
 *   y = 18 + row    * 160   (160px vertical spacing)
 *
 * Column 0 is the leftmost position (x=40).
 * Row 0 is the topmost position (y=18).
 *
 * Group formula: x=15+col×340, y=18+row×160-10, w=(cols-1)×340+280, h=(rows-1)×160+148
 */
const p = (col: number, row: number) => ({ x: 40 + col * 340, y: 18 + row * 160 });

export const DEMO_SYSTEMS: AutomationSystem[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // 1. Client Onboarding — 14 Nodes
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'demo-1',
    name: 'Client Onboarding',
    description: 'Vom Erstgespräch zur fertigen Website, Werbetexten und Google Ads – vollautomatisch mit KI-Analyse, Content-Produktion und Multi-Channel-Deployment.',
    category: 'Marketing',
    icon: 'users',
    status: 'active',
    webhookUrl: '',
    nodes: [
      // ─── Phase 1: Eingang (col 0) ───
      { id: 'n1', label: 'Onboarding-Gespräch', description: 'Erstgespräch mit dem Kunden', icon: 'users', type: 'trigger', ...p(0, 1), linkedPage: '/onboarding' },
      // ─── Phase 2: KI-Verarbeitung (col 1-2) ───
      { id: 'n2', label: 'KI-Transkription', description: 'Gespräch wird transkribiert & analysiert', icon: 'logo-openai', type: 'ai', ...p(1, 1) },
      { id: 'n3', label: 'CRM: Kunde anlegen', description: 'Kontakt & Deal in HubSpot erstellen', icon: 'logo-hubspot', type: 'process', ...p(2, 0) },
      { id: 'n4', label: 'KI: Briefing erstellen', description: 'Kundenprofil, Zielgruppe & Anforderungen extrahieren', icon: 'logo-claude', type: 'ai', ...p(2, 1) },
      { id: 'n5', label: 'Slack: Team informieren', description: 'Account Manager benachrichtigen', icon: 'logo-slack', type: 'output', ...p(2, 2) },
      // ─── Phase 3: Content-Produktion (col 3-4) ───
      { id: 'n6', label: 'KI: Werbetexte', description: 'Headlines, Copy & CTAs generieren', icon: 'logo-claude', type: 'ai', ...p(3, 0) },
      { id: 'n7', label: 'KI: Website-Texte', description: 'Landing Page Struktur & Inhalte', icon: 'logo-openai', type: 'ai', ...p(3, 2) },
      { id: 'n8', label: 'Qualitäts-Check', description: 'Konsistenz, Tonalität & Vollständigkeit prüfen', icon: 'shield-check', type: 'process', ...p(4, 1) },
      // ─── Phase 4: Deployment & Ergebnis (col 5-6) ───
      { id: 'n9', label: 'Werbetext-Paket', description: 'Copy & Headlines als Google Doc', icon: 'logo-google-docs', type: 'output', ...p(5, 0) },
      { id: 'n10', label: 'Landing Page', description: 'Website erstellt & veröffentlicht', icon: 'globe', type: 'output', ...p(5, 1) },
      { id: 'n11', label: 'Google Ads', description: 'Kampagne konfiguriert & gestartet', icon: 'logo-google-ads', type: 'output', ...p(5, 2) },
      { id: 'n12', label: 'Status-Aggregation', description: 'Alle Ergebnisse zusammenführen', icon: 'git-merge', type: 'process', ...p(6, 1) },
      { id: 'n13', label: 'Slack: Projekt fertig', description: 'Team über Fertigstellung informieren', icon: 'logo-slack', type: 'output', ...p(6, 0) },
      { id: 'n14', label: 'CRM: Deal updaten', description: 'HubSpot Deal-Stage aktualisieren', icon: 'logo-hubspot', type: 'output', ...p(6, 2) },
    ],
    connections: [
      { from: 'n1', to: 'n2' },
      { from: 'n2', to: 'n3' }, { from: 'n2', to: 'n4' }, { from: 'n2', to: 'n5' },
      { from: 'n4', to: 'n6' }, { from: 'n4', to: 'n7' },
      { from: 'n6', to: 'n8' }, { from: 'n7', to: 'n8' },
      { from: 'n6', to: 'n9' }, { from: 'n8', to: 'n10' }, { from: 'n7', to: 'n11' },
      { from: 'n9', to: 'n12' }, { from: 'n10', to: 'n12' }, { from: 'n11', to: 'n12' },
      { from: 'n12', to: 'n13' }, { from: 'n12', to: 'n14' },
    ],
    groups: [
      { id: 'g1', label: 'Eingang',              x: 15,   y: 168, width: 280, height: 148, color: 'blue' },
      { id: 'g2', label: 'KI-Verarbeitung',      x: 355,  y: 8,   width: 620, height: 468, color: 'purple' },
      { id: 'g3', label: 'Content-Produktion',    x: 1035, y: 8,   width: 620, height: 468, color: 'blue' },
      { id: 'g4', label: 'Deployment & Ergebnis', x: 1715, y: 8,   width: 620, height: 468, color: 'green' },
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

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. Marketing Agentur Fulfillment — 33 Nodes
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'demo-2',
    name: 'Marketing Agentur Fulfillment',
    description: 'Kompletter Agentur-Workflow mit 4 parallelen Lanes: Website, Social Media, Ads und E-Mail — vom Onboarding bis zum Abschluss-Reporting.',
    category: 'Agentur',
    icon: 'target',
    status: 'active',
    webhookUrl: '',
    nodes: [
      // ═══ Shared: Onboarding (c0–c3) ═══
      { id: 'f1',  label: 'Neukunde eingeht',       description: 'Deal in HubSpot gewonnen – Trigger',              icon: 'logo-hubspot',         type: 'trigger', ...p(0, 2) },
      { id: 'f2',  label: 'CRM-Setup',              description: 'Kundenprofil, Pipeline & Tags anlegen',           icon: 'logo-hubspot',         type: 'process', ...p(1, 2) },
      { id: 'f3',  label: 'Willkommens-Mail',       description: 'Automatische Begrüßungs-Sequenz',                icon: 'logo-gmail',           type: 'output',  ...p(2, 0) },
      { id: 'f4',  label: 'Kundenordner',           description: 'Google Drive Struktur erstellen',                 icon: 'logo-google-drive',    type: 'output',  ...p(2, 1) },
      { id: 'f5',  label: 'Projekt-Board',          description: 'Notion-Projekt mit Aufgaben anlegen',             icon: 'logo-notion',          type: 'process', ...p(2, 2) },
      { id: 'f6',  label: 'Kick-off Termin',        description: 'Google Calendar Einladung',                       icon: 'logo-google-calendar', type: 'output',  ...p(2, 3) },
      { id: 'f7',  label: 'Team-Slack',             description: 'Team wird im Kanal informiert',                   icon: 'logo-slack',           type: 'output',  ...p(2, 4) },
      { id: 'f8',  label: 'KI-Marktanalyse',        description: 'Branche, Wettbewerb & Trends analysieren',        icon: 'logo-openai',          type: 'ai',      ...p(3, 2) },
      // ═══ Strategie fan-out → 4 unabhängige Lanes (c4) ═══
      { id: 'f9',  label: 'Zielgruppen-Analyse',    description: 'KI-basiertes Audience Profiling für Website',     icon: 'logo-claude',          type: 'ai',      ...p(4, 0) },
      { id: 'f10', label: 'Social-Strategie',       description: 'Content-Typen, Formate & Posting-Plan',           icon: 'logo-instagram',       type: 'process', ...p(4, 1) },
      { id: 'f11', label: 'Strategie-Dokument',     description: 'Gesamt-Strategie & Positionierung',               icon: 'logo-google-docs',     type: 'output',  ...p(4, 2) },
      { id: 'f12', label: 'Ad-Strategie',           description: 'Targeting, Budgets & Kampagnenstruktur',          icon: 'logo-google-ads',      type: 'process', ...p(4, 3) },
      { id: 'f13', label: 'E-Mail-Strategie',       description: 'Sequenzen, Segmente & Automationen',              icon: 'logo-gmail',           type: 'process', ...p(4, 5) },
      // ═══ LANE W – Website ═══
      { id: 'f14', label: 'KI-Copywriting',         description: 'Website-Texte, Headlines & CTAs',                 icon: 'logo-claude',          type: 'ai',      ...p(5, 0) },
      { id: 'f15', label: 'Website-Erstellung',     description: 'Landing Page mit Copy aufbauen',                  icon: 'logo-wordpress',       type: 'process', ...p(6, 0) },
      { id: 'f16', label: 'Website Live',           description: 'Landing Page veröffentlichen',                    icon: 'logo-wordpress',       type: 'output',  ...p(7, 0) },
      // ═══ LANE S – Social Media ═══
      { id: 'f17', label: 'Visual-Erstellung',      description: 'Bilder, Reels & Grafiken via KI',                 icon: 'logo-openai',          type: 'ai',      ...p(5, 1) },
      { id: 'f18', label: 'Social Content',         description: 'Posts mit Captions & Visuals zusammenstellen',    icon: 'logo-meta',            type: 'process', ...p(6, 1) },
      { id: 'f19', label: 'Instagram Posting',      description: 'Posts automatisch veröffentlichen',               icon: 'logo-instagram',       type: 'output',  ...p(7, 1) },
      // ═══ LANE A – Advertising ═══
      { id: 'f20', label: 'Kampagnen-Planung',      description: 'Zielgruppen, Budgets & Anzeigengruppen',          icon: 'logo-google-ads',      type: 'process', ...p(5, 3) },
      { id: 'f21', label: 'Ad-Creatives',           description: 'Anzeigen-Texte, Bilder & Videos',                 icon: 'logo-google-ads',      type: 'process', ...p(6, 3) },
      { id: 'f22', label: 'Meta Ads Upload',        description: 'Anzeigen direkt in Meta hochladen',               icon: 'logo-meta',            type: 'output',  ...p(7, 3) },
      { id: 'f23', label: 'Google Ads Upload',      description: 'Anzeigen direkt in Google Ads hochladen',         icon: 'logo-google-ads',      type: 'output',  ...p(7, 4) },
      // ═══ LANE E – E-Mail ═══
      { id: 'f24', label: 'E-Mail Texte',           description: 'Newsletter-Copy & Betreffzeilen via KI',          icon: 'logo-claude',          type: 'ai',      ...p(5, 5) },
      { id: 'f25', label: 'E-Mail Design',          description: 'Templates & Layouts gestalten',                   icon: 'logo-gmail',           type: 'process', ...p(6, 5) },
      { id: 'f26', label: 'E-Mail Kampagne',        description: 'Newsletter-Sequenz starten',                      icon: 'logo-gmail',           type: 'output',  ...p(7, 5) },
      // ═══ Shared: Monitoring & Abschluss ═══
      { id: 'f27', label: 'Performance-Tracking',   description: 'KPIs aller Kanäle in Echtzeit',                  icon: 'logo-google-analytics', type: 'process', ...p(8, 2) },
      { id: 'f28', label: 'KI-Optimierung',         description: 'Automatische Kampagnen-Anpassung',               icon: 'logo-openai',          type: 'ai',      ...p(9, 1) },
      { id: 'f29', label: 'Wöchentliches Update',   description: 'Status-Report via Slack an Kunden',              icon: 'logo-slack',           type: 'output',  ...p(9, 2) },
      { id: 'f30', label: 'Ergebnis-Report',        description: 'KI-generierter Abschlussbericht',                icon: 'logo-claude',          type: 'ai',      ...p(10, 2) },
      { id: 'f31', label: 'Abschluss-PDF',          description: 'Formatierter PDF-Report für den Kunden',         icon: 'logo-google-docs',     type: 'output',  ...p(11, 1) },
      { id: 'f32', label: 'Kundenfeedback',         description: 'Bewertungs-Formular senden',                     icon: 'logo-typeform',        type: 'output',  ...p(11, 2) },
      { id: 'f33', label: 'Archivierung',           description: 'Projekt archivieren & übergeben',                icon: 'logo-google-drive',    type: 'output',  ...p(11, 3) },
    ],
    connections: [
      { from: 'f1', to: 'f2' },
      { from: 'f2', to: 'f3' }, { from: 'f2', to: 'f4' }, { from: 'f2', to: 'f5' }, { from: 'f2', to: 'f6' }, { from: 'f2', to: 'f7' },
      { from: 'f5', to: 'f8' },
      { from: 'f8', to: 'f9' }, { from: 'f8', to: 'f10' }, { from: 'f8', to: 'f11' }, { from: 'f8', to: 'f12' }, { from: 'f8', to: 'f13' },
      { from: 'f9',  to: 'f14' }, { from: 'f14', to: 'f15' }, { from: 'f15', to: 'f16' },
      { from: 'f10', to: 'f17' }, { from: 'f17', to: 'f18' }, { from: 'f18', to: 'f19' },
      { from: 'f12', to: 'f20' }, { from: 'f20', to: 'f21' }, { from: 'f21', to: 'f22' }, { from: 'f21', to: 'f23' },
      { from: 'f13', to: 'f24' }, { from: 'f24', to: 'f25' }, { from: 'f25', to: 'f26' },
      { from: 'f16', to: 'f27' }, { from: 'f19', to: 'f27' }, { from: 'f22', to: 'f27' }, { from: 'f23', to: 'f27' }, { from: 'f26', to: 'f27' },
      { from: 'f27', to: 'f28' }, { from: 'f27', to: 'f29' },
      { from: 'f28', to: 'f30' }, { from: 'f29', to: 'f30' },
      { from: 'f30', to: 'f31' }, { from: 'f30', to: 'f32' }, { from: 'f30', to: 'f33' },
    ],
    groups: [
      { id: 'gf1', label: 'Kunden-Eingang',            x: 15,   y: 338, width: 620,  height: 148, color: 'blue' },
      { id: 'gf2', label: 'Projekt-Setup',              x: 695,  y: 18,  width: 280,  height: 788, color: 'blue' },
      { id: 'gf3', label: 'KI-Analyse',                 x: 1035, y: 338, width: 280,  height: 148, color: 'purple' },
      { id: 'gf4', label: 'Website · Konzeption → Live',       x: 1375, y: 18,  width: 1300, height: 148, color: 'blue' },
      { id: 'gf5', label: 'Social Media · Content → Posting',  x: 1375, y: 178, width: 1300, height: 148, color: 'purple' },
      { id: 'gf6', label: 'Advertising · Creatives → Upload',  x: 1375, y: 498, width: 1300, height: 308, color: 'orange' },
      { id: 'gf7', label: 'E-Mail · Texte → Versand',          x: 1375, y: 818, width: 1300, height: 148, color: 'green' },
      { id: 'gf8', label: 'Monitoring & Optimierung',   x: 2735, y: 178, width: 620,  height: 308, color: 'green' },
      { id: 'gf9', label: 'Abschluss & Übergabe',       x: 3415, y: 178, width: 620,  height: 468, color: 'red' },
    ],
    outputs: [
      { id: 'o1', name: 'Landing Page – Schmidt GmbH', type: 'website', link: 'https://schmidt-gmbh.example.com', createdAt: '2025-01-28T10:00:00Z' },
      { id: 'o2', name: 'Social Media Content Pack – KW 05', type: 'document', link: 'https://docs.google.com/document/d/social-pack', createdAt: '2025-01-29T14:00:00Z' },
      { id: 'o3', name: 'Abschlussbericht – Schmidt GmbH', type: 'document', link: 'https://docs.google.com/document/d/report-schmidt', createdAt: '2025-01-30T16:00:00Z' },
    ],
    lastExecuted: '2025-01-30T16:00:00Z',
    executionCount: 5,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. Recruiting Agentur — MASTER SYSTEM (Subsystem nodes auto-created)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'demo-recruiting',
    name: 'Recruiting Agentur',
    description: 'Vollständiger Agentur-Fulfillment-Prozess: Vom gewonnenen Client über Onboarding, Knowledge Processing und Content-Produktion bis zum Launch mit Performance-Tracking.',
    category: 'Recruiting',
    icon: 'building-2',
    status: 'active',
    webhookUrl: '',
    nodes: [
      // Intake — two entry points merge into one validated dataset
      { id: 'rm1', label: 'Client gewonnen',           description: 'Vertrag unterschrieben – Übergabe von Sales',  icon: 'trophy',          type: 'trigger', x: 60,  y: 200 },
      { id: 'rm2', label: 'Handover-Formular',         description: 'Internes Formular mit allen Client-Daten',     icon: 'clipboard-check', type: 'trigger', x: 60,  y: 370 },
      { id: 'rm3', label: 'Daten zusammenführen',      description: 'Sales-Daten & Formular validieren und mergen', icon: 'git-merge',       type: 'process', x: 340, y: 270 },
      // Subsystem nodes are auto-injected from child systems (parentId: 'demo-recruiting')
    ],
    connections: [
      { from: 'rm1', to: 'rm3' },
      { from: 'rm2', to: 'rm3' },
      { from: 'rm3', to: 'sub-demo-recruiting-kickoff' },
      { from: 'sub-demo-recruiting-kickoff', to: 'sub-demo-recruiting-onboarding' },
      { from: 'sub-demo-recruiting-onboarding', to: 'sub-demo-recruiting-knowledge' },
      { from: 'sub-demo-recruiting-knowledge', to: 'sub-demo-recruiting-content' },
      { from: 'sub-demo-recruiting-content', to: 'sub-demo-recruiting-review' },
      { from: 'sub-demo-recruiting-review', to: 'sub-demo-recruiting-tracking' },
    ],
    groups: [],
    outputs: [
      { id: 'o1', name: 'Abschlussbericht – TechStart GmbH', type: 'document', link: 'https://docs.google.com/document/d/report-techstart', createdAt: '2025-01-30T16:00:00Z' },
    ],
    lastExecuted: '2025-01-30T16:00:00Z',
    executionCount: 8,
  },

  // ─── 3a. Kickoff & Client Setup (Phase 1–2) ──────────────────────────────
  {
    id: 'demo-recruiting-kickoff',
    parentId: 'demo-recruiting',
    subSystemOrder: 0,
    name: 'Kickoff & Client Setup',
    description: 'Internes Setup: CRM-Eintrag, Kommunikation, Projekt-Board, Ordnerstruktur und Arbeitsdokumente.',
    category: 'Recruiting',
    icon: 'clipboard-check',
    status: 'active',
    webhookUrl: '',
    nodes: [
      // Eingang
      { id: 'ks1',  label: 'Handover-Formular',    description: 'Internes Übergabeformular ausgefüllt',            icon: 'logo-typeform',        type: 'trigger', ...p(0, 2) },
      { id: 'ks2',  label: 'CRM-Eintrag',          description: 'Client-Profil, Pipeline & Tags anlegen',          icon: 'logo-hubspot',         type: 'process', ...p(1, 2) },
      // Kommunikation (fan-out)
      { id: 'ks3',  label: 'Interner Slack-Kanal',  description: 'Dedizierter Team-Kanal für den Kunden',           icon: 'logo-slack',           type: 'output',  ...p(2, 0) },
      { id: 'ks4',  label: 'Willkommens-Mail',      description: 'Automatische Begrüßungs-Sequenz an Client',      icon: 'logo-gmail',           type: 'output',  ...p(2, 1) },
      { id: 'ks5',  label: 'Onboarding-Anleitung',  description: 'Vorbereitungsinstruktionen an Client senden',     icon: 'logo-gmail',           type: 'output',  ...p(2, 2) },
      { id: 'ks6',  label: 'Kick-off Termin',       description: 'Onboarding-Call im Kalender erstellen',           icon: 'logo-google-calendar', type: 'output',  ...p(2, 3) },
      // Projekt & Dateien
      { id: 'ks7',  label: 'Projekt-Board',         description: 'Client-Projekt mit Standard-Aufgaben anlegen',    icon: 'logo-notion',          type: 'process', ...p(3, 1) },
      { id: 'ks8',  label: 'Aufgaben generieren',   description: 'Onboarding, Review, Go-Live Checklisten',        icon: 'list-checks',          type: 'process', ...p(4, 1) },
      { id: 'ks9',  label: 'Ordnerstruktur',        description: 'Assets, Copy, Tracking, Reports, Website',       icon: 'logo-google-drive',    type: 'output',  ...p(3, 3) },
      { id: 'ks10', label: 'Arbeitsdokumente',      description: 'Templates duplizieren & personalisieren',        icon: 'logo-google-docs',     type: 'output',  ...p(4, 3) },
      // Status
      { id: 'ks11', label: 'Status: Onboarding',    description: 'CRM-Status auf "Onboarding läuft" setzen',       icon: 'logo-hubspot',         type: 'process', ...p(5, 2) },
    ],
    connections: [
      { from: 'ks1', to: 'ks2' },
      { from: 'ks2', to: 'ks3' }, { from: 'ks2', to: 'ks4' }, { from: 'ks2', to: 'ks5' }, { from: 'ks2', to: 'ks6' },
      { from: 'ks2', to: 'ks7' }, { from: 'ks7', to: 'ks8' },
      { from: 'ks2', to: 'ks9' }, { from: 'ks9', to: 'ks10' },
      { from: 'ks8', to: 'ks11' }, { from: 'ks10', to: 'ks11' },
    ],
    groups: [
      { id: 'gks1', label: 'Eingang',             x: 15,   y: 338, width: 620,  height: 148, color: 'blue' },
      { id: 'gks2', label: 'Kommunikation',        x: 695,  y: 18,  width: 280,  height: 628, color: 'blue' },
      { id: 'gks3', label: 'Projekt & Dateien',    x: 1035, y: 178, width: 620,  height: 468, color: 'purple' },
      { id: 'gks4', label: 'Abschluss',            x: 1715, y: 338, width: 280,  height: 148, color: 'green' },
    ],
    outputs: [],
    executionCount: 0,
  },

  // ─── 3b. Client Onboarding (Phase 3–4) ───────────────────────────────────
  {
    id: 'demo-recruiting-onboarding',
    parentId: 'demo-recruiting',
    subSystemOrder: 1,
    name: 'Client Onboarding',
    description: 'Material-Sammlung, Onboarding-Gespräch und KI-Transkription — der strategische Input für das gesamte System.',
    category: 'Recruiting',
    icon: 'users',
    status: 'active',
    webhookUrl: '',
    nodes: [
      // Vorbereitung & Upload
      { id: 'ob1', label: 'Upload-Anleitung',        description: 'Client erhält Anweisungen für Material-Upload',   icon: 'logo-gmail',          type: 'output',  ...p(0, 2) },
      { id: 'ob2', label: 'Material-Upload',          description: 'Client lädt Bilder, Texte, Brand Assets hoch',   icon: 'upload',              type: 'process', ...p(1, 2) },
      { id: 'ob3', label: 'Material-Ordner',          description: 'Alle Materialien zentral organisiert',            icon: 'logo-google-drive',   type: 'output',  ...p(1, 3) },
      // Onboarding Call
      { id: 'ob4', label: 'Onboarding Call',           description: 'Standardisiertes Gespräch nach Fragebogen',      icon: 'video',               type: 'process', ...p(2, 2) },
      { id: 'ob5', label: 'KI-Transkription',          description: 'Call aufnehmen, transkribieren und analysieren', icon: 'logo-openai',         type: 'ai',      ...p(3, 2) },
      // Ergebnis
      { id: 'ob6', label: 'Transkript gespeichert',    description: 'Maschinenlesbares Wissen dauerhaft gesichert',   icon: 'logo-google-docs',    type: 'output',  ...p(4, 1) },
      { id: 'ob7', label: 'Slack: Call abgeschlossen', description: 'Team über erfolgreichen Call informieren',       icon: 'logo-slack',          type: 'output',  ...p(4, 3) },
    ],
    connections: [
      { from: 'ob1', to: 'ob2' },
      { from: 'ob2', to: 'ob3' },
      { from: 'ob2', to: 'ob4' },
      { from: 'ob4', to: 'ob5' },
      { from: 'ob5', to: 'ob6' },
      { from: 'ob5', to: 'ob7' },
    ],
    groups: [
      { id: 'gob1', label: 'Material-Sammlung',  x: 15,   y: 338, width: 620,  height: 308, color: 'blue' },
      { id: 'gob2', label: 'Onboarding Call',     x: 695,  y: 338, width: 620,  height: 148, color: 'purple' },
      { id: 'gob3', label: 'Ergebnis',            x: 1375, y: 178, width: 280,  height: 468, color: 'green' },
    ],
    outputs: [],
    executionCount: 0,
  },

  // ─── 3c. Knowledge Processing (Phase 5) ──────────────────────────────────
  {
    id: 'demo-recruiting-knowledge',
    parentId: 'demo-recruiting',
    subSystemOrder: 2,
    name: 'Knowledge Processing',
    description: 'Transkript analysieren, Zielgruppen-Avatar, Anbieter-Profil und Core Messaging als strategische Basis-Dokumente erstellen.',
    category: 'Recruiting',
    icon: 'sparkles',
    status: 'active',
    webhookUrl: '',
    nodes: [
      // Analyse
      { id: 'kp1', label: 'Transkript-Analyse',      description: 'KI analysiert und strukturiert das Transkript',   icon: 'logo-openai',         type: 'ai',      ...p(0, 2) },
      { id: 'kp2', label: 'Daten extrahieren',        description: 'Pain Points, Benefits, Sprachmuster extrahieren', icon: 'logo-claude',        type: 'ai',      ...p(1, 2) },
      // Strategische Dokumente (fan-out)
      { id: 'kp3', label: 'Zielgruppen-Avatar',       description: 'Detailliertes Profil der Zielgruppe',            icon: 'logo-google-docs',    type: 'output',  ...p(2, 1) },
      { id: 'kp4', label: 'Anbieter-Avatar',          description: 'Marken- und Anbieter-Steckbrief',               icon: 'logo-google-docs',    type: 'output',  ...p(2, 2) },
      { id: 'kp5', label: 'Core Messaging',           description: 'Kern-Botschaften und Positionierung',           icon: 'logo-google-docs',    type: 'output',  ...p(2, 3) },
      // Zusammenführung & Qualität
      { id: 'kp6', label: 'Zusammenführen',           description: 'Alle Dokumente als Single Source of Truth',      icon: 'git-merge',           type: 'process', ...p(3, 2) },
      { id: 'kp7', label: 'Qualitätsprüfung',         description: 'Manuelle Faktenprüfung (Human Review)',         icon: 'shield-check',        type: 'process', ...p(4, 2) },
      { id: 'kp8', label: 'Slack: Basis fertig',      description: 'Team über fertige Strategie-Basis informieren', icon: 'logo-slack',          type: 'output',  ...p(5, 2) },
    ],
    connections: [
      { from: 'kp1', to: 'kp2' },
      { from: 'kp2', to: 'kp3' }, { from: 'kp2', to: 'kp4' }, { from: 'kp2', to: 'kp5' },
      { from: 'kp3', to: 'kp6' }, { from: 'kp4', to: 'kp6' }, { from: 'kp5', to: 'kp6' },
      { from: 'kp6', to: 'kp7' },
      { from: 'kp7', to: 'kp8' },
    ],
    groups: [
      { id: 'gkp1', label: 'KI-Analyse',                x: 15,   y: 338, width: 620,  height: 148, color: 'purple' },
      { id: 'gkp2', label: 'Strategische Dokumente',    x: 695,  y: 178, width: 280,  height: 468, color: 'purple' },
      { id: 'gkp3', label: 'Qualitätssicherung',        x: 1035, y: 338, width: 960,  height: 148, color: 'green' },
    ],
    outputs: [],
    executionCount: 0,
  },

  // ─── 3d. Content & Asset Production (Phase 6) ────────────────────────────
  {
    id: 'demo-recruiting-content',
    parentId: 'demo-recruiting',
    subSystemOrder: 3,
    name: 'Content & Asset Production',
    description: 'Marketing-Copy generieren, Website bauen, Bilder vorbereiten und alles veröffentlichen.',
    category: 'Recruiting',
    icon: 'file-text',
    status: 'active',
    webhookUrl: '',
    nodes: [
      // KI-Generierung (parallel)
      { id: 'cp1', label: 'KI: Website-Texte',    description: 'Website & Landing Page Copy generieren',         icon: 'logo-claude',         type: 'ai',      ...p(0, 0) },
      { id: 'cp2', label: 'KI: Ad Copy',           description: 'Meta, Google & weitere Anzeigentexte',          icon: 'logo-claude',         type: 'ai',      ...p(0, 2) },
      // Website-Erstellung
      { id: 'cp3', label: 'Template auswählen',    description: 'Passendes Website-Template selektieren',         icon: 'layout',              type: 'process', ...p(1, 1) },
      { id: 'cp4', label: 'Copy einsetzen',        description: 'Generierte Texte in Template einsetzen',         icon: 'text-cursor-input',   type: 'process', ...p(2, 1) },
      { id: 'cp5', label: 'Bilder vorbereiten',    description: 'Client-Bilder oder KI-generierte Bilder',       icon: 'image',               type: 'process', ...p(2, 2) },
      { id: 'cp6', label: 'Design anpassen',       description: 'Farben, Stil & Layout finalisieren',            icon: 'palette',             type: 'process', ...p(3, 1) },
      { id: 'cp7', label: 'Website bauen',         description: 'Alle Elemente zusammenfügen',                   icon: 'logo-wordpress',      type: 'process', ...p(4, 1) },
      { id: 'cp8', label: 'Domain verbinden',      description: 'Domain konfigurieren & SSL',                    icon: 'globe',               type: 'process', ...p(5, 1) },
      { id: 'cp9', label: 'Website Live',          description: 'Seite veröffentlichen',                         icon: 'globe',               type: 'output',  ...p(6, 0) },
      { id: 'cp10', label: 'Copy-Dokumente',       description: 'Alle generierten Texte gespeichert',            icon: 'logo-google-docs',    type: 'output',  ...p(6, 2) },
    ],
    connections: [
      { from: 'cp1', to: 'cp3' }, { from: 'cp1', to: 'cp4' },
      { from: 'cp2', to: 'cp4' }, { from: 'cp2', to: 'cp10' },
      { from: 'cp3', to: 'cp4' },
      { from: 'cp4', to: 'cp6' }, { from: 'cp5', to: 'cp6' },
      { from: 'cp6', to: 'cp7' },
      { from: 'cp7', to: 'cp8' },
      { from: 'cp8', to: 'cp9' },
    ],
    groups: [
      { id: 'gcp1', label: 'KI-Generierung',         x: 15,   y: 18,  width: 280,  height: 468, color: 'purple' },
      { id: 'gcp2', label: 'Website-Erstellung',      x: 355,  y: 178, width: 1580, height: 308, color: 'blue' },
      { id: 'gcp3', label: 'Ergebnis',                x: 2055, y: 18,  width: 280,  height: 468, color: 'green' },
    ],
    outputs: [],
    executionCount: 0,
  },

  // ─── 3e. Review & Launch (Phase 7–9) ─────────────────────────────────────
  {
    id: 'demo-recruiting-review',
    parentId: 'demo-recruiting',
    subSystemOrder: 4,
    name: 'Review & Launch',
    description: 'Kampagnen vorbereiten, interne Reviews durchführen, finale Freigabe und Zusammenfassung erstellen.',
    category: 'Recruiting',
    icon: 'shield-check',
    status: 'active',
    webhookUrl: '',
    nodes: [
      // Kampagnen-Vorbereitung
      { id: 'rl1', label: 'Kampagnen-Struktur',       description: 'Targeting, Budgets & Anzeigengruppen',          icon: 'logo-google-ads',     type: 'process', ...p(0, 1) },
      { id: 'rl2', label: 'Ad-Creatives',             description: 'Anzeigen mit Copy, Media & URLs vorbereiten',   icon: 'logo-meta',           type: 'process', ...p(1, 1) },
      { id: 'rl3', label: 'Interne Benachrichtigung', description: 'Team erhält Übersicht aller fertigen Assets',   icon: 'logo-slack',          type: 'output',  ...p(2, 1) },
      // Reviews (parallel)
      { id: 'rl4', label: 'Review-Aufgaben',          description: 'Checklisten-basierte Prüfaufgaben erstellen',   icon: 'list-checks',         type: 'process', ...p(3, 1) },
      { id: 'rl5', label: 'Copy-Check',               description: 'Texte auf Korrektheit & Tonalität prüfen',     icon: 'spell-check',         type: 'process', ...p(4, 0) },
      { id: 'rl6', label: 'Seiten-Check',             description: 'Website & Landing Pages verifizieren',          icon: 'monitor-check',       type: 'process', ...p(4, 1) },
      { id: 'rl7', label: 'Tracking-Check',           description: 'Analytics & Conversion-Tracking prüfen',       icon: 'chart-bar',           type: 'process', ...p(4, 2) },
      // Freigabe & Launch
      { id: 'rl8', label: 'Finale Freigabe',          description: 'Manuelle Endabnahme (Human Review)',           icon: 'shield-check',        type: 'process', ...p(5, 1) },
      { id: 'rl9', label: 'KI: Zusammenfassung',      description: 'Abschluss-PDF mit Zielgruppe, Links & Status', icon: 'logo-claude',         type: 'ai',      ...p(6, 1) },
      { id: 'rl10', label: 'Projekt → Live',          description: 'Transition zu laufendem Betrieb',              icon: 'rocket',              type: 'output',  ...p(7, 1) },
    ],
    connections: [
      { from: 'rl1', to: 'rl2' },
      { from: 'rl2', to: 'rl3' },
      { from: 'rl3', to: 'rl4' },
      { from: 'rl4', to: 'rl5' }, { from: 'rl4', to: 'rl6' }, { from: 'rl4', to: 'rl7' },
      { from: 'rl5', to: 'rl8' }, { from: 'rl6', to: 'rl8' }, { from: 'rl7', to: 'rl8' },
      { from: 'rl8', to: 'rl9' },
      { from: 'rl9', to: 'rl10' },
    ],
    groups: [
      { id: 'grl1', label: 'Kampagnen-Vorbereitung',  x: 15,   y: 178, width: 960,  height: 148, color: 'blue' },
      { id: 'grl2', label: 'Parallele Reviews',        x: 1035, y: 18,  width: 620,  height: 468, color: 'orange' },
      { id: 'grl3', label: 'Freigabe & Launch',        x: 1715, y: 178, width: 960,  height: 148, color: 'green' },
    ],
    outputs: [],
    executionCount: 0,
  },

  // ─── 3f. Performance Tracking (Phase 10) ─────────────────────────────────
  {
    id: 'demo-recruiting-tracking',
    parentId: 'demo-recruiting',
    subSystemOrder: 5,
    name: 'Performance Tracking',
    description: 'Tägliche Performance-Daten sammeln, KPIs analysieren, Reports erstellen und KI-basierte Optimierungsvorschläge.',
    category: 'Recruiting',
    icon: 'bar-chart',
    status: 'active',
    webhookUrl: '',
    nodes: [
      // Datenerfassung
      { id: 'pt1', label: 'Zeitplan (täglich)',       description: 'Täglicher/periodischer Daten-Refresh',         icon: 'calendar',            type: 'trigger', ...p(0, 1) },
      { id: 'pt2', label: 'Ad-Daten abrufen',        description: 'Performance-Daten von Meta, Google & Co.',     icon: 'logo-google-ads',     type: 'process', ...p(1, 1) },
      // Analyse & Reporting
      { id: 'pt3', label: 'KI: KPI-Analyse',          description: 'KPIs berechnen, Trends erkennen',             icon: 'logo-openai',         type: 'ai',      ...p(2, 1) },
      { id: 'pt4', label: 'Tracking-Sheet',           description: 'Impressions, Clicks, CTR, CPC, Leads',        icon: 'logo-google-sheets',  type: 'output',  ...p(3, 0) },
      { id: 'pt5', label: 'Dashboard Update',         description: 'Live-Dashboard für Team & Client',            icon: 'logo-google-sheets',  type: 'output',  ...p(3, 1) },
      { id: 'pt6', label: 'Slack: Daily Report',      description: 'Täglichen Performance-Report posten',         icon: 'logo-slack',          type: 'output',  ...p(3, 2) },
      { id: 'pt7', label: 'KI-Optimierung',           description: 'Automatische Kampagnen-Anpassungsvorschläge', icon: 'logo-claude',         type: 'ai',      ...p(4, 1) },
    ],
    connections: [
      { from: 'pt1', to: 'pt2' },
      { from: 'pt2', to: 'pt3' },
      { from: 'pt3', to: 'pt4' }, { from: 'pt3', to: 'pt5' }, { from: 'pt3', to: 'pt6' },
      { from: 'pt3', to: 'pt7' },
    ],
    groups: [
      { id: 'gpt1', label: 'Datenerfassung',          x: 15,   y: 178, width: 620,  height: 148, color: 'blue' },
      { id: 'gpt2', label: 'Analyse & Reporting',     x: 695,  y: 18,  width: 960,  height: 468, color: 'purple' },
    ],
    outputs: [],
    executionCount: 0,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. Recruiting Fulfillment — 27 Nodes
  // Vom Transcript zum Live-Funnel, Meta-Kampagne und Tracking-Dashboard
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'demo-recruiting-fulfillment',
    name: 'Recruiting Fulfillment',
    description: 'Vollautomatisches Recruiting-System: Vom Kunden-Transcript zum Live-Funnel (3 Seiten), Meta-Kampagne und öffentlichem Tracking-Dashboard – mit Slack-Benachrichtigungen im gesamten Flow.',
    category: 'Recruiting',
    icon: 'users',
    status: 'active',
    webhookUrl: '',
    nodes: [
      // ─── Phase 0: Start & Input (cols 0–1) ───
      { id: 'rf1',  label: 'Manueller Start',           description: 'Workflow per Klick starten — Transcript liegt vor',                icon: 'play',              type: 'trigger', ...p(0, 2) },
      { id: 'rf2',  label: 'Workflow initialisieren',    description: 'Workflow-Zustand & Variablen setzen',                              icon: 'code',              type: 'process', ...p(1, 2) },
      { id: 'rf3',  label: 'Slack: Workflow gestartet',  description: 'Team benachrichtigen: Recruiting-Workflow läuft',                  icon: 'logo-slack',        type: 'output',  ...p(1, 3) },

      // ─── Phase 1: Brief Extraction (cols 2–6, zigzag rows 1–2) ───
      { id: 'rf4',  label: 'Pain Points extrahieren',    description: 'KI analysiert Transcript nach Schmerzpunkten der Zielgruppe',     icon: 'logo-openai',       type: 'ai',      ...p(2, 2) },
      { id: 'rf5',  label: 'Benefits extrahieren',       description: 'Vorteile & Alleinstellungsmerkmale des Arbeitgebers ableiten',    icon: 'logo-openai',       type: 'ai',      ...p(3, 2) },
      { id: 'rf6',  label: 'Employer Avatar erstellen',  description: 'Detailliertes Profil des idealen Kandidaten generieren',          icon: 'logo-claude',       type: 'ai',      ...p(4, 1) },
      { id: 'rf7',  label: 'Company Profile erstellen',  description: 'Arbeitgeber-Profil mit Kultur, Werten & USPs aufbauen',           icon: 'logo-claude',       type: 'ai',      ...p(5, 1) },
      { id: 'rf8',  label: 'Creative Strategy Brief',    description: 'Gesamtstrategie für Messaging, Tonalität & Positionierung',       icon: 'logo-claude',       type: 'ai',      ...p(5, 2) },
      { id: 'rf9',  label: 'Master Brief',               description: 'Alle Analysen zum zentralen Briefing-Dokument zusammenführen',    icon: 'git-merge',         type: 'process', ...p(6, 2) },
      { id: 'rf10', label: 'Slack: Brief fertig',        description: 'Team informieren: Master Brief wurde erstellt',                   icon: 'logo-slack',        type: 'output',  ...p(6, 3) },

      // ─── Phase 2+3: Copy Package & Split (cols 7–8) ───
      { id: 'rf11', label: 'Copy Package erstellen',     description: 'Core Promise, Mechanism, Objections, CTA-Logik & Funnel-Messaging generieren', icon: 'logo-openai', type: 'ai',      ...p(7, 2) },
      { id: 'rf12', label: 'Pipeline Split',             description: 'Zwei parallele Pfade: Recruiting Funnel + Meta Ads',              icon: 'split',             type: 'process', ...p(8, 2) },

      // ─── Pipeline A: Recruiting Funnel (cols 9–12, rows 0–1) ───
      { id: 'rf13', label: 'Funnel-Struktur',            description: 'Landingpage, Formularseite, Danke-Seite & Conversion-Logik definieren', icon: 'logo-openai',  type: 'ai',      ...p(9, 0) },
      { id: 'rf14', label: 'Funnel Copy',                description: 'Alle Texte für alle 3 Funnel-Seiten generieren',                  icon: 'logo-claude',       type: 'ai',      ...p(10, 0) },
      { id: 'rf15', label: 'Funnel Builder',             description: 'KI-Agent fügt Struktur + Copy zu deploymentem Funnel-Code zusammen', icon: 'logo-claude',    type: 'ai',      ...p(11, 0) },
      { id: 'rf16', label: 'Funnel deployen',            description: 'Recruiting-Funnel (3 Seiten) live veröffentlichen',               icon: 'logo-wordpress',    type: 'output',  ...p(12, 0) },
      { id: 'rf17', label: 'Slack: Funnel live',         description: 'Team benachrichtigen: Recruiting-Funnel ist online',              icon: 'logo-slack',        type: 'output',  ...p(12, 1) },

      // ─── Pipeline B: Meta Ads (cols 9–12, row 4) ───
      { id: 'rf18', label: 'Kampagnen-Struktur',         description: 'Campaign, Adset & Audience-Struktur für Meta definieren',         icon: 'logo-openai',       type: 'ai',      ...p(9, 4) },
      { id: 'rf19', label: 'Ad Copy & Hooks',            description: 'Anzeigentexte, Headlines & Hooks für verschiedene Creatives',     icon: 'logo-claude',       type: 'ai',      ...p(10, 4) },
      { id: 'rf20', label: 'Meta Kampagne live',         description: 'Kampagne in Meta Ads Manager veröffentlichen & starten',          icon: 'logo-meta',         type: 'output',  ...p(11, 4) },
      { id: 'rf21', label: 'Slack: Ads live',            description: 'Team benachrichtigen: Meta-Kampagne läuft',                       icon: 'logo-slack',        type: 'output',  ...p(12, 4) },

      // ─── Tracking & Dashboard (cols 13–15, rows 0–1) ───
      { id: 'rf22', label: 'Tracking einrichten',        description: 'Conversion-Pixel, UTM-Parameter & Event-Tracking konfigurieren',  icon: 'code',              type: 'process', ...p(13, 0) },
      { id: 'rf23', label: 'Dashboard generieren',       description: 'Live-Dashboard mit Impressions, Klicks, Leads, CPL & Conversion Rate', icon: 'logo-openai',  type: 'ai',      ...p(14, 0) },
      { id: 'rf24', label: 'Dashboard veröffentlichen',  description: 'Öffentliches Tracking-Dashboard online stellen',                  icon: 'logo-wordpress',    type: 'output',  ...p(15, 0) },
      { id: 'rf25', label: 'Slack: Dashboard live',      description: 'Team benachrichtigen: Tracking-Dashboard ist online',             icon: 'logo-slack',        type: 'output',  ...p(15, 1) },

      // ─── Finaler Abschluss (col 16) ───
      { id: 'rf26', label: 'Alle Systeme live?',         description: 'Prüfen: Funnel, Kampagne & Dashboard erfolgreich deployed',       icon: 'git-branch',        type: 'process', ...p(16, 2) },
      { id: 'rf27', label: 'Slack: System deployed',     description: 'Full Recruiting System deployed successfully',                    icon: 'logo-slack',        type: 'output',  ...p(16, 3) },
    ],
    connections: [
      // Phase 0: Start → Code → Slack
      { from: 'rf1',  to: 'rf2' },
      { from: 'rf2',  to: 'rf3',  fromPort: 'bottom', toPort: 'top' },

      // Phase 0 → Phase 1
      { from: 'rf2',  to: 'rf4' },

      // Phase 1: Brief Extraction (sequential zigzag)
      { from: 'rf4',  to: 'rf5' },
      { from: 'rf5',  to: 'rf6' },
      { from: 'rf6',  to: 'rf7' },
      { from: 'rf7',  to: 'rf8',  fromPort: 'bottom', toPort: 'top' },
      { from: 'rf8',  to: 'rf9' },

      // Phase 1: Merge → Slack + Copy Package
      { from: 'rf9',  to: 'rf10', fromPort: 'bottom', toPort: 'top' },
      { from: 'rf9',  to: 'rf11' },

      // Phase 2 → Split
      { from: 'rf11', to: 'rf12' },

      // Pipeline A: Recruiting Funnel
      { from: 'rf12', to: 'rf13', label: 'Funnel' },
      { from: 'rf13', to: 'rf14' },
      { from: 'rf14', to: 'rf15' },
      { from: 'rf15', to: 'rf16' },
      { from: 'rf16', to: 'rf17', fromPort: 'bottom', toPort: 'top' },

      // Pipeline B: Meta Ads
      { from: 'rf12', to: 'rf18', label: 'Ads' },
      { from: 'rf18', to: 'rf19' },
      { from: 'rf19', to: 'rf20' },
      { from: 'rf20', to: 'rf21' },

      // Tracking & Dashboard (starts after Funnel deploy)
      { from: 'rf16', to: 'rf22' },
      { from: 'rf22', to: 'rf23' },
      { from: 'rf23', to: 'rf24' },
      { from: 'rf24', to: 'rf25', fromPort: 'bottom', toPort: 'top' },

      // Final: alle Pipelines → If/Then → Slack
      { from: 'rf17', to: 'rf26' },
      { from: 'rf21', to: 'rf26' },
      { from: 'rf25', to: 'rf26' },
      { from: 'rf26', to: 'rf27', fromPort: 'bottom', toPort: 'top' },
    ],
    groups: [
      { id: 'grf0', label: 'Start & Input',           x: 15,   y: 328, width: 620,  height: 308, color: 'blue' },
      { id: 'grf1', label: 'Brief Extraction',         x: 695,  y: 168, width: 1640, height: 468, color: 'purple' },
      { id: 'grf2', label: 'Copy & Distribution',      x: 2395, y: 328, width: 620,  height: 148, color: 'orange' },
      { id: 'grf3', label: 'Recruiting Funnel',        x: 3075, y: 8,   width: 1300, height: 308, color: 'green' },
      { id: 'grf4', label: 'Meta Ads',                 x: 3075, y: 648, width: 1300, height: 148, color: 'red' },
      { id: 'grf5', label: 'Tracking & Dashboard',     x: 4435, y: 8,   width: 960,  height: 308, color: 'blue' },
      { id: 'grf6', label: 'Finaler Check',            x: 5455, y: 328, width: 280,  height: 308, color: 'green' },
    ],
    outputs: [
      { id: 'orf1', name: 'Recruiting Funnel (3 Seiten)',   type: 'website',     link: '', createdAt: '2026-02-18T10:00:00Z' },
      { id: 'orf2', name: 'Meta Kampagne',                  type: 'other',       link: '', createdAt: '2026-02-18T10:00:00Z' },
      { id: 'orf3', name: 'Tracking Dashboard',             type: 'website',     link: '', createdAt: '2026-02-18T10:00:00Z' },
      { id: 'orf4', name: 'Master Brief',                   type: 'document',    link: '', createdAt: '2026-02-18T10:00:00Z' },
      { id: 'orf5', name: 'Copy Package',                   type: 'document',    link: '', createdAt: '2026-02-18T10:00:00Z' },
    ],
    executionCount: 0,
  },
];

// ─── English Translations for Demo Systems ──────────────────────────────────

const DEMO_META_EN: Record<string, { name: string; description: string }> = {
  'demo-1': { name: 'Client Onboarding',           description: 'From the initial meeting to finished website, ad copy and Google Ads — fully automated with AI analysis, content production and multi-channel deployment.' },
  'demo-2': { name: 'Marketing Agency Fulfillment', description: 'Complete agency workflow with 4 parallel lanes: Website, Social Media, Ads, and Email — from onboarding to final reporting.' },
  'demo-recruiting': { name: 'Recruiting Agency',              description: 'Complete agency fulfillment: from won client through onboarding, knowledge processing and content production to launch with performance tracking.' },
  'demo-recruiting-kickoff':    { name: 'Kickoff & Client Setup',      description: 'Internal setup: CRM entry, communication, project board, folder structure and working documents.' },
  'demo-recruiting-onboarding': { name: 'Client Onboarding',           description: 'Material collection, onboarding call and AI transcription — the strategic input for the entire system.' },
  'demo-recruiting-knowledge':  { name: 'Knowledge Processing',        description: 'Analyze transcript, create target audience avatar, provider profile and core messaging as strategic foundation.' },
  'demo-recruiting-content':    { name: 'Content & Asset Production',  description: 'Generate marketing copy, build website, prepare images and publish everything.' },
  'demo-recruiting-review':     { name: 'Review & Launch',             description: 'Prepare campaigns, run internal reviews, final approval and generate summary.' },
  'demo-recruiting-tracking':   { name: 'Performance Tracking',        description: 'Collect daily performance data, analyze KPIs, create reports and AI-based optimization suggestions.' },
  'demo-recruiting-fulfillment': { name: 'Recruiting Fulfillment',     description: 'Fully automated recruiting system: From client transcript to live funnel (3 pages), Meta campaign and public tracking dashboard — with Slack notifications throughout the flow.' },
};

/** Composite key: "systemId:nodeId" → { label, description } */
const DEMO_NODE_EN: Record<string, { label: string; description: string }> = {
  // ─── demo-1: Client Onboarding ───
  'demo-1:n1':  { label: 'Onboarding Meeting',       description: 'Initial meeting with the client' },
  'demo-1:n2':  { label: 'AI Transcription',          description: 'Conversation is transcribed & analyzed' },
  'demo-1:n3':  { label: 'CRM: Create Client',        description: 'Create contact & deal in HubSpot' },
  'demo-1:n4':  { label: 'AI: Create Briefing',       description: 'Extract client profile, target audience & requirements' },
  'demo-1:n5':  { label: 'Slack: Notify Team',        description: 'Notify account manager' },
  'demo-1:n6':  { label: 'AI: Ad Copy',               description: 'Generate headlines, copy & CTAs' },
  'demo-1:n7':  { label: 'AI: Website Texts',         description: 'Landing page structure & content' },
  'demo-1:n8':  { label: 'Quality Check',             description: 'Check consistency, tone & completeness' },
  'demo-1:n9':  { label: 'Ad Copy Package',           description: 'Copy & headlines as Google Doc' },
  'demo-1:n10': { label: 'Landing Page',              description: 'Website created & published' },
  'demo-1:n11': { label: 'Google Ads',                description: 'Campaign configured & launched' },
  'demo-1:n12': { label: 'Status Aggregation',        description: 'Merge all results' },
  'demo-1:n13': { label: 'Slack: Project Complete',   description: 'Notify team about completion' },
  'demo-1:n14': { label: 'CRM: Update Deal',          description: 'Update HubSpot deal stage' },
  // ─── demo-2: Marketing Agency Fulfillment ───
  'demo-2:f1':  { label: 'New Client Intake',         description: 'Deal won in HubSpot – Trigger' },
  'demo-2:f2':  { label: 'CRM Setup',                 description: 'Create client profile, pipeline & tags' },
  'demo-2:f3':  { label: 'Welcome Email',             description: 'Automatic welcome sequence' },
  'demo-2:f4':  { label: 'Client Folder',             description: 'Create Google Drive structure' },
  'demo-2:f5':  { label: 'Project Board',             description: 'Create Notion project with tasks' },
  'demo-2:f6':  { label: 'Kick-off Meeting',          description: 'Google Calendar invitation' },
  'demo-2:f7':  { label: 'Team Slack',                description: 'Team notified in channel' },
  'demo-2:f8':  { label: 'AI Market Analysis',        description: 'Analyze industry, competition & trends' },
  'demo-2:f9':  { label: 'Audience Analysis',         description: 'AI-based audience profiling for website' },
  'demo-2:f10': { label: 'Social Strategy',           description: 'Content types, formats & posting plan' },
  'demo-2:f11': { label: 'Strategy Document',         description: 'Overall strategy & positioning' },
  'demo-2:f12': { label: 'Ad Strategy',               description: 'Targeting, budgets & campaign structure' },
  'demo-2:f13': { label: 'Email Strategy',            description: 'Sequences, segments & automations' },
  'demo-2:f14': { label: 'AI Copywriting',            description: 'Website texts, headlines & CTAs' },
  'demo-2:f15': { label: 'Website Build',             description: 'Build landing page with copy' },
  'demo-2:f16': { label: 'Website Live',              description: 'Publish landing page' },
  'demo-2:f17': { label: 'Visual Creation',           description: 'Images, reels & graphics via AI' },
  'demo-2:f18': { label: 'Social Content',            description: 'Compile posts with captions & visuals' },
  'demo-2:f19': { label: 'Instagram Posting',         description: 'Automatically publish posts' },
  'demo-2:f20': { label: 'Campaign Planning',         description: 'Audiences, budgets & ad groups' },
  'demo-2:f21': { label: 'Ad Creatives',              description: 'Ad texts, images & videos' },
  'demo-2:f22': { label: 'Meta Ads Upload',           description: 'Upload ads directly to Meta' },
  'demo-2:f23': { label: 'Google Ads Upload',         description: 'Upload ads directly to Google Ads' },
  'demo-2:f24': { label: 'Email Copy',                description: 'Newsletter copy & subject lines via AI' },
  'demo-2:f25': { label: 'Email Design',              description: 'Design templates & layouts' },
  'demo-2:f26': { label: 'Email Campaign',            description: 'Start newsletter sequence' },
  'demo-2:f27': { label: 'Performance Tracking',      description: 'Real-time KPIs across all channels' },
  'demo-2:f28': { label: 'AI Optimization',           description: 'Automatic campaign adjustments' },
  'demo-2:f29': { label: 'Weekly Update',             description: 'Status report via Slack to client' },
  'demo-2:f30': { label: 'Results Report',            description: 'AI-generated final report' },
  'demo-2:f31': { label: 'Final PDF',                 description: 'Formatted PDF report for client' },
  'demo-2:f32': { label: 'Client Feedback',           description: 'Send review form' },
  'demo-2:f33': { label: 'Archival',                  description: 'Archive & hand over project' },
  // ─── demo-recruiting: Recruiting Agency (Master) ───
  'demo-recruiting:rm1':  { label: 'Client Won',                description: 'Contract signed — handover from Sales' },
  'demo-recruiting:rm2':  { label: 'Handover Form',             description: 'Internal form with all client data' },
  'demo-recruiting:rm3':  { label: 'Merge Data',                description: 'Validate and merge sales & form data' },
  // ─── demo-recruiting-kickoff: Kickoff & Client Setup ───
  'demo-recruiting-kickoff:ks1':  { label: 'Handover Form',          description: 'Internal handover form completed' },
  'demo-recruiting-kickoff:ks2':  { label: 'CRM Entry',              description: 'Create client profile, pipeline & tags' },
  'demo-recruiting-kickoff:ks3':  { label: 'Internal Slack Channel', description: 'Dedicated team channel for client' },
  'demo-recruiting-kickoff:ks4':  { label: 'Welcome Email',          description: 'Automatic welcome sequence to client' },
  'demo-recruiting-kickoff:ks5':  { label: 'Onboarding Guide',       description: 'Send preparation instructions to client' },
  'demo-recruiting-kickoff:ks6':  { label: 'Kick-off Meeting',       description: 'Create onboarding call in calendar' },
  'demo-recruiting-kickoff:ks7':  { label: 'Project Board',          description: 'Create client project with standard tasks' },
  'demo-recruiting-kickoff:ks8':  { label: 'Generate Tasks',         description: 'Onboarding, review, go-live checklists' },
  'demo-recruiting-kickoff:ks9':  { label: 'Folder Structure',       description: 'Assets, Copy, Tracking, Reports, Website' },
  'demo-recruiting-kickoff:ks10': { label: 'Working Documents',      description: 'Duplicate and personalize templates' },
  'demo-recruiting-kickoff:ks11': { label: 'Status: Onboarding',     description: 'Set CRM status to "Onboarding in progress"' },
  // ─── demo-recruiting-onboarding: Client Onboarding ───
  'demo-recruiting-onboarding:ob1': { label: 'Upload Instructions',    description: 'Client receives material upload guide' },
  'demo-recruiting-onboarding:ob2': { label: 'Material Upload',        description: 'Client uploads images, texts, brand assets' },
  'demo-recruiting-onboarding:ob3': { label: 'Material Folder',        description: 'All materials organized centrally' },
  'demo-recruiting-onboarding:ob4': { label: 'Onboarding Call',        description: 'Standardized meeting with questionnaire' },
  'demo-recruiting-onboarding:ob5': { label: 'AI Transcription',       description: 'Record, transcribe and analyze call' },
  'demo-recruiting-onboarding:ob6': { label: 'Transcript Saved',       description: 'Machine-readable knowledge preserved' },
  'demo-recruiting-onboarding:ob7': { label: 'Slack: Call Complete',    description: 'Notify team about successful call' },
  // ─── demo-recruiting-knowledge: Knowledge Processing ───
  'demo-recruiting-knowledge:kp1': { label: 'Transcript Analysis',     description: 'AI analyzes and structures transcript' },
  'demo-recruiting-knowledge:kp2': { label: 'Extract Data',            description: 'Extract pain points, benefits, language patterns' },
  'demo-recruiting-knowledge:kp3': { label: 'Audience Avatar',         description: 'Detailed target audience profile' },
  'demo-recruiting-knowledge:kp4': { label: 'Provider Avatar',         description: 'Brand and provider fact sheet' },
  'demo-recruiting-knowledge:kp5': { label: 'Core Messaging',          description: 'Core messages and positioning' },
  'demo-recruiting-knowledge:kp6': { label: 'Merge',                   description: 'All documents as single source of truth' },
  'demo-recruiting-knowledge:kp7': { label: 'Quality Check',           description: 'Manual fact check (human review)' },
  'demo-recruiting-knowledge:kp8': { label: 'Slack: Foundation Ready', description: 'Notify team about completed strategy base' },
  // ─── demo-recruiting-content: Content & Asset Production ───
  'demo-recruiting-content:cp1':  { label: 'AI: Website Copy',       description: 'Generate website & landing page copy' },
  'demo-recruiting-content:cp2':  { label: 'AI: Ad Copy',            description: 'Meta, Google & other ad texts' },
  'demo-recruiting-content:cp3':  { label: 'Select Template',        description: 'Choose matching website template' },
  'demo-recruiting-content:cp4':  { label: 'Insert Copy',            description: 'Insert generated texts into template' },
  'demo-recruiting-content:cp5':  { label: 'Prepare Images',         description: 'Client images or AI-generated images' },
  'demo-recruiting-content:cp6':  { label: 'Adapt Design',           description: 'Finalize colors, style & layout' },
  'demo-recruiting-content:cp7':  { label: 'Build Website',          description: 'Assemble all elements' },
  'demo-recruiting-content:cp8':  { label: 'Connect Domain',         description: 'Configure domain & SSL' },
  'demo-recruiting-content:cp9':  { label: 'Website Live',           description: 'Publish page' },
  'demo-recruiting-content:cp10': { label: 'Copy Documents',         description: 'All generated texts saved' },
  // ─── demo-recruiting-review: Review & Launch ───
  'demo-recruiting-review:rl1':  { label: 'Campaign Structure',      description: 'Targeting, budgets & ad groups' },
  'demo-recruiting-review:rl2':  { label: 'Ad Creatives',            description: 'Prepare ads with copy, media & URLs' },
  'demo-recruiting-review:rl3':  { label: 'Internal Notification',   description: 'Team receives overview of completed assets' },
  'demo-recruiting-review:rl4':  { label: 'Review Tasks',            description: 'Create checklist-based review tasks' },
  'demo-recruiting-review:rl5':  { label: 'Copy Check',              description: 'Verify texts for accuracy & tone' },
  'demo-recruiting-review:rl6':  { label: 'Page Check',              description: 'Verify website & landing pages' },
  'demo-recruiting-review:rl7':  { label: 'Tracking Check',          description: 'Verify analytics & conversion tracking' },
  'demo-recruiting-review:rl8':  { label: 'Final Approval',          description: 'Manual final sign-off (human review)' },
  'demo-recruiting-review:rl9':  { label: 'AI: Summary',             description: 'Final PDF with audience, links & status' },
  'demo-recruiting-review:rl10': { label: 'Project → Live',          description: 'Transition to ongoing operations' },
  // ─── demo-recruiting-tracking: Performance Tracking ───
  'demo-recruiting-tracking:pt1': { label: 'Schedule (Daily)',        description: 'Daily/periodic data refresh' },
  'demo-recruiting-tracking:pt2': { label: 'Pull Ad Data',           description: 'Performance data from Meta, Google & more' },
  'demo-recruiting-tracking:pt3': { label: 'AI: KPI Analysis',       description: 'Calculate KPIs, detect trends' },
  'demo-recruiting-tracking:pt4': { label: 'Tracking Sheet',         description: 'Impressions, clicks, CTR, CPC, leads' },
  'demo-recruiting-tracking:pt5': { label: 'Dashboard Update',       description: 'Live dashboard for team & client' },
  'demo-recruiting-tracking:pt6': { label: 'Slack: Daily Report',    description: 'Post daily performance report' },
  'demo-recruiting-tracking:pt7': { label: 'AI Optimization',        description: 'Automatic campaign adjustment suggestions' },
  // ─── demo-recruiting-fulfillment ───
  'demo-recruiting-fulfillment:rf1':  { label: 'Manual Start',              description: 'Start workflow manually — transcript is ready' },
  'demo-recruiting-fulfillment:rf2':  { label: 'Initialize Workflow',       description: 'Set workflow state & variables' },
  'demo-recruiting-fulfillment:rf3':  { label: 'Slack: Workflow Started',   description: 'Notify team: Recruiting workflow running' },
  'demo-recruiting-fulfillment:rf4':  { label: 'Extract Pain Points',      description: 'AI analyzes transcript for target audience pain points' },
  'demo-recruiting-fulfillment:rf5':  { label: 'Extract Benefits',         description: 'Derive employer advantages & unique selling points' },
  'demo-recruiting-fulfillment:rf6':  { label: 'Create Employer Avatar',   description: 'Generate detailed ideal candidate profile' },
  'demo-recruiting-fulfillment:rf7':  { label: 'Create Company Profile',   description: 'Build employer profile with culture, values & USPs' },
  'demo-recruiting-fulfillment:rf8':  { label: 'Creative Strategy Brief',  description: 'Overall strategy for messaging, tonality & positioning' },
  'demo-recruiting-fulfillment:rf9':  { label: 'Master Brief',             description: 'Merge all analyses into central briefing document' },
  'demo-recruiting-fulfillment:rf10': { label: 'Slack: Brief Done',        description: 'Notify team: Master Brief created' },
  'demo-recruiting-fulfillment:rf11': { label: 'Create Copy Package',      description: 'Generate core promise, mechanism, objections, CTA logic & funnel messaging' },
  'demo-recruiting-fulfillment:rf12': { label: 'Pipeline Split',           description: 'Two parallel paths: Recruiting Funnel + Meta Ads' },
  'demo-recruiting-fulfillment:rf13': { label: 'Funnel Structure',         description: 'Define landing page, form page, thank-you page & conversion logic' },
  'demo-recruiting-fulfillment:rf14': { label: 'Funnel Copy',              description: 'Generate all copy for all 3 funnel pages' },
  'demo-recruiting-fulfillment:rf15': { label: 'Funnel Builder',           description: 'AI agent merges structure + copy into deployable funnel code' },
  'demo-recruiting-fulfillment:rf16': { label: 'Deploy Funnel',            description: 'Publish recruiting funnel (3 pages) live' },
  'demo-recruiting-fulfillment:rf17': { label: 'Slack: Funnel Live',       description: 'Notify team: Recruiting funnel is online' },
  'demo-recruiting-fulfillment:rf18': { label: 'Campaign Structure',       description: 'Define campaign, adset & audience structure for Meta' },
  'demo-recruiting-fulfillment:rf19': { label: 'Ad Copy & Hooks',          description: 'Ad texts, headlines & hooks for various creatives' },
  'demo-recruiting-fulfillment:rf20': { label: 'Meta Campaign Live',       description: 'Publish & start campaign in Meta Ads Manager' },
  'demo-recruiting-fulfillment:rf21': { label: 'Slack: Ads Live',          description: 'Notify team: Meta campaign running' },
  'demo-recruiting-fulfillment:rf22': { label: 'Setup Tracking',           description: 'Configure conversion pixel, UTM parameters & event tracking' },
  'demo-recruiting-fulfillment:rf23': { label: 'Generate Dashboard',       description: 'Live dashboard with impressions, clicks, leads, CPL & conversion rate' },
  'demo-recruiting-fulfillment:rf24': { label: 'Publish Dashboard',        description: 'Deploy public tracking dashboard' },
  'demo-recruiting-fulfillment:rf25': { label: 'Slack: Dashboard Live',    description: 'Notify team: Tracking dashboard is online' },
  'demo-recruiting-fulfillment:rf26': { label: 'All Systems Live?',        description: 'Check: Funnel, campaign & dashboard successfully deployed' },
  'demo-recruiting-fulfillment:rf27': { label: 'Slack: System Deployed',   description: 'Full Recruiting System deployed successfully' },
};

/** Composite key: "systemId:groupId" → English label */
const DEMO_GROUP_EN: Record<string, string> = {
  // demo-1
  'demo-1:g1': 'Intake',              'demo-1:g2': 'AI Processing',
  'demo-1:g3': 'Content Production',  'demo-1:g4': 'Deployment & Results',
  // demo-2
  'demo-2:gf1': 'Client Intake',              'demo-2:gf2': 'Project Setup',
  'demo-2:gf3': 'AI Analysis',                'demo-2:gf4': 'Website · Concept → Live',
  'demo-2:gf5': 'Social Media · Content → Posting', 'demo-2:gf6': 'Advertising · Creatives → Upload',
  'demo-2:gf7': 'Email · Copy → Delivery',    'demo-2:gf8': 'Monitoring & Optimization',
  'demo-2:gf9': 'Completion & Handover',
  // demo-recruiting-kickoff
  'demo-recruiting-kickoff:gks1': 'Intake',              'demo-recruiting-kickoff:gks2': 'Communication',
  'demo-recruiting-kickoff:gks3': 'Project & Files',     'demo-recruiting-kickoff:gks4': 'Completion',
  // demo-recruiting-onboarding
  'demo-recruiting-onboarding:gob1': 'Material Collection', 'demo-recruiting-onboarding:gob2': 'Onboarding Call',
  'demo-recruiting-onboarding:gob3': 'Result',
  // demo-recruiting-knowledge
  'demo-recruiting-knowledge:gkp1': 'AI Analysis',       'demo-recruiting-knowledge:gkp2': 'Strategic Documents',
  'demo-recruiting-knowledge:gkp3': 'Quality Assurance',
  // demo-recruiting-content
  'demo-recruiting-content:gcp1': 'AI Generation',       'demo-recruiting-content:gcp2': 'Website Creation',
  'demo-recruiting-content:gcp3': 'Result',
  // demo-recruiting-review
  'demo-recruiting-review:grl1': 'Campaign Preparation', 'demo-recruiting-review:grl2': 'Parallel Reviews',
  'demo-recruiting-review:grl3': 'Approval & Launch',
  // demo-recruiting-tracking
  'demo-recruiting-tracking:gpt1': 'Data Collection',    'demo-recruiting-tracking:gpt2': 'Analysis & Reporting',
  // demo-recruiting-fulfillment
  'demo-recruiting-fulfillment:grf0': 'Start & Input',       'demo-recruiting-fulfillment:grf1': 'Brief Extraction',
  'demo-recruiting-fulfillment:grf2': 'Copy & Distribution', 'demo-recruiting-fulfillment:grf3': 'Recruiting Funnel',
  'demo-recruiting-fulfillment:grf4': 'Meta Ads',            'demo-recruiting-fulfillment:grf5': 'Tracking & Dashboard',
  'demo-recruiting-fulfillment:grf6': 'Final Check',
};

export function getLocalizedDemoSystem(sys: AutomationSystem, lang: 'de' | 'en'): AutomationSystem {
  if (lang === 'de') return sys;
  const meta = DEMO_META_EN[sys.id];
  return {
    ...sys,
    name: meta?.name || sys.name,
    description: meta?.description || sys.description,
    nodes: sys.nodes.map(n => {
      const en = DEMO_NODE_EN[`${sys.id}:${n.id}`];
      return en ? { ...n, label: en.label, description: en.description } : n;
    }),
    groups: sys.groups?.map(g => {
      const en = DEMO_GROUP_EN[`${sys.id}:${g.id}`];
      return en ? { ...g, label: en } : g;
    }),
  };
}

// ─── Storage Keys ──────────────────────────────────────────────────────────────

export const STORAGE_KEY = 'flowstack-automation-systems';
const HIDDEN_DEMOS_KEY = 'flowstack-hidden-demos';

// ─── User Systems CRUD ─────────────────────────────────────────────────────────

export function loadUserSystems(): AutomationSystem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (s: unknown): s is AutomationSystem =>
        typeof s === 'object' && s !== null &&
        typeof (s as AutomationSystem).id === 'string' &&
        typeof (s as AutomationSystem).name === 'string' &&
        Array.isArray((s as AutomationSystem).nodes),
    );
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
  const hidden = new Set(getHiddenDemoIds());
  const masterHidden = DEMO_SYSTEMS.filter(d => hidden.has(d.id) && !d.parentId);
  const masterHiddenIds = new Set(masterHidden.map(d => d.id));
  return DEMO_SYSTEMS.filter(d => !hidden.has(d.id) && !(d.parentId && masterHiddenIds.has(d.parentId)));
}

export function getAllSystems(): AutomationSystem[] {
  return [...getVisibleDemoSystems(), ...loadUserSystems()];
}

export function findSystem(id: string): AutomationSystem | undefined {
  return getAllSystems().find(s => s.id === id);
}

// ── Sub-System helpers ────────────────────────────────────────

export function getSubSystems(parentId: string): AutomationSystem[] {
  return getAllSystems()
    .filter(s => s.parentId === parentId)
    .sort((a, b) => (a.subSystemOrder ?? 0) - (b.subSystemOrder ?? 0));
}

export function getTopLevelSystems(): AutomationSystem[] {
  return getAllSystems().filter(s => !s.parentId);
}

export function isMasterSystem(systemId: string): boolean {
  return getAllSystems().some(s => s.parentId === systemId);
}

export function getParentSystem(childId: string): AutomationSystem | undefined {
  const child = findSystem(childId);
  if (!child?.parentId) return undefined;
  return findSystem(child.parentId);
}

// ── Demo Resources ──────────────────────────────────────────────────────────

import type { SystemResource } from '../types/automation';

export function getDemoResources(_systemId: string, _lang: 'de' | 'en'): SystemResource[] {
  return [];
}
