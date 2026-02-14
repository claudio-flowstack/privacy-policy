/**
 * WorkflowCanvas – Interactive visual workflow builder & viewer
 * Features: zoom/pan, fullscreen, groups/phases, drag & drop, click-to-connect,
 *           snap guides, undo/redo, context menu, multi-select, node search,
 *           keyboard shortcuts overlay, execution animation, readOnly mode
 *
 * i18n: All user-facing strings are inline German. To localise,
 *       extract them into a translation map keyed by locale.
 */

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  Zap, Plus, Trash2, Save, Users, FileText, Globe, Mail,
  Target, BarChart3, Database, Sparkles, Search, Image,
  FolderOpen, Send, TrendingUp, Eye, Play, Mic, Type,
  Clipboard, Activity, MousePointer, Check, Loader2,
  Maximize2, Minimize2, ZoomIn, ZoomOut, Crosshair, ChevronDown,
  Undo2, Redo2, Magnet, HelpCircle, Copy, Scissors,
  Download, GitBranch, StickyNote as StickyNoteIcon,
  X, Bold, Italic, Paperclip, Link2,
  Bot, Brain, Workflow, Filter, Timer, ShieldCheck,
  Bell, LayoutDashboard, Webhook, Split, Repeat, FileSearch,
  MessageSquare, Gauge, Lock, Cpu, Layers, Settings,
  ChevronLeft, ChevronRight, ChevronUp,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/components/theme-provider';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import type { AutomationSystem, SystemNode, NodeConnection, NodeType, CanvasGroup, StickyNote, StickyNoteColor, PortDirection } from '@/types/automation';
import { getResourcesForSystem } from '@/data/resourceStorage';
import type { NodeExecutionStatus } from '@/types/workflowEvents';
import { TOOL_LOGOS, getToolLogosByCategory, renderNodeIcon } from './ToolLogos';
import { useLanguage } from '@/i18n/LanguageContext';

/** Internal pages that can be linked to a node */
const LINKABLE_PAGES = [
  { value: '', label: { de: 'Keine', en: 'None' } },
  { value: '/onboarding', label: { de: 'Onboarding-Formular', en: 'Onboarding Form' } },
  { value: '/kostenlose-beratung', label: { de: 'Erstgespräch-Formular', en: 'Consultation Form' } },
  { value: '/dashboard', label: { de: 'Marketing-Dashboard', en: 'Marketing Dashboard' } },
  { value: '/systems', label: { de: 'System-Übersicht', en: 'Systems Overview' } },
] as const;

// ─── Constants ───────────────────────────────────────────────────────────────

type IconComponent = typeof Zap;
const ICONS: Record<string, IconComponent> = {
  'zap': Zap, 'users': Users, 'file-text': FileText, 'globe': Globe,
  'mail': Mail, 'target': Target, 'bar-chart': BarChart3, 'database': Database,
  'sparkles': Sparkles, 'search': Search, 'image': Image, 'folder-open': FolderOpen,
  'send': Send, 'trending-up': TrendingUp, 'eye': Eye, 'play': Play,
  'mic': Mic, 'type': Type, 'clipboard': Clipboard, 'activity': Activity,
  'bot': Bot, 'brain': Brain, 'workflow': Workflow, 'filter': Filter,
  'timer': Timer, 'shield-check': ShieldCheck, 'bell': Bell,
  'layout-dashboard': LayoutDashboard, 'webhook': Webhook, 'split': Split,
  'repeat': Repeat, 'file-search': FileSearch, 'message-square': MessageSquare,
  'gauge': Gauge, 'lock': Lock, 'cpu': Cpu, 'layers': Layers, 'settings': Settings,
};

const NODE_W = 230;
const NODE_H = 92;
const SNAP_THRESHOLD = 8;
const MAX_LABEL_LENGTH = 40;
const MAX_DESC_LENGTH = 120;
const PAN_DRAG_THRESHOLD = 4; // #31 – pixels before pan starts
const MAX_GROUP_W = 3000;
const MAX_GROUP_H = 2000;

const NODE_STYLES: Record<NodeType, { bg: string; border: string; accent: string; label: string }> = {
  trigger: { bg: 'rgba(59,130,246,0.07)', border: 'rgba(59,130,246,0.18)', accent: '#3b82f6', label: 'Trigger' },
  process: { bg: 'rgba(139,92,246,0.07)', border: 'rgba(139,92,246,0.18)', accent: '#8b5cf6', label: 'Prozess' },
  ai:      { bg: 'rgba(217,70,239,0.07)', border: 'rgba(217,70,239,0.18)', accent: '#d946ef', label: 'KI' },
  output:  { bg: 'rgba(16,185,129,0.07)', border: 'rgba(16,185,129,0.18)', accent: '#10b981', label: 'Output' },
};

const GROUP_COLORS: Record<string, { bg: string; border: string; text: string; name: string }> = {
  blue:   { bg: 'rgba(59,130,246,0.10)',  border: 'rgba(59,130,246,0.30)',  text: 'rgba(59,130,246,0.70)',  name: 'Blau' },
  green:  { bg: 'rgba(16,185,129,0.10)',  border: 'rgba(16,185,129,0.30)',  text: 'rgba(16,185,129,0.70)',  name: 'Grün' },
  purple: { bg: 'rgba(139,92,246,0.10)',  border: 'rgba(139,92,246,0.30)',  text: 'rgba(139,92,246,0.70)',  name: 'Lila' },
  orange: { bg: 'rgba(245,158,11,0.10)',  border: 'rgba(245,158,11,0.30)',  text: 'rgba(245,158,11,0.70)',  name: 'Orange' },
  red:    { bg: 'rgba(239,68,68,0.10)',   border: 'rgba(239,68,68,0.30)',   text: 'rgba(239,68,68,0.70)',   name: 'Rot' },
  gray:   { bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.25)', text: 'rgba(107,114,128,0.60)', name: 'Grau' },
};

const STICKY_COLORS: Record<StickyNoteColor, { bg: string; border: string; text: string; name: string; shadow: string }> = {
  yellow: { bg: 'rgba(250,204,21,0.35)', border: 'rgba(202,138,4,0.6)',  text: '#854d0e', name: 'Gelb',    shadow: 'rgba(250,204,21,0.25)' },
  orange: { bg: 'rgba(249,115,22,0.30)', border: 'rgba(234,88,12,0.55)', text: '#9a3412', name: 'Orange',  shadow: 'rgba(249,115,22,0.2)' },
  pink:   { bg: 'rgba(236,72,153,0.28)', border: 'rgba(219,39,119,0.55)', text: '#9d174d', name: 'Rosa',   shadow: 'rgba(236,72,153,0.2)' },
  red:    { bg: 'rgba(239,68,68,0.28)',  border: 'rgba(220,38,38,0.55)',  text: '#991b1b', name: 'Rot',    shadow: 'rgba(239,68,68,0.2)' },
  purple: { bg: 'rgba(139,92,246,0.28)', border: 'rgba(124,58,237,0.55)', text: '#5b21b6', name: 'Lila',   shadow: 'rgba(139,92,246,0.2)' },
  blue:   { bg: 'rgba(59,130,246,0.28)', border: 'rgba(37,99,235,0.55)',  text: '#1e40af', name: 'Blau',   shadow: 'rgba(59,130,246,0.2)' },
  green:  { bg: 'rgba(34,197,94,0.28)',  border: 'rgba(22,163,74,0.55)',  text: '#166534', name: 'Grün',   shadow: 'rgba(34,197,94,0.2)' },
  gray:   { bg: 'rgba(107,114,128,0.20)', border: 'rgba(75,85,99,0.45)', text: '#374151', name: 'Grau',   shadow: 'rgba(107,114,128,0.15)' },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

// #5 – Cycle detection: DFS from `start` following existing connections, returns true if `target` is reachable
function wouldCreateCycle(
  connections: NodeConnection[],
  startId: string,
  targetId: string,
): boolean {
  const adj = new Map<string, string[]>();
  for (const c of connections) {
    const list = adj.get(c.from) || [];
    list.push(c.to);
    adj.set(c.from, list);
  }
  const visited = new Set<string>();
  const stack = [targetId];
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (node === startId) return true;
    if (visited.has(node)) continue;
    visited.add(node);
    for (const next of adj.get(node) || []) stack.push(next);
  }
  return false;
}

// ─── Auto-Layout (BFS Layering) ─────────────────────────────────────────────

function computeAutoLayout(nodes: SystemNode[], connections: NodeConnection[]): SystemNode[] {
  if (nodes.length === 0) return nodes;

  const incoming = new Set(connections.map(c => c.to));
  const startIds = nodes
    .filter(n => n.type === 'trigger' || !incoming.has(n.id))
    .map(n => n.id);
  if (startIds.length === 0) startIds.push(nodes[0].id);

  const layerMap = new Map<string, number>();
  const queue: { id: string; depth: number }[] = startIds.map(id => ({ id, depth: 0 }));
  const visited = new Set<string>();

  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;
    if (visited.has(id)) {
      // Update to deeper layer if reached again
      if ((layerMap.get(id) ?? 0) < depth) layerMap.set(id, depth);
      continue;
    }
    visited.add(id);
    layerMap.set(id, depth);
    for (const conn of connections.filter(c => c.from === id)) {
      queue.push({ id: conn.to, depth: depth + 1 });
    }
  }

  // Unconnected nodes go to the end
  let maxLayer = Math.max(0, ...layerMap.values());
  for (const n of nodes) {
    if (!layerMap.has(n.id)) {
      layerMap.set(n.id, ++maxLayer);
    }
  }

  // Group nodes by layer
  const layers = new Map<number, string[]>();
  for (const [id, layer] of layerMap) {
    const list = layers.get(layer) || [];
    list.push(id);
    layers.set(layer, list);
  }

  // Position nodes
  const result = new Map<string, { x: number; y: number }>();
  for (const [layer, ids] of layers) {
    ids.forEach((id, idx) => {
      result.set(id, { x: 40 + layer * 340, y: 40 + idx * 108 });
    });
  }

  return nodes.map(n => {
    const pos = result.get(n.id);
    return pos ? { ...n, x: pos.x, y: pos.y } : n;
  });
}

// ─── Connection Path ─────────────────────────────────────────────────────────

const PORT_DIR: Record<PortDirection, [number, number]> = {
  top: [0, -1], right: [1, 0], bottom: [0, 1], left: [-1, 0],
};

function getPortPosition(node: SystemNode, port: PortDirection): { x: number; y: number } {
  switch (port) {
    case 'top':    return { x: node.x + NODE_W / 2, y: node.y };
    case 'right':  return { x: node.x + NODE_W, y: node.y + NODE_H / 2 };
    case 'bottom': return { x: node.x + NODE_W / 2, y: node.y + NODE_H };
    case 'left':   return { x: node.x, y: node.y + NODE_H / 2 };
  }
}

export function getConnectionPath(
  fromNode: SystemNode, toNode: SystemNode,
  fromPort: PortDirection = 'right', toPort: PortDirection = 'left',
): string {
  const p1 = getPortPosition(fromNode, fromPort);
  const p2 = getPortPosition(toNode, toPort);
  const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
  const offset = Math.max(60, dist * 0.35);
  const d1 = PORT_DIR[fromPort];
  const d2 = PORT_DIR[toPort];
  return `M ${p1.x} ${p1.y} C ${p1.x + d1[0] * offset} ${p1.y + d1[1] * offset}, ${p2.x + d2[0] * offset} ${p2.y + d2[1] * offset}, ${p2.x} ${p2.y}`;
}

function getTempPath(
  fx: number, fy: number, fromDir: [number, number],
  tx: number, ty: number,
): string {
  const dist = Math.hypot(tx - fx, ty - fy);
  const offset = Math.max(60, dist * 0.35);
  return `M ${fx} ${fy} C ${fx + fromDir[0] * offset} ${fy + fromDir[1] * offset}, ${tx} ${ty}, ${tx} ${ty}`;
}

// ─── Alternative Path Functions ──────────────────────────────────────────────

