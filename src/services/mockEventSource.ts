/**
 * ══════════════════════════════════════════════════════════════════════════════
 * MOCK EVENT SOURCE — Demo-/Preview-Modus
 *
 * Diese Datei liefert simulierte Workflow-Events für die Frontend-Darstellung.
 * Sie ist der EINZIGE Ort, der später ausgetauscht werden muss,
 * wenn echte Backend-Events (n8n, WebSocket, API) angebunden werden.
 *
 * AUSTAUSCH-ANLEITUNG für den Entwickler:
 * 1. Erstelle eine neue Datei z.B. `src/services/liveEventSource.ts`
 * 2. Implementiere das `WorkflowEventSource` Interface
 * 3. Ersetze in `AutomationDashboardPage.tsx`:
 *      import { createMockEventSource } from '@/services/mockEventSource';
 *    durch:
 *      import { createLiveEventSource } from '@/services/liveEventSource';
 * 4. Fertig — die gesamte UI-Logik bleibt identisch.
 * ══════════════════════════════════════════════════════════════════════════════
 */

import type {
  WorkflowEventSource,
  NodeStatusEvent,
  Artifact,
  WorkflowExecutionResult,
  NodeExecutionStatus,
} from '@/types/workflowEvents';

// ─── Mock Artifact Generator ────────────────────────────────────────────────

const MOCK_ARTIFACTS: Record<string, { type: Artifact['type']; label: string; url: string; preview?: string }[]> = {
  trigger: [],
  process: [
    { type: 'text', label: 'Verarbeitungsergebnis', url: '#',
      preview: 'Die eingehenden Kontaktdaten wurden erfolgreich validiert und normalisiert. 47 von 52 Datensätzen waren vollständig. 5 Einträge hatten fehlende E-Mail-Adressen und wurden zur manuellen Prüfung markiert.\n\nNächster Schritt: Daten werden an die KI-Analyse weitergeleitet.' },
  ],
  ai: [
    { type: 'text', label: 'KI-generierte E-Mail', url: '#',
      preview: 'Betreff: Ihr individuelles Angebot für Marketing-Automatisierung\n\nSehr geehrter Herr Müller,\n\nvielen Dank für Ihr Interesse an unseren Automatisierungslösungen. Basierend auf Ihrem aktuellen Workflow-Volumen von ca. 200 Leads pro Monat empfehlen wir folgendes Paket:\n\n- Automatische Lead-Qualifizierung (spart ca. 12h/Woche)\n- Personalisierte Follow-up-Sequenzen\n- CRM-Integration mit HubSpot\n\nDer geschätzte ROI liegt bei 340% im ersten Quartal.\n\nMit freundlichen Grüßen,\nIhr Flowstack-Team' },
    { type: 'text', label: 'Content-Analyse', url: '#',
      preview: 'Analyse-Ergebnis:\n\n• Sentiment: Überwiegend positiv (78%)\n• Hauptthemen: Produktqualität, Kundenservice, Preisgestaltung\n• Top-Keywords: „einfach zu bedienen", „schneller Support", „faire Preise"\n• Empfehlung: Kundenservice-Team auf häufige Preisfragen vorbereiten\n• Nächste Aktion: Social-Media-Kampagne auf positive Testimonials aufbauen' },
  ],
  output: [
    { type: 'file', label: 'Generierter Report', url: '#', preview: 'Report_Q4_2024.pdf – 12 Seiten' },
    { type: 'url', label: 'Erstellte Landing Page', url: 'https://example.com/landing', preview: 'https://example.com/landing' },
    { type: 'image', label: 'Social-Media-Grafik', url: '#', preview: 'Instagram-Post 1080x1080px' },
  ],
};

// ─── BFS Schedule ───────────────────────────────────────────────────────────

interface ScheduleItem {
  nodeId: string;
  depth: number;
  nodeType?: string;
}

function computeBFSSchedule(
  nodeIds: string[],
  connections: { from: string; to: string }[],
  nodeTypes?: Record<string, string>,
): ScheduleItem[] {
  const incoming = new Set(connections.map(c => c.to));
  const triggerIds = nodeIds.filter(id => {
    const type = nodeTypes?.[id];
    return type === 'trigger' || !incoming.has(id);
  });
  if (triggerIds.length === 0 && nodeIds.length > 0) triggerIds.push(nodeIds[0]);

  const visited = new Set<string>();
  const queue: { id: string; depth: number }[] = triggerIds.map(id => ({ id, depth: 0 }));
  const schedule: ScheduleItem[] = [];

  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    schedule.push({ nodeId: id, depth, nodeType: nodeTypes?.[id] });
    for (const conn of connections.filter(c => c.from === id)) {
      if (!visited.has(conn.to)) queue.push({ id: conn.to, depth: depth + 1 });
    }
  }

  // Unconnected nodes
  for (const id of nodeIds) {
    if (!visited.has(id)) {
      schedule.push({ nodeId: id, depth: schedule.length, nodeType: nodeTypes?.[id] });
    }
  }

  return schedule;
}

