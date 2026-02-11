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

Environment variables
- Do NOT commit real secrets to the repository. Use the platform secrets / env var features.
- Required variables (examples):
  - `DATABASE_URL` — Postgres connection string for Prisma. Example (DO NOT COMMIT):
    `postgresql://<user>:<pass>@<host>:5432/<db>?sslmode=require`

How to set `DATABASE_URL`:

- Vercel (via web UI):
  1. Open your project on Vercel → Settings → Environment Variables.
  2. Add `DATABASE_URL` with the value and choose scope (`Production`, `Preview`, `Development`).

- Vercel (CLI):
  - Install `vercel` and authenticate, then run interactively:
    ```bash
    vercel env add DATABASE_URL production
    ```
    or use `vercel env` subcommands to set values non-interactively per Vercel docs.

- Render (via web UI):
  1. Open your service on Render → Environment → Environment Variables.
  2. Add `DATABASE_URL` and save.

- Render (render CLI):
  - Use Render dashboard import of `render.yaml` then add envs in the service settings, or use the Render API/CLI to set env vars.

- GitHub Actions (if using Actions to deploy):
  1. In GitHub repo → Settings → Secrets and variables → Actions → New repository secret.
  2. Add `DATABASE_URL` as a secret. In workflows reference it as `${{ secrets.DATABASE_URL }}`.

Local development
- Copy `.env.example` to `.env` and populate `DATABASE_URL` for local runs. Keep `.env` out of source control.


Render (backend)
- Connect Render to this GitHub repository.
- Import the `render.yaml` from the repo when creating services, or create services manually using the settings in `render.yaml`.
- Each Render service uses a buildCommand and startCommand that runs the service-specific build and start steps from its directory (e.g. `cd services/identity && npm ci && npm run build`).
- Add required environment variables on Render for each service (e.g., `DATABASE_URL`, auth tokens, any `NEXT_PUBLIC_*` vars used by the frontend).

Notes
- The monorepo uses npm workspaces (`packageManager` set to `npm@9.8.0`). If you prefer `pnpm`, create and commit `pnpm-lock.yaml` and adjust the CI commands accordingly.
- If you want Render to build with Docker instead, add a `Dockerfile` under the service folder and set `env: docker` in `render.yaml`.
