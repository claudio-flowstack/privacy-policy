import { useState, useEffect, useMemo, useCallback, useRef, Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import {
  Zap, Plus, ArrowRight, Activity, Layers, Clock,
  Sparkles, Users, FileText, Globe,
  Mail, Target, BarChart3, Database, Search, Image,
  FolderOpen, Send, TrendingUp, Eye, Play, Mic, Type,
  Clipboard, Sun, Moon, Menu, ExternalLink, AlertCircle, Wrench, Trash2, ChevronLeft, ChevronRight,
  Edit3, ChevronDown, ChevronUp, Check, Settings, Bell, Shield, RefreshCw, X, Maximize2, Minimize2,
} from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import WorkflowCanvas from '@/components/automation/WorkflowCanvas';
import FunnelCanvas from '@/components/automation/FunnelCanvas';
import type { AutomationSystem, SystemOutput, OutputType, SystemResource, ResourceType } from '@/types/automation';
import { DEMO_SYSTEMS, loadUserSystems, saveUserSystems, getVisibleDemoSystems, hideDemoSystem } from '@/data/automationSystems';
import { getResourcesForSystem, addResource, deleteResource } from '@/data/resourceStorage';
import { WORKFLOW_TEMPLATES, loadUserTemplates, saveUserTemplates, deleteUserTemplate, getLocalizedTemplate } from '@/data/automationTemplates';
import { createMockEventSource } from '@/services/mockEventSource';
import { useWorkflowExecution } from '@/hooks/useWorkflowExecution';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageContext';
import ConfirmDialog, { useModalEsc } from '../components/ui/ConfirmDialog';

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

// ─── Toast Animation CSS ─────────────────────────────────────────────────────

if (typeof document !== 'undefined' && !document.getElementById('toast-anim-style')) {
  const style = document.createElement('style');
  style.id = 'toast-anim-style';
  style.textContent = `@keyframes slideInRight { 0% { opacity:0; transform: translateX(40px); } 100% { opacity:1; transform: translateX(0); } }`;
  document.head.appendChild(style);
}

// ─── Toast Notification ──────────────────────────────────────────────────────

interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'info' | 'error';
}

function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((text: string, type: ToastMessage['type'] = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, addToast, dismissToast };
}

