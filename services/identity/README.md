# Identity service (minimal scaffold)

This folder contains a lightweight identity service scaffold used by Netlify preview/CI.

- `netlify/functions/*` - Netlify Functions (trust-center handler used in previews)
- `prisma/schema.prisma` - Prisma schema for local dev/preview
- `scripts/seed-identity.js` - seeds `user_2` for E2E/preview

Enable previews to run the seed by setting `ENABLE_TEST_SEEDS=1` in Netlify context.
