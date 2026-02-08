export type Language = 'de' | 'en';

type TranslationMap = Record<string, string>;

const de: TranslationMap = {
  // ─── Error Boundary ──────────────────────────────────────
  'error.canvasLoad': 'Fehler beim Laden des Canvas',
  'error.retry': 'Erneut versuchen',

  // ─── Output Types ────────────────────────────────────────
  'outputType.document': 'Dokument',
  'outputType.folder': 'Ordner',
  'outputType.website': 'Website',
  'outputType.spreadsheet': 'Tabelle',
  'outputType.email': 'E-Mail',
  'outputType.image': 'Bild',
  'outputType.other': 'Sonstiges',

  // ─── Output Table ────────────────────────────────────────
  'outputs.empty': 'Noch keine Ergebnisse vorhanden.',
  'outputs.emptyHint': 'Führe das System aus, um Ergebnisse zu generieren.',
  'outputs.collapse': 'Einklappen',
  'outputs.show': 'Anzeigen',
  'outputs.open': 'Öffnen',
  'outputs.cancel': 'Abbrechen',
  'outputs.save': 'Speichern',
  'outputs.edit': 'Bearbeiten',

  // ─── Dashboard Overview ──────────────────────────────────
  'dashboard.stats.systems': 'Systeme',
  'dashboard.stats.active': 'Aktiv',
  'dashboard.stats.executions': 'Ausführungen',
  'dashboard.statusActive': 'Aktiv',
  'dashboard.statusDraft': 'Entwurf',
  'dashboard.openSystem': 'Öffnen',
  'dashboard.runs': 'Runs',

  // ─── System Detail ───────────────────────────────────────
  'detail.stats.executions': 'Ausführungen',
  'detail.stats.steps': 'Schritte',
  'detail.stats.connections': 'Verbindungen',
  'detail.changeStatus': 'Status ändern',
  'detail.deleteSystem': 'System löschen',
  'detail.delete': 'Löschen',
  'detail.lastExecuted': 'Zuletzt:',
  'detail.workflowTitle': 'System-Ablauf',
  'detail.stepsAndConnections': '{steps} Schritte · {connections} Verbindungen',
  'detail.resizeHeight': 'Höhe anpassen',
  'detail.resultsTitle': 'Ergebnisse',
  'detail.entries': 'Einträge',
  'detail.new': 'neu',
  'detail.lastExecution': 'Letzte Ausführung',

  // ─── Template Picker ─────────────────────────────────────
  'templates.title': 'Workflow-Vorlagen',
  'templates.subtitle': 'Wähle eine Vorlage als Startpunkt für dein System',
  'templates.duplicate': 'Duplizieren',
  'templates.steps': 'Schritte',
  'templates.connections': 'Verbindungen',
  'templates.connectionsShort': 'Verb.',
  'templates.phases': 'Phasen',
  'templates.workflowSteps': 'Workflow-Schritte',
  'templates.view': 'Ansehen',

  // ─── Main Page ───────────────────────────────────────────
  'page.dashboard': 'Dashboard',
  'page.templates': 'Vorlagen',
  'page.builder': 'Workflow Builder',
  'page.systemsAndActive': '{count} Systeme · {active} aktiv',
  'page.templateSubtitle': 'Workflow-Vorlage als Startpunkt wählen',
  'page.builderSubtitle': 'Visueller Workflow-Editor',
  'page.visualizer': 'Funnel Visualizer',
  'page.visualizerSubtitle': 'Visueller Funnel-Editor',
  'page.executionsSubtitle': '{category} · {count} Ausführungen',
  'system.copy': '(Kopie)',

  // ─── Sidebar ─────────────────────────────────────────────
  'sidebar.overview': 'Übersicht',
  'sidebar.systems': 'Systeme',
  'sidebar.tools': 'Tools',
  'sidebar.templates': 'Vorlagen',
  'sidebar.builder': 'Builder',
  'sidebar.visualizer': 'Visualizer',
  'sidebar.collapse': 'Sidebar einklappen',
  'sidebar.expand': 'Sidebar einblenden',
  'sidebar.chooseTemplate': 'Vorlage wählen',
  'sidebar.systemsCount': '{count} Systeme',
  'sidebar.activeAndRuns': '{active} aktiv · {runs} Runs',

  // ─── Delete Confirmations ────────────────────────────────
  'confirm.hideDemo': 'Demo-System ausblenden? Du kannst es nicht wiederherstellen.',
  'confirm.deleteSystem': 'System wirklich löschen? Dies kann nicht rückgängig gemacht werden.',

  // ─── Node Types (Canvas) ─────────────────────────────────
  'nodeType.trigger': 'Trigger',
  'nodeType.process': 'Prozess',
  'nodeType.ai': 'KI',
  'nodeType.output': 'Output',

  // ─── Group Colors ────────────────────────────────────────
  'color.blue': 'Blau',
  'color.green': 'Grün',
  'color.purple': 'Lila',
  'color.orange': 'Orange',
  'color.red': 'Rot',
  'color.gray': 'Grau',

  // ─── Sticky Note Colors ──────────────────────────────────
  'sticky.yellow': 'Gelb',
  'sticky.blue': 'Blau',
  'sticky.green': 'Grün',
  'sticky.pink': 'Rosa',

  // ─── Palette Items ───────────────────────────────────────
  'palette.trigger': 'Trigger',
  'palette.aiStep': 'KI-Schritt',
  'palette.data': 'Daten',
  'palette.website': 'Website',
  'palette.document': 'Dokument',
  'palette.email': 'E-Mail',
  'palette.send': 'Versand',
  'palette.ads': 'Ads',

  // ─── Canvas Palette Panel ────────────────────────────────
  'palette.elements': 'Elemente',
  'palette.tabNodes': 'Nodes',
  'palette.tabTools': 'Tools',
  'palette.tabGroups': 'Gruppen',
  'palette.phaseBackground': 'Phase / Hintergrund',
  'palette.stickyNotes': 'Sticky Notes',
  'palette.noteLabel': '{color} Notiz',
  'palette.addNode': '{label} hinzufügen',
  'palette.addGroup': '{color} Gruppe hinzufügen',
  'palette.addNote': '{color} Notiz hinzufügen',

  // ─── Canvas Save ─────────────────────────────────────────
  'canvas.saveDesc': '{count} Schritte · Manuell erstellt',
  'canvas.customCategory': 'Benutzerdefiniert',

  // ─── Canvas Toolbar ──────────────────────────────────────
  'toolbar.palette': 'Palette',
  'toolbar.paletteToggle': 'Palette ein/ausblenden',
  'toolbar.systemName': 'System-Name…',
  'toolbar.systemNameLabel': 'System-Name',
  'toolbar.undo': 'Rückgängig',
  'toolbar.undoKey': 'Rückgängig (Ctrl+Z)',
  'toolbar.redo': 'Wiederholen',
  'toolbar.redoKey': 'Wiederholen (Ctrl+Y)',
  'toolbar.snapOn': 'Snap-Hilfslinien an',
  'toolbar.snapOff': 'Snap-Hilfslinien aus',
  'toolbar.snapToggle': 'Snap-Hilfslinien umschalten',
  'toolbar.autoLayout': 'Auto-Layout',
  'toolbar.autoLayoutLabel': 'Automatische Anordnung',
  'toolbar.exportPNG': 'Als PNG exportieren',
  'toolbar.searchNode': 'Node suchen',
  'toolbar.searchNodeKey': 'Node suchen (Ctrl+F)',
  'toolbar.zoomOut': 'Herauszoomen',
  'toolbar.zoomIn': 'Hereinzoomen',
  'toolbar.zoomReset': 'Zoom zurücksetzen',
  'toolbar.fitScreen': 'An Bildschirm anpassen',
  'toolbar.shortcutsTitle': 'Tastenkürzel',
  'toolbar.shortcutsKey': 'Tastenkürzel (?)',
  'toolbar.shortcutsShow': 'Tastenkürzel anzeigen',
  'toolbar.fullscreenExit': 'Vollbild beenden',
  'toolbar.fullscreen': 'Vollbild',
  'toolbar.execute': 'System ausführen',
  'toolbar.running': 'Läuft…',
  'toolbar.done': 'Fertig',
  'toolbar.run': 'Ausführen',
  'toolbar.deleteSelection': 'Auswahl löschen',
  'toolbar.duplicate': 'Duplizieren',
  'toolbar.duplicateSelection': 'Auswahl duplizieren',
  'toolbar.saving': 'Speichern…',
  'toolbar.saved': 'Gespeichert',
  'toolbar.save': 'Speichern',
  'toolbar.saveSystem': 'System speichern',
  'toolbar.nodesConn': '{nodes} Nodes · {conn} Conn',

  // ─── Edit Dialogs ─────────────────────────────────────────
  'edit.cancel': 'Abbrechen',
  'edit.save': 'Speichern',
  'edit.editGroup': 'Phase bearbeiten',
  'edit.groupPlaceholder': 'Phasen-Name',
  'edit.editGroupAria': 'Gruppe bearbeiten',
  'edit.editNote': 'Notiz bearbeiten',
  'edit.notePlaceholder': 'Notiz-Text…',
  'edit.editNoteAria': 'Notiz bearbeiten',

  // ─── Canvas Search ───────────────────────────────────────
  'search.placeholder': 'Node suchen…',
  'search.label': 'Node suchen',
  'search.results': '{count} Treffer',

  // ─── Canvas Empty State ──────────────────────────────────
  'canvas.emptyTitle': 'Klicke auf einen Node in der Palette',
  'canvas.emptyHint': 'Mausrad zum Zoomen · Klicken & Ziehen zum Verschieben',

  // ─── Context Menu ────────────────────────────────────────
  'contextMenu.edit': 'Bearbeiten',
  'contextMenu.duplicate': 'Duplizieren',
  'contextMenu.delete': 'Löschen',

  // ─── Keyboard Shortcuts Overlay ──────────────────────────
  'shortcuts.title': 'Tastenkürzel',
  'shortcuts.close': 'Schließen',
  'shortcuts.spaceDrag': 'Leertaste + Ziehen',
  'shortcuts.spaceDragDesc': 'Canvas verschieben',
  'shortcuts.scrollDesc': 'Zoomen',
  'shortcuts.scroll': 'Mausrad',
  'shortcuts.deleteKey': 'Delete / Backspace',
  'shortcuts.deleteDesc': 'Auswahl löschen',
  'shortcuts.dblclick': 'Doppelklick',
  'shortcuts.dblclickDesc': 'Node/Gruppe bearbeiten',
  'shortcuts.shiftClick': 'Shift + Klick',
  'shortcuts.shiftClickDesc': 'Mehrfachauswahl',
  'shortcuts.ctrlZ': 'Ctrl + Z',
  'shortcuts.ctrlZDesc': 'Rückgängig',
  'shortcuts.ctrlY': 'Ctrl + Y / Shift+Z',
  'shortcuts.ctrlYDesc': 'Wiederholen',
  'shortcuts.ctrlF': 'Ctrl + F',
  'shortcuts.ctrlFDesc': 'Node suchen',
  'shortcuts.escape': 'Escape',
  'shortcuts.escapeDesc': 'Abbrechen / Schließen',
  'shortcuts.rightClick': 'Rechtsklick',
  'shortcuts.rightClickDesc': 'Kontextmenü',
  'shortcuts.questionMark': '?',
  'shortcuts.questionMarkDesc': 'Diese Hilfe',
};