function ToastContainer({ toasts, onDismiss }: { toasts: ToastMessage[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;

  const colorMap: Record<ToastMessage['type'], string> = {
    success: 'bg-emerald-500 dark:bg-emerald-600',
    info: 'bg-purple-500 dark:bg-purple-600',
    error: 'bg-red-500 dark:bg-red-600',
  };

  const iconMap: Record<ToastMessage['type'], typeof Check> = {
    success: Check,
    info: Bell,
    error: AlertCircle,
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2">
      {toasts.map(toast => {
        const Icon = iconMap[toast.type];
        return (
          <div
            key={toast.id}
            style={{ animation: 'slideInRight 0.3s ease-out' }}
            className={`${colorMap[toast.type]} text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-[280px]`}
          >
            <Icon size={16} className="shrink-0" />
            <span className="text-sm font-medium flex-1">{toast.text}</span>
            <button onClick={() => onDismiss(toast.id)} className="shrink-0 hover:opacity-70 transition-opacity" title="Dismiss">
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Output Table ─────────────────────────────────────────────────────────────

function OutputTable({ outputs, onToast }: { outputs: SystemOutput[]; onToast?: (text: string, type?: ToastMessage['type']) => void }) {
  const { t, lang } = useLanguage();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedTexts, setEditedTexts] = useState<Record<string, string>>({});
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
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

  const saveEdit = (id: string) => {
    setEditingId(null);
    setSavedIds(prev => { const next = new Set(prev); next.add(id); return next; });
    onToast?.(t('toast.outputSaved'), 'success');
    setTimeout(() => {
      setSavedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
    }, 2000);
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
                    {savedIds.has(output.id) && (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-500 dark:text-emerald-400 mt-2">
                        <Check size={12} /> {t('toast.outputSaved')}
                      </div>
                    )}
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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft'>('all');
  const active = systems.filter(s => s.status === 'active').length;
  const totalRuns = systems.reduce((sum, s) => sum + s.executionCount, 0);
  const dateLang = lang === 'de' ? 'de-DE' : 'en-US';

  const filteredSystems = useMemo(() => {
    let result = systems;
    if (statusFilter !== 'all') {
      result = result.filter(s => s.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [systems, searchQuery, statusFilter]);

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

      {/* Search + Filter Bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('dashboard.searchPlaceholder')}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 outline-none transition-colors"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300" title={t('dashboard.clearSearch')}>
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex items-center bg-gray-100 dark:bg-zinc-800 rounded-lg p-0.5">
          {(['all', 'active', 'draft'] as const).map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${statusFilter === f ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-300'}`}
            >
              {f === 'all' ? t('dashboard.filterAll') : f === 'active' ? t('dashboard.statusActive') : t('dashboard.statusDraft')}
            </button>
          ))}
        </div>
        {(searchQuery || statusFilter !== 'all') && filteredSystems.length !== systems.length && (
          <span className="text-xs text-gray-400 dark:text-zinc-500">{filteredSystems.length} / {systems.length}</span>
        )}
      </div>

      {/* System Grid */}
      {filteredSystems.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-zinc-800/40 flex items-center justify-center mx-auto mb-4">
            <Search size={24} className="text-gray-400 dark:text-zinc-600" />
          </div>
          <p className="text-sm text-gray-500 dark:text-zinc-500">{t('dashboard.noResults')}</p>
          <button onClick={() => { setSearchQuery(''); setStatusFilter('all'); }} className="text-xs text-purple-500 hover:text-purple-400 mt-2">
            {t('dashboard.clearFilters')}
          </button>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredSystems.map(system => {
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
      )}
    </>
  );
}

// ─── Resources Panel ──────────────────────────────────────────────────────────

const RESOURCE_TYPE_CONFIG: Record<ResourceType, { icon: typeof FileText; color: string }> = {
  transcript: { icon: Mic, color: 'purple' },
  document: { icon: FileText, color: 'blue' },
  note: { icon: Clipboard, color: 'amber' },
  dataset: { icon: Database, color: 'emerald' },
};

const ALL_RESOURCE_TYPES: ResourceType[] = ['transcript', 'document', 'note', 'dataset'];

function ResourcesPanel({ systemId, onToast }: { systemId: string; onToast?: (text: string, type?: ToastMessage['type']) => void }) {
  const { t } = useLanguage();
  const [resources, setResources] = useState<SystemResource[]>([]);
  const [filterType, setFilterType] = useState<ResourceType | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Add-form state
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<ResourceType>('document');
  const [newContent, setNewContent] = useState('');
  const [newFileRef, setNewFileRef] = useState('');

  useEffect(() => {
    setResources(getResourcesForSystem(systemId));
  }, [systemId]);

  const filtered = filterType === 'all' ? resources : resources.filter(r => r.type === filterType);

  const handleAdd = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    const res: SystemResource = {
      id: `res-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      systemId,
      title: newTitle.trim(),
      type: newType,
      content: newContent.trim(),
      fileReference: newFileRef.trim() || undefined,
      createdAt: new Date().toISOString(),
      source: 'manual',
    };
    addResource(res);
    setResources(prev => [...prev, res]);
    setNewTitle(''); setNewType('document'); setNewContent(''); setNewFileRef('');
    setShowAddModal(false);
    onToast?.(t('resource.saved'), 'success');
  };

  const handleDelete = (id: string) => {
    deleteResource(id);
    setResources(prev => prev.filter(r => r.id !== id));
    onToast?.(t('resource.deleted'), 'success');
  };

  useModalEsc(showAddModal, () => setShowAddModal(false));

  const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 outline-none transition-colors';

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
            <FolderOpen size={16} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('detail.resourcesTitle')}</h3>
            <span className="text-xs text-gray-400 dark:text-zinc-600">{resources.length} {t('detail.entries')}</span>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors"
        >
          <Plus size={14} /> {t('resource.add')}
        </button>
      </div>

      {/* Filter */}
      {resources.length > 0 && (
        <div className="flex items-center gap-1.5 mb-5">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterType === 'all' ? 'bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300' : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}
          >
            {t('resource.type.all')}
          </button>
          {ALL_RESOURCE_TYPES.map(rt => {
            const cfg = RESOURCE_TYPE_CONFIG[rt];
            return (
              <button
                key={rt}
                onClick={() => setFilterType(rt)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterType === rt ? 'bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300' : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}
              >
                <cfg.icon size={12} /> {t(`resource.type.${rt}` as keyof typeof t)}
              </button>
            );
          })}
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-zinc-800/40 flex items-center justify-center mx-auto mb-4">
            <FolderOpen size={28} className="text-gray-400 dark:text-zinc-600" />
          </div>
          <p className="text-sm text-gray-500 dark:text-zinc-500 font-medium">{t('resource.empty')}</p>
          <p className="text-xs text-gray-400 dark:text-zinc-600 mt-1">{t('resource.emptyHint')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(res => {
            const cfg = RESOURCE_TYPE_CONFIG[res.type];
            const TypeIcon = cfg.icon;
            const isExpanded = expandedId === res.id;
            return (
              <div key={res.id} className="bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-zinc-800/40 rounded-2xl p-4 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-${cfg.color}-50 dark:bg-${cfg.color}-500/10`}>
                    <TypeIcon size={16} className={`text-${cfg.color}-600 dark:text-${cfg.color}-400`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium text-sm text-gray-900 dark:text-white truncate">{res.title}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium bg-${cfg.color}-50 dark:bg-${cfg.color}-500/10 text-${cfg.color}-600 dark:text-${cfg.color}-400`}>
                        {t(`resource.type.${res.type}` as keyof typeof t)}
                      </span>
                      {res.source === 'onboarding-form' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
                          {t('resource.source.onboarding')}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-400 dark:text-zinc-600">
                      {new Date(res.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : res.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                      title={isExpanded ? t('resource.collapseContent') : t('resource.expandContent')}
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    <button
                      onClick={() => handleDelete(res.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      title={t('resource.delete')}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800/40">
                    <pre className="text-xs text-gray-600 dark:text-zinc-400 whitespace-pre-wrap font-sans leading-relaxed max-h-64 overflow-y-auto">{res.content}</pre>
                    {res.fileReference && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400">
                        <ExternalLink size={11} /> {res.fileReference}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Resource Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-800 w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">{t('resource.addTitle')}</h3>

            {/* Title */}
            <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5">{t('resource.titleLabel')}</label>
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} className={inputCls + ' mb-4'} placeholder={t('resource.titleLabel')} />

            {/* Type */}
            <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5">{t('resource.typeLabel')}</label>
            <div className="flex items-center gap-1.5 mb-4">
              {ALL_RESOURCE_TYPES.map(rt => (
                <button
                  key={rt}
                  onClick={() => setNewType(rt)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${newType === rt ? 'bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300' : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-700'}`}
                >
                  {t(`resource.type.${rt}` as keyof typeof t)}
                </button>
              ))}
            </div>

            {/* Content */}
            <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5">{t('resource.contentLabel')}</label>
            <textarea value={newContent} onChange={e => setNewContent(e.target.value)} rows={6} className={inputCls + ' mb-4 resize-none'} placeholder={t('resource.contentLabel')} />

            {/* File Reference */}
            <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5">{t('resource.fileRefLabel')}</label>
            <input value={newFileRef} onChange={e => setNewFileRef(e.target.value)} className={inputCls + ' mb-6'} placeholder="https://..." />

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                {t('resource.cancel')}
              </button>
              <button
                onClick={handleAdd}
                disabled={!newTitle.trim() || !newContent.trim()}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
              >
                {t('resource.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── System Detail View (Redesigned) ─────────────────────────────────────────

function SystemDetailView({ system, onSave, onExecute, onDelete, onToggleStatus, isUserSystem, isDemoSystem, onToast }: {
  system: AutomationSystem;
  onSave?: (system: AutomationSystem) => void;
  onExecute?: () => void;
  onDelete?: () => void;
  onToggleStatus?: () => void;
  isUserSystem?: boolean;
  isDemoSystem?: boolean;
  onToast?: (text: string, type?: ToastMessage['type']) => void;
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

  // Detail tabs: workflow (default) or resources
  const [detailTab, setDetailTab] = useState<'workflow' | 'resources'>('workflow');

  // Canvas mode: edit (default) or live (fullscreen, read-only)
  const [canvasMode, setCanvasMode] = useState<'edit' | 'live'>('edit');

  // ESC to exit live mode fullscreen overlay
  const exitLiveMode = useCallback(() => setCanvasMode('edit'), []);
  useModalEsc(canvasMode === 'live', exitLiveMode);

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

      {/* Detail Tabs */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center bg-gray-100 dark:bg-zinc-800 rounded-lg p-0.5">
          <button
            onClick={() => setDetailTab('workflow')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${detailTab === 'workflow' ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-300'}`}
          >
            <Activity size={14} /> {t('detail.workflowTitle')}
          </button>
          <button
            onClick={() => setDetailTab('resources')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${detailTab === 'resources' ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-300'}`}
          >
            <FolderOpen size={14} /> {t('detail.resourcesTitle')}
          </button>
        </div>
      </div>

      {/* ── Workflow Tab ── */}
      {detailTab === 'workflow' && (<>
        {/* Live Mode Fullscreen Overlay */}
      {canvasMode === 'live' && (
        <div className="fixed inset-0 z-50 bg-gray-50 dark:bg-[#0a0a0e] flex flex-col !mt-0">
          {/* Live Mode Header */}
          <div className="flex items-center justify-between px-6 py-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
                <SystemIcon size={16} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{system.name}</h3>
                <span className="text-xs text-gray-400 dark:text-zinc-600">{t('detail.modeLive')} · {t('detail.stepsAndConnections', { steps: system.nodes.length, connections: system.connections.length })}</span>
              </div>
              <span className="ml-2 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 uppercase tracking-wider">
                Live
              </span>
            </div>
            <button
              onClick={() => setCanvasMode('edit')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-zinc-300 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <Minimize2 size={14} /> {t('detail.exitLive')}
            </button>
          </div>
          {/* Full Canvas */}
          <div className="flex-1 overflow-hidden">
            <CanvasErrorBoundary>
              <WorkflowCanvas initialSystem={system} readOnly onExecute={handleExecuteWithEvents} nodeStates={nodeStates} style={{ height: '100%' }} />
            </CanvasErrorBoundary>
          </div>
        </div>
      )}

      {/* Workflow Canvas Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
              <Activity size={16} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('detail.workflowTitle')}</h3>
              <span className="text-xs text-gray-400 dark:text-zinc-600">{t('detail.stepsAndConnections', { steps: system.nodes.length, connections: system.connections.length })}</span>
            </div>
          </div>
          {/* Edit / Live Mode Toggle */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-100 dark:bg-zinc-800 rounded-lg p-0.5">
              <button
                onClick={() => setCanvasMode('edit')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${canvasMode === 'edit' ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-300'}`}
              >
                <Edit3 size={12} /> {t('detail.modeEdit')}
              </button>
              <button
                onClick={() => setCanvasMode('live')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${canvasMode === 'live' ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-300'}`}
              >
                <Maximize2 size={12} /> {t('detail.modeLive')}
              </button>
            </div>
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

      {/* Documents & Results — Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Documents / Files */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
              <FolderOpen size={16} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('detail.documentsTitle')}</h3>
              <span className="text-xs text-gray-400 dark:text-zinc-600">
                {system.outputs.length} {t('detail.entries')}
              </span>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-zinc-800/40 rounded-2xl p-5 min-h-[200px]">
            <OutputTable onToast={onToast} outputs={system.outputs} />
          </div>
        </section>

        {/* Processing Results */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
              <Zap size={16} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('detail.resultsTitle')}</h3>
              <span className="text-xs text-gray-400 dark:text-zinc-600">
                {artifacts.length} {t('detail.entries')}
                {artifacts.length > 0 && isComplete && <span className="ml-1 text-emerald-500"> · {t('detail.new')}</span>}
              </span>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-zinc-800/40 rounded-2xl p-5 min-h-[200px]">
            {artifacts.length > 0 && isComplete ? (
              <OutputTable onToast={onToast} outputs={artifacts.map(a => ({
                id: a.id,
                name: a.label,
                type: (a.type === 'file' ? 'document' : a.type === 'text' ? 'other' : a.type === 'url' ? 'website' : a.type === 'image' ? 'image' : 'other') as OutputType,
                link: a.url || '#',
                createdAt: a.createdAt,
                contentPreview: a.contentPreview,
                artifactType: a.type,
              }))} />
            ) : (
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-zinc-800/40 flex items-center justify-center mx-auto mb-4">
                  <Zap size={24} className="text-gray-400 dark:text-zinc-600" />
                </div>
                <p className="text-sm text-gray-500 dark:text-zinc-500">{lang === 'de' ? 'Noch keine Ergebnisse' : 'No results yet'}</p>
                <p className="text-xs text-gray-400 dark:text-zinc-600 mt-1">{lang === 'de' ? 'Führe den Workflow aus, um Ergebnisse zu sehen' : 'Execute the workflow to see results'}</p>
              </div>
            )}
          </div>
        </section>
      </div>
      </>)}

      {/* ── Resources Tab ── */}
      {detailTab === 'resources' && (
        <ResourcesPanel systemId={system.id} onToast={onToast} />
      )}
    </>
  );
}

// ─── Template Picker View ────────────────────────────────────────────────────

// ─── Icon options for template creation ──────────────────────────────────────

const TEMPLATE_ICON_OPTIONS: { key: string; component: IconComponent }[] = [
  { key: 'mail', component: Mail },
  { key: 'send', component: Send },
  { key: 'users', component: Users },
  { key: 'target', component: Target },
  { key: 'bar-chart', component: BarChart3 },
  { key: 'database', component: Database },
  { key: 'globe', component: Globe },
  { key: 'clipboard', component: Clipboard },
  { key: 'zap', component: Zap },
  { key: 'sparkles', component: Sparkles },
  { key: 'type', component: Type },
  { key: 'file-text', component: FileText },
  { key: 'shield', component: Shield },
  { key: 'bell', component: Bell },
  { key: 'play', component: Play },
  { key: 'trending-up', component: TrendingUp },
];

const TEMPLATE_CATEGORIES = ['Marketing', 'Sales', 'HR', 'Operations', 'Support'];

function TemplatePickerView({ onCreated }: { onCreated: (system: AutomationSystem) => void }) {
  const { t, lang } = useLanguage();
  const [previewTemplate, setPreviewTemplate] = useState<AutomationSystem | null>(null);
  const [templateSearch, setTemplateSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [userTemplates, setUserTemplates] = useState<AutomationSystem[]>(() => loadUserTemplates());
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Confirm dialog state for template deletion
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Creation form state
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('Marketing');
  const [newIcon, setNewIcon] = useState('zap');

  // ESC to close create modal
  const closeCreateModal = useCallback(() => setShowCreateModal(false), []);
  useModalEsc(showCreateModal, closeCreateModal);

  const allTemplates = useMemo(() => [
    ...userTemplates,
    ...WORKFLOW_TEMPLATES.map(tpl => getLocalizedTemplate(tpl, lang)),
  ], [userTemplates, lang]);

  const templateCategories = useMemo(() => {
    const cats = new Set(allTemplates.map(tpl => tpl.category));
    return ['all', ...Array.from(cats)];
  }, [allTemplates]);

  const filteredTemplates = useMemo(() => {
    let result = allTemplates;
    if (categoryFilter !== 'all') {
      result = result.filter(tpl => tpl.category === categoryFilter);
    }
    if (templateSearch.trim()) {
      const q = templateSearch.toLowerCase();
      result = result.filter(tpl =>
        tpl.name.toLowerCase().includes(q) ||
        tpl.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [templateSearch, categoryFilter, allTemplates]);

  const isUserTemplate = (id: string) => userTemplates.some(t => t.id === id);

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

  const handleCreateTemplate = () => {
    if (!newName.trim()) return;
    const template: AutomationSystem = {
      id: `utpl-${Date.now()}`,
      name: newName.trim(),
      description: newDesc.trim() || '',
      category: newCategory,
      icon: newIcon,
      status: 'draft',
      webhookUrl: '',
      nodes: [
        { id: 'n1', label: 'Start', description: 'Trigger', icon: 'zap', type: 'trigger', x: 40, y: 58 },
      ],
      connections: [],
      groups: [],
      outputs: [],
      executionCount: 0,
    };
    const updated = [...userTemplates, template];
    setUserTemplates(updated);
    saveUserTemplates(updated);
    setShowCreateModal(false);
    setNewName('');
    setNewDesc('');
    setNewCategory('Marketing');
    setNewIcon('zap');
    // Create a system from the template so user can immediately edit
    handleDuplicate(template);
  };

  const handleDeleteTemplate = (id: string) => {
    setConfirmDeleteId(id);
  };

  const confirmDeleteTemplate = () => {
    if (!confirmDeleteId) return;
    const updated = deleteUserTemplate(confirmDeleteId);
    setUserTemplates(updated);
    // If we're previewing the deleted template, go back to the grid
    if (previewTemplate?.id === confirmDeleteId) {
      setPreviewTemplate(null);
    }
    setConfirmDeleteId(null);
  };

  // ── Create Template Modal ──
  const createModal = showCreateModal ? (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
      <div
        className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 w-full max-w-md shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5">{t('templates.createTitle')}</h3>

          {/* Name */}
          <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">{t('templates.nameLabel')}</label>
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder={t('templates.namePlaceholder')}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 outline-none transition-colors mb-4"
            autoFocus
          />

          {/* Description */}
          <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">{t('templates.descLabel')}</label>
          <textarea
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            placeholder={t('templates.descPlaceholder')}
            rows={2}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 outline-none transition-colors resize-none mb-4"
          />

          {/* Category */}
          <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">{t('templates.categoryLabel')}</label>
          <div className="flex items-center gap-1.5 flex-wrap mb-4">
            {TEMPLATE_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setNewCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${newCategory === cat ? 'bg-purple-100 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400 ring-1 ring-purple-300 dark:ring-purple-500/30' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-300'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Icon Picker */}
          <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">{t('templates.iconLabel')}</label>
          <div className="grid grid-cols-8 gap-1.5 mb-6">
            {TEMPLATE_ICON_OPTIONS.map(({ key, component: IC }) => (
              <button
                key={key}
                onClick={() => setNewIcon(key)}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${newIcon === key ? 'bg-purple-100 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400 ring-1 ring-purple-300 dark:ring-purple-500/30' : 'bg-gray-50 dark:bg-zinc-800/50 text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}
              >
                <IC size={16} />
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {t('templates.cancel')}
            </button>
            <button
              onClick={handleCreateTemplate}
              disabled={!newName.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-purple-600 hover:bg-purple-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={16} /> {t('templates.create')}
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  // ── Delete Template Confirm Dialog ──
  const deleteConfirmDialog = (
    <ConfirmDialog
      open={!!confirmDeleteId}
      title={t('templates.confirmDeleteTitle')}
      message={t('templates.confirmDelete')}
      confirmLabel={t('detail.delete')}
      cancelLabel={t('templates.cancel')}
      variant="danger"
      onConfirm={confirmDeleteTemplate}
      onCancel={() => setConfirmDeleteId(null)}
    />
  );

  // ── Template Preview ──
  if (previewTemplate) {
    const isUser = isUserTemplate(previewTemplate.id);
    return (
      <div>
        {createModal}
        {deleteConfirmDialog}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setPreviewTemplate(null)}
            className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-zinc-800/50 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-zinc-700/50 transition-colors"
            title={t('templates.back')}
          >
            <ChevronLeft size={20} className="text-gray-600 dark:text-zinc-400" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{previewTemplate.name}</h2>
              {isUser && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400">
                  {t('templates.userBadge')}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-zinc-500">{previewTemplate.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-zinc-700/30 text-gray-500 dark:text-zinc-500 border border-gray-200 dark:border-zinc-700/30">
              {previewTemplate.category}
            </span>
            {isUser && (
              <button
                onClick={() => handleDeleteTemplate(previewTemplate.id)}
                className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                title={t('templates.deleteTemplate')}
              >
                <Trash2 size={15} className="text-red-500 dark:text-red-400" />
              </button>
            )}
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

      </div>
    );
  }

  // ── Template Grid ──
  return (
    <div>
      {createModal}
      {deleteConfirmDialog}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
          <Layers size={20} className="text-purple-600 dark:text-purple-400" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('templates.title')}</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-500">{t('templates.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white transition-all"
        >
          <Plus size={16} /> {t('templates.createNew')}
        </button>
      </div>

      {/* Search + Category Filter */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
          <input
            type="text"
            value={templateSearch}
            onChange={e => setTemplateSearch(e.target.value)}
            placeholder={t('templates.searchPlaceholder')}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 outline-none transition-colors"
          />
          {templateSearch && (
            <button onClick={() => setTemplateSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300" title={t('dashboard.clearSearch')}>
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {templateCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${categoryFilter === cat ? 'bg-purple-100 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-300'}`}
            >
              {cat === 'all' ? t('dashboard.filterAll') : cat}
            </button>
          ))}
        </div>
      </div>

      {filteredTemplates.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-zinc-800/40 flex items-center justify-center mx-auto mb-4">
            <Search size={24} className="text-gray-400 dark:text-zinc-600" />
          </div>
          <p className="text-sm text-gray-500 dark:text-zinc-500">{t('templates.noResults')}</p>
          <button onClick={() => { setTemplateSearch(''); setCategoryFilter('all'); }} className="text-xs text-purple-500 hover:text-purple-400 mt-2">
            {t('dashboard.clearFilters')}
          </button>
        </div>
      ) : (
      <>
      {/* User Templates Section */}
      {userTemplates.length > 0 && filteredTemplates.some(t => isUserTemplate(t.id)) && (
        <>
          <p className="text-xs text-gray-400 dark:text-zinc-500 uppercase font-medium mb-3">{t('templates.myTemplates')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
            {filteredTemplates.filter(tpl => isUserTemplate(tpl.id)).map(template => {
              const Icon = getIcon(template.icon);
              return (
                <div
                  key={template.id}
                  className="group relative text-left w-full bg-white dark:bg-zinc-900/50 border border-purple-200 dark:border-purple-500/20 rounded-2xl p-6 hover:border-purple-400/40 dark:hover:border-purple-500/30 hover:shadow-md dark:hover:shadow-none transition-all duration-300"
                >
                  <button
                    onClick={() => setPreviewTemplate(template)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-purple-50 dark:bg-purple-500/10">
                        <Icon size={22} className="text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400">
                        {t('templates.userBadge')}
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
                  {/* Delete button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(template.id); }}
                    className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all"
                    title={t('templates.deleteTemplate')}
                  >
                    <Trash2 size={13} className="text-red-500 dark:text-red-400" />
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Built-in Templates Section */}
      {filteredTemplates.some(t => !isUserTemplate(t.id)) && (
        <>
          {userTemplates.length > 0 && filteredTemplates.some(t => isUserTemplate(t.id)) && (
            <p className="text-xs text-gray-400 dark:text-zinc-500 uppercase font-medium mb-3">{t('templates.builtIn')}</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredTemplates.filter(tpl => !isUserTemplate(tpl.id)).map(template => {
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
        </>
      )}
      </>
      )}
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
  const [demoVersion, setDemoVersion] = useState(0); // Incremented when demo hidden list changes
  const { toasts, addToast, dismissToast } = useToast();

  // Confirm dialog state for system deletion
  const [confirmDeleteSystemId, setConfirmDeleteSystemId] = useState<string | null>(null);

  // Settings state
  const [settingsData, setSettingsData] = useState({
    autoExecute: false,
    notifications: true,
    webhookLogs: true,
    compactView: false,
  });

  useEffect(() => { setUserSystems(loadUserSystems()); }, []);

  const allSystems = useMemo(() => [...getVisibleDemoSystems(), ...userSystems], [userSystems, demoVersion]);
  const selectedSystem = allSystems.find(s => s.id === section);

  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Sync body/html background to prevent blue bleed-through on elastic overscroll
  useEffect(() => {
    const dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.style.backgroundColor = dark ? '#000' : '#f9fafb';
    document.body.style.backgroundColor = dark ? '#000' : '#f9fafb';
    return () => {
      document.documentElement.style.removeProperty('background-color');
      document.body.style.removeProperty('background-color');
    };
  }, [theme]);

  const handleCreated = (system: AutomationSystem) => {
    const updated = [...userSystems, system];
    setUserSystems(updated);
    saveUserSystems(updated);
    setSection(system.id);
    addToast(t('toast.systemCreated'), 'success');
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
    addToast(t('toast.systemSaved'), 'success');
  };

  const handleDeleteSystem = (systemId: string) => {
    setConfirmDeleteSystemId(systemId);
  };

  const confirmDeleteSystem = () => {
    if (!confirmDeleteSystemId) return;
    const isDemo = DEMO_SYSTEMS.some(d => d.id === confirmDeleteSystemId);

    if (isDemo) {
      hideDemoSystem(confirmDeleteSystemId);
      setDemoVersion(n => n + 1);
      addToast(t('toast.demoHidden'), 'info');
    } else {
      const updated = userSystems.filter(s => s.id !== confirmDeleteSystemId);
      setUserSystems(updated);
      saveUserSystems(updated);
      addToast(t('toast.systemDeleted'), 'success');
    }
    setConfirmDeleteSystemId(null);
    setSection('dashboard');
  };

  // Determine if the system pending deletion is a demo system (for confirm dialog message)
  const pendingDeleteIsDemo = confirmDeleteSystemId ? DEMO_SYSTEMS.some(d => d.id === confirmDeleteSystemId) : false;

  const handleToggleStatus = (systemId: string) => {
    const current = userSystems.find(s => s.id === systemId);
    const newStatus = current?.status === 'active' ? 'draft' : 'active';
    const updated = userSystems.map(s =>
      s.id === systemId ? { ...s, status: newStatus as 'active' | 'draft' } : s
    );
    setUserSystems(updated);
    saveUserSystems(updated);
    addToast(
      newStatus === 'active' ? t('toast.statusActive') : t('toast.statusDraft'),
      'info'
    );
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
    addToast(t('toast.executionStarted'), 'info');
  };

  const handleToggleSetting = (key: keyof typeof settingsData) => {
    setSettingsData(s => ({ ...s, [key]: !s[key] }));
    addToast(t('toast.settingUpdated'), 'success');
  };

  const handleResetSettings = () => {
    setSettingsData({ autoExecute: false, notifications: true, webhookLogs: true, compactView: false });
    addToast(t('toast.settingsReset'), 'info');
  };

  // Ctrl+S / Cmd+S keyboard shortcut – trigger canvas save via custom event
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        // Dispatch a custom event that WorkflowCanvas can listen to
        window.dispatchEvent(new CustomEvent('flowstack-save'));
        if (selectedSystem) {
          addToast(t('toast.systemSaved'), 'success');
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedSystem, addToast, t]);

  // ESC to close mobile sidebar
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  useModalEsc(sidebarOpen, closeSidebar);

  const navigate = (id: string) => {
    setSection(id);
    setSidebarOpen(false);
  };

  const isUserSystem = selectedSystem ? userSystems.some(s => s.id === selectedSystem.id) : false;
  const isDemoSystem = selectedSystem ? DEMO_SYSTEMS.some(d => d.id === selectedSystem.id) : false;

  const sectionTitle = section === 'dashboard' ? t('page.dashboard') : section === 'create' ? t('page.templates') : section === 'builder' ? t('page.builder') : section === 'visualizer' ? t('page.visualizer') : section === 'settings' ? t('page.settings') : selectedSystem?.name || '';
  const sectionSubtitle = section === 'dashboard'
    ? t('page.systemsAndActive', { count: allSystems.length, active: allSystems.filter(s => s.status === 'active').length })
    : section === 'create' ? t('page.templateSubtitle')
    : section === 'builder' ? t('page.builderSubtitle')
    : section === 'visualizer' ? t('page.visualizerSubtitle')
    : section === 'settings' ? t('page.settingsSubtitle')
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
              title={t('sidebar.toggleTheme')}
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
          <button
            onClick={() => navigate('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm ${
              section === 'settings'
                ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium'
                : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Settings className="w-5 h-5" />{t('sidebar.settings')}
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
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors" title={t('sidebar.openMenu')}>
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
          {section === 'settings' && (
            <div className="max-w-4xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
                  <Settings size={20} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('settings.title')}</h2>
                  <p className="text-sm text-gray-500 dark:text-zinc-500">{t('settings.subtitle')}</p>
                </div>
              </div>

              {/* Automation Settings */}
              <div className="bg-white dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800/60 rounded-2xl p-6 mb-5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                  <Zap size={16} className="text-purple-500" /> {t('settings.automationTitle')}
                </h3>
                <div className="space-y-5">
                  {([
                    { key: 'autoExecute' as const, icon: Play, label: t('settings.autoExecute'), desc: t('settings.autoExecuteDesc') },
                    { key: 'notifications' as const, icon: Bell, label: t('settings.notifications'), desc: t('settings.notificationsDesc') },
                    { key: 'webhookLogs' as const, icon: Activity, label: t('settings.webhookLogs'), desc: t('settings.webhookLogsDesc') },
                    { key: 'compactView' as const, icon: Layers, label: t('settings.compactView'), desc: t('settings.compactViewDesc') },
                  ]).map(setting => (
                    <div key={setting.key} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-zinc-800/60 flex items-center justify-center">
                          <setting.icon size={16} className="text-gray-500 dark:text-zinc-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{setting.label}</p>
                          <p className="text-xs text-gray-400 dark:text-zinc-500">{setting.desc}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleSetting(setting.key)}
                        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200 ${settingsData[setting.key] ? "bg-purple-500" : "bg-gray-200 dark:bg-zinc-600"}`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-1 ring-black/5 transition-transform duration-200 ease-in-out ${settingsData[setting.key] ? "translate-x-6" : "translate-x-1"}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Stats */}
              <div className="bg-white dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800/60 rounded-2xl p-6 mb-5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                  <BarChart3 size={16} className="text-purple-500" /> {t('settings.statsTitle')}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: t('dashboard.stats.systems'), value: allSystems.length, color: '#8b5cf6' },
                    { label: t('dashboard.stats.active'), value: allSystems.filter(s => s.status === 'active').length, color: '#10b981' },
                    { label: t('settings.draftSystems'), value: allSystems.filter(s => s.status === 'draft').length, color: '#f59e0b' },
                    { label: t('dashboard.stats.executions'), value: allSystems.reduce((s, sys) => s + sys.executionCount, 0), color: '#3b82f6' },
                  ].map(stat => (
                    <div key={stat.label} className="text-center p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/30 border border-gray-100 dark:border-zinc-800/40">
                      <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                      <div className="text-[10px] text-gray-400 dark:text-zinc-600 uppercase tracking-wider font-medium mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-white dark:bg-zinc-900/60 border border-red-200 dark:border-red-500/20 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Shield size={16} className="text-red-500" /> {t('settings.dangerZone')}
                </h3>
                <p className="text-xs text-gray-500 dark:text-zinc-500 mb-4">{t('settings.dangerDesc')}</p>
                <button
                  onClick={handleResetSettings}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  <RefreshCw size={14} /> {t('settings.resetAll')}
                </button>
              </div>
            </div>
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
              onToast={addToast}
            />
          )}
        </div>
      </main>

      {/* System Delete Confirm Dialog */}
      <ConfirmDialog
        open={!!confirmDeleteSystemId}
        title={pendingDeleteIsDemo ? t('confirm.hideDemoTitle') : t('confirm.deleteSystemTitle')}
        message={pendingDeleteIsDemo ? t('confirm.hideDemo') : t('confirm.deleteSystem')}
        confirmLabel={pendingDeleteIsDemo ? t('confirm.hide') : t('detail.delete')}
        cancelLabel={t('templates.cancel')}
        variant={pendingDeleteIsDemo ? 'warning' : 'danger'}
        onConfirm={confirmDeleteSystem}
        onCancel={() => setConfirmDeleteSystemId(null)}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
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