function getStraightPath(
  fromNode: SystemNode, toNode: SystemNode,
  fromPort: PortDirection = 'right', toPort: PortDirection = 'left',
): string {
  const p1 = getPortPosition(fromNode, fromPort);
  const p2 = getPortPosition(toNode, toPort);
  return `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;
}

function getElbowPath(
  fromNode: SystemNode, toNode: SystemNode,
  fromPort: PortDirection = 'right', toPort: PortDirection = 'left',
): string {
  const p1 = getPortPosition(fromNode, fromPort);
  const p2 = getPortPosition(toNode, toPort);
  const midX = (p1.x + p2.x) / 2;
  return `M ${p1.x} ${p1.y} L ${midX} ${p1.y} L ${midX} ${p2.y} L ${p2.x} ${p2.y}`;
}

// ─── Path Midpoint ───────────────────────────────────────────────────────────

function getPathMidpoint(
  fromNode: SystemNode, toNode: SystemNode,
  fromPort: PortDirection = 'right', toPort: PortDirection = 'left',
  curveStyle: 'bezier' | 'straight' | 'elbow',
): { x: number; y: number } {
  const p1 = getPortPosition(fromNode, fromPort);
  const p2 = getPortPosition(toNode, toPort);
  if (curveStyle === 'straight') {
    return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
  }
  if (curveStyle === 'elbow') {
    const midX = (p1.x + p2.x) / 2;
    return { x: midX, y: (p1.y + p2.y) / 2 };
  }
  // Bezier: de Casteljau at t=0.5
  const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
  const offset = Math.max(60, dist * 0.35);
  const d1 = PORT_DIR[fromPort];
  const d2 = PORT_DIR[toPort];
  const cp1x = p1.x + d1[0] * offset, cp1y = p1.y + d1[1] * offset;
  const cp2x = p2.x + d2[0] * offset, cp2y = p2.y + d2[1] * offset;
  const t = 0.5, mt = 0.5;
  return {
    x: mt * mt * mt * p1.x + 3 * mt * mt * t * cp1x + 3 * mt * t * t * cp2x + t * t * t * p2.x,
    y: mt * mt * mt * p1.y + 3 * mt * mt * t * cp1y + 3 * mt * t * t * cp2y + t * t * t * p2.y,
  };
}

// ─── Connection Color Themes ────────────────────────────────────────────────

const CONN_COLORS: Record<string, { default: string; hover: string; selected: string; dot: string }> = {
  purple:  { default: 'rgba(139,92,246,0.5)',  hover: 'rgba(168,85,247,0.8)',  selected: '#a855f7', dot: '#a855f7' },
  blue:    { default: 'rgba(59,130,246,0.5)',  hover: 'rgba(96,165,250,0.8)',  selected: '#3b82f6', dot: '#3b82f6' },
  mono:    { default: 'rgba(156,163,175,0.5)', hover: 'rgba(107,114,128,0.8)', selected: '#6b7280', dot: '#9ca3af' },
  neon:    { default: 'rgba(34,211,238,0.5)',  hover: 'rgba(6,182,212,0.8)',   selected: '#06b6d4', dot: '#22d3ee' },
  pastel:  { default: 'rgba(196,181,253,0.5)', hover: 'rgba(167,139,250,0.8)', selected: '#a78bfa', dot: '#c4b5fd' },
  emerald: { default: 'rgba(16,185,129,0.5)',  hover: 'rgba(52,211,153,0.8)',  selected: '#10b981', dot: '#34d399' },
  sunset:  { default: 'rgba(249,115,22,0.5)',  hover: 'rgba(251,146,60,0.8)',  selected: '#f97316', dot: '#fb923c' },
  rose:    { default: 'rgba(244,63,94,0.5)',   hover: 'rgba(251,113,133,0.8)', selected: '#f43f5e', dot: '#fb7185' },
};

const STROKE_DASH: Record<string, string | undefined> = {
  solid: undefined,
  dashed: '8,4',
  dotted: '2,4',
};

// ─── Equal-Spacing Detection ────────────────────────────────────────────────

interface CanvasItem { id: string; x: number; y: number; w: number; h: number }
type EqGuide = { axis: 'x' | 'y'; segA: { from: number; to: number; cross: number }; segB: { from: number; to: number; cross: number }; dist: number };

function detectEqualSpacing(
  items: CanvasItem[], dragId: string,
  dx: number, dy: number, dw: number, dh: number,
  threshold: number,
): { snapX: number | null; snapY: number | null; guides: EqGuide[] } {
  const others = items.filter(it => it.id !== dragId);
  const guides: EqGuide[] = [];
  let snapX: number | null = null;
  let snapY: number | null = null;

  // ── X-axis: find left & right neighbors in same horizontal band ──
  const dragT = dy, dragB = dy + dh, dragCY = dy + dh / 2;
  const hNeighbors = others.filter(o => o.y + o.h > dragT - dh * 0.5 && o.y < dragB + dh * 0.5);
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

  // ── Y-axis: find top & bottom neighbors in same vertical band ──
  const dragL = dx, dragR = dx + dw, dragCX = dx + dw / 2;
  const vNeighbors = others.filter(o => o.x + o.w > dragL - dw * 0.5 && o.x < dragR + dw * 0.5);
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

// ─── Undo/Redo History ───────────────────────────────────────────────────────

interface CanvasSnapshot {
  nodes: SystemNode[];
  connections: NodeConnection[];
  groups: CanvasGroup[];
  stickyNotes: StickyNote[];
  stickyConnections?: Array<{ stickyId: string; nodeId: string }>;
}

// ─── Palette Templates (shared) ──────────────────────────────────────────────
import { PALETTE_ITEMS } from '@/data/paletteItems';
import type { PaletteItem } from '@/data/paletteItems';

// ─── Main Component ──────────────────────────────────────────────────────────

interface WorkflowCanvasProps {
  onSave?: (system: AutomationSystem) => void;
  onExecute?: () => void;
  initialSystem?: AutomationSystem;
  readOnly?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** External node execution states from useWorkflowExecution hook */
  nodeStates?: Map<string, NodeExecutionStatus>;
}

export default function WorkflowCanvas({ onSave, onExecute, initialSystem, readOnly, className, style, nodeStates: externalNodeStates }: WorkflowCanvasProps) {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const viewportRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // ─── State ──────────────────────────────────────────────────────────────────

  const [nodes, setNodes] = useState<SystemNode[]>(initialSystem?.nodes || []);
  const [connections, setConnections] = useState<NodeConnection[]>(initialSystem?.connections || []);
  const [groups, setGroups] = useState<CanvasGroup[]>(initialSystem?.groups || []);
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>(initialSystem?.stickyNotes || []);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedConnId, setSelectedConnId] = useState<number | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  // #22 – Multi-select
  const [multiSelectedIds, setMultiSelectedIds] = useState<Set<string>>(new Set());

  const [dragState, setDragState] = useState<{ nodeId: string; offsetX: number; offsetY: number } | null>(null);
  const [dragGroupState, setDragGroupState] = useState<{ groupId: string; offsetX: number; offsetY: number } | null>(null);
  const [resizeState, setResizeState] = useState<{ groupId: string; startX: number; startY: number; startW: number; startH: number } | null>(null);
  const [connectState, setConnectState] = useState<{ fromId: string; fromPort: PortDirection; canvasX: number; canvasY: number } | null>(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 40, y: 40 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panStartMouse, setPanStartMouse] = useState({ x: 0, y: 0 }); // #31 threshold
  const [panThresholdMet, setPanThresholdMet] = useState(false);
  const [spaceHeld, setSpaceHeld] = useState(false);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(!readOnly && !initialSystem);
  const [paletteTab, setPaletteTab] = useState<'generic' | 'tools' | 'groups'>('generic');
  const [paletteSearch, setPaletteSearch] = useState('');
  const [scrollSpeed, setScrollSpeed] = useState(3); // 1-5, default 3
  const [phaseDropdownOpen, setPhaseDropdownOpen] = useState(false);
  const [showCanvasSettings, setShowCanvasSettings] = useState(false);
  const groupTransparency = 0;   // fully visible (slider removed)
  const nodeTransparency = 0;    // fully visible (slider removed)
  const [phaseZoomAuto, setPhaseZoomAuto] = useState(true);  // true=auto-fit, false=fixed zoom
  const [phaseZoomLevel, setPhaseZoomLevel] = useState(70); // 10-100, percentage of auto-fit zoom (used when auto=false)
  const [phaseAnimated, setPhaseAnimated] = useState(true); // smooth scroll vs instant jump
  const [phaseAnimSpeed, setPhaseAnimSpeed] = useState(500); // animation duration ms (200-1500)

  // Connection line styles
  const [connLineStyle, setConnLineStyle] = useState<'solid' | 'dashed' | 'dotted'>('solid');
  const [connArrowHead, setConnArrowHead] = useState<'none' | 'arrow' | 'diamond' | 'circle'>('arrow');
  const [connColorTheme, setConnColorTheme] = useState<string>('purple');
  const [connCurveStyle, setConnCurveStyle] = useState<'bezier' | 'straight' | 'elbow'>('bezier');
  const [connGlow, setConnGlow] = useState(false);
  const [connStrokeWidth, setConnStrokeWidth] = useState<1 | 2 | 3>(2);

  // Node design themes
  type NodeDesignTheme = 'default' | 'glass' | 'minimal' | 'outlined' | 'neon' | 'gradient' | 'solid' | 'wire';
  const [nodeDesignTheme, setNodeDesignTheme] = useState<NodeDesignTheme>('default');
  type NodeLayout = 'standard' | 'centered' | 'compact' | 'icon-focus';
  const [nodeLayout, setNodeLayout] = useState<NodeLayout>('standard');

  // Presentation mode
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [presBarVisible, setPresBarVisible] = useState(true);
  const [presEditEnabled, setPresEditEnabled] = useState(false);

  // Auto-fade presentation bar after 3 seconds
  useEffect(() => {
    if (isPresentationMode) {
      setPresBarVisible(true);
      const timer = setTimeout(() => setPresBarVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isPresentationMode]);

  const [editNode, setEditNode] = useState<string | null>(null);
  const [insertPopover, setInsertPopover] = useState<{ connIdx: number; x: number; y: number } | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editLinkedResource, setEditLinkedResource] = useState<string>('');
  const [editLinkedResourceId, setEditLinkedResourceId] = useState<string>('');
  const [editLinkedPage, setEditLinkedPage] = useState<string>('');
  const [editGroupId, setEditGroupId] = useState<string | null>(null);
  const [editGroupLabel, setEditGroupLabel] = useState('');
  const [editGroupDesc, setEditGroupDesc] = useState('');

  const [systemName, setSystemName] = useState(initialSystem?.name || '');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Sync state when switching between systems (initialSystem changes)
  const prevSystemIdRef = useRef(initialSystem?.id);
  useEffect(() => {
    if (initialSystem && initialSystem.id !== prevSystemIdRef.current) {
      prevSystemIdRef.current = initialSystem.id;
      setNodes(initialSystem.nodes || []);
      setConnections(initialSystem.connections || []);
      setGroups(initialSystem.groups || []);
      setStickyNotes(initialSystem.stickyNotes || []);
      setSystemName(initialSystem.name || '');
      setSelectedNodeId(null);
      setSelectedConnId(null);
      setSelectedGroupId(null);
      setMultiSelectedIds(new Set());
      setSaveState('idle');
      // Restore saved zoom/pan if available
      if (initialSystem.canvasZoom != null) setZoom(initialSystem.canvasZoom);
      if (initialSystem.canvasPan) setPan(initialSystem.canvasPan);
      // Reset last-saved snapshot for discard tracking
      lastSavedStateRef.current = {
        nodes: initialSystem.nodes || [],
        connections: initialSystem.connections || [],
        groups: initialSystem.groups || [],
        stickyNotes: initialSystem.stickyNotes || [],
      };
      setHasUnsavedChanges(false);
    }
  }, [initialSystem]);

  // #13 – Snap toggle
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [snapLines, setSnapLines] = useState<{ x: number[]; y: number[] }>({ x: [], y: [] });
  const [equalSpacingGuides, setEqualSpacingGuides] = useState<{ axis: 'x' | 'y'; segA: { from: number; to: number; cross: number }; segB: { from: number; to: number; cross: number }; dist: number }[]>([]);

  // Execution animation (internal fallback)
  const [isExecuting, setIsExecuting] = useState(false);
  const [executingNodes, setExecutingNodes] = useState<Set<string>>(new Set());
  const [executionDone, setExecutionDone] = useState(false);
  // #3 – refs for timeout cleanup
  const executionTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const handleSaveRef = useRef<(() => void) | null>(null);

  // Clipboard for copy/paste
  const [clipboard, setClipboard] = useState<{ nodes: SystemNode[]; connections: NodeConnection[] } | null>(null);

  // Rubber-band selection box
  const [selectionBox, setSelectionBox] = useState<{ startX: number; startY: number; currentX: number; currentY: number } | null>(null);

  // Derived execution state: prefer external event-system states when available
  const externalRunning = useMemo(() => {
    if (!externalNodeStates || externalNodeStates.size === 0) return false;
    return Array.from(externalNodeStates.values()).some(s => s === 'pending' || s === 'running');
  }, [externalNodeStates]);
  const externalDone = useMemo(() => {
    if (!externalNodeStates || externalNodeStates.size === 0) return false;
    const vals = Array.from(externalNodeStates.values());
    return vals.length > 0 && vals.every(s => s === 'completed' || s === 'failed');
  }, [externalNodeStates]);
  const effectiveIsExecuting = externalNodeStates ? externalRunning : isExecuting;
  const effectiveExecutionDone = externalNodeStates ? externalDone : executionDone;

  // #18 – Duplicate connection toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // #23 – Node search
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // #24 – Keyboard shortcuts overlay
  const [showShortcuts, setShowShortcuts] = useState(false);

  // #21 – Context menu
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId?: string; groupId?: string; connIdx?: number; stickyId?: string; canvasPos?: { x: number; y: number } } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'node' | 'nodes' | 'connection' | 'group' | 'sticky'; ids?: string[]; connIdx?: number } | null>(null);

  // #10 – Connection hover
  const [hoveredConnId, setHoveredConnId] = useState<number | null>(null);
  // Connection label editing
  const [editingConnLabel, setEditingConnLabel] = useState<{ connIdx: number; label: string } | null>(null);
  // Node hover (for showing ports)
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // #6 – Icon picker
  const [editIcon, setEditIcon] = useState('');
  const [showIconPicker, setShowIconPicker] = useState(false);

  // Sticky notes
  const [selectedStickyId, setSelectedStickyId] = useState<string | null>(null);
  const [dragStickyState, setDragStickyState] = useState<{ stickyId: string; offsetX: number; offsetY: number } | null>(null);
  const [resizeStickyState, setResizeStickyState] = useState<{ stickyId: string; startX: number; startY: number; startW: number; startH: number } | null>(null);
  const [editStickyId, setEditStickyId] = useState<string | null>(null);
  const [editStickyText, setEditStickyText] = useState('');
  const [editStickyColor, setEditStickyColor] = useState<StickyNoteColor>('yellow');
  const [editStickyBold, setEditStickyBold] = useState(false);
  const [editStickyItalic, setEditStickyItalic] = useState(false);
  const [editStickyTextColor, setEditStickyTextColor] = useState('');
  const [editStickyFontSize, setEditStickyFontSize] = useState(12);

  // ─── Sticky-to-Node Connections (#40) ─────────────────────────────────────
  const [stickyConnections, setStickyConnections] = useState<Array<{ stickyId: string; nodeId: string }>>([]);
  const [connectingStickyId, setConnectingStickyId] = useState<string | null>(null);
  const [stickyConnMousePos, setStickyConnMousePos] = useState<{ x: number; y: number } | null>(null);

  // ─── Touch state for pinch-to-zoom & touch interactions ──────────────────
  const touchStateRef = useRef<{
    lastDistance: number;
    lastCenter: { x: number; y: number };
    isTouchPanning: boolean;
    touchNodeId: string | null;
    touchNodeOffset: { x: number; y: number };
  }>({
    lastDistance: 0,
    lastCenter: { x: 0, y: 0 },
    isTouchPanning: false,
    touchNodeId: null,
    touchNodeOffset: { x: 0, y: 0 },
  });

  // Drag & drop from palette
  const [isDragOver, setIsDragOver] = useState(false);

  // #15 – Undo/Redo (ref-based to avoid fighting with React state)
  const undoStackRef = useRef<CanvasSnapshot[]>([]);
  const redoStackRef = useRef<CanvasSnapshot[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // ── Discard changes: track last saved state ──
  const lastSavedStateRef = useRef<CanvasSnapshot>({
    nodes: initialSystem?.nodes || [],
    connections: initialSystem?.connections || [],
    groups: initialSystem?.groups || [],
    stickyNotes: initialSystem?.stickyNotes || [],
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const pushHistory = useCallback(() => {
    undoStackRef.current = [...undoStackRef.current.slice(-40), { nodes, connections, groups, stickyNotes, stickyConnections }];
    redoStackRef.current = [];
    setCanUndo(true);
    setCanRedo(false);
  }, [nodes, connections, groups, stickyNotes, stickyConnections]);

  const historyUndo = useCallback(() => {
    if (undoStackRef.current.length === 0) return;
    const prev = undoStackRef.current[undoStackRef.current.length - 1];
    undoStackRef.current = undoStackRef.current.slice(0, -1);
    redoStackRef.current = [{ nodes, connections, groups, stickyNotes, stickyConnections }, ...redoStackRef.current];
    setNodes(prev.nodes);
    setConnections(prev.connections);
    setGroups(prev.groups);
    setStickyNotes(prev.stickyNotes);
    setStickyConnections(prev.stickyConnections || []);
    setCanUndo(undoStackRef.current.length > 0);
    setCanRedo(true);
  }, [nodes, connections, groups, stickyNotes, stickyConnections]);

  const historyRedo = useCallback(() => {
    if (redoStackRef.current.length === 0) return;
    const next = redoStackRef.current[0];
    redoStackRef.current = redoStackRef.current.slice(1);
    undoStackRef.current = [...undoStackRef.current, { nodes, connections, groups, stickyNotes, stickyConnections }];
    setNodes(next.nodes);
    setConnections(next.connections);
    setGroups(next.groups);
    setStickyNotes(next.stickyNotes);
    setStickyConnections(next.stickyConnections || []);
    setCanUndo(true);
    setCanRedo(redoStackRef.current.length > 0);
  }, [nodes, connections, groups, stickyNotes, stickyConnections]);

  // ── Track unsaved changes by comparing to lastSavedState ──
  useEffect(() => {
    const saved = lastSavedStateRef.current;
    const changed = JSON.stringify({ nodes, connections, groups, stickyNotes, stickyConnections }) !== JSON.stringify({ nodes: saved.nodes, connections: saved.connections, groups: saved.groups, stickyNotes: saved.stickyNotes, stickyConnections: saved.stickyConnections || [] });
    setHasUnsavedChanges(changed);
  }, [nodes, connections, groups, stickyNotes, stickyConnections]);

  // Refs for wheel handler (avoid stale closures)
  const zoomRef = useRef(zoom);
  const panRef = useRef(pan);
  const scrollSpeedRef = useRef(scrollSpeed);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);
  useEffect(() => { panRef.current = pan; }, [pan]);
  useEffect(() => { scrollSpeedRef.current = scrollSpeed; }, [scrollSpeed]);

  // Auto-fit on initial load when viewing existing system
  // Double-rAF ensures the container is fully laid out before measuring
  useEffect(() => {
    if (initialSystem && initialSystem.nodes.length > 0) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => fitToScreen());
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // #3 – Cleanup execution timeouts on unmount
  useEffect(() => {
    return () => {
      executionTimeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  // Toast auto-hide
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), 2500);
  }, []);

  // ─── Helpers ────────────────────────────────────────────────────────────────

  const screenToCanvas = useCallback((clientX: number, clientY: number) => {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (clientX - rect.left - pan.x) / zoom,
      y: (clientY - rect.top - pan.y) / zoom,
    };
  }, [zoom, pan]);

  const canvasW = useMemo(() => {
    const items = [
      ...nodes.map(n => n.x + NODE_W + 200),
      ...groups.map(g => g.x + g.width + 200),
      ...stickyNotes.map(s => s.x + s.width + 200),
      2000,
    ];
    return Math.max(...items);
  }, [nodes, groups, stickyNotes]);

  const canvasH = useMemo(() => {
    const items = [
      ...nodes.map(n => n.y + NODE_H + 200),
      ...groups.map(g => g.y + g.height + 200),
      ...stickyNotes.map(s => s.y + s.height + 200),
      1200,
    ];
    return Math.max(...items);
  }, [nodes, groups, stickyNotes]);

  const fitToScreen = useCallback(() => {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;
    if (nodes.length === 0 && groups.length === 0 && stickyNotes.length === 0) {
      setZoom(1);
      setPan({ x: 40, y: 40 });
      return;
    }

    const items = [
      ...nodes.map(n => ({ l: n.x, t: n.y, r: n.x + NODE_W, b: n.y + NODE_H })),
      ...groups.map(g => ({ l: g.x, t: g.y, r: g.x + g.width, b: g.y + g.height })),
      ...stickyNotes.map(s => ({ l: s.x, t: s.y, r: s.x + s.width, b: s.y + s.height })),
    ];

    const minX = Math.min(...items.map(i => i.l)) - 40;
    const minY = Math.min(...items.map(i => i.t)) - 40;
    const maxX = Math.max(...items.map(i => i.r)) + 40;
    const maxY = Math.max(...items.map(i => i.b)) + 40;

    const contentW = maxX - minX;
    const contentH = maxY - minY;

    const scaleX = rect.width / contentW;
    const scaleY = rect.height / contentH;
    const newZoom = Math.min(scaleX, scaleY, 2);

    setZoom(newZoom);
    setPan({
      x: (rect.width - contentW * newZoom) / 2 - minX * newZoom,
      y: (rect.height - contentH * newZoom) / 2 - minY * newZoom,
    });
  }, [nodes, groups, stickyNotes]);

  // #23 – search filtered nodes
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return nodes.filter(n => n.label.toLowerCase().includes(q) || n.description.toLowerCase().includes(q));
  }, [searchQuery, nodes]);

  const focusNode = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;
    const targetZoom = Math.max(zoom, 0.8);
    setZoom(targetZoom);
    setPan({
      x: rect.width / 2 - (node.x + NODE_W / 2) * targetZoom,
      y: rect.height / 2 - (node.y + NODE_H / 2) * targetZoom,
    });
    setSelectedNodeId(nodeId);
    setSearchOpen(false);
    setSearchQuery('');
  }, [nodes, zoom]);

  // ─── Phase Navigator helpers ────────────────────────────────────────────────

  // Groups sorted left-to-right by x position for phase navigation
  const sortedGroups = useMemo(() =>
    [...groups].sort((a, b) => a.x - b.x || a.y - b.y),
  [groups]);

  // Determine which group is currently closest to viewport center
  const currentPhaseIndex = useMemo(() => {
    if (sortedGroups.length === 0) return -1;
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    const viewCenterX = (rect.width / 2 - pan.x) / zoom;
    const viewCenterY = (rect.height / 2 - pan.y) / zoom;
    let bestIdx = 0;
    let bestDist = Infinity;
    sortedGroups.forEach((g, i) => {
      const gCx = g.x + g.width / 2;
      const gCy = g.y + g.height / 2;
      const d = Math.hypot(gCx - viewCenterX, gCy - viewCenterY);
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    });
    return bestIdx;
  }, [sortedGroups, pan, zoom]);

  const phaseAnimRef = useRef<number>(0);

  const focusGroup = useCallback((groupIndex: number) => {
    const group = sortedGroups[groupIndex];
    if (!group) return;
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;
    const gCx = group.x + group.width / 2;
    const gCy = group.y + group.height / 2;
    // Auto-fit: zoom to show entire group with generous padding
    const padded = 120;
    const scaleX = rect.width / (group.width + padded);
    const scaleY = rect.height / (group.height + padded);
    const autoFitZoom = Math.min(scaleX, scaleY, 1.5);
    // Auto: use computed auto-fit zoom. Manual: scale by phaseZoomLevel
    const targetZoom = phaseZoomAuto ? autoFitZoom : autoFitZoom * (phaseZoomLevel / 100);
    const targetPan = {
      x: rect.width / 2 - gCx * targetZoom,
      y: rect.height / 2 - gCy * targetZoom,
    };

    if (!phaseAnimated) {
      // Instant jump
      setZoom(targetZoom);
      setPan(targetPan);
    } else {
      // Smooth animation
      cancelAnimationFrame(phaseAnimRef.current);
      const startZoom = zoom;
      const startPan = { ...pan };
      const duration = phaseAnimSpeed;
      const startTime = performance.now();

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const ease = 1 - Math.pow(1 - t, 3);
        setZoom(startZoom + (targetZoom - startZoom) * ease);
        setPan({
          x: startPan.x + (targetPan.x - startPan.x) * ease,
          y: startPan.y + (targetPan.y - startPan.y) * ease,
        });
        if (t < 1) phaseAnimRef.current = requestAnimationFrame(animate);
      };
      phaseAnimRef.current = requestAnimationFrame(animate);
    }
    setPhaseDropdownOpen(false);
  }, [sortedGroups, phaseZoomAuto, phaseZoomLevel, phaseAnimated, phaseAnimSpeed, zoom, pan]);

  // ─── Wheel Zoom ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const currentZoom = zoomRef.current;
      const currentPan = panRef.current;

      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const speedMultiplier = scrollSpeedRef.current / 3; // 1→0.33x, 3→1x, 5→1.67x
      const delta = -e.deltaY * 0.003 * speedMultiplier;
      const newZoom = Math.min(Math.max(currentZoom * (1 + delta), 0.1), 5);
      const ratio = newZoom / currentZoom;

      setZoom(newZoom);
      setPan({
        x: mouseX - (mouseX - currentPan.x) * ratio,
        y: mouseY - (mouseY - currentPan.y) * ratio,
      });
    };

    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  // ─── Keyboard ───────────────────────────────────────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !editNode && !editGroupId && !searchOpen) {
        e.preventDefault();
        setSpaceHeld(true);
      }

      if (e.key === 'Escape') {
        if (isPresentationMode) { setIsPresentationMode(false); setIsFullscreen(false); return; }
        if (contextMenu) { setContextMenu(null); return; }
        if (searchOpen) { setSearchOpen(false); setSearchQuery(''); return; }
        if (showShortcuts) { setShowShortcuts(false); return; }
        if (connectingStickyId) { setConnectingStickyId(null); setStickyConnMousePos(null); return; }
        if (connectState) { setConnectState(null); return; }
        // #6 – reset icon picker
        if (editNode) { setEditNode(null); setShowIconPicker(false); return; }
        if (editGroupId) { setEditGroupId(null); return; }
        if (editStickyId) { setEditStickyId(null); return; }
        if (editingConnLabel) { setEditingConnLabel(null); return; }
        // #7 – clear snap lines
        setSnapLines({ x: [], y: [] });
        setEqualSpacingGuides([]);
        if (multiSelectedIds.size > 0) { setMultiSelectedIds(new Set()); return; }
        if (isFullscreen) setIsFullscreen(false);
      }

      // #15 – Undo/Redo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey && !editNode && !editGroupId) {
        e.preventDefault();
        historyUndo();
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey)) && !editNode && !editGroupId) {
        e.preventDefault();
        historyRedo();
      }

      // Copy (Ctrl+C)
      if ((e.metaKey || e.ctrlKey) && e.key === 'c' && !editNode && !editGroupId && !editStickyId && !readOnly) {
        const ids = multiSelectedIds.size > 0 ? multiSelectedIds : (selectedNodeId ? new Set([selectedNodeId]) : new Set<string>());
        if (ids.size > 0) {
          e.preventDefault();
          const copiedNodes = nodes.filter(n => ids.has(n.id));
          const copiedConns = connections.filter(c => ids.has(c.from) && ids.has(c.to));
          setClipboard({ nodes: copiedNodes, connections: copiedConns });
          showToast(lang === 'en' ? `${copiedNodes.length} node(s) copied` : `${copiedNodes.length} Node(s) kopiert`);
        }
      }

      // Paste (Ctrl+V)
      if ((e.metaKey || e.ctrlKey) && e.key === 'v' && !editNode && !editGroupId && !editStickyId && !readOnly && clipboard) {
        e.preventDefault();
        pushHistory();
        const idMap = new Map<string, string>();
        const newNodes: SystemNode[] = clipboard.nodes.map(n => {
          const newId = `node-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          idMap.set(n.id, newId);
          return { ...n, id: newId, x: n.x + 40, y: n.y + 40 };
        });
        const newConns = clipboard.connections
          .filter(c => idMap.has(c.from) && idMap.has(c.to))
          .map(c => ({ ...c, from: idMap.get(c.from)!, to: idMap.get(c.to)! }));
        setNodes(prev => [...prev, ...newNodes]);
        setConnections(prev => [...prev, ...newConns]);
        setMultiSelectedIds(new Set(newNodes.map(n => n.id)));
        setSelectedNodeId(null);
        // Update clipboard offset for subsequent pastes
        setClipboard({ nodes: newNodes, connections: newConns });
        showToast(lang === 'en' ? `${newNodes.length} node(s) pasted` : `${newNodes.length} Node(s) eingefügt`);
      }

      // #23 – Search shortcut
      if ((e.metaKey || e.ctrlKey) && e.key === 'f' && !readOnly) {
        e.preventDefault();
        setSearchOpen(true);
      }

      // #24 – Shortcuts help
      if (e.key === '?' && !editNode && !editGroupId && !searchOpen) {
        setShowShortcuts(prev => !prev);
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && !editNode && !editGroupId && !editStickyId && !readOnly && !searchOpen) {
        // Direct delete with undo support (no confirmation dialog)
        if (multiSelectedIds.size > 0) {
          pushHistory();
          const idSet = new Set(multiSelectedIds);
          setNodes(prev => prev.filter(n => !idSet.has(n.id)));
          setConnections(prev => prev.filter(c => !idSet.has(c.from) && !idSet.has(c.to)));
          setStickyConnections(prev => prev.filter(sc => !idSet.has(sc.nodeId)));
          setMultiSelectedIds(new Set());
          return;
        }
        if (selectedNodeId) {
          pushHistory();
          setNodes(prev => prev.filter(n => n.id !== selectedNodeId));
          setConnections(prev => prev.filter(c => c.from !== selectedNodeId && c.to !== selectedNodeId));
          setStickyConnections(prev => prev.filter(sc => sc.nodeId !== selectedNodeId));
          setSelectedNodeId(null);
          return;
        }
        if (selectedConnId !== null) {
          pushHistory();
          setConnections(prev => prev.filter((_, i) => i !== selectedConnId));
          setSelectedConnId(null);
          return;
        }
        if (selectedGroupId) {
          pushHistory();
          setGroups(prev => prev.filter(g => g.id !== selectedGroupId));
          setSelectedGroupId(null);
          return;
        }
        if (selectedStickyId) {
          pushHistory();
          setStickyNotes(prev => prev.filter(s => s.id !== selectedStickyId));
          setStickyConnections(prev => prev.filter(sc => sc.stickyId !== selectedStickyId));
          setSelectedStickyId(null);
          return;
        }
      }

      // Select All (Ctrl+A)
      if ((e.metaKey || e.ctrlKey) && e.key === 'a' && !editNode && !editGroupId && !editStickyId && !readOnly) {
        e.preventDefault();
        setMultiSelectedIds(new Set(nodes.map(n => n.id)));
        setSelectedNodeId(null);
      }

      // Save (Ctrl+S) — uses ref to avoid block-scoped order issue
      if ((e.metaKey || e.ctrlKey) && e.key === 's' && !readOnly) {
        e.preventDefault();
        handleSaveRef.current?.();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') setSpaceHeld(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedNodeId, selectedConnId, selectedGroupId, selectedStickyId, editNode, editGroupId, editStickyId, editingConnLabel, connectState, connectingStickyId, isFullscreen, readOnly, multiSelectedIds, contextMenu, searchOpen, showShortcuts, historyUndo, historyRedo, pushHistory, clipboard, nodes, connections, groups, stickyNotes, lang]);

  // ─── Viewport Mouse Handlers ───────────────────────────────────────────────

  const handleViewportMouseDown = useCallback((e: React.MouseEvent) => {
    // Close context menu / popover on click
    if (contextMenu) { setContextMenu(null); return; }
    if (insertPopover) { setInsertPopover(null); return; }

    // Middle mouse or space+click: always pan
    if (e.button === 1 || (e.button === 0 && spaceHeld)) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      setPanStartMouse({ x: e.clientX, y: e.clientY });
      setPanThresholdMet(true); // Space/middle always immediate
      return;
    }
    // Left-click on empty canvas area: start selection box + deselect
    if (e.button === 0) {
      const target = e.target as HTMLElement;
      const isEmptyArea = target === viewportRef.current || target.classList.contains('canvas-inner');
      if (isEmptyArea) {
        // Auto-close edit panels on canvas click
        if (editNode) { setEditNode(null); setShowIconPicker(false); }
        if (editGroupId) setEditGroupId(null);
        if (editStickyId) setEditStickyId(null);
        if (connectState) setConnectState(null);
        if (connectingStickyId) { setConnectingStickyId(null); setStickyConnMousePos(null); }
        // Start selection box (rubber-band)
        const canvasPos = screenToCanvas(e.clientX, e.clientY);
        setSelectionBox({ startX: canvasPos.x, startY: canvasPos.y, currentX: canvasPos.x, currentY: canvasPos.y });
        if (!e.shiftKey) {
          setSelectedNodeId(null);
          setSelectedConnId(null);
          setSelectedGroupId(null);
          setMultiSelectedIds(new Set());
        }
      }
    }
  }, [spaceHeld, pan, connectState, contextMenu, editNode, editGroupId, editStickyId, screenToCanvas]);

  const handleViewportMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      // #31 – Check threshold before actually panning
      if (!panThresholdMet) {
        const dx = Math.abs(e.clientX - panStartMouse.x);
        const dy = Math.abs(e.clientY - panStartMouse.y);
        if (dx < PAN_DRAG_THRESHOLD && dy < PAN_DRAG_THRESHOLD) return;
        setPanThresholdMet(true);
      }
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      return;
    }

    // Rubber-band selection box update
    if (selectionBox) {
      const canvasPos2 = screenToCanvas(e.clientX, e.clientY);
      setSelectionBox(prev => prev ? { ...prev, currentX: canvasPos2.x, currentY: canvasPos2.y } : null);
      return;
    }

    const canvasPos = screenToCanvas(e.clientX, e.clientY);

    if (dragState) {
      const rawX = canvasPos.x - dragState.offsetX;
      const rawY = canvasPos.y - dragState.offsetY;

      let sx = rawX;
      let sy = rawY;

      // #13/#14 – Snap only when enabled; early-exit if snap disabled
      if (snapEnabled) {
        const otherNodes = nodes.filter(n => n.id !== dragState.nodeId);
        const gx: number[] = [];
        const gy: number[] = [];

        const dragCX = rawX + NODE_W / 2;
        const dragCY = rawY + NODE_H / 2;
        const dragR = rawX + NODE_W;
        const dragB = rawY + NODE_H;

        // #14 – Performance: only check nodes within reasonable distance
        for (const o of otherNodes) {
          const distX = Math.abs(rawX - o.x);
          const distY = Math.abs(rawY - o.y);
          if (distX > NODE_W * 3 && distY > NODE_H * 5) continue;

          const oCX = o.x + NODE_W / 2;
          const oCY = o.y + NODE_H / 2;
          const oR = o.x + NODE_W;
          const oB = o.y + NODE_H;

          if (Math.abs(rawX - o.x) < SNAP_THRESHOLD) { sx = o.x; gx.push(o.x); }
          else if (Math.abs(dragR - oR) < SNAP_THRESHOLD) { sx = oR - NODE_W; gx.push(oR); }
          else if (Math.abs(dragCX - oCX) < SNAP_THRESHOLD) { sx = oCX - NODE_W / 2; gx.push(oCX); }
          else if (Math.abs(rawX - oR) < SNAP_THRESHOLD) { sx = oR; gx.push(oR); }
          else if (Math.abs(dragR - o.x) < SNAP_THRESHOLD) { sx = o.x - NODE_W; gx.push(o.x); }

          if (Math.abs(rawY - o.y) < SNAP_THRESHOLD) { sy = o.y; gy.push(o.y); }
          else if (Math.abs(dragB - oB) < SNAP_THRESHOLD) { sy = oB - NODE_H; gy.push(oB); }
          else if (Math.abs(dragCY - oCY) < SNAP_THRESHOLD) { sy = oCY - NODE_H / 2; gy.push(oCY); }
          else if (Math.abs(rawY - oB) < SNAP_THRESHOLD) { sy = oB; gy.push(oB); }
          else if (Math.abs(dragB - o.y) < SNAP_THRESHOLD) { sy = o.y - NODE_H; gy.push(o.y); }
        }

        for (const g of groups) {
          const gCX = g.x + g.width / 2;
          const gCY = g.y + g.height / 2;
          if (Math.abs(dragCX - gCX) < SNAP_THRESHOLD) { sx = gCX - NODE_W / 2; gx.push(gCX); }
          if (Math.abs(dragCY - gCY) < SNAP_THRESHOLD) { sy = gCY - NODE_H / 2; gy.push(gCY); }
        }

        // Equal-spacing detection for nodes
        const allItemsNode: CanvasItem[] = [
          ...nodes.map(n => ({ id: n.id, x: n.id === dragState.nodeId ? sx : n.x, y: n.id === dragState.nodeId ? sy : n.y, w: NODE_W, h: NODE_H })),
          ...stickyNotes.map(s => ({ id: s.id, x: s.x, y: s.y, w: s.width, h: s.height })),
        ];
        const { snapX: eqNX, snapY: eqNY, guides: eqNodeGuides } = detectEqualSpacing(allItemsNode, dragState.nodeId, sx, sy, NODE_W, NODE_H, SNAP_THRESHOLD);
        if (eqNX !== null) sx = eqNX;
        if (eqNY !== null) sy = eqNY;
        setEqualSpacingGuides(eqNodeGuides);

        setSnapLines({ x: [...new Set(gx)], y: [...new Set(gy)] });
      } else {
        setEqualSpacingGuides([]);
      }

      setNodes(prev => prev.map(n =>
        n.id === dragState.nodeId ? { ...n, x: sx, y: sy } : n
      ));
    }

    if (dragGroupState) {
      setGroups(prev => prev.map(g =>
        g.id === dragGroupState.groupId
          ? { ...g, x: canvasPos.x - dragGroupState.offsetX, y: canvasPos.y - dragGroupState.offsetY }
          : g
      ));
    }

    if (resizeState) {
      const dw = canvasPos.x - resizeState.startX;
      const dh = canvasPos.y - resizeState.startY;
      // #8 – Group resize bounds
      setGroups(prev => prev.map(g =>
        g.id === resizeState.groupId
          ? {
              ...g,
              width: Math.min(MAX_GROUP_W, Math.max(120, resizeState.startW + dw)),
              height: Math.min(MAX_GROUP_H, Math.max(60, resizeState.startH + dh)),
            }
          : g
      ));
    }

    if (dragStickyState) {
      const draggedSticky = stickyNotes.find(s => s.id === dragStickyState.stickyId);
      if (draggedSticky) {
        const rawX = canvasPos.x - dragStickyState.offsetX;
        const rawY = canvasPos.y - dragStickyState.offsetY;
        let sx = rawX, sy = rawY;
        const sW = draggedSticky.width, sH = draggedSticky.height;

        if (snapEnabled) {
          const gx: number[] = [], gy: number[] = [];
          const dragCX = rawX + sW / 2, dragCY = rawY + sH / 2;
          const dragR = rawX + sW, dragB = rawY + sH;

          // Snap against other sticky notes
          for (const o of stickyNotes) {
            if (o.id === dragStickyState.stickyId) continue;
            const oCX = o.x + o.width / 2, oCY = o.y + o.height / 2;
            const oR = o.x + o.width, oB = o.y + o.height;
            if (Math.abs(rawX - o.x) < SNAP_THRESHOLD) { sx = o.x; gx.push(o.x); }
            else if (Math.abs(dragR - oR) < SNAP_THRESHOLD) { sx = oR - sW; gx.push(oR); }
            else if (Math.abs(dragCX - oCX) < SNAP_THRESHOLD) { sx = oCX - sW / 2; gx.push(oCX); }
            else if (Math.abs(rawX - oR) < SNAP_THRESHOLD) { sx = oR; gx.push(oR); }
            else if (Math.abs(dragR - o.x) < SNAP_THRESHOLD) { sx = o.x - sW; gx.push(o.x); }
            if (Math.abs(rawY - o.y) < SNAP_THRESHOLD) { sy = o.y; gy.push(o.y); }
            else if (Math.abs(dragB - oB) < SNAP_THRESHOLD) { sy = oB - sH; gy.push(oB); }
            else if (Math.abs(dragCY - oCY) < SNAP_THRESHOLD) { sy = oCY - sH / 2; gy.push(oCY); }
            else if (Math.abs(rawY - oB) < SNAP_THRESHOLD) { sy = oB; gy.push(oB); }
            else if (Math.abs(dragB - o.y) < SNAP_THRESHOLD) { sy = o.y - sH; gy.push(o.y); }
          }
          // Snap against nodes
          for (const n of nodes) {
            if (Math.abs(rawX - n.x) < SNAP_THRESHOLD) { sx = n.x; gx.push(n.x); }
            else if (Math.abs(dragR - (n.x + NODE_W)) < SNAP_THRESHOLD) { sx = n.x + NODE_W - sW; gx.push(n.x + NODE_W); }
            else if (Math.abs(dragCX - (n.x + NODE_W / 2)) < SNAP_THRESHOLD) { sx = n.x + NODE_W / 2 - sW / 2; gx.push(n.x + NODE_W / 2); }
            if (Math.abs(rawY - n.y) < SNAP_THRESHOLD) { sy = n.y; gy.push(n.y); }
            else if (Math.abs(dragB - (n.y + NODE_H)) < SNAP_THRESHOLD) { sy = n.y + NODE_H - sH; gy.push(n.y + NODE_H); }
            else if (Math.abs(dragCY - (n.y + NODE_H / 2)) < SNAP_THRESHOLD) { sy = n.y + NODE_H / 2 - sH / 2; gy.push(n.y + NODE_H / 2); }
          }
          // Snap against group centers
          for (const g of groups) {
            const gCX = g.x + g.width / 2, gCY = g.y + g.height / 2;
            if (Math.abs(dragCX - gCX) < SNAP_THRESHOLD) { sx = gCX - sW / 2; gx.push(gCX); }
            if (Math.abs(dragCY - gCY) < SNAP_THRESHOLD) { sy = gCY - sH / 2; gy.push(gCY); }
          }

          // Equal-spacing detection
          const allItems: CanvasItem[] = [
            ...nodes.map(n => ({ id: n.id, x: n.x, y: n.y, w: NODE_W, h: NODE_H })),
            ...stickyNotes.map(s => ({ id: s.id, x: s.x, y: s.y, w: s.width, h: s.height })),
          ];
          const { snapX: eqX, snapY: eqY, guides: eqGuides } = detectEqualSpacing(allItems, dragStickyState.stickyId, sx, sy, sW, sH, SNAP_THRESHOLD);
          if (eqX !== null) sx = eqX;
          if (eqY !== null) sy = eqY;
          setEqualSpacingGuides(eqGuides);
          setSnapLines({ x: [...new Set(gx)], y: [...new Set(gy)] });
        } else {
          setEqualSpacingGuides([]);
        }

        setStickyNotes(prev => prev.map(s =>
          s.id === dragStickyState.stickyId ? { ...s, x: sx, y: sy } : s
        ));
      }
    }

    if (resizeStickyState) {
      const dw = canvasPos.x - resizeStickyState.startX;
      const dh = canvasPos.y - resizeStickyState.startY;
      setStickyNotes(prev => prev.map(s =>
        s.id === resizeStickyState.stickyId
          ? { ...s, width: Math.min(800, Math.max(100, resizeStickyState.startW + dw)), height: Math.min(600, Math.max(60, resizeStickyState.startH + dh)) }
          : s
      ));
    }

    if (connectState) {
      setConnectState(prev => prev ? { ...prev, canvasX: canvasPos.x, canvasY: canvasPos.y } : null);
    }

    // Sticky-to-node connection drawing: track mouse position
    if (connectingStickyId) {
      setStickyConnMousePos({ x: canvasPos.x, y: canvasPos.y });
    }
  }, [isPanning, panStart, panStartMouse, panThresholdMet, dragState, dragGroupState, resizeState, connectState, connectingStickyId, dragStickyState, resizeStickyState, screenToCanvas, snapEnabled, nodes, groups, stickyNotes, selectionBox]);

  const handleViewportMouseUp = useCallback(() => {
    // Push history after drag operations
    if (dragState || dragGroupState || resizeState || dragStickyState || resizeStickyState) {
      pushHistory();
    }
    setIsPanning(false);
    setPanThresholdMet(false);
    setDragState(null);
    setDragGroupState(null);
    setResizeState(null);
    setDragStickyState(null);
    setResizeStickyState(null);
    setSnapLines({ x: [], y: [] });
    setEqualSpacingGuides([]);

    // Finalize rubber-band selection
    if (selectionBox) {
      const minX = Math.min(selectionBox.startX, selectionBox.currentX);
      const maxX = Math.max(selectionBox.startX, selectionBox.currentX);
      const minY = Math.min(selectionBox.startY, selectionBox.currentY);
      const maxY = Math.max(selectionBox.startY, selectionBox.currentY);
      const boxW = maxX - minX;
      const boxH = maxY - minY;
      // Only select if box is large enough (prevent accidental selections from clicks)
      if (boxW > 5 || boxH > 5) {
        const selected = new Set<string>();
        for (const node of nodes) {
          const nodeCX = node.x + NODE_W / 2;
          const nodeCY = node.y + NODE_H / 2;
          if (nodeCX >= minX && nodeCX <= maxX && nodeCY >= minY && nodeCY <= maxY) {
            selected.add(node.id);
          }
        }
        if (selected.size > 0) {
          setMultiSelectedIds(selected);
          setSelectedNodeId(null);
        }
      }
      setSelectionBox(null);
    }
  }, [dragState, dragGroupState, resizeState, dragStickyState, resizeStickyState, pushHistory, selectionBox, nodes]);

  // #21 – Context menu handler
  const handleContextMenu = useCallback((e: React.MouseEvent, nodeId?: string, groupId?: string, connIdx?: number) => {
    if (readOnly) return;
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, nodeId, groupId, connIdx });
  }, [readOnly]);

  // ─── Node Interactions ─────────────────────────────────────────────────────

  const handleNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    if (e.button !== 0 || readOnly || spaceHeld) return;

    // If in sticky-connection mode, complete the connection
    if (connectingStickyId) {
      e.stopPropagation();
      // Check if this connection already exists
      const exists = stickyConnections.some(sc => sc.stickyId === connectingStickyId && sc.nodeId === nodeId);
      if (!exists) {
        pushHistory();
        setStickyConnections(prev => [...prev, { stickyId: connectingStickyId, nodeId }]);
      }
      setConnectingStickyId(null);
      setStickyConnMousePos(null);
      return;
    }

    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    e.stopPropagation();
    const canvasPos = screenToCanvas(e.clientX, e.clientY);
    setDragState({ nodeId, offsetX: canvasPos.x - node.x, offsetY: canvasPos.y - node.y });

    // #22 – Shift+click for multi-select
    if (e.shiftKey) {
      setMultiSelectedIds(prev => {
        const next = new Set(prev);
        if (next.has(nodeId)) next.delete(nodeId);
        else next.add(nodeId);
        return next;
      });
    } else {
      if (!multiSelectedIds.has(nodeId)) {
        setMultiSelectedIds(new Set());
      }
      setSelectedNodeId(nodeId);
      setSelectedConnId(null);
      setSelectedGroupId(null);
    }
  }, [nodes, readOnly, spaceHeld, screenToCanvas, multiSelectedIds, connectingStickyId, stickyConnections, pushHistory]);

  const handlePortClick = useCallback((e: React.MouseEvent, nodeId: string, port: PortDirection) => {
    if (readOnly) return;
    e.stopPropagation();

    if (!connectState) {
      // Start new connection from this port
      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      setConnectState({ fromId: nodeId, fromPort: port, canvasX: canvasPos.x, canvasY: canvasPos.y });
    } else {
      // Finish connection at this port
      if (connectState.fromId === nodeId) {
        setConnectState(null); // Cancel self-connection
        return;
      }
      const exists = connections.some(c => c.from === connectState.fromId && c.to === nodeId);
      if (exists) {
        showToast('Verbindung existiert bereits');
      } else if (wouldCreateCycle(connections, connectState.fromId, nodeId)) {
        showToast('Zirkuläre Verbindung nicht erlaubt');
      } else {
        pushHistory();
        setConnections(prev => [...prev, {
          from: connectState.fromId,
          to: nodeId,
          fromPort: connectState.fromPort,
          toPort: port,
        }]);
      }
      setConnectState(null);
    }
  }, [connectState, connections, readOnly, screenToCanvas, showToast, pushHistory]);

  // ─── Group Interactions ────────────────────────────────────────────────────

  const handleGroupMouseDown = useCallback((e: React.MouseEvent, groupId: string) => {
    if (e.button !== 0 || readOnly || spaceHeld) return;
    e.stopPropagation();
    const group = groups.find(g => g.id === groupId);
    if (!group) return;
    const canvasPos = screenToCanvas(e.clientX, e.clientY);
    setDragGroupState({ groupId, offsetX: canvasPos.x - group.x, offsetY: canvasPos.y - group.y });
    setSelectedGroupId(groupId);
    setSelectedNodeId(null);
    setSelectedConnId(null);
    setMultiSelectedIds(new Set());
  }, [groups, readOnly, spaceHeld, screenToCanvas]);

  const handleGroupResizeStart = useCallback((e: React.MouseEvent, groupId: string) => {
    if (readOnly) return;
    e.stopPropagation();
    e.preventDefault();
    const group = groups.find(g => g.id === groupId);
    if (!group) return;
    const canvasPos = screenToCanvas(e.clientX, e.clientY);
    setResizeState({ groupId, startX: canvasPos.x, startY: canvasPos.y, startW: group.width, startH: group.height });
  }, [groups, readOnly, screenToCanvas]);

  // ─── Sticky Note Interactions ──────────────────────────────────────────────

  const handleStickyMouseDown = useCallback((e: React.MouseEvent, stickyId: string) => {
    if (e.button !== 0 || readOnly || spaceHeld) return;
    e.stopPropagation();
    const sticky = stickyNotes.find(s => s.id === stickyId);
    if (!sticky) return;
    const canvasPos = screenToCanvas(e.clientX, e.clientY);
    setDragStickyState({ stickyId, offsetX: canvasPos.x - sticky.x, offsetY: canvasPos.y - sticky.y });
    setSelectedStickyId(stickyId);
    setSelectedNodeId(null);
    setSelectedGroupId(null);
    setSelectedConnId(null);
    setMultiSelectedIds(new Set());
  }, [stickyNotes, readOnly, spaceHeld, screenToCanvas]);

  const handleStickyResizeStart = useCallback((e: React.MouseEvent, stickyId: string) => {
    if (readOnly) return;
    e.stopPropagation();
    e.preventDefault();
    const sticky = stickyNotes.find(s => s.id === stickyId);
    if (!sticky) return;
    const canvasPos = screenToCanvas(e.clientX, e.clientY);
    setResizeStickyState({ stickyId, startX: canvasPos.x, startY: canvasPos.y, startW: sticky.width, startH: sticky.height });
  }, [stickyNotes, readOnly, screenToCanvas]);

  const addStickyNote = useCallback((color: StickyNoteColor) => {
    pushHistory();
    const rect = viewportRef.current?.getBoundingClientRect();
    const centerX = rect ? (rect.width / 2 - pan.x) / zoom : 300;
    const centerY = rect ? (rect.height / 2 - pan.y) / zoom : 200;

    let noteX = centerX - 75;
    let noteY = centerY - 40;

    // If note falls inside a group, push it below the group header
    const GROUP_HEADER_HEIGHT = 48;
    for (const g of groups) {
      if (noteX + 160 > g.x && noteX < g.x + g.width &&
          noteY + 100 > g.y && noteY < g.y + g.height) {
        if (noteY < g.y + GROUP_HEADER_HEIGHT) {
          noteY = g.y + GROUP_HEADER_HEIGHT;
        }
        break;
      }
    }

    const note: StickyNote = {
      id: `sticky-${Date.now()}`, text: 'Notiz…',
      x: noteX, y: noteY, width: 160, height: 100, color,
    };
    setStickyNotes(prev => [...prev, note]);
    setSelectedStickyId(note.id);
  }, [pan, zoom, pushHistory, groups]);

  const startStickyEdit = (stickyId: string) => {
    if (readOnly) return;
    const sticky = stickyNotes.find(s => s.id === stickyId);
    if (!sticky) return;
    setEditStickyId(stickyId);
    setEditStickyText(sticky.text);
    setEditStickyColor(sticky.color);
    setEditStickyBold(sticky.fontWeight === 'bold');
    setEditStickyItalic(sticky.fontStyle === 'italic');
    setEditStickyTextColor(sticky.customTextColor || '');
    setEditStickyFontSize(sticky.fontSize || 12);
  };

  const saveStickyEdit = () => {
    if (editStickyId) {
      pushHistory();
      setStickyNotes(prev => prev.map(s => s.id === editStickyId ? {
        ...s,
        text: editStickyText,
        color: editStickyColor,
        fontWeight: editStickyBold ? 'bold' : 'normal',
        fontStyle: editStickyItalic ? 'italic' : 'normal',
        customTextColor: editStickyTextColor || undefined,
        fontSize: editStickyFontSize !== 12 ? editStickyFontSize : undefined,
      } : s));
      setEditStickyId(null);
    }
  };

  // ─── Auto-Layout ──────────────────────────────────────────────────────────

  const handleAutoLayout = useCallback(() => {
    if (nodes.length === 0) return;
    pushHistory();
    setNodes(computeAutoLayout(nodes, connections));
    setTimeout(() => fitToScreen(), 50);
  }, [nodes, connections, pushHistory, fitToScreen]);

  // ─── Export as PNG ────────────────────────────────────────────────────────

  const handleExportPNG = useCallback(() => {
    if (nodes.length === 0) return;
    showToast(lang === 'en' ? 'Exporting PNG...' : 'PNG wird exportiert...');

    const PAD = 40;
    const allItems = [
      ...nodes.map(n => ({ l: n.x, t: n.y, r: n.x + NODE_W, b: n.y + NODE_H })),
      ...groups.map(g => ({ l: g.x, t: g.y, r: g.x + g.width, b: g.y + g.height })),
      ...stickyNotes.map(s => ({ l: s.x, t: s.y, r: s.x + s.width, b: s.y + s.height })),
    ];
    const minX = Math.min(...allItems.map(i => i.l)) - PAD;
    const minY = Math.min(...allItems.map(i => i.t)) - PAD;
    const maxX = Math.max(...allItems.map(i => i.r)) + PAD;
    const maxY = Math.max(...allItems.map(i => i.b)) + PAD;
    const w = maxX - minX;
    const h = maxY - minY;

    // Build SVG string
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w * 2}" height="${h * 2}" viewBox="${minX} ${minY} ${w} ${h}" style="background:${isDark ? '#0a0a0e' : '#f9fafb'}">`;

    // Groups
    for (const g of groups) {
      const c = GROUP_COLORS[g.color] || GROUP_COLORS.gray;
      svg += `<rect x="${g.x}" y="${g.y}" width="${g.width}" height="${g.height}" rx="16" fill="${c.bg}" stroke="${c.border}" stroke-width="2" stroke-dasharray="8,4" />`;
      svg += `<text x="${g.x + 16}" y="${g.y + 24}" font-family="sans-serif" font-size="11" font-weight="700" fill="${c.text}" text-transform="uppercase">${g.label}</text>`;
    }

    // Sticky notes
    for (const s of stickyNotes) {
      const c = STICKY_COLORS[s.color];
      svg += `<rect x="${s.x}" y="${s.y}" width="${s.width}" height="${s.height}" rx="8" fill="${c.bg}" stroke="${c.border}" stroke-width="1.5" />`;
      svg += `<text x="${s.x + 12}" y="${s.y + 20}" font-family="sans-serif" font-size="12" fill="${c.text}">${s.text.length > 40 ? s.text.substring(0, 38) + '…' : s.text}</text>`;
    }

    // Connection marker defs
    const ecc = CONN_COLORS[connColorTheme];
    svg += `<defs>`;
    svg += `<marker id="exp-arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto" markerUnits="userSpaceOnUse"><path d="M 0 0 L 10 3.5 L 0 7" fill="none" stroke="${ecc.selected}" stroke-width="1.5"/></marker>`;
    svg += `<marker id="exp-diamond" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto" markerUnits="userSpaceOnUse"><polygon points="5,0 10,5 5,10 0,5" fill="${ecc.selected}"/></marker>`;
    svg += `<marker id="exp-circle" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto" markerUnits="userSpaceOnUse"><circle cx="4" cy="4" r="3" fill="${ecc.selected}"/></marker>`;
    svg += `</defs>`;

    // Connections
    const expDash = STROKE_DASH[connLineStyle];
    const expMarker = connArrowHead !== 'none' ? ` marker-end="url(#exp-${connArrowHead})"` : '';
    for (const conn of connections) {
      const fromNode = nodes.find(n => n.id === conn.from);
      const toNode = nodes.find(n => n.id === conn.to);
      if (!fromNode || !toNode) continue;
      const fp = conn.fromPort || 'right';
      const tp = conn.toPort || 'left';
      const pathD = connCurveStyle === 'straight' ? getStraightPath(fromNode, toNode, fp, tp) : connCurveStyle === 'elbow' ? getElbowPath(fromNode, toNode, fp, tp) : getConnectionPath(fromNode, toNode, fp, tp);
      if (connGlow) svg += `<path d="${pathD}" stroke="${ecc.selected}" stroke-width="${connStrokeWidth * 4}" fill="none" opacity="0.1" />`;
      svg += `<path d="${pathD}" stroke="${ecc.default}" stroke-width="${connStrokeWidth}" fill="none"${expDash ? ` stroke-dasharray="${expDash}"` : ''}${expMarker} />`;
      // Connection label in export
      if (conn.label) {
        const mid = getPathMidpoint(fromNode, toNode, fp, tp, connCurveStyle);
        const labelBg = isDark ? 'rgba(39,39,42,0.95)' : 'rgba(255,255,255,0.95)';
        const labelBorder = isDark ? 'rgba(63,63,70,0.6)' : 'rgba(209,213,219,0.8)';
        const labelColor = isDark ? '#d4d4d8' : '#374151';
        const labelText = conn.label.length > 18 ? conn.label.substring(0, 16) + '...' : conn.label;
        const labelW = Math.min(labelText.length * 6.5 + 16, 120);
        svg += `<rect x="${mid.x - labelW / 2}" y="${mid.y - 10}" width="${labelW}" height="18" rx="9" fill="${labelBg}" stroke="${labelBorder}" stroke-width="1" />`;
        svg += `<text x="${mid.x}" y="${mid.y + 3}" font-family="sans-serif" font-size="10" fill="${labelColor}" text-anchor="middle">${labelText}</text>`;
      }
    }

    // Nodes
    for (const node of nodes) {
      const st = NODE_STYLES[node.type];
      svg += `<rect x="${node.x}" y="${node.y}" width="${NODE_W}" height="${NODE_H}" rx="12" fill="${st.bg}" stroke="${st.border}" stroke-width="1" />`;
      svg += `<circle cx="${node.x + 24}" cy="${node.y + NODE_H / 2}" r="16" fill="${st.accent}18" />`;
      svg += `<text x="${node.x + 50}" y="${node.y + NODE_H / 2 - 4}" font-family="sans-serif" font-size="13" font-weight="600" fill="${isDark ? '#fff' : '#111'}">${node.label.length > 22 ? node.label.substring(0, 20) + '…' : node.label}</text>`;
      if (node.description) {
        svg += `<text x="${node.x + 50}" y="${node.y + NODE_H / 2 + 14}" font-family="sans-serif" font-size="10" fill="${isDark ? '#71717a' : '#6b7280'}">${node.description.length > 30 ? node.description.substring(0, 28) + '…' : node.description}</text>`;
      }
      // Type badge
      svg += `<rect x="${node.x + NODE_W - 50}" y="${node.y - 8}" width="48" height="16" rx="5" fill="${st.bg}" stroke="${st.border}" stroke-width="1" />`;
      svg += `<text x="${node.x + NODE_W - 26}" y="${node.y + 4}" font-family="sans-serif" font-size="8" font-weight="700" fill="${st.accent}" text-anchor="middle">${st.label}</text>`;
    }

    svg += '</svg>';

    // Convert SVG to PNG via Canvas
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = w * 2;
      canvas.height = h * 2;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = `workflow-${(initialSystem?.name || 'export').replace(/\s+/g, '-').toLowerCase()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast(lang === 'en' ? 'PNG exported successfully' : 'PNG erfolgreich exportiert');
    };
    img.src = url;
  }, [nodes, connections, groups, stickyNotes, isDark, initialSystem, connLineStyle, connArrowHead, connColorTheme, connCurveStyle, connGlow, connStrokeWidth, showToast, lang]);

  // ─── Touch Event Handlers (Pinch-to-zoom, touch pan, touch node drag) ────

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const ts = touchStateRef.current;

    if (e.touches.length === 2) {
      // Pinch gesture start: calculate initial distance & center
      e.preventDefault();
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dx = t1.clientX - t2.clientX;
      const dy = t1.clientY - t2.clientY;
      ts.lastDistance = Math.sqrt(dx * dx + dy * dy);
      ts.lastCenter = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
      };
      ts.isTouchPanning = false;
      ts.touchNodeId = null;
      return;
    }

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const target = touch.target as HTMLElement;

      // Check if the touch hit a node
      const nodeEl = target.closest('[data-node-id]') as HTMLElement | null;
      if (nodeEl && !readOnly) {
        const nodeId = nodeEl.getAttribute('data-node-id');
        const node = nodes.find(n => n.id === nodeId);
        if (node) {
          e.preventDefault();
          const canvasPos = screenToCanvas(touch.clientX, touch.clientY);
          ts.touchNodeId = nodeId;
          ts.touchNodeOffset = { x: canvasPos.x - node.x, y: canvasPos.y - node.y };
          ts.isTouchPanning = false;
          setSelectedNodeId(nodeId);
          setSelectedConnId(null);
          setSelectedGroupId(null);
          setMultiSelectedIds(new Set());
          return;
        }
      }

      // Single-finger pan on empty canvas
      ts.isTouchPanning = true;
      ts.touchNodeId = null;
      ts.lastCenter = { x: touch.clientX, y: touch.clientY };
    }
  }, [readOnly, nodes, screenToCanvas]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const ts = touchStateRef.current;

    if (e.touches.length === 2) {
      // Pinch-to-zoom
      e.preventDefault();
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dx = t1.clientX - t2.clientX;
      const dy = t1.clientY - t2.clientY;
      const newDistance = Math.sqrt(dx * dx + dy * dy);
      const newCenter = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
      };

      if (ts.lastDistance > 0) {
        const scale = newDistance / ts.lastDistance;
        const rect = viewportRef.current?.getBoundingClientRect();
        if (rect) {
          const newZoom = Math.min(5, Math.max(0.1, zoomRef.current * scale));
          const ratio = newZoom / zoomRef.current;
          const cx = newCenter.x - rect.left;
          const cy = newCenter.y - rect.top;

          // Simultaneously handle zoom and pan delta from center movement
          const panDx = newCenter.x - ts.lastCenter.x;
          const panDy = newCenter.y - ts.lastCenter.y;

          setZoom(newZoom);
          setPan(prev => ({
            x: cx - (cx - prev.x) * ratio + panDx,
            y: cy - (cy - prev.y) * ratio + panDy,
          }));
        }
      }

      ts.lastDistance = newDistance;
      ts.lastCenter = newCenter;
      return;
    }

    if (e.touches.length === 1) {
      const touch = e.touches[0];

      // Touch node drag
      if (ts.touchNodeId && !readOnly) {
        e.preventDefault();
        const canvasPos = screenToCanvas(touch.clientX, touch.clientY);
        const sx = canvasPos.x - ts.touchNodeOffset.x;
        const sy = canvasPos.y - ts.touchNodeOffset.y;
        setNodes(prev => prev.map(n =>
          n.id === ts.touchNodeId ? { ...n, x: sx, y: sy } : n
        ));
        return;
      }

      // Touch pan
      if (ts.isTouchPanning) {
        e.preventDefault();
        const dx = touch.clientX - ts.lastCenter.x;
        const dy = touch.clientY - ts.lastCenter.y;
        setPan(prev => ({
          x: prev.x + dx,
          y: prev.y + dy,
        }));
        ts.lastCenter = { x: touch.clientX, y: touch.clientY };
      }
    }
  }, [readOnly, screenToCanvas]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const ts = touchStateRef.current;

    // If we were dragging a node, push undo history
    if (ts.touchNodeId) {
      pushHistory();
    }

    if (e.touches.length === 0) {
      ts.lastDistance = 0;
      ts.isTouchPanning = false;
      ts.touchNodeId = null;
    } else if (e.touches.length === 1) {
      // Went from 2 fingers to 1: reset to single-touch pan
      ts.lastDistance = 0;
      const touch = e.touches[0];
      ts.lastCenter = { x: touch.clientX, y: touch.clientY };
      ts.isTouchPanning = true;
      ts.touchNodeId = null;
    }
  }, [pushHistory]);

  // ─── Drag & Drop from Palette ─────────────────────────────────────────────

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    try {
      const data = e.dataTransfer.getData('application/json');
      if (!data) return;
      const item: PaletteItem = JSON.parse(data);
      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      pushHistory();
      const id = `node-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const label = item.tKey ? t(item.tKey) : item.label || '';
      const newNode: SystemNode = {
        id, label, description: '', icon: item.icon, type: item.type,
        x: canvasPos.x - NODE_W / 2, y: canvasPos.y - NODE_H / 2,
      };
      setNodes(prev => [...prev, newNode]);
      setSelectedNodeId(id);
    } catch { /* ignore invalid drag data */ }
  }, [screenToCanvas, pushHistory]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  // ─── Add Operations ────────────────────────────────────────────────────────

  const addNode = useCallback((item: PaletteItem, atPosition?: { x: number; y: number }) => {
    pushHistory();
    const id = `node-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const label = item.tKey ? t(item.tKey) : item.label || '';
    let cx: number, cy: number;
    if (atPosition) {
      cx = atPosition.x;
      cy = atPosition.y;
    } else {
      const rect = viewportRef.current?.getBoundingClientRect();
      cx = rect ? (rect.width / 2 - pan.x) / zoom : 300;
      cy = rect ? (rect.height / 2 - pan.y) / zoom : 200;
      cx += (Math.random() - 0.5) * 80;
      cy += (Math.random() - 0.5) * 60;
    }
    const newNode: SystemNode = {
      id, label, description: '', icon: item.icon, type: item.type,
      x: cx - NODE_W / 2, y: cy - NODE_H / 2,
    };
    setNodes(prev => [...prev, newNode]);
    setSelectedNodeId(id);
  }, [pan, zoom, pushHistory, t]);

  const addGroup = useCallback((color: string) => {
    pushHistory();
    const rect = viewportRef.current?.getBoundingClientRect();
    const centerX = rect ? (rect.width / 2 - pan.x) / zoom : 300;
    const centerY = rect ? (rect.height / 2 - pan.y) / zoom : 200;
    const group: CanvasGroup = {
      id: `group-${Date.now()}`, label: 'Neue Phase',
      x: centerX - 200, y: centerY - 100, width: 400, height: 220, color,
    };
    setGroups(prev => [...prev, group]);
    setSelectedGroupId(group.id);
  }, [pan, zoom, pushHistory]);

  // ─── Edit Operations ───────────────────────────────────────────────────────

  const startNodeEdit = useCallback((nodeId: string) => {
    if (readOnly) return;
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    setEditNode(nodeId);
    setEditLabel(node.label);
    setEditDesc(node.description);
    setEditIcon(node.icon);
    setEditLinkedResource(node.linkedResourceType || '');
    setEditLinkedResourceId(node.linkedResourceId || '');
    setEditLinkedPage(node.linkedPage || '');
    setShowIconPicker(false);
  }, [readOnly, nodes]);

  const saveNodeEdit = () => {
    if (editNode) {
      pushHistory();
      setNodes(prev => prev.map(n => n.id === editNode ? { ...n, label: editLabel, description: editDesc, icon: editIcon, linkedResourceType: (editLinkedResource || undefined) as SystemNode['linkedResourceType'], linkedResourceId: editLinkedResourceId || undefined, linkedPage: editLinkedPage || undefined } : n));
      setEditNode(null);
      setShowIconPicker(false);
    }
  };

  // ─── Insert Node on Connection ─────────────────────────────────────────────
  const showInsertPopover = useCallback((connIdx: number) => {
    const conn = connections[connIdx];
    if (!conn) return;
    const fromNode = nodes.find(n => n.id === conn.from);
    const toNode = nodes.find(n => n.id === conn.to);
    if (!fromNode || !toNode) return;
    const fp = conn.fromPort || 'right';
    const tp = conn.toPort || 'left';
    const mid = getPathMidpoint(fromNode, toNode, fp, tp, connCurveStyle);
    setInsertPopover({ connIdx, x: mid.x, y: mid.y });
  }, [connections, nodes, connCurveStyle]);

  const insertNodeOnConnection = useCallback((connIdx: number, item?: PaletteItem) => {
    const conn = connections[connIdx];
    if (!conn) return;
    const fromNode = nodes.find(n => n.id === conn.from);
    const toNode = nodes.find(n => n.id === conn.to);
    if (!fromNode || !toNode) return;
    const fp = conn.fromPort || 'right';
    const tp = conn.toPort || 'left';
    const mid = getPathMidpoint(fromNode, toNode, fp, tp, connCurveStyle);
    pushHistory();
    const id = `node-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    // Place at the midpoint between the two connected nodes
    const newX = mid.x - NODE_W / 2;
    let newY = mid.y - NODE_H / 2;
    // Check overlap with existing nodes and push further down
    const hasOverlap = () => nodes.some(n => Math.abs(n.x - newX) < NODE_W && Math.abs(n.y - newY) < NODE_H);
    let attempts = 0;
    while (hasOverlap() && attempts < 5) { newY += NODE_H + 20; attempts++; }
    const icon = item?.icon || 'sparkles';
    const type = item?.type || 'process';
    const label = item?.tKey ? t(item.tKey) : item?.label || '';
    const newNode: SystemNode = { id, label, description: '', icon, type, x: newX, y: newY };
    // Use from/to IDs to match the connection reliably (not index which can be stale)
    const connFrom = conn.from;
    const connTo = conn.to;
    const connFromPort = conn.fromPort;
    const connToPort = conn.toPort;
    setNodes(prev => [...prev, newNode]);
    setConnections(prev => {
      const without = prev.filter(c => !(c.from === connFrom && c.to === connTo && c.fromPort === connFromPort && c.toPort === connToPort));
      return [
        ...without,
        { from: connFrom, to: id, fromPort: connFromPort, toPort: 'left' as PortDirection, label: conn.label },
        { from: id, to: connTo, fromPort: 'right' as PortDirection, toPort: connToPort },
      ];
    });
    setSelectedNodeId(id);
    setSelectedConnId(null);
    setHoveredConnId(null);
    setInsertPopover(null);
    setTimeout(() => startNodeEdit(id), 50);
  }, [connections, nodes, connCurveStyle, pushHistory, startNodeEdit, t]);

  // ─── Connection Label Edit ──────────────────────────────────────────────────
  const startConnLabelEdit = useCallback((connIdx: number) => {
    if (readOnly) return;
    const conn = connections[connIdx];
    if (!conn) return;
    setEditingConnLabel({ connIdx, label: conn.label || '' });
  }, [readOnly, connections]);

  const saveConnLabel = useCallback(() => {
    if (editingConnLabel === null) return;
    const { connIdx, label } = editingConnLabel;
    pushHistory();
    setConnections(prev => prev.map((c, i) => i === connIdx ? { ...c, label: label.trim() || undefined } : c));
    setEditingConnLabel(null);
  }, [editingConnLabel, pushHistory]);

  const startGroupEdit = useCallback((groupId: string) => {
    if (readOnly) return;
    const group = groups.find(g => g.id === groupId);
    if (!group) return;
    setEditGroupId(groupId);
    setEditGroupLabel(group.label);
    setEditGroupDesc(group.description || '');
  }, [readOnly, groups]);

  const saveGroupEdit = () => {
    if (editGroupId) {
      pushHistory();
      setGroups(prev => prev.map(g => g.id === editGroupId ? { ...g, label: editGroupLabel, description: editGroupDesc || undefined } : g));
      setEditGroupId(null);
    }
  };

  // #22 – Duplicate selected nodes
  const duplicateSelection = useCallback(() => {
    const ids = multiSelectedIds.size > 0 ? multiSelectedIds : (selectedNodeId ? new Set([selectedNodeId]) : new Set<string>());
    if (ids.size === 0) return;
    pushHistory();
    const idMap = new Map<string, string>();
    const newNodes: SystemNode[] = [];
    for (const id of ids) {
      const node = nodes.find(n => n.id === id);
      if (!node) continue;
      const newId = `node-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      idMap.set(id, newId);
      newNodes.push({ ...node, id: newId, x: node.x + 30, y: node.y + 30 });
    }
    const newConns = connections
      .filter(c => idMap.has(c.from) && idMap.has(c.to))
      .map(c => ({ ...c, from: idMap.get(c.from)!, to: idMap.get(c.to)! }));
    setNodes(prev => [...prev, ...newNodes]);
    setConnections(prev => [...prev, ...newConns]);
    setMultiSelectedIds(new Set(newNodes.map(n => n.id)));
    setSelectedNodeId(null);
  }, [multiSelectedIds, selectedNodeId, nodes, connections, pushHistory]);

  // ─── Save ──────────────────────────────────────────────────────────────────

  // #1 – Validation inside setTimeout to avoid race condition
  const handleSave = () => {
    setSaveState('saving');
    setTimeout(() => {
      if (!systemName.trim() || nodes.length === 0) {
        setSaveState('idle');
        return;
      }
      const system: AutomationSystem = {
        id: initialSystem?.id || `user-${Date.now()}`,
        name: systemName,
        description: t('canvas.saveDesc', { count: nodes.length }),
        category: t('canvas.customCategory'),
        icon: nodes[0]?.icon || 'zap',
        status: 'draft',
        webhookUrl: '',
        nodes, connections, groups: groups.length > 0 ? groups : undefined,
        stickyNotes: stickyNotes.length > 0 ? stickyNotes : undefined,
        outputs: [], executionCount: 0,
        canvasZoom: zoom,
        canvasPan: pan,
      };
      onSave?.(system);
      lastSavedStateRef.current = { nodes, connections, groups, stickyNotes, stickyConnections };
      setHasUnsavedChanges(false);
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2000);
    }, 500);
  };
  handleSaveRef.current = handleSave;

  // ─── Discard Changes ──────────────────────────────────────────────────────
  const handleDiscard = () => {
    const saved = lastSavedStateRef.current;
    setNodes(saved.nodes);
    setConnections(saved.connections);
    setGroups(saved.groups);
    setStickyNotes(saved.stickyNotes);
    setStickyConnections(saved.stickyConnections || []);
    setHasUnsavedChanges(false);
    showToast(lang === 'en' ? 'Changes discarded' : 'Änderungen verworfen');
  };

  // ─── Execute Animation ──────────────────────────────────────────────────────

  const handleExecute = useCallback(() => {
    if (isExecuting || nodes.length === 0) return;
    setIsExecuting(true);
    setExecutionDone(false);
    setExecutingNodes(new Set());
    onExecute?.();

    // #3 – Clear any lingering timeouts
    executionTimeoutsRef.current.forEach(clearTimeout);
    executionTimeoutsRef.current = [];

    const hasIncoming = new Set(connections.map(c => c.to));
    const startNodes = nodes.filter(n => n.type === 'trigger' || !hasIncoming.has(n.id));
    if (startNodes.length === 0 && nodes.length > 0) startNodes.push(nodes[0]);

    const visited = new Set<string>();
    const queue: { id: string; depth: number }[] = startNodes.map(n => ({ id: n.id, depth: 0 }));
    const schedule: { id: string; delay: number }[] = [];

    while (queue.length > 0) {
      const item = queue.shift()!;
      if (visited.has(item.id)) continue;
      visited.add(item.id);
      schedule.push({ id: item.id, delay: item.depth * 600 });
      for (const conn of connections.filter(c => c.from === item.id)) {
        if (!visited.has(conn.to)) queue.push({ id: conn.to, depth: item.depth + 1 });
      }
    }
    for (const node of nodes) {
      if (!visited.has(node.id)) schedule.push({ id: node.id, delay: schedule.length * 600 });
    }

    schedule.forEach(({ id, delay }) => {
      const t = setTimeout(() => {
        setExecutingNodes(prev => new Set([...prev, id]));
      }, delay);
      executionTimeoutsRef.current.push(t);
    });

    const totalDuration = schedule.length > 0 ? Math.max(...schedule.map(s => s.delay)) + 800 : 800;
    const t1 = setTimeout(() => {
      setExecutionDone(true);
      const t2 = setTimeout(() => {
        setIsExecuting(false);
        setExecutingNodes(new Set());
        setExecutionDone(false);
      }, 2500);
      executionTimeoutsRef.current.push(t2);
    }, totalDuration);
    executionTimeoutsRef.current.push(t1);
  }, [isExecuting, nodes, connections, onExecute]);

  // ─── Render Icon ───────────────────────────────────────────────────────────

  const renderIcon = (node: SystemNode, iconSize = 18) => {
    const LucideIcon = ICONS[node.icon];
    return renderNodeIcon(
      node.icon, node.logoUrl,
      LucideIcon ? <LucideIcon size={iconSize} style={{ color: NODE_STYLES[node.type].accent }} /> : <Zap size={iconSize} style={{ color: NODE_STYLES[node.type].accent }} />,
      iconSize,
    );
  };

  // ─── Delete Execution (shared by keyboard, toolbar, context menu) ──────────

  const executeDelete = useCallback(() => {
    if (!deleteConfirm) return;
    pushHistory();
    const { type, ids, connIdx } = deleteConfirm;
    if (type === 'nodes' && ids) {
      const idSet = new Set(ids);
      setNodes(prev => prev.filter(n => !idSet.has(n.id)));
      setConnections(prev => prev.filter(c => !idSet.has(c.from) && !idSet.has(c.to)));
      setStickyConnections(prev => prev.filter(sc => !idSet.has(sc.nodeId)));
      setMultiSelectedIds(new Set());
    } else if (type === 'node' && ids?.[0]) {
      setNodes(prev => prev.filter(n => n.id !== ids[0]));
      setConnections(prev => prev.filter(c => c.from !== ids[0] && c.to !== ids[0]));
      setStickyConnections(prev => prev.filter(sc => sc.nodeId !== ids[0]));
      setSelectedNodeId(null);
    } else if (type === 'connection' && connIdx !== undefined) {
      setConnections(prev => prev.filter((_, i) => i !== connIdx));
      setSelectedConnId(null);
    } else if (type === 'group' && ids?.[0]) {
      setGroups(prev => prev.filter(g => g.id !== ids[0]));
      setSelectedGroupId(null);
    } else if (type === 'sticky' && ids?.[0]) {
      setStickyNotes(prev => prev.filter(s => s.id !== ids[0]));
      setStickyConnections(prev => prev.filter(sc => sc.stickyId !== ids[0]));
      setSelectedStickyId(null);
    }
    setDeleteConfirm(null);
  }, [deleteConfirm, pushHistory]);

  // ─── Context Menu Actions ──────────────────────────────────────────────────

  const handleContextAction = useCallback((action: string) => {
    if (!contextMenu) return;
    const { nodeId, groupId, connIdx, stickyId } = contextMenu;

    if (action === 'delete') {
      pushHistory();
      if (nodeId) {
        setNodes(prev => prev.filter(n => n.id !== nodeId));
        setConnections(prev => prev.filter(c => c.from !== nodeId && c.to !== nodeId));
        setStickyConnections(prev => prev.filter(sc => sc.nodeId !== nodeId));
        setSelectedNodeId(null);
      } else if (groupId) {
        setGroups(prev => prev.filter(g => g.id !== groupId));
        setSelectedGroupId(null);
      } else if (stickyId) {
        setStickyNotes(prev => prev.filter(s => s.id !== stickyId));
        setStickyConnections(prev => prev.filter(sc => sc.stickyId !== stickyId));
        setSelectedStickyId(null);
      } else if (connIdx !== undefined) {
        setConnections(prev => prev.filter((_, i) => i !== connIdx));
        setSelectedConnId(null);
      }
    }
    if (action === 'edit' && nodeId) startNodeEdit(nodeId);
    if (action === 'edit' && groupId) startGroupEdit(groupId);
    if (action === 'duplicate' && nodeId) {
      setSelectedNodeId(nodeId);
      setMultiSelectedIds(new Set());
      setTimeout(() => duplicateSelection(), 10);
    }

    setContextMenu(null);
  }, [contextMenu, duplicateSelection, startNodeEdit, startGroupEdit, pushHistory]);

  // ─── Render ────────────────────────────────────────────────────────────────

  const zoomPct = Math.round(zoom * 100);
  const showPalette = !readOnly && paletteOpen && (!isPresentationMode || presEditEnabled);
  // Container height: style.height > className > built-in default
  const containerHeight = (style?.height || className) ? '' : (readOnly && !isFullscreen ? 'h-[500px]' : 'h-[calc(100vh-120px)] min-h-[400px]');

  return (
    <div
      className={`flex ${isFullscreen ? 'fixed inset-0 z-[60]' : `${containerHeight} ${className || ''}`} gap-0 ${isDark ? 'bg-zinc-950' : 'bg-gray-50'}`}
      style={isFullscreen ? undefined : style}
      role="application"
      aria-label="Workflow Canvas"
    >

      {/* ─── Left: Palette ─── */}
      {showPalette && (
        <div className="w-56 shrink-0 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 flex flex-col overflow-hidden z-10" role="toolbar" aria-label="Node-Palette">
          <div className="p-3 border-b border-gray-200 dark:border-zinc-800">
            <div className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">{t('palette.elements')}</div>
            <div className="flex gap-1">
              {(['generic', 'tools', 'groups'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setPaletteTab(tab)}
                  className={`flex-1 text-xs py-1.5 rounded-xl font-medium transition-colors ${paletteTab === tab ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}
                  aria-pressed={paletteTab === tab}
                >
                  {tab === 'generic' ? t('palette.tabNodes') : tab === 'tools' ? t('palette.tabTools') : t('palette.tabGroups')}
                </button>
              ))}
            </div>
          </div>

          {/* Palette search */}
          <div className="px-3 py-2 border-b border-gray-200 dark:border-zinc-800">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-600" />
              <input
                type="text"
                value={paletteSearch}
                onChange={e => setPaletteSearch(e.target.value)}
                placeholder={lang === 'en' ? 'Search nodes...' : 'Nodes suchen...'}
                className="w-full pl-7 pr-7 py-1.5 text-xs rounded-lg bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              {paletteSearch && (
                <button onClick={() => setPaletteSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300">
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {paletteTab === 'generic' && PALETTE_ITEMS.filter(item => !paletteSearch || t(item.tKey).toLowerCase().includes(paletteSearch.toLowerCase())).map(item => {
              const isLogo = item.icon.startsWith('logo-');
              const Icon = !isLogo ? (ICONS[item.icon] || Zap) : null;
              const style = NODE_STYLES[item.type];
              return (
                <button key={item.icon + item.tKey} onClick={() => addNode(item)} draggable onDragStart={e => { e.dataTransfer.setData('application/json', JSON.stringify(item)); e.dataTransfer.effectAllowed = 'copy'; }} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors group cursor-grab active:cursor-grabbing" aria-label={t('palette.addNode', { label: t(item.tKey) })}>
                  <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style={{ background: style.accent + '15' }}>
                    {isLogo ? renderNodeIcon(item.icon, undefined, <Zap size={14} style={{ color: style.accent }} />, 14) : Icon && <Icon size={14} style={{ color: style.accent }} />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-gray-800 dark:text-zinc-200 truncate">{t(item.tKey)}</div>
                    <div className="text-[10px] text-gray-400 dark:text-zinc-600">{t('nodeType.' + item.type)}</div>
                  </div>
                  <Plus size={12} className="ml-auto text-gray-300 dark:text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })}

            {paletteTab === 'tools' && (() => {
              const categories = getToolLogosByCategory();
              return Object.entries(categories).map(([cat, logos]) => {
                const filtered = paletteSearch ? logos.filter(l => l.name.toLowerCase().includes(paletteSearch.toLowerCase())) : logos;
                if (filtered.length === 0) return null;
                return (
                <div key={cat}>
                  <div className="text-[10px] font-semibold text-gray-400 dark:text-zinc-600 uppercase tracking-wider px-3 pt-2 pb-1">{cat}</div>
                  {filtered.map(logo => (
                    <button key={logo.id} onClick={() => addNode({ icon: logo.id, tKey: '', label: logo.name, type: 'process' })} draggable onDragStart={e => { e.dataTransfer.setData('application/json', JSON.stringify({ icon: logo.id, tKey: '', label: logo.name, type: 'process' })); e.dataTransfer.effectAllowed = 'copy'; }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors group cursor-grab active:cursor-grabbing" aria-label={t('palette.addNode', { label: logo.name })}>
                      <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-gray-50 dark:bg-zinc-800">
                        {renderNodeIcon(logo.id, undefined, <Zap size={14} />, 16)}
                      </div>
                      <span className="text-xs font-medium text-gray-800 dark:text-zinc-200 truncate">{logo.name}</span>
                      <Plus size={12} className="ml-auto text-gray-300 dark:text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              );
              });
            })()}

            {paletteTab === 'groups' && (
              <div className="space-y-1">
                <div className="text-[10px] font-semibold text-gray-400 dark:text-zinc-600 uppercase tracking-wider px-3 pt-2 pb-1">{t('palette.phaseBackground')}</div>
                {Object.entries(GROUP_COLORS).map(([key, colors]) => (
                  <button key={key} onClick={() => addGroup(key)} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors group" aria-label={t('palette.addGroup', { color: t('color.' + key) })}>
                    <div className="w-7 h-7 rounded-lg border-2 border-dashed shrink-0" style={{ background: colors.bg, borderColor: colors.border }} />
                    <span className="text-xs font-medium text-gray-800 dark:text-zinc-200">{t('color.' + key)}</span>
                    <Plus size={12} className="ml-auto text-gray-300 dark:text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
                <div className="text-[10px] font-semibold text-gray-400 dark:text-zinc-600 uppercase tracking-wider px-3 pt-4 pb-1">{t('palette.stickyNotes')}</div>
                {(Object.entries(STICKY_COLORS) as [StickyNoteColor, typeof STICKY_COLORS[StickyNoteColor]][]).map(([key, colors]) => (
                  <button key={key} onClick={() => addStickyNote(key)} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors group" aria-label={t('palette.addNote', { color: t('sticky.' + key) })}>
                    <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center" style={{ background: colors.bg, border: `1.5px solid ${colors.border}` }}>
                      <StickyNoteIcon size={13} style={{ color: colors.text }} />
                    </div>
                    <span className="text-xs font-medium text-gray-800 dark:text-zinc-200">{t('palette.noteLabel', { color: t('sticky.' + key) })}</span>
                    <Plus size={12} className="ml-auto text-gray-300 dark:text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Right: Canvas Area ─── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Toolbar */}
        {(!isPresentationMode || presEditEnabled) && <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 z-10 shrink-0" role="toolbar" aria-label="Canvas-Toolbar">
          {!readOnly && (
            <button onClick={() => setPaletteOpen(!paletteOpen)} className={`p-1.5 rounded-lg transition-colors ${paletteOpen ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800'}`} title={t('toolbar.palette')} aria-label={t('toolbar.paletteToggle')}>
              <Plus size={16} />
            </button>
          )}

          {!readOnly && (
            <>
              <div className="h-4 w-px bg-gray-200 dark:bg-zinc-700" />
              <input type="text" value={systemName} onChange={e => setSystemName(e.target.value.slice(0, MAX_LABEL_LENGTH))} placeholder={t('toolbar.systemName')} className="bg-transparent text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none w-40" maxLength={MAX_LABEL_LENGTH} aria-label={t('toolbar.systemNameLabel')} />
            </>
          )}

          {readOnly && initialSystem && (
            <span className="text-sm font-medium text-gray-900 dark:text-white">{initialSystem.name}</span>
          )}

          <div className="flex-1" />

          {/* #15 – Undo/Redo */}
          {!readOnly && (
            <>
              <button onClick={historyUndo} disabled={!canUndo} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-30" title={t('toolbar.undoKey')} aria-label={t('toolbar.undo')}>
                <Undo2 size={15} />
              </button>
              <button onClick={historyRedo} disabled={!canRedo} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-30" title={t('toolbar.redoKey')} aria-label={t('toolbar.redo')}>
                <Redo2 size={15} />
              </button>
              <div className="h-4 w-px bg-gray-200 dark:bg-zinc-700" />
            </>
          )}

          {/* #13 – Snap Toggle */}
          {!readOnly && (
            <button
              onClick={() => setSnapEnabled(!snapEnabled)}
              className={`p-1.5 rounded-lg transition-colors ${snapEnabled ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}
              title={snapEnabled ? t('toolbar.snapOn') : t('toolbar.snapOff')}
              aria-label={t('toolbar.snapToggle')}
              aria-pressed={snapEnabled}
            >
              <Magnet size={15} />
            </button>
          )}

          {/* Auto-Layout */}
          {!readOnly && (
            <button onClick={handleAutoLayout} disabled={nodes.length === 0} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-30" title={t('toolbar.autoLayout')} aria-label={t('toolbar.autoLayoutLabel')}>
              <GitBranch size={15} />
            </button>
          )}

          {/* Export PNG */}
          <button onClick={handleExportPNG} disabled={nodes.length === 0} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-30" title={t('toolbar.exportPNG')} aria-label={t('toolbar.exportPNG')}>
            <Download size={15} />
          </button>

          {/* #23 – Search */}
          {!readOnly && (
            <button onClick={() => setSearchOpen(!searchOpen)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors" title={t('toolbar.searchNodeKey')} aria-label={t('toolbar.searchNode')}>
              <Search size={15} />
            </button>
          )}

          <div className="h-4 w-px bg-gray-200 dark:bg-zinc-700" />

          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <button onClick={() => { const r = 0.8; setZoom(z => Math.max(0.1, z * r)); setPan(p => { const rect = viewportRef.current?.getBoundingClientRect(); if (!rect) return p; const cx = rect.width / 2; const cy = rect.height / 2; return { x: cx - (cx - p.x) * r, y: cy - (cy - p.y) * r }; }); }} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors" title={t('toolbar.zoomOut')} aria-label={t('toolbar.zoomOut')}>
              <ZoomOut size={15} />
            </button>
            <button onClick={() => { setZoom(1); setPan({ x: 40, y: 40 }); }} className="min-w-[42px] text-center text-xs text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 px-1.5 py-1 rounded-lg transition-colors" title={t('toolbar.zoomReset')} aria-label={`Zoom ${zoomPct}%`}>
              {zoomPct}%
            </button>
            <button onClick={() => { const r = 1.25; setZoom(z => Math.min(5, z * r)); setPan(p => { const rect = viewportRef.current?.getBoundingClientRect(); if (!rect) return p; const cx = rect.width / 2; const cy = rect.height / 2; return { x: cx - (cx - p.x) * r, y: cy - (cy - p.y) * r }; }); }} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors" title={t('toolbar.zoomIn')} aria-label={t('toolbar.zoomIn')}>
              <ZoomIn size={15} />
            </button>
            <button onClick={fitToScreen} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors" title={t('toolbar.fitScreen')} aria-label={t('toolbar.fitScreen')}>
              <Crosshair size={15} />
            </button>
          </div>

          <div className="h-4 w-px bg-gray-200 dark:bg-zinc-700" />

          {/* Scroll Speed */}
          <div className="flex items-center gap-1.5 px-1">
            <MousePointer size={13} className="text-gray-400 dark:text-zinc-500 shrink-0" />
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={scrollSpeed}
              onChange={e => setScrollSpeed(Number(e.target.value))}
              className="w-14 h-1 accent-gray-400 dark:accent-zinc-500 cursor-pointer"
              title={t('toolbar.scrollSpeed')}
              aria-label={t('toolbar.scrollSpeed')}
            />
          </div>

          {/* Canvas Settings (opacity etc.) */}
          <div className="relative">
            <button
              onClick={() => setShowCanvasSettings(!showCanvasSettings)}
              className={`p-1.5 rounded-lg transition-colors ${showCanvasSettings ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}
              title={t('toolbar.canvasSettings')}
              aria-label={t('toolbar.canvasSettings')}
            >
              <Settings size={15} />
            </button>
            {showCanvasSettings && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowCanvasSettings(false)} />
                <div className="absolute right-0 top-full mt-1.5 z-40 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-2xl p-4 min-w-[220px] max-h-[70vh] overflow-y-auto">
                  <div className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-3">{t('toolbar.canvasSettings')}</div>

                  {/* Phase navigation section */}
                  <div className="border-t border-gray-200 dark:border-zinc-700 pt-3">
                    <div className="text-[10px] font-semibold text-gray-400 dark:text-zinc-600 uppercase tracking-wider mb-2">{t('settings.phaseNavSection')}</div>

                    {/* Phase zoom: auto vs manual */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-gray-600 dark:text-zinc-400">{t('settings.phaseZoom')}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setPhaseZoomAuto(true)}
                            className={`text-[10px] px-1.5 py-0.5 rounded ${phaseZoomAuto ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-semibold' : 'text-gray-400 dark:text-zinc-600 hover:text-gray-600'}`}
                          >
                            Auto
                          </button>
                          <button
                            onClick={() => setPhaseZoomAuto(false)}
                            className={`text-[10px] px-1.5 py-0.5 rounded ${!phaseZoomAuto ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-semibold' : 'text-gray-400 dark:text-zinc-600 hover:text-gray-600'}`}
                          >
                            {t('settings.phaseZoomManual')}
                          </button>
                        </div>
                      </div>
                      {!phaseZoomAuto && (
                        <div className="flex items-center gap-2">
                          <input
                            type="range" min={10} max={100} step={5} value={phaseZoomLevel}
                            onChange={e => setPhaseZoomLevel(Number(e.target.value))}
                            className="flex-1 h-1 accent-purple-500 cursor-pointer"
                          />
                          <span className="text-[10px] text-gray-400 dark:text-zinc-600 tabular-nums w-7 text-right">{phaseZoomLevel}%</span>
                        </div>
                      )}
                    </div>

                    {/* Animated toggle */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-600 dark:text-zinc-400">{t('settings.phaseAnimated')}</span>
                      <button
                        onClick={() => setPhaseAnimated(!phaseAnimated)}
                        className={`w-8 h-4.5 rounded-full transition-colors relative ${phaseAnimated ? 'bg-purple-500' : 'bg-gray-300 dark:bg-zinc-600'}`}
                      >
                        <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-transform ${phaseAnimated ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </button>
                    </div>

                    {/* Animation speed */}
                    {phaseAnimated && (
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-gray-600 dark:text-zinc-400">{t('settings.phaseSpeed')}</span>
                          <span className="text-[10px] text-gray-400 dark:text-zinc-600 tabular-nums">{phaseAnimSpeed}ms</span>
                        </div>
                        <input
                          type="range" min={200} max={1500} step={100} value={phaseAnimSpeed}
                          onChange={e => setPhaseAnimSpeed(Number(e.target.value))}
                          className="w-full h-1 accent-purple-500 cursor-pointer"
                        />
                      </div>
                    )}
                  </div>

                  {/* ── Connection Settings ── */}
                  <div className="border-t border-gray-200 dark:border-zinc-700 pt-3 mt-3">
                    <div className="text-[10px] font-semibold text-gray-400 dark:text-zinc-600 uppercase tracking-wider mb-2">{t('settings.connSection')}</div>

                    {/* Curve style */}
                    <div className="mb-3">
                      <span className="text-xs text-gray-600 dark:text-zinc-400 block mb-1.5">{t('settings.connCurve')}</span>
                      <div className="flex items-center gap-1">
                        {(['bezier', 'straight', 'elbow'] as const).map(v => (
                          <button key={v} onClick={() => setConnCurveStyle(v)}
                            className={`text-[10px] px-2 py-1 rounded-md transition-colors ${connCurveStyle === v ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-semibold' : 'text-gray-400 dark:text-zinc-600 hover:text-gray-600 dark:hover:text-zinc-400 bg-gray-50 dark:bg-zinc-800'}`}
                          >
                            {t(`settings.curve${v.charAt(0).toUpperCase() + v.slice(1)}` as 'settings.curveBezier')}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Line style */}
                    <div className="mb-3">
                      <span className="text-xs text-gray-600 dark:text-zinc-400 block mb-1.5">{t('settings.connLineStyle')}</span>
                      <div className="flex items-center gap-1">
                        {(['solid', 'dashed', 'dotted'] as const).map(v => (
                          <button key={v} onClick={() => setConnLineStyle(v)}
                            className={`flex items-center justify-center w-10 h-7 rounded-md transition-colors ${connLineStyle === v ? 'bg-purple-100 dark:bg-purple-500/20 ring-1 ring-purple-400' : 'bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700'}`}
                            title={v}
                          >
                            <svg width="24" height="4" viewBox="0 0 24 4">
                              <line x1="0" y1="2" x2="24" y2="2"
                                stroke={connLineStyle === v ? '#a855f7' : '#9ca3af'}
                                strokeWidth="2"
                                strokeDasharray={v === 'dashed' ? '4,3' : v === 'dotted' ? '2,3' : undefined}
                              />
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Arrow head */}
                    <div className="mb-3">
                      <span className="text-xs text-gray-600 dark:text-zinc-400 block mb-1.5">{t('settings.connArrowHead')}</span>
                      <div className="flex items-center gap-1">
                        {(['none', 'arrow', 'diamond', 'circle'] as const).map(v => (
                          <button key={v} onClick={() => setConnArrowHead(v)}
                            className={`text-[10px] px-2 py-1 rounded-md transition-colors ${connArrowHead === v ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-semibold' : 'text-gray-400 dark:text-zinc-600 hover:text-gray-600 dark:hover:text-zinc-400 bg-gray-50 dark:bg-zinc-800'}`}
                          >
                            {v === 'none' ? '—' : v === 'arrow' ? '→' : v === 'diamond' ? '◇' : '●'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Color theme */}
                    <div className="mb-3">
                      <span className="text-xs text-gray-600 dark:text-zinc-400 block mb-1.5">{t('settings.connColor')}</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {Object.keys(CONN_COLORS).map(v => (
                          <button key={v} onClick={() => setConnColorTheme(v)}
                            className={`w-5 h-5 rounded-full transition-all ${connColorTheme === v ? 'ring-2 ring-offset-1 ring-purple-400 dark:ring-offset-zinc-900 scale-110' : 'hover:scale-105'}`}
                            style={{ background: CONN_COLORS[v].selected }}
                            title={v.charAt(0).toUpperCase() + v.slice(1)}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Stroke width */}
                    <div className="mb-3">
                      <span className="text-xs text-gray-600 dark:text-zinc-400 block mb-1.5">{lang === 'en' ? 'Stroke Width' : 'Linienstärke'}</span>
                      <div className="flex items-center gap-1">
                        {([1, 2, 3] as const).map(v => (
                          <button key={v} onClick={() => setConnStrokeWidth(v)}
                            className={`flex items-center justify-center w-10 h-7 rounded-md transition-colors ${connStrokeWidth === v ? 'bg-purple-100 dark:bg-purple-500/20 ring-1 ring-purple-400' : 'bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700'}`}
                            title={v === 1 ? 'Thin' : v === 2 ? 'Normal' : 'Bold'}
                          >
                            <svg width="24" height="8" viewBox="0 0 24 8">
                              <line x1="0" y1="4" x2="24" y2="4" stroke={connStrokeWidth === v ? '#a855f7' : '#9ca3af'} strokeWidth={v} />
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Glow toggle */}
                    <div>
                      <button
                        onClick={() => setConnGlow(!connGlow)}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${connGlow ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 ring-1 ring-purple-400' : 'bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-700'}`}
                      >
                        <Sparkles size={12} />
                        {lang === 'en' ? 'Glow Effect' : 'Leuchteffekt'}
                      </button>
                    </div>
                  </div>

                  {/* ── Node Design Themes ── */}
                  <div className="border-t border-gray-200 dark:border-zinc-700 pt-3 mt-3">
                    <div className="text-[10px] font-semibold text-gray-400 dark:text-zinc-600 uppercase tracking-wider mb-2">{t('settings.nodeDesign')}</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {([
                        { key: 'default' as const, de: 'Standard', en: 'Default', preview: 'bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700' },
                        { key: 'glass' as const, de: 'Glas', en: 'Glass', preview: 'bg-purple-50/50 dark:bg-purple-500/5 border border-purple-200/40 backdrop-blur-sm' },
                        { key: 'minimal' as const, de: 'Minimal', en: 'Minimal', preview: 'bg-transparent border border-gray-300 dark:border-zinc-600' },
                        { key: 'outlined' as const, de: 'Outlined', en: 'Outlined', preview: 'bg-white dark:bg-zinc-800 border-l-[3px] border-l-purple-500 border border-gray-200 dark:border-zinc-700' },
                        { key: 'neon' as const, de: 'Neon', en: 'Neon', preview: 'bg-[#0c0c14] border-2 border-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]' },
                        { key: 'gradient' as const, de: 'Gradient', en: 'Gradient', preview: 'bg-gradient-to-br from-purple-500/80 to-purple-500/50 border-0' },
                        { key: 'solid' as const, de: 'Solid', en: 'Solid', preview: 'bg-purple-500 border-0' },
                        { key: 'wire' as const, de: 'Wire', en: 'Wire', preview: 'bg-transparent border-2 border-dashed border-purple-400/50' },
                      ]).map(th => (
                        <button
                          key={th.key}
                          onClick={() => setNodeDesignTheme(th.key)}
                          className={`flex flex-col items-center gap-1 px-1.5 py-1.5 rounded-lg transition-all ${
                            nodeDesignTheme === th.key
                              ? 'ring-2 ring-purple-400 bg-purple-50 dark:bg-purple-500/10'
                              : 'hover:bg-gray-100 dark:hover:bg-zinc-800'
                          }`}
                        >
                          <div className={`w-full h-5 rounded-md ${th.preview}`} />
                          <span className={`text-[9px] ${nodeDesignTheme === th.key ? 'text-purple-600 dark:text-purple-400 font-semibold' : 'text-gray-500 dark:text-zinc-500'}`}>
                            {lang === 'en' ? th.en : th.de}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ── Node Layout ── */}
                  <div className="border-t border-gray-200 dark:border-zinc-700 pt-3 mt-3">
                    <div className="text-[10px] font-semibold text-gray-400 dark:text-zinc-600 uppercase tracking-wider mb-2">{lang === 'en' ? 'Node Layout' : 'Node-Anordnung'}</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {([
                        { key: 'standard' as const, de: 'Standard', en: 'Standard', icon: '☰' },
                        { key: 'centered' as const, de: 'Zentriert', en: 'Centered', icon: '◎' },
                        { key: 'compact' as const, de: 'Kompakt', en: 'Compact', icon: '▬' },
                        { key: 'icon-focus' as const, de: 'Icon-Fokus', en: 'Icon Focus', icon: '◉' },
                      ]).map(lo => (
                        <button
                          key={lo.key}
                          onClick={() => setNodeLayout(lo.key)}
                          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] transition-all ${
                            nodeLayout === lo.key
                              ? 'ring-2 ring-purple-400 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold'
                              : 'text-gray-500 dark:text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800'
                          }`}
                        >
                          <span className="text-sm">{lo.icon}</span>
                          {lang === 'en' ? lo.en : lo.de}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ── Connection Presets ── */}
                  <div className="border-t border-gray-200 dark:border-zinc-700 pt-3 mt-3">
                    <div className="text-[10px] font-semibold text-gray-400 dark:text-zinc-600 uppercase tracking-wider mb-2">{lang === 'en' ? 'Connection Presets' : 'Verbindungs-Presets'}</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {([
                        { key: 'default', de: 'Standard', en: 'Default', curve: 'bezier' as const, line: 'solid' as const, width: 2 as const, arrow: 'arrow' as const, color: 'purple', glow: false },
                        { key: 'neon-glow', de: 'Neon-Glow', en: 'Neon Glow', curve: 'bezier' as const, line: 'solid' as const, width: 2 as const, arrow: 'arrow' as const, color: 'neon', glow: true },
                        { key: 'blueprint', de: 'Blueprint', en: 'Blueprint', curve: 'straight' as const, line: 'dashed' as const, width: 1 as const, arrow: 'circle' as const, color: 'blue', glow: false },
                        { key: 'bold', de: 'Kräftig', en: 'Bold', curve: 'elbow' as const, line: 'solid' as const, width: 3 as const, arrow: 'diamond' as const, color: 'mono', glow: false },
                        { key: 'elegant', de: 'Elegant', en: 'Elegant', curve: 'bezier' as const, line: 'dotted' as const, width: 1 as const, arrow: 'none' as const, color: 'pastel', glow: false },
                        { key: 'cyber', de: 'Cyber', en: 'Cyber', curve: 'straight' as const, line: 'solid' as const, width: 3 as const, arrow: 'arrow' as const, color: 'neon', glow: true },
                      ]).map(preset => (
                        <button
                          key={preset.key}
                          onClick={() => {
                            setConnCurveStyle(preset.curve);
                            setConnLineStyle(preset.line);
                            setConnStrokeWidth(preset.width);
                            setConnArrowHead(preset.arrow);
                            setConnColorTheme(preset.color);
                            setConnGlow(preset.glow);
                          }}
                          className={`text-[10px] px-2 py-1.5 rounded-lg transition-colors ${
                            connCurveStyle === preset.curve && connLineStyle === preset.line && connStrokeWidth === preset.width && connColorTheme === preset.color && connGlow === preset.glow
                              ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-semibold ring-1 ring-purple-400'
                              : 'text-gray-500 dark:text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800'
                          }`}
                        >
                          {lang === 'en' ? preset.en : preset.de}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="h-4 w-px bg-gray-200 dark:bg-zinc-700" />

          {/* #24 – Shortcuts Help */}
          <button onClick={() => setShowShortcuts(!showShortcuts)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors" title={t('toolbar.shortcutsKey')} aria-label={t('toolbar.shortcutsShow')}>
            <HelpCircle size={15} />
          </button>

          <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors" title={isFullscreen ? t('toolbar.fullscreenExit') : t('toolbar.fullscreen')} aria-label={isFullscreen ? t('toolbar.fullscreenExit') : t('toolbar.fullscreen')}>
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>

          {!readOnly && (
            <button
              onClick={() => { setIsPresentationMode(true); setIsFullscreen(true); setPaletteOpen(false); setTimeout(() => fitToScreen(), 100); }}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              title={lang === 'en' ? 'Presentation Mode' : 'Präsentationsmodus'}
            >
              <Eye size={15} />
            </button>
          )}

          {initialSystem && (
            <>
              <div className="h-4 w-px bg-gray-200 dark:bg-zinc-700" />
              <button
                onClick={handleExecute}
                disabled={effectiveIsExecuting}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                  effectiveExecutionDone
                    ? 'bg-emerald-600 text-white shadow-[0_0_12px_4px_rgba(16,185,129,0.25)]'
                    : effectiveIsExecuting
                    ? 'bg-purple-600/80 text-white cursor-wait'
                    : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white'
                }`}
                aria-label={t('toolbar.execute')}
              >
                {effectiveIsExecuting && !effectiveExecutionDone ? <Loader2 size={14} className="animate-spin" /> : effectiveExecutionDone ? <Check size={14} /> : <Play size={14} />}
                <span className="hidden sm:inline">{effectiveIsExecuting && !effectiveExecutionDone ? t('toolbar.running') : effectiveExecutionDone ? t('toolbar.done') : t('toolbar.run')}</span>
              </button>
            </>
          )}

          {!readOnly && (
            <>
              <div className="h-4 w-px bg-gray-200 dark:bg-zinc-700" />

              <div className="text-[11px] text-gray-400 dark:text-zinc-600">
                {nodes.length} Nodes · {connections.length} Conn
              </div>

              {(selectedNodeId || selectedGroupId || selectedStickyId || multiSelectedIds.size > 0) && (
                <button
                  onClick={() => {
                    pushHistory();
                    if (multiSelectedIds.size > 0) {
                      const idSet = new Set(multiSelectedIds);
                      setNodes(prev => prev.filter(n => !idSet.has(n.id)));
                      setConnections(prev => prev.filter(c => !idSet.has(c.from) && !idSet.has(c.to)));
                      setStickyConnections(prev => prev.filter(sc => !idSet.has(sc.nodeId)));
                      setMultiSelectedIds(new Set());
                    } else if (selectedNodeId) {
                      setNodes(prev => prev.filter(n => n.id !== selectedNodeId));
                      setConnections(prev => prev.filter(c => c.from !== selectedNodeId && c.to !== selectedNodeId));
                      setStickyConnections(prev => prev.filter(sc => sc.nodeId !== selectedNodeId));
                      setSelectedNodeId(null);
                    } else if (selectedGroupId) {
                      setGroups(prev => prev.filter(g => g.id !== selectedGroupId));
                      setSelectedGroupId(null);
                    } else if (selectedStickyId) {
                      setStickyNotes(prev => prev.filter(s => s.id !== selectedStickyId));
                      setStickyConnections(prev => prev.filter(sc => sc.stickyId !== selectedStickyId));
                      setSelectedStickyId(null);
                    }
                  }}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  aria-label={t('toolbar.deleteSelection')}
                >
                  <Trash2 size={13} />
                </button>
              )}

              {/* #22 – Duplicate button */}
              {(selectedNodeId || multiSelectedIds.size > 0) && (
                <button onClick={duplicateSelection} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors" title={t('toolbar.duplicate')} aria-label={t('toolbar.duplicateSelection')}>
                  <Copy size={13} />
                </button>
              )}

              {hasUnsavedChanges && (
                <button onClick={handleDiscard} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors" title={lang === 'en' ? 'Discard changes' : 'Änderungen verwerfen'} aria-label={lang === 'en' ? 'Discard changes' : 'Änderungen verwerfen'}>
                  <Undo2 size={13} />
                </button>
              )}

              <button onClick={handleSave} disabled={!systemName.trim() || nodes.length === 0 || saveState === 'saving'} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 ${saveState === 'saved' ? 'bg-emerald-600 shadow-[0_0_12px_4px_rgba(16,185,129,0.25)]' : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400'}`} aria-label={t('toolbar.saveSystem')}>
                {saveState === 'saving' ? <Loader2 size={14} className="animate-spin" /> : saveState === 'saved' ? <Check size={14} /> : <Save size={14} />}
                {saveState === 'saving' ? t('toolbar.saving') : saveState === 'saved' ? t('toolbar.saved') : t('toolbar.save')}
              </button>
            </>
          )}
        </div>}

        {/* #23 – Search Bar */}
        {searchOpen && (
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 z-10 shrink-0">
            <Search size={14} className="text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('search.placeholder')}
              className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none"
              autoFocus
              aria-label={t('search.label')}
            />
            {searchResults.length > 0 && (
              <span className="text-xs text-gray-400">{t('search.results', { count: searchResults.length })}</span>
            )}
            <button onClick={() => { setSearchOpen(false); setSearchQuery(''); }} className="p-1 rounded text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800">
              <Scissors size={12} />
            </button>
          </div>
        )}
        {searchOpen && searchResults.length > 0 && (
          <div className="absolute top-[88px] left-56 right-0 max-h-48 overflow-y-auto bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 z-20 shadow-lg">
            {searchResults.map(node => {
              const style = NODE_STYLES[node.type];
              return (
                <button key={node.id} onClick={() => focusNode(node.id)} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-zinc-800 text-left">
                  <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: style.accent + '15' }}>
                    {renderIcon(node, 13)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-gray-900 dark:text-white truncate">{node.label}</div>
                    {node.description && <div className="text-[10px] text-gray-400 truncate">{node.description}</div>}
                  </div>
                  <span className="ml-auto text-[10px] text-gray-400 uppercase">{t('nodeType.' + node.type)}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* ─── Viewport ─── */}
        <div
          ref={viewportRef}
          className={`flex-1 overflow-hidden relative select-none ${isDragOver ? 'ring-2 ring-inset ring-purple-500/30 bg-purple-500/5' : ''}`}
          style={{ cursor: isPanning && panThresholdMet ? 'grabbing' : (spaceHeld ? 'grab' : connectingStickyId ? 'crosshair' : 'default'), touchAction: 'none' }}
          onMouseDown={handleViewportMouseDown}
          onMouseMove={handleViewportMouseMove}
          onMouseUp={handleViewportMouseUp}
          onMouseLeave={handleViewportMouseUp}
          onContextMenu={e => {
            // Only show canvas context menu if right-clicking empty area
            const target = e.target as HTMLElement;
            const isEmptyArea = target === viewportRef.current || target.classList.contains('canvas-inner') || target.tagName === 'svg' || target.closest('.canvas-inner');
            if (isEmptyArea && !e.defaultPrevented) {
              e.preventDefault();
              e.stopPropagation();
              if (readOnly) return;
              const cPos = screenToCanvas(e.clientX, e.clientY);
              setContextMenu({ x: e.clientX, y: e.clientY, canvasPos: { x: cPos.x, y: cPos.y } });
            }
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          role="region"
          aria-label="Workflow-Zeichenfläche"
        >
          {/* Dot Grid Background */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle, ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'} 1px, transparent 1px)`,
              backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
              backgroundPosition: `${pan.x % (20 * zoom)}px ${pan.y % (20 * zoom)}px`,
            }}
          />

          {/* Transform Container */}
          <div
            className="canvas-inner absolute"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
              width: canvasW,
              height: canvasH,
            }}
          >
            {/* SVG Connections */}
            <svg className="absolute inset-0 pointer-events-none" style={{ width: canvasW, height: canvasH, overflow: 'visible' }}>
              {/* SVG Marker defs for arrowheads */}
              {(() => {
                const cc = CONN_COLORS[connColorTheme];
                return (
                  <defs>
                    <marker id="conn-arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto" markerUnits="userSpaceOnUse">
                      <path d="M 0 0 L 10 3.5 L 0 7" fill="none" stroke={cc.selected} strokeWidth="1.5" />
                    </marker>
                    <marker id="conn-diamond" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto" markerUnits="userSpaceOnUse">
                      <path d="M 0 5 L 5 0 L 10 5 L 5 10 Z" fill={cc.selected} />
                    </marker>
                    <marker id="conn-circle" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto" markerUnits="userSpaceOnUse">
                      <circle cx="4" cy="4" r="3" fill={cc.selected} />
                    </marker>
                  </defs>
                );
              })()}

              {connections.map((conn, i) => {
                const fromNode = nodes.find(n => n.id === conn.from);
                const toNode = nodes.find(n => n.id === conn.to);
                if (!fromNode || !toNode) return null;
                const fp = conn.fromPort || 'right';
                const tp = conn.toPort || 'left';
                const pathD = connCurveStyle === 'straight' ? getStraightPath(fromNode, toNode, fp, tp) : connCurveStyle === 'elbow' ? getElbowPath(fromNode, toNode, fp, tp) : getConnectionPath(fromNode, toNode, fp, tp);
                const isSelected = selectedConnId === i;
                const isHovered = hoveredConnId === i;
                const cc = CONN_COLORS[connColorTheme];
                const markerEnd = connArrowHead !== 'none' ? `url(#conn-${connArrowHead})` : undefined;
                const dashArr = STROKE_DASH[connLineStyle];

                // Connection dot color based on node execution states
                const fromStatus = externalNodeStates?.get(conn.from) || 'idle';
                const toStatus = externalNodeStates?.get(conn.to) || 'idle';
                let dotColor = cc.dot;
                let dotSpeed = 2.5 + i * 0.3;
                let dotR = 3;
                if (fromStatus === 'completed' && toStatus === 'completed') {
                  dotColor = '#10b981'; dotSpeed = 2; dotR = 3.5;
                } else if (fromStatus === 'completed' && (toStatus === 'running' || toStatus === 'pending')) {
                  dotColor = '#3b82f6'; dotSpeed = 1.2; dotR = 4;
                } else if (fromStatus === 'running') {
                  dotColor = '#3b82f6'; dotSpeed = 1.8; dotR = 3.5;
                }

                // Compute midpoint once for label + insert button
                const connMid = (() => {
                  const fp2 = conn.fromPort || 'right';
                  const tp2 = conn.toPort || 'left';
                  return getPathMidpoint(fromNode, toNode, fp2, tp2, connCurveStyle);
                })();
                const isEditingThisLabel = editingConnLabel !== null && editingConnLabel.connIdx === i;

                return (
                  <g
                    key={i}
                    style={{ pointerEvents: 'stroke' }}
                    onClick={(e) => { if (readOnly) return; e.stopPropagation(); setSelectedConnId(i); setSelectedNodeId(null); setSelectedGroupId(null); }}
                    onDoubleClick={(e) => { if (readOnly) return; e.stopPropagation(); startConnLabelEdit(i); }}
                    onMouseEnter={() => !readOnly && setHoveredConnId(i)}
                    onMouseLeave={() => setHoveredConnId(null)}
                    onContextMenu={e => handleContextMenu(e, undefined, undefined, i)}
                  >
                    <path d={pathD} stroke="transparent" strokeWidth={12 / zoom} fill="none" style={{ cursor: readOnly ? 'default' : 'pointer', pointerEvents: 'stroke' }} />
                    {connGlow && (
                      <path d={pathD} stroke={cc.selected} strokeWidth={connStrokeWidth * 4} fill="none" opacity={0.1} />
                    )}
                    <path
                      d={pathD}
                      stroke={isSelected ? cc.selected : isHovered ? cc.hover : cc.default}
                      strokeWidth={isSelected ? connStrokeWidth + 1 : isHovered ? connStrokeWidth + 0.5 : connStrokeWidth}
                      strokeDasharray={dashArr}
                      markerEnd={markerEnd}
                      fill="none"
                    />
                    <circle r={dotR} fill={dotColor} opacity={0.8}>
                      <animateMotion dur={`${dotSpeed}s`} repeatCount="indefinite" path={pathD} />
                    </circle>

                    {/* Connection label (pill at midpoint) */}
                    {conn.label && !isEditingThisLabel && (
                      <foreignObject
                        x={connMid.x - 60}
                        y={connMid.y - 22}
                        width={120}
                        height={24}
                        style={{ pointerEvents: 'all', overflow: 'visible' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                          <div
                            onDoubleClick={(e) => { if (readOnly) return; e.stopPropagation(); startConnLabelEdit(i); }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '1px 8px',
                              fontSize: 10,
                              fontFamily: 'system-ui, sans-serif',
                              lineHeight: '16px',
                              whiteSpace: 'nowrap',
                              borderRadius: 9999,
                              background: isDark ? 'rgba(39,39,42,0.95)' : 'rgba(255,255,255,0.95)',
                              border: `1px solid ${isDark ? 'rgba(63,63,70,0.6)' : 'rgba(209,213,219,0.8)'}`,
                              color: isDark ? '#d4d4d8' : '#374151',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                              cursor: readOnly ? 'default' : 'pointer',
                              maxWidth: 120,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                            title={conn.label}
                          >
                            {conn.label}
                          </div>
                        </div>
                      </foreignObject>
                    )}

                    {/* Inline label editing input */}
                    {isEditingThisLabel && (
                      <foreignObject
                        x={connMid.x - 70}
                        y={connMid.y - 16}
                        width={140}
                        height={32}
                        style={{ pointerEvents: 'all', overflow: 'visible' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                          <input
                            autoFocus
                            type="text"
                            value={editingConnLabel.label}
                            onChange={e => setEditingConnLabel(prev => prev ? { ...prev, label: e.target.value } : prev)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') { e.preventDefault(); saveConnLabel(); }
                              if (e.key === 'Escape') { e.preventDefault(); setEditingConnLabel(null); }
                              e.stopPropagation();
                            }}
                            onBlur={() => saveConnLabel()}
                            onClick={e => e.stopPropagation()}
                            placeholder={lang === 'en' ? 'Label...' : 'Label...'}
                            style={{
                              width: 130,
                              height: 24,
                              padding: '2px 8px',
                              fontSize: 10,
                              fontFamily: 'system-ui, sans-serif',
                              borderRadius: 9999,
                              border: `1.5px solid ${isDark ? 'rgba(139,92,246,0.6)' : 'rgba(139,92,246,0.5)'}`,
                              background: isDark ? 'rgba(39,39,42,0.98)' : 'rgba(255,255,255,0.98)',
                              color: isDark ? '#e4e4e7' : '#1f2937',
                              outline: 'none',
                              textAlign: 'center',
                              boxShadow: '0 0 0 2px rgba(139,92,246,0.15), 0 2px 6px rgba(0,0,0,0.1)',
                            }}
                          />
                        </div>
                      </foreignObject>
                    )}

                    {isHovered && !readOnly && !isEditingThisLabel && (
                      <foreignObject x={connMid.x - 12} y={conn.label ? connMid.y - 38 : connMid.y - 12} width={24} height={24} style={{ pointerEvents: 'all', overflow: 'visible' }}>
                          <div style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); showInsertPopover(i); }}
                              className="w-6 h-6 rounded-full bg-purple-500 hover:bg-purple-400 text-white flex items-center justify-center shadow-lg transition-all hover:scale-110 border-2 border-white dark:border-zinc-900"
                              title={t('conn.insertNode')}
                              style={{ fontSize: 16, lineHeight: 1, fontWeight: 700, cursor: 'pointer' }}
                            >
                              +
                            </button>
                          </div>
                        </foreignObject>
                    )}
                  </g>
                );
              })}

              {/* ─── Sticky-to-Node Connection Lines (#40) ─── */}
              {stickyConnections.map((sc, i) => {
                const sticky = stickyNotes.find(s => s.id === sc.stickyId);
                const node = nodes.find(n => n.id === sc.nodeId);
                if (!sticky || !node) return null;
                const sx = sticky.x + sticky.width / 2;
                const sy = sticky.y + sticky.height / 2;
                const nx = node.x + NODE_W / 2;
                const ny = node.y + NODE_H / 2;
                return (
                  <line
                    key={`sc-${i}`}
                    x1={sx} y1={sy} x2={nx} y2={ny}
                    stroke={isDark ? 'rgba(161,161,170,0.35)' : 'rgba(107,114,128,0.35)'}
                    strokeWidth={1.5}
                    strokeDasharray="6,4"
                    style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
                    onContextMenu={(e) => {
                      if (readOnly) return;
                      e.preventDefault();
                      e.stopPropagation();
                      pushHistory();
                      setStickyConnections(prev => prev.filter((_, idx) => idx !== i));
                    }}
                  />
                );
              })}

              {/* Temp sticky connection line (during drawing) */}
              {connectingStickyId && stickyConnMousePos && (() => {
                const sticky = stickyNotes.find(s => s.id === connectingStickyId);
                if (!sticky) return null;
                const sx = sticky.x + sticky.width / 2;
                const sy = sticky.y + sticky.height / 2;
                return (
                  <line
                    x1={sx} y1={sy}
                    x2={stickyConnMousePos.x} y2={stickyConnMousePos.y}
                    stroke="#a855f7"
                    strokeWidth={1.5}
                    strokeDasharray="6,4"
                    opacity={0.6}
                  />
                );
              })()}

              {/* Temp connection line */}
              {connectState && (() => {
                const fromNode = nodes.find(n => n.id === connectState.fromId);
                if (!fromNode) return null;
                const p = getPortPosition(fromNode, connectState.fromPort);
                const dir = PORT_DIR[connectState.fromPort];
                const pathD = getTempPath(p.x, p.y, dir, connectState.canvasX, connectState.canvasY);
                return <path d={pathD} stroke="#a855f7" strokeWidth={2} strokeDasharray="6,4" fill="none" opacity={0.6} />;
              })()}

              {/* Snap guide lines */}
              {snapLines.x.map((x, i) => (
                <line key={`sx-${i}`} x1={x} y1={0} x2={x} y2={canvasH} stroke="#a855f7" strokeWidth={1} strokeDasharray="4,4" opacity={0.5} />
              ))}
              {snapLines.y.map((y, i) => (
                <line key={`sy-${i}`} x1={0} y1={y} x2={canvasW} y2={y} stroke="#a855f7" strokeWidth={1} strokeDasharray="4,4" opacity={0.5} />
              ))}

              {/* Equal-spacing distribution guides */}
              {equalSpacingGuides.map((g, i) => {
                const cap = 12;
                if (g.axis === 'x') {
                  const y = g.segA.cross;
                  return (
                    <g key={`eq-${i}`} opacity={0.7}>
                      <line x1={g.segA.from} y1={y} x2={g.segA.to} y2={y} stroke="#a855f7" strokeWidth={1} strokeDasharray="3,2" />
                      <line x1={g.segA.from} y1={y - cap} x2={g.segA.from} y2={y + cap} stroke="#a855f7" strokeWidth={1} />
                      <line x1={g.segA.to} y1={y - cap} x2={g.segA.to} y2={y + cap} stroke="#a855f7" strokeWidth={1} />
                      <line x1={g.segB.from} y1={y} x2={g.segB.to} y2={y} stroke="#a855f7" strokeWidth={1} strokeDasharray="3,2" />
                      <line x1={g.segB.from} y1={y - cap} x2={g.segB.from} y2={y + cap} stroke="#a855f7" strokeWidth={1} />
                      <line x1={g.segB.to} y1={y - cap} x2={g.segB.to} y2={y + cap} stroke="#a855f7" strokeWidth={1} />
                      <text x={(g.segA.from + g.segA.to) / 2} y={y - cap - 4} fill="#a855f7" fontSize={10} textAnchor="middle" fontFamily="system-ui">{Math.round(g.dist)}</text>
                      <text x={(g.segB.from + g.segB.to) / 2} y={y - cap - 4} fill="#a855f7" fontSize={10} textAnchor="middle" fontFamily="system-ui">{Math.round(g.dist)}</text>
                    </g>
                  );
                } else {
                  const x = g.segA.cross;
                  return (
                    <g key={`eq-${i}`} opacity={0.7}>
                      <line x1={x} y1={g.segA.from} x2={x} y2={g.segA.to} stroke="#a855f7" strokeWidth={1} strokeDasharray="3,2" />
                      <line x1={x - cap} y1={g.segA.from} x2={x + cap} y2={g.segA.from} stroke="#a855f7" strokeWidth={1} />
                      <line x1={x - cap} y1={g.segA.to} x2={x + cap} y2={g.segA.to} stroke="#a855f7" strokeWidth={1} />
                      <line x1={x} y1={g.segB.from} x2={x} y2={g.segB.to} stroke="#a855f7" strokeWidth={1} strokeDasharray="3,2" />
                      <line x1={x - cap} y1={g.segB.from} x2={x + cap} y2={g.segB.from} stroke="#a855f7" strokeWidth={1} />
                      <line x1={x - cap} y1={g.segB.to} x2={x + cap} y2={g.segB.to} stroke="#a855f7" strokeWidth={1} />
                      <text x={x + cap + 6} y={(g.segA.from + g.segA.to) / 2 + 4} fill="#a855f7" fontSize={10} textAnchor="start" fontFamily="system-ui">{Math.round(g.dist)}</text>
                      <text x={x + cap + 6} y={(g.segB.from + g.segB.to) / 2 + 4} fill="#a855f7" fontSize={10} textAnchor="start" fontFamily="system-ui">{Math.round(g.dist)}</text>
                    </g>
                  );
                }
              })}

              {/* Rubber-band selection box */}
              {selectionBox && (
                <rect
                  x={Math.min(selectionBox.startX, selectionBox.currentX)}
                  y={Math.min(selectionBox.startY, selectionBox.currentY)}
                  width={Math.abs(selectionBox.currentX - selectionBox.startX)}
                  height={Math.abs(selectionBox.currentY - selectionBox.startY)}
                  fill="rgba(168,85,247,0.08)"
                  stroke="#a855f7"
                  strokeWidth={1}
                  strokeDasharray="4,3"
                  rx={4}
                />
              )}
            </svg>

            {/* ─── Groups ─── */}
            {groups.map(group => {
              const colors = GROUP_COLORS[group.color] || GROUP_COLORS.gray;
              const isSelected = selectedGroupId === group.id;
              return (
                <div
                  key={group.id}
                  className={`absolute rounded-2xl border-2 border-dashed transition-shadow ${isSelected && !readOnly ? 'ring-2 ring-purple-500/50 shadow-lg' : ''}`}
                  style={{
                    left: group.x, top: group.y, width: group.width, height: group.height,
                    background: colors.bg, borderColor: colors.border,
                    opacity: (100 - groupTransparency) / 100,
                    // #11 – Selected group gets higher z-index
                    zIndex: isSelected ? 3 : 1,
                    cursor: readOnly ? 'default' : (dragGroupState?.groupId === group.id ? 'grabbing' : 'grab'),
                  }}
                  onMouseDown={e => handleGroupMouseDown(e, group.id)}
                  onDoubleClick={() => startGroupEdit(group.id)}
                  onContextMenu={e => handleContextMenu(e, undefined, group.id)}
                  role="group"
                  aria-label={`Gruppe: ${group.label}`}
                >
                  <div className="px-4 py-3">
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: colors.text }}>
                      {group.label}
                    </span>
                    {group.description && (
                      <p className="text-[10px] mt-0.5 opacity-70 leading-tight" style={{ color: colors.text }}>
                        {group.description}
                      </p>
                    )}
                  </div>

                  {isSelected && !readOnly && (
                    <div
                      className="absolute right-0 bottom-0 w-5 h-5 cursor-se-resize z-20"
                      onMouseDown={e => handleGroupResizeStart(e, group.id)}
                    >
                      <svg className="absolute right-1 bottom-1" width="8" height="8" viewBox="0 0 8 8">
                        <path d="M7 1L1 7M7 4L4 7M7 7L7 7" stroke={colors.text} strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}

            {/* ─── Sticky Notes ─── */}
            {stickyNotes.map(sticky => {
              const colors = STICKY_COLORS[sticky.color];
              const isSelected = selectedStickyId === sticky.id;
              return (
                <div
                  key={sticky.id}
                  className={`absolute rounded-xl select-none transition-shadow ${isSelected && !readOnly ? 'ring-2 ring-purple-500/50 shadow-xl' : ''}`}
                  style={{
                    left: sticky.x, top: sticky.y, width: sticky.width, height: sticky.height,
                    background: colors.bg, border: `2px solid ${colors.border}`,
                    boxShadow: isSelected ? undefined : `0 2px 8px ${colors.shadow}, 0 1px 3px rgba(0,0,0,0.06)`,
                    zIndex: isSelected ? 8 : 5,
                    cursor: readOnly ? 'default' : (dragStickyState?.stickyId === sticky.id ? 'grabbing' : 'grab'),
                  }}
                  onMouseDown={e => handleStickyMouseDown(e, sticky.id)}
                  onDoubleClick={() => startStickyEdit(sticky.id)}
                  onContextMenu={e => { if (readOnly) return; e.preventDefault(); e.stopPropagation(); setContextMenu({ x: e.clientX, y: e.clientY, stickyId: sticky.id }); setSelectedStickyId(sticky.id); }}
                >
                  <div className="p-3.5 h-full overflow-hidden">
                    <p className="leading-relaxed whitespace-pre-wrap break-words" style={{
                      color: sticky.customTextColor || colors.text,
                      fontSize: sticky.fontSize || 12,
                      fontWeight: sticky.fontWeight === 'bold' ? 700 : 500,
                      fontStyle: sticky.fontStyle === 'italic' ? 'italic' : 'normal',
                    }}>{sticky.text}</p>
                  </div>
                  {/* Link port for sticky-to-node connection (#40) */}
                  {!readOnly && (isSelected || selectedStickyId === sticky.id) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConnectingStickyId(sticky.id);
                        setStickyConnMousePos(null);
                      }}
                      className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full border flex items-center justify-center z-30 transition-all hover:scale-110 ${
                        connectingStickyId === sticky.id
                          ? 'bg-purple-500 border-purple-400 text-white'
                          : 'bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-600 text-gray-400 hover:text-purple-500 hover:border-purple-400'
                      }`}
                      title={lang === 'en' ? 'Connect to node' : 'Mit Node verbinden'}
                      aria-label={lang === 'en' ? 'Connect sticky to node' : 'Notiz mit Node verbinden'}
                    >
                      <Link2 size={10} strokeWidth={2.5} />
                    </button>
                  )}
                  {isSelected && !readOnly && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); pushHistory(); setStickyNotes(prev => prev.filter(s => s.id !== sticky.id)); setStickyConnections(prev => prev.filter(sc => sc.stickyId !== sticky.id)); setSelectedStickyId(null); }}
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] hover:bg-red-600 z-30"
                        aria-label="Notiz löschen"
                      >
                        <Trash2 size={10} />
                      </button>
                      <div
                        className="absolute right-0 bottom-0 w-5 h-5 cursor-se-resize z-20"
                        onMouseDown={e => handleStickyResizeStart(e, sticky.id)}
                      >
                        <svg className="absolute right-1 bottom-1" width="8" height="8" viewBox="0 0 8 8">
                          <path d="M7 1L1 7M7 4L4 7M7 7L7 7" stroke={colors.text} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
                        </svg>
                      </div>
                    </>
                  )}
                </div>
              );
            })}

            {/* ─── Nodes ─── */}
            {nodes.map(node => {
              const style = NODE_STYLES[node.type];
              const isSelected = selectedNodeId === node.id;
              const isMultiSelected = multiSelectedIds.has(node.id);
              const isConnecting = connectState?.fromId === node.id;

              // Derive execution status: external event-system states take priority, fallback to legacy executingNodes
              const nodeStatus: NodeExecutionStatus = externalNodeStates?.get(node.id)
                || (executingNodes.has(node.id) ? 'completed' : 'idle');
              const isNodeActive = nodeStatus !== 'idle';

              // Per-status visual config — single accent color (purple), subtle transitions
              const statusStyles: Record<NodeExecutionStatus, { ring: string; bg: string; border: string; shadow: string }> = {
                idle:      { ring: '', bg: style.bg, border: (isSelected || isMultiSelected) && !readOnly ? style.accent : style.border, shadow: '' },
                pending:   { ring: 'ring-1 ring-purple-400/40', bg: style.bg, border: 'rgba(168,85,247,0.4)', shadow: '' },
                running:   { ring: 'ring-2 ring-purple-500/70', bg: 'rgba(168,85,247,0.06)', border: '#a855f7', shadow: 'shadow-md shadow-purple-500/10' },
                completed: { ring: 'ring-2 ring-emerald-500', bg: 'rgba(16,185,129,0.08)', border: '#10b981', shadow: 'shadow-md shadow-emerald-500/15' },
                failed:    { ring: 'ring-2 ring-red-500/70', bg: 'rgba(239,68,68,0.06)', border: '#ef4444', shadow: '' },
              };
              const ss = statusStyles[nodeStatus];

              // Node design theme variants
              const isLightText = nodeDesignTheme === 'neon' || nodeDesignTheme === 'gradient' || nodeDesignTheme === 'solid';
              let themeClass: string;
              let themeStyle: React.CSSProperties;
              switch (nodeDesignTheme) {
                case 'glass':
                  themeClass = 'absolute rounded-2xl border-2 backdrop-blur-2xl select-none';
                  themeStyle = {
                    background: `linear-gradient(145deg, ${style.accent}20, ${style.accent}08, transparent)`,
                    borderColor: style.accent + '50',
                    boxShadow: `0 0 40px ${style.accent}20, 0 12px 40px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.08)`,
                  };
                  break;
                case 'minimal':
                  themeClass = 'absolute rounded-lg border select-none';
                  themeStyle = { background: 'transparent', borderColor: ss.border, borderWidth: 1 };
                  break;
                case 'outlined':
                  themeClass = 'absolute border-l-4 border select-none';
                  themeStyle = {
                    borderLeft: `4px solid ${style.accent}`,
                    background: isDark ? 'rgba(24,24,27,0.95)' : 'rgba(255,255,255,0.97)',
                    borderColor: isDark ? 'rgba(63,63,70,0.4)' : 'rgba(229,231,235,0.6)',
                    borderRadius: 4,
                  };
                  break;
                case 'neon':
                  themeClass = 'absolute rounded-lg border-2 select-none';
                  themeStyle = {
                    background: 'rgba(5,5,15,0.98)',
                    borderColor: style.accent,
                    boxShadow: `0 0 20px ${style.accent}70, 0 0 60px ${style.accent}35, 0 0 100px ${style.accent}15, inset 0 0 30px ${style.accent}10`,
                  };
                  break;
                case 'gradient':
                  themeClass = 'absolute rounded-2xl select-none';
                  themeStyle = {
                    background: `linear-gradient(135deg, ${style.accent}, ${style.accent}90)`,
                    border: 'none',
                    boxShadow: `0 12px 40px ${style.accent}40, 0 4px 16px rgba(0,0,0,0.15)`,
                  };
                  break;
                case 'solid':
                  themeClass = 'absolute rounded-xl select-none';
                  themeStyle = {
                    background: `linear-gradient(180deg, ${style.accent}, ${style.accent}cc)`,
                    border: 'none',
                    boxShadow: `0 8px 24px ${style.accent}50, 0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)`,
                  };
                  break;
                case 'wire':
                  themeClass = 'absolute rounded-xl select-none';
                  themeStyle = { background: 'transparent', border: `2px dashed ${style.accent}60` };
                  break;
                default:
                  themeClass = 'absolute rounded-xl border backdrop-blur-sm select-none';
                  themeStyle = { background: ss.bg, borderColor: ss.border };
              }

              return (
                <div
                  key={node.id}
                  data-node-id={node.id}
                  className={`${themeClass} ${dragState?.nodeId === node.id ? '' : 'transition-[box-shadow,border-color,background-color] duration-500'} ${(isSelected || isMultiSelected) && !readOnly && !isNodeActive ? 'ring-2 ring-purple-500 shadow-lg shadow-purple-500/10' : ''} ${isConnecting ? 'ring-2 ring-purple-400 ring-dashed' : ''} ${isNodeActive ? `${ss.ring} ${ss.shadow}` : ''}`}
                  style={{
                    left: node.x, top: node.y, width: NODE_W, height: NODE_H,
                    ...themeStyle,
                    opacity: (100 - nodeTransparency) / 100,
                    cursor: readOnly ? 'default' : (dragState?.nodeId === node.id ? 'grabbing' : 'grab'),
                    zIndex: isNodeActive ? 15 : (isSelected ? 20 : 10),
                  }}
                  onMouseDown={e => handleNodeMouseDown(e, node.id)}
                  onMouseEnter={() => { if (!readOnly) setHoveredNodeId(node.id); }}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  onDoubleClick={() => startNodeEdit(node.id)}
                  onContextMenu={e => handleContextMenu(e, node.id)}
                  role="button"
                  aria-label={`Node: ${node.label}`}
                  tabIndex={0}
                >
                  {nodeLayout === 'centered' ? (
                    <div className="h-full flex flex-col items-center justify-center px-3 text-center">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-1" style={{ background: isLightText ? 'rgba(255,255,255,0.18)' : style.accent + '15' }}>
                        {renderIcon(node, 16)}
                      </div>
                      <div className="font-medium text-[12px] text-gray-900 dark:text-white truncate w-full" style={isLightText ? { color: 'rgba(255,255,255,0.95)' } : undefined}>{node.label}</div>
                      {node.description && <div className="text-[10px] text-gray-500 dark:text-zinc-500 mt-0.5 truncate w-full" style={isLightText ? { color: 'rgba(255,255,255,0.65)' } : undefined}>{node.description}</div>}
                    </div>
                  ) : nodeLayout === 'compact' ? (
                    <div className="h-full flex items-center px-4 gap-2.5">
                      <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style={{ background: isLightText ? 'rgba(255,255,255,0.18)' : style.accent + '15' }}>
                        {renderIcon(node, 14)}
                      </div>
                      <div className="font-medium text-[13px] text-gray-900 dark:text-white truncate" style={isLightText ? { color: 'rgba(255,255,255,0.95)' } : undefined}>{node.label}</div>
                    </div>
                  ) : nodeLayout === 'icon-focus' ? (
                    <div className="h-full flex flex-col items-center justify-center px-3">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-1.5" style={{ background: isLightText ? 'rgba(255,255,255,0.18)' : style.accent + '15' }}>
                        {renderIcon(node, 24)}
                      </div>
                      <div className="font-semibold text-[11px] text-gray-900 dark:text-white truncate w-full text-center" style={isLightText ? { color: 'rgba(255,255,255,0.95)' } : undefined}>{node.label}</div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center px-4 gap-3.5">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: isLightText ? 'rgba(255,255,255,0.18)' : style.accent + '15' }}>
                        {renderIcon(node)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-[13px] text-gray-900 dark:text-white truncate" style={isLightText ? { color: 'rgba(255,255,255,0.95)' } : undefined}>{node.label}</div>
                        {node.description && <div className="text-[11px] text-gray-500 dark:text-zinc-500 mt-0.5 line-clamp-2 leading-tight" style={isLightText ? { color: 'rgba(255,255,255,0.65)' } : undefined}>{node.description}</div>}
                      </div>
                    </div>
                  )}

                  <div className={`absolute -top-2 -right-2 text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 border ${nodeDesignTheme === 'outlined' ? 'rounded-sm' : nodeDesignTheme === 'minimal' ? 'rounded text-[8px]' : 'rounded-md'}`} style={isLightText ? { background: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.9)' } : { background: style.bg, borderColor: style.border, color: style.accent }}>
                    {style.label}
                  </div>

                  {/* Resource badge (top-left) */}
                  {node.linkedResourceType && (
                    <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-500/20 border border-purple-300 dark:border-purple-500/30 flex items-center justify-center" title={`${t('node.linkedResource')}: ${t(`resource.type.${node.linkedResourceType}` as keyof typeof t)}`}>
                      <Paperclip size={10} className="text-purple-600 dark:text-purple-400" />
                    </div>
                  )}

                  {/* Linked page badge (bottom-left) — clickable */}
                  {node.linkedPage && (
                    <button
                      onClick={(e) => { e.stopPropagation(); const systemId = initialSystem?.id || ''; navigate(node.linkedPage! + (node.linkedPage!.includes('?') ? '&' : '?') + 'system=' + systemId); }}
                      className="absolute -bottom-1.5 -left-1.5 h-5 px-1.5 rounded-full bg-blue-100 dark:bg-blue-500/20 border border-blue-300 dark:border-blue-500/30 flex items-center justify-center gap-0.5 hover:bg-blue-200 dark:hover:bg-blue-500/30 transition-colors z-20 cursor-pointer"
                      title={`${lang === 'de' ? 'Öffnen' : 'Open'}: ${LINKABLE_PAGES.find(p => p.value === node.linkedPage)?.label[lang] || node.linkedPage}`}
                    >
                      <Globe size={9} className="text-blue-600 dark:text-blue-400" />
                      <span className="text-[8px] font-semibold text-blue-600 dark:text-blue-400 max-w-[60px] truncate">
                        {LINKABLE_PAGES.find(p => p.value === node.linkedPage)?.label[lang] || node.linkedPage}
                      </span>
                    </button>
                  )}

                  {/* Status overlay icon (bottom-right) — minimal, single accent */}
                  {(nodeStatus === 'running' || nodeStatus === 'completed' || nodeStatus === 'failed') && (
                    <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center z-20 border border-white dark:border-zinc-900 transition-colors duration-300"
                      style={{ background: nodeStatus === 'completed' ? '#10b981' : nodeStatus === 'failed' ? '#ef4444' : '#a855f7' }}
                    >
                      {nodeStatus === 'running' && <Loader2 size={10} className="text-white animate-spin" />}
                      {nodeStatus === 'completed' && <Check size={10} className="text-white" />}
                      {nodeStatus === 'failed' && <X size={10} className="text-white" />}
                    </div>
                  )}

                  {/* 4-Directional Hover Ports — larger hit area for easier clicking */}
                  {!readOnly && (hoveredNodeId === node.id || connectState) && (
                    <>
                      {/* Top */}
                      <div
                        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full border-2 bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-600 flex items-center justify-center hover:bg-purple-100 dark:hover:bg-purple-500/20 hover:border-purple-400 hover:scale-125 transition-all cursor-crosshair z-30 text-gray-400 hover:text-purple-500 animate-in fade-in duration-150"
                        onMouseDown={e => { e.stopPropagation(); handlePortClick(e, node.id, 'top'); }}
                        onClick={e => e.stopPropagation()}
                        role="button"
                        aria-label={`${node.label} Top-Port`}
                      >
                        <Plus size={12} strokeWidth={2.5} />
                      </div>
                      {/* Right */}
                      <div
                        className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full border-2 bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-600 flex items-center justify-center hover:bg-purple-100 dark:hover:bg-purple-500/20 hover:border-purple-400 hover:scale-125 transition-all cursor-crosshair z-30 text-gray-400 hover:text-purple-500 animate-in fade-in duration-150"
                        onMouseDown={e => { e.stopPropagation(); handlePortClick(e, node.id, 'right'); }}
                        onClick={e => e.stopPropagation()}
                        role="button"
                        aria-label={`${node.label} Right-Port`}
                      >
                        <Plus size={12} strokeWidth={2.5} />
                      </div>
                      {/* Bottom */}
                      <div
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-7 h-7 rounded-full border-2 bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-600 flex items-center justify-center hover:bg-purple-100 dark:hover:bg-purple-500/20 hover:border-purple-400 hover:scale-125 transition-all cursor-crosshair z-30 text-gray-400 hover:text-purple-500 animate-in fade-in duration-150"
                        onMouseDown={e => { e.stopPropagation(); handlePortClick(e, node.id, 'bottom'); }}
                        onClick={e => e.stopPropagation()}
                        role="button"
                        aria-label={`${node.label} Bottom-Port`}
                      >
                        <Plus size={12} strokeWidth={2.5} />
                      </div>
                      {/* Left */}
                      <div
                        className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full border-2 bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-600 flex items-center justify-center hover:bg-purple-100 dark:hover:bg-purple-500/20 hover:border-purple-400 hover:scale-125 transition-all cursor-crosshair z-30 text-gray-400 hover:text-purple-500 animate-in fade-in duration-150"
                        onMouseDown={e => { e.stopPropagation(); handlePortClick(e, node.id, 'left'); }}
                        onClick={e => e.stopPropagation()}
                        role="button"
                        aria-label={`${node.label} Left-Port`}
                      >
                        <Plus size={12} strokeWidth={2.5} />
                      </div>
                    </>
                  )}

                  {/* ─── Tooltip on Hover ─── */}
                  {hoveredNodeId === node.id && node.description && (
                    <div
                      className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-50"
                      style={{ bottom: NODE_H + 8 }}
                    >
                      <div className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg px-2.5 py-1.5 shadow-lg"
                        style={{ fontSize: 11, maxWidth: 250, lineHeight: 1.4, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                      >
                        {node.description}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* ─── Insert Node Popover ─── */}
            {insertPopover && !readOnly && (
              <div
                className="absolute bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-xl p-2 z-50"
                style={{ left: insertPopover.x - 100, top: insertPopover.y + 20, width: 200 }}
                onClick={e => e.stopPropagation()}
              >
                <div className="text-[10px] font-semibold text-gray-400 dark:text-zinc-600 uppercase tracking-wider px-2 pb-1 mb-1 border-b border-gray-100 dark:border-zinc-800">
                  {lang === 'en' ? 'Insert Node' : 'Node einfügen'}
                </div>
                <div className="max-h-52 overflow-y-auto space-y-0.5">
                  {PALETTE_ITEMS.map(item => {
                    const isLogo = item.icon.startsWith('logo-');
                    const Icon = !isLogo ? (ICONS[item.icon] || Zap) : null;
                    const st = NODE_STYLES[item.type];
                    return (
                      <button
                        key={item.icon + item.tKey}
                        onClick={() => insertNodeOnConnection(insertPopover.connIdx, item)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-xl text-left hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <div className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ background: st.accent + '15' }}>
                          {isLogo ? renderNodeIcon(item.icon, undefined, <Zap size={10} style={{ color: st.accent }} />, 10) : Icon && <Icon size={10} style={{ color: st.accent }} />}
                        </div>
                        <span className="text-[11px] text-gray-700 dark:text-zinc-300 truncate">{t(item.tKey)}</span>
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setInsertPopover(null)}
                  className="w-full mt-1 pt-1 border-t border-gray-100 dark:border-zinc-800 text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-zinc-400 transition-colors"
                >
                  {lang === 'en' ? 'Cancel' : 'Abbrechen'}
                </button>
              </div>
            )}

            {/* Edit Overlays moved outside transform container below */}
          </div>

          {/* ─── Edit Overlays (outside transform to avoid overflow clipping) ─── */}
          {editNode && !readOnly && (() => {
            const node = nodes.find(n => n.id === editNode);
            if (!node) return null;
            const allIcons = [
              ...Object.keys(ICONS).map(k => ({ id: k, type: 'lucide' as const })),
              ...Object.keys(TOOL_LOGOS).map(k => ({ id: k, type: 'logo' as const })),
            ];
            const panelW = 320;
            const panelMaxH = 380;
            const arrowGap = 10;
            const vpRect = viewportRef.current?.getBoundingClientRect();
            const vpW = vpRect?.width || 800;
            const vpH = vpRect?.height || 600;
            // Node center screen position
            const nodeCenterScreenX = (node.x + NODE_W / 2) * zoom + pan.x;
            const nodeBottomScreenY = (node.y + NODE_H) * zoom + pan.y;
            const nodeTopScreenY = node.y * zoom + pan.y;
            // Position panel centered horizontally on the node
            let panelX = nodeCenterScreenX - panelW / 2;
            // Clamp horizontally within viewport
            panelX = Math.max(8, Math.min(panelX, vpW - panelW - 8));
            // Check if there's room below the node
            const fitsBelow = nodeBottomScreenY + arrowGap + panelMaxH < vpH;
            const panelY = fitsBelow
              ? nodeBottomScreenY + arrowGap
              : Math.max(8, nodeTopScreenY - arrowGap - panelMaxH);
            // Arrow position: center of arrow relative to panel left
            const arrowLeftInPanel = Math.max(16, Math.min(nodeCenterScreenX - panelX, panelW - 16));
            return (
              <div className="absolute z-50" style={{ left: panelX, top: panelY, width: panelW }} onClick={e => e.stopPropagation()} role="dialog" aria-label="Node bearbeiten">
                {/* Arrow pointer */}
                <div className="absolute" style={{
                  left: arrowLeftInPanel - 7,
                  [fitsBelow ? 'top' : 'bottom']: -7,
                }}>
                  <svg width="14" height="8" viewBox="0 0 14 8" style={{ display: 'block', transform: fitsBelow ? undefined : 'rotate(180deg)' }}>
                    <path d="M0 8 L7 0 L14 8 Z" fill={isDark ? '#18181b' : '#fff'} stroke={isDark ? 'rgba(63,63,70,0.6)' : 'rgba(229,231,235,1)'} strokeWidth="1" />
                    {/* Cover the bottom border of the arrow so it merges with the panel */}
                    <line x1="0" y1="8" x2="14" y2="8" stroke={isDark ? '#18181b' : '#fff'} strokeWidth="2" />
                  </svg>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-xl p-4 max-h-[380px] overflow-y-auto">
                  <div className="text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-2">Node bearbeiten</div>
                  {/* #12 – maxLength on inputs */}
                  <input type="text" value={editLabel} onChange={e => setEditLabel(e.target.value.slice(0, MAX_LABEL_LENGTH))} className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white mb-2 focus:outline-none focus:border-purple-500 transition-colors" placeholder="Label" maxLength={MAX_LABEL_LENGTH} autoFocus />
                  <input type="text" value={editDesc} onChange={e => setEditDesc(e.target.value.slice(0, MAX_DESC_LENGTH))} className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-gray-700 dark:text-zinc-300 mb-2 focus:outline-none focus:border-purple-500 transition-colors" placeholder="Beschreibung (optional)" maxLength={MAX_DESC_LENGTH} />

                  <button
                    onClick={() => setShowIconPicker(!showIconPicker)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 mb-2 hover:border-purple-400 transition-colors"
                  >
                    <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: NODE_STYLES[node.type].accent + '15' }}>
                      {renderNodeIcon(editIcon, undefined, (() => { const I = ICONS[editIcon]; return I ? <I size={14} style={{ color: NODE_STYLES[node.type].accent }} /> : <Zap size={14} style={{ color: NODE_STYLES[node.type].accent }} />; })(), 14)}
                    </div>
                    <span className="text-xs text-gray-600 dark:text-zinc-400 flex-1 text-left">Icon ändern</span>
                    <ChevronDown size={12} className={`text-gray-400 transition-transform ${showIconPicker ? 'rotate-180' : ''}`} />
                  </button>

                  {showIconPicker && (
                    <div className="mb-2 max-h-32 overflow-y-auto rounded-xl border border-gray-200 dark:border-zinc-700 p-2">
                      <div className="grid grid-cols-8 gap-1">
                        {allIcons.map(item => {
                          const isIconSelected = editIcon === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => setEditIcon(item.id)}
                              className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${isIconSelected ? 'bg-purple-100 dark:bg-purple-500/20 ring-1 ring-purple-500' : 'hover:bg-gray-100 dark:hover:bg-zinc-800'}`}
                              title={item.type === 'logo' ? TOOL_LOGOS[item.id]?.name : item.id}
                            >
                              {item.type === 'logo'
                                ? renderNodeIcon(item.id, undefined, <Zap size={12} />, 14)
                                : (() => { const I = ICONS[item.id]; return I ? <I size={13} className="text-gray-600 dark:text-zinc-400" /> : null; })()
                              }
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Resource Linking — only for trigger, process, output */}
                  {(node.type === 'trigger' || node.type === 'process' || node.type === 'output') && (
                    <div className="mb-2">
                      <div className="text-[10px] font-medium text-gray-400 dark:text-zinc-500 mb-1 flex items-center gap-1">
                        <Paperclip size={10} />
                        {lang === 'en' ? 'Link Resource' : 'Ressource verknüpfen'}
                      </div>
                      <div className="relative">
                        <select
                          value={editLinkedResource}
                          onChange={e => { setEditLinkedResource(e.target.value); setEditLinkedResourceId(''); }}
                          className="w-full appearance-none bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2 pr-8 text-xs text-gray-700 dark:text-zinc-300 focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
                        >
                          <option value="">{t('node.resourceNone')}</option>
                          <optgroup label={lang === 'en' ? 'Forms & Pages' : 'Formulare & Seiten'}>
                            <option value="form">{lang === 'en' ? 'Onboarding Form' : 'Onboarding Formular'}</option>
                            <option value="page">{lang === 'en' ? 'Landing Page' : 'Landing Page'}</option>
                          </optgroup>
                          <optgroup label={lang === 'en' ? 'Resources' : 'Ressourcen'}>
                            <option value="transcript">{t('resource.type.transcript')}</option>
                            <option value="document">{t('resource.type.document')}</option>
                            <option value="note">{t('resource.type.note')}</option>
                            <option value="dataset">{t('resource.type.dataset')}</option>
                          </optgroup>
                        </select>
                        <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                      {/* Specific resource picker — shows actual files of the selected type */}
                      {editLinkedResource && !['form', 'page'].includes(editLinkedResource) && (() => {
                        const systemId = initialSystem?.id || '';
                        const resources = systemId ? getResourcesForSystem(systemId).filter(r => r.type === editLinkedResource) : [];
                        return resources.length > 0 ? (
                          <div className="relative mt-1.5">
                            <select
                              value={editLinkedResourceId}
                              onChange={e => setEditLinkedResourceId(e.target.value)}
                              className="w-full appearance-none bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 pr-8 text-xs text-gray-700 dark:text-zinc-300 focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
                            >
                              <option value="">{lang === 'en' ? '— All of this type —' : '— Alle dieses Typs —'}</option>
                              {resources.map(r => (
                                <option key={r.id} value={r.id}>{r.title}</option>
                              ))}
                            </select>
                            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                          </div>
                        ) : (
                          <p className="text-[10px] text-gray-400 dark:text-zinc-600 mt-1">
                            {lang === 'en' ? 'No resources of this type yet. Add them in the Resources tab.' : 'Noch keine Ressourcen dieses Typs. Füge sie im Ressourcen-Tab hinzu.'}
                          </p>
                        );
                      })()}
                    </div>
                  )}

                  {/* Linked Page — opens internal page from canvas */}
                  <div className="mb-2">
                    <div className="text-[10px] font-medium text-gray-400 dark:text-zinc-500 mb-1 flex items-center gap-1">
                      <Globe size={10} />
                      {lang === 'en' ? 'Link Page / Tool' : 'Seite / Tool verknüpfen'}
                    </div>
                    <div className="relative">
                      <select
                        value={editLinkedPage}
                        onChange={e => setEditLinkedPage(e.target.value)}
                        className="w-full appearance-none bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2 pr-8 text-xs text-gray-700 dark:text-zinc-300 focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
                      >
                        {LINKABLE_PAGES.map(p => (
                          <option key={p.value} value={p.value}>{p.label[lang]}</option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                    {editLinkedPage && (
                      <p className="text-[10px] text-blue-400 mt-1">{lang === 'de' ? 'Klickbar im Canvas — öffnet die Seite direkt' : 'Clickable on canvas — opens the page directly'}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => { setEditNode(null); setShowIconPicker(false); }} className="flex-1 py-1.5 rounded-xl text-xs border border-gray-200 dark:border-zinc-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">{t('edit.cancel')}</button>
                    <button onClick={saveNodeEdit} className="flex-1 py-1.5 rounded-xl text-xs bg-purple-600 text-white hover:bg-purple-500 transition-colors">{t('edit.save')}</button>
                  </div>
                </div>
              </div>
              );
            })()}

          {editGroupId && !readOnly && (() => {
            const group = groups.find(g => g.id === editGroupId);
            if (!group) return null;
            const gScreenX = group.x * zoom + pan.x;
            const gScreenY = (group.y + group.height + 10) * zoom + pan.y;
            return (
              <div className="absolute bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-xl p-4 z-50" style={{ left: gScreenX, top: gScreenY, width: 260 }} onClick={e => e.stopPropagation()} role="dialog" aria-label={t('edit.editGroupAria')}>
                  <div className="text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-2">{t('edit.editGroup')}</div>
                  <input type="text" value={editGroupLabel} onChange={e => setEditGroupLabel(e.target.value.slice(0, MAX_LABEL_LENGTH))} className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white mb-3 focus:outline-none focus:border-purple-500 transition-colors" placeholder={t('edit.groupPlaceholder')} maxLength={MAX_LABEL_LENGTH} autoFocus />
                  <textarea value={editGroupDesc} onChange={e => setEditGroupDesc(e.target.value.slice(0, 200))} className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-gray-700 dark:text-zinc-300 mb-3 focus:outline-none focus:border-purple-500 transition-colors resize-none h-16" placeholder={lang === 'en' ? 'Description (optional)' : 'Beschreibung (optional)'} maxLength={200} />
                <div className="flex gap-2">
                  <button onClick={() => setEditGroupId(null)} className="flex-1 py-1.5 rounded-xl text-xs border border-gray-200 dark:border-zinc-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">{t('edit.cancel')}</button>
                  <button onClick={saveGroupEdit} className="flex-1 py-1.5 rounded-xl text-xs bg-purple-600 text-white hover:bg-purple-500 transition-colors">{t('edit.save')}</button>
                </div>
              </div>
            );
          })()}

          {/* Sticky Note Edit Overlay */}
          {editStickyId && !readOnly && (() => {
            const sticky = stickyNotes.find(s => s.id === editStickyId);
            if (!sticky) return null;
            const sScreenX = sticky.x * zoom + pan.x;
            const sScreenY = (sticky.y + sticky.height + 10) * zoom + pan.y;
            const TEXT_COLOR_PRESETS = ['#854d0e','#9a3412','#991b1b','#9d174d','#5b21b6','#1e40af','#166534','#374151','#000000','#ffffff'];
            return (
              <div className="absolute bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-xl p-4 z-50" style={{ left: sScreenX, top: sScreenY, width: 280 }} onClick={e => e.stopPropagation()} role="dialog" aria-label={t('edit.editNoteAria')}>
                  <div className="text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-2">{t('edit.editNote')}</div>

                  {/* Color Picker Row */}
                  <div className="mb-3">
                    <div className="text-[10px] font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">{t('edit.noteColor')}</div>
                    <div className="flex gap-1.5 flex-wrap">
                      {(Object.keys(STICKY_COLORS) as StickyNoteColor[]).map(c => (
                        <button
                          key={c}
                          onClick={() => setEditStickyColor(c)}
                          className={`w-6 h-6 rounded-md transition-all ${editStickyColor === c ? 'ring-2 ring-purple-500 ring-offset-1 dark:ring-offset-zinc-900 scale-110' : 'hover:scale-105'}`}
                          style={{ background: STICKY_COLORS[c].bg, border: `1.5px solid ${STICKY_COLORS[c].border}` }}
                          title={STICKY_COLORS[c].name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Formatting Toolbar */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <button
                      onClick={() => setEditStickyBold(b => !b)}
                      className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${editStickyBold ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700'}`}
                      title={t('edit.bold')}
                    >
                      <Bold size={13} />
                    </button>
                    <button
                      onClick={() => setEditStickyItalic(i => !i)}
                      className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${editStickyItalic ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700'}`}
                      title={t('edit.italic')}
                    >
                      <Italic size={13} />
                    </button>
                    <div className="w-px h-5 bg-gray-200 dark:bg-zinc-700 mx-0.5" />
                    {/* Font Size */}
                    <select
                      value={editStickyFontSize}
                      onChange={e => setEditStickyFontSize(Number(e.target.value))}
                      className="h-7 rounded-md bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs text-gray-700 dark:text-zinc-300 px-1.5 focus:outline-none focus:border-purple-500"
                      title={t('edit.fontSize')}
                    >
                      {[10, 11, 12, 14, 16, 18, 20, 24].map(s => (
                        <option key={s} value={s}>{s}px</option>
                      ))}
                    </select>
                    <div className="w-px h-5 bg-gray-200 dark:bg-zinc-700 mx-0.5" />
                    {/* Text Color */}
                    <div className="flex items-center gap-1">
                      {TEXT_COLOR_PRESETS.slice(0, 6).map(c => (
                        <button
                          key={c}
                          onClick={() => setEditStickyTextColor(prev => prev === c ? '' : c)}
                          className={`w-5 h-5 rounded-full transition-all ${editStickyTextColor === c ? 'ring-2 ring-purple-500 ring-offset-1 dark:ring-offset-zinc-900 scale-110' : 'hover:scale-105'}`}
                          style={{ background: c, border: c === '#ffffff' ? '1px solid #d1d5db' : 'none' }}
                          title={t('edit.textColor')}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Textarea */}
                  <textarea value={editStickyText} onChange={e => setEditStickyText(e.target.value.slice(0, 500))} rows={4} className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white mb-3 focus:outline-none focus:border-purple-500 resize-none transition-colors" style={{ fontWeight: editStickyBold ? 700 : 400, fontStyle: editStickyItalic ? 'italic' : 'normal', fontSize: editStickyFontSize, color: editStickyTextColor || undefined }} placeholder={t('edit.notePlaceholder')} maxLength={500} autoFocus />

                <div className="flex gap-2">
                  <button onClick={() => setEditStickyId(null)} className="flex-1 py-1.5 rounded-xl text-xs border border-gray-200 dark:border-zinc-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">{t('edit.cancel')}</button>
                  <button onClick={saveStickyEdit} className="flex-1 py-1.5 rounded-xl text-xs bg-purple-600 text-white hover:bg-purple-500 transition-colors">{t('edit.save')}</button>
                </div>
              </div>
            );
          })()}

          {/* ─── Empty State ─── */}
          {nodes.length === 0 && groups.length === 0 && stickyNotes.length === 0 && !readOnly && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="text-center">
                <MousePointer size={32} className="text-gray-300 dark:text-zinc-700 mx-auto mb-3" />
                <p className="text-sm text-gray-400 dark:text-zinc-600 font-medium">{t('canvas.emptyTitle')}</p>
                <p className="text-xs text-gray-300 dark:text-zinc-700 mt-1">{t('canvas.emptyHint')}</p>
              </div>
            </div>
          )}

          {/* ─── Phase Navigator (fullscreen only) ─── */}
          {isFullscreen && sortedGroups.length > 0 && (
            <div className="absolute bottom-5 left-5 z-50 flex items-center gap-1 select-none">
              {/* Prev phase */}
              <button
                onClick={() => focusGroup(Math.max(0, currentPhaseIndex - 1))}
                disabled={currentPhaseIndex <= 0}
                className="p-1.5 rounded-lg bg-white/90 dark:bg-zinc-900/90 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-30 backdrop-blur-sm shadow-lg"
                title={t('phaseNav.prev')}
              >
                <ChevronLeft size={16} />
              </button>

              {/* Current phase label + dropdown */}
              <div className="relative">
                <button
                  onClick={() => setPhaseDropdownOpen(!phaseDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/90 dark:bg-zinc-900/90 border border-gray-200 dark:border-zinc-700 text-sm font-medium text-gray-800 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors backdrop-blur-sm shadow-lg min-w-[140px] justify-between"
                >
                  <span className="truncate max-w-[200px]">
                    {sortedGroups[currentPhaseIndex]?.label || t('phaseNav.noPhase')}
                  </span>
                  <ChevronUp size={14} className={`shrink-0 text-gray-400 dark:text-zinc-500 transition-transform ${phaseDropdownOpen ? '' : 'rotate-180'}`} />
                </button>

                {/* Phase dropdown */}
                {phaseDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setPhaseDropdownOpen(false)} />
                    <div className="absolute bottom-full left-0 mb-1.5 z-40 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-2xl py-1 min-w-[200px] max-h-[280px] overflow-y-auto backdrop-blur-sm">
                      <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 dark:text-zinc-600 uppercase tracking-wider">{t('phaseNav.jumpTo')}</div>
                      {sortedGroups.map((group, idx) => {
                        const colors = GROUP_COLORS[group.color] || GROUP_COLORS.gray;
                        return (
                          <button
                            key={group.id}
                            onClick={() => focusGroup(idx)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors ${idx === currentPhaseIndex ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold' : 'text-gray-700 dark:text-zinc-300'}`}
                          >
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: colors.border }} />
                            <span className="truncate">{group.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Next phase */}
              <button
                onClick={() => focusGroup(Math.min(sortedGroups.length - 1, currentPhaseIndex + 1))}
                disabled={currentPhaseIndex >= sortedGroups.length - 1}
                className="p-1.5 rounded-lg bg-white/90 dark:bg-zinc-900/90 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-30 backdrop-blur-sm shadow-lg"
                title={t('phaseNav.next')}
              >
                <ChevronRight size={16} />
              </button>

              {/* Phase counter */}
              <span className="text-[10px] text-gray-400 dark:text-zinc-600 ml-1 tabular-nums">
                {currentPhaseIndex + 1}/{sortedGroups.length}
              </span>
            </div>
          )}

          {/* #18 – Toast Message */}
          {toastMessage && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-medium px-4 py-2 rounded-lg shadow-lg animate-fade-in">
              {toastMessage}
            </div>
          )}

          {/* #21 – Context Menu */}
          {contextMenu && (
            <div
              className="fixed z-[100] bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-xl py-1 min-w-[180px] max-h-[400px] overflow-y-auto"
              style={{ left: contextMenu.x, top: contextMenu.y }}
              onClick={e => e.stopPropagation()}
            >
              {/* Node context menu */}
              {contextMenu.nodeId && (
                <>
                  <button onClick={() => handleContextAction('edit')} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800">
                    <Eye size={13} /> {t('contextMenu.edit')}
                  </button>
                  <button onClick={() => handleContextAction('duplicate')} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800">
                    <Copy size={13} /> {t('contextMenu.duplicate')}
                  </button>
                </>
              )}
              {contextMenu.groupId && (
                <button onClick={() => handleContextAction('edit')} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800">
                  <Eye size={13} /> {t('contextMenu.edit')}
                </button>
              )}
              {contextMenu.stickyId && (
                <>
                  <button onClick={() => { startStickyEdit(contextMenu.stickyId!); setContextMenu(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800">
                    <Eye size={13} /> {t('contextMenu.edit')}
                  </button>
                  <button onClick={() => { setConnectingStickyId(contextMenu.stickyId!); setStickyConnMousePos(null); setContextMenu(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800">
                    <Link2 size={13} /> {lang === 'en' ? 'Connect to Node' : 'Mit Node verbinden'}
                  </button>
                  {stickyConnections.some(sc => sc.stickyId === contextMenu.stickyId) && (
                    <button onClick={() => { pushHistory(); setStickyConnections(prev => prev.filter(sc => sc.stickyId !== contextMenu.stickyId)); setContextMenu(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10">
                      <X size={13} /> {lang === 'en' ? 'Remove All Connections' : 'Alle Verbindungen entfernen'}
                    </button>
                  )}
                </>
              )}
              {contextMenu.connIdx !== undefined && (
                <>
                  <button onClick={() => { showInsertPopover(contextMenu.connIdx!); setContextMenu(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800">
                    <Plus size={13} /> {t('contextMenu.insertNode')}
                  </button>
                  <button onClick={() => { startConnLabelEdit(contextMenu.connIdx!); setContextMenu(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800">
                    <Type size={13} /> {lang === 'en' ? 'Edit Label' : 'Label bearbeiten'}
                  </button>
                </>
              )}

              {/* Canvas (empty area) context menu — add nodes/groups/sticky */}
              {contextMenu.canvasPos && !contextMenu.nodeId && !contextMenu.groupId && !contextMenu.stickyId && contextMenu.connIdx === undefined && (
                <>
                  <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">{lang === 'en' ? 'Add Node' : 'Node hinzufügen'}</div>
                  {(['trigger', 'ai', 'process', 'output'] as const).map(type => {
                    const items = PALETTE_ITEMS.filter(i => i.type === type);
                    const typeLabel = type === 'trigger' ? 'Trigger' : type === 'ai' ? 'AI / KI' : type === 'process' ? 'Process' : 'Output';
                    return (
                      <div key={type}>
                        <div className="px-3 py-1 text-[9px] font-medium text-gray-400 dark:text-zinc-600 uppercase">{typeLabel}</div>
                        {items.slice(0, 4).map(item => (
                          <button
                            key={item.icon + item.tKey}
                            onClick={() => { addNode(item, contextMenu.canvasPos!); setContextMenu(null); }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
                          >
                            <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: NODE_STYLES[item.type].accent + '20' }}>
                              <span className="text-[8px]" style={{ color: NODE_STYLES[item.type].accent }}>●</span>
                            </div>
                            {t(item.tKey)}
                          </button>
                        ))}
                      </div>
                    );
                  })}
                  <div className="border-t border-gray-100 dark:border-zinc-800 my-1" />
                  <button
                    onClick={() => { addGroup('purple'); setContextMenu(null); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
                  >
                    <Layers size={13} /> {lang === 'en' ? 'Add Group' : 'Gruppe hinzufügen'}
                  </button>
                  <button
                    onClick={() => { addStickyNote('yellow'); setContextMenu(null); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
                  >
                    <StickyNoteIcon size={13} /> {lang === 'en' ? 'Add Sticky Note' : 'Sticky Note hinzufügen'}
                  </button>
                  <button
                    onClick={() => { setPaletteOpen(true); setContextMenu(null); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
                  >
                    <Plus size={13} /> {lang === 'en' ? 'Open Full Palette' : 'Komplette Palette öffnen'}
                  </button>
                </>
              )}

              {/* Delete (for node/group/sticky/connection) */}
              {(contextMenu.nodeId || contextMenu.groupId || contextMenu.stickyId || contextMenu.connIdx !== undefined) && (
                <button onClick={() => handleContextAction('delete')} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                  <Trash2 size={13} /> {t('contextMenu.delete')}
                </button>
              )}
            </div>
          )}

          {/* Presentation Mode floating bar – auto-fades, reappears on hover */}
          {isPresentationMode && (
            <>
              {/* Edit toggle — top-left corner */}
              <div className="absolute top-3 left-3 z-50">
                <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-xl border border-white/10 cursor-pointer select-none">
                  <span className="text-[10px] text-white/60 font-medium">{lang === 'en' ? 'Edit' : 'Bearbeiten'}</span>
                  <button
                    onClick={() => setPresEditEnabled(!presEditEnabled)}
                    className={`relative w-8 h-4 rounded-full transition-colors ${presEditEnabled ? 'bg-purple-500' : 'bg-white/20'}`}
                  >
                    <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${presEditEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </button>
                </label>
              </div>

              {/* Bottom floating bar */}
              <div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 p-2"
                onMouseEnter={() => setPresBarVisible(true)}
                onMouseLeave={() => setPresBarVisible(false)}
              >
                <div
                  className="flex items-center gap-3 px-5 py-2.5 bg-black/70 backdrop-blur-xl rounded-full shadow-2xl border border-white/10"
                  style={{ opacity: presBarVisible ? 1 : 0, transition: 'opacity 0.6s ease' }}
                >
                  <span className="text-xs text-white/60 font-medium">{lang === 'en' ? 'Presentation Mode' : 'Präsentationsmodus'}</span>
                  <div className="w-px h-4 bg-white/20" />
                  <button
                    onClick={() => fitToScreen()}
                    className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                    title={t('toolbar.fitScreen')}
                  >
                    <Crosshair size={14} />
                  </button>
                  <button
                    onClick={() => { setIsPresentationMode(false); setIsFullscreen(false); setPresEditEnabled(false); }}
                    className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
                  >
                    {lang === 'en' ? 'Exit' : 'Beenden'}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* #24 – Keyboard Shortcuts Overlay */}
          {showShortcuts && (
            <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm" onClick={() => setShowShortcuts(false)}>
              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{t('shortcuts.title')}</h3>
                <div className="space-y-2 text-xs">
                  {[
                    [t('shortcuts.spaceDrag'), t('shortcuts.spaceDragDesc')],
                    [t('shortcuts.scroll'), t('shortcuts.scrollDesc')],
                    [t('shortcuts.deleteKey'), t('shortcuts.deleteDesc')],
                    [t('shortcuts.dblclick'), t('shortcuts.dblclickDesc')],
                    [t('shortcuts.shiftClick'), t('shortcuts.shiftClickDesc')],
                    [t('shortcuts.ctrlZ'), t('shortcuts.ctrlZDesc')],
                    [t('shortcuts.ctrlY'), t('shortcuts.ctrlYDesc')],
                    [t('shortcuts.ctrlF'), t('shortcuts.ctrlFDesc')],
                    [t('shortcuts.escape'), t('shortcuts.escapeDesc')],
                    [t('shortcuts.rightClick'), t('shortcuts.rightClickDesc')],
                    [t('shortcuts.questionMark'), t('shortcuts.questionMarkDesc')],
                  ].map(([key, desc]) => (
                    <div key={key} className="flex items-center justify-between">
                      <kbd className="px-2 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 font-mono">{key}</kbd>
                      <span className="text-gray-500 dark:text-zinc-500">{desc}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => setShowShortcuts(false)} className="mt-4 w-full py-2 rounded-xl text-xs bg-purple-600 text-white hover:bg-purple-500 transition-colors">{t('shortcuts.close')}</button>
              </div>
            </div>
          )}

          {/* ─── Delete Confirmation Dialog ─── */}
          <ConfirmDialog
            open={!!deleteConfirm}
            title={
              deleteConfirm?.type === 'nodes' ? (lang === 'en' ? 'Delete selected elements?' : 'Ausgewählte Elemente löschen?') :
              deleteConfirm?.type === 'node' ? (lang === 'en' ? 'Delete node?' : 'Node löschen?') :
              deleteConfirm?.type === 'connection' ? (lang === 'en' ? 'Delete connection?' : 'Verbindung löschen?') :
              deleteConfirm?.type === 'group' ? (lang === 'en' ? 'Delete group?' : 'Gruppe löschen?') :
              deleteConfirm?.type === 'sticky' ? (lang === 'en' ? 'Delete note?' : 'Notiz löschen?') :
              (lang === 'en' ? 'Delete?' : 'Löschen?')
            }
            message={
              deleteConfirm?.type === 'nodes' ? (lang === 'en' ? `${deleteConfirm.ids?.length || 0} elements and their connections will be removed.` : `${deleteConfirm.ids?.length || 0} Elemente und deren Verbindungen werden entfernt.`) :
              deleteConfirm?.type === 'node' ? (lang === 'en' ? 'This node and all its connections will be removed.' : 'Dieser Node und alle Verbindungen werden entfernt.') :
              deleteConfirm?.type === 'connection' ? (lang === 'en' ? 'This connection will be removed.' : 'Diese Verbindung wird entfernt.') :
              deleteConfirm?.type === 'group' ? (lang === 'en' ? 'This group will be removed. Nodes inside are not affected.' : 'Diese Gruppe wird entfernt. Nodes darin bleiben erhalten.') :
              (lang === 'en' ? 'This note will be removed.' : 'Diese Notiz wird entfernt.')
            }
            confirmLabel={lang === 'en' ? 'Delete' : 'Löschen'}
            cancelLabel={lang === 'en' ? 'Cancel' : 'Abbrechen'}
            variant="danger"
            onConfirm={executeDelete}
            onCancel={() => setDeleteConfirm(null)}
          />
        </div>
      </div>
    </div>
  );
}
