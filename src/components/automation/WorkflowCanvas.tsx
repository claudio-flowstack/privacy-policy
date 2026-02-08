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
  X,
} from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import type { AutomationSystem, SystemNode, NodeConnection, NodeType, CanvasGroup, StickyNote, StickyNoteColor, PortDirection } from '@/types/automation';
import type { NodeExecutionStatus } from '@/types/workflowEvents';
import { TOOL_LOGOS, getToolLogosByCategory, renderNodeIcon } from './ToolLogos';
import { useLanguage } from '@/i18n/LanguageContext';

// ─── Constants ───────────────────────────────────────────────────────────────

type IconComponent = typeof Zap;
const ICONS: Record<string, IconComponent> = {
  'zap': Zap, 'users': Users, 'file-text': FileText, 'globe': Globe,
  'mail': Mail, 'target': Target, 'bar-chart': BarChart3, 'database': Database,
  'sparkles': Sparkles, 'search': Search, 'image': Image, 'folder-open': FolderOpen,
  'send': Send, 'trending-up': TrendingUp, 'eye': Eye, 'play': Play,
  'mic': Mic, 'type': Type, 'clipboard': Clipboard, 'activity': Activity,
};

const NODE_W = 230;
const NODE_H = 84;
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
  blue:   { bg: 'rgba(59,130,246,0.05)',  border: 'rgba(59,130,246,0.18)',  text: 'rgba(59,130,246,0.55)',  name: 'Blau' },
  green:  { bg: 'rgba(16,185,129,0.05)',  border: 'rgba(16,185,129,0.18)',  text: 'rgba(16,185,129,0.55)',  name: 'Grün' },
  purple: { bg: 'rgba(139,92,246,0.05)',  border: 'rgba(139,92,246,0.18)',  text: 'rgba(139,92,246,0.55)',  name: 'Lila' },
  orange: { bg: 'rgba(245,158,11,0.05)',  border: 'rgba(245,158,11,0.18)',  text: 'rgba(245,158,11,0.55)',  name: 'Orange' },
  red:    { bg: 'rgba(239,68,68,0.05)',   border: 'rgba(239,68,68,0.18)',   text: 'rgba(239,68,68,0.55)',   name: 'Rot' },
  gray:   { bg: 'rgba(107,114,128,0.04)', border: 'rgba(107,114,128,0.15)', text: 'rgba(107,114,128,0.45)', name: 'Grau' },
};

const STICKY_COLORS: Record<StickyNoteColor, { bg: string; border: string; text: string; name: string; shadow: string }> = {
  yellow: { bg: 'rgba(250,204,21,0.35)', border: 'rgba(202,138,4,0.6)',  text: '#854d0e', name: 'Gelb',  shadow: 'rgba(250,204,21,0.25)' },
  blue:   { bg: 'rgba(59,130,246,0.28)', border: 'rgba(37,99,235,0.55)', text: '#1e40af', name: 'Blau',  shadow: 'rgba(59,130,246,0.2)' },
  green:  { bg: 'rgba(34,197,94,0.28)',  border: 'rgba(22,163,74,0.55)', text: '#166534', name: 'Grün',  shadow: 'rgba(34,197,94,0.2)' },
  pink:   { bg: 'rgba(236,72,153,0.28)', border: 'rgba(219,39,119,0.55)', text: '#9d174d', name: 'Rosa', shadow: 'rgba(236,72,153,0.2)' },
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
}

// ─── Palette Templates ───────────────────────────────────────────────────────

interface PaletteItem {
  icon: string;
  tKey: string;        // Translation key for the label
  label?: string;      // Direct label (fallback for tool logos)
  type: NodeType;
}

