FROM node:20-bullseye-slim

WORKDIR /workspace

# Use Corepack to manage Yarn
RUN corepack enable && corepack prepare yarn@stable --activate

# Copy only minimal files to reduce Docker build context size
# Root package files and yarn config
COPY package.json yarn.lock .yarnrc.yml ./

# Copy workspace packages required for e2e: web app, e2e tests, UI and API packages, identity service
COPY apps/web/package.json apps/web/
COPY apps/web/e2e apps/web/e2e
COPY apps/web .
COPY packages/ui packages/ui
COPY packages/api packages/api
COPY services/identity services/identity

# Ensure nodeLinker matches repo
RUN echo "nodeLinker: node-modules" > .yarnrc.yml || true

# Some local file: dependencies may resolve to /packages/* during install,
# create a symlink so those absolute paths exist inside the container.
RUN ln -s /workspace/packages /packages || true
# Install dependencies (will only use copied workspace files)
RUN yarn install --network-timeout 100000

# Install Playwright browsers
RUN npx playwright install --with-deps

# Default: run the Playwright test
CMD ["yarn", "playwright", "test", "e2e/onboarding-dashboard.spec.ts", "--project=chromium", "--reporter=dot"]
