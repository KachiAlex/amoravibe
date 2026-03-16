#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 Building Amoravibe Android APK with Docker...${NC}\n"

# Get absolute paths
WORKSPACE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MOBILE_DIR="$WORKSPACE_DIR/apps/mobile"
OUTPUT_DIR="$MOBILE_DIR/dist"

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo -e "${BLUE}📦 Building Docker image...${NC}"
docker build -f "$MOBILE_DIR/Dockerfile.android" -t amoravibe-android-builder "$MOBILE_DIR" 2>&1 | tail -20

echo -e "\n${BLUE}⚙️  Building APK inside Docker...${NC}"
docker run --rm \
  -v "$MOBILE_DIR:/workspace/apps/mobile" \
  -v "$WORKSPACE_DIR/apps/mobile/dist:/output" \
  -e ANDROID_HOME=/opt/android-sdk \
  amoravibe-android-builder \
  bash -c "
    cd /workspace/apps/mobile && \
    npm install && \
    npx expo build:android --release-channel preview --output-dir /output
  "

echo -e "\n${GREEN}✅ APK build complete!${NC}"
echo -e "${GREEN}📱 APK location: $OUTPUT_DIR${NC}"
ls -lh "$OUTPUT_DIR/"*.apk 2>/dev/null || echo "Looking for APK..."

echo -e "\n${BLUE}✨ Done! Your Android APK is ready.${NC}"
