/**
 * NodeLab — Isolierte Test-Seite für visuelle Node-Experimente.
 * Komplett unabhängig von WorkflowCanvas und /systems.
 * Hier können neue Designs, Größen, Formen und Animationen
 * getestet werden, bevor sie ins produktive System übernommen werden.
 *
 * Route: /node-lab
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Zap, Users, Database, Sparkles, Globe, Layers,
  Check, X, Loader2, Play,
  Bot, ShieldCheck, Webhook, GitMerge,
  ZoomIn, ZoomOut,
} from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageContext';

// ─── Types ───────────────────────────────────────────────────────────────────

type LabNodeType = 'trigger' | 'process' | 'ai' | 'output' | 'subsystem';
type LabNodeStatus = 'idle' | 'pending' | 'running' | 'completed' | 'failed';

interface LabNode {
  id: string;
  label: string;
  description: string;
  type: LabNodeType;
  icon: string;
  x: number;
  y: number;
  status: LabNodeStatus;
}

interface LabConnection {
  from: string;
  to: string;
}

// ─── Config ──────────────────────────────────────────────────────────────────

const NODE_STYLES: Record<LabNodeType, { bg: string; border: string; accent: string; label: string; labelEn: string }> = {
  trigger:   { bg: 'rgba(59,130,246,0.07)',  border: 'rgba(59,130,246,0.18)',  accent: '#3b82f6', label: 'Trigger', labelEn: 'Trigger' },
  process:   { bg: 'rgba(139,92,246,0.07)',  border: 'rgba(139,92,246,0.18)',  accent: '#8b5cf6', label: 'Prozess', labelEn: 'Process' },
  ai:        { bg: 'rgba(217,70,239,0.07)',  border: 'rgba(217,70,239,0.18)',  accent: '#d946ef', label: 'KI',      labelEn: 'AI' },
  output:    { bg: 'rgba(16,185,129,0.07)',  border: 'rgba(16,185,129,0.18)',  accent: '#10b981', label: 'Output',  labelEn: 'Output' },
  subsystem: { bg: 'rgba(99,102,241,0.07)',  border: 'rgba(99,102,241,0.22)',  accent: '#6366f1', label: 'Sub-System', labelEn: 'Sub-System' },
};

// ─── Per-type node dimensions (the experimental part!) ───────────────────────

const NODE_SIZES: Record<LabNodeType, { w: number; h: number; radius: string; iconSize: number; fontSize: number; descSize: number }> = {
  trigger:   { w: 200, h: 72,  radius: '20px 12px 12px 20px', iconSize: 16, fontSize: 12, descSize: 10 },
  process:   { w: 230, h: 82,  radius: '12px',                iconSize: 18, fontSize: 13, descSize: 10 },
  ai:        { w: 300, h: 120, radius: '18px',                iconSize: 28, fontSize: 15, descSize: 11 },
  output:    { w: 200, h: 72,  radius: '12px 20px 20px 12px', iconSize: 16, fontSize: 12, descSize: 10 },
  subsystem: { w: 320, h: 130, radius: '18px',                iconSize: 24, fontSize: 15, descSize: 10 },
};

// ─── Icon Map ────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  zap: Zap, users: Users, database: Database, sparkles: Sparkles,
  globe: Globe, layers: Layers, bot: Bot, 'shield-check': ShieldCheck,
  webhook: Webhook, 'git-merge': GitMerge,
};

// ─── Demo Nodes ──────────────────────────────────────────────────────────────

const DEMO_NODES: LabNode[] = [
  { id: 't1', label: 'Webhook Eingang',       description: 'Neuer Lead empfangen',                     type: 'trigger',   icon: 'webhook',      x: 60,  y: 200, status: 'idle' },
  { id: 't2', label: 'Formular ausgefüllt',    description: 'Typeform-Antwort eingegangen',             type: 'trigger',   icon: 'zap',          x: 60,  y: 340, status: 'idle' },
  { id: 'p1', label: 'Daten zusammenführen',   description: 'Lead-Daten & Formular mergen',             type: 'process',   icon: 'git-merge',    x: 340, y: 260, status: 'idle' },
  { id: 'a1', label: 'KI: Lead-Analyse',       description: 'Agent analysiert Branche, Unternehmensgröße, Potenzial und erstellt einen Score von 0–100', type: 'ai', icon: 'sparkles', x: 660, y: 220, status: 'idle' },
  { id: 'p2', label: 'CRM-Eintrag',            description: 'Kontakt in HubSpot anlegen',               type: 'process',   icon: 'database',     x: 1040, y: 140, status: 'idle' },
  { id: 'a2', label: 'KI: Angebots-Entwurf',   description: 'Personalisiertes Angebot generieren basierend auf Lead-Profil und Branche', type: 'ai', icon: 'bot', x: 1040, y: 340, status: 'idle' },
  { id: 'o1', label: 'Slack Notification',      description: 'Sales-Team informieren',                  type: 'output',    icon: 'zap',          x: 1420, y: 100, status: 'idle' },
  { id: 'o2', label: 'E-Mail senden',           description: 'Angebot an Lead verschicken',             type: 'output',    icon: 'globe',        x: 1420, y: 260, status: 'idle' },
  { id: 'o3', label: 'Dashboard Update',        description: 'KPI-Tracking aktualisieren',              type: 'output',    icon: 'zap',          x: 1420, y: 400, status: 'idle' },
  { id: 's1', label: 'Follow-Up Automation',    description: 'Sub-Workflow · 8 Nodes · E-Mail-Sequenz, Reminder, Eskalation bei Nicht-Antwort', type: 'subsystem', icon: 'layers', x: 1040, y: 510, status: 'idle' },
];

const DEMO_CONNECTIONS: LabConnection[] = [
  { from: 't1', to: 'p1' }, { from: 't2', to: 'p1' },
  { from: 'p1', to: 'a1' },
  { from: 'a1', to: 'p2' }, { from: 'a1', to: 'a2' },
  { from: 'p2', to: 'o1' },
  { from: 'a2', to: 'o2' }, { from: 'a2', to: 'o3' },
  { from: 'a1', to: 's1' },
];

// English translations
const NODE_EN: Record<string, { label: string; description: string }> = {
  t1: { label: 'Webhook Intake',        description: 'New lead received' },
  t2: { label: 'Form Submitted',        description: 'Typeform response received' },
  p1: { label: 'Merge Data',            description: 'Combine lead data & form entries' },
  a1: { label: 'AI: Lead Analysis',     description: 'Agent analyzes industry, company size, potential and creates a score from 0–100' },
  p2: { label: 'CRM Entry',             description: 'Create contact in HubSpot' },
  a2: { label: 'AI: Proposal Draft',    description: 'Generate personalized proposal based on lead profile and industry' },
  o1: { label: 'Slack Notification',     description: 'Notify sales team' },
  o2: { label: 'Send Email',            description: 'Send proposal to lead' },
  o3: { label: 'Dashboard Update',      description: 'Update KPI tracking' },
  s1: { label: 'Follow-Up Automation',  description: 'Sub-Workflow · 8 Nodes · Email sequence, reminders, escalation on no response' },
};

// ─── Connection Path Helper ──────────────────────────────────────────────────

function getPath(from: LabNode, to: LabNode): string {
  const sf = NODE_SIZES[from.type];
  const st = NODE_SIZES[to.type];
  const fx = from.x + sf.w;
  const fy = from.y + sf.h / 2;
  const tx = to.x;
  const ty = to.y + st.h / 2;
  const dx = Math.abs(tx - fx);
  const offset = Math.max(60, dx * 0.4);
  return `M ${fx} ${fy} C ${fx + offset} ${fy}, ${tx - offset} ${ty}, ${tx} ${ty}`;
}

// ─── CSS for spinning border (injected via style tag) ────────────────────────

const LAB_CSS = `
@property --lab-spin {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}
@keyframes lab-spin-border {
  0% { --lab-spin: 0deg; }
  100% { --lab-spin: 360deg; }
}
@keyframes lab-pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.85; }
}
.lab-node-running::before {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: inherit;
  background: conic-gradient(from var(--lab-spin), #a855f7 0%, transparent 30%, transparent 70%, #a855f7 100%);
  animation: lab-spin-border 1.6s linear infinite;
  z-index: -1;
}
.lab-node-pending {
  animation: lab-pulse 2s ease-in-out infinite;
}
.lab-node-completed {
  box-shadow: 0 0 0 2.5px #10b981, 0 0 20px rgba(16,185,129,0.2) !important;
}
.lab-node-failed {
  box-shadow: 0 0 0 2.5px #ef4444, 0 0 20px rgba(239,68,68,0.2) !important;
}
`;

// ─── Component ───────────────────────────────────────────────────────────────

function NodeLabInner() {
  const { lang } = useLanguage();
  const canvasRef = useRef<HTMLDivElement>(null);

  const [nodes, setNodes] = useState<LabNode[]>(DEMO_NODES);
  const [zoom, setZoom] = useState(0.85);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isRunning, setIsRunning] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Inject CSS
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = LAB_CSS;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  // Pan
  const panRef = useRef<{ startX: number; startY: number; startPan: { x: number; y: number } } | null>(null);
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    panRef.current = { startX: e.clientX, startY: e.clientY, startPan: { ...pan } };
  }, [pan]);
  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (!panRef.current) return;
    setPan({
      x: panRef.current.startPan.x + (e.clientX - panRef.current.startX),
      y: panRef.current.startPan.y + (e.clientY - panRef.current.startY),
    });
  }, []);
  const handleCanvasMouseUp = useCallback(() => { panRef.current = null; }, []);

  // Zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.max(0.3, Math.min(2, z - e.deltaY * 0.001)));
  }, []);

  // Simulate execution
  const runSimulation = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
    // Reset all
    setNodes(prev => prev.map(n => ({ ...n, status: 'idle' as LabNodeStatus })));

    const order = ['t1', 't2', 'p1', 'a1', 'p2', 'a2', 'o1', 'o2', 'o3', 's1'];
    let delay = 200;

    order.forEach((id, i) => {
      // pending
      const t1 = setTimeout(() => {
        setNodes(prev => prev.map(n => n.id === id ? { ...n, status: 'pending' } : n));
      }, delay);
      timersRef.current.push(t1);
      delay += 300;

      // running
      const t2 = setTimeout(() => {
        setNodes(prev => prev.map(n => n.id === id ? { ...n, status: 'running' } : n));
      }, delay);
      timersRef.current.push(t2);
      delay += id.startsWith('a') ? 1800 : 800; // AI nodes take longer

      // completed
      const t3 = setTimeout(() => {
        setNodes(prev => prev.map(n => n.id === id ? { ...n, status: 'completed' } : n));
      }, delay);
      timersRef.current.push(t3);
      delay += 100;

      // Done
      if (i === order.length - 1) {
        const tEnd = setTimeout(() => setIsRunning(false), delay + 500);
        timersRef.current.push(tEnd);
      }
    });
  }, [isRunning]);

  const resetNodes = useCallback(() => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
    setIsRunning(false);
    setNodes(DEMO_NODES);
  }, []);

  // ─── Render Icon ─────────────────────────────────────────────────────────────

  const renderIcon = (iconName: string, size: number) => {
    const Icon = ICON_MAP[iconName];
    if (!Icon) return <Sparkles size={size} className="text-current" />;
    return <Icon size={size} className="text-current" />;
  };

  // ─── Localize node ──────────────────────────────────────────────────────────

  const getLabel = (node: LabNode) => {
    if (lang === 'en' && NODE_EN[node.id]) return NODE_EN[node.id].label;
    return node.label;
  };
  const getDesc = (node: LabNode) => {
    if (lang === 'en' && NODE_EN[node.id]) return NODE_EN[node.id].description;
    return node.description;
  };

  // Check dark mode for inline styles only (SVG strokes, node backgrounds)
  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b bg-white dark:bg-zinc-900/80 border-gray-200 dark:border-zinc-800">
        <div>
          <h1 className="text-lg font-bold">Node Lab</h1>
          <p className="text-xs text-gray-500 dark:text-zinc-500">
            {lang === 'de' ? 'Isolierte Test-Umgebung für Node-Designs' : 'Isolated testing environment for node designs'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Size Legend */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl text-[11px] font-medium bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400">
            {(Object.entries(NODE_SIZES) as [LabNodeType, typeof NODE_SIZES[LabNodeType]][]).map(([type, s]) => (
              <span key={type} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: NODE_STYLES[type].accent }} />
                {NODE_STYLES[type][lang === 'en' ? 'labelEn' : 'label']}: {s.w}×{s.h}
              </span>
            ))}
          </div>
          {/* Controls */}
          <button onClick={() => setZoom(z => Math.min(2, z + 0.15))} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-800"><ZoomIn size={16} /></button>
          <button onClick={() => setZoom(z => Math.max(0.3, z - 0.15))} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-800"><ZoomOut size={16} /></button>
          <div className="w-px h-6 bg-gray-300 dark:bg-zinc-700" />
          <button
            onClick={runSimulation}
            disabled={isRunning}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              isRunning
                ? 'bg-purple-500/20 text-purple-400 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
            {isRunning
              ? (lang === 'de' ? 'Läuft...' : 'Running...')
              : (lang === 'de' ? 'Simulation starten' : 'Run Simulation')}
          </button>
          <button onClick={resetNodes} className="px-3 py-2 rounded-xl text-sm text-gray-500 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-800">
            Reset
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        onWheel={handleWheel}
      >
        <div
          className="absolute origin-top-left"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
        >
          {/* Connections (SVG) */}
          <svg className="absolute inset-0 w-[2000px] h-[800px] pointer-events-none" style={{ overflow: 'visible' }}>
            {DEMO_CONNECTIONS.map((conn, i) => {
              const fromNode = nodes.find(n => n.id === conn.from);
              const toNode = nodes.find(n => n.id === conn.to);
              if (!fromNode || !toNode) return null;
              const fromStatus = fromNode.status;
              const isActive = fromStatus === 'completed' || fromStatus === 'running';
              return (
                <path
                  key={i}
                  d={getPath(fromNode, toNode)}
                  fill="none"
                  stroke={isActive ? NODE_STYLES[fromNode.type].accent : (isDark ? 'rgba(113,113,122,0.25)' : 'rgba(156,163,175,0.35)')}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  strokeLinecap="round"
                  style={{ transition: 'stroke 0.5s, stroke-width 0.3s' }}
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {nodes.map(node => {
            const nStyle = NODE_STYLES[node.type];
            const size = NODE_SIZES[node.type];
            const statusClass = node.status === 'running' ? 'lab-node-running'
              : node.status === 'pending' ? 'lab-node-pending'
              : node.status === 'completed' ? 'lab-node-completed'
              : node.status === 'failed' ? 'lab-node-failed'
              : '';

            return (
              <div
                key={node.id}
                className={`absolute border backdrop-blur-sm select-none transition-all duration-500 ${statusClass}`}
                style={{
                  left: node.x,
                  top: node.y,
                  width: size.w,
                  height: size.h,
                  borderRadius: size.radius,
                  background: node.status === 'running' ? (isDark ? 'rgba(168,85,247,0.06)' : 'rgba(168,85,247,0.04)') : nStyle.bg,
                  borderColor: node.status === 'completed' ? '#10b981'
                    : node.status === 'running' ? '#a855f7'
                    : node.status === 'failed' ? '#ef4444'
                    : nStyle.border,
                  boxShadow: node.type === 'ai' ? `0 0 30px ${nStyle.accent}15` : undefined,
                  zIndex: node.status === 'running' ? 20 : 10,
                }}
              >
                {/* Inner dashed frame for subsystem */}
                {node.type === 'subsystem' && (
                  <div className="absolute inset-2.5 rounded-xl border border-dashed pointer-events-none" style={{ borderColor: nStyle.accent + '30' }} />
                )}

                {/* Content */}
                {node.type === 'ai' ? (
                  <div className="h-full flex items-center px-5 gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: nStyle.accent + '18' }}>
                      {renderIcon(node.icon, size.iconSize)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold truncate text-gray-900 dark:text-white" style={{ fontSize: size.fontSize }}>{getLabel(node)}</div>
                      <div className="mt-1 line-clamp-2 leading-tight text-gray-500 dark:text-zinc-500" style={{ fontSize: size.descSize }}>{getDesc(node)}</div>
                    </div>
                  </div>
                ) : node.type === 'subsystem' ? (
                  <div className="h-full flex items-center px-5 gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: nStyle.accent + '15' }}>
                      {renderIcon(node.icon, size.iconSize)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold truncate text-gray-900 dark:text-white" style={{ fontSize: size.fontSize }}>{getLabel(node)}</div>
                      <div className="mt-1 line-clamp-2 leading-tight text-gray-500 dark:text-zinc-500" style={{ fontSize: size.descSize }}>{getDesc(node)}</div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center px-3.5 gap-3">
                    <div className="rounded-lg flex items-center justify-center shrink-0" style={{
                      width: node.type === 'process' ? 36 : 32,
                      height: node.type === 'process' ? 36 : 32,
                      background: nStyle.accent + '15',
                    }}>
                      {renderIcon(node.icon, size.iconSize)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate text-gray-900 dark:text-white" style={{ fontSize: size.fontSize }}>{getLabel(node)}</div>
                      <div className="mt-0.5 truncate text-gray-500 dark:text-zinc-500" style={{ fontSize: size.descSize }}>{getDesc(node)}</div>
                    </div>
                  </div>
                )}

                {/* Type badge */}
                <div className="absolute -top-2 -right-2 text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md border" style={{
                  background: nStyle.bg,
                  borderColor: nStyle.border,
                  color: nStyle.accent,
                }}>
                  {nStyle[lang === 'en' ? 'labelEn' : 'label']}
                </div>

                {/* Status indicator */}
                {(node.status === 'running' || node.status === 'completed' || node.status === 'failed') && (
                  <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center z-20 border border-white dark:border-zinc-900 transition-colors duration-300"
                    style={{ background: node.status === 'completed' ? '#10b981' : node.status === 'failed' ? '#ef4444' : '#a855f7' }}
                  >
                    {node.status === 'running' && <Loader2 size={10} className="text-white animate-spin" />}
                    {node.status === 'completed' && <Check size={10} className="text-white" />}
                    {node.status === 'failed' && <X size={10} className="text-white" />}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Zoom indicator */}
        <div className="absolute bottom-4 right-4 text-xs px-3 py-1.5 rounded-lg bg-white/80 dark:bg-zinc-800/80 text-gray-500 dark:text-zinc-400 backdrop-blur">
          {Math.round(zoom * 100)}%
        </div>
      </div>
    </div>
  );
}

export default function NodeLabPage() {
  useTheme();
  return (
    <LanguageProvider>
      <NodeLabInner />
    </LanguageProvider>
  );
}
