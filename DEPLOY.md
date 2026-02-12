Deployment commands

Prerequisites:

- `VERCEL_TOKEN` environment variable set (personal token) for legacy Vercel deploys
- `vercel` CLI installed and logged in optionally
- `firebase-tools` installed (repo devDependency) and `firebase login` completed
- `.firebaserc` and `firebase.json` updated with your project + site ids

Frontend (web) - Firebase Hosting:

```bash
# from repo root – ensure .firebaserc + firebase.json contain your project + site
pnpm install  # installs firebase-tools if not present
pnpm deploy:web:firebase
```

The Firebase config in `firebase.json` uses framework detection to build and host the `apps/web` Next.js app. Adjust the `site` field to your Hosting Site ID (find/create in the Firebase console). Use `firebase target:apply hosting <alias> <siteId>` if you prefer aliases.

By default, all Next.js API routes and server components running on Firebase Hosting proxy to the Vercel backend at `https://api-amoravibe.vercel.app`. Override this by setting `TRUST_API_PROXY_TARGET` (server-only) or `NEXT_PUBLIC_TRUST_API_URL` (client/server) in Firebase if you need a different upstream (e.g., staging).

Legacy Vercel deployment:

```bash
# from repo root
npm run deploy:web
```

CI automation (Firebase Hosting):

- Workflow: `.github/workflows/deploy-firebase.yml`
- Triggers: push to `main`/`master` or manual dispatch
- Required GitHub secrets:
  - `FIREBASE_SERVICE_ACCOUNT` – JSON credentials for a service account with Firebase Hosting Admin
  - `FIREBASE_PROJECT_ID` – project id passed to the deploy command
- Optional: keep `VERCEL_*` / `NETLIFY_*` secrets if those paths remain in use

Backend (identity):

```bash
npm run deploy:identity
```

Deploy both:

```bash
npm run deploy:web
```

Notes:

- Each `--cwd` invocation uses the local `.vercel` project config inside that directory when present.
- If you prefer explicit project ids, you can add `--project <projectId>` to the commands.
- Use `--confirm` to skip interactive prompts in CI.
