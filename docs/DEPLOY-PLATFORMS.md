# Deployment guide: Firebase Hosting (frontend) + Render (backend)

Overview
- Frontend: `apps/web` is deployed to Firebase Hosting using its built-in Next.js runtime.
- Backend: backend services (example: `services/identity`, `services/profile`) continue to deploy to Render (or Vercel/other) as defined in `render.yaml` / service configs.

Firebase Hosting (frontend)
- Connect Firebase Hosting to this repository or deploy via the `firebase deploy` CLI. The repo includes `.github/workflows/deploy-firebase.yml` to deploy on pushes to `main`/`master`.
- Required GitHub secrets:
  - `FIREBASE_SERVICE_ACCOUNT` — JSON credentials (Hosting Admin role)
  - `FIREBASE_PROJECT_ID` — project id passed to the deploy command
- Configure `.firebaserc` + `firebase.json` with your project + site IDs. `firebase.json` already targets `apps/web`.
- The frontend proxies API traffic to `https://api-amoravibe.vercel.app` by default; override via Firebase env vars if needed (see `DEPLOY.md`).

Environment variables
- Do NOT commit real secrets to the repository. Use the platform secrets / env var features.
- Required variables (examples):
  - `DATABASE_URL` — Postgres connection string for Prisma. Example (DO NOT COMMIT):
    `postgresql://<user>:<pass>@<host>:5432/<db>?sslmode=require`

How to set `DATABASE_URL`:

- Firebase Hosting / Functions:
  - Use `firebase functions:secrets:set <NAME>` or Firebase console → Build → Functions → Environment variables.
  - For Hosting-only env (Next.js runtime), use Firebase console → Hosting → Environment variables.

- Render (via web UI):
  1. Open your service on Render → Environment → Environment Variables.
  2. Add `DATABASE_URL` and save.

- Render (render CLI):
  - Use Render dashboard import of `render.yaml` then add envs in the service settings, or use the Render API/CLI to set env vars.

- GitHub Actions (for Firebase deploy):
  1. Add `FIREBASE_SERVICE_ACCOUNT` + `FIREBASE_PROJECT_ID` secrets.
  2. Optional: add `DATABASE_URL`, `TRUST_API_PROXY_TARGET`, etc. for backend services or emulator use.

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
