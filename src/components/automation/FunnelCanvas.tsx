/**
 * FunnelCanvas – Visual marketing funnel builder & viewer
 * Features: zoom/pan, drag & drop, resize, connections with labels,
 *           snap guides, undo/redo, board management, PNG export,
 *           platform nodes, mockup frames, text elements, media elements
 */

import { useState, useRef, useCallback, useEffect, useMemo, memo } from 'react';
import {
  Plus, Trash2, Save, Globe, Mail, FileText, Search, Video,
  ZoomIn, ZoomOut, Crosshair, Undo2, Redo2, Magnet, HelpCircle,
  Download, GitBranch, Maximize2, Minimize2, X, Image as ImageIcon,
  Type, Monitor, Smartphone, Tablet, Target,
  LayoutGrid, Copy, Eye, BarChart3, ArrowRight,
  SlidersHorizontal, Check, Grid3X3, History, Map as MapIcon,
} from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import type { PortDirection } from '@/types/automation';
import type {
  FunnelElement, FunnelConnection, FunnelPhase, FunnelBoard,
  FunnelSnapshot, FunnelElementType, PlatformKind, MockupKind, TextKind,
  FunnelLineStyle,
} from '@/types/funnel';
import { ELEMENT_DEFAULTS, MOCKUP_SIZES, PLATFORMS } from '@/types/funnel';
import { TOOL_LOGOS, renderNodeIcon } from './ToolLogos';
import { saveFunnelBoards, getAllFunnelBoards, deleteFunnelBoard, duplicateFunnelBoard } from '@/data/funnelBoards';

// ─── Constants ───────────────────────────────────────────────────────────────

const SNAP_THRESHOLD = 8;
const PAN_DRAG_THRESHOLD = 4;
const MAX_LABEL = 40;

// CSS for element creation animation
const ANIM_STYLE = document.createElement('style');
ANIM_STYLE.textContent = `
@keyframes funnelNodeAppear { 0% { opacity:0; transform: scale(0.85); } 100% { opacity:1; transform: scale(1); } }
.funnel-node-appear { animation: funnelNodeAppear 0.25s cubic-bezier(0.34,1.56,0.64,1) both; }
`;
if (!document.getElementById('funnel-anim-style')) { ANIM_STYLE.id = 'funnel-anim-style'; document.head.appendChild(ANIM_STYLE); }

const GROUP_COLORS: Record<string, { bg: string; border: string; text: string; name: string }> = {
  blue:   { bg: 'rgba(59,130,246,0.05)',  border: 'rgba(59,130,246,0.18)',  text: 'rgba(59,130,246,0.55)',  name: 'Blau' },
  green:  { bg: 'rgba(16,185,129,0.05)',  border: 'rgba(16,185,129,0.18)',  text: 'rgba(16,185,129,0.55)',  name: 'Grün' },
  purple: { bg: 'rgba(139,92,246,0.05)',  border: 'rgba(139,92,246,0.18)',  text: 'rgba(139,92,246,0.55)',  name: 'Lila' },
  orange: { bg: 'rgba(245,158,11,0.05)',  border: 'rgba(245,158,11,0.18)',  text: 'rgba(245,158,11,0.55)',  name: 'Orange' },
  red:    { bg: 'rgba(239,68,68,0.05)',   border: 'rgba(239,68,68,0.18)',   text: 'rgba(239,68,68,0.55)',   name: 'Rot' },
  gray:   { bg: 'rgba(107,114,128,0.04)', border: 'rgba(107,114,128,0.15)', text: 'rgba(107,114,128,0.45)', name: 'Grau' },
};

const LUCIDE_ICONS: Record<string, typeof Globe> = {
  'globe': Globe, 'mail': Mail, 'file-text': FileText, 'search': Search,
  'video': Video, 'target': Target, 'image': ImageIcon, 'monitor': Monitor,
  'smartphone': Smartphone, 'tablet': Tablet, 'type': Type, 'eye': Eye,
};

// ─── Connection Path Helpers ─────────────────────────────────────────────────

const PORT_DIR: Record<PortDirection, [number, number]> = {
  top: [0, -1], right: [1, 0], bottom: [0, 1], left: [-1, 0],
};

function getElPortPos(el: FunnelElement, port: PortDirection): { x: number; y: number } {
  switch (port) {
    case 'top':    return { x: el.x + el.width / 2, y: el.y };
    case 'right':  return { x: el.x + el.width, y: el.y + el.height / 2 };
    case 'bottom': return { x: el.x + el.width / 2, y: el.y + el.height };
    case 'left':   return { x: el.x, y: el.y + el.height / 2 };
  }
}

function getFunnelConnectionPath(from: FunnelElement, to: FunnelElement, fp: PortDirection, tp: PortDirection): string {
  const p1 = getElPortPos(from, fp);
  const p2 = getElPortPos(to, tp);
  const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
  const offset = Math.max(60, dist * 0.35);
  const d1 = PORT_DIR[fp], d2 = PORT_DIR[tp];
  return `M ${p1.x} ${p1.y} C ${p1.x + d1[0] * offset} ${p1.y + d1[1] * offset}, ${p2.x + d2[0] * offset} ${p2.y + d2[1] * offset}, ${p2.x} ${p2.y}`;
}

function getTempPath(fx: number, fy: number, dir: [number, number], tx: number, ty: number): string {
  const dist = Math.hypot(tx - fx, ty - fy);
  const offset = Math.max(60, dist * 0.35);
  return `M ${fx} ${fy} C ${fx + dir[0] * offset} ${fy + dir[1] * offset}, ${tx} ${ty}, ${tx} ${ty}`;
}

function getStraightPath(from: FunnelElement, to: FunnelElement, fp: PortDirection, tp: PortDirection): string {
  const p1 = getElPortPos(from, fp);
  const p2 = getElPortPos(to, tp);
  return `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;
}

function getStepPath(from: FunnelElement, to: FunnelElement, fp: PortDirection, tp: PortDirection): string {
  const p1 = getElPortPos(from, fp);
  const p2 = getElPortPos(to, tp);
  const isHorizontal = fp === 'left' || fp === 'right';
  if (isHorizontal) {
    const mx = (p1.x + p2.x) / 2;
    return `M ${p1.x} ${p1.y} L ${mx} ${p1.y} L ${mx} ${p2.y} L ${p2.x} ${p2.y}`;
  }
  const my = (p1.y + p2.y) / 2;
  return `M ${p1.x} ${p1.y} L ${p1.x} ${my} L ${p2.x} ${my} L ${p2.x} ${p2.y}`;
}

// ─── Equal-Spacing Detection ─────────────────────────────────────────────────

interface CanvasItem { id: string; x: number; y: number; w: number; h: number }
type EqGuide = { axis: 'x' | 'y'; segA: { from: number; to: number; cross: number }; segB: { from: number; to: number; cross: number }; dist: number };

function detectEqualSpacing(items: CanvasItem[], dragId: string, dx: number, dy: number, dw: number, dh: number, threshold: number): { snapX: number | null; snapY: number | null; guides: EqGuide[] } {
  const others = items.filter(it => it.id !== dragId);
  const guides: EqGuide[] = [];
  let snapX: number | null = null, snapY: number | null = null;

  const dragCY = dy + dh / 2;
  const hNeighbors = others.filter(o => o.y + o.h > dy - dh * 0.5 && o.y < dy + dh + dh * 0.5);
  const leftItems = hNeighbors.filter(o => o.x + o.w <= dx + threshold).sort((a, b) => (b.x + b.w) - (a.x + a.w));
  const rightItems = hNeighbors.filter(o => o.x >= dx + dw - threshold).sort((a, b) => a.x - b.x);

  if (leftItems.length > 0 && rightItems.length > 0) {
    const A = leftItems[0], C = rightItems[0];
    const totalGap = C.x - (A.x + A.w) - dw;
    const equalGap = totalGap / 2;
    const equalX = A.x + A.w + equalGap;
    if (equalGap > 4 && Math.abs(dx - equalX) < threshold) {
      snapX = equalX;
      guides.push({ axis: 'x', segA: { from: A.x + A.w, to: equalX, cross: dragCY }, segB: { from: equalX + dw, to: C.x, cross: dragCY }, dist: equalGap });
    }
  }

  const dragCX = dx + dw / 2;
  const vNeighbors = others.filter(o => o.x + o.w > dx - dw * 0.5 && o.x < dx + dw + dw * 0.5);
  const topItems = vNeighbors.filter(o => o.y + o.h <= dy + threshold).sort((a, b) => (b.y + b.h) - (a.y + a.h));
  const bottomItems = vNeighbors.filter(o => o.y >= dy + dh - threshold).sort((a, b) => a.y - b.y);

  if (topItems.length > 0 && bottomItems.length > 0) {
    const A = topItems[0], C = bottomItems[0];
    const totalGap = C.y - (A.y + A.h) - dh;
    const equalGap = totalGap / 2;
    const equalY = A.y + A.h + equalGap;
    if (equalGap > 4 && Math.abs(dy - equalY) < threshold) {
      snapY = equalY;
      guides.push({ axis: 'y', segA: { from: A.y + A.h, to: equalY, cross: dragCX }, segB: { from: equalY + dh, to: C.y, cross: dragCX }, dist: equalGap });
    }
  }

  return { snapX, snapY, guides };
}

// ─── Auto-Layout ─────────────────────────────────────────────────────────────

function computeAutoLayout(elements: FunnelElement[], connections: FunnelConnection[]): FunnelElement[] {
  if (elements.length === 0) return elements;
  const incoming = new Set(connections.map(c => c.to));
  const startIds = elements.filter(n => !incoming.has(n.id)).map(n => n.id);
  if (startIds.length === 0) startIds.push(elements[0].id);

  const layerMap = new Map<string, number>();
  const queue: { id: string; depth: number }[] = startIds.map(id => ({ id, depth: 0 }));
  const visited = new Set<string>();

  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;
    if (visited.has(id)) { if ((layerMap.get(id) ?? 0) < depth) layerMap.set(id, depth); continue; }
    visited.add(id);
    layerMap.set(id, depth);
    for (const c of connections.filter(c => c.from === id)) queue.push({ id: c.to, depth: depth + 1 });
  }

  let maxLayer = Math.max(0, ...layerMap.values());
  for (const el of elements) { if (!layerMap.has(el.id)) layerMap.set(el.id, ++maxLayer); }

  const layers = new Map<number, string[]>();
  for (const [id, layer] of layerMap) { const l = layers.get(layer) || []; l.push(id); layers.set(layer, l); }

  const result = new Map<string, { x: number; y: number }>();
  for (const [layer, ids] of layers) {
    ids.forEach((id, idx) => {
      const el = elements.find(e => e.id === id);
      const spacing = el ? Math.max(el.width + 120, 320) : 320;
      result.set(id, { x: 40 + layer * spacing, y: 40 + idx * 140 });
    });
  }

  return elements.map(el => { const pos = result.get(el.id); return pos ? { ...el, x: pos.x, y: pos.y } : el; });
}

// ─── Palette Items ───────────────────────────────────────────────────────────

interface FunnelPaletteItem {
  type: FunnelElementType;
  label: string;
  icon: string;
  platformKind?: PlatformKind;
  mockupKind?: MockupKind;
  textKind?: TextKind;
  mediaType?: 'image' | 'video';
}

const MOCKUP_ITEMS: FunnelPaletteItem[] = [
  { type: 'mockup', label: 'Smartphone', icon: 'smartphone', mockupKind: 'mobile' },
  { type: 'mockup', label: 'Desktop Browser', icon: 'monitor', mockupKind: 'desktop' },
  { type: 'mockup', label: 'Tablet', icon: 'tablet', mockupKind: 'tablet' },
  { type: 'mockup', label: 'Social Post', icon: 'image', mockupKind: 'social-post' },
  { type: 'mockup', label: 'Ad Preview', icon: 'target', mockupKind: 'ad-mockup' },
  { type: 'mockup', label: 'Facebook Ad', icon: 'target', mockupKind: 'facebook-ad' },
  { type: 'mockup', label: 'Instagram Ad', icon: 'target', mockupKind: 'instagram-ad' },
  { type: 'mockup', label: 'Google Ad', icon: 'target', mockupKind: 'google-ad' },
  { type: 'mockup', label: 'LinkedIn Ad', icon: 'target', mockupKind: 'linkedin-ad' },
  { type: 'mockup', label: 'LinkedIn Post', icon: 'image', mockupKind: 'linkedin-post' },
  { type: 'mockup', label: 'TikTok Ad', icon: 'target', mockupKind: 'tiktok-ad' },
];

const TEXT_ITEMS: FunnelPaletteItem[] = [
  { type: 'text', label: 'Überschrift', icon: 'type', textKind: 'headline' },
  { type: 'text', label: 'Unterüberschrift', icon: 'type', textKind: 'subheadline' },
  { type: 'text', label: 'Fließtext', icon: 'file-text', textKind: 'body' },
  { type: 'text', label: 'Notiz', icon: 'file-text', textKind: 'note' },
];

const MEDIA_ITEMS: FunnelPaletteItem[] = [
  { type: 'media', label: 'Bild', icon: 'image', mediaType: 'image' },
  { type: 'media', label: 'Video', icon: 'video', mediaType: 'video' },
];

// ─── Funnel Templates ──────────────────────────────────────────────────────────

interface FunnelTemplate { name: string; description: string; elements: Partial<FunnelElement>[]; connections: [number, number, PortDirection, PortDirection][] }

const FUNNEL_TEMPLATES: FunnelTemplate[] = [
  {
    name: 'Facebook → LP → Formular → CRM',
    description: 'Klassischer Lead-Gen Funnel mit Facebook Ads',
    elements: [
      { type: 'platform', platformKind: 'facebook-ads', label: 'Facebook Ads', icon: 'logo-meta', x: 60, y: 120 },
      { type: 'platform', platformKind: 'landingpage', label: 'Landing Page', icon: 'globe', x: 320, y: 120 },
      { type: 'platform', platformKind: 'formular', label: 'Formular', icon: 'file-text', x: 580, y: 120 },
      { type: 'platform', platformKind: 'crm', label: 'CRM', icon: 'logo-hubspot', x: 840, y: 120 },
    ],
    connections: [[0, 1, 'right', 'left'], [1, 2, 'right', 'left'], [2, 3, 'right', 'left']],
  },
  {
    name: 'Google Ads → Website → Checkout',
    description: 'E-Commerce Funnel mit Google Ads',
    elements: [
      { type: 'platform', platformKind: 'google-ads', label: 'Google Ads', icon: 'logo-google-ads', x: 60, y: 120 },
      { type: 'platform', platformKind: 'website', label: 'Website', icon: 'globe', x: 320, y: 120 },
      { type: 'platform', platformKind: 'checkout', label: 'Checkout', icon: 'logo-stripe', x: 580, y: 120 },
      { type: 'platform', platformKind: 'email', label: 'Follow-up E-Mail', icon: 'mail', x: 580, y: 260 },
    ],
    connections: [[0, 1, 'right', 'left'], [1, 2, 'right', 'left'], [2, 3, 'bottom', 'top']],
  },
  {
    name: 'Multi-Channel → Kalender → CRM',
    description: 'Termin-Buchungs-Funnel mit mehreren Kanälen',
    elements: [
      { type: 'platform', platformKind: 'facebook-ads', label: 'Facebook Ads', icon: 'logo-meta', x: 60, y: 60 },
      { type: 'platform', platformKind: 'instagram-ads', label: 'Instagram Ads', icon: 'logo-instagram', x: 60, y: 200 },
      { type: 'platform', platformKind: 'landingpage', label: 'Landing Page', icon: 'globe', x: 320, y: 130 },
      { type: 'platform', platformKind: 'kalender', label: 'Kalender', icon: 'logo-calendly', x: 580, y: 130 },
      { type: 'platform', platformKind: 'crm', label: 'CRM', icon: 'logo-hubspot', x: 840, y: 60 },
      { type: 'platform', platformKind: 'whatsapp-sms', label: 'WhatsApp Follow-up', icon: 'logo-whatsapp', x: 840, y: 200 },
    ],
    connections: [[0, 2, 'right', 'left'], [1, 2, 'right', 'left'], [2, 3, 'right', 'left'], [3, 4, 'right', 'left'], [3, 5, 'right', 'left']],
  },
  {
    name: 'SEO → Website → Webinar → CRM',
    description: 'Content-Marketing Funnel',
    elements: [
      { type: 'platform', platformKind: 'seo', label: 'SEO', icon: 'search', x: 60, y: 120 },
      { type: 'platform', platformKind: 'website', label: 'Blog / Website', icon: 'globe', x: 320, y: 120 },
      { type: 'platform', platformKind: 'webinar', label: 'Webinar', icon: 'video', x: 580, y: 120 },
      { type: 'platform', platformKind: 'crm', label: 'CRM', icon: 'logo-hubspot', x: 840, y: 120 },
    ],
    connections: [[0, 1, 'right', 'left'], [1, 2, 'right', 'left'], [2, 3, 'right', 'left']],
  },
  {
    name: 'LinkedIn → Formular → E-Mail → Kalender',
    description: 'B2B Lead-Gen mit LinkedIn',
    elements: [
      { type: 'platform', platformKind: 'linkedin-ads', label: 'LinkedIn Ads', icon: 'logo-linkedin', x: 60, y: 120 },
      { type: 'platform', platformKind: 'formular', label: 'Formular', icon: 'file-text', x: 320, y: 120 },
      { type: 'platform', platformKind: 'email', label: 'E-Mail Sequenz', icon: 'mail', x: 580, y: 120 },
      { type: 'platform', platformKind: 'kalender', label: 'Kalender-Buchung', icon: 'logo-calendly', x: 840, y: 120 },
    ],
    connections: [[0, 1, 'right', 'left'], [1, 2, 'right', 'left'], [2, 3, 'right', 'left']],
  },
];

// ─── Element Renderer (memoized) ─────────────────────────────────────────────

const PlatformNode = memo(({ el, isDark }: { el: FunnelElement; isSelected?: boolean; isDark: boolean }) => {
  const platform = PLATFORMS.find(p => p.kind === el.platformKind);
  const color = platform?.color || '#8b5cf6';
  const iconKey = el.icon || platform?.icon || 'globe';
  const LucideIcon = LUCIDE_ICONS[iconKey];

  return (
    <div className="h-full flex items-center px-4 gap-3">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: color + '18' }}>
        {TOOL_LOGOS[iconKey] ? renderNodeIcon(iconKey) : LucideIcon ? <LucideIcon size={18} style={{ color }} /> : <Globe size={18} style={{ color }} />}
      </div>
      <div className="min-w-0 flex-1">
        <div className={`font-medium text-[13px] truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{el.label || 'Platform'}</div>
        {el.description && <div className={`text-[11px] mt-0.5 truncate ${isDark ? 'text-zinc-500' : 'text-gray-500'}`}>{el.description}</div>}
      </div>
      {el.metricLabel && (
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">{el.metricLabel}</span>
      )}
    </div>
  );
});

