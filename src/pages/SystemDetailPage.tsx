import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Zap, ArrowLeft, Play, Loader2, Check, ExternalLink,
  Clock, Users, FileText, Globe, Mail, Target, BarChart3,
  Database, Sparkles, Search, Image, FolderOpen, Send,
  TrendingUp, Eye, Mic, Type, Clipboard, Activity, X,
  AlertCircle, ChevronRight,
} from 'lucide-react';
import type { AutomationSystem, SystemNode, NodeConnection, NodeType, SystemOutput, OutputType } from '@/types/automation';
import { findSystem } from '@/data/automationSystems';

// ─── Icon Map ─────────────────────────────────────────────────────────────────

type IconComponent = typeof Zap;

const ICONS: Record<string, IconComponent> = {
  'zap': Zap, 'users': Users, 'file-text': FileText, 'globe': Globe,
  'mail': Mail, 'target': Target, 'bar-chart': BarChart3, 'database': Database,
  'sparkles': Sparkles, 'search': Search, 'image': Image, 'folder-open': FolderOpen,
  'send': Send, 'trending-up': TrendingUp, 'eye': Eye, 'play': Play,
  'mic': Mic, 'type': Type, 'clipboard': Clipboard, 'activity': Activity,
};

const getIcon = (name: string): IconComponent => ICONS[name] || Zap;

// ─── Node Type Styles ─────────────────────────────────────────────────────────

const NODE_STYLES: Record<NodeType, { bg: string; border: string; accent: string; label: string }> = {
  trigger: { bg: 'rgba(59,130,246,0.06)', border: 'rgba(59,130,246,0.15)', accent: '#3b82f6', label: 'Trigger' },
  process: { bg: 'rgba(139,92,246,0.06)', border: 'rgba(139,92,246,0.15)', accent: '#8b5cf6', label: 'Prozess' },
  ai: { bg: 'rgba(217,70,239,0.06)', border: 'rgba(217,70,239,0.15)', accent: '#d946ef', label: 'KI' },
  output: { bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.15)', accent: '#10b981', label: 'Output' },
};

// ─── Output Type Styles ───────────────────────────────────────────────────────

const OUTPUT_ICONS: Record<OutputType, { icon: IconComponent; label: string }> = {
  document: { icon: FileText, label: 'Dokument' },
  folder: { icon: FolderOpen, label: 'Ordner' },
  website: { icon: Globe, label: 'Website' },
  spreadsheet: { icon: BarChart3, label: 'Tabelle' },
  email: { icon: Mail, label: 'E-Mail' },
  image: { icon: Image, label: 'Bild' },
  other: { icon: Zap, label: 'Sonstiges' },
};

// ─── Node Graph ───────────────────────────────────────────────────────────────

const NODE_W = 230;
const NODE_H = 84;
const PAD_X = 40;
const PAD_Y = 40;