const en: TranslationMap = {
  // ─── Error Boundary ──────────────────────────────────────
  'error.canvasLoad': 'Error loading canvas',
  'error.retry': 'Try again',

  // ─── Output Types ────────────────────────────────────────
  'outputType.document': 'Document',
  'outputType.folder': 'Folder',
  'outputType.website': 'Website',
  'outputType.spreadsheet': 'Spreadsheet',
  'outputType.email': 'Email',
  'outputType.image': 'Image',
  'outputType.other': 'Other',

  // ─── Output Table ────────────────────────────────────────
  'outputs.empty': 'No results yet.',
  'outputs.emptyHint': 'Run the system to generate results.',
  'outputs.collapse': 'Collapse',
  'outputs.show': 'Show',
  'outputs.open': 'Open',
  'outputs.cancel': 'Cancel',
  'outputs.save': 'Save',
  'outputs.edit': 'Edit',

  // ─── Dashboard Overview ──────────────────────────────────
  'dashboard.stats.systems': 'Systems',
  'dashboard.stats.active': 'Active',
  'dashboard.stats.executions': 'Executions',
  'dashboard.statusActive': 'Active',
  'dashboard.statusDraft': 'Draft',
  'dashboard.openSystem': 'Open',
  'dashboard.runs': 'Runs',

  // ─── System Detail ───────────────────────────────────────
  'detail.stats.executions': 'Executions',
  'detail.stats.steps': 'Steps',
  'detail.stats.connections': 'Connections',
  'detail.changeStatus': 'Change status',
  'detail.deleteSystem': 'Delete system',
  'detail.delete': 'Delete',
  'detail.lastExecuted': 'Last:',
  'detail.workflowTitle': 'System Workflow',
  'detail.stepsAndConnections': '{steps} Steps · {connections} Connections',
  'detail.resizeHeight': 'Adjust height',
  'detail.resultsTitle': 'Results',
  'detail.entries': 'Entries',
  'detail.new': 'new',
  'detail.lastExecution': 'Last Execution',

  // ─── Template Picker ─────────────────────────────────────
  'templates.title': 'Workflow Templates',
  'templates.subtitle': 'Choose a template as a starting point for your system',
  'templates.duplicate': 'Duplicate',
  'templates.steps': 'Steps',
  'templates.connections': 'Connections',
  'templates.connectionsShort': 'Conn.',
  'templates.phases': 'Phases',
  'templates.workflowSteps': 'Workflow Steps',
  'templates.view': 'View',

  // ─── Main Page ───────────────────────────────────────────
  'page.dashboard': 'Dashboard',
  'page.templates': 'Templates',
  'page.builder': 'Workflow Builder',
  'page.systemsAndActive': '{count} Systems · {active} active',
  'page.templateSubtitle': 'Choose a workflow template as starting point',
  'page.builderSubtitle': 'Visual Workflow Editor',
  'page.visualizer': 'Funnel Visualizer',
  'page.visualizerSubtitle': 'Visual Funnel Editor',
  'page.executionsSubtitle': '{category} · {count} Executions',
  'system.copy': '(Copy)',

  // ─── Sidebar ─────────────────────────────────────────────
  'sidebar.overview': 'Overview',
  'sidebar.systems': 'Systems',
  'sidebar.tools': 'Tools',
  'sidebar.templates': 'Templates',
  'sidebar.builder': 'Builder',
  'sidebar.visualizer': 'Visualizer',
  'sidebar.collapse': 'Collapse sidebar',
  'sidebar.expand': 'Expand sidebar',
  'sidebar.chooseTemplate': 'Choose template',
  'sidebar.systemsCount': '{count} Systems',
  'sidebar.activeAndRuns': '{active} active · {runs} Runs',

  // ─── Delete Confirmations ────────────────────────────────
  'confirm.hideDemo': 'Hide demo system? This cannot be undone.',
  'confirm.deleteSystem': 'Delete this system? This cannot be undone.',

  // ─── Node Types (Canvas) ─────────────────────────────────
  'nodeType.trigger': 'Trigger',
  'nodeType.process': 'Process',
  'nodeType.ai': 'AI',
  'nodeType.output': 'Output',

  // ─── Group Colors ────────────────────────────────────────
  'color.blue': 'Blue',
  'color.green': 'Green',
  'color.purple': 'Purple',
  'color.orange': 'Orange',
  'color.red': 'Red',
  'color.gray': 'Gray',

  // ─── Sticky Note Colors ──────────────────────────────────
  'sticky.yellow': 'Yellow',
  'sticky.blue': 'Blue',
  'sticky.green': 'Green',
  'sticky.pink': 'Pink',

  // ─── Palette Items ───────────────────────────────────────
  'palette.trigger': 'Trigger',
  'palette.aiStep': 'AI Step',
  'palette.data': 'Data',
  'palette.website': 'Website',
  'palette.document': 'Document',
  'palette.email': 'Email',
  'palette.send': 'Send',
  'palette.ads': 'Ads',

  // ─── Canvas Palette Panel ────────────────────────────────
  'palette.elements': 'Elements',
  'palette.tabNodes': 'Nodes',
  'palette.tabTools': 'Tools',
  'palette.tabGroups': 'Groups',
  'palette.phaseBackground': 'Phase / Background',
  'palette.stickyNotes': 'Sticky Notes',
  'palette.noteLabel': '{color} Note',
  'palette.addNode': 'Add {label}',
  'palette.addGroup': 'Add {color} group',
  'palette.addNote': 'Add {color} note',

  // ─── Canvas Save ─────────────────────────────────────────
  'canvas.saveDesc': '{count} steps · Manually created',
  'canvas.customCategory': 'Custom',

  // ─── Canvas Toolbar ──────────────────────────────────────
  'toolbar.palette': 'Palette',
  'toolbar.paletteToggle': 'Toggle palette',
  'toolbar.systemName': 'System name…',
  'toolbar.systemNameLabel': 'System name',
  'toolbar.undo': 'Undo',
  'toolbar.undoKey': 'Undo (Ctrl+Z)',
  'toolbar.redo': 'Redo',
  'toolbar.redoKey': 'Redo (Ctrl+Y)',
  'toolbar.snapOn': 'Snap guides on',
  'toolbar.snapOff': 'Snap guides off',
  'toolbar.snapToggle': 'Toggle snap guides',
  'toolbar.autoLayout': 'Auto-Layout',
  'toolbar.autoLayoutLabel': 'Automatic arrangement',
  'toolbar.exportPNG': 'Export as PNG',
  'toolbar.searchNode': 'Search node',
  'toolbar.searchNodeKey': 'Search node (Ctrl+F)',
  'toolbar.zoomOut': 'Zoom out',
  'toolbar.zoomIn': 'Zoom in',
  'toolbar.zoomReset': 'Reset zoom',
  'toolbar.fitScreen': 'Fit to screen',
  'toolbar.shortcutsTitle': 'Keyboard shortcuts',
  'toolbar.shortcutsKey': 'Shortcuts (?)',
  'toolbar.shortcutsShow': 'Show shortcuts',
  'toolbar.fullscreenExit': 'Exit fullscreen',
  'toolbar.fullscreen': 'Fullscreen',
  'toolbar.execute': 'Execute system',
  'toolbar.running': 'Running…',
  'toolbar.done': 'Done',
  'toolbar.run': 'Execute',
  'toolbar.deleteSelection': 'Delete selection',
  'toolbar.duplicate': 'Duplicate',
  'toolbar.duplicateSelection': 'Duplicate selection',
  'toolbar.saving': 'Saving…',
  'toolbar.saved': 'Saved',
  'toolbar.save': 'Save',
  'toolbar.saveSystem': 'Save system',
  'toolbar.nodesConn': '{nodes} Nodes · {conn} Conn',

  // ─── Edit Dialogs ─────────────────────────────────────────
  'edit.cancel': 'Cancel',
  'edit.save': 'Save',
  'edit.editGroup': 'Edit phase',
  'edit.groupPlaceholder': 'Phase name',
  'edit.editGroupAria': 'Edit group',
  'edit.editNote': 'Edit note',
  'edit.notePlaceholder': 'Note text…',
  'edit.editNoteAria': 'Edit note',

  // ─── Canvas Search ───────────────────────────────────────
  'search.placeholder': 'Search node…',
  'search.label': 'Search node',
  'search.results': '{count} results',

  // ─── Canvas Empty State ──────────────────────────────────
  'canvas.emptyTitle': 'Click a node in the palette',
  'canvas.emptyHint': 'Scroll to zoom · Click & drag to pan',

  // ─── Context Menu ────────────────────────────────────────
  'contextMenu.edit': 'Edit',
  'contextMenu.duplicate': 'Duplicate',
  'contextMenu.delete': 'Delete',

  // ─── Keyboard Shortcuts Overlay ──────────────────────────
  'shortcuts.title': 'Keyboard Shortcuts',
  'shortcuts.close': 'Close',
  'shortcuts.spaceDrag': 'Space + Drag',
  'shortcuts.spaceDragDesc': 'Pan canvas',
  'shortcuts.scroll': 'Scroll wheel',
  'shortcuts.scrollDesc': 'Zoom',
  'shortcuts.deleteKey': 'Delete / Backspace',
  'shortcuts.deleteDesc': 'Delete selection',
  'shortcuts.dblclick': 'Double-click',
  'shortcuts.dblclickDesc': 'Edit node/group',
  'shortcuts.shiftClick': 'Shift + Click',
  'shortcuts.shiftClickDesc': 'Multi-select',
  'shortcuts.ctrlZ': 'Ctrl + Z',
  'shortcuts.ctrlZDesc': 'Undo',
  'shortcuts.ctrlY': 'Ctrl + Y / Shift+Z',
  'shortcuts.ctrlYDesc': 'Redo',
  'shortcuts.ctrlF': 'Ctrl + F',
  'shortcuts.ctrlFDesc': 'Search node',
  'shortcuts.escape': 'Escape',
  'shortcuts.escapeDesc': 'Cancel / Close',
  'shortcuts.rightClick': 'Right-click',
  'shortcuts.rightClickDesc': 'Context menu',
  'shortcuts.questionMark': '?',
  'shortcuts.questionMarkDesc': 'This help',
};

export const translations: Record<Language, TranslationMap> = { de, en };

/**
 * Create a translate function for a given language.
 * Supports simple interpolation: t('key', { count: 5 }) replaces {count} with 5.
 */
export function createT(lang: Language) {
  const map = translations[lang];
  return function t(key: string, params?: Record<string, string | number>): string {
    let text = map[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(`{${k}}`, String(v));
      }
    }
    return text;
  };
}
