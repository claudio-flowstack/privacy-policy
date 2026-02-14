import type { AutomationSystem, SystemNode, NodeConnection, CanvasGroup } from '@/types/automation';
import type { WizardState, WizardStep, WizardPhase } from '@/types/wizardTree';

// Layout constants — same as automationTemplates.ts
const COL_SPACING = 340;
const ROW_SPACING = 160;
const X_OFFSET = 40;
const Y_OFFSET = 58;
const NODE_W = 230;
const NODE_H = 92;

// Group padding
const GROUP_PAD = { left: 25, right: 25, top: 40, bottom: 16 };

// Map hex phase colors → GROUP_COLORS keys used by WorkflowCanvas
const HEX_TO_COLOR_NAME: Record<string, string> = {
  '#3b82f6': 'blue',
  '#10b981': 'green',
  '#8b5cf6': 'purple',
  '#f59e0b': 'orange',
  '#ef4444': 'red',
  '#6b7280': 'gray',
};

const pos = (col: number, row: number) => ({
  x: X_OFFSET + col * COL_SPACING,
  y: Y_OFFSET + row * ROW_SPACING,
});

/** Count total rows a subtree occupies (for parallel branch stacking) */
function subtreeHeight(step: WizardStep | null): number {
  if (!step) return 1;
  if (step.kind === 'node') {
    return Math.max(1, subtreeHeight(step.next));
  }
  // parallel: sum of all branch heights
  const branchTotal = step.branches.reduce(
    (sum, b) => sum + subtreeHeight(b.firstStep),
    0,
  );
  const afterHeight = subtreeHeight(step.next);
  return Math.max(branchTotal, afterHeight);
}

interface FlattenResult {
  lastNodeIds: string[];
  maxCol: number;
}

/**
 * Recursively flatten the wizard tree into positioned nodes and connections.
 */
function flattenSteps(
  step: WizardStep | null,
  prevNodeIds: string[],
  nodes: SystemNode[],
  connections: NodeConnection[],
  col: number,
  rowStart: number,
): FlattenResult {
  if (!step) {
    return { lastNodeIds: prevNodeIds, maxCol: col - 1 };
  }

  if (step.kind === 'node') {
    const { x, y } = pos(col, rowStart);
    const sn: SystemNode = {
      id: step.node.id,
      label: step.node.label,
      description: step.node.description,
      icon: step.node.icon,
      type: step.node.nodeType,
      x,
      y,
    };
    nodes.push(sn);

    // Connect from all previous nodes to this one
    for (const prevId of prevNodeIds) {
      connections.push({ from: prevId, to: sn.id });
    }

    // Recurse into next
    return flattenSteps(step.next, [sn.id], nodes, connections, col + 1, rowStart);
  }

  // kind === 'parallel'
  let currentRow = rowStart;
  let maxColInBranches = col - 1;
  const allBranchLastIds: string[] = [];

  for (const branch of step.branches) {
    const branchHeight = subtreeHeight(branch.firstStep);

    // Connect previous nodes to first node of each branch
    const result = flattenSteps(
      branch.firstStep,
      prevNodeIds,
      nodes,
      connections,
      col,
      currentRow,
    );

    allBranchLastIds.push(...result.lastNodeIds);
    maxColInBranches = Math.max(maxColInBranches, result.maxCol);
    currentRow += branchHeight;
  }

  // Continue after parallel merge
  const mergeCol = maxColInBranches + 1;
  return flattenSteps(step.next, allBranchLastIds, nodes, connections, mergeCol, rowStart);
}

/**
 * Smart group builder: splits each phase into separate non-overlapping clusters.
 *
 * Problem: if nodes are laid out as [PhaseA] → [PhaseB] → [PhaseA], a single
 * PhaseA group would span the PhaseB node. Instead, we create two PhaseA groups.
 *
 * Algorithm: For each phase, greedily cluster nodes. A node joins an existing
 * cluster only if the expanded bounding box wouldn't contain any node from
 * a *different* phase. Otherwise it starts a new cluster.
 */
