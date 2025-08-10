# GitHub Codespaces setup

This repo includes a ready-to-run Dev Container for GitHub Codespaces.

What you get:

- Node.js 20
- npm ci on first boot
- Forwarded ports: 4200 (Angular), 3000 (backend)
- Useful VS Code extensions preinstalled

## How to use

1. Push this branch to GitHub.
2. Open the repo in GitHub → Code → Create codespace on main.
3. Wait for the container to build and `npm ci` to finish.

## Run the app

- Frontend only:
  - In a terminal: `npm start`
- Backend + frontend:
  - Terminal 1: `npm run backend:dev` (port 3000)
  - Terminal 2: `npm start` (port 4200)

If you see the Ports panel, click the 4200 port to open the app in the browser.

Google Maps API key note: Codespaces URLs are dynamic. Add these referrers to your Google key:

- `https://*.githubpreview.dev/*`
- `https://*.app.github.dev/*`

Backend env:

- Copy `backend/.env.example` to `backend/.env` and fill in values if needed.