const MockupFrame = memo(({ el, isDark }: { el: FunnelElement; isDark: boolean }) => {
  const kind = el.mockupKind || 'mobile';
  const borderColor = isDark ? 'rgba(113,113,122,0.3)' : 'rgba(209,213,219,0.8)';
  const bgColor = isDark ? 'rgba(39,39,42,0.5)' : 'rgba(249,250,251,0.9)';
  const subText = isDark ? 'text-zinc-500' : 'text-gray-400';
  const cardBg = isDark ? 'rgba(39,39,42,0.8)' : '#ffffff';

  if (kind === 'mobile') {
    return (
      <div className="h-full flex flex-col rounded-[20px] overflow-hidden" style={{ border: `2px solid ${borderColor}`, background: bgColor }}>
        <div className="flex items-center justify-center py-2 gap-1" style={{ borderBottom: `1px solid ${borderColor}` }}>
          <div className="w-12 h-1.5 rounded-full" style={{ background: borderColor }} />
        </div>
        <div className="flex-1 overflow-hidden">
          {el.mockupImageUrl ? <img src={el.mockupImageUrl} alt="" className="w-full h-full object-cover" /> : (
            <div className="p-3 space-y-2 h-full flex flex-col">
              {el.mockupBrowserUrl && <div className="text-[8px] text-center opacity-50 truncate">{el.mockupBrowserUrl}</div>}
              {el.mockupHeadline ? <p className="text-xs font-bold text-center" style={{ color: isDark ? '#fff' : '#1f2937' }}>{el.mockupHeadline}</p> : null}
              {el.mockupBodyText ? <p className={`text-[9px] text-center ${subText}`}>{el.mockupBodyText}</p> : null}
              {!el.mockupHeadline && !el.mockupBodyText && <div className="flex-1 flex items-center justify-center"><span className={`text-xs text-center ${subText}`}>{el.mockupText || 'Mobile Preview'}</span></div>}
              {el.mockupCtaText && <div className="mt-auto"><div className="bg-purple-600 text-white text-[9px] font-medium text-center py-1.5 rounded-lg">{el.mockupCtaText}</div></div>}
            </div>
          )}
        </div>
        <div className="flex items-center justify-center py-2" style={{ borderTop: `1px solid ${borderColor}` }}>
          <div className="w-8 h-1 rounded-full" style={{ background: borderColor }} />
        </div>
      </div>
    );
  }
  if (kind === 'desktop') {
    return (
      <div className="h-full flex flex-col rounded-lg overflow-hidden" style={{ border: `2px solid ${borderColor}`, background: bgColor }}>
        <div className="flex items-center gap-1.5 px-3 py-2" style={{ borderBottom: `1px solid ${borderColor}` }}>
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
          <div className="flex-1 mx-2 h-5 rounded-md flex items-center px-2" style={{ background: isDark ? 'rgba(63,63,70,0.5)' : 'rgba(229,231,235,0.8)' }}>
            {el.mockupBrowserUrl && <span className="text-[8px] truncate" style={{ color: isDark ? '#a1a1aa' : '#9ca3af' }}>{el.mockupBrowserUrl}</span>}
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          {el.mockupImageUrl ? <img src={el.mockupImageUrl} alt="" className="w-full h-full object-cover" /> : (
            <div className="p-4 space-y-3 h-full flex flex-col">
              {el.mockupHeadline ? <p className="text-sm font-bold" style={{ color: isDark ? '#fff' : '#1f2937' }}>{el.mockupHeadline}</p> : null}
              {el.mockupBodyText ? <p className={`text-[10px] ${subText}`}>{el.mockupBodyText}</p> : null}
              {!el.mockupHeadline && !el.mockupBodyText && <div className="flex-1 flex items-center justify-center"><span className={`text-xs text-center ${subText}`}>{el.mockupText || 'Desktop Preview'}</span></div>}
              {el.mockupCtaText && <div><div className="bg-purple-600 text-white text-[10px] font-medium text-center py-2 rounded-lg w-32">{el.mockupCtaText}</div></div>}
            </div>
          )}
        </div>
      </div>
    );
  }
  if (kind === 'tablet') {
    return (
      <div className="h-full flex flex-col rounded-2xl overflow-hidden" style={{ border: `2px solid ${borderColor}`, background: bgColor }}>
        <div className="flex items-center justify-center py-1.5" style={{ borderBottom: `1px solid ${borderColor}` }}>
          <div className="w-2 h-2 rounded-full" style={{ background: borderColor }} />
        </div>
        <div className="flex-1 overflow-hidden">
          {el.mockupImageUrl ? <img src={el.mockupImageUrl} alt="" className="w-full h-full object-cover" /> : (
            <div className="p-3 space-y-2 h-full flex flex-col">
              {el.mockupHeadline ? <p className="text-xs font-bold" style={{ color: isDark ? '#fff' : '#1f2937' }}>{el.mockupHeadline}</p> : null}
              {el.mockupBodyText ? <p className={`text-[9px] ${subText}`}>{el.mockupBodyText}</p> : null}
              {!el.mockupHeadline && !el.mockupBodyText && <div className="flex-1 flex items-center justify-center"><span className={`text-xs text-center ${subText}`}>{el.mockupText || 'Tablet Preview'}</span></div>}
            </div>
          )}
        </div>
      </div>
    );
  }

  // social-post
  if (kind === 'social-post') {
    return (
      <div className="h-full flex flex-col rounded-xl overflow-hidden" style={{ border: `2px solid ${borderColor}`, background: cardBg }}>
        {/* Profile header */}
        <div className="flex items-center gap-2 px-3 py-2.5" style={{ borderBottom: `1px solid ${borderColor}` }}>
          {el.mockupProfileImage ? (
            <img src={el.mockupProfileImage} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold truncate" style={{ color: isDark ? '#fff' : '#1f2937' }}>{el.mockupProfileName || 'Your Brand'}</p>
            <p className={`text-[8px] ${subText}`}>Jetzt · 🌍</p>
          </div>
          <div className={`text-[10px] ${subText}`}>•••</div>
        </div>
        {/* Post text */}
        {el.mockupBodyText && (
          <div className="px-3 py-2">
            <p className="text-[9px] leading-relaxed" style={{ color: isDark ? '#e4e4e7' : '#374151' }}>{el.mockupBodyText}</p>
          </div>
        )}
        {/* Image */}
        <div className="flex-1 overflow-hidden">
          {el.mockupImageUrl ? <img src={el.mockupImageUrl} alt="" className="w-full h-full object-cover" /> : (
            <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-zinc-800' : 'bg-gray-100'}`}>
              <span className={`text-xs ${subText}`}>{el.mockupText || 'Bild einfügen'}</span>
            </div>
          )}
        </div>
        {/* Engagement row */}
        <div className="flex items-center justify-between px-3 py-2" style={{ borderTop: `1px solid ${borderColor}` }}>
          <div className="flex items-center gap-1"><span className="text-[8px]">👍</span><span className={`text-[8px] ${subText}`}>24</span></div>
          <div className="flex items-center gap-3">
            <span className={`text-[8px] ${subText}`}>5 Kommentare</span>
            <span className={`text-[8px] ${subText}`}>2 Mal geteilt</span>
          </div>
        </div>
        <div className="flex items-center justify-around py-1.5" style={{ borderTop: `1px solid ${borderColor}` }}>
          {['👍 Gefällt mir', '💬 Kommentar', '↗ Teilen'].map(action => (
            <span key={action} className={`text-[8px] font-medium ${subText}`}>{action}</span>
          ))}
        </div>
      </div>
    );
  }

  // facebook-ad
  if (kind === 'facebook-ad') {
    return (
      <div className="h-full flex flex-col rounded-xl overflow-hidden" style={{ border: `2px solid ${borderColor}`, background: cardBg }}>
        <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: `1px solid ${borderColor}`, background: isDark ? 'rgba(39,39,42,0.6)' : '#f0f2f5' }}>
          {el.mockupProfileImage ? <img src={el.mockupProfileImage} alt="" className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 rounded-full bg-[#1877F2]" />}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold truncate" style={{ color: isDark ? '#fff' : '#1f2937' }}>{el.mockupProfileName || 'Brand Name'}</p>
            <p className={`text-[7px] ${subText}`}>Gesponsert · 🌍</p>
          </div>
        </div>
        {el.mockupBodyText && <div className="px-3 py-1.5"><p className="text-[9px] leading-relaxed" style={{ color: isDark ? '#e4e4e7' : '#374151' }}>{el.mockupBodyText}</p></div>}
        <div className="flex-1 overflow-hidden">
          {el.mockupImageUrl ? <img src={el.mockupImageUrl} alt="" className="w-full h-full object-cover" /> : (
            <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-zinc-800' : 'bg-gray-100'}`}><span className={`text-xs ${subText}`}>{el.mockupText || 'Ad Creative'}</span></div>
          )}
        </div>
        <div className="px-3 py-2 flex items-center gap-2" style={{ borderTop: `1px solid ${borderColor}`, background: isDark ? 'rgba(39,39,42,0.6)' : '#f0f2f5' }}>
          <div className="flex-1 min-w-0">
            {el.mockupBrowserUrl && <p className={`text-[7px] uppercase ${subText} truncate`}>{el.mockupBrowserUrl}</p>}
            <p className="text-[10px] font-semibold truncate" style={{ color: isDark ? '#fff' : '#1f2937' }}>{el.mockupHeadline || 'Ad Headline'}</p>
          </div>
          <div className="shrink-0 bg-[#1877F2] text-white text-[8px] font-semibold px-2.5 py-1.5 rounded">{el.mockupCtaText || 'Mehr dazu'}</div>
        </div>
        <div className="flex items-center justify-around py-1.5" style={{ borderTop: `1px solid ${borderColor}` }}>
          {['👍 Gefällt mir', '💬 Kommentar', '↗ Teilen'].map(a => <span key={a} className={`text-[8px] font-medium ${subText}`}>{a}</span>)}
        </div>
      </div>
    );
  }

  // instagram-ad
  if (kind === 'instagram-ad') {
    return (
      <div className="h-full flex flex-col rounded-xl overflow-hidden" style={{ border: `2px solid ${borderColor}`, background: cardBg }}>
        <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: `1px solid ${borderColor}` }}>
          <div className="w-7 h-7 rounded-full p-[1.5px]" style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}>
            {el.mockupProfileImage ? <img src={el.mockupProfileImage} alt="" className="w-full h-full rounded-full object-cover border-2 border-white" /> : <div className="w-full h-full rounded-full bg-white dark:bg-zinc-900" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold truncate" style={{ color: isDark ? '#fff' : '#1f2937' }}>{el.mockupProfileName || 'brand_name'}</p>
            <p className={`text-[7px] ${subText}`}>Gesponsert</p>
          </div>
          <div className={`text-[10px] ${subText}`}>•••</div>
        </div>
        <div className="flex-1 overflow-hidden">
          {el.mockupImageUrl ? <img src={el.mockupImageUrl} alt="" className="w-full h-full object-cover" /> : (
            <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-zinc-800' : 'bg-gray-100'}`}><span className={`text-xs ${subText}`}>{el.mockupText || 'Ad Creative'}</span></div>
          )}
        </div>
        <div className="flex items-center justify-between px-3 py-2" style={{ borderTop: `1px solid ${borderColor}` }}>
          <div className="flex items-center gap-3">
            <span className="text-sm">♡</span><span className="text-sm">💬</span><span className="text-sm">✈</span>
          </div>
          <span className="text-sm">🔖</span>
        </div>
        {el.mockupHeadline && <div className="px-3 pb-1"><p className="text-[9px] font-semibold" style={{ color: isDark ? '#fff' : '#1f2937' }}>{el.mockupHeadline}</p></div>}
        {el.mockupBodyText && <div className="px-3 pb-2"><p className="text-[8px]" style={{ color: isDark ? '#e4e4e7' : '#374151' }}>{el.mockupBodyText}</p></div>}
        {el.mockupCtaText && <div className="px-3 pb-2"><button className="w-full text-[9px] font-semibold text-white py-1.5 rounded" style={{ background: '#0095f6' }}>{el.mockupCtaText}</button></div>}
      </div>
    );
  }

  // google-ad (Text-only search ad)
  if (kind === 'google-ad') {
    return (
      <div className="h-full flex flex-col rounded-lg overflow-hidden p-4" style={{ border: `2px solid ${borderColor}`, background: cardBg }}>
        <div className="flex items-center gap-1 mb-1">
          <span className="text-[8px] font-bold text-white bg-[#202124] dark:bg-zinc-600 px-1.5 py-0.5 rounded">Ad</span>
          <span className="text-[9px]" style={{ color: '#202124' }}>{el.mockupBrowserUrl || 'www.example.com'}</span>
        </div>
        <p className="text-[13px] font-medium mb-1" style={{ color: '#1a0dab' }}>{el.mockupHeadline || 'Ad Headline – Click Here'}</p>
        {el.mockupDescription && <p className="text-[10px] mb-1" style={{ color: '#1a0dab' }}>{el.mockupDescription}</p>}
        <p className="text-[9px] leading-relaxed" style={{ color: isDark ? '#bdc1c6' : '#4d5156' }}>{el.mockupBodyText || 'Beschreibung der Werbeanzeige. Klicke hier um mehr zu erfahren über unser Angebot.'}</p>
        <div className="mt-auto pt-3 flex gap-2">
          {(el.mockupCtaText || 'Jetzt entdecken').split(',').map((link, i) => (
            <span key={i} className="text-[8px] font-medium" style={{ color: '#1a0dab' }}>{'>'} {link.trim()}</span>
          ))}
        </div>
      </div>
    );
  }

  // linkedin-ad
  if (kind === 'linkedin-ad') {
    return (
      <div className="h-full flex flex-col rounded-xl overflow-hidden" style={{ border: `2px solid ${borderColor}`, background: cardBg }}>
        <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: `1px solid ${borderColor}` }}>
          {el.mockupProfileImage ? <img src={el.mockupProfileImage} alt="" className="w-8 h-8 rounded object-cover" /> : <div className="w-8 h-8 rounded bg-[#0A66C2]" />}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold truncate" style={{ color: isDark ? '#fff' : '#1f2937' }}>{el.mockupProfileName || 'Company Name'}</p>
            <p className={`text-[7px] ${subText}`}>Gesponsert · Beworben</p>
          </div>
          <div className={`text-[10px] ${subText}`}>•••</div>
        </div>
        {el.mockupBodyText && <div className="px-3 py-1.5"><p className="text-[9px] leading-relaxed" style={{ color: isDark ? '#e4e4e7' : '#374151' }}>{el.mockupBodyText}</p></div>}
        <div className="flex-1 overflow-hidden">
          {el.mockupImageUrl ? <img src={el.mockupImageUrl} alt="" className="w-full h-full object-cover" /> : (
            <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-zinc-800' : 'bg-gray-100'}`}><span className={`text-xs ${subText}`}>{el.mockupText || 'Ad Creative'}</span></div>
          )}
        </div>
        <div className="px-3 py-2 flex items-center gap-2" style={{ borderTop: `1px solid ${borderColor}`, background: isDark ? 'rgba(39,39,42,0.6)' : '#f3f6f8' }}>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold truncate" style={{ color: isDark ? '#fff' : '#1f2937' }}>{el.mockupHeadline || 'Sponsored Content'}</p>
            {el.mockupBrowserUrl && <p className={`text-[7px] ${subText} truncate`}>{el.mockupBrowserUrl}</p>}
          </div>
          <div className="shrink-0 bg-[#0A66C2] text-white text-[8px] font-semibold px-2.5 py-1.5 rounded-full">{el.mockupCtaText || 'Mehr erfahren'}</div>
        </div>
        <div className="flex items-center justify-around py-1.5" style={{ borderTop: `1px solid ${borderColor}` }}>
          {['👍 Gefällt mir', '💬 Kommentar', '↗ Teilen', '✉ Senden'].map(a => <span key={a} className={`text-[7px] font-medium ${subText}`}>{a}</span>)}
        </div>
      </div>
    );
  }

  // linkedin-post (organic)
  if (kind === 'linkedin-post') {
    return (
      <div className="h-full flex flex-col rounded-xl overflow-hidden" style={{ border: `2px solid ${borderColor}`, background: cardBg }}>
        <div className="flex items-center gap-2 px-3 py-2.5" style={{ borderBottom: `1px solid ${borderColor}` }}>
          {el.mockupProfileImage ? <img src={el.mockupProfileImage} alt="" className="w-9 h-9 rounded-full object-cover" /> : <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0A66C2] to-[#004182]" />}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold truncate" style={{ color: isDark ? '#fff' : '#1f2937' }}>{el.mockupProfileName || 'Max Mustermann'}</p>
            <p className={`text-[7px] ${subText} truncate`}>{el.mockupDescription || 'CEO @ Unternehmen'}</p>
            <p className={`text-[7px] ${subText}`}>Jetzt · 🌍</p>
          </div>
          <div className={`text-[10px] ${subText}`}>•••</div>
        </div>
        {el.mockupBodyText && <div className="px-3 py-2"><p className="text-[9px] leading-relaxed" style={{ color: isDark ? '#e4e4e7' : '#374151' }}>{el.mockupBodyText}</p></div>}
        <div className="flex-1 overflow-hidden">
          {el.mockupImageUrl ? <img src={el.mockupImageUrl} alt="" className="w-full h-full object-cover" /> : (
            <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-zinc-800' : 'bg-gray-100'}`}><span className={`text-xs ${subText}`}>{el.mockupText || 'Bild/Video'}</span></div>
          )}
        </div>
        <div className="flex items-center justify-between px-3 py-1.5" style={{ borderTop: `1px solid ${borderColor}` }}>
          <div className="flex items-center gap-1"><span className="text-[8px]">👍❤️</span><span className={`text-[8px] ${subText}`}>42</span></div>
          <div className="flex items-center gap-3">
            <span className={`text-[8px] ${subText}`}>8 Kommentare</span>
            <span className={`text-[8px] ${subText}`}>3 Reposts</span>
          </div>
        </div>
        <div className="flex items-center justify-around py-1.5" style={{ borderTop: `1px solid ${borderColor}` }}>
          {['👍 Gefällt mir', '💬 Kommentar', '↻ Repost', '✉ Senden'].map(a => <span key={a} className={`text-[7px] font-medium ${subText}`}>{a}</span>)}
        </div>
      </div>
    );
  }

  // tiktok-ad
  if (kind === 'tiktok-ad') {
    return (
      <div className="h-full flex flex-col rounded-2xl overflow-hidden relative" style={{ border: `2px solid ${borderColor}`, background: '#000' }}>
        <div className="flex-1 overflow-hidden relative">
          {el.mockupImageUrl ? <img src={el.mockupImageUrl} alt="" className="w-full h-full object-cover" /> : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-900"><span className="text-xs text-zinc-500">{el.mockupText || 'Video'}</span></div>
          )}
          {/* Right sidebar icons */}
          <div className="absolute right-2 bottom-16 flex flex-col items-center gap-3">
            {['♡', '💬', '🔖', '↗'].map(icon => (
              <div key={icon} className="flex flex-col items-center"><span className="text-white text-sm">{icon}</span><span className="text-white text-[7px]">1.2K</span></div>
            ))}
          </div>
        </div>
        {/* Bottom overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
          <div className="flex items-center gap-2 mb-1">
            {el.mockupProfileImage ? <img src={el.mockupProfileImage} alt="" className="w-6 h-6 rounded-full object-cover" /> : <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-violet-500" />}
            <span className="text-white text-[9px] font-semibold">@{el.mockupProfileName || 'brand'}</span>
            {el.mockupCtaText && <span className="text-[7px] text-white bg-red-500 px-1.5 py-0.5 rounded font-medium">Gesponsert</span>}
          </div>
          {el.mockupBodyText && <p className="text-white text-[8px] leading-relaxed mb-1">{el.mockupBodyText}</p>}
          {el.mockupHeadline && <p className="text-white text-[8px]">♫ {el.mockupHeadline}</p>}
          {el.mockupCtaText && <button className="mt-1.5 w-full text-[9px] font-bold text-white py-1.5 rounded-sm" style={{ background: '#fe2c55' }}>{el.mockupCtaText}</button>}
        </div>
      </div>
    );
  }

  // ad-mockup (generic fallback)
  return (
    <div className="h-full flex flex-col rounded-xl overflow-hidden" style={{ border: `2px solid ${borderColor}`, background: cardBg }}>
      {/* Sponsor header */}
      <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: `1px solid ${borderColor}` }}>
        {el.mockupProfileImage ? (
          <img src={el.mockupProfileImage} alt="" className="w-7 h-7 rounded-full object-cover" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold truncate" style={{ color: isDark ? '#fff' : '#1f2937' }}>{el.mockupProfileName || 'Brand Name'}</p>
          <p className={`text-[7px] ${subText}`}>Gesponsert · 🌍</p>
        </div>
        <div className={`text-[10px] ${subText}`}>•••</div>
      </div>
      {/* Ad text */}
      {el.mockupBodyText && (
        <div className="px-3 py-1.5">
          <p className="text-[9px] leading-relaxed" style={{ color: isDark ? '#e4e4e7' : '#374151' }}>{el.mockupBodyText}</p>
        </div>
      )}
      {/* Ad image */}
      <div className="flex-1 overflow-hidden">
        {el.mockupImageUrl ? <img src={el.mockupImageUrl} alt="" className="w-full h-full object-cover" /> : (
          <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-zinc-800' : 'bg-gray-100'}`}>
            <span className={`text-xs ${subText}`}>{el.mockupText || 'Ad Creative'}</span>
          </div>
        )}
      </div>
      {/* Headline + CTA */}
      <div className="px-3 py-2 flex items-center gap-2" style={{ borderTop: `1px solid ${borderColor}`, background: isDark ? 'rgba(39,39,42,0.6)' : 'rgba(243,244,246,0.8)' }}>
        <div className="flex-1 min-w-0">
          {el.mockupBrowserUrl && <p className={`text-[7px] uppercase tracking-wide ${subText} truncate`}>{el.mockupBrowserUrl}</p>}
          <p className="text-[10px] font-semibold truncate" style={{ color: isDark ? '#fff' : '#1f2937' }}>{el.mockupHeadline || 'Ad Headline'}</p>
          {el.mockupDescription && <p className={`text-[8px] truncate ${subText}`}>{el.mockupDescription}</p>}
        </div>
        <div className="shrink-0 bg-blue-600 text-white text-[8px] font-semibold px-2.5 py-1.5 rounded">{el.mockupCtaText || 'Mehr dazu'}</div>
      </div>
      {/* Engagement */}
      <div className="flex items-center justify-around py-1.5" style={{ borderTop: `1px solid ${borderColor}` }}>
        {['👍 Gefällt mir', '💬 Kommentar', '↗ Teilen'].map(action => (
          <span key={action} className={`text-[8px] font-medium ${subText}`}>{action}</span>
        ))}
      </div>
    </div>
  );
});