function buildGroups(
  phases: WizardPhase[],
  nodes: SystemNode[],
  nodePhaseMap: Map<string, string>,
): CanvasGroup[] {
  const groups: CanvasGroup[] = [];

  for (const phase of phases) {
    const phaseNodes = nodes.filter((n) => nodePhaseMap.get(n.id) === phase.id);
    if (phaseNodes.length === 0) continue;

    // Sort by x then y for deterministic clustering
    phaseNodes.sort((a, b) => a.x - b.x || a.y - b.y);

    // Greedily build clusters
    const clusters: SystemNode[][] = [];

    for (const node of phaseNodes) {
      let merged = false;

      for (const cluster of clusters) {
        // Compute hypothetical bounds if we add this node to the cluster
        const allInCluster = [...cluster, node];
        const minX = Math.min(...allInCluster.map((n) => n.x)) - GROUP_PAD.left;
        const maxX = Math.max(...allInCluster.map((n) => n.x)) + NODE_W + GROUP_PAD.right;
        const minY = Math.min(...allInCluster.map((n) => n.y)) - GROUP_PAD.top;
        const maxY = Math.max(...allInCluster.map((n) => n.y)) + NODE_H + GROUP_PAD.bottom;

        // Check: would any node from a DIFFERENT phase fall inside this box?
        const hasConflict = nodes.some((n) => {
          const otherPhase = nodePhaseMap.get(n.id);
          if (!otherPhase || otherPhase === phase.id) return false; // skip unphased or same-phase
          // Check if this other-phase node's center falls inside our box
          const cx = n.x + NODE_W / 2;
          const cy = n.y + NODE_H / 2;
          return cx > minX && cx < maxX && cy > minY && cy < maxY;
        });

        if (!hasConflict) {
          cluster.push(node);
          merged = true;
          break;
        }
      }

      if (!merged) {
        clusters.push([node]);
      }
    }

    // Create a group for each cluster
    for (let ci = 0; ci < clusters.length; ci++) {
      const cluster = clusters[ci];
      const minX = Math.min(...cluster.map((n) => n.x));
      const maxX = Math.max(...cluster.map((n) => n.x));
      const minY = Math.min(...cluster.map((n) => n.y));
      const maxY = Math.max(...cluster.map((n) => n.y));

      groups.push({
        id: `wg-${phase.id}${ci > 0 ? `-${ci}` : ''}`,
        label: phase.label,
        color: HEX_TO_COLOR_NAME[phase.color] || 'purple',
        x: minX - GROUP_PAD.left,
        y: minY - GROUP_PAD.top,
        width: maxX - minX + NODE_W + GROUP_PAD.left + GROUP_PAD.right,
        height: maxY - minY + NODE_H + GROUP_PAD.top + GROUP_PAD.bottom,
      });
    }
  }

  return groups;
}

/** Collect all node→phase mappings from the wizard tree */
function collectPhaseMap(step: WizardStep | null, map: Map<string, string>): void {
  if (!step) return;
  if (step.kind === 'node') {
    if (step.node.phaseId) {
      map.set(step.node.id, step.node.phaseId);
    }
    collectPhaseMap(step.next, map);
  } else {
    for (const branch of step.branches) {
      collectPhaseMap(branch.firstStep, map);
    }
    collectPhaseMap(step.next, map);
  }
}

/** Count all nodes in a wizard tree */
function countNodes(step: WizardStep | null): number {
  if (!step) return 0;
  if (step.kind === 'node') return 1 + countNodes(step.next);
  const branchCount = step.branches.reduce(
    (sum, b) => sum + countNodes(b.firstStep),
    0,
  );
  return branchCount + countNodes(step.next);
}

/**
 * Main conversion: WizardState → AutomationSystem
 */
export function convertWizardToSystem(state: WizardState): AutomationSystem | null {
  if (!state.rootStep) return null;

  const nodes: SystemNode[] = [];
  const connections: NodeConnection[] = [];

  flattenSteps(state.rootStep, [], nodes, connections, 0, 0);

  // Build phase→node map and generate groups
  const phaseMap = new Map<string, string>();
  collectPhaseMap(state.rootStep, phaseMap);
  const groups = buildGroups(state.phases, nodes, phaseMap);

  // Calculate viewport zoom to fit all nodes
  let canvasZoom: number | undefined;
  let canvasPan: { x: number; y: number } | undefined;
  if (nodes.length > 0) {
    const maxX = Math.max(...nodes.map((n) => n.x)) + NODE_W;
    const maxY = Math.max(...nodes.map((n) => n.y)) + NODE_H;
    // Target ~800×500 viewport
    const zoomX = 760 / (maxX + 80);
    const zoomY = 460 / (maxY + 80);
    canvasZoom = Math.min(zoomX, zoomY, 1.0);
    canvasPan = { x: 20, y: 20 };
  }

  return {
    id: `user-${Date.now()}`,
    name: state.name.trim() || 'Neues System',
    description: state.description.trim(),
    category: state.category,
    icon: state.icon,
    status: 'draft',
    webhookUrl: '',
    nodes,
    connections,
    groups,
    outputs: [],
    executionCount: 0,
    canvasZoom,
    canvasPan,
  };
}

export { countNodes, subtreeHeight };
