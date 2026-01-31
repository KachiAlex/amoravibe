Deployment commands

Prerequisites:

- `VERCEL_TOKEN` environment variable set (personal token)
- `vercel` CLI installed and logged in optionally

Frontend (web):

```bash
# from repo root
npm run deploy:web
```

Backend (identity):

```bash
npm run deploy:identity
```

Deploy both:

```bash
npm run deploy:all
```

Notes:

- Each `--cwd` invocation uses the local `.vercel` project config inside that directory when present.
- If you prefer explicit project ids, you can add `--project <projectId>` to the commands.
- Use `--confirm` to skip interactive prompts in CI.
