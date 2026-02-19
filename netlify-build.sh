#!/bin/bash
set -e

echo "Starting custom Netlify build script..."

# Ensure we are at the repository root. The script may be executed from either
# - the repo root (Netlify) or
# - the apps/web directory (local runs that invoke the script from there).
# Only change directory when necessary.
if [ -f "netlify.toml" ] || [ -d "apps" ]; then
  # already at repo root
  echo "Detected repo root: $(pwd)"
else
  # walk up a few levels to find repo root
  CUR="$(pwd)"
  FOUND=""
  for i in 1 2 3 4; do
    PARENT="$(cd "$(dirname "$CUR")" && pwd)"
    if [ -f "$PARENT/netlify.toml" ] || [ -d "$PARENT/apps" ]; then
      FOUND="$PARENT"
      break
    fi
    CUR="$PARENT"
  done
  if [ -n "$FOUND" ]; then
    echo "Changing to repo root: $FOUND"
    cd "$FOUND"
  else
    echo "Warning: repo root not found, continuing from $(pwd)"
  fi
fi

# Use Corepack to ensure the correct Yarn is activated, and allow lockfile updates
corepack enable
# corepack prepare yarn@stable --activate  # Already active

# Ensure Yarn allows lockfile updates in CI environments that enforce immutability
export YARN_ENABLE_IMMUTABLE_INSTALLS=false

# Persist a build log into the frontend publish directory so Netlify deploys include it
# (helps debugging when API logs are not available). Tee both stdout and stderr.
LOG_DIR="apps/web/.next"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/netlify-build-script.log"
# exec > >(tee -a "$LOG_FILE") 2>&1  # Temporarily disabled to show output in build log

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

# Skip Prisma generate in postinstall to avoid issues during install
export PRISMA_GENERATE_SKIP_POSTINSTALL=true
export YARN_ENABLE_SCRIPTS=false

# Build identity service and generate Prisma client using yarn workspace (never expect local node_modules)
echo "Building identity service and generating Prisma client using yarn workspace..."
yarn workspace @amoravibe/identity-service run prisma:generate

yarn workspace @amoravibe/identity-service run build

# Build moderation service and generate Prisma client using yarn workspace
echo "Building moderation service and generating Prisma client using yarn workspace..."
yarn workspace @lovedate/moderation-service run prisma:generate
yarn workspace @lovedate/moderation-service run build

# Build profile service and generate Prisma client using yarn workspace
echo "Building profile service and generating Prisma client using yarn workspace..."
yarn workspace @lovedate/profile-service run prisma:generate
yarn workspace @lovedate/profile-service run build

# Build API package using yarn workspace
echo "Building API package using yarn workspace..."
yarn workspace @lovedate/api run build

# Build web app
yarn build

echo "Build completed successfully"