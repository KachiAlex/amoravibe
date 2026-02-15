#!/bin/bash
set -e

echo "Starting custom Netlify build script..."

# Use Corepack to ensure the correct Yarn is activated, and allow lockfile updates
corepack enable
corepack prepare yarn@stable --activate

# Ensure Yarn allows lockfile updates in CI environments that enforce immutability
export YARN_ENABLE_IMMUTABLE_INSTALLS=false

# Choose the correct Yarn install mode depending on Yarn major version.
# Yarn v4+ accepts `--mode=update-lockfile`; older Yarn used `--mode=update`.
YARN_VERSION="$(yarn -v 2>/dev/null || true)"
YARN_MAJOR="$(echo "$YARN_VERSION" | awk -F. '{print $1}')"
if [ -n "$YARN_MAJOR" ] && [ "$YARN_MAJOR" -ge 4 ] 2>/dev/null; then
	INSTALL_MODE="--mode=update-lockfile"
elif [ -n "$YARN_MAJOR" ]; then
	INSTALL_MODE="--mode=update"
else
	INSTALL_MODE=""
fi

# Install root dependencies with the chosen mode (empty mode is allowed)
yarn install $INSTALL_MODE

# Build identity service first (with Prisma generation)
cd services/identity
yarn install $INSTALL_MODE
yarn prisma:generate
yarn build
cd -

# Build web app
yarn build

echo "Build completed successfully"