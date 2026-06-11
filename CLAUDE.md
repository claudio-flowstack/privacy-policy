# AI Automation Seite V1

## Was ist das?
Original-Codebase der Flowstack AI-Automation-Plattform. Marketing-Landingpage + interaktive Dashboards + NodeLab Workflow-Builder.
**Status: Legacy — neue Features nur noch in Flowstack-Platform.**

## Tech Stack
- React 18.3 + React Router DOM 7.12 (SPA)
- TypeScript 5.4 (strict mode)
- Vite 5.2, Tailwind CSS 3.4, Shadcn/UI (Radix)
- Lucide React 0.424 (Icons)
- Supabase 2.95 (Auth & DB)
- Path-Alias: `@/` → `./src/`

## Projektstruktur
```
src/
├── pages/              # 20+ Seiten (HomePageV1/V2/V3, Dashboards)
├── components/         # 50+ Components
│   ├── ui/             # Shadcn/UI Basis
│   └── automation/     # Canvas-System (5 große Dateien)
├── data/               # Storage, Demo-Daten, Templates
├── types/              # automation.ts, funnel.ts, etc.
├── config/             # Marketing-Copy
├── services/           # Mock-EventSource
├── hooks/, i18n/, lib/, utils/
├── App.tsx             # Router (18+ Routes)
└── main.tsx
```

## Große Dateien (NICHT refactoren — Migration nach Platform)
| Datei | Größe | Zweck |
|---|---|---|
| `components/automation/WorkflowCanvas.tsx` | 329 KB | Canvas-Engine |
| `components/automation/FunnelCanvas.tsx` | 202 KB | Funnel-Builder |
| `pages/NodeLabPage.tsx` | 192 KB | NodeLab V3 Builder |
| `pages/AutomationDashboardPage.tsx` | 184 KB | Automation-Dashboard |
| `pages/ContentDashboardPage.tsx` | 503 KB | Content-Dashboard |

## Routing
```
Landing:  /, /v1, /v2, /lp, /ap, /kostenlose-beratung, /danke
Legal:    /impressum, /datenschutz
Dashboards: /systems, /dashboard, /content, /coldmail, /linkedin, /hub
Builder:  /node-lab, /onboarding, /recruiting
```

## State Management
- Kein Zustand — Component-Level State + localStorage
- `data/*Storage.ts` Dateien für Persistence
- Supabase-Integration als optionaler Layer

## Migration nach Flowstack-Platform
- **NodeLab V3 Node-Designs**: 95%+ portiert (16 Node-Typen, 9 Themes, alle Farben)
- **Palette-Items**: Alle 53+ Items übernommen
- **ToolLogos**: Alle 47 SVGs migriert
- **Canvas-Features**: V3 Connections, Execution, Sticky Notes — portiert
- **Fehlend in Platform**: Einige Dashboard-Seiten (Content, ColdMail, LinkedIn, Hub)

## Hinweise
- Dieses Projekt nur noch als **Referenz** nutzen, nicht weiterentwickeln
- Bei Fragen "hat V1 Feature X?" → hier nachschauen
- WorkflowCanvas (329KB) ist der Monolith aus dem Platform modular entstanden ist
- NodeLabPage.tsx enthält die originalen V3-Designs als Referenz