const PALETTE_ITEMS: PaletteItem[] = [
  { icon: 'zap', tKey: 'palette.trigger', type: 'trigger' },
  { icon: 'sparkles', tKey: 'palette.aiStep', type: 'ai' },
  { icon: 'database', tKey: 'palette.data', type: 'process' },
  { icon: 'globe', tKey: 'palette.website', type: 'output' },
  { icon: 'file-text', tKey: 'palette.document', type: 'output' },
  { icon: 'mail', tKey: 'palette.email', type: 'output' },
  { icon: 'send', tKey: 'palette.send', type: 'output' },
  { icon: 'target', tKey: 'palette.ads', type: 'output' },
];

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
  const { t } = useLanguage();
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

  const [editNode, setEditNode] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editGroupId, setEditGroupId] = useState<string | null>(null);
  const [editGroupLabel, setEditGroupLabel] = useState('');

  const [systemName, setSystemName] = useState(initialSystem?.name || '');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

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
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId?: string; groupId?: string; connIdx?: number } | null>(null);

  // #10 – Connection hover
  const [hoveredConnId, setHoveredConnId] = useState<number | null>(null);
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

  // Drag & drop from palette
  const [isDragOver, setIsDragOver] = useState(false);

  // #15 – Undo/Redo (ref-based to avoid fighting with React state)
  const undoStackRef = useRef<CanvasSnapshot[]>([]);
  const redoStackRef = useRef<CanvasSnapshot[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const pushHistory = useCallback(() => {
    undoStackRef.current = [...undoStackRef.current.slice(-40), { nodes, connections, groups, stickyNotes }];
    redoStackRef.current = [];
    setCanUndo(true);
    setCanRedo(false);
  }, [nodes, connections, groups, stickyNotes]);

  const historyUndo = useCallback(() => {
    if (undoStackRef.current.length === 0) return;
    const prev = undoStackRef.current[undoStackRef.current.length - 1];
    undoStackRef.current = undoStackRef.current.slice(0, -1);
    redoStackRef.current = [{ nodes, connections, groups, stickyNotes }, ...redoStackRef.current];
    setNodes(prev.nodes);
    setConnections(prev.connections);
    setGroups(prev.groups);
    setStickyNotes(prev.stickyNotes);
    setCanUndo(undoStackRef.current.length > 0);
    setCanRedo(true);
  }, [nodes, connections, groups, stickyNotes]);

  const historyRedo = useCallback(() => {
    if (redoStackRef.current.length === 0) return;
    const next = redoStackRef.current[0];
    redoStackRef.current = redoStackRef.current.slice(1);
    undoStackRef.current = [...undoStackRef.current, { nodes, connections, groups, stickyNotes }];
    setNodes(next.nodes);
    setConnections(next.connections);
    setGroups(next.groups);
    setStickyNotes(next.stickyNotes);
    setCanUndo(true);
    setCanRedo(redoStackRef.current.length > 0);
  }, [nodes, connections, groups, stickyNotes]);

  // Refs for wheel handler (avoid stale closures)
  const zoomRef = useRef(zoom);
  const panRef = useRef(pan);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);
  useEffect(() => { panRef.current = pan; }, [pan]);

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

      const delta = -e.deltaY * 0.003;
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
        if (contextMenu) { setContextMenu(null); return; }
        if (searchOpen) { setSearchOpen(false); setSearchQuery(''); return; }
        if (showShortcuts) { setShowShortcuts(false); return; }
        if (connectState) { setConnectState(null); return; }
        // #6 – reset icon picker
        if (editNode) { setEditNode(null); setShowIconPicker(false); return; }
        if (editGroupId) { setEditGroupId(null); return; }
        if (editStickyId) { setEditStickyId(null); return; }
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
        // Multi-select delete
        if (multiSelectedIds.size > 0) {
          pushHistory();
          setNodes(prev => prev.filter(n => !multiSelectedIds.has(n.id)));
          // #2 – clean orphaned connections
          setConnections(prev => prev.filter(c => !multiSelectedIds.has(c.from) && !multiSelectedIds.has(c.to)));
          setMultiSelectedIds(new Set());
          return;
        }
        if (selectedNodeId) {
          pushHistory();
          setNodes(prev => prev.filter(n => n.id !== selectedNodeId));
          // #2 – clean orphaned connections
          setConnections(prev => prev.filter(c => c.from !== selectedNodeId && c.to !== selectedNodeId));
          setSelectedNodeId(null);
        }
        if (selectedConnId !== null) {
          pushHistory();
          setConnections(prev => prev.filter((_, i) => i !== selectedConnId));
          setSelectedConnId(null);
        }
        if (selectedGroupId) {
          pushHistory();
          setGroups(prev => prev.filter(g => g.id !== selectedGroupId));
          setSelectedGroupId(null);
        }
        if (selectedStickyId) {
          pushHistory();
          setStickyNotes(prev => prev.filter(s => s.id !== selectedStickyId));
          setSelectedStickyId(null);
        }
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
  }, [selectedNodeId, selectedConnId, selectedGroupId, editNode, editGroupId, connectState, isFullscreen, readOnly, multiSelectedIds, contextMenu, searchOpen, showShortcuts, historyUndo, historyRedo, pushHistory]);

  // ─── Viewport Mouse Handlers ───────────────────────────────────────────────

  const handleViewportMouseDown = useCallback((e: React.MouseEvent) => {
    // Close context menu on click
    if (contextMenu) { setContextMenu(null); return; }

    // Middle mouse or space+click: always pan
    if (e.button === 1 || (e.button === 0 && spaceHeld)) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      setPanStartMouse({ x: e.clientX, y: e.clientY });
      setPanThresholdMet(true); // Space/middle always immediate
      return;
    }
    // Left-click on empty canvas area: start pan + deselect
    if (e.button === 0) {
      const target = e.target as HTMLElement;
      const isEmptyArea = target === viewportRef.current || target.classList.contains('canvas-inner');
      if (isEmptyArea) {
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        // #31 – threshold for left-click pan
        setPanStartMouse({ x: e.clientX, y: e.clientY });
        setPanThresholdMet(false);
        setSelectedNodeId(null);
        setSelectedConnId(null);
        setSelectedGroupId(null);
        setMultiSelectedIds(new Set());
        if (connectState) setConnectState(null);
      }
    }
  }, [spaceHeld, pan, connectState, contextMenu]);

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
  }, [isPanning, panStart, panStartMouse, panThresholdMet, dragState, dragGroupState, resizeState, connectState, dragStickyState, resizeStickyState, screenToCanvas, snapEnabled, nodes, groups, stickyNotes]);

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
  }, [dragState, dragGroupState, resizeState, dragStickyState, resizeStickyState, pushHistory]);

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
  }, [nodes, readOnly, spaceHeld, screenToCanvas, multiSelectedIds]);

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
  };

  const saveStickyEdit = () => {
    if (editStickyId) {
      pushHistory();
      setStickyNotes(prev => prev.map(s => s.id === editStickyId ? { ...s, text: editStickyText } : s));
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

    // Connections
    for (const conn of connections) {
      const fromNode = nodes.find(n => n.id === conn.from);
      const toNode = nodes.find(n => n.id === conn.to);
      if (!fromNode || !toNode) continue;
      const pathD = getConnectionPath(fromNode, toNode, conn.fromPort || 'right', conn.toPort || 'left');
      svg += `<path d="${pathD}" stroke="#a855f7" stroke-width="2" fill="none" opacity="0.6" />`;
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
    };
    img.src = url;
  }, [nodes, connections, groups, stickyNotes, isDark, initialSystem]);

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

  const addNode = useCallback((item: PaletteItem) => {
    pushHistory();
    const rect = viewportRef.current?.getBoundingClientRect();
    const centerX = rect ? (rect.width / 2 - pan.x) / zoom : 300;
    const centerY = rect ? (rect.height / 2 - pan.y) / zoom : 200;
    const id = `node-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const label = item.tKey ? t(item.tKey) : item.label || '';
    const newNode: SystemNode = {
      id, label, description: '', icon: item.icon, type: item.type,
      x: centerX - NODE_W / 2 + (Math.random() - 0.5) * 80,
      y: centerY - NODE_H / 2 + (Math.random() - 0.5) * 60,
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

  const startNodeEdit = (nodeId: string) => {
    if (readOnly) return;
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    setEditNode(nodeId);
    setEditLabel(node.label);
    setEditDesc(node.description);
    setEditIcon(node.icon);
    setShowIconPicker(false);
  };

  const saveNodeEdit = () => {
    if (editNode) {
      pushHistory();
      setNodes(prev => prev.map(n => n.id === editNode ? { ...n, label: editLabel, description: editDesc, icon: editIcon } : n));
      setEditNode(null);
      setShowIconPicker(false);
    }
  };

  const startGroupEdit = (groupId: string) => {
    if (readOnly) return;
    const group = groups.find(g => g.id === groupId);
    if (!group) return;
    setEditGroupId(groupId);
    setEditGroupLabel(group.label);
  };

  const saveGroupEdit = () => {
    if (editGroupId) {
      pushHistory();
      setGroups(prev => prev.map(g => g.id === editGroupId ? { ...g, label: editGroupLabel } : g));
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
      .map(c => ({ from: idMap.get(c.from)!, to: idMap.get(c.to)! }));
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
      };
      onSave?.(system);
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2000);
    }, 500);
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

  // ─── Context Menu Actions ──────────────────────────────────────────────────

  const handleContextAction = useCallback((action: string) => {
    if (!contextMenu) return;
    const { nodeId, groupId, connIdx } = contextMenu;

    if (action === 'delete') {
      pushHistory();
      if (nodeId) {
        setNodes(prev => prev.filter(n => n.id !== nodeId));
        setConnections(prev => prev.filter(c => c.from !== nodeId && c.to !== nodeId));
        setSelectedNodeId(null);
      }
      if (groupId) {
        setGroups(prev => prev.filter(g => g.id !== groupId));
        setSelectedGroupId(null);
      }
      if (connIdx !== undefined) {
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
  }, [contextMenu, pushHistory, duplicateSelection]);

  // ─── Render ────────────────────────────────────────────────────────────────

  const zoomPct = Math.round(zoom * 100);
  const showPalette = !readOnly && paletteOpen;
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
                  className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors ${paletteTab === tab ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}
                  aria-pressed={paletteTab === tab}
                >
                  {tab === 'generic' ? t('palette.tabNodes') : tab === 'tools' ? t('palette.tabTools') : t('palette.tabGroups')}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {paletteTab === 'generic' && PALETTE_ITEMS.map(item => {
              const Icon = ICONS[item.icon] || Zap;
              const style = NODE_STYLES[item.type];
              return (
                <button key={item.icon + item.tKey} onClick={() => addNode(item)} draggable onDragStart={e => { e.dataTransfer.setData('application/json', JSON.stringify(item)); e.dataTransfer.effectAllowed = 'copy'; }} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors group cursor-grab active:cursor-grabbing" aria-label={t('palette.addNode', { label: t(item.tKey) })}>
                  <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style={{ background: style.accent + '15' }}>
                    <Icon size={14} style={{ color: style.accent }} />
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
              return Object.entries(categories).map(([cat, logos]) => (
                <div key={cat}>
                  <div className="text-[10px] font-semibold text-gray-400 dark:text-zinc-600 uppercase tracking-wider px-3 pt-2 pb-1">{cat}</div>
                  {logos.map(logo => (
                    <button key={logo.id} onClick={() => addNode({ icon: logo.id, tKey: '', label: logo.name, type: 'process' })} draggable onDragStart={e => { e.dataTransfer.setData('application/json', JSON.stringify({ icon: logo.id, tKey: '', label: logo.name, type: 'process' })); e.dataTransfer.effectAllowed = 'copy'; }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors group cursor-grab active:cursor-grabbing" aria-label={t('palette.addNode', { label: logo.name })}>
                      <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-gray-50 dark:bg-zinc-800">
                        {renderNodeIcon(logo.id, undefined, <Zap size={14} />, 16)}
                      </div>
                      <span className="text-xs font-medium text-gray-800 dark:text-zinc-200 truncate">{logo.name}</span>
                      <Plus size={12} className="ml-auto text-gray-300 dark:text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              ));
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
        <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 z-10 shrink-0" role="toolbar" aria-label="Canvas-Toolbar">
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

          {/* #24 – Shortcuts Help */}
          <button onClick={() => setShowShortcuts(!showShortcuts)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors" title={t('toolbar.shortcutsKey')} aria-label={t('toolbar.shortcutsShow')}>
            <HelpCircle size={15} />
          </button>

          <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors" title={isFullscreen ? t('toolbar.fullscreenExit') : t('toolbar.fullscreen')} aria-label={isFullscreen ? t('toolbar.fullscreenExit') : t('toolbar.fullscreen')}>
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>

          {initialSystem && (
            <>
              <div className="h-4 w-px bg-gray-200 dark:bg-zinc-700" />
              <button
                onClick={handleExecute}
                disabled={effectiveIsExecuting}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  effectiveExecutionDone
                    ? 'bg-emerald-600 text-white'
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

              {(selectedNodeId || selectedGroupId || multiSelectedIds.size > 0) && (
                <button
                  onClick={() => {
                    pushHistory();
                    if (multiSelectedIds.size > 0) {
                      setNodes(prev => prev.filter(n => !multiSelectedIds.has(n.id)));
                      setConnections(prev => prev.filter(c => !multiSelectedIds.has(c.from) && !multiSelectedIds.has(c.to)));
                      setMultiSelectedIds(new Set());
                    } else if (selectedNodeId) {
                      setNodes(prev => prev.filter(n => n.id !== selectedNodeId));
                      setConnections(prev => prev.filter(c => c.from !== selectedNodeId && c.to !== selectedNodeId));
                      setSelectedNodeId(null);
                    } else if (selectedGroupId) {
                      setGroups(prev => prev.filter(g => g.id !== selectedGroupId));
                      setSelectedGroupId(null);
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

              <button onClick={handleSave} disabled={!systemName.trim() || nodes.length === 0 || saveState === 'saving'} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all" aria-label={t('toolbar.saveSystem')}>
                {saveState === 'saving' ? <Loader2 size={14} className="animate-spin" /> : saveState === 'saved' ? <Check size={14} /> : <Save size={14} />}
                {saveState === 'saving' ? t('toolbar.saving') : saveState === 'saved' ? t('toolbar.saved') : t('toolbar.save')}
              </button>
            </>
          )}
        </div>

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
          className={`flex-1 overflow-hidden relative ${isDragOver ? 'ring-2 ring-inset ring-purple-500/30 bg-purple-500/5' : ''}`}
          style={{ cursor: isPanning && panThresholdMet ? 'grabbing' : (spaceHeld ? 'grab' : 'default') }}
          onMouseDown={handleViewportMouseDown}
          onMouseMove={handleViewportMouseMove}
          onMouseUp={handleViewportMouseUp}
          onMouseLeave={handleViewportMouseUp}
          onContextMenu={e => handleContextMenu(e)}
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
              {/* No <defs> needed — solid colors replace gradients to fix
                   rendering failure on horizontal/vertical paths (zero-height bounding box) */}

              {connections.map((conn, i) => {
                const fromNode = nodes.find(n => n.id === conn.from);
                const toNode = nodes.find(n => n.id === conn.to);
                if (!fromNode || !toNode) return null;
                const pathD = getConnectionPath(fromNode, toNode, conn.fromPort || 'right', conn.toPort || 'left');
                const isSelected = selectedConnId === i;
                const isHovered = hoveredConnId === i;

                // Connection dot color based on node execution states
                const fromStatus = externalNodeStates?.get(conn.from) || 'idle';
                const toStatus = externalNodeStates?.get(conn.to) || 'idle';
                let dotColor = '#a855f7';
                let dotSpeed = 2.5 + i * 0.3;
                let dotR = 3;
                if (fromStatus === 'completed' && toStatus === 'completed') {
                  dotColor = '#10b981'; dotSpeed = 2; dotR = 3.5;
                } else if (fromStatus === 'completed' && (toStatus === 'running' || toStatus === 'pending')) {
                  dotColor = '#3b82f6'; dotSpeed = 1.2; dotR = 4;
                } else if (fromStatus === 'running') {
                  dotColor = '#3b82f6'; dotSpeed = 1.8; dotR = 3.5;
                }

                return (
                  <g
                    key={i}
                    style={{ pointerEvents: 'stroke' }}
                    onClick={(e) => { if (readOnly) return; e.stopPropagation(); setSelectedConnId(i); setSelectedNodeId(null); setSelectedGroupId(null); }}
                    onMouseEnter={() => !readOnly && setHoveredConnId(i)}
                    onMouseLeave={() => setHoveredConnId(null)}
                    onContextMenu={e => handleContextMenu(e, undefined, undefined, i)}
                  >
                    <path d={pathD} stroke="transparent" strokeWidth={12 / zoom} fill="none" style={{ cursor: readOnly ? 'default' : 'pointer', pointerEvents: 'stroke' }} />
                    <path
                      d={pathD}
                      stroke={isSelected ? '#a855f7' : isHovered ? 'rgba(168,85,247,0.8)' : 'rgba(139,92,246,0.5)'}
                      strokeWidth={isSelected ? 3 : isHovered ? 2.5 : 2}
                      fill="none"
                    />
                    <circle r={dotR} fill={dotColor} opacity={0.8}>
                      <animateMotion dur={`${dotSpeed}s`} repeatCount="indefinite" path={pathD} />
                    </circle>
                  </g>
                );
              })}

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
                  onContextMenu={e => { if (readOnly) return; e.preventDefault(); e.stopPropagation(); setContextMenu({ x: e.clientX, y: e.clientY }); setSelectedStickyId(sticky.id); }}
                >
                  <div className="p-3.5 h-full overflow-hidden">
                    <p className="text-[12px] font-medium leading-relaxed whitespace-pre-wrap break-words" style={{ color: colors.text }}>{sticky.text}</p>
                  </div>
                  {isSelected && !readOnly && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); pushHistory(); setStickyNotes(prev => prev.filter(s => s.id !== sticky.id)); setSelectedStickyId(null); }}
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

              return (
                <div
                  key={node.id}
                  className={`absolute rounded-xl border backdrop-blur-sm select-none ${dragState?.nodeId === node.id ? '' : 'transition-[box-shadow,border-color,background-color] duration-500'} ${(isSelected || isMultiSelected) && !readOnly && !isNodeActive ? 'ring-2 ring-purple-500 shadow-lg shadow-purple-500/10' : ''} ${isConnecting ? 'ring-2 ring-purple-400 ring-dashed' : ''} ${isNodeActive ? `${ss.ring} ${ss.shadow}` : ''}`}
                  style={{
                    left: node.x, top: node.y, width: NODE_W, height: NODE_H,
                    background: ss.bg,
                    borderColor: ss.border,
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
                  <div className="h-full flex items-center px-4 gap-3.5">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: style.accent + '15' }}>
                      {renderIcon(node)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-[13px] text-gray-900 dark:text-white truncate">{node.label}</div>
                      {node.description && <div className="text-[11px] text-gray-500 dark:text-zinc-500 mt-0.5 truncate">{node.description}</div>}
                    </div>
                  </div>

                  <div className="absolute -top-2 -right-2 text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md border" style={{ background: style.bg, borderColor: style.border, color: style.accent }}>
                    {style.label}
                  </div>

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

                  {/* 4-Directional Hover Ports */}
                  {!readOnly && (hoveredNodeId === node.id || connectState) && (
                    <>
                      {/* Top */}
                      <div
                        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full border bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-600 flex items-center justify-center hover:bg-purple-50 dark:hover:bg-purple-500/20 hover:border-purple-400 hover:scale-110 transition-all cursor-crosshair z-30 text-gray-400 hover:text-purple-500 animate-in fade-in duration-150"
                        onClick={e => handlePortClick(e, node.id, 'top')}
                        role="button"
                        aria-label={`${node.label} Top-Port`}
                      >
                        <Plus size={10} strokeWidth={2.5} />
                      </div>
                      {/* Right */}
                      <div
                        className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full border bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-600 flex items-center justify-center hover:bg-purple-50 dark:hover:bg-purple-500/20 hover:border-purple-400 hover:scale-110 transition-all cursor-crosshair z-30 text-gray-400 hover:text-purple-500 animate-in fade-in duration-150"
                        onClick={e => handlePortClick(e, node.id, 'right')}
                        role="button"
                        aria-label={`${node.label} Right-Port`}
                      >
                        <Plus size={10} strokeWidth={2.5} />
                      </div>
                      {/* Bottom */}
                      <div
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-5 h-5 rounded-full border bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-600 flex items-center justify-center hover:bg-purple-50 dark:hover:bg-purple-500/20 hover:border-purple-400 hover:scale-110 transition-all cursor-crosshair z-30 text-gray-400 hover:text-purple-500 animate-in fade-in duration-150"
                        onClick={e => handlePortClick(e, node.id, 'bottom')}
                        role="button"
                        aria-label={`${node.label} Bottom-Port`}
                      >
                        <Plus size={10} strokeWidth={2.5} />
                      </div>
                      {/* Left */}
                      <div
                        className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full border bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-600 flex items-center justify-center hover:bg-purple-50 dark:hover:bg-purple-500/20 hover:border-purple-400 hover:scale-110 transition-all cursor-crosshair z-30 text-gray-400 hover:text-purple-500 animate-in fade-in duration-150"
                        onClick={e => handlePortClick(e, node.id, 'left')}
                        role="button"
                        aria-label={`${node.label} Left-Port`}
                      >
                        <Plus size={10} strokeWidth={2.5} />
                      </div>
                    </>
                  )}
                </div>
              );
            })}

            {/* ─── Edit Overlays ─── */}
            {editNode && !readOnly && (() => {
              const node = nodes.find(n => n.id === editNode);
              if (!node) return null;
              const allIcons = [
                ...Object.keys(ICONS).map(k => ({ id: k, type: 'lucide' as const })),
                ...Object.keys(TOOL_LOGOS).map(k => ({ id: k, type: 'logo' as const })),
              ];
              return (
                <div className="absolute bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-xl p-4 z-50" style={{ left: node.x, top: node.y + NODE_H + 10, width: NODE_W + 60 }} onClick={e => e.stopPropagation()} role="dialog" aria-label="Node bearbeiten">
                  <div className="text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-2">Node bearbeiten</div>
                  {/* #12 – maxLength on inputs */}
                  <input type="text" value={editLabel} onChange={e => setEditLabel(e.target.value.slice(0, MAX_LABEL_LENGTH))} className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white mb-2 focus:outline-none focus:border-purple-500" placeholder="Label" maxLength={MAX_LABEL_LENGTH} autoFocus />
                  <input type="text" value={editDesc} onChange={e => setEditDesc(e.target.value.slice(0, MAX_DESC_LENGTH))} className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs text-gray-700 dark:text-zinc-300 mb-2 focus:outline-none focus:border-purple-500" placeholder="Beschreibung (optional)" maxLength={MAX_DESC_LENGTH} />

                  <button
                    onClick={() => setShowIconPicker(!showIconPicker)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 mb-2 hover:border-purple-400 transition-colors"
                  >
                    <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: NODE_STYLES[node.type].accent + '15' }}>
                      {renderNodeIcon(editIcon, undefined, (() => { const I = ICONS[editIcon]; return I ? <I size={14} style={{ color: NODE_STYLES[node.type].accent }} /> : <Zap size={14} style={{ color: NODE_STYLES[node.type].accent }} />; })(), 14)}
                    </div>
                    <span className="text-xs text-gray-600 dark:text-zinc-400 flex-1 text-left">Icon ändern</span>
                    <ChevronDown size={12} className={`text-gray-400 transition-transform ${showIconPicker ? 'rotate-180' : ''}`} />
                  </button>

                  {showIconPicker && (
                    <div className="mb-2 max-h-32 overflow-y-auto rounded-lg border border-gray-200 dark:border-zinc-700 p-2">
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

                  <div className="flex gap-2">
                    <button onClick={() => { setEditNode(null); setShowIconPicker(false); }} className="flex-1 py-1.5 rounded-lg text-xs border border-gray-200 dark:border-zinc-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-800">{t('edit.cancel')}</button>
                    <button onClick={saveNodeEdit} className="flex-1 py-1.5 rounded-lg text-xs bg-purple-600 text-white hover:bg-purple-500">{t('edit.save')}</button>
                  </div>
                </div>
              );
            })()}

            {editGroupId && !readOnly && (() => {
              const group = groups.find(g => g.id === editGroupId);
              if (!group) return null;
              return (
                <div className="absolute bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-xl p-4 z-50" style={{ left: group.x, top: group.y + group.height + 10, width: 260 }} onClick={e => e.stopPropagation()} role="dialog" aria-label={t('edit.editGroupAria')}>
                  <div className="text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-2">{t('edit.editGroup')}</div>
                  <input type="text" value={editGroupLabel} onChange={e => setEditGroupLabel(e.target.value.slice(0, MAX_LABEL_LENGTH))} className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white mb-3 focus:outline-none focus:border-purple-500" placeholder={t('edit.groupPlaceholder')} maxLength={MAX_LABEL_LENGTH} autoFocus />
                  <div className="flex gap-2">
                    <button onClick={() => setEditGroupId(null)} className="flex-1 py-1.5 rounded-lg text-xs border border-gray-200 dark:border-zinc-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-800">{t('edit.cancel')}</button>
                    <button onClick={saveGroupEdit} className="flex-1 py-1.5 rounded-lg text-xs bg-purple-600 text-white hover:bg-purple-500">{t('edit.save')}</button>
                  </div>
                </div>
              );
            })()}

            {/* Sticky Note Edit Overlay */}
            {editStickyId && !readOnly && (() => {
              const sticky = stickyNotes.find(s => s.id === editStickyId);
              if (!sticky) return null;
              return (
                <div className="absolute bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-xl p-4 z-50" style={{ left: sticky.x, top: sticky.y + sticky.height + 10, width: 240 }} onClick={e => e.stopPropagation()} role="dialog" aria-label={t('edit.editNoteAria')}>
                  <div className="text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-2">{t('edit.editNote')}</div>
                  <textarea value={editStickyText} onChange={e => setEditStickyText(e.target.value.slice(0, 200))} rows={4} className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white mb-3 focus:outline-none focus:border-purple-500 resize-none" placeholder={t('edit.notePlaceholder')} maxLength={200} autoFocus />
                  <div className="flex gap-2">
                    <button onClick={() => setEditStickyId(null)} className="flex-1 py-1.5 rounded-lg text-xs border border-gray-200 dark:border-zinc-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-800">{t('edit.cancel')}</button>
                    <button onClick={saveStickyEdit} className="flex-1 py-1.5 rounded-lg text-xs bg-purple-600 text-white hover:bg-purple-500">{t('edit.save')}</button>
                  </div>
                </div>
              );
            })()}
          </div>

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

          {/* #18 – Toast Message */}
          {toastMessage && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-medium px-4 py-2 rounded-lg shadow-lg animate-fade-in">
              {toastMessage}
            </div>
          )}

          {/* #21 – Context Menu */}
          {contextMenu && (
            <div
              className="fixed z-[100] bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-xl py-1 min-w-[160px]"
              style={{ left: contextMenu.x, top: contextMenu.y }}
              onClick={e => e.stopPropagation()}
            >
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
              <button onClick={() => handleContextAction('delete')} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                <Trash2 size={13} /> {t('contextMenu.delete')}
              </button>
            </div>
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
                <button onClick={() => setShowShortcuts(false)} className="mt-4 w-full py-2 rounded-lg text-xs bg-purple-600 text-white hover:bg-purple-500">{t('shortcuts.close')}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
