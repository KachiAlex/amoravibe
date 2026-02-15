#!/bin/bash
set -e

echo "Starting custom Netlify build script..."

# Use Corepack to ensure the correct Yarn is activated, and allow lockfile updates
corepack enable
corepack prepare yarn@stable --activate

# Install root dependencies with Yarn (allow updates when Netlify's environment requires it)
yarn install --mode=update

# Build identity service first (with Prisma generation)
cd services/identity
yarn install --mode=update
yarn prisma:generate
yarn build
cd -

# Build web app
yarn build

echo "Build completed successfully"