const TextBlock = memo(({ el, isDark, isInlineEditing, onSave }: { el: FunnelElement; isDark: boolean; isInlineEditing?: boolean; onSave?: (id: string, text: string) => void }) => {
  const kind = el.textKind || 'body';
  const defaults: Record<TextKind, { size: number; weight: 'normal' | 'bold'; color: string; darkColor: string }> = {
    headline:    { size: 24, weight: 'bold',   color: '#1f2937', darkColor: '#ffffff' },
    subheadline: { size: 18, weight: 'bold',   color: '#374151', darkColor: '#e4e4e7' },
    body:        { size: 14, weight: 'normal', color: '#6b7280', darkColor: '#a1a1aa' },
    note:        { size: 12, weight: 'normal', color: '#9ca3af', darkColor: '#71717a' },
  };
  const d = defaults[kind];
  const textStyle: React.CSSProperties = {
    fontSize: el.fontSize || d.size,
    fontWeight: el.fontWeight || d.weight,
    color: el.textColor || (isDark ? d.darkColor : d.color),
    textAlign: el.textAlign || 'left',
  };

  if (isInlineEditing) {
    return (
      <div className="h-full flex items-center px-2" style={textStyle}>
        <textarea
          autoFocus
          defaultValue={el.textContent || ''}
          className="w-full h-full bg-transparent outline-none resize-none"
          style={{ ...textStyle, border: 'none', padding: 0 }}
          onBlur={e => onSave?.(el.id, e.target.value)}
          onKeyDown={e => { if (e.key === 'Escape') { e.preventDefault(); onSave?.(el.id, el.textContent || ''); } if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSave?.(el.id, (e.target as HTMLTextAreaElement).value); } }}
          onClick={e => e.stopPropagation()}
          onMouseDown={e => e.stopPropagation()}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex items-center px-2 whitespace-pre-wrap break-words overflow-hidden" style={textStyle}>
      {el.textContent || (kind === 'headline' ? 'Überschrift' : kind === 'subheadline' ? 'Unterüberschrift' : kind === 'note' ? 'Notiz...' : 'Text hier eingeben...')}
    </div>
  );
});

const MediaBlock = memo(({ el, isDark }: { el: FunnelElement; isDark: boolean }) => {
  if (el.mediaUrl) {
    return <img src={el.mediaUrl} alt={el.mediaAlt || ''} className="w-full h-full object-cover rounded-lg" />;
  }
  return (
    <div className={`w-full h-full flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed ${isDark ? 'border-zinc-700 text-zinc-500' : 'border-gray-300 text-gray-400'}`}>
      <ImageIcon size={24} />
      <span className="text-xs">Bild / Medien URL</span>
    </div>
  );
});

// ─── Main Component ──────────────────────────────────────────────────────────

