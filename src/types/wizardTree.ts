import type { NodeType } from './automation';

/** A single node in the wizard tree */
export interface WizardNode {
  id: string;
  icon: string;
  tKey: string;
  nodeType: NodeType;
  label: string;
  description: string;
  phaseId: string | null;
}

/** A step: either a single node or a parallel fork */
export type WizardStep =
  | { kind: 'node'; node: WizardNode; next: WizardStep | null }
  | { kind: 'parallel'; branches: WizardBranch[]; next: WizardStep | null };

/** A branch within a parallel fork */
export interface WizardBranch {
  id: string;
  label: string;
  firstStep: WizardStep | null;
}

/** A named phase/group with a color */
export interface WizardPhase {
  id: string;
  label: string;
  color: string;
}

/** Top-level wizard state */
export interface WizardState {
  name: string;
  description: string;
  category: string;
  icon: string;
  phases: WizardPhase[];
  rootStep: WizardStep | null;
}
