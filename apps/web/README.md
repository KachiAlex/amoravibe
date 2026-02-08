# Web app (apps/web)

Local development and common commands for the `apps/web` Next.js application.

Prereqs
- Node 20.x (recommended)
- npm 11.x (repo uses npm workspaces)

Dev

```powershell
# from repo root
npm run dev --workspace=apps/web
# or from inside apps/web
npm run dev
```

Build

```powershell
npm run --workspace=apps/web build
```

Tests

```powershell
npm run --workspace=apps/web test || npx vitest -c ../../vitest.config.ts --run
```

Notes
- The monorepo uses npm workspaces; some cross-workspace packages are file: references.
- If CI fails with platform-specific packages, regenerate `package-lock.json` on a Linux runner using `npm install --package-lock-only --omit=optional` and push the lockfile.
This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