export default function FunnelCanvas() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // ─── Board Management ────────────────────────────────────────────────────
  const [boards, setBoards] = useState<FunnelBoard[]>(() => getAllFunnelBoards());
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  const [showBoardList, setShowBoardList] = useState(true);
  const [boardName, setBoardName] = useState('');
  const [boardDesc, setBoardDesc] = useState('');

  // ─── Canvas Data ─────────────────────────────────────────────────────────
  const [elements, setElements] = useState<FunnelElement[]>([]);
  const [connections, setConnections] = useState<FunnelConnection[]>([]);
  const [phases, setPhases] = useState<FunnelPhase[]>([]);

  // ─── Selection ───────────────────────────────────────────────────────────
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedConnId, setSelectedConnId] = useState<string | null>(null);
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
  const [multiSelectedIds, setMultiSelectedIds] = useState<Set<string>>(new Set());
  const [lassoState, setLassoState] = useState<{ startX: number; startY: number; currentX: number; currentY: number } | null>(null);
  const clipboardRef = useRef<FunnelElement[]>([]);

  // ─── Drag ────────────────────────────────────────────────────────────────
  const [dragState, setDragState] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [dragPhaseState, setDragPhaseState] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [resizeState, setResizeState] = useState<{ id: string; kind: 'element' | 'phase'; startX: number; startY: number; startW: number; startH: number } | null>(null);

  // ─── Connect ─────────────────────────────────────────────────────────────
  const [connectState, setConnectState] = useState<{ fromId: string; fromPort: PortDirection; canvasX: number; canvasY: number } | null>(null);

  // ─── Zoom / Pan ──────────────────────────────────────────────────────────
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 40, y: 40 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panStartMouse, setPanStartMouse] = useState({ x: 0, y: 0 });
  const [panThresholdMet, setPanThresholdMet] = useState(false);
  const [spaceHeld, setSpaceHeld] = useState(false);

  // ─── UI State ────────────────────────────────────────────────────────────
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteTab, setPaletteTab] = useState<'platforms' | 'mockups' | 'text' | 'media' | 'phases' | 'templates'>('platforms');
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [snapLines, setSnapLines] = useState<{ x: number[]; y: number[] }>({ x: [], y: [] });
  const [equalSpacingGuides, setEqualSpacingGuides] = useState<EqGuide[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);
  const [hoveredConnId, setHoveredConnId] = useState<string | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [contextMenu, setContextMenu] = useState<{ screenX: number; screenY: number; canvasX: number; canvasY: number; fromId: string; fromPort: PortDirection } | null>(null);
  const [showMetrics, setShowMetrics] = useState(false);
  const [showGlobalStyles, setShowGlobalStyles] = useState(false);
  const [rightClickMenu, setRightClickMenu] = useState<{ x: number; y: number; canvasX: number; canvasY: number; targetType: 'canvas' | 'element' | 'connection'; targetId?: string } | null>(null);
  const [showGrid, setShowGrid] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [showMinimap, setShowMinimap] = useState(false);
  const [reconnectState, setReconnectState] = useState<{ connId: string; endpoint: 'from' | 'to'; canvasX: number; canvasY: number } | null>(null);

  // ─── Global Style Settings ──────────────────────────────────────────────
  type ConnLineStyle = 'solid' | 'dashed' | 'dotted';
  type ConnThickness = 'thin' | 'normal' | 'thick';
  type ConnCurve = 'bezier' | 'straight' | 'step';
  type ConnColor = 'purple' | 'gray' | 'blue' | 'emerald' | 'pink' | 'orange';
  type ConnAnimation = 'dot' | 'none' | 'pulse';
  type ConnArrowhead = 'filled' | 'open' | 'none';
  type NodeStyle = 'default' | 'rounded' | 'sharp' | 'pill' | 'card';
  type NodeShadow = 'none' | 'sm' | 'md' | 'lg';

  const [globalConnLineStyle, setGlobalConnLineStyle] = useState<ConnLineStyle>('solid');
  const [globalConnThickness, setGlobalConnThickness] = useState<ConnThickness>('normal');
  const [globalConnCurve, setGlobalConnCurve] = useState<ConnCurve>('bezier');
  const [globalConnColor, setGlobalConnColor] = useState<ConnColor>('purple');
  const [globalConnAnimation, setGlobalConnAnimation] = useState<ConnAnimation>('dot');
  const [globalConnArrowhead, setGlobalConnArrowhead] = useState<ConnArrowhead>('filled');
  const [globalNodeStyle, setGlobalNodeStyle] = useState<NodeStyle>('default');
  const [globalNodeShadow, setGlobalNodeShadow] = useState<NodeShadow>('sm');

  const CONN_COLORS: Record<ConnColor, string> = { purple: '#a855f7', gray: '#6b7280', blue: '#3b82f6', emerald: '#10b981', pink: '#ec4899', orange: '#f97316' };
  const CONN_THICKNESS_PX: Record<ConnThickness, number> = { thin: 1.5, normal: 2, thick: 3 };
  const NODE_STYLE_CLASSES: Record<NodeStyle, string> = {
    default: 'rounded-xl border',
    rounded: 'rounded-[20px] border-2',
    sharp: 'rounded-none border',
    pill: 'rounded-full border-2',
    card: 'rounded-xl border-2 border-b-4',
  };
  const NODE_SHADOW_CLASS: Record<NodeShadow, string> = { none: '', sm: 'shadow-sm', md: 'shadow-md', lg: 'shadow-lg shadow-black/10' };

  // ─── Edit State ──────────────────────────────────────────────────────────
  const [editElementId, setEditElementId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editTextContent, setEditTextContent] = useState('');
  const [editMediaUrl, setEditMediaUrl] = useState('');
  const [editProfileImage, setEditProfileImage] = useState('');
  const [editProfileName, setEditProfileName] = useState('');
  const [editBodyText, setEditBodyText] = useState('');
  const [editHeadline, setEditHeadline] = useState('');
  const [editMockupDesc, setEditMockupDesc] = useState('');
  const [editCtaText, setEditCtaText] = useState('');
  const [editBrowserUrl, setEditBrowserUrl] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editConnId, setEditConnId] = useState<string | null>(null);
  const [editConnLabel, setEditConnLabel] = useState('');
  const [editConnStyle, setEditConnStyle] = useState<FunnelLineStyle>('solid');
  const [editPhaseId, setEditPhaseId] = useState<string | null>(null);
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [inlineConnLabelId, setInlineConnLabelId] = useState<string | null>(null);
  const [inlineConnLabelText, setInlineConnLabelText] = useState('');
  const [editPhaseLabel, setEditPhaseLabel] = useState('');

  // ─── Undo / Redo ─────────────────────────────────────────────────────────
  const undoStackRef = useRef<FunnelSnapshot[]>([]);
  const redoStackRef = useRef<FunnelSnapshot[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const pushHistory = useCallback(() => {
    undoStackRef.current = [...undoStackRef.current.slice(-40), { elements, connections, phases }];
    redoStackRef.current = [];
    setCanUndo(true);
    setCanRedo(false);
  }, [elements, connections, phases]);

  const historyUndo = useCallback(() => {
    if (undoStackRef.current.length === 0) return;
    const prev = undoStackRef.current[undoStackRef.current.length - 1];
    undoStackRef.current = undoStackRef.current.slice(0, -1);
    redoStackRef.current = [{ elements, connections, phases }, ...redoStackRef.current];
    setElements(prev.elements); setConnections(prev.connections); setPhases(prev.phases);
    setCanUndo(undoStackRef.current.length > 0); setCanRedo(true);
  }, [elements, connections, phases]);

  const historyRedo = useCallback(() => {
    if (redoStackRef.current.length === 0) return;
    const next = redoStackRef.current[0];
    redoStackRef.current = redoStackRef.current.slice(1);
    undoStackRef.current = [...undoStackRef.current, { elements, connections, phases }];
    setElements(next.elements); setConnections(next.connections); setPhases(next.phases);
    setCanUndo(true); setCanRedo(redoStackRef.current.length > 0);
  }, [elements, connections, phases]);

  const jumpToHistory = useCallback((index: number) => {
    const stack = undoStackRef.current;
    if (index < 0 || index >= stack.length) return;
    const targetState = stack[index];
    const currentState: FunnelSnapshot = { elements, connections, phases };
    // States after target (plus current) become redo stack
    const statesAfterTarget = stack.slice(index + 1);
    redoStackRef.current = [...statesAfterTarget, currentState, ...redoStackRef.current];
    undoStackRef.current = stack.slice(0, index);
    setElements(targetState.elements); setConnections(targetState.connections); setPhases(targetState.phases);
    setCanUndo(undoStackRef.current.length > 0); setCanRedo(redoStackRef.current.length > 0);
  }, [elements, connections, phases]);

  // ─── Zoom refs ───────────────────────────────────────────────────────────
  const zoomRef = useRef(zoom);
  const panRef = useRef(pan);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);
  useEffect(() => { panRef.current = pan; }, [pan]);

  // ─── Helpers ─────────────────────────────────────────────────────────────
  const screenToCanvas = useCallback((cx: number, cy: number) => {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: (cx - rect.left - pan.x) / zoom, y: (cy - rect.top - pan.y) / zoom };
  }, [zoom, pan]);

  const canvasW = useMemo(() => Math.max(2000, ...elements.map(e => e.x + e.width + 200), ...phases.map(p => p.x + p.width + 200)), [elements, phases]);
  const canvasH = useMemo(() => Math.max(1200, ...elements.map(e => e.y + e.height + 200), ...phases.map(p => p.y + p.height + 200)), [elements, phases]);
  const zoomPct = Math.round(zoom * 100);

  const fitToScreen = useCallback(() => {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;
    if (elements.length === 0 && phases.length === 0) { setZoom(1); setPan({ x: 40, y: 40 }); return; }
    const items = [...elements.map(e => ({ l: e.x, t: e.y, r: e.x + e.width, b: e.y + e.height })), ...phases.map(p => ({ l: p.x, t: p.y, r: p.x + p.width, b: p.y + p.height }))];
    const minX = Math.min(...items.map(i => i.l)) - 40;
    const minY = Math.min(...items.map(i => i.t)) - 40;
    const maxX = Math.max(...items.map(i => i.r)) + 40;
    const maxY = Math.max(...items.map(i => i.b)) + 40;
    const w = maxX - minX, h = maxY - minY;
    const z = Math.min(Math.min(rect.width / w, rect.height / h), 2);
    setZoom(z);
    setPan({ x: (rect.width - w * z) / 2 - minX * z, y: (rect.height - h * z) / 2 - minY * z });
  }, [elements, phases]);

  // ─── Board CRUD ──────────────────────────────────────────────────────────
  const loadBoard = useCallback((board: FunnelBoard) => {
    setElements(board.elements);
    setConnections(board.connections);
    setPhases(board.phases);
    setActiveBoardId(board.id);
    setBoardName(board.name);
    setBoardDesc(board.description);
    setShowBoardList(false);
    setPaletteOpen(true);
    undoStackRef.current = [];
    redoStackRef.current = [];
    setCanUndo(false);
    setCanRedo(false);
    requestAnimationFrame(() => requestAnimationFrame(() => fitToScreen()));
  }, [fitToScreen]);

  const createNewBoard = useCallback(() => {
    const now = new Date().toISOString();
    const board: FunnelBoard = {
      id: `funnel-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: 'Neues Board', description: '', elements: [], connections: [], phases: [],
      createdAt: now, updatedAt: now,
    };
    const updated = [...boards, board];
    setBoards(updated);
    saveFunnelBoards(updated);
    loadBoard(board);
  }, [boards, loadBoard]);

  const saveCurrentBoard = useCallback(() => {
    if (!activeBoardId) return;
    setSaveState('saving');
    const board: FunnelBoard = {
      id: activeBoardId, name: boardName || 'Unbenannt', description: boardDesc,
      elements, connections, phases,
      createdAt: boards.find(b => b.id === activeBoardId)?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = boards.map(b => b.id === activeBoardId ? board : b);
    if (!updated.find(b => b.id === activeBoardId)) updated.push(board);
    setBoards(updated);
    saveFunnelBoards(updated);
    setTimeout(() => { setSaveState('saved'); setTimeout(() => setSaveState('idle'), 1500); }, 300);
  }, [activeBoardId, boardName, boardDesc, elements, connections, phases, boards]);

  const handleDeleteBoard = useCallback((id: string) => {
    const updated = boards.filter(b => b.id !== id);
    setBoards(updated);
    if (id !== 'demo-funnel-1') deleteFunnelBoard(id);
    if (activeBoardId === id) { setActiveBoardId(null); setShowBoardList(true); setElements([]); setConnections([]); setPhases([]); }
  }, [boards, activeBoardId]);

  const handleDuplicateBoard = useCallback((id: string) => {
    const copy = duplicateFunnelBoard(id);
    if (copy) setBoards(prev => [...prev, copy]);
  }, []);

  // ─── Wheel Zoom ──────────────────────────────────────────────────────────
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const rect = el.getBoundingClientRect();
      const mX = e.clientX - rect.left, mY = e.clientY - rect.top;
      const delta = -e.deltaY * 0.003;
      const cur = zoomRef.current, curPan = panRef.current;
      const nz = Math.min(Math.max(cur * (1 + delta), 0.1), 5);
      const ratio = nz / cur;
      setZoom(nz);
      setPan({ x: mX - (mX - curPan.x) * ratio, y: mY - (mY - curPan.y) * ratio });
    };
    // Use capture phase to intercept wheel before page scroll
    el.addEventListener('wheel', handler, { passive: false, capture: true });
    return () => el.removeEventListener('wheel', handler, { capture: true });
  }, [showBoardList]);

  // ─── Keyboard ────────────────────────────────────────────────────────────
  useEffect(() => {
    const isEditing = editElementId || editPhaseId || editConnId || inlineEditId;
    const down = (e: KeyboardEvent) => {
      if (e.key === ' ' && !e.repeat) { e.preventDefault(); setSpaceHeld(true); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey && !isEditing) { e.preventDefault(); historyUndo(); }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey)) && !isEditing) { e.preventDefault(); historyRedo(); }
      if (e.key === 'Escape') { setSelectedElementId(null); setSelectedConnId(null); setSelectedPhaseId(null); setMultiSelectedIds(new Set()); setConnectState(null); setEditElementId(null); setEditConnId(null); setEditPhaseId(null); setContextMenu(null); setInlineEditId(null); setRightClickMenu(null); setLassoState(null); }

      // Delete / Backspace – remove all selected
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isEditing) {
        const ids = new Set(multiSelectedIds);
        if (selectedElementId) ids.add(selectedElementId);
        if (ids.size > 0) {
          pushHistory();
          setElements(prev => prev.filter(el => !ids.has(el.id)));
          setConnections(prev => prev.filter(c => !ids.has(c.from) && !ids.has(c.to)));
          setSelectedElementId(null); setMultiSelectedIds(new Set());
        }
        if (selectedConnId) { pushHistory(); setConnections(prev => prev.filter(c => c.id !== selectedConnId)); setSelectedConnId(null); }
        if (selectedPhaseId) { pushHistory(); setPhases(prev => prev.filter(p => p.id !== selectedPhaseId)); setSelectedPhaseId(null); }
      }

      // Ctrl+A – select all elements
      if ((e.metaKey || e.ctrlKey) && e.key === 'a' && !isEditing) {
        e.preventDefault();
        setMultiSelectedIds(new Set(elements.map(el => el.id)));
        setSelectedElementId(elements.length > 0 ? elements[0].id : null);
      }

      // Ctrl+C – copy selected elements
      if ((e.metaKey || e.ctrlKey) && e.key === 'c' && !isEditing) {
        const ids = new Set(multiSelectedIds);
        if (selectedElementId) ids.add(selectedElementId);
        if (ids.size > 0) {
          clipboardRef.current = elements.filter(el => ids.has(el.id));
        }
      }

      // Ctrl+V – paste from clipboard
      if ((e.metaKey || e.ctrlKey) && e.key === 'v' && !isEditing) {
        if (clipboardRef.current.length > 0) {
          e.preventDefault();
          pushHistory();
          const newIds = new Map<string, string>();
          const pasted: FunnelElement[] = clipboardRef.current.map(el => {
            const newId = `el-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
            newIds.set(el.id, newId);
            return { ...el, id: newId, x: el.x + 40, y: el.y + 40 };
          });
          // Also duplicate connections between pasted elements
          const pastedConns: FunnelConnection[] = connections
            .filter(c => newIds.has(c.from) && newIds.has(c.to))
            .map(c => ({ ...c, id: `conn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, from: newIds.get(c.from)!, to: newIds.get(c.to)! }));
          setElements(prev => [...prev, ...pasted]);
          if (pastedConns.length > 0) setConnections(prev => [...prev, ...pastedConns]);
          setMultiSelectedIds(new Set(pasted.map(el => el.id)));
          setSelectedElementId(pasted[0].id);
          // Update clipboard offset for next paste
          clipboardRef.current = pasted;
        }
      }

      // Ctrl+D – duplicate selected
      if ((e.metaKey || e.ctrlKey) && e.key === 'd' && !isEditing) {
        e.preventDefault();
        const ids = new Set(multiSelectedIds);
        if (selectedElementId) ids.add(selectedElementId);
        if (ids.size > 0) {
          pushHistory();
          const newIds = new Map<string, string>();
          const duped: FunnelElement[] = elements.filter(el => ids.has(el.id)).map(el => {
            const newId = `el-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
            newIds.set(el.id, newId);
            return { ...el, id: newId, x: el.x + 30, y: el.y + 30 };
          });
          const dupedConns: FunnelConnection[] = connections
            .filter(c => newIds.has(c.from) && newIds.has(c.to))
            .map(c => ({ ...c, id: `conn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, from: newIds.get(c.from)!, to: newIds.get(c.to)! }));
          setElements(prev => [...prev, ...duped]);
          if (dupedConns.length > 0) setConnections(prev => [...prev, ...dupedConns]);
          setMultiSelectedIds(new Set(duped.map(el => el.id)));
          setSelectedElementId(duped[0].id);
        }
      }

      // Arrow keys – move selected elements
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && !isEditing) {
        const ids = new Set(multiSelectedIds);
        if (selectedElementId) ids.add(selectedElementId);
        if (ids.size > 0) {
          e.preventDefault();
          const step = e.shiftKey ? 10 : 1;
          const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
          const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
          setElements(prev => prev.map(el => ids.has(el.id) ? { ...el, x: Math.max(0, el.x + dx), y: Math.max(0, el.y + dy) } : el));
        }
      }

      // Tab – cycle through elements
      if (e.key === 'Tab' && !isEditing) {
        e.preventDefault();
        if (elements.length === 0) return;
        const curIdx = selectedElementId ? elements.findIndex(el => el.id === selectedElementId) : -1;
        const nextIdx = (curIdx + (e.shiftKey ? -1 : 1) + elements.length) % elements.length;
        setSelectedElementId(elements[nextIdx].id);
        setMultiSelectedIds(new Set());
        setSelectedConnId(null); setSelectedPhaseId(null);
      }

      // Ctrl+F – search
      if ((e.metaKey || e.ctrlKey) && e.key === 'f' && !isEditing) {
        e.preventDefault();
        setSearchOpen(v => !v); setSearchQuery('');
      }
      if (e.key === '?') setShowShortcuts(v => !v);
    };
    const up = (e: KeyboardEvent) => { if (e.key === ' ') setSpaceHeld(false); };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [historyUndo, historyRedo, selectedElementId, selectedConnId, selectedPhaseId, multiSelectedIds, editElementId, editPhaseId, editConnId, inlineEditId, pushHistory, elements, connections]);

  // ─── Mouse Handlers ─────────────────────────────────────────────────────
  const handleViewportMouseDown = useCallback((e: React.MouseEvent) => {
    if (contextMenu) { setContextMenu(null); return; }
    if (rightClickMenu) { setRightClickMenu(null); return; }
    if (e.button === 1 || (e.button === 0 && spaceHeld)) {
      e.preventDefault();
      setIsPanning(true); setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      setPanStartMouse({ x: e.clientX, y: e.clientY }); setPanThresholdMet(true);
      return;
    }
    if (e.button === 0) {
      const target = e.target as HTMLElement;
      const isEmptyArea = target === viewportRef.current || target.classList.contains('canvas-inner');
      if (isEmptyArea && connectState) {
        // Show context menu instead of canceling
        const pos = screenToCanvas(e.clientX, e.clientY);
        setContextMenu({ screenX: e.clientX, screenY: e.clientY, canvasX: pos.x, canvasY: pos.y, fromId: connectState.fromId, fromPort: connectState.fromPort });
        setConnectState(null);
        return;
      }
      if (isEmptyArea) {
        if (e.shiftKey) {
          // Start lasso selection
          const pos = screenToCanvas(e.clientX, e.clientY);
          setLassoState({ startX: pos.x, startY: pos.y, currentX: pos.x, currentY: pos.y });
        } else {
          setIsPanning(true); setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
          setPanStartMouse({ x: e.clientX, y: e.clientY }); setPanThresholdMet(false);
          setSelectedElementId(null); setSelectedConnId(null); setSelectedPhaseId(null); setMultiSelectedIds(new Set());
        }
      }
    }
  }, [spaceHeld, pan, connectState, contextMenu, rightClickMenu, screenToCanvas]);

  const handleViewportMouseMove = useCallback((e: React.MouseEvent) => {
    // Pan
    if (isPanning) {
      if (!panThresholdMet) {
        const dx = Math.abs(e.clientX - panStartMouse.x), dy = Math.abs(e.clientY - panStartMouse.y);
        if (dx < PAN_DRAG_THRESHOLD && dy < PAN_DRAG_THRESHOLD) return;
        setPanThresholdMet(true);
      }
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      return;
    }

    // Connect line follow
    if (connectState) {
      const pos = screenToCanvas(e.clientX, e.clientY);
      setConnectState(prev => prev ? { ...prev, canvasX: pos.x, canvasY: pos.y } : null);
      return;
    }

    // Reconnect endpoint follow
    if (reconnectState) {
      const pos = screenToCanvas(e.clientX, e.clientY);
      setReconnectState(prev => prev ? { ...prev, canvasX: pos.x, canvasY: pos.y } : null);
      return;
    }

    // Resize
    if (resizeState) {
      const pos = screenToCanvas(e.clientX, e.clientY);
      const dw = pos.x - resizeState.startX;
      const dh = pos.y - resizeState.startY;
      if (resizeState.kind === 'element') {
        setElements(prev => prev.map(el => el.id === resizeState.id ? { ...el, width: Math.max(100, resizeState.startW + dw), height: Math.max(40, resizeState.startH + dh) } : el));
      } else {
        setPhases(prev => prev.map(p => p.id === resizeState.id ? { ...p, width: Math.max(120, resizeState.startW + dw), height: Math.max(60, resizeState.startH + dh) } : p));
      }
      return;
    }

    // Element drag
    if (dragState) {
      const pos = screenToCanvas(e.clientX, e.clientY);
      let sx = pos.x - dragState.offsetX;
      let sy = pos.y - dragState.offsetY;

      const el = elements.find(e => e.id === dragState.id);
      if (!el) return;

      if (snapEnabled) {
        const items: CanvasItem[] = [
          ...elements.map(e => ({ id: e.id, x: e.x, y: e.y, w: e.width, h: e.height })),
          ...phases.map(p => ({ id: p.id, x: p.x, y: p.y, w: p.width, h: p.height })),
        ];
        const others = items.filter(it => it.id !== dragState.id);
        const newSnapX: number[] = [], newSnapY: number[] = [];

        for (const o of others) {
          if (Math.abs(sx - o.x) < SNAP_THRESHOLD) { sx = o.x; newSnapX.push(o.x); }
          if (Math.abs(sx + el.width - (o.x + o.w)) < SNAP_THRESHOLD) { sx = o.x + o.w - el.width; newSnapX.push(o.x + o.w); }
          if (Math.abs(sx + el.width / 2 - (o.x + o.w / 2)) < SNAP_THRESHOLD) { sx = o.x + o.w / 2 - el.width / 2; newSnapX.push(o.x + o.w / 2); }
          if (Math.abs(sy - o.y) < SNAP_THRESHOLD) { sy = o.y; newSnapY.push(o.y); }
          if (Math.abs(sy + el.height - (o.y + o.h)) < SNAP_THRESHOLD) { sy = o.y + o.h - el.height; newSnapY.push(o.y + o.h); }
          if (Math.abs(sy + el.height / 2 - (o.y + o.h / 2)) < SNAP_THRESHOLD) { sy = o.y + o.h / 2 - el.height / 2; newSnapY.push(o.y + o.h / 2); }
        }

        const eqResult = detectEqualSpacing(items, dragState.id, sx, sy, el.width, el.height, SNAP_THRESHOLD);
        if (eqResult.snapX !== null) sx = eqResult.snapX;
        if (eqResult.snapY !== null) sy = eqResult.snapY;
        setSnapLines({ x: newSnapX, y: newSnapY });
        setEqualSpacingGuides(eqResult.guides);
      }

      // Multi-drag: move all selected elements together
      const dragEl = elements.find(e => e.id === dragState.id);
      if (dragEl && multiSelectedIds.size > 0 && multiSelectedIds.has(dragState.id)) {
        const dx = Math.max(0, sx) - dragEl.x;
        const dy = Math.max(0, sy) - dragEl.y;
        setElements(prev => prev.map(e => multiSelectedIds.has(e.id) ? { ...e, x: Math.max(0, e.x + dx), y: Math.max(0, e.y + dy) } : e));
      } else {
        setElements(prev => prev.map(e => e.id === dragState.id ? { ...e, x: Math.max(0, sx), y: Math.max(0, sy) } : e));
      }
      return;
    }

    // Phase drag
    if (dragPhaseState) {
      const pos = screenToCanvas(e.clientX, e.clientY);
      setPhases(prev => prev.map(p => p.id === dragPhaseState.id ? { ...p, x: Math.max(0, pos.x - dragPhaseState.offsetX), y: Math.max(0, pos.y - dragPhaseState.offsetY) } : p));
      return;
    }

    // Lasso selection drag
    if (lassoState) {
      const pos = screenToCanvas(e.clientX, e.clientY);
      setLassoState(prev => prev ? { ...prev, currentX: pos.x, currentY: pos.y } : null);
      // Compute which elements are inside the lasso rect
      const lx = Math.min(lassoState.startX, pos.x), ly = Math.min(lassoState.startY, pos.y);
      const lw = Math.abs(pos.x - lassoState.startX), lh = Math.abs(pos.y - lassoState.startY);
      const inside = new Set<string>();
      for (const el of elements) {
        const ex = el.x + el.width / 2, ey = el.y + el.height / 2;
        if (ex >= lx && ex <= lx + lw && ey >= ly && ey <= ly + lh) inside.add(el.id);
      }
      setMultiSelectedIds(inside);
      return;
    }
  }, [isPanning, panThresholdMet, panStart, panStartMouse, connectState, reconnectState, resizeState, dragState, dragPhaseState, lassoState, screenToCanvas, elements, phases, snapEnabled, multiSelectedIds]);

  const handleViewportMouseUp = useCallback(() => {
    if (reconnectState) { setReconnectState(null); }
    if (dragState) { pushHistory(); }
    if (dragPhaseState) { pushHistory(); }
    if (resizeState) { pushHistory(); }
    if (lassoState) {
      // Set primary selection to first multi-selected if any
      if (multiSelectedIds.size > 0) {
        const firstId = [...multiSelectedIds][0];
        setSelectedElementId(firstId);
      }
      setLassoState(null);
    }
    setIsPanning(false); setDragState(null); setDragPhaseState(null); setResizeState(null);
    setSnapLines({ x: [], y: [] }); setEqualSpacingGuides([]);
  }, [dragState, dragPhaseState, resizeState, lassoState, multiSelectedIds, reconnectState, pushHistory]);

  // ─── Element Interaction ─────────────────────────────────────────────────
  const handleElementMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    if (spaceHeld) return;
    e.stopPropagation();
    const el = elements.find(el => el.id === id);
    if (!el) return;
    const pos = screenToCanvas(e.clientX, e.clientY);
    setDragState({ id, offsetX: pos.x - el.x, offsetY: pos.y - el.y });
    if (e.shiftKey) {
      // Shift+Click: toggle element in multi-selection
      setMultiSelectedIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id); else next.add(id);
        if (selectedElementId && !next.has(selectedElementId)) next.add(selectedElementId);
        return next;
      });
      setSelectedElementId(id);
    } else if (!multiSelectedIds.has(id)) {
      // Normal click on un-selected element: clear multi-selection
      setMultiSelectedIds(new Set());
      setSelectedElementId(id);
    } else {
      // Normal click on already multi-selected: keep multi-selection, set as primary
      setSelectedElementId(id);
    }
    setSelectedConnId(null); setSelectedPhaseId(null);
  }, [elements, spaceHeld, screenToCanvas, selectedElementId, multiSelectedIds]);

  const handlePhaseMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    if (spaceHeld) return;
    e.stopPropagation();
    const phase = phases.find(p => p.id === id);
    if (!phase) return;
    const pos = screenToCanvas(e.clientX, e.clientY);
    setDragPhaseState({ id, offsetX: pos.x - phase.x, offsetY: pos.y - phase.y });
    setSelectedPhaseId(id); setSelectedElementId(null); setSelectedConnId(null);
  }, [phases, spaceHeld, screenToCanvas]);

  const handleResizeStart = useCallback((e: React.MouseEvent, id: string, kind: 'element' | 'phase') => {
    e.stopPropagation();
    const pos = screenToCanvas(e.clientX, e.clientY);
    const item = kind === 'element' ? elements.find(el => el.id === id) : phases.find(p => p.id === id);
    if (!item) return;
    const w = 'width' in item ? item.width : 200;
    const h = 'height' in item ? item.height : 80;
    setResizeState({ id, kind, startX: pos.x, startY: pos.y, startW: w, startH: h });
  }, [elements, phases, screenToCanvas]);

  // ─── Port / Connection ───────────────────────────────────────────────────
  const handlePortClick = useCallback((e: React.MouseEvent, elementId: string, port: PortDirection) => {
    e.stopPropagation();
    // Handle reconnect: update existing connection endpoint
    if (reconnectState) {
      pushHistory();
      setConnections(prev => prev.map(c => {
        if (c.id !== reconnectState.connId) return c;
        if (reconnectState.endpoint === 'from') return { ...c, from: elementId, fromPort: port };
        return { ...c, to: elementId, toPort: port };
      }));
      setReconnectState(null);
      return;
    }
    if (!connectState) {
      const el = elements.find(n => n.id === elementId);
      if (!el) return;
      const p = getElPortPos(el, port);
      setConnectState({ fromId: elementId, fromPort: port, canvasX: p.x, canvasY: p.y });
    } else {
      if (connectState.fromId === elementId) { setConnectState(null); return; }
      const exists = connections.some(c => c.from === connectState.fromId && c.to === elementId);
      if (!exists) {
        pushHistory();
        const newConn: FunnelConnection = {
          id: `conn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          from: connectState.fromId, to: elementId,
          fromPort: connectState.fromPort, toPort: port,
        } as FunnelConnection;
        setConnections(prev => [...prev, newConn]);
      }
      setConnectState(null);
    }
  }, [connectState, reconnectState, elements, connections, pushHistory]);

  // ─── Drag & Drop from Palette ────────────────────────────────────────────
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
    try {
      const data = e.dataTransfer.getData('application/json');
      if (!data) return;
      const item: FunnelPaletteItem = JSON.parse(data);
      const pos = screenToCanvas(e.clientX, e.clientY);
      pushHistory();

      let w: number, h: number;
      if (item.type === 'mockup' && item.mockupKind) {
        const ms = MOCKUP_SIZES[item.mockupKind];
        w = ms.width; h = ms.height;
      } else {
        const d = ELEMENT_DEFAULTS[item.type];
        w = d.width; h = d.height;
      }

      const newEl: FunnelElement = {
        id: `el-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: item.type, x: pos.x - w / 2, y: pos.y - h / 2, width: w, height: h,
        ...(item.platformKind && { platformKind: item.platformKind, icon: PLATFORMS.find(p => p.kind === item.platformKind)?.icon, label: item.label }),
        ...(item.mockupKind && { mockupKind: item.mockupKind }),
        ...(item.textKind && { textKind: item.textKind }),
        ...(item.mediaType === 'image' && {}),
        ...(item.mediaType === 'video' && {}),
      };
      setElements(prev => [...prev, newEl]);
      setSelectedElementId(newEl.id);
    } catch { /* ignore */ }
  }, [screenToCanvas, pushHistory]);

  const addElementFromPalette = useCallback((item: FunnelPaletteItem) => {
    pushHistory();
    let w: number, h: number;
    if (item.type === 'mockup' && item.mockupKind) {
      const ms = MOCKUP_SIZES[item.mockupKind]; w = ms.width; h = ms.height;
    } else {
      const d = ELEMENT_DEFAULTS[item.type]; w = d.width; h = d.height;
    }
    const rect = viewportRef.current?.getBoundingClientRect();
    const cx = rect ? (rect.width / 2 - pan.x) / zoom : 400;
    const cy = rect ? (rect.height / 2 - pan.y) / zoom : 300;

    const newEl: FunnelElement = {
      id: `el-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: item.type,
      x: cx - w / 2 + (Math.random() - 0.5) * 80,
      y: cy - h / 2 + (Math.random() - 0.5) * 80,
      width: w, height: h,
      ...(item.platformKind && { platformKind: item.platformKind, icon: PLATFORMS.find(p => p.kind === item.platformKind)?.icon, label: item.label }),
      ...(item.mockupKind && { mockupKind: item.mockupKind }),
      ...(item.textKind && { textKind: item.textKind }),
    };
    setElements(prev => [...prev, newEl]);
    setSelectedElementId(newEl.id);
  }, [pushHistory, pan, zoom]);

  // ─── Context Menu: Create + Auto-Connect ──────────────────────────────────
  const oppositePort: Record<PortDirection, PortDirection> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };

  const handleContextMenuSelect = useCallback((item: FunnelPaletteItem) => {
    if (!contextMenu) return;
    pushHistory();
    let w: number, h: number;
    if (item.type === 'mockup' && item.mockupKind) {
      const ms = MOCKUP_SIZES[item.mockupKind]; w = ms.width; h = ms.height;
    } else {
      const d = ELEMENT_DEFAULTS[item.type]; w = d.width; h = d.height;
    }
    const newEl: FunnelElement = {
      id: `el-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: item.type, x: contextMenu.canvasX - w / 2, y: contextMenu.canvasY - h / 2, width: w, height: h,
      ...(item.platformKind && { platformKind: item.platformKind, icon: PLATFORMS.find(p => p.kind === item.platformKind)?.icon, label: item.label }),
      ...(item.mockupKind && { mockupKind: item.mockupKind }),
      ...(item.textKind && { textKind: item.textKind }),
    };
    const toPort = oppositePort[contextMenu.fromPort];
    const newConn: FunnelConnection = {
      id: `conn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      from: contextMenu.fromId, to: newEl.id,
      fromPort: contextMenu.fromPort, toPort,
    } as FunnelConnection;
    setElements(prev => [...prev, newEl]);
    setConnections(prev => [...prev, newConn]);
    setSelectedElementId(newEl.id);
    setContextMenu(null);
  }, [contextMenu, pushHistory]);

  // ─── Double-click Edit ───────────────────────────────────────────────────
  const handleElementDoubleClick = useCallback((id: string) => {
    const el = elements.find(e => e.id === id);
    if (!el) return;
    // Text elements: inline edit directly on canvas
    if (el.type === 'text') { setInlineEditId(id); return; }
    setEditElementId(id);
    if (el.type === 'platform') { setEditLabel(el.label || ''); setEditDesc(el.description || ''); }
    if (el.type === 'media') { setEditMediaUrl(el.mediaUrl || ''); }
    if (el.type === 'mockup') {
      setEditMediaUrl(el.mockupImageUrl || ''); setEditTextContent(el.mockupText || '');
      setEditProfileImage(el.mockupProfileImage || ''); setEditProfileName(el.mockupProfileName || '');
      setEditBodyText(el.mockupBodyText || ''); setEditHeadline(el.mockupHeadline || '');
      setEditMockupDesc(el.mockupDescription || ''); setEditCtaText(el.mockupCtaText || '');
      setEditBrowserUrl(el.mockupBrowserUrl || '');
    }
    setEditNotes(el.notes || '');
  }, [elements]);

  const saveInlineEdit = useCallback((id: string, newText: string) => {
    pushHistory();
    setElements(prev => prev.map(el => el.id === id ? { ...el, textContent: newText } : el));
    setInlineEditId(null);
  }, [pushHistory]);

  const saveElementEdit = useCallback(() => {
    if (!editElementId) return;
    pushHistory();
    setElements(prev => prev.map(el => {
      if (el.id !== editElementId) return el;
      const withNotes = { notes: editNotes || undefined };
      if (el.type === 'platform') return { ...el, label: editLabel, description: editDesc, ...withNotes };
      if (el.type === 'text') return { ...el, textContent: editTextContent, ...withNotes };
      if (el.type === 'media') return { ...el, mediaUrl: editMediaUrl, ...withNotes };
      if (el.type === 'mockup') return { ...el, mockupImageUrl: editMediaUrl, mockupText: editTextContent, mockupProfileImage: editProfileImage, mockupProfileName: editProfileName, mockupBodyText: editBodyText, mockupHeadline: editHeadline, mockupDescription: editMockupDesc, mockupCtaText: editCtaText, mockupBrowserUrl: editBrowserUrl, ...withNotes };
      return el;
    }));
    setEditElementId(null);
  }, [editElementId, editLabel, editDesc, editTextContent, editMediaUrl, editNotes, editProfileImage, editProfileName, editBodyText, editHeadline, editMockupDesc, editCtaText, editBrowserUrl, pushHistory]);

  const handleConnDoubleClick = useCallback((id: string) => {
    const conn = connections.find(c => c.id === id);
    if (!conn) return;
    setEditConnId(id); setEditConnLabel(conn.label || ''); setEditConnStyle(conn.lineStyle ?? globalConnLineStyle);
  }, [connections]);

  const saveConnEdit = useCallback(() => {
    if (!editConnId) return;
    pushHistory();
    setConnections(prev => prev.map(c => c.id === editConnId ? { ...c, label: editConnLabel, lineStyle: editConnStyle } : c));
    setEditConnId(null);
  }, [editConnId, editConnLabel, editConnStyle, pushHistory]);

  const handlePhaseDoubleClick = useCallback((id: string) => {
    const phase = phases.find(p => p.id === id);
    if (!phase) return;
    setEditPhaseId(id); setEditPhaseLabel(phase.label);
  }, [phases]);

  const savePhaseEdit = useCallback(() => {
    if (!editPhaseId) return;
    pushHistory();
    setPhases(prev => prev.map(p => p.id === editPhaseId ? { ...p, label: editPhaseLabel } : p));
    setEditPhaseId(null);
  }, [editPhaseId, editPhaseLabel, pushHistory]);

  // ─── Auto Layout ─────────────────────────────────────────────────────────
  const handleAutoLayout = useCallback(() => {
    if (elements.length === 0) return;
    pushHistory();
    setElements(computeAutoLayout(elements, connections));
  }, [elements, connections, pushHistory]);

  // ─── Right-Click Context Menu ────────────────────────────────────────────
  const handleCanvasContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;
    const canvasX = (e.clientX - rect.left - pan.x) / zoom;
    const canvasY = (e.clientY - rect.top - pan.y) / zoom;
    setRightClickMenu({ x: e.clientX, y: e.clientY, canvasX, canvasY, targetType: 'canvas' });
  }, [pan, zoom]);

  const handleElementContextMenu = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;
    const canvasX = (e.clientX - rect.left - pan.x) / zoom;
    const canvasY = (e.clientY - rect.top - pan.y) / zoom;
    setSelectedElementId(id);
    setRightClickMenu({ x: e.clientX, y: e.clientY, canvasX, canvasY, targetType: 'element', targetId: id });
  }, [pan, zoom]);

  const handleConnContextMenu = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedConnId(id);
    setRightClickMenu({ x: e.clientX, y: e.clientY, canvasX: 0, canvasY: 0, targetType: 'connection', targetId: id });
  }, []);

  const rcmAddElement = useCallback((type: FunnelElementType, kind?: PlatformKind | MockupKind | TextKind) => {
    if (!rightClickMenu) return;
    pushHistory();
    const defaults = ELEMENT_DEFAULTS[type];
    const w = type === 'mockup' && kind ? (MOCKUP_SIZES[kind as MockupKind]?.width || defaults.width) : defaults.width;
    const h = type === 'mockup' && kind ? (MOCKUP_SIZES[kind as MockupKind]?.height || defaults.height) : defaults.height;
    const platform = type === 'platform' && kind ? PLATFORMS.find(p => p.kind === kind) : null;
    const el: FunnelElement = {
      id: `el-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type, x: rightClickMenu.canvasX - w / 2, y: rightClickMenu.canvasY - h / 2, width: w, height: h,
      ...(platform && { platformKind: kind as PlatformKind, icon: platform.icon, label: platform.label }),
      ...(type === 'mockup' && kind && { mockupKind: kind as MockupKind }),
      ...(type === 'text' && { textKind: (kind as TextKind) || 'headline', textContent: 'Text hier eingeben' }),
    };
    setElements(prev => [...prev, el]);
    setSelectedElementId(el.id);
    setRightClickMenu(null);
  }, [rightClickMenu, pushHistory]);

  const rcmDuplicateElement = useCallback(() => {
    if (!rightClickMenu?.targetId) return;
    const src = elements.find(e => e.id === rightClickMenu.targetId);
    if (!src) return;
    pushHistory();
    const dup: FunnelElement = { ...src, id: `el-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, x: src.x + 30, y: src.y + 30 };
    setElements(prev => [...prev, dup]);
    setSelectedElementId(dup.id);
    setRightClickMenu(null);
  }, [rightClickMenu, elements, pushHistory]);

  const rcmDeleteElement = useCallback(() => {
    if (!rightClickMenu?.targetId) return;
    pushHistory();
    setElements(prev => prev.filter(e => e.id !== rightClickMenu.targetId));
    setConnections(prev => prev.filter(c => c.from !== rightClickMenu.targetId && c.to !== rightClickMenu.targetId));
    setSelectedElementId(null);
    setRightClickMenu(null);
  }, [rightClickMenu, pushHistory]);

  const rcmDeleteConnection = useCallback(() => {
    if (!rightClickMenu?.targetId) return;
    pushHistory();
    setConnections(prev => prev.filter(c => c.id !== rightClickMenu.targetId));
    setSelectedConnId(null);
    setRightClickMenu(null);
  }, [rightClickMenu, pushHistory]);

  const rcmSelectAll = useCallback(() => {
    setRightClickMenu(null);
  }, []);

  // ─── PNG Export ──────────────────────────────────────────────────────────
  const handleExportPNG = useCallback(() => {
    if (elements.length === 0) return;
    const allBounds = [
      ...elements.map(e => ({ l: e.x, t: e.y, r: e.x + e.width, b: e.y + e.height })),
      ...phases.map(p => ({ l: p.x, t: p.y, r: p.x + p.width, b: p.y + p.height })),
    ];
    const minX = Math.min(...allBounds.map(b => b.l)) - 40;
    const minY = Math.min(...allBounds.map(b => b.t)) - 40;
    const maxX = Math.max(...allBounds.map(b => b.r)) + 40;
    const maxY = Math.max(...allBounds.map(b => b.b)) + 40;
    const w = maxX - minX, h = maxY - minY;

    let svg = `<svg width="${w * 2}" height="${h * 2}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<rect width="${w * 2}" height="${h * 2}" fill="${isDark ? '#18181b' : '#f9fafb'}" />`;
    svg += `<g transform="scale(2)">`;

    for (const p of phases) {
      const c = GROUP_COLORS[p.color] || GROUP_COLORS.gray;
      svg += `<rect x="${p.x - minX}" y="${p.y - minY}" width="${p.width}" height="${p.height}" rx="16" fill="${c.bg}" stroke="${c.border}" stroke-width="2" stroke-dasharray="8,4" />`;
      svg += `<text x="${p.x - minX + 16}" y="${p.y - minY + 24}" font-family="sans-serif" font-size="11" font-weight="700" fill="${c.text}" text-transform="uppercase">${p.label}</text>`;
    }

    for (const conn of connections) {
      const from = elements.find(e => e.id === conn.from);
      const to = elements.find(e => e.id === conn.to);
      if (!from || !to) continue;
      const pathD = getFunnelConnectionPath(from, to, conn.fromPort, conn.toPort);
      const dash = conn.lineStyle === 'dashed' ? 'stroke-dasharray="8,4"' : conn.lineStyle === 'dotted' ? 'stroke-dasharray="3,3"' : '';
      svg += `<path d="${pathD}" stroke="${conn.color || '#a855f7'}" stroke-width="2" fill="none" opacity="0.6" ${dash} />`;
      if (conn.label) {
        const mx = (from.x + from.width / 2 + to.x + to.width / 2) / 2 - minX;
        const my = (from.y + from.height / 2 + to.y + to.height / 2) / 2 - minY - 8;
        svg += `<text x="${mx}" y="${my}" font-family="sans-serif" font-size="10" fill="${isDark ? '#a1a1aa' : '#6b7280'}" text-anchor="middle">${conn.label}</text>`;
      }
    }

    for (const el of elements) {
      if (el.type === 'platform') {
        const platform = PLATFORMS.find(p => p.kind === el.platformKind);
        const color = platform?.color || '#8b5cf6';
        svg += `<rect x="${el.x - minX}" y="${el.y - minY}" width="${el.width}" height="${el.height}" rx="12" fill="${color}12" stroke="${color}30" stroke-width="1.5" />`;
        svg += `<text x="${el.x - minX + 48}" y="${el.y - minY + el.height / 2 + 4}" font-family="sans-serif" font-size="13" font-weight="600" fill="${isDark ? '#fff' : '#111'}">${(el.label || '').substring(0, 22)}</text>`;
      } else if (el.type === 'text') {
        svg += `<text x="${el.x - minX + 8}" y="${el.y - minY + 20}" font-family="sans-serif" font-size="${el.fontSize || 14}" fill="${el.textColor || (isDark ? '#e4e4e7' : '#374151')}">${(el.textContent || '').substring(0, 50)}</text>`;
      } else {
        svg += `<rect x="${el.x - minX}" y="${el.y - minY}" width="${el.width}" height="${el.height}" rx="12" fill="${isDark ? '#27272a' : '#f3f4f6'}" stroke="${isDark ? '#3f3f46' : '#d1d5db'}" stroke-width="1.5" />`;
      }
    }

    svg += '</g></svg>';

    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = w * 2; canvas.height = h * 2;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `funnel-${(boardName || 'export').replace(/\s+/g, '-').toLowerCase()}.png`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    };
    img.src = url;
  }, [elements, connections, phases, isDark, boardName]);

  // ─── Funnel Metrics ─────────────────────────────────────────────────────
  // Default metric label per platform kind
  const getDefaultMetricLabel = useCallback((el: FunnelElement): string => {
    if (el.metricLabel) return el.metricLabel;
    if (el.type === 'platform') {
      const map: Partial<Record<PlatformKind, string>> = {
        'facebook-ads': 'Klicks', 'instagram-ads': 'Klicks', 'google-ads': 'Klicks',
        'linkedin-ads': 'Klicks', 'tiktok-ads': 'Klicks', 'youtube': 'Views',
        'landingpage': 'Besucher', 'website': 'Besucher', 'formular': 'Eintragungen',
        'kalender': 'Buchungen', 'crm': 'Kontakte', 'email': 'Öffnungen',
        'whatsapp-sms': 'Nachrichten', 'webinar': 'Teilnehmer', 'checkout': 'Käufe', 'seo': 'Besucher',
      };
      return el.platformKind ? (map[el.platformKind] || 'Wert') : 'Wert';
    }
    if (el.type === 'mockup') return 'Aufrufe';
    return 'Wert';
  }, []);

  const funnelSteps = useMemo(() => {
    // Only include elements that are part of connected chains
    const connectedIds = new Set<string>();
    for (const c of connections) { connectedIds.add(c.from); connectedIds.add(c.to); }
    const connectedEls = elements.filter(e => connectedIds.has(e.id) && e.type !== 'text');
    if (connectedEls.length === 0) return [];

    // BFS from root elements (no incoming connections) to compute ordered steps
    const incoming = new Set(connections.map(c => c.to));
    const roots = connectedEls.filter(e => !incoming.has(e.id));
    if (roots.length === 0) return connectedEls; // cycle fallback
    const visited = new Set<string>();
    const ordered: FunnelElement[] = [];
    const queue = [...roots];
    while (queue.length > 0) {
      const el = queue.shift()!;
      if (visited.has(el.id)) continue;
      visited.add(el.id);
      ordered.push(el);
      const outgoing = connections.filter(c => c.from === el.id);
      for (const conn of outgoing) {
        const target = elements.find(e => e.id === conn.to);
        if (target && !visited.has(target.id) && target.type !== 'text') queue.push(target);
      }
    }
    return ordered;
  }, [elements, connections]);

  const handleMetricChange = useCallback((id: string, value: number) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, metricValue: value } : el));
  }, []);

  // ─── Template Loading ──────────────────────────────────────────────────
  const loadTemplate = useCallback((tpl: FunnelTemplate) => {
    pushHistory();
    const defaults = ELEMENT_DEFAULTS.platform;
    const newEls: FunnelElement[] = tpl.elements.map((e, i) => {
      const platform = e.platformKind ? PLATFORMS.find(p => p.kind === e.platformKind) : null;
      return {
        id: `el-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
        type: e.type || 'platform',
        x: e.x || i * 260 + 60,
        y: e.y || 120,
        width: e.width || defaults.width,
        height: e.height || defaults.height,
        platformKind: e.platformKind,
        icon: e.icon || platform?.icon,
        label: e.label || platform?.label,
      } as FunnelElement;
    });
    const newConns: FunnelConnection[] = tpl.connections.map(([fi, ti, fp, tp], i) => ({
      id: `conn-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
      from: newEls[fi].id, to: newEls[ti].id,
      fromPort: fp, toPort: tp,
    }));
    setElements(prev => [...prev, ...newEls]);
    setConnections(prev => [...prev, ...newConns]);
    setMultiSelectedIds(new Set(newEls.map(e => e.id)));
  }, [pushHistory]);

  // ─── Render: Board List ──────────────────────────────────────────────────
  if (showBoardList) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Funnel Visualizer</h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Visuelle Boards für Marketing-Funnels & Sales-Demos</p>
          </div>
          <button onClick={createNewBoard} className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-colors">
            <Plus size={16} /> Neues Board
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {boards.map(board => (
            <div key={board.id} className="group text-left w-full bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800/50 rounded-2xl p-6 hover:border-purple-400/40 dark:hover:border-purple-500/30 hover:shadow-md dark:hover:shadow-none transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-purple-50 dark:bg-purple-500/10">
                  <Eye size={22} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleDuplicateBoard(board.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-purple-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors opacity-0 group-hover:opacity-100" title="Duplizieren"><Copy size={14} /></button>
                  <button onClick={() => handleDeleteBoard(board.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors opacity-0 group-hover:opacity-100" title="Löschen"><Trash2 size={14} /></button>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{board.name}</h3>
              <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed mb-5 line-clamp-2">{board.description || 'Keine Beschreibung'}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-zinc-500">
                  <span>{board.elements.length} Elemente</span>
                  <span>{new Date(board.updatedAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>
                </div>
                <button onClick={() => loadBoard(board)} className="flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity hover:underline">
                  Öffnen
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Render: Canvas ──────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">
    <div className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-gray-50 dark:bg-zinc-950' : 'rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden'}`} style={{ height: isFullscreen ? '100vh' : '80vh' }}>

      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 z-10 shrink-0">
        <button onClick={() => setPaletteOpen(!paletteOpen)} className={`p-1.5 rounded-lg transition-colors ${paletteOpen ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800'}`} title="Palette"><Plus size={16} /></button>

        <div className="h-4 w-px bg-gray-200 dark:bg-zinc-700" />
        <input type="text" value={boardName} onChange={e => setBoardName(e.target.value.slice(0, MAX_LABEL))} placeholder="Board-Name…" className="bg-transparent text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none w-40" />

        <div className="flex-1" />

        <button onClick={historyUndo} disabled={!canUndo} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-30" title="Rückgängig (Ctrl+Z)"><Undo2 size={15} /></button>
        <button onClick={historyRedo} disabled={!canRedo} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-30" title="Wiederholen (Ctrl+Y)"><Redo2 size={15} /></button>
        <button onClick={() => setShowHistoryPanel(!showHistoryPanel)} disabled={!canUndo && !canRedo} className={`p-1.5 rounded-lg transition-colors disabled:opacity-30 ${showHistoryPanel ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800'}`} title="Verlauf"><History size={15} /></button>
        <div className="h-4 w-px bg-gray-200 dark:bg-zinc-700" />

        <button onClick={() => setSnapEnabled(!snapEnabled)} className={`p-1.5 rounded-lg transition-colors ${snapEnabled ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800'}`} title="Snap"><Magnet size={15} /></button>
        <button onClick={() => setShowGrid(!showGrid)} className={`p-1.5 rounded-lg transition-colors ${showGrid ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800'}`} title="Raster"><Grid3X3 size={15} /></button>
        <button onClick={() => { setSearchOpen(!searchOpen); setSearchQuery(''); }} className={`p-1.5 rounded-lg transition-colors ${searchOpen ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800'}`} title="Suche (Ctrl+F)"><Search size={15} /></button>
        <button onClick={handleAutoLayout} disabled={elements.length === 0} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-30" title="Auto-Layout"><GitBranch size={15} /></button>
        <button onClick={handleExportPNG} disabled={elements.length === 0} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-30" title="PNG Export"><Download size={15} /></button>
        <button onClick={() => setShowMetrics(!showMetrics)} className={`p-1.5 rounded-lg transition-colors ${showMetrics ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800'}`} title="Funnel-Metriken"><BarChart3 size={15} /></button>
        <button onClick={() => setShowGlobalStyles(!showGlobalStyles)} className={`p-1.5 rounded-lg transition-colors ${showGlobalStyles ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800'}`} title="Globale Stile"><SlidersHorizontal size={15} /></button>

        <div className="h-4 w-px bg-gray-200 dark:bg-zinc-700" />

        <div className="flex items-center gap-1">
          <button onClick={() => { const r = 0.8; setZoom(z => Math.max(0.1, z * r)); setPan(p => { const rect = viewportRef.current?.getBoundingClientRect(); if (!rect) return p; const cx = rect.width / 2, cy = rect.height / 2; return { x: cx - (cx - p.x) * r, y: cy - (cy - p.y) * r }; }); }} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"><ZoomOut size={15} /></button>
          <button onClick={() => { setZoom(1); setPan({ x: 40, y: 40 }); }} className="min-w-[42px] text-center text-xs text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 px-1.5 py-1 rounded-lg transition-colors">{zoomPct}%</button>
          <button onClick={() => { const r = 1.25; setZoom(z => Math.min(5, z * r)); setPan(p => { const rect = viewportRef.current?.getBoundingClientRect(); if (!rect) return p; const cx = rect.width / 2, cy = rect.height / 2; return { x: cx - (cx - p.x) * r, y: cy - (cy - p.y) * r }; }); }} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"><ZoomIn size={15} /></button>
          <button onClick={fitToScreen} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"><Crosshair size={15} /></button>
          <button onClick={() => setShowMinimap(!showMinimap)} className={`p-1.5 rounded-lg transition-colors ${showMinimap ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800'}`} title="Minimap"><MapIcon size={15} /></button>
        </div>

        <div className="h-4 w-px bg-gray-200 dark:bg-zinc-700" />

        <button onClick={() => setShowShortcuts(!showShortcuts)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"><HelpCircle size={15} /></button>
        <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">{isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}</button>

        <div className="h-4 w-px bg-gray-200 dark:bg-zinc-700" />

        <button onClick={saveCurrentBoard} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${saveState === 'saved' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-500/20'}`}>
          <Save size={14} />{saveState === 'saving' ? 'Speichert...' : saveState === 'saved' ? 'Gespeichert' : 'Speichern'}
        </button>
        <button onClick={() => { setShowBoardList(true); setPaletteOpen(false); }} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors" title="Zur Board-Übersicht"><LayoutGrid size={15} /></button>
      </div>

      {/* ── History Panel ──────────────────────────────────────────────── */}
      {showHistoryPanel && (canUndo || canRedo) && (
        <div className="border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0" style={{ maxHeight: '25vh', overflowY: 'auto' }}>
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-gray-900 dark:text-white flex items-center gap-1.5"><History size={12} /> Verlauf</h3>
              <button onClick={() => setShowHistoryPanel(false)} className="p-0.5 rounded text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300"><X size={12} /></button>
            </div>
            <div className="space-y-0.5">
              {/* Current state */}
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <span className="text-[11px] font-medium">Aktueller Stand</span>
                <span className="text-[10px] ml-auto opacity-60">{elements.length} Elemente · {connections.length} Verbindungen</span>
              </div>
              {/* Undo stack (most recent first) */}
              {[...undoStackRef.current].reverse().map((snap, reverseIdx) => {
                const realIdx = undoStackRef.current.length - 1 - reverseIdx;
                return (
                  <button key={reverseIdx} onClick={() => { jumpToHistory(realIdx); setShowHistoryPanel(false); }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors group">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-zinc-600 group-hover:bg-purple-400" />
                    <span className="text-[11px] text-gray-500 dark:text-zinc-400">Schritt {realIdx + 1}</span>
                    <span className="text-[10px] text-gray-400 dark:text-zinc-500 ml-auto">{snap.elements.length} El. · {snap.connections.length} Verb.</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Search Bar ─────────────────────────────────────────────────── */}
      {searchOpen && (
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 shrink-0">
          <Search size={14} className="text-gray-400" />
          <input
            autoFocus
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Element suchen…"
            className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none"
            onKeyDown={e => {
              if (e.key === 'Escape') { setSearchOpen(false); setSearchQuery(''); }
              if (e.key === 'Enter' && searchQuery.length > 1) {
                // Jump to first matching element
                const match = elements.find(el => el.label?.toLowerCase().includes(searchQuery.toLowerCase()) || el.textContent?.toLowerCase().includes(searchQuery.toLowerCase()) || el.platformKind?.toLowerCase().includes(searchQuery.toLowerCase()));
                if (match) {
                  setSelectedElementId(match.id);
                  // Center viewport on the match
                  const rect = viewportRef.current?.getBoundingClientRect();
                  if (rect) {
                    setPan({ x: rect.width / 2 - (match.x + match.width / 2) * zoom, y: rect.height / 2 - (match.y + match.height / 2) * zoom });
                  }
                }
              }
            }}
          />
          {searchQuery && (
            <span className="text-[11px] text-gray-400 dark:text-zinc-500">
              {elements.filter(el => el.label?.toLowerCase().includes(searchQuery.toLowerCase()) || el.textContent?.toLowerCase().includes(searchQuery.toLowerCase()) || el.platformKind?.toLowerCase().includes(searchQuery.toLowerCase())).length} Treffer
            </span>
          )}
          <button onClick={() => { setSearchOpen(false); setSearchQuery(''); }} className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300"><X size={14} /></button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* ── Palette ───────────────────────────────────────────────────── */}
        {paletteOpen && (
          <div className="w-56 border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-y-auto shrink-0">
            <div className="flex border-b border-gray-200 dark:border-zinc-800">
              {(['platforms', 'mockups', 'text', 'media', 'phases', 'templates'] as const).map(tab => (
                <button key={tab} onClick={() => setPaletteTab(tab)} className={`flex-1 py-2 text-[10px] font-medium transition-colors ${paletteTab === tab ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-500' : 'text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300'}`}>
                  {tab === 'platforms' ? 'Plattformen' : tab === 'mockups' ? 'Mockups' : tab === 'text' ? 'Text' : tab === 'media' ? 'Medien' : tab === 'phases' ? 'Phasen' : 'Vorlagen'}
                </button>
              ))}
            </div>

            <div className="p-2 space-y-1">
              {paletteTab === 'platforms' && (() => {
                const categories = ['Werbung', 'Touchpoints', 'Backend'];
                return categories.map(cat => (
                  <div key={cat}>
                    <p className="text-[10px] uppercase font-semibold text-gray-400 dark:text-zinc-500 px-2 pt-2 pb-1">{cat}</p>
                    {PLATFORMS.filter(p => p.category === cat).map(p => {
                      const item: FunnelPaletteItem = { type: 'platform', label: p.label, icon: p.icon, platformKind: p.kind };
                      const LucideIcon = LUCIDE_ICONS[p.icon];
                      return (
                        <button key={p.kind} onClick={() => addElementFromPalette(item)} draggable
                          onDragStart={e => { e.dataTransfer.setData('application/json', JSON.stringify(item)); e.dataTransfer.effectAllowed = 'copy'; }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-grab active:cursor-grabbing">
                          <div className="w-6 h-6 rounded flex items-center justify-center shrink-0" style={{ background: p.color + '18' }}>
                            {TOOL_LOGOS[p.icon] ? renderNodeIcon(p.icon) : LucideIcon ? <LucideIcon size={14} style={{ color: p.color }} /> : <Globe size={14} style={{ color: p.color }} />}
                          </div>
                          <span className="text-xs text-gray-700 dark:text-zinc-300 truncate">{p.label}</span>
                        </button>
                      );
                    })}
                  </div>
                ));
              })()}

              {paletteTab === 'mockups' && MOCKUP_ITEMS.map(item => {
                const Icon = LUCIDE_ICONS[item.icon] || Monitor;
                return (
                  <button key={item.label} onClick={() => addElementFromPalette(item)} draggable
                    onDragStart={e => { e.dataTransfer.setData('application/json', JSON.stringify(item)); e.dataTransfer.effectAllowed = 'copy'; }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-grab active:cursor-grabbing">
                    <Icon size={16} className="text-gray-500 dark:text-zinc-400 shrink-0" />
                    <span className="text-xs text-gray-700 dark:text-zinc-300">{item.label}</span>
                  </button>
                );
              })}

              {paletteTab === 'text' && TEXT_ITEMS.map(item => (
                <button key={item.label} onClick={() => addElementFromPalette(item)} draggable
                  onDragStart={e => { e.dataTransfer.setData('application/json', JSON.stringify(item)); e.dataTransfer.effectAllowed = 'copy'; }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-grab active:cursor-grabbing">
                  <Type size={16} className="text-gray-500 dark:text-zinc-400 shrink-0" />
                  <span className="text-xs text-gray-700 dark:text-zinc-300">{item.label}</span>
                </button>
              ))}

              {paletteTab === 'media' && MEDIA_ITEMS.map(item => {
                const Icon = item.mediaType === 'video' ? Video : ImageIcon;
                return (
                  <button key={item.label} onClick={() => addElementFromPalette(item)} draggable
                    onDragStart={e => { e.dataTransfer.setData('application/json', JSON.stringify(item)); e.dataTransfer.effectAllowed = 'copy'; }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-grab active:cursor-grabbing">
                    <Icon size={16} className="text-gray-500 dark:text-zinc-400 shrink-0" />
                    <span className="text-xs text-gray-700 dark:text-zinc-300">{item.label}</span>
                  </button>
                );
              })}

              {paletteTab === 'phases' && Object.entries(GROUP_COLORS).map(([key, colors]) => (
                <button key={key} onClick={() => {
                  pushHistory();
                  const rect = viewportRef.current?.getBoundingClientRect();
                  const cx = rect ? (rect.width / 2 - pan.x) / zoom : 300;
                  const cy = rect ? (rect.height / 2 - pan.y) / zoom : 200;
                  const phase: FunnelPhase = { id: `phase-${Date.now()}`, label: `Phase (${colors.name})`, x: cx - 150, y: cy - 100, width: 300, height: 200, color: key };
                  setPhases(prev => [...prev, phase]);
                  setSelectedPhaseId(phase.id);
                }} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                  <div className="w-5 h-5 rounded border-2 border-dashed" style={{ background: colors.bg, borderColor: colors.border }} />
                  <span className="text-xs text-gray-700 dark:text-zinc-300">{colors.name}</span>
                </button>
              ))}

              {paletteTab === 'templates' && (
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-semibold text-gray-400 dark:text-zinc-500 px-2 pt-2 pb-1">Funnel-Vorlagen</p>
                  {FUNNEL_TEMPLATES.map((tpl, i) => (
                    <button key={i} onClick={() => { loadTemplate(tpl); setPaletteOpen(false); }} className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                      <p className="text-xs font-semibold text-gray-700 dark:text-zinc-300">{tpl.name}</p>
                      <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5">{tpl.description}</p>
                      <div className="flex items-center gap-1 mt-1.5">
                        {tpl.elements.map((e, j) => {
                          const p = e.platformKind ? PLATFORMS.find(pp => pp.kind === e.platformKind) : null;
                          return <div key={j} className="w-4 h-4 rounded flex items-center justify-center" style={{ background: (p?.color || '#8b5cf6') + '20' }}>
                            <span className="text-[7px] font-bold" style={{ color: p?.color || '#8b5cf6' }}>{(e.label || '?').charAt(0)}</span>
                          </div>;
                        })}
                        <span className="text-[9px] text-gray-300 dark:text-zinc-600 ml-1">{tpl.elements.length} Steps</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Global Styles Panel ──────────────────────────────────────── */}
        {showGlobalStyles && (
          <div className="w-64 border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-y-auto shrink-0">
            <div className="p-3 border-b border-gray-200 dark:border-zinc-800">
              <h3 className="text-xs font-semibold text-gray-900 dark:text-white flex items-center gap-1.5"><SlidersHorizontal size={12} /> Globale Stile</h3>
            </div>
            <div className="p-3 space-y-5">

              {/* ── Connection Styles ── */}
              <div>
                <p className="text-[10px] uppercase font-semibold text-gray-400 dark:text-zinc-500 mb-2">Verbindungen</p>

                {/* Line Style */}
                <label className="text-[11px] text-gray-500 dark:text-zinc-400 mb-1 block">Linienstil</label>
                <div className="flex gap-1.5 mb-3">
                  {([
                    { key: 'solid' as ConnLineStyle, label: '━━━', desc: 'Durchgehend' },
                    { key: 'dashed' as ConnLineStyle, label: '╌╌╌', desc: 'Gestrichelt' },
                    { key: 'dotted' as ConnLineStyle, label: '···', desc: 'Gepunktet' },
                  ]).map(s => (
                    <button key={s.key} onClick={() => setGlobalConnLineStyle(s.key)} className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${globalConnLineStyle === s.key ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' : 'border-gray-200 dark:border-zinc-700 text-gray-500 hover:border-gray-300'}`} title={s.desc}>{s.label}</button>
                  ))}
                </div>

                {/* Thickness */}
                <label className="text-[11px] text-gray-500 dark:text-zinc-400 mb-1 block">Stärke</label>
                <div className="flex gap-1.5 mb-3">
                  {([
                    { key: 'thin' as ConnThickness, label: 'Dünn' },
                    { key: 'normal' as ConnThickness, label: 'Normal' },
                    { key: 'thick' as ConnThickness, label: 'Dick' },
                  ]).map(s => (
                    <button key={s.key} onClick={() => setGlobalConnThickness(s.key)} className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium border transition-colors ${globalConnThickness === s.key ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' : 'border-gray-200 dark:border-zinc-700 text-gray-500 hover:border-gray-300'}`}>{s.label}</button>
                  ))}
                </div>

                {/* Curve Style */}
                <label className="text-[11px] text-gray-500 dark:text-zinc-400 mb-1 block">Kurvenform</label>
                <div className="flex gap-1.5 mb-3">
                  {([
                    { key: 'bezier' as ConnCurve, label: 'Kurve', icon: '⌒' },
                    { key: 'straight' as ConnCurve, label: 'Gerade', icon: '╲' },
                    { key: 'step' as ConnCurve, label: 'Stufen', icon: '⌐' },
                  ]).map(s => (
                    <button key={s.key} onClick={() => setGlobalConnCurve(s.key)} className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium border transition-colors ${globalConnCurve === s.key ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' : 'border-gray-200 dark:border-zinc-700 text-gray-500 hover:border-gray-300'}`}>{s.icon} {s.label}</button>
                  ))}
                </div>

                {/* Color */}
                <label className="text-[11px] text-gray-500 dark:text-zinc-400 mb-1 block">Farbe</label>
                <div className="flex gap-1.5 mb-3">
                  {(Object.keys(CONN_COLORS) as ConnColor[]).map(c => (
                    <button key={c} onClick={() => setGlobalConnColor(c)} className={`w-7 h-7 rounded-lg border-2 transition-all ${globalConnColor === c ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent hover:scale-105'}`} style={{ background: CONN_COLORS[c] }} title={c}>
                      {globalConnColor === c && <Check size={12} className="text-white mx-auto" />}
                    </button>
                  ))}
                </div>

                {/* Animation */}
                <label className="text-[11px] text-gray-500 dark:text-zinc-400 mb-1 block">Animation</label>
                <div className="flex gap-1.5 mb-3">
                  {([
                    { key: 'dot' as ConnAnimation, label: 'Punkt' },
                    { key: 'pulse' as ConnAnimation, label: 'Puls' },
                    { key: 'none' as ConnAnimation, label: 'Keine' },
                  ]).map(s => (
                    <button key={s.key} onClick={() => setGlobalConnAnimation(s.key)} className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium border transition-colors ${globalConnAnimation === s.key ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' : 'border-gray-200 dark:border-zinc-700 text-gray-500 hover:border-gray-300'}`}>{s.label}</button>
                  ))}
                </div>

                {/* Arrowhead */}
                <label className="text-[11px] text-gray-500 dark:text-zinc-400 mb-1 block">Pfeilspitze</label>
                <div className="flex gap-1.5">
                  {([
                    { key: 'filled' as ConnArrowhead, label: '▶ Gefüllt' },
                    { key: 'open' as ConnArrowhead, label: '▷ Offen' },
                    { key: 'none' as ConnArrowhead, label: '— Keine' },
                  ]).map(s => (
                    <button key={s.key} onClick={() => setGlobalConnArrowhead(s.key)} className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium border transition-colors ${globalConnArrowhead === s.key ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' : 'border-gray-200 dark:border-zinc-700 text-gray-500 hover:border-gray-300'}`}>{s.label}</button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-gray-100 dark:bg-zinc-800" />

              {/* ── Node Styles ── */}
              <div>
                <p className="text-[10px] uppercase font-semibold text-gray-400 dark:text-zinc-500 mb-2">Nodes / Elemente</p>

                {/* Node Shape */}
                <label className="text-[11px] text-gray-500 dark:text-zinc-400 mb-1 block">Form</label>
                <div className="grid grid-cols-3 gap-1.5 mb-3">
                  {([
                    { key: 'default' as NodeStyle, label: 'Standard', preview: 'rounded-xl border' },
                    { key: 'rounded' as NodeStyle, label: 'Rund', preview: 'rounded-[20px] border-2' },
                    { key: 'sharp' as NodeStyle, label: 'Eckig', preview: 'rounded-none border' },
                    { key: 'pill' as NodeStyle, label: 'Pill', preview: 'rounded-full border-2' },
                    { key: 'card' as NodeStyle, label: 'Karte', preview: 'rounded-xl border-2 border-b-4' },
                  ]).map(s => (
                    <button key={s.key} onClick={() => setGlobalNodeStyle(s.key)} className={`py-1.5 rounded-lg text-[10px] font-medium border transition-colors ${globalNodeStyle === s.key ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' : 'border-gray-200 dark:border-zinc-700 text-gray-500 hover:border-gray-300'}`}>
                      <div className={`w-8 h-4 mx-auto mb-0.5 border-current bg-purple-200/40 ${s.preview}`} />
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Node Shadow */}
                <label className="text-[11px] text-gray-500 dark:text-zinc-400 mb-1 block">Schatten</label>
                <div className="flex gap-1.5">
                  {([
                    { key: 'none' as NodeShadow, label: 'Keiner' },
                    { key: 'sm' as NodeShadow, label: 'Klein' },
                    { key: 'md' as NodeShadow, label: 'Mittel' },
                    { key: 'lg' as NodeShadow, label: 'Groß' },
                  ]).map(s => (
                    <button key={s.key} onClick={() => setGlobalNodeShadow(s.key)} className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium border transition-colors ${globalNodeShadow === s.key ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' : 'border-gray-200 dark:border-zinc-700 text-gray-500 hover:border-gray-300'}`}>{s.label}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Canvas Viewport ───────────────────────────────────────────── */}
        <div ref={viewportRef}
          className={`flex-1 overflow-hidden relative ${isDragOver ? 'ring-2 ring-inset ring-purple-500/30 bg-purple-500/5' : ''}`}
          style={{ cursor: spaceHeld ? 'grab' : isPanning ? 'grabbing' : 'default', background: isDark ? '#09090b' : '#f9fafb', touchAction: 'none', overscrollBehavior: 'contain' }}
          onMouseDown={handleViewportMouseDown}
          onMouseMove={handleViewportMouseMove}
          onMouseUp={handleViewportMouseUp}
          onMouseLeave={handleViewportMouseUp}
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onContextMenu={handleCanvasContextMenu}
        >
          {/* Transform Container */}
          <div className="canvas-inner absolute" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0', width: canvasW, height: canvasH }}>

            {/* Dot Grid */}
            <svg className="absolute inset-0 pointer-events-none" width={canvasW} height={canvasH}>
              <defs>
                <pattern id="funnelDots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                  <circle cx="12" cy="12" r="1" fill={isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'} />
                </pattern>
                {showGrid && (
                  <pattern id="funnelGrid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                    <line x1="40" y1="0" x2="40" y2="40" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} strokeWidth="0.5" />
                    <line x1="0" y1="40" x2="40" y2="40" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} strokeWidth="0.5" />
                  </pattern>
                )}
                {globalConnArrowhead !== 'none' && (
                  <marker id="arrowhead-default" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto" markerUnits="userSpaceOnUse">
                    <path d={globalConnArrowhead === 'filled' ? 'M0,0 L10,4 L0,8 L2,4 Z' : 'M1,1 L9,4 L1,7'} fill={globalConnArrowhead === 'filled' ? CONN_COLORS[globalConnColor] : 'none'} stroke={globalConnArrowhead === 'open' ? CONN_COLORS[globalConnColor] : 'none'} strokeWidth={1.5} />
                  </marker>
                )}
                {connections.map(conn => {
                  const c = conn.color || CONN_COLORS[globalConnColor];
                  const arrowPath = globalConnArrowhead === 'filled' ? `M0,0 L10,4 L0,8 L2,4 Z` : `M1,1 L9,4 L1,7`;
                  return globalConnArrowhead !== 'none' ? <marker key={`ah-${conn.id}`} id={`arrowhead-${conn.id}`} markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d={arrowPath} fill={globalConnArrowhead === 'filled' ? c : 'none'} stroke={globalConnArrowhead === 'open' ? c : 'none'} strokeWidth={1.5} /></marker> : null;
                })}
              </defs>
              <rect width="100%" height="100%" fill="url(#funnelDots)" />
              {showGrid && <rect width="100%" height="100%" fill="url(#funnelGrid)" />}

              {/* Connections */}
              {connections.map(conn => {
                const from = elements.find(e => e.id === conn.from);
                const to = elements.find(e => e.id === conn.to);
                if (!from || !to) return null;
                // Global curve style
                const pathD = globalConnCurve === 'straight' ? getStraightPath(from, to, conn.fromPort, conn.toPort) : globalConnCurve === 'step' ? getStepPath(from, to, conn.fromPort, conn.toPort) : getFunnelConnectionPath(from, to, conn.fromPort, conn.toPort);
                const isSelected = selectedConnId === conn.id;
                const isHovered = hoveredConnId === conn.id;
                // Global styles apply to all connections
                const dash = globalConnLineStyle === 'dashed' ? '8,4' : globalConnLineStyle === 'dotted' ? '3,3' : undefined;
                const color = conn.color || CONN_COLORS[globalConnColor];
                const baseWidth = CONN_THICKNESS_PX[globalConnThickness];
                const markerAttr = globalConnArrowhead !== 'none' ? `url(#arrowhead-${conn.id})` : undefined;

                return (
                  <g key={conn.id} style={{ pointerEvents: 'stroke' }}
                    onClick={e => { e.stopPropagation(); setSelectedConnId(conn.id); setSelectedElementId(null); setSelectedPhaseId(null); }}
                    onDoubleClick={() => handleConnDoubleClick(conn.id)}
                    onMouseEnter={() => setHoveredConnId(conn.id)}
                    onMouseLeave={() => setHoveredConnId(null)}
                    onContextMenu={e => handleConnContextMenu(e, conn.id)}
                  >
                    <path d={pathD} stroke="transparent" strokeWidth={12 / zoom} fill="none" style={{ cursor: 'pointer' }} />
                    <path d={pathD} stroke={isSelected ? '#a855f7' : isHovered ? 'rgba(168,85,247,0.8)' : color} strokeWidth={isSelected ? baseWidth + 1 : isHovered ? baseWidth + 0.5 : baseWidth} fill="none" strokeDasharray={dash} markerEnd={markerAttr} />
                    {globalConnAnimation === 'dot' && (
                      <circle r={3} fill={color} opacity={0.8}>
                        <animateMotion dur="2.5s" repeatCount="indefinite" path={pathD} />
                      </circle>
                    )}
                    {globalConnAnimation === 'pulse' && (
                      <circle r={4} fill={color} opacity={0.6}>
                        <animateMotion dur="2.5s" repeatCount="indefinite" path={pathD} />
                        <animate attributeName="r" values="2;5;2" dur="1.2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1.2s" repeatCount="indefinite" />
                      </circle>
                    )}
                    {(() => {
                      const mx = (from.x + from.width / 2 + to.x + to.width / 2) / 2;
                      const my = (from.y + from.height / 2 + to.y + to.height / 2) / 2 - 10;
                      const fromVal = from.metricValue || 0;
                      const toVal = to.metricValue || 0;
                      const autoRate = showMetrics && fromVal > 0 && toVal > 0 ? `${((toVal / fromVal) * 100).toFixed(1)}%` : null;
                      const displayLabel = conn.label || autoRate;
                      // Inline editing mode
                      if (inlineConnLabelId === conn.id) {
                        return (
                          <foreignObject x={mx - 50} y={my - 12} width={100} height={24}>
                            <input
                              autoFocus
                              value={inlineConnLabelText}
                              onChange={e => setInlineConnLabelText(e.target.value)}
                              onBlur={() => { pushHistory(); setConnections(prev => prev.map(c => c.id === conn.id ? { ...c, label: inlineConnLabelText || undefined } : c)); setInlineConnLabelId(null); }}
                              onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') setInlineConnLabelId(null); }}
                              className="w-full h-full text-center text-[10px] bg-white dark:bg-zinc-800 border border-purple-400 rounded px-1 focus:outline-none text-gray-900 dark:text-white"
                              style={{ fontSize: 10 }}
                            />
                          </foreignObject>
                        );
                      }
                      if (!displayLabel) {
                        // Show a faint "+" to add label on hover
                        return isHovered ? (
                          <g style={{ cursor: 'pointer', pointerEvents: 'all' }} onClick={e => { e.stopPropagation(); setInlineConnLabelId(conn.id); setInlineConnLabelText(''); }}>
                            <rect x={mx - 10} y={my - 8} width={20} height={16} rx={4} fill={isDark ? '#27272a' : '#f3f4f6'} stroke={isDark ? '#3f3f46' : '#e5e7eb'} strokeWidth={1} opacity={0.7} />
                            <text x={mx} y={my + 4} textAnchor="middle" fill={isDark ? '#71717a' : '#9ca3af'} fontSize={10} fontFamily="system-ui">+</text>
                          </g>
                        ) : null;
                      }
                      return (
                        <g style={{ cursor: 'pointer', pointerEvents: 'all' }} onClick={e => { e.stopPropagation(); setInlineConnLabelId(conn.id); setInlineConnLabelText(conn.label || ''); }}>
                          <rect x={mx - displayLabel.length * 3.5 - 4} y={my - 10} width={displayLabel.length * 7 + 8} height={16} rx={4} fill={isDark ? '#27272a' : '#fff'} stroke={autoRate && !conn.label ? (isDark ? '#7c3aed' : '#c084fc') : (isDark ? '#3f3f46' : '#e5e7eb')} strokeWidth={1} />
                          <text x={mx} y={my + 2} textAnchor="middle" fill={autoRate && !conn.label ? '#a855f7' : (isDark ? '#a1a1aa' : '#6b7280')} fontSize={10} fontWeight={autoRate && !conn.label ? 'bold' : 'normal'} fontFamily="system-ui">{displayLabel}</text>
                        </g>
                      );
                    })()}
                  </g>
                );
              })}

              {/* Temp connection while connecting */}
              {connectState && (() => {
                const fromEl = elements.find(e => e.id === connectState.fromId);
                if (!fromEl) return null;
                const p = getElPortPos(fromEl, connectState.fromPort);
                const pathD = getTempPath(p.x, p.y, PORT_DIR[connectState.fromPort], connectState.canvasX, connectState.canvasY);
                return <path d={pathD} stroke="#a855f7" strokeWidth={2} fill="none" strokeDasharray="6,3" opacity={0.7} />;
              })()}

              {/* Snap guides */}
              {snapLines.x.map((x, i) => <line key={`sx-${i}`} x1={x} y1={0} x2={x} y2={canvasH} stroke="#a855f7" strokeWidth={1} strokeDasharray="4,4" opacity={0.5} />)}
              {snapLines.y.map((y, i) => <line key={`sy-${i}`} x1={0} y1={y} x2={canvasW} y2={y} stroke="#a855f7" strokeWidth={1} strokeDasharray="4,4" opacity={0.5} />)}

              {equalSpacingGuides.map((g, i) => {
                const cap = 12;
                if (g.axis === 'x') {
                  const y = g.segA.cross;
                  return (<g key={`eq-${i}`} opacity={0.7}><line x1={g.segA.from} y1={y} x2={g.segA.to} y2={y} stroke="#a855f7" strokeWidth={1} strokeDasharray="3,2" /><line x1={g.segA.from} y1={y-cap} x2={g.segA.from} y2={y+cap} stroke="#a855f7" strokeWidth={1} /><line x1={g.segA.to} y1={y-cap} x2={g.segA.to} y2={y+cap} stroke="#a855f7" strokeWidth={1} /><line x1={g.segB.from} y1={y} x2={g.segB.to} y2={y} stroke="#a855f7" strokeWidth={1} strokeDasharray="3,2" /><line x1={g.segB.from} y1={y-cap} x2={g.segB.from} y2={y+cap} stroke="#a855f7" strokeWidth={1} /><line x1={g.segB.to} y1={y-cap} x2={g.segB.to} y2={y+cap} stroke="#a855f7" strokeWidth={1} /><text x={(g.segA.from+g.segA.to)/2} y={y-cap-4} fill="#a855f7" fontSize={10} textAnchor="middle" fontFamily="system-ui">{Math.round(g.dist)}</text></g>);
                } else {
                  const x = g.segA.cross;
                  return (<g key={`eq-${i}`} opacity={0.7}><line x1={x} y1={g.segA.from} x2={x} y2={g.segA.to} stroke="#a855f7" strokeWidth={1} strokeDasharray="3,2" /><line x1={x-cap} y1={g.segA.from} x2={x+cap} y2={g.segA.from} stroke="#a855f7" strokeWidth={1} /><line x1={x-cap} y1={g.segA.to} x2={x+cap} y2={g.segA.to} stroke="#a855f7" strokeWidth={1} /><line x1={x} y1={g.segB.from} x2={x} y2={g.segB.to} stroke="#a855f7" strokeWidth={1} strokeDasharray="3,2" /><line x1={x-cap} y1={g.segB.from} x2={x+cap} y2={g.segB.from} stroke="#a855f7" strokeWidth={1} /><line x1={x-cap} y1={g.segB.to} x2={x+cap} y2={g.segB.to} stroke="#a855f7" strokeWidth={1} /></g>);
                }
              })}

              {/* Lasso selection rectangle */}
              {lassoState && (
                <rect
                  x={Math.min(lassoState.startX, lassoState.currentX)}
                  y={Math.min(lassoState.startY, lassoState.currentY)}
                  width={Math.abs(lassoState.currentX - lassoState.startX)}
                  height={Math.abs(lassoState.currentY - lassoState.startY)}
                  fill="rgba(168,85,247,0.08)" stroke="#a855f7" strokeWidth={1} strokeDasharray="6,3" rx={4}
                />
              )}

              {/* Reconnect handles for selected connection */}
              {selectedConnId && !reconnectState && (() => {
                const conn = connections.find(c => c.id === selectedConnId);
                if (!conn) return null;
                const fromEl = elements.find(e => e.id === conn.from);
                const toEl = elements.find(e => e.id === conn.to);
                if (!fromEl || !toEl) return null;
                const fromPos = getElPortPos(fromEl, conn.fromPort);
                const toPos = getElPortPos(toEl, conn.toPort);
                return (
                  <>
                    <circle cx={fromPos.x} cy={fromPos.y} r={6 / zoom} fill="#a855f7" stroke="#fff" strokeWidth={2 / zoom}
                      style={{ cursor: 'grab', pointerEvents: 'all' }}
                      onMouseDown={e => { e.stopPropagation(); setReconnectState({ connId: conn.id, endpoint: 'from', canvasX: fromPos.x, canvasY: fromPos.y }); }}
                    />
                    <circle cx={toPos.x} cy={toPos.y} r={6 / zoom} fill="#a855f7" stroke="#fff" strokeWidth={2 / zoom}
                      style={{ cursor: 'grab', pointerEvents: 'all' }}
                      onMouseDown={e => { e.stopPropagation(); setReconnectState({ connId: conn.id, endpoint: 'to', canvasX: toPos.x, canvasY: toPos.y }); }}
                    />
                  </>
                );
              })()}

              {/* Reconnect temp line */}
              {reconnectState && (() => {
                const conn = connections.find(c => c.id === reconnectState.connId);
                if (!conn) return null;
                const fixedEl = elements.find(e => e.id === (reconnectState.endpoint === 'from' ? conn.to : conn.from));
                if (!fixedEl) return null;
                const fixedPort = reconnectState.endpoint === 'from' ? conn.toPort : conn.fromPort;
                const fixedPos = getElPortPos(fixedEl, fixedPort);
                const dir = PORT_DIR[fixedPort];
                const pathD = getTempPath(fixedPos.x, fixedPos.y, dir, reconnectState.canvasX, reconnectState.canvasY);
                return <path d={pathD} stroke="#a855f7" strokeWidth={2} fill="none" strokeDasharray="6,3" opacity={0.7} />;
              })()}
            </svg>

            {/* Phases */}
            {phases.map(phase => {
              const colors = GROUP_COLORS[phase.color] || GROUP_COLORS.gray;
              const isSelected = selectedPhaseId === phase.id;
              return (
                <div key={phase.id} className={`absolute rounded-2xl border-2 border-dashed transition-shadow ${isSelected ? 'ring-2 ring-purple-500/50 shadow-lg' : ''}`}
                  style={{ left: phase.x, top: phase.y, width: phase.width, height: phase.height, background: colors.bg, borderColor: colors.border, zIndex: 1, cursor: dragPhaseState?.id === phase.id ? 'grabbing' : 'grab' }}
                  onMouseDown={e => handlePhaseMouseDown(e, phase.id)}
                  onDoubleClick={() => handlePhaseDoubleClick(phase.id)}
                >
                  <div className="px-4 py-3"><span className="text-xs font-bold uppercase tracking-widest" style={{ color: colors.text }}>{phase.label}</span></div>
                  {isSelected && (
                    <div className="absolute right-0 bottom-0 w-5 h-5 cursor-se-resize z-20" onMouseDown={e => handleResizeStart(e, phase.id, 'phase')}>
                      <svg className="absolute right-1 bottom-1" width="8" height="8" viewBox="0 0 8 8"><path d="M7 1L1 7M7 4L4 7M7 7L7 7" stroke={colors.text} strokeWidth="1.5" strokeLinecap="round" /></svg>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Elements */}
            {elements.map(el => {
              const isSelected = selectedElementId === el.id;
              const isMultiSelected = multiSelectedIds.has(el.id);
              const isAnySelected = isSelected || isMultiSelected;
              const platform = el.type === 'platform' ? PLATFORMS.find(p => p.kind === el.platformKind) : null;
              const borderAccent = platform?.color || (el.type === 'mockup' ? (isDark ? '#3f3f46' : '#d1d5db') : el.type === 'text' ? 'transparent' : (isDark ? '#3f3f46' : '#d1d5db'));
              const defaultBg = el.type === 'platform' ? (platform ? platform.color + '08' : 'rgba(139,92,246,0.05)') : el.type === 'text' ? 'transparent' : (isDark ? 'rgba(39,39,42,0.5)' : 'rgba(255,255,255,0.9)');
              const bgColor = el.backgroundColor ? el.backgroundColor + '15' : defaultBg;
              // Animation: elements created in last 400ms get appear animation
              const elTs = parseInt(el.id.split('-')[1] || '0', 10);
              const isNew = Date.now() - elTs < 400;
              // Search highlight
              const isSearchMatch = searchOpen && searchQuery.length > 1 && (el.label?.toLowerCase().includes(searchQuery.toLowerCase()) || el.textContent?.toLowerCase().includes(searchQuery.toLowerCase()) || el.platformKind?.toLowerCase().includes(searchQuery.toLowerCase()));

              return (
                <div key={el.id}
                  className={`absolute select-none ${isNew ? 'funnel-node-appear' : ''} ${dragState?.id === el.id ? '' : 'transition-shadow duration-200'} ${isAnySelected ? 'ring-2 ring-purple-500 shadow-lg shadow-purple-500/10' : ''} ${isMultiSelected && !isSelected ? 'ring-purple-400/60' : ''} ${isSearchMatch ? 'ring-2 ring-yellow-400 shadow-lg shadow-yellow-400/20' : ''} ${el.type !== 'text' ? `${NODE_STYLE_CLASSES[globalNodeStyle]} ${NODE_SHADOW_CLASS[globalNodeShadow]}` : ''}`}
                  style={{
                    left: el.x, top: el.y, width: el.width, height: el.height,
                    background: bgColor, borderColor: isAnySelected ? '#a855f7' : borderAccent,
                    cursor: dragState?.id === el.id ? 'grabbing' : 'grab',
                    zIndex: isAnySelected ? 20 : 10,
                  }}
                  onMouseDown={e => handleElementMouseDown(e, el.id)}
                  onMouseEnter={() => setHoveredElementId(el.id)}
                  onMouseLeave={() => setHoveredElementId(null)}
                  onDoubleClick={() => handleElementDoubleClick(el.id)}
                  onContextMenu={e => handleElementContextMenu(e, el.id)}
                >
                  {el.type === 'platform' && <PlatformNode el={el} isDark={isDark} />}
                  {el.type === 'mockup' && <MockupFrame el={el} isDark={isDark} />}
                  {el.type === 'text' && <TextBlock el={el} isDark={isDark} isInlineEditing={inlineEditId === el.id} onSave={saveInlineEdit} />}
                  {el.type === 'media' && <MediaBlock el={el} isDark={isDark} />}

                  {/* Note indicator */}
                  {el.notes && (
                    <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-yellow-400 dark:bg-yellow-500 flex items-center justify-center shadow-sm z-30 cursor-pointer" title={el.notes}>
                      <span className="text-[9px] font-bold text-white">!</span>
                    </div>
                  )}

                  {/* Resize handle */}
                  {isSelected && el.type !== 'text' && (
                    <div className="absolute right-0 bottom-0 w-5 h-5 cursor-se-resize z-20" onMouseDown={e => handleResizeStart(e, el.id, 'element')}>
                      <svg className="absolute right-1 bottom-1" width="8" height="8" viewBox="0 0 8 8"><path d="M7 1L1 7M7 4L4 7" stroke={isDark ? '#71717a' : '#9ca3af'} strokeWidth="1.5" strokeLinecap="round" /></svg>
                    </div>
                  )}

                  {/* Connection ports */}
                  {(hoveredElementId === el.id || connectState || reconnectState || isAnySelected) && el.type !== 'text' && (
                    <>
                      {(['top', 'right', 'bottom', 'left'] as PortDirection[]).map(port => {
                        const style: React.CSSProperties = port === 'top' ? { top: 0, left: '50%', transform: 'translate(-50%, -50%)' } : port === 'right' ? { top: '50%', right: 0, transform: 'translate(50%, -50%)' } : port === 'bottom' ? { bottom: 0, left: '50%', transform: 'translate(-50%, 50%)' } : { top: '50%', left: 0, transform: 'translate(-50%, -50%)' };
                        return (
                          <div key={port} className="absolute w-4 h-4 rounded-full border bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-600 flex items-center justify-center hover:bg-purple-50 dark:hover:bg-purple-500/20 hover:border-purple-400 hover:scale-125 transition-all cursor-crosshair z-30" style={style}
                            onClick={e => handlePortClick(e, el.id, port)}
                          >
                            <Plus size={8} strokeWidth={2.5} className="text-gray-400 hover:text-purple-500" />
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Minimap ─────────────────────────────────────────────────── */}
        {showMinimap && elements.length > 0 && (() => {
          const mapW = 160, mapH = 100;
          const allX = elements.map(e => e.x), allY = elements.map(e => e.y);
          const allR = elements.map(e => e.x + e.width), allB = elements.map(e => e.y + e.height);
          const minX = Math.min(...allX) - 40, minY = Math.min(...allY) - 40;
          const maxX = Math.max(...allR) + 40, maxY = Math.max(...allB) + 40;
          const totalW = maxX - minX || 1, totalH = maxY - minY || 1;
          const scale = Math.min(mapW / totalW, mapH / totalH);
          // Viewport rect in canvas coords
          const rect = viewportRef.current?.getBoundingClientRect();
          const vpW = rect ? rect.width / zoom : 800, vpH = rect ? rect.height / zoom : 600;
          const vpX = -pan.x / zoom, vpY = -pan.y / zoom;
          return (
            <div className="absolute bottom-3 right-3 z-30 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm overflow-hidden shadow-lg"
              style={{ width: mapW, height: mapH, cursor: 'pointer' }}
              onClick={e => {
                const r = e.currentTarget.getBoundingClientRect();
                const mx = (e.clientX - r.left) / scale + minX;
                const my = (e.clientY - r.top) / scale + minY;
                const vr = viewportRef.current?.getBoundingClientRect();
                if (vr) setPan({ x: -(mx - vpW / 2) * zoom, y: -(my - vpH / 2) * zoom });
              }}
            >
              <svg width={mapW} height={mapH}>
                {elements.map(el => {
                  const platform = el.type === 'platform' ? PLATFORMS.find(p => p.kind === el.platformKind) : null;
                  return (
                    <rect key={el.id} x={(el.x - minX) * scale} y={(el.y - minY) * scale} width={Math.max(2, el.width * scale)} height={Math.max(2, el.height * scale)} rx={2}
                      fill={platform?.color || (el.type === 'text' ? 'transparent' : isDark ? '#52525b' : '#d1d5db')} opacity={0.7} />
                  );
                })}
                {connections.map(conn => {
                  const from = elements.find(e => e.id === conn.from);
                  const to = elements.find(e => e.id === conn.to);
                  if (!from || !to) return null;
                  return <line key={conn.id} x1={(from.x + from.width / 2 - minX) * scale} y1={(from.y + from.height / 2 - minY) * scale} x2={(to.x + to.width / 2 - minX) * scale} y2={(to.y + to.height / 2 - minY) * scale} stroke={isDark ? '#71717a' : '#9ca3af'} strokeWidth={0.5} />;
                })}
                {/* Viewport indicator */}
                <rect x={(vpX - minX) * scale} y={(vpY - minY) * scale} width={vpW * scale} height={vpH * scale} fill="rgba(168,85,247,0.08)" stroke="#a855f7" strokeWidth={1} rx={2} />
              </svg>
            </div>
          );
        })()}
      </div>

      {/* ── Metriken-Eingabe (hinter Toggle) ─────────────────────────── */}
      {showMetrics && funnelSteps.length > 0 && (
        <div className="border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0 overflow-y-auto" style={{ maxHeight: '25vh' }}>
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><BarChart3 size={14} /> Funnel-Metriken eingeben</h3>
            <div className="flex flex-wrap gap-3">
              {funnelSteps.map((step, i) => {
                const platform = step.type === 'platform' ? PLATFORMS.find(p => p.kind === step.platformKind) : null;
                const name = step.label || platform?.label || step.mockupKind || `Step ${i + 1}`;
                const metricLabel = getDefaultMetricLabel(step);
                return (
                  <div key={step.id} className="bg-gray-50 dark:bg-zinc-800 rounded-xl px-3 py-2.5 min-w-[180px]">
                    <div className="flex items-center gap-2 mb-1.5">
                      {platform && <div className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: platform.color + '20' }}>
                        <span style={{ color: platform.color }} className="text-[10px] font-bold">{platform.label.charAt(0)}</span>
                      </div>}
                      <span className="text-xs text-gray-700 dark:text-zinc-300 font-semibold truncate">{name}</span>
                      {/* Traffic light indicator */}
                      {step.metricTarget && step.metricTarget > 0 && step.metricValue ? (() => {
                        const pct = (step.metricValue / step.metricTarget) * 100;
                        const color = pct >= 90 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444';
                        return <div className="w-2.5 h-2.5 rounded-full ml-auto shrink-0" style={{ backgroundColor: color }} title={`${pct.toFixed(0)}% vom Ziel`} />;
                      })() : null}
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <input
                        type="number"
                        value={step.metricValue ?? ''}
                        onChange={e => handleMetricChange(step.id, Number(e.target.value) || 0)}
                        placeholder="Ist"
                        className="w-20 px-2 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:outline-none focus:border-purple-400 text-right"
                      />
                      <span className="text-[11px] text-gray-400 dark:text-zinc-500 whitespace-nowrap">{metricLabel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={step.metricTarget ?? ''}
                        onChange={e => setElements(prev => prev.map(el => el.id === step.id ? { ...el, metricTarget: Number(e.target.value) || 0 } : el))}
                        placeholder="Ziel"
                        className="w-20 px-2 py-1.5 text-[11px] rounded-lg border border-dashed border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-500 dark:text-zinc-400 focus:outline-none focus:border-purple-400 text-right"
                      />
                      <span className="text-[10px] text-gray-300 dark:text-zinc-600 whitespace-nowrap">Ziel</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Overlays ─────────────────────────────────────────────── */}
      {editElementId && (() => {
        const el = elements.find(e => e.id === editElementId);
        if (!el) return null;
        return (
          <div className="absolute inset-0 bg-black/30 z-40 flex items-center justify-center" onClick={() => setEditElementId(null)}>
            <div className={`bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-6 space-y-4 ${el.type === 'mockup' ? 'w-[440px]' : 'w-96'}`} onClick={e => e.stopPropagation()}>
              <h3 className="font-semibold text-gray-900 dark:text-white">{el.type === 'mockup' ? 'Mockup bearbeiten' : 'Element bearbeiten'}</h3>
              {(el.type === 'platform') && (
                <>
                  <input value={editLabel} onChange={e => setEditLabel(e.target.value)} placeholder="Label" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-400" />
                  <input value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Beschreibung" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-400" />
                </>
              )}
              {el.type === 'text' && (
                <textarea value={editTextContent} onChange={e => setEditTextContent(e.target.value)} rows={4} placeholder="Text eingeben..." className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-400 resize-none" />
              )}
              {el.type === 'media' && (
                <input value={editMediaUrl} onChange={e => setEditMediaUrl(e.target.value)} placeholder="Bild-URL" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-400" />
              )}
              {el.type === 'mockup' && (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                  {(el.mockupKind === 'social-post' || el.mockupKind === 'ad-mockup') && (
                    <>
                      <p className="text-[10px] uppercase font-semibold text-gray-400 dark:text-zinc-500">Profil</p>
                      <input value={editProfileImage} onChange={e => setEditProfileImage(e.target.value)} placeholder="Profilbild-URL" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-400" />
                      <input value={editProfileName} onChange={e => setEditProfileName(e.target.value)} placeholder="Name / Marke" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-400" />
                    </>
                  )}
                  <p className="text-[10px] uppercase font-semibold text-gray-400 dark:text-zinc-500">Inhalt</p>
                  <textarea value={editBodyText} onChange={e => setEditBodyText(e.target.value)} rows={3} placeholder="Text / Beschreibung" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-400 resize-none" />
                  <input value={editMediaUrl} onChange={e => setEditMediaUrl(e.target.value)} placeholder="Bild-URL (Hauptbild)" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-400" />
                  <input value={editHeadline} onChange={e => setEditHeadline(e.target.value)} placeholder="Headline" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-400" />
                  {el.mockupKind === 'ad-mockup' && (
                    <input value={editMockupDesc} onChange={e => setEditMockupDesc(e.target.value)} placeholder="Untertitel / Beschreibung" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-400" />
                  )}
                  {(el.mockupKind === 'ad-mockup' || el.mockupKind === 'mobile' || el.mockupKind === 'desktop') && (
                    <input value={editCtaText} onChange={e => setEditCtaText(e.target.value)} placeholder="CTA-Button Text (z.B. 'Jetzt kaufen')" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-400" />
                  )}
                  {(el.mockupKind === 'desktop' || el.mockupKind === 'mobile' || el.mockupKind === 'ad-mockup') && (
                    <input value={editBrowserUrl} onChange={e => setEditBrowserUrl(e.target.value)} placeholder="URL (z.B. 'www.example.com')" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-400" />
                  )}
                  <input value={editTextContent} onChange={e => setEditTextContent(e.target.value)} placeholder="Platzhalter-Text (Fallback)" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-400" />
                </div>
              )}
              {/* Notes */}
              <div>
                <p className="text-[10px] uppercase font-semibold text-gray-400 dark:text-zinc-500 mb-1">Notizen</p>
                <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={2} placeholder="Interne Notiz hinzufügen…" className="w-full px-3 py-2 rounded-lg border border-dashed border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-yellow-400 resize-none" />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setEditElementId(null)} className="px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800">Abbrechen</button>
                <button onClick={saveElementEdit} className="px-3 py-1.5 rounded-lg text-sm bg-purple-600 text-white hover:bg-purple-700">Speichern</button>
              </div>
            </div>
          </div>
        );
      })()}

      {editConnId && (
        <div className="absolute inset-0 bg-black/30 z-40 flex items-center justify-center" onClick={() => setEditConnId(null)}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-6 w-80 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-gray-900 dark:text-white">Verbindung bearbeiten</h3>
            <input value={editConnLabel} onChange={e => setEditConnLabel(e.target.value)} placeholder="Label (z.B. 'Klick', '32% CTR')" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-400" />
            <div className="flex gap-2">
              {(['solid', 'dashed', 'dotted'] as FunnelLineStyle[]).map(s => (
                <button key={s} onClick={() => setEditConnStyle(s)} className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${editConnStyle === s ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' : 'border-gray-200 dark:border-zinc-700 text-gray-500'}`}>
                  {s === 'solid' ? '━━━' : s === 'dashed' ? '╌╌╌' : '···'}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditConnId(null)} className="px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800">Abbrechen</button>
              <button onClick={saveConnEdit} className="px-3 py-1.5 rounded-lg text-sm bg-purple-600 text-white hover:bg-purple-700">Speichern</button>
            </div>
          </div>
        </div>
      )}

      {editPhaseId && (
        <div className="absolute inset-0 bg-black/30 z-40 flex items-center justify-center" onClick={() => setEditPhaseId(null)}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-6 w-80 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-gray-900 dark:text-white">Phase bearbeiten</h3>
            <input value={editPhaseLabel} onChange={e => setEditPhaseLabel(e.target.value)} placeholder="Phase-Name" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-400" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditPhaseId(null)} className="px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800">Abbrechen</button>
              <button onClick={savePhaseEdit} className="px-3 py-1.5 rounded-lg text-sm bg-purple-600 text-white hover:bg-purple-700">Speichern</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Keyboard Shortcuts ─────────────────────────────────────────── */}
      {showShortcuts && (
        <div className="absolute inset-0 bg-black/30 z-40 flex items-center justify-center" onClick={() => setShowShortcuts(false)}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-6 w-80" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Tastenkürzel</h3>
              <button onClick={() => setShowShortcuts(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>
            <div className="space-y-2 text-sm">
              {[['Space + Drag', 'Canvas verschieben'], ['Scroll', 'Zoom'], ['Ctrl+Z', 'Rückgängig'], ['Ctrl+Y', 'Wiederholen'], ['Delete', 'Element löschen'], ['Escape', 'Auswahl aufheben'], ['Doppelklick', 'Element bearbeiten'], ['Shift+Klick', 'Multi-Auswahl'], ['Shift+Drag', 'Lasso-Auswahl'], ['Ctrl+A', 'Alles auswählen'], ['Ctrl+C / V', 'Kopieren / Einfügen'], ['Ctrl+D', 'Duplizieren'], ['Pfeiltasten', 'Verschieben (1px)'], ['Shift+Pfeiltasten', 'Verschieben (10px)'], ['Tab', 'Nächstes Element'], ['?', 'Tastenkürzel']].map(([key, desc]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-500 dark:text-zinc-400">{desc}</span>
                  <kbd className="px-1.5 py-0.5 text-[11px] rounded bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 font-mono">{key}</kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Right-Click Context Menu ──────────────────────────────────── */}
      {rightClickMenu && (
        <div className="fixed inset-0 z-50" onClick={() => setRightClickMenu(null)}>
          <div
            className="absolute bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-gray-200 dark:border-zinc-700 w-52 py-1 overflow-hidden"
            style={{ left: Math.min(rightClickMenu.x, window.innerWidth - 220), top: Math.min(rightClickMenu.y, window.innerHeight - 380) }}
            onClick={ee => ee.stopPropagation()}
          >
            {rightClickMenu.targetType === 'canvas' && (
              <>
                <p className="px-3 py-1.5 text-[10px] uppercase font-semibold text-gray-400 dark:text-zinc-500">Plattform hinzufügen</p>
                {PLATFORMS.slice(0, 6).map(p => (
                  <button key={p.kind} onClick={() => rcmAddElement('platform', p.kind)} className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-gray-100 dark:hover:bg-zinc-800 text-xs text-gray-700 dark:text-zinc-300">
                    <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: p.color + '18' }}>
                      {TOOL_LOGOS[p.icon] ? renderNodeIcon(p.icon, undefined, undefined, 10) : <Globe size={10} style={{ color: p.color }} />}
                    </div>
                    {p.label}
                  </button>
                ))}
                <div className="h-px bg-gray-100 dark:bg-zinc-800 my-1" />
                <p className="px-3 py-1.5 text-[10px] uppercase font-semibold text-gray-400 dark:text-zinc-500">Weitere</p>
                <button onClick={() => rcmAddElement('mockup', 'mobile')} className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-gray-100 dark:hover:bg-zinc-800 text-xs text-gray-700 dark:text-zinc-300">
                  <Smartphone size={12} className="text-gray-400" /> Mobile Mockup
                </button>
                <button onClick={() => rcmAddElement('mockup', 'desktop')} className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-gray-100 dark:hover:bg-zinc-800 text-xs text-gray-700 dark:text-zinc-300">
                  <Monitor size={12} className="text-gray-400" /> Desktop Mockup
                </button>
                <button onClick={() => rcmAddElement('text', 'headline')} className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-gray-100 dark:hover:bg-zinc-800 text-xs text-gray-700 dark:text-zinc-300">
                  <Type size={12} className="text-gray-400" /> Text
                </button>
                <button onClick={() => rcmAddElement('media')} className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-gray-100 dark:hover:bg-zinc-800 text-xs text-gray-700 dark:text-zinc-300">
                  <ImageIcon size={12} className="text-gray-400" /> Bild / Medien
                </button>
                <div className="h-px bg-gray-100 dark:bg-zinc-800 my-1" />
                <button onClick={() => { rcmSelectAll(); setPaletteOpen(true); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-gray-100 dark:hover:bg-zinc-800 text-xs text-gray-700 dark:text-zinc-300">
                  <LayoutGrid size={12} className="text-gray-400" /> Alle Elemente anzeigen
                </button>
                <button onClick={() => { setRightClickMenu(null); handleAutoLayout(); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-gray-100 dark:hover:bg-zinc-800 text-xs text-gray-700 dark:text-zinc-300">
                  <GitBranch size={12} className="text-gray-400" /> Auto-Layout
                </button>
                <button onClick={() => { setRightClickMenu(null); fitToScreen(); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-gray-100 dark:hover:bg-zinc-800 text-xs text-gray-700 dark:text-zinc-300">
                  <Maximize2 size={12} className="text-gray-400" /> An Bildschirm anpassen
                </button>
                <button onClick={() => { setRightClickMenu(null); handleExportPNG(); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-gray-100 dark:hover:bg-zinc-800 text-xs text-gray-700 dark:text-zinc-300">
                  <Download size={12} className="text-gray-400" /> Als PNG exportieren
                </button>
              </>
            )}
            {rightClickMenu.targetType === 'element' && (
              <>
                <button onClick={() => { setRightClickMenu(null); if (rightClickMenu.targetId) { setSelectedElementId(rightClickMenu.targetId); handleElementDoubleClick(rightClickMenu.targetId); } }} className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-zinc-800 text-xs text-gray-700 dark:text-zinc-300">
                  <FileText size={12} className="text-gray-400" /> Bearbeiten
                </button>
                <button onClick={rcmDuplicateElement} className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-zinc-800 text-xs text-gray-700 dark:text-zinc-300">
                  <Copy size={12} className="text-gray-400" /> Duplizieren
                </button>
                <div className="h-px bg-gray-100 dark:bg-zinc-800 my-1" />
                <p className="px-3 py-1 text-[10px] uppercase font-semibold text-gray-400 dark:text-zinc-500">Farbe</p>
                <div className="flex gap-1 px-3 py-1">
                  {['#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#64748b'].map(c => (
                    <button key={c} onClick={() => {
                      pushHistory();
                      const ids = multiSelectedIds.size > 0 ? multiSelectedIds : new Set([rightClickMenu.targetId!]);
                      setElements(prev => prev.map(el => ids.has(el.id) ? { ...el, backgroundColor: c } : el));
                      setRightClickMenu(null);
                    }} className="w-5 h-5 rounded-full border-2 border-white dark:border-zinc-800 hover:scale-125 transition-transform" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <div className="h-px bg-gray-100 dark:bg-zinc-800 my-1" />
                <button onClick={rcmDeleteElement} className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-red-50 dark:hover:bg-red-500/10 text-xs text-red-600 dark:text-red-400">
                  <Trash2 size={12} /> Löschen
                </button>
              </>
            )}
            {rightClickMenu.targetType === 'connection' && (
              <>
                <button onClick={() => { setRightClickMenu(null); if (rightClickMenu.targetId) handleConnDoubleClick(rightClickMenu.targetId); }} className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-zinc-800 text-xs text-gray-700 dark:text-zinc-300">
                  <FileText size={12} className="text-gray-400" /> Bearbeiten
                </button>
                <div className="h-px bg-gray-100 dark:bg-zinc-800 my-1" />
                <button onClick={rcmDeleteConnection} className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-red-50 dark:hover:bg-red-500/10 text-xs text-red-600 dark:text-red-400">
                  <Trash2 size={12} /> Löschen
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Connection Context Menu ────────────────────────────────────── */}
      {contextMenu && (
        <div className="fixed inset-0 z-50" onClick={() => setContextMenu(null)}>
          <div
            className="absolute bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-gray-200 dark:border-zinc-700 w-56 max-h-80 overflow-y-auto py-1"
            style={{ left: contextMenu.screenX, top: contextMenu.screenY, transform: 'translate(-50%, 8px)' }}
            onClick={ee => ee.stopPropagation()}
          >
            <p className="px-3 py-1.5 text-[10px] uppercase font-semibold text-gray-400 dark:text-zinc-500">Plattformen</p>
            {PLATFORMS.slice(0, 8).map(p => {
              const item: FunnelPaletteItem = { type: 'platform', label: p.label, icon: p.icon, platformKind: p.kind };
              return (
                <button key={p.kind} onClick={() => handleContextMenuSelect(item)} className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-gray-100 dark:hover:bg-zinc-800 text-xs text-gray-700 dark:text-zinc-300">
                  <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: p.color + '18' }}>
                    {TOOL_LOGOS[p.icon] ? renderNodeIcon(p.icon, undefined, undefined, 12) : <Globe size={10} style={{ color: p.color }} />}
                  </div>
                  {p.label}
                </button>
              );
            })}
            <div className="h-px bg-gray-100 dark:bg-zinc-800 my-1" />
            <p className="px-3 py-1.5 text-[10px] uppercase font-semibold text-gray-400 dark:text-zinc-500">Mockups</p>
            {MOCKUP_ITEMS.map(item => {
              const Icon = LUCIDE_ICONS[item.icon] || Monitor;
              return (
                <button key={item.label} onClick={() => handleContextMenuSelect(item)} className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-gray-100 dark:hover:bg-zinc-800 text-xs text-gray-700 dark:text-zinc-300">
                  <Icon size={12} className="text-gray-400" />
                  {item.label}
                </button>
              );
            })}
            <div className="h-px bg-gray-100 dark:bg-zinc-800 my-1" />
            <p className="px-3 py-1.5 text-[10px] uppercase font-semibold text-gray-400 dark:text-zinc-500">Text & Medien</p>
            {[...TEXT_ITEMS, ...MEDIA_ITEMS].map(item => (
              <button key={item.label} onClick={() => handleContextMenuSelect(item)} className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-gray-100 dark:hover:bg-zinc-800 text-xs text-gray-700 dark:text-zinc-300">
                <Type size={12} className="text-gray-400" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>

    {/* ═══════════════════════════════════════════════════════════════════
        Conversion Rates — eigene Sektion, komplett getrennt vom Canvas
        ═══════════════════════════════════════════════════════════════════ */}
    {funnelSteps.length >= 2 && (
      <div className="mt-6 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Conversion Rates</h3>
            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">{funnelSteps.length} Steps · Step-to-Step & Gesamt</p>
          </div>
          {funnelSteps[0].metricValue && funnelSteps[funnelSteps.length - 1].metricValue ? (
            <div className="text-right">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {((funnelSteps[funnelSteps.length - 1].metricValue! / funnelSteps[0].metricValue!) * 100).toFixed(2)}%
              </p>
              <p className="text-[10px] text-gray-400 dark:text-zinc-500">Gesamt-Conversion</p>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-zinc-800">
              <p className="text-[11px] text-gray-400 dark:text-zinc-500">Metriken eingeben ↑</p>
            </div>
          )}
        </div>

        {/* Funnel Flow */}
        <div className="px-6 py-5">
          <div className="flex items-stretch gap-0 overflow-x-auto">
            {funnelSteps.map((step, i) => {
              const platform = step.type === 'platform' ? PLATFORMS.find(p => p.kind === step.platformKind) : null;
              const name = step.label || platform?.label || step.mockupKind || `Step ${i + 1}`;
              const val = step.metricValue || 0;
              const metricLabel = getDefaultMetricLabel(step);
              const prevVal = i > 0 ? (funnelSteps[i - 1].metricValue || 0) : 0;
              const stepRate = i > 0 && prevVal > 0 ? ((val / prevVal) * 100).toFixed(1) : null;
              const firstVal = funnelSteps[0].metricValue || 0;
              const overallRate = i > 0 && firstVal > 0 ? ((val / firstVal) * 100).toFixed(1) : null;
              const barHeight = firstVal > 0 && val > 0 ? Math.max((val / firstVal) * 100, 8) : (i === 0 && val > 0 ? 100 : 15);
              const platformColor = platform?.color || '#a855f7';

              return (
                <div key={step.id} className="flex items-stretch flex-1 min-w-0">
                  {/* Arrow connector */}
                  {i > 0 && (
                    <div className="flex flex-col items-center justify-center w-14 shrink-0">
                      <div className="w-full h-px bg-gray-200 dark:bg-zinc-700 relative">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[6px] border-l-gray-300 dark:border-l-zinc-600 border-y-[4px] border-y-transparent" />
                      </div>
                      <div className={`mt-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        stepRate ? (parseFloat(stepRate) >= 50 ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : parseFloat(stepRate) >= 20 ? 'bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400' : parseFloat(stepRate) >= 5 ? 'bg-yellow-100 dark:bg-yellow-500/15 text-yellow-600 dark:text-yellow-400' : 'bg-red-100 dark:bg-red-500/15 text-red-500') : 'bg-gray-100 dark:bg-zinc-800 text-gray-400'
                      }`}>
                        {stepRate ? `${stepRate}%` : '–'}
                      </div>
                    </div>
                  )}

                  {/* Step Card */}
                  <div className="flex-1 min-w-[110px] flex flex-col items-center">
                    {/* Bar */}
                    <div className="w-full flex justify-center mb-2" style={{ height: '72px' }}>
                      <div className="w-10 rounded-t-lg relative flex items-end justify-center overflow-hidden" style={{ background: `${platformColor}15` }}>
                        <div className="w-full rounded-t-lg transition-all duration-500" style={{ height: `${barHeight}%`, background: `linear-gradient(to top, ${platformColor}, ${platformColor}99)` }} />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="text-center w-full px-1">
                      <p className="text-xs font-semibold text-gray-800 dark:text-zinc-200 truncate">{name}</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{val > 0 ? val.toLocaleString('de-DE') : '–'}</p>
                      <p className="text-[10px] text-gray-400 dark:text-zinc-500">{metricLabel}</p>
                      {/* Target traffic light */}
                      {step.metricTarget && step.metricTarget > 0 && val > 0 && (() => {
                        const pct = (val / step.metricTarget) * 100;
                        const color = pct >= 90 ? 'text-emerald-500' : pct >= 60 ? 'text-yellow-500' : 'text-red-500';
                        const bg = pct >= 90 ? 'bg-emerald-50 dark:bg-emerald-500/10' : pct >= 60 ? 'bg-yellow-50 dark:bg-yellow-500/10' : 'bg-red-50 dark:bg-red-500/10';
                        return <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${bg} ${color}`}>{pct.toFixed(0)}% Ziel</span>;
                      })()}
                      {overallRate && (
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          parseFloat(overallRate) >= 20 ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : parseFloat(overallRate) >= 5 ? 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' : 'bg-red-50 dark:bg-red-500/10 text-red-500'
                        }`}>
                          {overallRate}% gesamt
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Summary */}
        {funnelSteps[0].metricValue && funnelSteps[funnelSteps.length - 1].metricValue && (
          <div className="px-6 py-3 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-400">
              <span className="font-medium">{funnelSteps[0].label || PLATFORMS.find(p => p.kind === funnelSteps[0].platformKind)?.label || 'Step 1'}</span>
              <ArrowRight size={12} className="text-gray-300 dark:text-zinc-600" />
              <span className="font-medium">{funnelSteps[funnelSteps.length - 1].label || PLATFORMS.find(p => p.kind === funnelSteps[funnelSteps.length - 1].platformKind)?.label || `Step ${funnelSteps.length}`}</span>
            </div>
            <div className="h-3 w-px bg-gray-200 dark:bg-zinc-700" />
            <span className="text-xs text-gray-400 dark:text-zinc-500">
              {funnelSteps[0].metricValue!.toLocaleString('de-DE')} {getDefaultMetricLabel(funnelSteps[0])} → {funnelSteps[funnelSteps.length - 1].metricValue!.toLocaleString('de-DE')} {getDefaultMetricLabel(funnelSteps[funnelSteps.length - 1])}
            </span>
          </div>
        )}
      </div>
    )}
    </div>
  );
}
