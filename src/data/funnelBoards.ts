import type { FunnelBoard } from '@/types/funnel';

// ─── Storage Key ──────────────────────────────────────────────────────────────

const STORAGE_KEY = 'flowstack-funnel-boards';

// ─── Demo Board ───────────────────────────────────────────────────────────────

export const DEMO_FUNNEL_BOARD: FunnelBoard = {
  id: 'demo-funnel-1',
  name: 'Lead-Generierung Funnel',
  description: 'Facebook Ads → Landing Page → Formular → E-Mail Sequenz',
  elements: [
    { id: 'f1', type: 'platform', platformKind: 'facebook-ads', icon: 'logo-meta', label: 'Facebook Ads', description: 'Zielgruppe: B2B Entscheider', x: 80, y: 220, width: 200, height: 80 },
    { id: 'f2', type: 'platform', platformKind: 'landingpage', icon: 'globe', label: 'Landing Page', description: 'Conversion-optimiert', x: 400, y: 220, width: 200, height: 80 },
    { id: 'f3', type: 'platform', platformKind: 'formular', icon: 'file-text', label: 'Kontaktformular', description: 'Name, E-Mail, Firma', x: 720, y: 220, width: 200, height: 80 },
    { id: 'f4', type: 'platform', platformKind: 'email', icon: 'mail', label: 'E-Mail Sequenz', description: '5 Follow-up Mails', x: 1040, y: 220, width: 200, height: 80 },
    { id: 'f5', type: 'platform', platformKind: 'kalender', icon: 'logo-calendly', label: 'Booking', description: 'Beratungstermin buchen', x: 1040, y: 360, width: 200, height: 80 },
    { id: 'f6', type: 'text', textKind: 'headline', textContent: 'Lead-Generierung Funnel', fontSize: 28, fontWeight: 'bold', textColor: '#1f2937', x: 80, y: 60, width: 400, height: 48 },
    { id: 'f7', type: 'text', textKind: 'body', textContent: 'Von der ersten Ad-Impression bis zum gebuchten Beratungstermin – vollautomatisch.', fontSize: 14, fontWeight: 'normal', textColor: '#6b7280', x: 80, y: 110, width: 500, height: 40 },
    { id: 'f8', type: 'mockup', mockupKind: 'mobile', mockupText: 'Landing Page\nMobile Ansicht', x: 440, y: 360, width: 220, height: 420 },
  ],
  connections: [
    { id: 'c1', from: 'f1', to: 'f2', fromPort: 'right', toPort: 'left', lineStyle: 'solid', label: 'Klick' },
    { id: 'c2', from: 'f2', to: 'f3', fromPort: 'right', toPort: 'left', lineStyle: 'solid', label: 'Absenden' },
    { id: 'c3', from: 'f3', to: 'f4', fromPort: 'right', toPort: 'left', lineStyle: 'solid', label: 'Trigger' },
    { id: 'c4', from: 'f4', to: 'f5', fromPort: 'bottom', toPort: 'top', lineStyle: 'dashed', label: 'CTA' },
  ],
  phases: [
    { id: 'p1', label: 'Awareness', x: 50, y: 170, width: 260, height: 150, color: 'blue' },
    { id: 'p2', label: 'Interest', x: 370, y: 170, width: 260, height: 640, color: 'purple' },
    { id: 'p3', label: 'Conversion', x: 690, y: 170, width: 260, height: 150, color: 'green' },
    { id: 'p4', label: 'Nurture', x: 1010, y: 170, width: 260, height: 290, color: 'orange' },
  ],
  createdAt: '2025-02-01T10:00:00Z',
  updatedAt: '2025-02-08T10:00:00Z',
};

// ─── CRUD Functions ───────────────────────────────────────────────────────────

export function loadFunnelBoards(): FunnelBoard[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveFunnelBoards(boards: FunnelBoard[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
    return true;
  } catch (e) {
    console.warn('localStorage Fehler beim Speichern:', e);
    return false;
  }
}

export function deleteFunnelBoard(id: string): FunnelBoard[] {
  const boards = loadFunnelBoards().filter(b => b.id !== id);
  saveFunnelBoards(boards);
  return boards;
}

export function duplicateFunnelBoard(id: string): FunnelBoard | null {
  const boards = loadFunnelBoards();
  const board = boards.find(b => b.id === id);
  if (!board) return null;

  const now = new Date().toISOString();
  const copy: FunnelBoard = {
    ...JSON.parse(JSON.stringify(board)),
    id: `funnel-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: `${board.name} (Kopie)`,
    createdAt: now,
    updatedAt: now,
  };

  saveFunnelBoards([...boards, copy]);
  return copy;
}

export function getAllFunnelBoards(): FunnelBoard[] {
  const userBoards = loadFunnelBoards();
  const hasDemoBoard = userBoards.some(b => b.id === DEMO_FUNNEL_BOARD.id);
  return hasDemoBoard ? userBoards : [DEMO_FUNNEL_BOARD, ...userBoards];
}
