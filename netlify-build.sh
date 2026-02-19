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

# Build environment diagnostics (helpful when Netlify build fails)
echo "node: $(node -v)" || true
echo "yarn: $(yarn -v)" || true
corepack --version 2>/dev/null || true
echo "yarn workspaces info:" 
(yarn workspaces info 2>/dev/null || true)

# Ensure Yarn allows lockfile updates in CI environments that enforce immutability
export YARN_ENABLE_IMMUTABLE_INSTALLS=false

# Persist a build log into the frontend publish directory so Netlify deploys include it
# (helps debugging when API logs are not available). Tee both stdout and stderr.
LOG_DIR="apps/web/.next"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/netlify-build-script.log"
exec > >(tee -a "$LOG_FILE") 2>&1

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

# Helper to run a workspace command only when the workspace exists in the repo
run_workspace_if_present() {
  WS_NAME="$1"
  shift
  # `yarn workspaces info` lists all workspace names; grep for the exact key
  if yarn workspaces info 2>/dev/null | grep -q "\"${WS_NAME}\""; then
    echo "Running workspace ${WS_NAME} -> $*"
    yarn workspace "${WS_NAME}" run "$@"
  else
    echo "Skipping workspace ${WS_NAME}: not present in this repository"
  fi
}

# Build identity service (if present) and generate Prisma client using yarn workspace
echo "(workspace) identity-service"
run_workspace_if_present "@amoravibe/identity-service" prisma:generate
run_workspace_if_present "@amoravibe/identity-service" build

# Build moderation service (if present) and generate Prisma client using yarn workspace
echo "(workspace) moderation-service"
run_workspace_if_present "@lovedate/moderation-service" prisma:generate
run_workspace_if_present "@lovedate/moderation-service" build

# Build profile service (if present) and generate Prisma client using yarn workspace
echo "(workspace) profile-service"
run_workspace_if_present "@lovedate/profile-service" prisma:generate
run_workspace_if_present "@lovedate/profile-service" build

# Build API package using yarn workspace
# Only run if the workspace exists and provides a `build` script (some workspaces
# are stubs in this repo and don't need a build step).
echo "(workspace) @lovedate/api"
if [ -f "packages/api/package.json" ]; then
  HAS_BUILD_SCRIPT=$(node -e "try{console.log(Boolean(require('./packages/api/package.json').scripts && require('./packages/api/package.json').scripts.build))}catch(e){console.log(false)}")
  if [ "$HAS_BUILD_SCRIPT" = "true" ]; then
    echo "Running @lovedate/api build"
    yarn workspace @lovedate/api run build
  else
    echo "Skipping @lovedate/api build: no build script defined"
  fi
else
  echo "Skipping @lovedate/api: workspace not present"
fi

# Build web app
yarn build

echo "Build completed successfully"