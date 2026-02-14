/**
 * WizardTemplateBuilder — Step-by-step wizard for building automation workflows.
 * Users click through nodes, choose sequential vs. parallel flow, assign phases,
 * and see a live canvas preview on the right panel.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  X, Plus, ArrowDown, GitBranch, Square, ChevronDown, ChevronRight,
  Eye, Search, Trash2, Check, ArrowLeft,
  Zap, Target, Mail, Users, BarChart3, Globe, Shield, Cpu, Settings,
  Layers, Rocket, Heart,
} from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTheme } from '@/components/theme-provider';
import { renderNodeIcon } from './ToolLogos';
import { convertWizardToSystem, countNodes } from '@/utils/wizardConverter';
import { PALETTE_ITEMS } from '@/data/paletteItems';
import type { AutomationSystem } from '@/types/automation';
import type { WizardState, WizardStep, WizardNode, WizardBranch, WizardPhase } from '@/types/wizardTree';
import WorkflowCanvas from './WorkflowCanvas';

// ─── Constants ────────────────────────────────────────────────────────────────

const NODE_TYPE_COLORS: Record<string, string> = {
  trigger: '#3b82f6',
  process: '#8b5cf6',
  ai: '#d946ef',
  output: '#10b981',
};

const CATEGORIES = ['Marketing', 'Sales', 'Agentur', 'Support', 'Intern'];

const SYSTEM_ICONS = ['zap', 'target', 'mail', 'users', 'bar-chart-3', 'globe', 'shield', 'cpu', 'settings', 'layers', 'rocket', 'heart'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ICON_MAP: Record<string, any> = {
  zap: Zap, target: Target, mail: Mail, users: Users, 'bar-chart-3': BarChart3,
  globe: Globe, shield: Shield, cpu: Cpu, settings: Settings, layers: Layers,
  rocket: Rocket, heart: Heart,
};

const PHASE_COLORS = [
  { id: 'blue', color: '#3b82f6' },
  { id: 'green', color: '#10b981' },
  { id: 'purple', color: '#8b5cf6' },
  { id: 'orange', color: '#f59e0b' },
  { id: 'red', color: '#ef4444' },
  { id: 'gray', color: '#6b7280' },
];

// ─── Tailwind class constants ─────────────────────────────────────────────────

const INPUT_CLS = 'w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none';
const BTN_PRIMARY = 'px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed';
const BTN_SECONDARY = 'px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all';
const SECTION_HEADER = 'text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider';

// ─── Helpers: Tree traversal & immutable updates ──────────────────────────────

function generateId(): string {
  return `wn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Navigate the wizard tree along focusPath to find the step at that position.
 * Path elements are node IDs or branch IDs.
 * Returns [step, parentStep, parentBranchIndex] or null if not found.
 */
function getStepAtPath(root: WizardStep | null, path: string[]): WizardStep | null {
  if (path.length === 0) return root;
  if (!root) return null;

  const [head, ...rest] = path;

  if (root.kind === 'node') {
    if (root.node.id === head) {
      if (rest.length === 0) return root;
      return getStepAtPath(root.next, rest);
    }
    // Continue searching in next
    return getStepAtPath(root.next, path);
  }

  // Parallel: look in branches
  for (const branch of root.branches) {
    if (branch.id === head) {
      return getStepAtPath(branch.firstStep, rest);
    }
    // Also search inside branch recursively
    const found = getStepAtPath(branch.firstStep, path);
    if (found) return found;
  }
  // Search in next after parallel
  return getStepAtPath(root.next, path);
}

function findStepById(root: WizardStep | null, id: string): WizardStep | null {
  if (!root) return null;
  if (root.kind === 'node') {
    if (root.node.id === id) return root;
    return findStepById(root.next, id);
  }
  // Parallel
  for (const branch of root.branches) {
    if (branch.id === id) return null; // branch is not a step
    const found = findStepById(branch.firstStep, id);
    if (found) return found;
  }
  return findStepById(root.next, id);
}

/**
 * Immutably update the wizard tree: set .next of the step at the end of path,
 * or set rootStep if path is empty.
 */
function setNextAtPath(
  root: WizardStep | null,
  path: string[],
  newNext: WizardStep | null,
): WizardStep | null {
  if (path.length === 0) {
    // Append newNext at the end of existing chain or set as root
    if (!root) return newNext;
    return appendAtEnd(root, newNext);
  }

  const [head, ...rest] = path;
  if (!root) return root;

  if (root.kind === 'node') {
    if (root.node.id === head) {
      if (rest.length === 0) {
        // Set next of this node
        return { ...root, next: newNext };
      }
      return { ...root, next: setNextAtPath(root.next, rest, newNext) };
    }
    return { ...root, next: setNextAtPath(root.next, path, newNext) };
  }

  // Parallel: check branches
  const updatedBranches = root.branches.map((branch) => {
    if (branch.id === head) {
      if (rest.length === 0) {
        // Append at end of this branch
        return { ...branch, firstStep: appendAtEnd(branch.firstStep, newNext) };
      }
      return { ...branch, firstStep: setNextAtPath(branch.firstStep, rest, newNext) };
    }
    return branch;
  });

  const branchChanged = updatedBranches.some((b, i) => b !== root.branches[i]);
  if (branchChanged) {
    return { ...root, branches: updatedBranches };
  }

  return { ...root, next: setNextAtPath(root.next, path, newNext) };
}

/** Append a step at the very end of a chain */
function appendAtEnd(root: WizardStep | null, toAppend: WizardStep | null): WizardStep | null {
  if (!root) return toAppend;
  if (root.kind === 'node') {
    return { ...root, next: appendAtEnd(root.next, toAppend) };
  }
  // For parallel, append after the parallel block
  return { ...root, next: appendAtEnd(root.next, toAppend) };
}

/** Collect node labels from a step chain (for branch preview) */
function collectNodeLabels(step: WizardStep | null): string[] {
  if (!step) return [];
  if (step.kind === 'node') return [step.node.label, ...collectNodeLabels(step.next)];
  return ['⑂', ...collectNodeLabels(step.next)];
}

/**
 * Remove a node by ID from the tree, re-wiring connections.
 */
function removeNodeFromTree(root: WizardStep | null, nodeId: string): WizardStep | null {
  if (!root) return null;
  if (root.kind === 'node') {
    if (root.node.id === nodeId) {
      // Skip this node, return its next
      return root.next;
    }
    return { ...root, next: removeNodeFromTree(root.next, nodeId) };
  }
  // Parallel
  const updatedBranches = root.branches.map((b) => ({
    ...b,
    firstStep: removeNodeFromTree(b.firstStep, nodeId),
  }));
  return { ...root, branches: updatedBranches, next: removeNodeFromTree(root.next, nodeId) };
}

/**
 * Update a node's fields by ID.
 */
function updateNodeInTree(
  root: WizardStep | null,
  nodeId: string,
  updater: (node: WizardNode) => WizardNode,
): WizardStep | null {
  if (!root) return null;
  if (root.kind === 'node') {
    if (root.node.id === nodeId) {
      return { ...root, node: updater(root.node), next: updateNodeInTree(root.next, nodeId, updater) };
    }
    return { ...root, next: updateNodeInTree(root.next, nodeId, updater) };
  }
  // Parallel
  const updatedBranches = root.branches.map((b) => ({
    ...b,
    firstStep: updateNodeInTree(b.firstStep, nodeId, updater),
  }));
  return { ...root, branches: updatedBranches, next: updateNodeInTree(root.next, nodeId, updater) };
}