function NodeGraph({ nodes, connections }: { nodes: SystemNode[]; connections: NodeConnection[] }) {
  if (nodes.length === 0) return null;

  const width = Math.max(...nodes.map(n => n.x + NODE_W)) + PAD_X * 2;
  const height = Math.max(...nodes.map(n => n.y + NODE_H)) + PAD_Y * 2;

  const getPos = (node: SystemNode) => ({
    x: node.x,
    y: node.y,
  });

  return (
    <div className="overflow-x-auto rounded-2xl bg-zinc-900/30 border border-zinc-800/40 p-2">
      <div style={{ width, height, minWidth: width }} className="relative">
        {/* SVG Connection Lines */}
        <svg className="absolute inset-0 pointer-events-none" style={{ width, height }}>
          <defs>
            <linearGradient id="connGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#a855f7" stopOpacity={0.6} />
            </linearGradient>
          </defs>
          {connections.map((conn, i) => {
            const fromNode = nodes.find(n => n.id === conn.from);
            const toNode = nodes.find(n => n.id === conn.to);
            if (!fromNode || !toNode) return null;

            const fp = getPos(fromNode);
            const tp = getPos(toNode);

            const x1 = fp.x + NODE_W;
            const y1 = fp.y + NODE_H / 2;
            const x2 = tp.x;
            const y2 = tp.y + NODE_H / 2;
            const cpx = (x2 - x1) * 0.45;

            const pathD = `M ${x1} ${y1} C ${x1 + cpx} ${y1}, ${x2 - cpx} ${y2}, ${x2} ${y2}`;

            return (
              <g key={i}>
                {/* Line */}
                <path d={pathD} stroke="url(#connGrad)" strokeWidth={2} fill="none" />
                {/* Animated dot */}
                <circle r={3.5} fill="#a855f7" opacity={0.9}>
                  <animateMotion dur={`${2.5 + i * 0.3}s`} repeatCount="indefinite" path={pathD} />
                </circle>
                {/* Arrow at end */}
                <circle cx={x2} cy={y2} r={4} fill="#0a0a0e" stroke="#a855f7" strokeWidth={1.5} opacity={0.7} />
              </g>
            );
          })}
        </svg>

        {/* HTML Node Cards */}
        {nodes.map(node => {
          const pos = getPos(node);
          const Icon = getIcon(node.icon);
          const style = NODE_STYLES[node.type];

          return (
            <div
              key={node.id}
              className="absolute rounded-xl border backdrop-blur-sm transition-all duration-200 hover:scale-[1.03] hover:shadow-lg"
              style={{
                left: pos.x,
                top: pos.y,
                width: NODE_W,
                height: NODE_H,
                background: style.bg,
                borderColor: style.border,
              }}
            >
              <div className="h-full flex items-center px-4 gap-3.5">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: style.accent + '18' }}
                >
                  <Icon size={18} style={{ color: style.accent }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-[13px] text-white truncate">{node.label}</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5 truncate">{node.description}</div>
                </div>
              </div>
              {/* Type badge */}
              <div
                className="absolute -top-2 -right-2 text-[9px] font-semibold uppercase tracking-wider
                           px-1.5 py-0.5 rounded-md border"
                style={{
                  background: style.bg,
                  borderColor: style.border,
                  color: style.accent,
                }}
              >
                {style.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Execute Section ──────────────────────────────────────────────────────────

function ExecuteSection({ system }: { system: AutomationSystem }) {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleExecute = async () => {
    setState('loading');
    try {
      if (system.webhookUrl) {
        await fetch(system.webhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ systemId: system.id, timestamp: new Date().toISOString() }),
        });
      } else {
        // Demo mode: simulate execution
        await new Promise(r => setTimeout(r, 2200));
      }
      setState('success');
      setTimeout(() => setState('idle'), 4000);
    } catch {
      setState('error');
      setTimeout(() => setState('idle'), 4000);
    }
  };

  return (
    <div className="flex flex-col items-center py-8">
      <button
        onClick={handleExecute}
        disabled={state === 'loading'}
        className={`
          relative px-10 py-4 rounded-2xl text-base font-semibold flex items-center gap-3 transition-all duration-300
          ${state === 'success'
            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
            : state === 'error'
              ? 'bg-red-600 text-white shadow-lg shadow-red-500/20'
              : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30'
          }
          disabled:opacity-70 disabled:cursor-not-allowed
        `}
      >
        {state === 'loading' && (
          <>
            <Loader2 size={20} className="animate-spin" />
            System wird ausgeführt…
          </>
        )}
        {state === 'idle' && (
          <>
            <Play size={20} />
            System ausführen
          </>
        )}
        {state === 'success' && (
          <>
            <Check size={20} />
            Erfolgreich ausgeführt
          </>
        )}
        {state === 'error' && (
          <>
            <AlertCircle size={20} />
            Fehler – erneut versuchen
          </>
        )}
      </button>
      {!system.webhookUrl && state === 'idle' && (
        <p className="text-xs text-zinc-600 mt-3">Demo-Modus · Kein Webhook konfiguriert</p>
      )}
      {state === 'success' && (
        <p className="text-xs text-emerald-400/70 mt-3">Das System wurde erfolgreich gestartet.</p>
      )}
    </div>
  );
}

// ─── Output Table ─────────────────────────────────────────────────────────────

function OutputTable({ outputs }: { outputs: SystemOutput[] }) {
  if (outputs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 rounded-xl bg-zinc-800/40 flex items-center justify-center mx-auto mb-4">
          <FolderOpen size={24} className="text-zinc-600" />
        </div>
        <p className="text-sm text-zinc-500">Noch keine Ergebnisse vorhanden.</p>
        <p className="text-xs text-zinc-600 mt-1">Führe das System aus, um Ergebnisse zu generieren.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-zinc-800/50">
      {outputs.map(output => {
        const typeInfo = OUTPUT_ICONS[output.type] || OUTPUT_ICONS.other;
        const TypeIcon = typeInfo.icon;

        return (
          <div
            key={output.id}
            className="flex items-center gap-4 py-4 px-2 hover:bg-zinc-800/20 rounded-lg transition-colors group"
          >
            <div className="w-9 h-9 rounded-lg bg-zinc-800/60 flex items-center justify-center shrink-0">
              <TypeIcon size={16} className="text-zinc-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm text-white font-medium truncate">{output.name}</div>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-[11px] text-zinc-500">{typeInfo.label}</span>
                <span className="text-[11px] text-zinc-600 flex items-center gap-1">
                  <Clock size={10} />
                  {new Date(output.createdAt).toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}{' '}
                  {new Date(output.createdAt).toLocaleTimeString('de-DE', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
            <a
              href={output.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300
                         opacity-0 group-hover:opacity-100 transition-all px-3 py-1.5 rounded-lg
                         hover:bg-purple-500/10"
            >
              Öffnen <ExternalLink size={12} />
            </a>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Detail Page ─────────────────────────────────────────────────────────

export default function SystemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const system = useMemo(() => (id ? findSystem(id) : undefined), [id]);

  // System not found
  if (!system) {
    return (
      <div className="min-h-screen bg-[#0a0a0e] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800/40 flex items-center justify-center mx-auto mb-5">
            <X size={32} className="text-zinc-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">System nicht gefunden</h2>
          <p className="text-zinc-500 text-sm mb-6">
            Das System mit der ID „{id}" existiert nicht.
          </p>
          <button
            onClick={() => navigate('/systems')}
            className="px-5 py-2.5 rounded-xl text-sm font-medium bg-zinc-800 hover:bg-zinc-700
                       text-white transition-colors flex items-center gap-2 mx-auto"
          >
            <ArrowLeft size={16} />
            Zurück zur Übersicht
          </button>
        </div>
      </div>
    );
  }

  const SystemIcon = getIcon(system.icon);
  const isActive = system.status === 'active';

  return (
    <div className="min-h-screen bg-[#0a0a0e] text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0e]/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/systems')}
            className="w-9 h-9 rounded-lg hover:bg-zinc-800 flex items-center justify-center
                       text-zinc-500 hover:text-white transition-colors shrink-0"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <button onClick={() => navigate('/systems')} className="hover:text-zinc-300 transition-colors">
              Systeme
            </button>
            <ChevronRight size={12} />
            <span className="text-zinc-300">{system.name}</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* System Header */}
        <div className="mb-10">
          <div className="flex items-start gap-5 mb-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #7c3aed22, #a855f722)' }}
            >
              <SystemIcon size={28} className="text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-white">{system.name}</h1>
                <span
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-zinc-700/30 text-zinc-500 border border-zinc-700/30'
                  }`}
                >
                  {isActive ? 'Aktiv' : 'Entwurf'}
                </span>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">{system.description}</p>
              <div className="flex items-center gap-5 mt-3 text-xs text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <Zap size={13} className="text-purple-400" />
                  {system.executionCount} Ausführungen
                </span>
                {system.lastExecuted && (
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} />
                    Zuletzt: {new Date(system.lastExecuted).toLocaleDateString('de-DE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-zinc-600">
                  {system.category}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section: System Flow */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-5">
            <h2 className="text-lg font-semibold text-white">System-Ablauf</h2>
            <span className="text-xs text-zinc-600">
              {system.nodes.length} Schritte · {system.connections.length} Verbindungen
            </span>
          </div>
          <NodeGraph nodes={system.nodes} connections={system.connections} />
        </section>

        {/* Section: Execute */}
        <section className="mb-6 border-t border-b border-zinc-800/40 -mx-6 px-6">
          <ExecuteSection system={system} />
        </section>

        {/* Section: Outputs */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-white">Ergebnisse</h2>
              <span className="text-xs text-zinc-600">{system.outputs.length} Einträge</span>
            </div>
          </div>
          <div className="bg-zinc-900/30 border border-zinc-800/40 rounded-2xl p-4">
            <OutputTable outputs={system.outputs} />
          </div>
        </section>
      </main>
    </div>
  );
}