// ─── Mock Event Source ──────────────────────────────────────────────────────

export function createMockEventSource(): WorkflowEventSource {
  const nodeStatusCallbacks: ((event: NodeStatusEvent) => void)[] = [];
  const artifactCallbacks: ((artifact: Artifact) => void)[] = [];
  const completeCallbacks: ((result: WorkflowExecutionResult) => void)[] = [];
  const timeouts: ReturnType<typeof setTimeout>[] = [];

  function emit<T>(callbacks: ((data: T) => void)[], data: T) {
    callbacks.forEach(cb => cb(data));
  }

  function clearAllTimeouts() {
    timeouts.forEach(clearTimeout);
    timeouts.length = 0;
  }

  return {
    execute(systemId, nodeIds, connections) {
      clearAllTimeouts();

      const executionId = `exec-${Date.now()}`;
      const startedAt = new Date().toISOString();

      // Schedule: jeder Node bekommt pending → running → completed
      // Timing: deliberate pace — 600ms pending, 1200ms running per layer
      const schedule = computeBFSSchedule(systemId ? nodeIds : [], connections);
      const nodeStates: Record<string, NodeExecutionStatus> = {};
      let totalDelay = 0;

      for (const item of schedule) {
        const baseDelay = item.depth * 2000; // 2s pro Layer

        // → pending
        const t1 = setTimeout(() => {
          nodeStates[item.nodeId] = 'pending';
          emit(nodeStatusCallbacks, {
            nodeId: item.nodeId,
            status: 'pending',
            timestamp: Date.now(),
            message: 'Warte auf Vorgänger…',
          });
        }, baseDelay);
        timeouts.push(t1);

        // → running (600ms nach pending)
        const t2 = setTimeout(() => {
          nodeStates[item.nodeId] = 'running';
          emit(nodeStatusCallbacks, {
            nodeId: item.nodeId,
            status: 'running',
            timestamp: Date.now(),
            message: 'Wird ausgeführt…',
          });
        }, baseDelay + 600);
        timeouts.push(t2);

        // → completed (1400ms nach running)
        const t3 = setTimeout(() => {
          nodeStates[item.nodeId] = 'completed';
          emit(nodeStatusCallbacks, {
            nodeId: item.nodeId,
            status: 'completed',
            timestamp: Date.now(),
            message: 'Abgeschlossen',
          });

          // Generate mock artifact for output/ai nodes
          const nodeType = item.nodeType || 'process';
          const templates = MOCK_ARTIFACTS[nodeType] || MOCK_ARTIFACTS.process;
          if (templates && templates.length > 0) {
            const template = templates[Math.floor(Math.random() * templates.length)];
            emit(artifactCallbacks, {
              id: `artifact-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
              nodeId: item.nodeId,
              type: template.type,
              label: template.label,
              url: template.url,
              contentPreview: template.preview,
              createdAt: new Date().toISOString(),
            });
          }
        }, baseDelay + 2000);
        timeouts.push(t3);

        totalDelay = Math.max(totalDelay, baseDelay + 2000);
      }

      // → Complete (500ms nach letztem Node)
      const tComplete = setTimeout(() => {
        emit(completeCallbacks, {
          executionId,
          systemId,
          startedAt,
          completedAt: new Date().toISOString(),
          status: 'completed',
          nodeStates,
          artifacts: [],
        });
      }, totalDelay + 500);
      timeouts.push(tComplete);
    },

    onNodeStatus(cb) {
      nodeStatusCallbacks.push(cb);
      return () => {
        const idx = nodeStatusCallbacks.indexOf(cb);
        if (idx >= 0) nodeStatusCallbacks.splice(idx, 1);
      };
    },

    onArtifact(cb) {
      artifactCallbacks.push(cb);
      return () => {
        const idx = artifactCallbacks.indexOf(cb);
        if (idx >= 0) artifactCallbacks.splice(idx, 1);
      };
    },

    onComplete(cb) {
      completeCallbacks.push(cb);
      return () => {
        const idx = completeCallbacks.indexOf(cb);
        if (idx >= 0) completeCallbacks.splice(idx, 1);
      };
    },

    dispose() {
      clearAllTimeouts();
      nodeStatusCallbacks.length = 0;
      artifactCallbacks.length = 0;
      completeCallbacks.length = 0;
    },
  };
}