/**
 * Remove a parallel step from the tree. The parallel's .next is preserved
 * and re-wired to the parent (replacing the parallel block).
 */
function removeParallelAtPath(
  root: WizardStep | null,
  path: string[],
): WizardStep | null {
  if (!root) return null;

  if (root.kind === 'node') {
    const [head, ...rest] = path;
    if (root.node.id === head) {
      if (rest.length === 0) {
        // This node's .next should be the parallel — skip it
        if (root.next && root.next.kind === 'parallel') {
          return { ...root, next: root.next.next };
        }
        return root;
      }
      return { ...root, next: removeParallelAtPath(root.next, rest) };
    }
    return { ...root, next: removeParallelAtPath(root.next, path) };
  }

  // If root itself is the parallel and path is empty, remove it
  if (path.length === 0 && root.kind === 'parallel') {
    return root.next;
  }

  // Search in branches
  const updatedBranches = root.branches.map((branch) => {
    const [head, ...rest] = path;
    if (branch.id === head) {
      return { ...branch, firstStep: removeParallelAtPath(branch.firstStep, rest) };
    }
    return { ...branch, firstStep: removeParallelAtPath(branch.firstStep, path) };
  });

  const branchChanged = updatedBranches.some((b, i) => b !== root.branches[i]);
  if (branchChanged) {
    return { ...root, branches: updatedBranches, next: root.next };
  }

  return { ...root, next: removeParallelAtPath(root.next, path) };
}

/**
 * Count nodes in a phase.
 */
