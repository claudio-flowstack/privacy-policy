/**
 * useWorkflowExecution
 *
 * Custom Hook der eine WorkflowEventSource konsumiert und
 * reaktiven UI-State für Node-Status, Artifacts und Ausführung liefert.
 *
 * Funktioniert identisch mit Mock- und echten Event-Quellen.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  WorkflowEventSource,
  NodeExecutionStatus,
  Artifact,
  WorkflowExecutionResult,
} from '@/types/workflowEvents';

export interface UseWorkflowExecutionReturn {
  /** Map von nodeId → aktueller Status */
  nodeStates: Map<string, NodeExecutionStatus>;
  /** Gesammelte Artifacts der aktuellen/letzten Ausführung */
  artifacts: Artifact[];
  /** Läuft gerade eine Ausführung? */
  isRunning: boolean;
  /** Ist die letzte Ausführung fertig? (bleibt true bis nächste Ausführung) */
  isComplete: boolean;
  /** Ergebnis der letzten Ausführung */
  executionResult: WorkflowExecutionResult | null;
  /** Startet die Ausführung */
  execute: (systemId: string, nodeIds: string[], connections: { from: string; to: string }[], nodeTypes?: Record<string, string>) => void;
  /** Setzt alle States zurück */
  reset: () => void;
}

export function useWorkflowExecution(eventSource: WorkflowEventSource): UseWorkflowExecutionReturn {
  const [nodeStates, setNodeStates] = useState<Map<string, NodeExecutionStatus>>(new Map());
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [executionResult, setExecutionResult] = useState<WorkflowExecutionResult | null>(null);
  const eventSourceRef = useRef(eventSource);
  eventSourceRef.current = eventSource;

  // Subscribe to event source
  useEffect(() => {
    const unsub1 = eventSource.onNodeStatus((event) => {
      setNodeStates(prev => {
        const next = new Map(prev);
        next.set(event.nodeId, event.status);
        return next;
      });
    });

    const unsub2 = eventSource.onArtifact((artifact) => {
      setArtifacts(prev => [...prev, artifact]);
    });

    const unsub3 = eventSource.onComplete((result) => {
      setIsRunning(false);
      setIsComplete(true);
      setExecutionResult(result);
    });

    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, [eventSource]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      eventSourceRef.current.dispose();
    };
  }, []);

  const execute = useCallback((
    systemId: string,
    nodeIds: string[],
    connections: { from: string; to: string }[],
  ) => {
    setIsRunning(true);
    setIsComplete(false);
    setArtifacts([]);
    setNodeStates(new Map());
    setExecutionResult(null);
    eventSourceRef.current.execute(systemId, nodeIds, connections);
  }, []);

  const reset = useCallback(() => {
    setNodeStates(new Map());
    setArtifacts([]);
    setIsRunning(false);
    setIsComplete(false);
    setExecutionResult(null);
  }, []);

  return { nodeStates, artifacts, isRunning, isComplete, executionResult, execute, reset };
}
