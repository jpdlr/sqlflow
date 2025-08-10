# SQLFlow — SQL Schema Viewer & ERD Generator

A modern, React-based tool that turns SQL DDL into an interactive Entity Relationship Diagram (ERD). Upload an `.sql` file or paste SQL, then explore tables, columns, and relationships with a smooth, responsive UI.

> The UI is inspired by professional diagramming tools and built with Material Design 3 and React Flow for fast, intuitive schema exploration.

## Monorepo Layout

- `sqlflow-app/`: Create React App (TypeScript) frontend
- `firebase.json`, `.firebaserc`: Firebase Hosting configuration (root)
- `DEPLOYMENT.md`: End-to-end Firebase deploy guide
- `UI_IMPROVEMENTS.md`, `IMPROVEMENTS.md`: Design and roadmap notes
- `schema_test.sql`, `SQLFlow.sql`: Example/test SQL files

## Features

- Drag-and-drop SQL files or paste SQL directly
- Real-time parsing to generate ERDs
- Interactive canvas with pan/zoom, minimap, and keyboard shortcuts
- Clear PK/FK indicators and relationship tracing
- Multiple smart layout algorithms (hierarchical, circular, grid, etc.)
- Collapsible table cards with columns/indexes/constraints
- Dark theme with Material Design 3 styling

## Quick Start (Development)

Option A — work from the app folder:
```bash
cd sqlflow-app
npm install
npm start
```
App runs at http://localhost:3000

Option B — use root helper scripts:
```bash
npm run install:app
npm --prefix sqlflow-app start
```

## Build

```bash
# Build the CRA app
npm --prefix sqlflow-app run build
```
The production bundle is created in `sqlflow-app/build`.

## Test

```bash
cd sqlflow-app
npm test
```
Runs CRA’s Jest test runner in watch mode.

## Deployment (Firebase Hosting)

This project is configured for Firebase Hosting.

- One-time setup: install Firebase CLI and set your project ID
- Build the app, then deploy hosting

From the repo root you can run:
```bash
npm run deploy
```
This builds the app (`sqlflow-app/build`) and deploys hosting.

Detailed, step-by-step instructions (including setting `.firebaserc`) are in `DEPLOYMENT.md`.

Note: Ensure `firebase.json` hosts files from the built output. If needed, set:
```json
{
  "hosting": {
    "public": "sqlflow-app/build",
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}
```

## Project Structure (App)

```
sqlflow-app/src
├─ components/
│  ├─ ERDVisualization.tsx     # ERD canvas and interactions
│  ├─ SQLInput.tsx              # File upload and text input
│  ├─ SQLDisplay.tsx            # Syntax-highlighted SQL view
│  ├─ SearchBar.tsx, Minimap.tsx, ZoomControls.tsx
│  ├─ LayoutControls.tsx        # Layout selection + spacing
│  └─ TableToolkitIcon.tsx      # Quick actions on tables
├─ utils/
│  ├─ sqlParser.ts              # SQL → AST → graph
│  ├─ layoutAlgorithms.ts       # Hierarchical, circular, grid, etc.
│  └─ edgeRouting.ts            # Multi-directional edge routing
├─ hooks/                       # Keyboard shortcuts, filters
├─ types/                       # Shared TypeScript types
├─ App.tsx / App.css            # App shell + theming
└─ theme/                       # Material Design 3 theme
```

## Sample SQL

You can try the app with the included examples:
- `sqlflow-app/public/sample.sql`
- `sqlflow-app/public/postgresql-test.sql`

Drag one of these into the app or copy/paste the contents into the SQL input.

## Tech Stack

- React + TypeScript (Create React App)
- Material UI (MD3), Emotion
- React Flow (diagramming)
- node-sql-parser (SQL parsing)
- Prism.js (syntax highlighting)
- Firebase Hosting (deployment)

## Contributing

- Open an issue or PR with clear context and steps to reproduce.
- Keep changes focused; include before/after screenshots for UI changes where helpful.
- For deployment pipeline changes, update `DEPLOYMENT.md` accordingly.

---

For day-to-day app details and scripts, see `sqlflow-app/README.md`.