function countNodesInPhase(step: WizardStep | null, phaseId: string): number {
  if (!step) return 0;
  if (step.kind === 'node') {
    const match = step.node.phaseId === phaseId ? 1 : 0;
    return match + countNodesInPhase(step.next, phaseId);
  }
  const branchCount = step.branches.reduce((sum, b) => sum + countNodesInPhase(b.firstStep, phaseId), 0);
  return branchCount + countNodesInPhase(step.next, phaseId);
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface WizardTemplateBuilderProps {
  onComplete: (system: AutomationSystem) => void;
  onCancel: () => void;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function WizardTemplateBuilder({ onComplete, onCancel }: WizardTemplateBuilderProps) {
  const { t, lang } = useLanguage();
  const { theme: _theme } = useTheme(); // available for future use

  // ── State ──
  const [wizardState, setWizardState] = useState<WizardState>({
    name: '', description: '', category: 'Marketing', icon: 'zap',
    phases: [], rootStep: null,
  });
  const [focusPath, setFocusPath] = useState<string[]>([]);
  const [showNodePicker, setShowNodePicker] = useState(false);
  const [nodeSearch, setNodeSearch] = useState('');
  const [showPhaseCreator, setShowPhaseCreator] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(0);
  const [mobilePreview, setMobilePreview] = useState(false);

  // Inline node editing state
  const [editingNode, setEditingNode] = useState<{
    paletteIcon: string;
    paletteTKey: string;
    paletteType: 'trigger' | 'process' | 'ai' | 'output';
    label: string;
    description: string;
    phaseId: string | null;
  } | null>(null);

  // Branch creation state
  const [showBranchCreator, setShowBranchCreator] = useState(false);
  const [branchCount, setBranchCount] = useState(2);
  const [branchNames, setBranchNames] = useState<string[]>(['', '']);

  // Collapsible sections
  const [metaExpanded, setMetaExpanded] = useState(true);
  const [treeExpanded, setTreeExpanded] = useState(true);
  const [phaseExpanded, setPhaseExpanded] = useState(false);

  // Phase dropdown in tree outline
  const [phaseDropdownNodeId, setPhaseDropdownNodeId] = useState<string | null>(null);

  // Phase creator state
  const [newPhaseName, setNewPhaseName] = useState('');
  const [newPhaseColor, setNewPhaseColor] = useState('#3b82f6');

  // ── Derived state ──
  const previewSystem = useMemo(() => convertWizardToSystem(wizardState), [wizardState]);
  const canCreate = wizardState.name.trim() !== '' && countNodes(wizardState.rootStep) > 0;

  const filteredPaletteItems = useMemo(() => {
    if (!nodeSearch.trim()) return PALETTE_ITEMS;
    const q = nodeSearch.toLowerCase();
    return PALETTE_ITEMS.filter((item) => {
      const label = t(item.tKey).toLowerCase();
      return label.includes(q) || item.type.includes(q);
    });
  }, [nodeSearch, t]);

  const groupedPalette = useMemo(() => {
    const groups: Record<string, typeof PALETTE_ITEMS> = {
      trigger: [], ai: [], process: [], output: [],
    };
    for (const item of filteredPaletteItems) {
      groups[item.type]?.push(item);
    }
    return groups;
  }, [filteredPaletteItems]);

  // ── Handlers ──

  const handleMetaChange = useCallback(<K extends keyof WizardState>(key: K, value: WizardState[K]) => {
    setWizardState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSelectPaletteItem = useCallback((item: typeof PALETTE_ITEMS[0]) => {
    setEditingNode({
      paletteIcon: item.icon,
      paletteTKey: item.tKey,
      paletteType: item.type,
      label: t(item.tKey),
      description: '',
      phaseId: null,
    });
    setShowNodePicker(false);
  }, [t]);

  const handleConfirmNode = useCallback(() => {
    if (!editingNode) return;

    const newNode: WizardNode = {
      id: generateId(),
      icon: editingNode.paletteIcon,
      tKey: editingNode.paletteTKey,
      nodeType: editingNode.paletteType,
      label: editingNode.label || t(editingNode.paletteTKey),
      description: editingNode.description,
      phaseId: editingNode.phaseId,
    };

    const newStep: WizardStep = { kind: 'node', node: newNode, next: null };

    setWizardState((prev) => {
      if (!prev.rootStep && focusPath.length === 0) {
        return { ...prev, rootStep: newStep };
      }
      const updatedRoot = setNextAtPath(prev.rootStep, focusPath, newStep);
      return { ...prev, rootStep: updatedRoot };
    });

    setFocusPath((prev) => [...prev, newNode.id]);
    setEditingNode(null);
    setMetaExpanded(false); // Auto-collapse meta after adding a node
    setPreviewVersion((v) => v + 1);
  }, [editingNode, focusPath, t]);

  const handleAddParallelFork = useCallback(() => {
    const branches: WizardBranch[] = [];
    for (let i = 0; i < branchCount; i++) {
      branches.push({
        id: generateId(),
        label: branchNames[i] || `Branch ${i + 1}`,
        firstStep: null,
      });
    }

    const parallelStep: WizardStep = { kind: 'parallel', branches, next: null };

    setWizardState((prev) => {
      const updatedRoot = setNextAtPath(prev.rootStep, focusPath, parallelStep);
      return { ...prev, rootStep: updatedRoot };
    });

    // Don't auto-navigate — user stays at current node and sees branch overview
    setShowBranchCreator(false);
    setBranchCount(2);
    setBranchNames(['', '']);
    setPreviewVersion((v) => v + 1);
  }, [branchCount, branchNames, focusPath]);

  const handleRemoveNode = useCallback((nodeId: string) => {
    setWizardState((prev) => ({
      ...prev,
      rootStep: removeNodeFromTree(prev.rootStep, nodeId),
    }));
    setFocusPath([]);
    setPreviewVersion((v) => v + 1);
  }, []);

  const handleRemoveParallel = useCallback((atPath: string[]) => {
    setWizardState((prev) => ({
      ...prev,
      rootStep: removeParallelAtPath(prev.rootStep, atPath),
    }));
    setFocusPath(atPath.length > 0 ? atPath : []);
    setPreviewVersion((v) => v + 1);
  }, []);

  const handleUpdateNodeField = useCallback((nodeId: string, field: keyof WizardNode, value: string | null) => {
    setWizardState((prev) => ({
      ...prev,
      rootStep: updateNodeInTree(prev.rootStep, nodeId, (node) => ({
        ...node,
        [field]: value,
      })),
    }));
  }, []);

  const handleAddPhase = useCallback(() => {
    if (!newPhaseName.trim()) return;
    const phase: WizardPhase = {
      id: generateId(),
      label: newPhaseName.trim(),
      color: newPhaseColor,
    };
    setWizardState((prev) => ({ ...prev, phases: [...prev.phases, phase] }));
    setNewPhaseName('');
    setNewPhaseColor('#3b82f6');
    setShowPhaseCreator(false);
    setPreviewVersion((v) => v + 1);
  }, [newPhaseName, newPhaseColor]);

  const handleRemovePhase = useCallback((phaseId: string) => {
    setWizardState((prev) => ({
      ...prev,
      phases: prev.phases.filter((p) => p.id !== phaseId),
      rootStep: updateAllNodesPhase(prev.rootStep, phaseId),
    }));
    setPreviewVersion((v) => v + 1);
  }, []);

  const handleCreate = useCallback(() => {
    const system = convertWizardToSystem(wizardState);
    if (system) {
      onComplete(system);
    }
  }, [wizardState, onComplete]);

  const handleNavigateBack = useCallback(() => {
    setFocusPath((prev) => prev.slice(0, -1));
    setShowNodePicker(false);
    setEditingNode(null);
    setShowBranchCreator(false);
  }, []);

  const handleNavigateTo = useCallback((path: string[]) => {
    setFocusPath(path);
    setShowNodePicker(false);
    setEditingNode(null);
    setShowBranchCreator(false);
  }, []);

  const handleBranchCountChange = useCallback((count: number) => {
    setBranchCount(count);
    setBranchNames((prev) => {
      const next = [...prev];
      while (next.length < count) next.push('');
      return next.slice(0, count);
    });
  }, []);

  /** Navigate out of the current branch context (used by "Ende" button) */
  const handleEndHere = useCallback(() => {
    const newPath = [...focusPath];
    newPath.pop(); // Remove current node
    // Remove branch IDs until we hit a node ID
    while (newPath.length > 0) {
      const last = newPath[newPath.length - 1];
      const step = findStepById(wizardState.rootStep, last);
      if (!step) {
        newPath.pop(); // Branch ID — remove
      } else {
        break; // Node ID — stop
      }
    }
    setFocusPath(newPath);
    setShowNodePicker(false);
    setEditingNode(null);
    setShowBranchCreator(false);
  }, [focusPath, wizardState.rootStep]);

  // ─── Sub-components (inline) ────────────────────────────────────────────────

  // ── WizardHeader ──
  const renderWizardHeader = () => (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <div className="flex items-center gap-3">
        {focusPath.length > 0 && (
          <button
            onClick={handleNavigateBack}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-zinc-400 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {lang === 'de' ? 'Wizard Builder' : 'Wizard Builder'}
          </h2>
          {focusPath.length > 0 && (
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              {lang === 'de' ? 'Tiefe' : 'Depth'}: {focusPath.length}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setMobilePreview(true)}
          className="lg:hidden p-2 rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
          title={t('wizard.preview.show')}
        >
          <Eye size={18} />
        </button>
        <button
          onClick={onCancel}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-zinc-400 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );

  // ── MetaForm ──
  const renderMetaForm = () => (
    <div className="border-b border-gray-100 dark:border-zinc-800">
      <button
        onClick={() => setMetaExpanded(!metaExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
      >
        <span className={SECTION_HEADER}>
          {lang === 'de' ? 'Meta-Daten' : 'Metadata'}
        </span>
        {metaExpanded ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
      </button>
      {metaExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1">
              {t('wizard.meta.name')} *
            </label>
            <input
              type="text"
              value={wizardState.name}
              onChange={(e) => handleMetaChange('name', e.target.value)}
              placeholder={t('wizard.meta.namePlaceholder')}
              className={INPUT_CLS}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1">
              {t('wizard.meta.description')}
            </label>
            <textarea
              value={wizardState.description}
              onChange={(e) => handleMetaChange('description', e.target.value)}
              placeholder={t('wizard.meta.descPlaceholder')}
              rows={2}
              className={INPUT_CLS + ' resize-none'}
            />
          </div>

          {/* Category + Icon — compact row */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1">
                {t('wizard.meta.category')}
              </label>
              <div className="flex flex-wrap gap-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleMetaChange('category', cat)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all ${
                      wizardState.category === cat
                        ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 ring-1 ring-purple-300 dark:ring-purple-700'
                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="shrink-0">
              <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1">
                {t('wizard.meta.icon')}
              </label>
              <div className="flex gap-1">
                {SYSTEM_ICONS.slice(0, 6).map((iconKey) => {
                  const IconComp = ICON_MAP[iconKey];
                  return (
                    <button
                      key={iconKey}
                      onClick={() => handleMetaChange('icon', iconKey)}
                      className={`p-1.5 rounded-lg flex items-center justify-center transition-all ${
                        wizardState.icon === iconKey
                          ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 ring-1 ring-purple-300 dark:ring-purple-700'
                          : 'bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {IconComp ? <IconComp size={16} /> : <Zap size={16} />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ── StepTreeOutline ──
  const renderStepTree = (step: WizardStep | null, depth: number, path: string[], isLast: boolean = true): JSX.Element[] => {
    if (!step) return [];
    const items: JSX.Element[] = [];

    if (step.kind === 'node') {
      const nodePath = [...path, step.node.id];
      const isActive = JSON.stringify(focusPath) === JSON.stringify(nodePath);
      const phase = wizardState.phases.find((p) => p.id === step.node.phaseId);
      const showPhaseDropdown = phaseDropdownNodeId === step.node.id;
      const hasPhases = wizardState.phases.length > 0;

      items.push(
        <div key={step.node.id} className="relative" style={{ marginLeft: `${depth * 20}px` }}>
          {/* Vertical connector line from previous node */}
          {path.length > 0 && (
            <div className="flex justify-center -mt-0.5 mb-1">
              <div className="w-px h-3 bg-gray-200 dark:bg-zinc-700" />
            </div>
          )}

          {/* Node card */}
          <button
            onClick={() => handleNavigateTo(nodePath)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all group border ${
              isActive
                ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700 shadow-sm shadow-purple-100 dark:shadow-purple-900/20'
                : 'bg-white dark:bg-zinc-800/50 border-gray-200 dark:border-zinc-700/50 hover:border-purple-200 dark:hover:border-purple-800'
            }`}
          >
            {/* Node icon */}
            <span className="flex-shrink-0">
              {renderNodeIcon(step.node.icon, undefined, undefined, 18)}
            </span>

            {/* Node info */}
            <div className="flex-1 min-w-0">
              <span className="text-xs font-medium text-gray-800 dark:text-zinc-200 truncate block">
                {step.node.label}
              </span>
              <span className="text-[10px] text-gray-400 dark:text-zinc-500 uppercase">
                {step.node.nodeType}
              </span>
            </div>

            {/* Phase badge — clickable to assign */}
            <div className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
              {phase ? (
                <button
                  onClick={(e) => { e.stopPropagation(); setPhaseDropdownNodeId(showPhaseDropdown ? null : step.node.id); }}
                  className="text-[10px] px-1.5 py-0.5 rounded-md font-medium transition-colors hover:opacity-80"
                  style={{ backgroundColor: phase.color + '20', color: phase.color }}
                  title={lang === 'de' ? 'Phase ändern' : 'Change phase'}
                >
                  {phase.label}
                </button>
              ) : hasPhases ? (
                <button
                  onClick={(e) => { e.stopPropagation(); setPhaseDropdownNodeId(showPhaseDropdown ? null : step.node.id); }}
                  className="w-4 h-4 rounded-full border-2 border-dashed border-gray-300 dark:border-zinc-600 opacity-0 group-hover:opacity-100 hover:border-purple-400 dark:hover:border-purple-500 transition-all"
                  title={lang === 'de' ? 'Phase zuweisen' : 'Assign phase'}
                />
              ) : null}

              {/* Phase dropdown */}
              {showPhaseDropdown && hasPhases && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setPhaseDropdownNodeId(null)} />
                  <div className="absolute right-0 top-full mt-1 z-40 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-lg py-1 min-w-[120px]">
                    <button
                      onClick={() => { handleUpdateNodeField(step.node.id, 'phaseId', null); setPhaseDropdownNodeId(null); }}
                      className="w-full text-left px-3 py-1.5 text-[11px] text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
                    >
                      {t('wizard.phase.none')}
                    </button>
                    {wizardState.phases.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => { handleUpdateNodeField(step.node.id, 'phaseId', p.id); setPhaseDropdownNodeId(null); setPreviewVersion((v) => v + 1); }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
                      >
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                        {p.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Delete button */}
            <button
              onClick={(e) => { e.stopPropagation(); handleRemoveNode(step.node.id); }}
              className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-all flex-shrink-0"
            >
              <Trash2 size={12} />
            </button>
          </button>

          {/* Connector to next */}
          {step.next && (
            <div className="flex justify-center mt-1">
              <ArrowDown size={12} className="text-gray-300 dark:text-zinc-600" />
            </div>
          )}
        </div>,
      );
      items.push(...renderStepTree(step.next, depth, nodePath, isLast));
    } else {
      // Parallel block
      items.push(
        <div key={`parallel-${path.join('-')}-${depth}`} className="relative" style={{ marginLeft: `${depth * 20}px` }}>
          {/* Parallel header */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-50/50 dark:bg-purple-900/10 border border-purple-200/50 dark:border-purple-800/30 mb-1">
            <GitBranch size={12} className="text-purple-500 flex-shrink-0" />
            <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">
              {t('wizard.tree.parallel')}
            </span>
            <span className="text-[10px] text-purple-400 dark:text-purple-500">
              {step.branches.length} Branches
            </span>
          </div>

          {/* Branches side by side or stacked */}
          <div className="space-y-1 ml-2 pl-3 border-l-2 border-purple-200 dark:border-purple-800/50">
            {step.branches.map((branch, branchIdx) => {
              const branchNodeCount = countNodes(branch.firstStep);
              return (
                <div key={branch.id}>
                  {/* Branch label */}
                  <button
                    onClick={() => {
                      handleNavigateTo([...path, branch.id]);
                      if (!branch.firstStep) setShowNodePicker(true);
                    }}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors mb-0.5 group"
                  >
                    <span className="w-4 h-4 rounded text-[9px] font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-500 flex items-center justify-center flex-shrink-0">
                      {branchIdx + 1}
                    </span>
                    <span className="text-[11px] font-medium text-gray-600 dark:text-zinc-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {branch.label}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-zinc-500 tabular-nums">
                      ({branchNodeCount})
                    </span>
                    <ChevronRight size={10} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>

                  {/* Branch nodes */}
                  {renderStepTree(branch.firstStep, 0, [...path, branch.id], branchIdx === step.branches.length - 1)}
                </div>
              );
            })}
          </div>

          {/* Connector after parallel */}
          {step.next && (
            <div className="flex justify-center mt-1">
              <ArrowDown size={12} className="text-gray-300 dark:text-zinc-600" />
            </div>
          )}
        </div>,
      );
      items.push(...renderStepTree(step.next, depth, path, isLast));
    }

    return items;
  };

  const renderStepTreeOutline = () => (
    <div className="border-b border-gray-100 dark:border-zinc-800">
      <button
        onClick={() => setTreeExpanded(!treeExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
      >
        <span className={SECTION_HEADER}>
          {t('wizard.tree.outline')}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium text-gray-400 dark:text-zinc-500 bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
            {countNodes(wizardState.rootStep)}
          </span>
          {treeExpanded ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
        </div>
      </button>
      {treeExpanded && (
        <div className="px-3 pb-3">
          {wizardState.rootStep ? (
            <div className="space-y-0">
              {renderStepTree(wizardState.rootStep, 0, [])}
            </div>
          ) : (
            <p className="text-xs text-gray-400 dark:text-zinc-500 px-3 py-2 italic">
              {t('wizard.tree.empty')}
            </p>
          )}
        </div>
      )}
    </div>
  );

  // ── NodePicker ──
  const renderNodePicker = () => {
    const typeLabels: Record<string, string> = {
      trigger: 'Trigger',
      ai: lang === 'de' ? 'KI / AI' : 'AI',
      process: 'Process',
      output: 'Output',
    };

    return (
      <div className="border border-gray-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 overflow-hidden">
        {/* Search */}
        <div className="p-3 border-b border-gray-100 dark:border-zinc-800">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={nodeSearch}
              onChange={(e) => setNodeSearch(e.target.value)}
              placeholder={t('wizard.search')}
              className={INPUT_CLS + ' pl-8'}
              autoFocus
            />
          </div>
        </div>
        {/* Grouped items */}
        <div className="max-h-64 overflow-y-auto p-2 space-y-2">
          {(['trigger', 'ai', 'process', 'output'] as const).map((type) => {
            const items = groupedPalette[type];
            if (!items || items.length === 0) return null;
            return (
              <div key={type}>
                <div className="flex items-center gap-2 px-2 py-1">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: NODE_TYPE_COLORS[type] }}
                  />
                  <span className="text-[10px] font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                    {typeLabels[type]}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {items.map((item, idx) => (
                    <button
                      key={`${item.tKey}-${idx}`}
                      onClick={() => handleSelectPaletteItem(item)}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors group"
                    >
                      <span className="flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                        {renderNodeIcon(item.icon, undefined, undefined, 18)}
                      </span>
                      <span className="text-xs text-gray-700 dark:text-zinc-300 truncate">
                        {t(item.tKey)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
          {filteredPaletteItems.length === 0 && (
            <p className="text-xs text-gray-400 dark:text-zinc-500 text-center py-4">
              {lang === 'de' ? 'Keine Ergebnisse' : 'No results'}
            </p>
          )}
        </div>
      </div>
    );
  };

  // ── Inline Node Editor ──
  const renderInlineNodeEditor = () => {
    if (!editingNode) return null;
    return (
      <div className="border border-purple-200 dark:border-purple-800 rounded-xl bg-purple-50/50 dark:bg-purple-900/10 p-3 space-y-3">
        <div className="flex items-center gap-2">
          <span className="flex-shrink-0">
            {renderNodeIcon(editingNode.paletteIcon, undefined, undefined, 20)}
          </span>
          <span className="text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">
            {editingNode.paletteType}
          </span>
        </div>
        {/* Label */}
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1">
            {t('wizard.step.label')}
          </label>
          <input
            type="text"
            value={editingNode.label}
            onChange={(e) => setEditingNode((prev) => prev ? { ...prev, label: e.target.value } : null)}
            placeholder={t('wizard.step.labelPlaceholder')}
            className={INPUT_CLS}
            autoFocus
          />
        </div>
        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1">
            {t('wizard.step.description')}
          </label>
          <input
            type="text"
            value={editingNode.description}
            onChange={(e) => setEditingNode((prev) => prev ? { ...prev, description: e.target.value } : null)}
            placeholder={t('wizard.step.descPlaceholder')}
            className={INPUT_CLS}
          />
        </div>
        {/* Phase */}
        {wizardState.phases.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1">
              {t('wizard.phase.assign')}
            </label>
            <select
              value={editingNode.phaseId || ''}
              onChange={(e) => setEditingNode((prev) => prev ? { ...prev, phaseId: e.target.value || null } : null)}
              className={INPUT_CLS}
            >
              <option value="">{t('wizard.phase.none')}</option>
              {wizardState.phases.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>
        )}
        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <button onClick={handleConfirmNode} className={BTN_PRIMARY + ' flex items-center gap-1.5'}>
            <Check size={14} />
            <span>{lang === 'de' ? 'Hinzufugen' : 'Add'}</span>
          </button>
          <button
            onClick={() => setEditingNode(null)}
            className={BTN_SECONDARY}
          >
            {t('wizard.action.cancel')}
          </button>
        </div>
      </div>
    );
  };

  // ── StepEditor: "What comes next?" ──
  const renderStepEditor = () => {
    if (showNodePicker || editingNode || showBranchCreator) return null;

    // Only show if we are at a node position (focusPath points to a node)
    const step = getStepAtPath(wizardState.rootStep, focusPath);
    if (!step || step.kind !== 'node') return null;
    // Only show if this node's .next is null (hasn't been extended yet)
    if (step.next !== null) return null;

    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700 dark:text-zinc-300">
          {t('wizard.step.whatNext')}
        </p>
        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={() => setShowNodePicker(true)}
            className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-zinc-700 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-all text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <ArrowDown size={16} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-zinc-200">
                {t('wizard.step.sequential')}
              </p>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                {t('wizard.step.sequentialDesc')}
              </p>
            </div>
          </button>
          <button
            onClick={() => {
              // Create 2 branches — stay at current node to show branch overview
              const branches: WizardBranch[] = [
                { id: generateId(), label: 'Branch 1', firstStep: null },
                { id: generateId(), label: 'Branch 2', firstStep: null },
              ];
              const parallelStep: WizardStep = { kind: 'parallel', branches, next: null };
              setWizardState((prev) => {
                const updatedRoot = setNextAtPath(prev.rootStep, focusPath, parallelStep);
                return { ...prev, rootStep: updatedRoot };
              });
              // Don't auto-navigate — user stays at current node and sees branch overview
              setPreviewVersion((v) => v + 1);
            }}
            className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-zinc-700 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-all text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
              <GitBranch size={16} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-zinc-200">
                {t('wizard.step.parallel')}
              </p>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                {t('wizard.step.parallelDesc')}
              </p>
            </div>
          </button>
          <button
            onClick={handleEndHere}
            className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-500 dark:text-zinc-400 group-hover:scale-110 transition-transform">
              <Square size={16} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-zinc-200">
                {t('wizard.step.endHere')}
              </p>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                {t('wizard.step.endHereDesc')}
              </p>
            </div>
          </button>
        </div>
      </div>
    );
  };

  // ── BranchCreator ──
  const renderBranchCreator = () => {
    if (!showBranchCreator) return null;
    return (
      <div className="border border-purple-200 dark:border-purple-800 rounded-xl bg-purple-50/50 dark:bg-purple-900/10 p-3 space-y-3">
        <p className="text-sm font-medium text-gray-700 dark:text-zinc-300">
          {t('wizard.step.parallel')}
        </p>
        {/* Branch count */}
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1.5">
            {lang === 'de' ? 'Anzahl Branches' : 'Number of branches'}
          </label>
          <div className="flex gap-1.5">
            {[2, 3, 4].map((n) => (
              <button
                key={n}
                onClick={() => handleBranchCountChange(n)}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                  branchCount === n
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        {/* Branch names */}
        <div className="space-y-2">
          {Array.from({ length: branchCount }, (_, i) => (
            <div key={i}>
              <label className="block text-[11px] font-medium text-gray-500 dark:text-zinc-400 mb-1">
                {t('wizard.branch.name')} {i + 1}
              </label>
              <input
                type="text"
                value={branchNames[i] || ''}
                onChange={(e) => {
                  const next = [...branchNames];
                  next[i] = e.target.value;
                  setBranchNames(next);
                }}
                placeholder={t('wizard.branch.namePlaceholder')}
                className={INPUT_CLS}
              />
            </div>
          ))}
        </div>
        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <button onClick={handleAddParallelFork} className={BTN_PRIMARY + ' flex items-center gap-1.5'}>
            <GitBranch size={14} />
            <span>{lang === 'de' ? 'Erstellen' : 'Create'}</span>
          </button>
          <button onClick={() => setShowBranchCreator(false)} className={BTN_SECONDARY}>
            {t('wizard.action.cancel')}
          </button>
        </div>
      </div>
    );
  };

  // ── BranchManager: editing existing parallel branches ──
  const renderBranchManager = () => {
    const step = getStepAtPath(wizardState.rootStep, focusPath);
    // Check if current focusPath points to a parallel step's "next" stage
    // We need to look for parallel steps in the current context
    if (!step || step.kind !== 'parallel') return null;

    const handleUpdateBranchName = (branchId: string, newName: string) => {
      setWizardState((prev) => {
        const updateStep = (s: WizardStep | null): WizardStep | null => {
          if (!s) return null;
          if (s.kind === 'parallel') {
            const matchesBranch = s.branches.some((b) => b.id === branchId);
            if (matchesBranch) {
              return {
                ...s,
                branches: s.branches.map((b) =>
                  b.id === branchId ? { ...b, label: newName } : b,
                ),
                next: updateStep(s.next),
              };
            }
            return {
              ...s,
              branches: s.branches.map((b) => ({ ...b, firstStep: updateStep(b.firstStep) })),
              next: updateStep(s.next),
            };
          }
          return { ...s, next: updateStep(s.next) };
        };
        return { ...prev, rootStep: updateStep(prev.rootStep) };
      });
    };

    const handleRemoveBranch = (branchId: string) => {
      if (step.branches.length <= 2) return;
      setWizardState((prev) => {
        const updateStep = (s: WizardStep | null): WizardStep | null => {
          if (!s) return null;
          if (s.kind === 'parallel') {
            const matchesBranch = s.branches.some((b) => b.id === branchId);
            if (matchesBranch) {
              return {
                ...s,
                branches: s.branches.filter((b) => b.id !== branchId),
                next: updateStep(s.next),
              };
            }
            return {
              ...s,
              branches: s.branches.map((b) => ({ ...b, firstStep: updateStep(b.firstStep) })),
              next: updateStep(s.next),
            };
          }
          return { ...s, next: updateStep(s.next) };
        };
        return { ...prev, rootStep: updateStep(prev.rootStep) };
      });
      setPreviewVersion((v) => v + 1);
    };

    const handleAddBranch = () => {
      if (step.branches.length >= 5) return;
      const newBranch: WizardBranch = {
        id: generateId(),
        label: `Branch ${step.branches.length + 1}`,
        firstStep: null,
      };
      setWizardState((prev) => {
        const updateStep = (s: WizardStep | null): WizardStep | null => {
          if (!s) return null;
          if (s.kind === 'parallel' && s === step) {
            return { ...s, branches: [...s.branches, newBranch] };
          }
          if (s.kind === 'parallel') {
            return {
              ...s,
              branches: s.branches.map((b) => ({ ...b, firstStep: updateStep(b.firstStep) })),
              next: updateStep(s.next),
            };
          }
          return { ...s, next: updateStep(s.next) };
        };
        return { ...prev, rootStep: updateStep(prev.rootStep) };
      });
      setPreviewVersion((v) => v + 1);
    };

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <GitBranch size={13} className="text-purple-500" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">
              {t('wizard.step.parallel')}
            </span>
          </div>
          <span className="text-[10px] text-gray-400 dark:text-zinc-500 bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-medium">
            {step.branches.length} Branches
          </span>
        </div>
        <div className="space-y-2">
          {step.branches.map((branch, idx) => {
            const nodeLabels = collectNodeLabels(branch.firstStep);
            const nodeCount = countNodes(branch.firstStep);
            const isEmpty = nodeCount === 0;

            return (
              <div
                key={branch.id}
                className="group rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 overflow-hidden hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
              >
                {/* Branch header */}
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50/80 dark:bg-zinc-800/80 border-b border-gray-100 dark:border-zinc-700/50">
                  <span className="w-5 h-5 rounded-md bg-purple-500/10 flex items-center justify-center text-[10px] font-bold text-purple-500 flex-shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={branch.label}
                    onChange={(e) => handleUpdateBranchName(branch.id, e.target.value)}
                    className="flex-1 text-xs font-medium px-1.5 py-0.5 rounded bg-transparent hover:bg-white dark:hover:bg-zinc-700 focus:bg-white dark:focus:bg-zinc-700 border border-transparent focus:border-purple-300 dark:focus:border-purple-600 text-gray-800 dark:text-zinc-200 outline-none transition-all min-w-0"
                  />
                  {step.branches.length > 2 && (
                    <button
                      onClick={() => handleRemoveBranch(branch.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-all flex-shrink-0"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>

                {/* Branch content preview + action */}
                <div className="px-3 py-2.5">
                  {isEmpty ? (
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-gray-400 dark:text-zinc-500 italic">
                        {lang === 'de' ? 'Noch keine Nodes' : 'No nodes yet'}
                      </span>
                      <button
                        onClick={() => {
                          handleNavigateTo([...focusPath, branch.id]);
                          setShowNodePicker(true);
                        }}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-purple-600 text-white hover:bg-purple-500 transition-colors font-medium flex items-center gap-1"
                      >
                        <Plus size={11} />
                        {lang === 'de' ? 'Nodes hinzufügen' : 'Add nodes'}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {/* Node chain preview */}
                      <div className="flex items-center gap-1 flex-wrap">
                        {nodeLabels.slice(0, 4).map((label, i) => (
                          <React.Fragment key={i}>
                            {i > 0 && <ArrowDown size={8} className="text-gray-300 dark:text-zinc-600 rotate-[-90deg]" />}
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300 truncate max-w-[90px]">
                              {label}
                            </span>
                          </React.Fragment>
                        ))}
                        {nodeLabels.length > 4 && (
                          <span className="text-[10px] text-gray-400 dark:text-zinc-500">
                            +{nodeLabels.length - 4}
                          </span>
                        )}
                      </div>
                      {/* Action button */}
                      <button
                        onClick={() => handleNavigateTo([...focusPath, branch.id])}
                        className="w-full text-[11px] px-2.5 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors font-medium flex items-center justify-center gap-1"
                      >
                        <Settings size={11} />
                        {lang === 'de' ? 'Branch bearbeiten' : 'Edit branch'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {step.branches.length < 5 && (
          <button
            onClick={handleAddBranch}
            className="w-full flex items-center justify-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors font-medium py-2 rounded-xl border border-dashed border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 hover:bg-purple-50/50 dark:hover:bg-purple-900/10"
          >
            <Plus size={12} />
            {t('wizard.branch.add')}
          </button>
        )}

        {/* Remove entire parallel */}
        <button
          onClick={() => {
            // focusPath points to the parallel step; remove it from its parent
            const parentPath = focusPath.slice(0, -1);
            // Walk back to find the parent node whose .next is this parallel
            handleRemoveParallel(parentPath);
          }}
          className="w-full flex items-center justify-center gap-1.5 text-[11px] text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors font-medium py-1.5 mt-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10"
        >
          <Trash2 size={12} />
          {lang === 'de' ? 'Parallel-Block entfernen' : 'Remove parallel block'}
        </button>
      </div>
    );
  };

  // ── PhasePanel ──
  const renderPhasePanel = () => (
    <div className="border-b border-gray-100 dark:border-zinc-800">
      <button
        onClick={() => setPhaseExpanded(!phaseExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
      >
        <span className={SECTION_HEADER}>
          {t('wizard.phase.title')}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium text-gray-400 dark:text-zinc-500 bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
            {wizardState.phases.length}
          </span>
          {phaseExpanded ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
        </div>
      </button>
      {phaseExpanded && (
        <div className="px-4 pb-4 space-y-2">
          {/* Existing phases */}
          {wizardState.phases.map((phase) => {
            const nodeCount = countNodesInPhase(wizardState.rootStep, phase.id);
            return (
              <div
                key={phase.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/50 group"
              >
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: phase.color }}
                />
                <span className="text-xs font-medium text-gray-700 dark:text-zinc-300 flex-1 truncate">
                  {phase.label}
                </span>
                <span className="text-[10px] text-gray-400 dark:text-zinc-500">
                  {nodeCount} {t('wizard.phase.nodes')}
                </span>
                <button
                  onClick={() => handleRemovePhase(phase.id)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-all"
                >
                  <X size={12} />
                </button>
              </div>
            );
          })}

          {/* Phase creator */}
          {showPhaseCreator ? (
            <div className="border border-gray-200 dark:border-zinc-700 rounded-xl p-3 space-y-2.5 bg-white dark:bg-zinc-900">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1">
                  {t('wizard.phase.name')}
                </label>
                <input
                  type="text"
                  value={newPhaseName}
                  onChange={(e) => setNewPhaseName(e.target.value)}
                  placeholder={t('wizard.phase.namePlaceholder')}
                  className={INPUT_CLS}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1">
                  {t('wizard.phase.color')}
                </label>
                <div className="flex gap-2">
                  {PHASE_COLORS.map((pc) => (
                    <button
                      key={pc.id}
                      onClick={() => setNewPhaseColor(pc.color)}
                      className={`w-7 h-7 rounded-full transition-all ${
                        newPhaseColor === pc.color
                          ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900 scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{
                        backgroundColor: pc.color,
                        boxShadow: newPhaseColor === pc.color ? `0 0 0 2px white, 0 0 0 4px ${pc.color}` : undefined,
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleAddPhase}
                  disabled={!newPhaseName.trim()}
                  className={BTN_PRIMARY + ' text-xs py-1.5 px-3'}
                >
                  <Check size={12} className="inline mr-1" />
                  {lang === 'de' ? 'Erstellen' : 'Create'}
                </button>
                <button
                  onClick={() => { setShowPhaseCreator(false); setNewPhaseName(''); }}
                  className={BTN_SECONDARY + ' text-xs py-1.5 px-3'}
                >
                  {t('wizard.action.cancel')}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowPhaseCreator(true)}
              className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors font-medium"
            >
              <Plus size={12} />
              {t('wizard.phase.create')}
            </button>
          )}
        </div>
      )}
    </div>
  );

  // ── Determine what to show in the wizard area ──
  const renderWizardContent = () => {
    // If editing a newly selected node
    if (editingNode) {
      return renderInlineNodeEditor();
    }

    // If showing the node picker
    if (showNodePicker) {
      return (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-zinc-300">
            {t('wizard.step.selectNode')}
          </p>
          {renderNodePicker()}
          <button
            onClick={() => { setShowNodePicker(false); setNodeSearch(''); }}
            className={BTN_SECONDARY + ' w-full mt-2'}
          >
            {t('wizard.action.cancel')}
          </button>
        </div>
      );
    }

    // If creating parallel branches
    if (showBranchCreator) {
      return renderBranchCreator();
    }

    // If at a parallel step, show branch manager
    const stepAtFocus = getStepAtPath(wizardState.rootStep, focusPath);
    if (stepAtFocus && stepAtFocus.kind === 'parallel') {
      return renderBranchManager();
    }

    // If at a node that has next=null, show "what next?"
    if (stepAtFocus && stepAtFocus.kind === 'node' && stepAtFocus.next === null) {
      return renderStepEditor();
    }

    // If at a node that already has next, show node info + next-step navigation
    if (stepAtFocus && stepAtFocus.kind === 'node') {
      const node = stepAtFocus.node;
      const nextStep = stepAtFocus.next;

      return (
        <div className="space-y-3">
          {/* Node info card with inline editing */}
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/50">
            <span className="flex-shrink-0">
              {renderNodeIcon(node.icon, undefined, undefined, 22)}
            </span>
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={node.label}
                onChange={(e) => handleUpdateNodeField(node.id, 'label', e.target.value)}
                className="block w-full text-sm font-medium text-gray-800 dark:text-zinc-200 bg-transparent border-none outline-none p-0"
              />
              <input
                type="text"
                value={node.description}
                onChange={(e) => handleUpdateNodeField(node.id, 'description', e.target.value)}
                placeholder={t('wizard.step.descPlaceholder')}
                className="block w-full text-[11px] text-gray-500 dark:text-zinc-400 bg-transparent border-none outline-none p-0 mt-0.5"
              />
            </div>
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: NODE_TYPE_COLORS[node.nodeType] || '#8b5cf6' }}
            />
          </div>

          {/* Phase assignment */}
          {wizardState.phases.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1">
                {t('wizard.phase.assign')}
              </label>
              <select
                value={node.phaseId || ''}
                onChange={(e) => handleUpdateNodeField(node.id, 'phaseId', e.target.value || null)}
                className={INPUT_CLS}
              >
                <option value="">{t('wizard.phase.none')}</option>
                {wizardState.phases.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* NEXT: Parallel branches — show branch cards */}
          {nextStep?.kind === 'parallel' && (
            <div className="mt-2 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <GitBranch size={13} className="text-purple-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                    {t('wizard.step.parallel')}
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 dark:text-zinc-500 bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-medium">
                  {nextStep.branches.length} Branches
                </span>
              </div>
              <div className="space-y-2">
                {nextStep.branches.map((branch, idx) => {
                  const nodeLabels = collectNodeLabels(branch.firstStep);
                  const branchNodeCount = countNodes(branch.firstStep);
                  const isEmpty = branchNodeCount === 0;

                  return (
                    <div
                      key={branch.id}
                      className="group rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 overflow-hidden hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                    >
                      {/* Branch header */}
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50/80 dark:bg-zinc-800/80 border-b border-gray-100 dark:border-zinc-700/50">
                        <span className="w-5 h-5 rounded-md bg-purple-500/10 flex items-center justify-center text-[10px] font-bold text-purple-500 flex-shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={branch.label}
                          onChange={(e) => {
                            const newName = e.target.value;
                            setWizardState((prev) => {
                              const curNode = getStepAtPath(prev.rootStep, focusPath);
                              if (!curNode || curNode.kind !== 'node' || !curNode.next || curNode.next.kind !== 'parallel') return prev;
                              const updatedParallel: WizardStep = {
                                ...curNode.next,
                                branches: curNode.next.branches.map((b) =>
                                  b.id === branch.id ? { ...b, label: newName } : b,
                                ),
                              };
                              return { ...prev, rootStep: setNextAtPath(prev.rootStep, focusPath, updatedParallel) };
                            });
                          }}
                          className="flex-1 text-xs font-medium px-1.5 py-0.5 rounded bg-transparent hover:bg-white dark:hover:bg-zinc-700 focus:bg-white dark:focus:bg-zinc-700 border border-transparent focus:border-purple-300 dark:focus:border-purple-600 text-gray-800 dark:text-zinc-200 outline-none transition-all min-w-0"
                        />
                        {nextStep.branches.length > 2 && (
                          <button
                            onClick={() => {
                              setWizardState((prev) => {
                                const curNode = getStepAtPath(prev.rootStep, focusPath);
                                if (!curNode || curNode.kind !== 'node' || !curNode.next || curNode.next.kind !== 'parallel') return prev;
                                const updatedParallel: WizardStep = {
                                  ...curNode.next,
                                  branches: curNode.next.branches.filter((b) => b.id !== branch.id),
                                };
                                return { ...prev, rootStep: setNextAtPath(prev.rootStep, focusPath, updatedParallel) };
                              });
                              setPreviewVersion((v) => v + 1);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-all flex-shrink-0"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>

                      {/* Branch content preview + action */}
                      <div className="px-3 py-2.5">
                        {isEmpty ? (
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-gray-400 dark:text-zinc-500 italic">
                              {lang === 'de' ? 'Noch keine Nodes' : 'No nodes yet'}
                            </span>
                            <button
                              onClick={() => {
                                handleNavigateTo([...focusPath, branch.id]);
                                setShowNodePicker(true);
                              }}
                              className="text-[11px] px-2.5 py-1 rounded-lg bg-purple-600 text-white hover:bg-purple-500 transition-colors font-medium flex items-center gap-1"
                            >
                              <Plus size={11} />
                              {lang === 'de' ? 'Nodes hinzufügen' : 'Add nodes'}
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            {/* Node chain preview */}
                            <div className="flex items-center gap-1 flex-wrap">
                              {nodeLabels.slice(0, 4).map((label, i) => (
                                <React.Fragment key={i}>
                                  {i > 0 && <ArrowDown size={8} className="text-gray-300 dark:text-zinc-600 rotate-[-90deg]" />}
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300 truncate max-w-[90px]">
                                    {label}
                                  </span>
                                </React.Fragment>
                              ))}
                              {nodeLabels.length > 4 && (
                                <span className="text-[10px] text-gray-400 dark:text-zinc-500">
                                  +{nodeLabels.length - 4}
                                </span>
                              )}
                            </div>
                            {/* Action button */}
                            <button
                              onClick={() => handleNavigateTo([...focusPath, branch.id])}
                              className="w-full text-[11px] px-2.5 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors font-medium flex items-center justify-center gap-1"
                            >
                              <Settings size={11} />
                              {lang === 'de' ? 'Branch bearbeiten' : 'Edit branch'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {nextStep.branches.length < 5 && (
                <button
                  onClick={() => {
                    setWizardState((prev) => {
                      const curNode = getStepAtPath(prev.rootStep, focusPath);
                      if (!curNode || curNode.kind !== 'node' || !curNode.next || curNode.next.kind !== 'parallel') return prev;
                      const newBranch: WizardBranch = {
                        id: generateId(),
                        label: `Branch ${curNode.next.branches.length + 1}`,
                        firstStep: null,
                      };
                      const updatedParallel: WizardStep = {
                        ...curNode.next,
                        branches: [...curNode.next.branches, newBranch],
                      };
                      return { ...prev, rootStep: setNextAtPath(prev.rootStep, focusPath, updatedParallel) };
                    });
                    setPreviewVersion((v) => v + 1);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors font-medium py-2 rounded-xl border border-dashed border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 hover:bg-purple-50/50 dark:hover:bg-purple-900/10"
                >
                  <Plus size={12} />
                  {t('wizard.branch.add')}
                </button>
              )}

              {/* Remove entire parallel */}
              <button
                onClick={() => handleRemoveParallel(focusPath)}
                className="w-full flex items-center justify-center gap-1.5 text-[11px] text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors font-medium py-1.5 mt-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10"
              >
                <Trash2 size={12} />
                {lang === 'de' ? 'Parallel-Block entfernen' : 'Remove parallel block'}
              </button>
            </div>
          )}

          {/* NEXT: Sequential node — navigate link */}
          {nextStep?.kind === 'node' && (
            <button
              onClick={() => handleNavigateTo([...focusPath, nextStep.node.id])}
              className="w-full flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50/30 dark:hover:bg-purple-900/10 transition-all text-left"
            >
              <ArrowDown size={14} className="text-gray-400 flex-shrink-0" />
              <span className="text-xs font-medium text-gray-500 dark:text-zinc-400">
                {lang === 'de' ? 'Nächster Schritt' : 'Next step'}:
              </span>
              <span className="text-xs text-gray-800 dark:text-zinc-200 truncate flex-1">
                {nextStep.node.label}
              </span>
              <ChevronRight size={12} className="text-gray-400 flex-shrink-0" />
            </button>
          )}
        </div>
      );
    }

    // Empty state (no root step yet) or inside an empty branch
    return (
      <div className="text-center py-8">
        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
          <Plus size={24} className="text-purple-500" />
        </div>
        <p className="text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
          {t('wizard.step.addNode')}
        </p>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mb-4">
          {lang === 'de'
            ? 'Wahle einen Node-Typ aus der Palette'
            : 'Choose a node type from the palette'}
        </p>
        <button
          onClick={() => setShowNodePicker(true)}
          className={BTN_PRIMARY + ' inline-flex items-center gap-1.5'}
        >
          <Plus size={14} />
          {t('wizard.step.addNode')}
        </button>
      </div>
    );
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900">
      {renderWizardHeader()}

      <div className="flex flex-col lg:flex-row flex-1 min-h-0 gap-0">
        {/* Left: Wizard Panel */}
        <div className="w-full lg:w-[45%] xl:w-[42%] border-r border-gray-200 dark:border-zinc-800 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto scroll-smooth">
            {/* Meta Form */}
            {renderMetaForm()}

            {/* Active Wizard Area — above tree & phases for visibility */}
            <div className="px-4 py-4">
              {/* Breadcrumb path */}
              {focusPath.length > 0 && (
                <div className="flex items-center gap-1 mb-3 flex-wrap">
                  <button
                    onClick={() => handleNavigateTo([])}
                    className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline font-medium"
                  >
                    Root
                  </button>
                  {focusPath.map((seg, idx) => {
                    // Try to find a node or branch name for this segment
                    const nodeStep = findStepById(wizardState.rootStep, seg);
                    let label = seg.slice(0, 8);
                    if (nodeStep && nodeStep.kind === 'node') {
                      label = nodeStep.node.label;
                    } else {
                      // Check if it's a branch
                      const allBranches = collectBranches(wizardState.rootStep);
                      const branch = allBranches.find((b) => b.id === seg);
                      if (branch) label = branch.label;
                    }
                    return (
                      <React.Fragment key={seg}>
                        <ChevronRight size={10} className="text-gray-400" />
                        <button
                          onClick={() => handleNavigateTo(focusPath.slice(0, idx + 1))}
                          className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline font-medium truncate max-w-[100px]"
                        >
                          {label}
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>
              )}

              {renderWizardContent()}
            </div>

            {/* Step Tree Outline — below wizard area */}
            {renderStepTreeOutline()}

            {/* Phase Panel — below wizard area */}
            {renderPhasePanel()}
          </div>

          {/* Bottom Action Bar */}
          <div className="sticky bottom-0 z-[60] border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 flex items-center justify-between">
            <button onClick={onCancel} className={BTN_SECONDARY}>
              {t('wizard.action.cancel')}
            </button>
            <button
              onClick={handleCreate}
              disabled={!canCreate}
              className={BTN_PRIMARY}
            >
              {t('wizard.action.create')}
            </button>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="hidden lg:flex flex-1 relative flex-col min-h-0">
          <div className="px-4 py-2.5 border-b border-gray-100 dark:border-zinc-800 flex items-center gap-2">
            <Eye size={14} className="text-gray-400" />
            <span className="text-xs font-medium text-gray-500 dark:text-zinc-400">
              {t('wizard.preview.title')}
            </span>
          </div>
          <div className="flex-1 relative">
            {previewSystem ? (
              <WorkflowCanvas
                initialSystem={previewSystem}
                readOnly
                className="h-full"
                key={previewVersion}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Eye size={32} className="mx-auto mb-2 text-gray-300 dark:text-zinc-600" />
                  <p className="text-sm text-gray-400 dark:text-zinc-500">
                    {t('wizard.preview.empty')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Preview Modal */}
      {mobilePreview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 lg:hidden">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full h-[80vh] overflow-hidden relative">
            <button
              onClick={() => setMobilePreview(false)}
              className="absolute top-3 right-3 z-10 p-2 rounded-xl bg-white/80 dark:bg-zinc-800/80 backdrop-blur hover:bg-white dark:hover:bg-zinc-700 transition-colors"
            >
              <X size={18} className="text-gray-600 dark:text-zinc-400" />
            </button>
            {previewSystem ? (
              <WorkflowCanvas
                initialSystem={previewSystem}
                readOnly
                className="h-full"
                key={previewVersion}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-gray-400 dark:text-zinc-500">
                  {t('wizard.preview.empty')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Utility: clear phaseId when phase is deleted ─────────────────────────────

function updateAllNodesPhase(root: WizardStep | null, deletedPhaseId: string): WizardStep | null {
  if (!root) return null;
  if (root.kind === 'node') {
    const updatedNode = root.node.phaseId === deletedPhaseId
      ? { ...root.node, phaseId: null }
      : root.node;
    return { ...root, node: updatedNode, next: updateAllNodesPhase(root.next, deletedPhaseId) };
  }
  return {
    ...root,
    branches: root.branches.map((b) => ({
      ...b,
      firstStep: updateAllNodesPhase(b.firstStep, deletedPhaseId),
    })),
    next: updateAllNodesPhase(root.next, deletedPhaseId),
  };
}

// ─── Utility: collect all branches from tree ──────────────────────────────────

function collectBranches(step: WizardStep | null): WizardBranch[] {
  if (!step) return [];
  if (step.kind === 'node') return collectBranches(step.next);
  return [
    ...step.branches,
    ...step.branches.flatMap((b) => collectBranches(b.firstStep)),
    ...collectBranches(step.next),
  ];
}
