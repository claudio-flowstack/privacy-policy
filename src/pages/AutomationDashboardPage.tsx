import { useState, useEffect, useMemo, useCallback, useRef, Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import {
  Zap, Plus, ArrowRight, Activity, Layers, Clock,
  Sparkles, Users, FileText, Globe,
  Mail, Target, BarChart3, Database, Search, Image,
  FolderOpen, Send, TrendingUp, Eye, Play, Mic, Type,
  Clipboard, Sun, Moon, Menu, ExternalLink, AlertCircle, Wrench, Trash2, ChevronLeft, ChevronRight,
  Edit3, ChevronDown, ChevronUp, Check,
} from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import WorkflowCanvas from '@/components/automation/WorkflowCanvas';
import FunnelCanvas from '@/components/automation/FunnelCanvas';
import type { AutomationSystem, SystemOutput, OutputType } from '@/types/automation';
import { DEMO_SYSTEMS, loadUserSystems, saveUserSystems, getVisibleDemoSystems, hideDemoSystem } from '@/data/automationSystems';
import { WORKFLOW_TEMPLATES } from '@/data/automationTemplates';
import { createMockEventSource } from '@/services/mockEventSource';
import { useWorkflowExecution } from '@/hooks/useWorkflowExecution';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageContext';

// ─── Error Boundary (#26) ────────────────────────────────────────────────────

interface ErrorBoundaryState { hasError: boolean; error?: Error }

class CanvasErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Canvas Error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center h-64 rounded-2xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20">
          <div className="text-center">
            <AlertCircle size={28} className="text-red-400 mx-auto mb-2" />
            <p className="text-sm text-red-500 font-medium">Error loading canvas</p>
            <button onClick={() => this.setState({ hasError: false })} className="mt-2 text-xs text-red-400 underline hover:text-red-300">Retry</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

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

// ─── Style Maps ───────────────────────────────────────────────────────────────

const OUTPUT_ICONS: Record<OutputType, { icon: IconComponent; tKey: string }> = {
  document:    { icon: FileText, tKey: 'outputType.document' },
  folder:      { icon: FolderOpen, tKey: 'outputType.folder' },
  website:     { icon: Globe, tKey: 'outputType.website' },
  spreadsheet: { icon: BarChart3, tKey: 'outputType.spreadsheet' },
  email:       { icon: Mail, tKey: 'outputType.email' },
  image:       { icon: Image, tKey: 'outputType.image' },
  other:       { icon: Zap, tKey: 'outputType.other' },
};

// ─── (KI-Generator removed – replaced by Workflow Templates) ─────────────────

// ─── Output Table ─────────────────────────────────────────────────────────────

function OutputTable({ outputs }: { outputs: SystemOutput[] }) {
  const { t, lang } = useLanguage();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedTexts, setEditedTexts] = useState<Record<string, string>>({});
  const dateLang = lang === 'de' ? 'de-DE' : 'en-US';

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); setEditingId(curr => curr === id ? null : curr); }
      else next.add(id);
      return next;
    });
  };

  const startEdit = (id: string, currentText: string) => {
    setEditingId(id);
    if (!editedTexts[id]) setEditedTexts(prev => ({ ...prev, [id]: currentText }));
  };

  const saveEdit = (_id: string) => {
    setEditingId(null);
  };

  if (outputs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-zinc-800/40 flex items-center justify-center mx-auto mb-4">
          <FolderOpen size={24} className="text-gray-400 dark:text-zinc-600" />
        </div>
        <p className="text-sm text-gray-500 dark:text-zinc-500">{t('outputs.empty')}</p>
        <p className="text-xs text-gray-400 dark:text-zinc-600 mt-1">{t('outputs.emptyHint')}</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-zinc-800/50">
      {outputs.map(output => {
        const typeInfo = OUTPUT_ICONS[output.type] || OUTPUT_ICONS.other;
        const TypeIcon = typeInfo.icon;
        const isTextType = output.artifactType === 'text';
        const hasPreview = !!output.contentPreview;
        const isExpanded = expandedIds.has(output.id);
        const isEditing = editingId === output.id;
        const displayText = editedTexts[output.id] || output.contentPreview || '';

        return (
          <div key={output.id} className="py-4 px-2 hover:bg-gray-50 dark:hover:bg-zinc-800/20 rounded-lg transition-colors group">
            {/* Header row */}
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-zinc-800/60 flex items-center justify-center shrink-0">
                <TypeIcon size={16} className="text-gray-500 dark:text-zinc-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm text-gray-900 dark:text-white font-medium truncate">{output.name}</div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[11px] text-gray-500 dark:text-zinc-500">{t(typeInfo.tKey)}</span>
                  <span className="text-[11px] text-gray-400 dark:text-zinc-600 flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(output.createdAt).toLocaleDateString(dateLang, { day: '2-digit', month: '2-digit', year: 'numeric' })}{' '}
                    {new Date(output.createdAt).toLocaleTimeString(dateLang, { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Action button: expand for text, open for others */}
              {isTextType && hasPreview ? (
                <button
                  onClick={() => toggleExpand(output.id)}
                  className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 opacity-0 group-hover:opacity-100 transition-all px-3 py-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-500/10"
                >
                  {isExpanded ? t('outputs.collapse') : t('outputs.show')}
                  {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              ) : (
                <a
                  href={output.link} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 opacity-0 group-hover:opacity-100 transition-all px-3 py-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-500/10"
                >
                  {t('outputs.open')} <ExternalLink size={12} />
                </a>
              )}
            </div>

            {/* Expandable inline text editor for text-type artifacts */}
            {isTextType && isExpanded && (
              <div className="mt-3 ml-[52px]">
                {isEditing ? (
                  <div>
                    <textarea
                      value={displayText}
                      onChange={e => setEditedTexts(prev => ({ ...prev, [output.id]: e.target.value }))}
                      className="w-full min-h-[140px] p-3.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 text-sm text-gray-800 dark:text-zinc-200 leading-relaxed resize-y focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 outline-none transition-colors"
                    />
                    <div className="flex justify-end mt-2.5 gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-xs text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        {t('outputs.cancel')}
                      </button>
                      <button
                        onClick={() => saveEdit(output.id)}
                        className="flex items-center gap-1.5 text-xs text-white bg-purple-600 hover:bg-purple-500 px-3.5 py-1.5 rounded-lg transition-colors"
                      >
                        <Check size={12} /> {t('outputs.save')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative group/preview">
                    <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap pr-10">
                      {displayText}
                    </p>
                    <button
                      onClick={() => startEdit(output.id, displayText)}
                      className="absolute top-0 right-0 flex items-center gap-1.5 text-xs text-gray-400 dark:text-zinc-500 hover:text-purple-500 dark:hover:text-purple-400 opacity-0 group-hover/preview:opacity-100 transition-all px-2 py-1 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-500/10"
                    >
                      <Edit3 size={13} /> {t('outputs.edit')}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* File/document: show preview text if available */}
            {!isTextType && hasPreview && output.artifactType === 'file' && (
              <div className="mt-2 ml-[52px]">
                <p className="text-xs text-gray-400 dark:text-zinc-500 truncate">{output.contentPreview}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Dashboard Overview ───────────────────────────────────────────────────────

function DashboardOverview({ systems, onSelect }: { systems: AutomationSystem[]; onSelect: (id: string) => void }) {
  const { t, lang } = useLanguage();
  const active = systems.filter(s => s.status === 'active').length;
  const totalRuns = systems.reduce((sum, s) => sum + s.executionCount, 0);
  const dateLang = lang === 'de' ? 'de-DE' : 'en-US';

  const stats = [
    { label: t('dashboard.stats.systems'), value: systems.length, icon: Layers, color: '#8b5cf6' },
    { label: t('dashboard.stats.active'), value: active, icon: Activity, color: '#10b981' },
    { label: t('dashboard.stats.executions'), value: totalRuns, icon: Zap, color: '#f59e0b' },
  ];

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800/60 rounded-xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: s.color + '15' }}>
              <s.icon size={20} style={{ color: s.color }} />
            </div>
            <div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">{s.value}</div>
              <div className="text-xs text-gray-500 dark:text-zinc-500 uppercase tracking-wider">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* System Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {systems.map(system => {
          const Icon = getIcon(system.icon);
          const isActive = system.status === 'active';
          return (
            <button
              key={system.id}
              onClick={() => onSelect(system.id)}
              className="group text-left w-full bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800/50 rounded-2xl p-6 hover:border-purple-400/40 dark:hover:border-purple-500/30 hover:shadow-md dark:hover:shadow-none transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-purple-50 dark:bg-purple-500/10">
                  <Icon size={22} className="text-purple-600 dark:text-purple-400" />
                </div>
                <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${isActive ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' : 'bg-gray-100 dark:bg-zinc-700/30 text-gray-500 dark:text-zinc-500 border border-gray-200 dark:border-zinc-700/30'}`}>
                  {isActive ? t('dashboard.statusActive') : t('dashboard.statusDraft')}
                </span>
              </div>
              <div className="mb-1 text-xs text-gray-400 dark:text-zinc-500 uppercase tracking-wider font-medium">{system.category}</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{system.name}</h3>
              <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed mb-5 line-clamp-2">{system.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-zinc-500">
                  <span className="flex items-center gap-1.5"><Zap size={13} />{system.executionCount} {t('dashboard.runs')}</span>
                  {system.lastExecuted && (
                    <span className="flex items-center gap-1.5"><Clock size={13} />{new Date(system.lastExecuted).toLocaleDateString(dateLang, { day: '2-digit', month: '2-digit' })}</span>
                  )}
                </div>
                <span className="flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">{t('dashboard.openSystem')} <ArrowRight size={14} /></span>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

// ─── System Detail View (Redesigned) ─────────────────────────────────────────

function SystemDetailView({ system, onSave, onExecute, onDelete, onToggleStatus, isUserSystem, isDemoSystem }: {
  system: AutomationSystem;
  onSave?: (system: AutomationSystem) => void;
  onExecute?: () => void;
  onDelete?: () => void;
  onToggleStatus?: () => void;
  isUserSystem?: boolean;
  isDemoSystem?: boolean;
}) {
  const { t, lang } = useLanguage();
  const SystemIcon = getIcon(system.icon);
  const isActive = system.status === 'active';
  const dateLang = lang === 'de' ? 'de-DE' : 'en-US';

  // Event-system integration (mock today, real backend later)
  const eventSource = useMemo(() => createMockEventSource(), []);
  const { nodeStates, artifacts, isComplete, execute, reset } = useWorkflowExecution(eventSource);

  // Reset execution state when switching systems
  useEffect(() => { reset(); }, [system.id, reset]);

  const handleExecuteWithEvents = useCallback(() => {
    const nodeIds = system.nodes.map(n => n.id);
    const conns = system.connections.map(c => ({ from: c.from, to: c.to }));
    execute(system.id, nodeIds, conns);
    onExecute?.();
  }, [system, execute, onExecute]);

  // Resizable canvas height
  const [canvasHeight, setCanvasHeight] = useState(560);
  const resizeRef = useRef<{ startY: number; startH: number } | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeRef.current) return;
      const delta = e.clientY - resizeRef.current.startY;
      const newH = Math.max(300, Math.min(1200, resizeRef.current.startH + delta));
      setCanvasHeight(newH);
    };
    const handleMouseUp = () => { resizeRef.current = null; document.body.style.cursor = ''; document.body.style.userSelect = ''; };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
  }, []);

  const stats = [
    { label: t('detail.stats.executions'), value: system.executionCount, icon: Zap, color: '#8b5cf6' },
    { label: t('detail.stats.steps'), value: system.nodes.length, icon: Activity, color: '#3b82f6' },
    { label: t('detail.stats.connections'), value: system.connections.length, icon: ArrowRight, color: '#10b981' },
  ];

  return (
    <>
      {/* Premium Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900/70 border border-gray-200 dark:border-zinc-800/60 mb-8">
        {/* Decorative glow */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-blue-500/5 dark:bg-blue-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative p-8">
          <div className="flex items-start gap-6">
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-500/15 dark:to-purple-500/5 shadow-sm">
              <SystemIcon size={30} className="text-purple-600 dark:text-purple-400" />
            </div>

            {/* Title + Meta */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{system.name}</h2>
                {/* Status badge */}
                {isUserSystem && onToggleStatus ? (
                  <button
                    onClick={onToggleStatus}
                    className={`text-[11px] font-medium px-3 py-1 rounded-full cursor-pointer transition-colors ${isActive ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20' : 'bg-gray-100 dark:bg-zinc-700/30 text-gray-500 dark:text-zinc-500 border border-gray-200 dark:border-zinc-700/30 hover:bg-gray-200 dark:hover:bg-zinc-700/50'}`}
                    title={t('detail.changeStatus')}
                  >
                    {isActive ? t('dashboard.statusActive') : t('dashboard.statusDraft')}
                  </button>
                ) : (
                  <span className={`text-[11px] font-medium px-3 py-1 rounded-full ${isActive ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' : 'bg-gray-100 dark:bg-zinc-700/30 text-gray-500 dark:text-zinc-500 border border-gray-200 dark:border-zinc-700/30'}`}>
                    {isActive ? t('dashboard.statusActive') : t('dashboard.statusDraft')}
                  </span>
                )}
                {/* Delete button – for user systems AND demo systems */}
                {(isUserSystem || isDemoSystem) && onDelete && (
                  <button
                    onClick={onDelete}
                    className="text-[11px] font-medium px-3 py-1 rounded-full text-red-500 border border-red-200 dark:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex items-center gap-1"
                    title={t('detail.deleteSystem')}
                  >
                    <Trash2 size={11} />{t('detail.delete')}
                  </button>
                )}
              </div>

              <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed max-w-2xl mb-4">{system.description}</p>

              <div className="flex items-center gap-5 text-xs text-gray-500 dark:text-zinc-500">
                <span className="px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-zinc-800/50 font-medium">{system.category}</span>
                {system.lastExecuted && (
                  <span className="flex items-center gap-1.5">
                    <Clock size={12} className="text-purple-500" />
                    {t('detail.lastExecuted')} {new Date(system.lastExecuted).toLocaleDateString(dateLang, { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            {stats.map(s => (
              <div key={s.label} className="rounded-xl bg-gray-50 dark:bg-zinc-800/30 border border-gray-100 dark:border-zinc-800/40 p-4 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: s.color + '12' }}>
                  <s.icon size={18} style={{ color: s.color }} />
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</div>
                  <div className="text-[10px] text-gray-400 dark:text-zinc-600 uppercase tracking-wider font-medium">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Workflow Canvas Section */}
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
            <Activity size={16} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('detail.workflowTitle')}</h3>
            <span className="text-xs text-gray-400 dark:text-zinc-600">{t('detail.stepsAndConnections', { steps: system.nodes.length, connections: system.connections.length })}</span>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-zinc-800/40 overflow-hidden">
          <CanvasErrorBoundary>
            <WorkflowCanvas initialSystem={system} onSave={onSave} onExecute={handleExecuteWithEvents} nodeStates={nodeStates} style={{ height: canvasHeight }} />
          </CanvasErrorBoundary>
        </div>
        {/* Resize handle */}
        <div
          className="mx-auto mt-1 w-24 h-2 flex items-center justify-center cursor-ns-resize group"
          onMouseDown={e => {
            e.preventDefault();
            resizeRef.current = { startY: e.clientY, startH: canvasHeight };
            document.body.style.cursor = 'ns-resize';
            document.body.style.userSelect = 'none';
          }}
          title={t('detail.resizeHeight')}
        >
          <div className="w-12 h-1 rounded-full bg-gray-300 dark:bg-zinc-700 group-hover:bg-purple-400 dark:group-hover:bg-purple-500 transition-colors" />
        </div>
      </section>

      {/* Outputs Section */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
            <FolderOpen size={16} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('detail.resultsTitle')}</h3>
            <span className="text-xs text-gray-400 dark:text-zinc-600">
              {system.outputs.length + artifacts.length} {t('detail.entries')}
              {artifacts.length > 0 && isComplete && <span className="ml-1 text-emerald-500"> · {artifacts.length} {t('detail.new')}</span>}
            </span>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-zinc-800/40 rounded-2xl p-5">
          {/* Artifacts from latest execution shown first */}
          {artifacts.length > 0 && isComplete && (
            <div className="mb-4 pb-4 border-b border-gray-100 dark:border-zinc-800/50">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-500 dark:text-emerald-400 mb-3 flex items-center gap-1.5">
                <Zap size={10} /> {t('detail.lastExecution')}
              </div>
              <OutputTable outputs={artifacts.map(a => ({
                id: a.id,
                name: a.label,
                type: (a.type === 'file' ? 'document' : a.type === 'text' ? 'other' : a.type === 'url' ? 'website' : a.type === 'image' ? 'image' : 'other') as OutputType,
                link: a.url || '#',
                createdAt: a.createdAt,
                contentPreview: a.contentPreview,
                artifactType: a.type,
              }))} />
            </div>
          )}
          <OutputTable outputs={system.outputs} />
        </div>
      </section>
    </>
  );
}

// ─── Template Picker View ────────────────────────────────────────────────────

function TemplatePickerView({ onCreated }: { onCreated: (system: AutomationSystem) => void }) {
  const { t } = useLanguage();
  const [previewTemplate, setPreviewTemplate] = useState<AutomationSystem | null>(null);

  const handleDuplicate = (template: AutomationSystem) => {
    const system: AutomationSystem = {
      ...template,
      id: `user-${Date.now()}`,
      status: 'draft',
      outputs: [],
      executionCount: 0,
      lastExecuted: undefined,
    };
    onCreated(system);
  };

  // ── Template Preview ──
  if (previewTemplate) {
    const Icon = getIcon(previewTemplate.icon);
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setPreviewTemplate(null)}
            className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-zinc-800/50 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-zinc-700/50 transition-colors"
          >
            <ChevronLeft size={20} className="text-gray-600 dark:text-zinc-400" />
          </button>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{previewTemplate.name}</h2>
            <p className="text-sm text-gray-500 dark:text-zinc-500">{previewTemplate.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-zinc-700/30 text-gray-500 dark:text-zinc-500 border border-gray-200 dark:border-zinc-700/30">
              {previewTemplate.category}
            </span>
            <button
              onClick={() => handleDuplicate(previewTemplate)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors"
            >
              <Plus size={16} /> {t('templates.duplicate')}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-5 mb-5 text-sm text-gray-500 dark:text-zinc-500">
          <span className="flex items-center gap-1.5"><Activity size={14} /> {previewTemplate.nodes.length} {t('templates.steps')}</span>
          <span className="flex items-center gap-1.5"><ArrowRight size={14} /> {previewTemplate.connections.length} {t('templates.connections')}</span>
          {previewTemplate.groups && <span className="flex items-center gap-1.5"><Layers size={14} /> {previewTemplate.groups.length} {t('templates.phases')}</span>}
        </div>

        {/* Workflow Preview Canvas */}
        <div className="bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-zinc-800/40 rounded-2xl overflow-hidden">
          <CanvasErrorBoundary>
            <WorkflowCanvas
              initialSystem={previewTemplate}
              readOnly
              className="h-[400px]"
            />
          </CanvasErrorBoundary>
        </div>

        {/* Nodes list */}
        <div className="mt-5 bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-zinc-800/40 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Icon size={16} className="text-purple-500" /> {t('templates.workflowSteps')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {previewTemplate.nodes.map(node => (
              <div key={node.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/30 border border-gray-100 dark:border-zinc-700/30">
                <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center shrink-0">
                  <Zap size={14} className="text-purple-500" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{node.label}</div>
                  {node.description && <div className="text-[11px] text-gray-400 dark:text-zinc-500 truncate">{node.description}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Template Grid ──
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
          <Layers size={20} className="text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('templates.title')}</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-500">{t('templates.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {WORKFLOW_TEMPLATES.map(template => {
          const Icon = getIcon(template.icon);
          return (
            <button
              key={template.id}
              onClick={() => setPreviewTemplate(template)}
              className="group text-left w-full bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800/50 rounded-2xl p-6 hover:border-purple-400/40 dark:hover:border-purple-500/30 hover:shadow-md dark:hover:shadow-none transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-purple-50 dark:bg-purple-500/10">
                  <Icon size={22} className="text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-zinc-700/30 text-gray-500 dark:text-zinc-500 border border-gray-200 dark:border-zinc-700/30">
                  {template.category}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{template.name}</h3>
              <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed mb-4 line-clamp-2">{template.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-zinc-500">
                  <span className="flex items-center gap-1.5"><Activity size={13} />{template.nodes.length} {t('templates.steps')}</span>
                  <span className="flex items-center gap-1.5"><ArrowRight size={13} />{template.connections.length} {t('templates.connectionsShort')}</span>
                </div>
                <span className="flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">{t('templates.view')} <Eye size={14} /></span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Dashboard Page ──────────────────────────────────────────────────────

function AutomationDashboardContent() {
  const { t, lang, setLang } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [section, setSection] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userSystems, setUserSystems] = useState<AutomationSystem[]>([]);
  const [, forceUpdate] = useState(0); // For re-rendering when demo hidden list changes

  useEffect(() => { setUserSystems(loadUserSystems()); }, []);

  const allSystems = useMemo(() => [...getVisibleDemoSystems(), ...userSystems], [userSystems, forceUpdate]);
  const selectedSystem = allSystems.find(s => s.id === section);

  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const handleCreated = (system: AutomationSystem) => {
    const updated = [...userSystems, system];
    setUserSystems(updated);
    saveUserSystems(updated);
    setSection(system.id);
  };

  const handleSaveSystem = (system: AutomationSystem) => {
    const existingIdx = userSystems.findIndex(s => s.id === system.id);
    let updated: AutomationSystem[];
    if (existingIdx >= 0) {
      updated = [...userSystems];
      updated[existingIdx] = system;
    } else {
      const isDemo = DEMO_SYSTEMS.some(d => d.id === system.id);
      const newSystem = isDemo
        ? { ...system, id: `user-${Date.now()}`, name: `${system.name} ${t('system.copy')}` }
        : system;
      updated = [...userSystems, newSystem];
      if (isDemo) setSection(newSystem.id);
    }
    setUserSystems(updated);
    saveUserSystems(updated);
  };

  const handleDeleteSystem = (systemId: string) => {
    const isDemo = DEMO_SYSTEMS.some(d => d.id === systemId);
    const confirmMsg = isDemo
      ? t('confirm.hideDemo')
      : t('confirm.deleteSystem');
    if (!window.confirm(confirmMsg)) return;

    if (isDemo) {
      hideDemoSystem(systemId);
      forceUpdate(n => n + 1);
    } else {
      const updated = userSystems.filter(s => s.id !== systemId);
      setUserSystems(updated);
      saveUserSystems(updated);
    }
    setSection('dashboard');
  };

  const handleToggleStatus = (systemId: string) => {
    const updated = userSystems.map(s =>
      s.id === systemId ? { ...s, status: (s.status === 'active' ? 'draft' : 'active') as 'active' | 'draft' } : s
    );
    setUserSystems(updated);
    saveUserSystems(updated);
  };

  const handleExecuteSystem = (systemId: string) => {
    // Update user system execution count
    const userIdx = userSystems.findIndex(s => s.id === systemId);
    if (userIdx >= 0) {
      const updated = [...userSystems];
      updated[userIdx] = {
        ...updated[userIdx],
        executionCount: updated[userIdx].executionCount + 1,
        lastExecuted: new Date().toISOString(),
      };
      setUserSystems(updated);
      saveUserSystems(updated);
    }
  };

  const navigate = (id: string) => {
    setSection(id);
    setSidebarOpen(false);
  };

  const isUserSystem = selectedSystem ? userSystems.some(s => s.id === selectedSystem.id) : false;
  const isDemoSystem = selectedSystem ? DEMO_SYSTEMS.some(d => d.id === selectedSystem.id) : false;

  const sectionTitle = section === 'dashboard' ? t('page.dashboard') : section === 'create' ? t('page.templates') : section === 'builder' ? t('page.builder') : section === 'visualizer' ? t('page.visualizer') : selectedSystem?.name || '';
  const sectionSubtitle = section === 'dashboard'
    ? t('page.systemsAndActive', { count: allSystems.length, active: allSystems.filter(s => s.status === 'active').length })
    : section === 'create' ? t('page.templateSubtitle')
    : section === 'builder' ? t('page.builderSubtitle')
    : section === 'visualizer' ? t('page.visualizerSubtitle')
    : selectedSystem ? t('page.executionsSubtitle', { category: selectedSystem.category, count: selectedSystem.executionCount }) : '';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0e] text-gray-900 dark:text-white">
      {/* Mobile Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* ─── Sidebar ─── */}
      <aside className={`fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 z-40 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${sidebarCollapsed ? 'lg:-translate-x-full' : 'lg:translate-x-0'}`}>
        {/* Logo + Theme Toggle */}
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-xl font-bold flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-gray-900 dark:text-white">Flowstack</span>
          </h1>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-400" />}
            </button>
            <button
              onClick={() => { setSidebarCollapsed(true); setSidebarOpen(false); }}
              className="hidden lg:flex p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
              title={t('sidebar.collapse')}
            >
              <ChevronLeft className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 space-y-1 flex-1 overflow-y-auto">
          <p className="text-xs text-gray-400 dark:text-zinc-500 uppercase font-medium px-4 mb-2">{t('sidebar.overview')}</p>
          <button
            onClick={() => navigate('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm ${
              section === 'dashboard'
                ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium'
                : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
            }`}
          >
            <BarChart3 className="w-5 h-5" />{t('page.dashboard')}
          </button>

          <p className="text-xs text-gray-400 dark:text-zinc-500 uppercase font-medium px-4 mt-6 mb-2">{t('sidebar.systems')}</p>
          {allSystems.map(sys => {
            const SysIcon = getIcon(sys.icon);
            const isActive = sys.status === 'active';
            return (
              <button
                key={sys.id}
                onClick={() => navigate(sys.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm ${
                  section === sys.id
                    ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium'
                    : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
                }`}
              >
                <SysIcon className="w-5 h-5 shrink-0" />
                <span className="truncate flex-1 text-left">{sys.name}</span>
                <span className={`w-2 h-2 rounded-full shrink-0 ${isActive ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-zinc-600'}`} />
              </button>
            );
          })}

          <p className="text-xs text-gray-400 dark:text-zinc-500 uppercase font-medium px-4 mt-6 mb-2">{t('sidebar.tools')}</p>
          <button
            onClick={() => navigate('create')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm ${
              section === 'create'
                ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium'
                : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Layers className="w-5 h-5" />{t('sidebar.templates')}
          </button>
          <button
            onClick={() => navigate('builder')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm ${
              section === 'builder'
                ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium'
                : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Wrench className="w-5 h-5" />{t('sidebar.builder')}
          </button>
          <button
            onClick={() => navigate('visualizer')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm ${
              section === 'visualizer'
                ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium'
                : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Eye className="w-5 h-5" />{t('sidebar.visualizer')}
          </button>
        </nav>

        {/* Footer Card */}
        <div className="p-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-500 text-white">
            <p className="font-semibold mb-1">{t('sidebar.systemsCount', { count: allSystems.length })}</p>
            <p className="text-sm text-white/80 mb-3">{t('sidebar.activeAndRuns', { active: allSystems.filter(s => s.status === 'active').length, runs: allSystems.reduce((s, sys) => s + sys.executionCount, 0) })}</p>
            <div className="flex gap-1.5">
              {allSystems.map(s => (
                <div key={s.id} className={`w-2 h-2 rounded-full ${s.status === 'active' ? 'bg-emerald-400' : 'bg-white/30'}`} />
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main className={`transition-all duration-300 ${sidebarCollapsed ? '' : 'lg:ml-64'}`}>
        {/* Header */}
        <header className="sticky top-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-zinc-800 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                <Menu className="w-5 h-5 text-gray-500" />
              </button>
              {sidebarCollapsed && (
                <button onClick={() => setSidebarCollapsed(false)} className="hidden lg:flex p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors" title={t('sidebar.expand')}>
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{sectionTitle}</h1>
                <p className="text-sm text-gray-500 dark:text-zinc-500">{sectionSubtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Language Toggle */}
              <div className="flex items-center bg-gray-100 dark:bg-zinc-800 rounded-lg p-0.5">
                <button
                  onClick={() => setLang('de')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${lang === 'de' ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-300'}`}
                >
                  DE
                </button>
                <button
                  onClick={() => setLang('en')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${lang === 'en' ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-300'}`}
                >
                  EN
                </button>
              </div>

              {section === 'dashboard' && (
                <button
                  onClick={() => navigate('create')}
                  className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white transition-all"
                >
                  <Plus size={16} />{t('sidebar.chooseTemplate')}
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 space-y-6">
          {section === 'dashboard' && <DashboardOverview systems={allSystems} onSelect={s => setSection(s)} />}
          {section === 'create' && <TemplatePickerView onCreated={handleCreated} />}
          {section === 'builder' && (
            <CanvasErrorBoundary>
              <WorkflowCanvas
                onSave={(system) => {
                  const updated = [...userSystems, system];
                  setUserSystems(updated);
                  saveUserSystems(updated);
                  setSection(system.id);
                }}
              />
            </CanvasErrorBoundary>
          )}
          {section === 'visualizer' && (
            <CanvasErrorBoundary>
              <FunnelCanvas />
            </CanvasErrorBoundary>
          )}
          {selectedSystem && (
            <SystemDetailView
              system={selectedSystem}
              isUserSystem={isUserSystem}
              isDemoSystem={isDemoSystem}
              onSave={handleSaveSystem}
              onExecute={() => handleExecuteSystem(selectedSystem.id)}
              onDelete={() => handleDeleteSystem(selectedSystem.id)}
              onToggleStatus={() => handleToggleStatus(selectedSystem.id)}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default function AutomationDashboardPage() {
  return (
    <LanguageProvider>
      <AutomationDashboardContent />
    </LanguageProvider>
  );
}
