# Notes UI (Vue)

A browser-based notes interface, migrated from React to Vue. The app is a single-page Vue application served by Vite. The UI is built from a root component (`src/App.vue`), a component for individual notes (`src/NoteItem.vue`), and a notes module (`src/notes.js`). Client-side routing is configured in `src/router/index.ts`.

> **Migration status:** All 3 modules have been migrated and the project builds. However, **no one has yet compared its behavior with the original React app.** The migration tool rated its own confidence at 58%. That number is an estimate, not a measured result. Treat this branch as needing review before it replaces the React version. See [Known limitations](#known-limitations) and [Manual review required](#manual-review-required).

---

## Tech stack

| Layer | Technology |
|---|---|
| UI framework | Vue (Single File Components, `.vue`) |
| Routing | Configured in `src/router/index.ts` |
| Language | TypeScript (`src/main.ts`, `src/router/index.ts`, `src/env.d.ts`) and JavaScript (`src/notes.js`) |
| Build tool / dev server | Vite (`vite.config.ts`) |
| Test runner | Vitest |
| Package manager | npm |

`package.json` lists the exact dependency versions.

---

## Prerequisites

- **Node.js** and **npm**. The migration did not record a required version, so check `package.json` for an `engines` field. If there isn't one, use a current LTS release of Node.js.
- No database is required. There is no DB setup step.

---

## Getting started

Run these steps in order, starting from a fresh clone.

### 1. Install dependencies

```bash
npm install
```

### 2. Set environment variables

The migration detected that the project needs one variable, `PORT`. Set it before running the app:

```bash
export PORT=8080
```

> **Note:** The run command below passes `--port 8080` directly to Vite. Check `vite.config.ts` to see whether `PORT` is actually read anywhere. If it isn't, the app will always use port 8080 regardless of `PORT`. See [Environment variables](#environment-variables).

### 3. Database setup

Not applicable. This project has no database.

### 4. Additional setup commands

None. The migration did not need any extra dependency-resolution or fix commands.

### 5. Run the development server

```bash
npx vite --host 0.0.0.0 --port 8080 --strictPort
```

The app will be available at `http://localhost:8080`. Because of `--strictPort`, Vite exits with an error if port 8080 is already in use. It will not switch to another port.

---

## Running tests

```bash
npx vitest run --passWithNoTests
```

This command passed during migration. **Be careful about what that result means.**

- The `--passWithNoTests` flag makes Vitest exit successfully even when it finds no test files.
- None of the project files listed in this branch are test files.

A passing run therefore does **not** prove that the migrated components have been tested. Adding tests for `src/NoteItem.vue`, `src/App.vue`, and `src/notes.js` is recommended. See [Manual review required](#manual-review-required).

---

## Environment variables

| Variable | Required | Example | Description |
|---|---|---|---|
| `PORT` | Yes (detected) | `8080` | Port for the dev server. The documented run command hardcodes `--port 8080`. Check `vite.config.ts` to confirm whether `PORT` is used. If it isn't, either wire it in or remove it from this table. |

---

## Architecture overview

```
index.html            # HTML entry point loaded by Vite
package.json          # Dependencies and npm metadata
tsconfig.json         # TypeScript compiler configuration
vite.config.ts        # Vite build/dev-server configuration
src/
├── main.ts           # App bootstrap: creates the Vue app and mounts it
├── App.vue           # Root component
├── NoteItem.vue      # Component for rendering a single note
├── notes.js          # Notes module (JavaScript)
├── env.d.ts          # TypeScript declarations for the Vite/Vue environment
└── router/
    └── index.ts      # Router configuration
```

**Flow:**

1. `index.html` loads `src/main.ts`.
2. `src/main.ts` creates the Vue application, registers the router from `src/router/index.ts`, and mounts `src/App.vue`.
3. `src/App.vue` composes the UI and renders `src/NoteItem.vue` for individual notes.
4. `src/notes.js` holds the notes logic.

Confirm the exact responsibilities of `src/notes.js` (data, helpers, or state) by reading the file.

---

## Migration notes

The project was converted from React to Vue. All 3 modules were migrated. In general terms:

- **Components:** React components were rewritten as Vue Single File Components (`src/App.vue`, `src/NoteItem.vue`). This means JSX became Vue templates and React props/state became Vue props and reactive state.
- **Entry point:** The app bootstrap now lives in `src/main.ts` and uses Vue's application API in place of React's root rendering.
- **Routing:** Routing is defined in `src/router/index.ts`.
- **Build tooling:** The project uses Vite (`vite.config.ts`) with TypeScript support (`tsconfig.json`, `src/env.d.ts`).
- **Testing:** Vitest is the test runner.
- **Mixed languages:** `src/notes.js` remains JavaScript, while the bootstrap and router are TypeScript.

The migration did not record a file-by-file mapping from the original React sources. Compare against the React codebase directly when reviewing.

---

## Known limitations

- **Behavior parity has not been checked.** Nobody has compared the migrated app against the original React app. Rendering, interactions, routing, and edge cases may differ.
- **Test coverage is unverified.** The test command uses `--passWithNoTests`, and no test files are present. The passing test result does not indicate functional coverage.
- **Confidence is moderate.** The migration's self-assessed confidence is 58%. This is not a measured score, but it suggests the output should be reviewed carefully.
- **`PORT` handling is unclear.** `PORT` was detected as required, but the run command hardcodes port 8080.
- **Unmigrated components:** None were reported. All 3 modules were migrated.
- **Failed commands:** None were reported during migration.

---

## Manual review required

No modules were flagged as low confidence. Even so, behavior has not been compared with the original and overall confidence is 58%, so **every migrated file should be reviewed**:

| File | What to verify |
|---|---|
| `src/App.vue` | Layout, rendering of the notes list, and event handling match the original React root component. |
| `src/NoteItem.vue` | Props, emitted events, conditional rendering, and styling match the original note component. |
| `src/notes.js` | Logic is unchanged from the original. If it holds state, confirm it is reactive in Vue where the UI depends on it. |
| `src/router/index.ts` | Routes, paths, and any redirects match the original React routing. |
| `src/main.ts` | The app, router, and any plugins or global styles are registered as in the original entry point. |
| `vite.config.ts` | Dev-server and build settings are correct, including whether `PORT` is honored. |

**Suggested review steps:**

1. Run the original React app and this Vue app side by side, then walk through every screen and interaction.
2. Add Vitest tests for `src/NoteItem.vue`, `src/App.vue`, and `src/notes.js`.
3. Re-run the tests without relying on `--passWithNoTests` to confirm that real tests execute.