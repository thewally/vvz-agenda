---
name: GitHub Pages deployment setup
description: Deployment strategy and configuration for vvz-agenda on GitHub Pages (project page at thewally.github.io/vvz-agenda)
type: project
---

GitHub Pages deployment uses the official `actions/deploy-pages` action (not gh-pages branch).

**Why:** Project page at `thewally.github.io/vvz-agenda` requires `base: '/vvz-agenda/'` in vite.config.ts.

**How to apply:**
- The IIFE library build does not produce index.html; the deploy workflow copies and patches `index.html` into `dist/` before uploading the Pages artifact.
- The `sed` step in the workflow rewrites the dev `<script type="module">` import to load the built `vvz-agenda.js` bundle and fixes the `manifestUrl` to include the `/vvz-agenda/` base path.
- Tests run via `npx vitest run` before build.
- Workflow file: `.github/workflows/deploy.yml`
