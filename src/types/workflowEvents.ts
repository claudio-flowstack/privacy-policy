/**
 * Workflow Event Types
 *
 * Zentrale Schnittstelle für die Workflow-Ausführung.
 * HEUTE: Wird von mockEventSource.ts mit Demo-Daten befüllt.
 * SPÄTER: Gleiche Interfaces, echte Events von Backend/WebSocket/n8n.
 */

// ─── Node Execution Status ──────────────────────────────────────────────────

export type NodeExecutionStatus = 'idle' | 'pending' | 'running' | 'completed' | 'failed';

// ─── Events ─────────────────────────────────────────────────────────────────

export interface NodeStatusEvent {
  nodeId: string;
  status: NodeExecutionStatus;
  timestamp: number;
  message?: string;           // z.B. "Daten werden geladen..."
  progress?: number;          // 0-100, optional für Fortschrittsanzeige
}

// ─── Artifacts (Ergebnisse) ─────────────────────────────────────────────────

export type ArtifactType = 'file' | 'text' | 'url' | 'website' | 'image';

export interface Artifact {
  id: string;
  nodeId: string;             // Welcher Node hat dieses Ergebnis erzeugt
  type: ArtifactType;
  label: string;
  url?: string;
  contentPreview?: string;    // Kurze Textvorschau
  createdAt: string;          // ISO timestamp
}

// ─── Execution Result ───────────────────────────────────────────────────────

export interface WorkflowExecutionResult {
  executionId: string;
  systemId: string;
  startedAt: string;
  completedAt?: string;
  status: 'running' | 'completed' | 'failed';
  nodeStates: Record<string, NodeExecutionStatus>;
  artifacts: Artifact[];
}

// ─── Event Source Interface ─────────────────────────────────────────────────
//
// Das zentrale Interface für die Workflow-Event-Quelle.
// HEUTE: mockEventSource.ts (Timer-basierte Demo)
// SPÄTER: Echte Anbindung — z.B.:
//   - WebSocket-Verbindung zu n8n
//   - Webhook-Empfänger
//   - REST API Polling
//   - Server-Sent Events (SSE)
//
// Der Entwickler muss lediglich eine neue Implementierung dieses Interfaces
// erstellen und in useWorkflowExecution einhängen.
// ─────────────────────────────────────────────────────────────────────────────

export interface WorkflowEventSource {
  /** Startet die Ausführung eines Workflows */
  execute(
    systemId: string,
    nodeIds: string[],
    connections: { from: string; to: string }[],
  ): void;

  /** Callback für Node-Status-Änderungen. Gibt unsubscribe-Funktion zurück. */
  onNodeStatus(callback: (event: NodeStatusEvent) => void): () => void;

  /** Callback für neue Artifacts. Gibt unsubscribe-Funktion zurück. */
  onArtifact(callback: (artifact: Artifact) => void): () => void;

  /** Callback wenn Ausführung abgeschlossen. Gibt unsubscribe-Funktion zurück. */
  onComplete(callback: (result: WorkflowExecutionResult) => void): () => void;

  /** Räumt laufende Timeouts/Connections auf */
  dispose(): void;
}
