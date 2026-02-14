import type { NodeType } from '@/types/automation';

export interface PaletteItem {
  icon: string;
  tKey: string;        // Translation key for the label
  label?: string;      // Direct label (fallback for tool logos)
  type: NodeType;
}

export const PALETTE_ITEMS: PaletteItem[] = [
  // ── Trigger ──
  { icon: 'logo-zapier', tKey: 'palette.trigger', type: 'trigger' },
  { icon: 'webhook', tKey: 'palette.webhook', type: 'trigger' },
  // ── KI / AI ──
  { icon: 'logo-openai', tKey: 'palette.aiStep', type: 'ai' },
  { icon: 'logo-claude', tKey: 'palette.aiAgent', type: 'ai' },
  { icon: 'logo-openai', tKey: 'palette.aiAnalysis', type: 'ai' },
  // ── Process ──
  { icon: 'logo-google-sheets', tKey: 'palette.data', type: 'process' },
  { icon: 'filter', tKey: 'palette.filter', type: 'process' },
  { icon: 'split', tKey: 'palette.split', type: 'process' },
  { icon: 'repeat', tKey: 'palette.loop', type: 'process' },
  { icon: 'timer', tKey: 'palette.timer', type: 'process' },
  { icon: 'shield-check', tKey: 'palette.approval', type: 'process' },
  { icon: 'file-search', tKey: 'palette.search', type: 'process' },
  { icon: 'logo-make', tKey: 'palette.processor', type: 'process' },
  { icon: 'layers', tKey: 'palette.multiStep', type: 'process' },
  { icon: 'settings', tKey: 'palette.config', type: 'process' },
  { icon: 'logo-n8n', tKey: 'palette.workflow', type: 'process' },
  // ── Output ──
  { icon: 'logo-wordpress', tKey: 'palette.website', type: 'output' },
  { icon: 'logo-google-docs', tKey: 'palette.document', type: 'output' },
  { icon: 'logo-gmail', tKey: 'palette.email', type: 'output' },
  { icon: 'logo-slack', tKey: 'palette.send', type: 'output' },
  { icon: 'logo-google-ads', tKey: 'palette.ads', type: 'output' },
  { icon: 'bell', tKey: 'palette.notification', type: 'output' },
  { icon: 'logo-google-analytics', tKey: 'palette.dashboard', type: 'output' },
  { icon: 'logo-whatsapp', tKey: 'palette.chat', type: 'output' },
  { icon: 'gauge', tKey: 'palette.monitoring', type: 'output' },
  { icon: 'lock', tKey: 'palette.auth', type: 'output' },
];
