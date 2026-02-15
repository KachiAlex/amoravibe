#!/bin/bash
set -e

echo "Starting custom Netlify build script..."

# Install root dependencies
npm install

# Build identity service first (with Prisma generation)
cd services/identity
npm install
npm run prisma:generate
npm run build
cd -

# Build web app
npm run build

echo "Build completed successfully"