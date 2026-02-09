# Deployment guide: Netlify (frontend) + Render (backend)

Overview
- Frontend: `apps/web` will be deployed to Netlify using the Next.js plugin.
- Backend: backend services (example: `services/identity`, `services/profile`) will be deployed to Render. Render can build from repo using the commands in `render.yaml`.

Netlify (frontend)
- Ensure the Netlify site is connected to this GitHub repository and branch `master`.
- In Netlify site settings, set Base directory to the repository root (we use `netlify.toml` to target `apps/web`).
- Add these repository secrets in Netlify or GitHub Actions:
  - `NETLIFY_AUTH_TOKEN` — Personal access token for Netlify (used by GitHub Action)
  - `NETLIFY_SITE_ID` — Netlify site id
- The provided GitHub Action `/.github/workflows/deploy-netlify.yml` will build and deploy the frontend on pushes to `master`.

Render (backend)
- Connect Render to this GitHub repository.
- Import the `render.yaml` from the repo when creating services, or create services manually using the settings in `render.yaml`.
- Each Render service uses a buildCommand and startCommand that runs the service-specific build and start steps from its directory (e.g. `cd services/identity && npm ci && npm run build`).
- Add required environment variables on Render for each service (e.g., `DATABASE_URL`, auth tokens, any `NEXT_PUBLIC_*` vars used by the frontend).

Notes
- The monorepo uses npm workspaces (`packageManager` set to `npm@9.8.0`). If you prefer `pnpm`, create and commit `pnpm-lock.yaml` and adjust the CI commands accordingly.
- If you want Render to build with Docker instead, add a `Dockerfile` under the service folder and set `env: docker` in `render.yaml`.
