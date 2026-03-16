# Amoravibe Android APK Build Script (Docker)
# Usage: ./build-android.ps1

param(
    [switch]$NoCache
)

$ErrorActionPreference = "Stop"

# Colors
$Blue = "`e[34m"
$Green = "`e[32m"
$Red = "`e[31m"
$NC = "`e[0m"

Write-Host "${Blue}🐳 Building Amoravibe Android APK with Docker...${NC}`n"

# Get workspace paths
$MobileDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$WorkspaceDir = Split-Path -Parent (Split-Path -Parent $MobileDir)
$OutputDir = Join-Path $MobileDir "dist"

# Create output directory
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

Write-Host "${Blue}📦 Building Docker image...${NC}"
$BuildArgs = @(
    "-f", "$MobileDir\Dockerfile.android",
    "-t", "amoravibe-android-builder",
    $MobileDir
)

if ($NoCache) {
    $BuildArgs += "--no-cache"
}

docker build @BuildArgs
if ($LASTEXITCODE -ne 0) {
    Write-Host "${Red}❌ Docker build failed!${NC}"
    exit 1
}

Write-Host "`n${Blue}⚙️  Building APK inside Docker...${NC}"
Write-Host "This may take 10-15 minutes...`n"

# Run Docker build
docker run --rm `
    -v "$($MobileDir):/workspace/apps/mobile" `
    -v "$($OutputDir):/output" `
    -e ANDROID_HOME=/opt/android-sdk `
    amoravibe-android-builder `
    bash -c @"
        set -e
        cd /workspace/apps/mobile
        echo 'Installing dependencies...'
        npm install
        echo 'Building Android APK...'
        npx expo build-android --release-channel preview --output /output
        echo 'APK build complete!'
        ls -lh /output/*.apk
"@

if ($LASTEXITCODE -ne 0) {
    Write-Host "${Red}❌ APK build failed!${NC}"
    exit 1
}

Write-Host "`n${Green}✅ APK build complete!${NC}"
$Apks = Get-ChildItem -Path $OutputDir -Filter "*.apk" -ErrorAction SilentlyContinue
if ($Apks) {
    Write-Host "${Green}📱 APK location:${NC}"
    foreach ($Apk in $Apks) {
        Write-Host "   $($Apk.FullName) ($($Apk.Length / 1MB)MB)"
    }
} else {
    Write-Host "${Red}⚠️  No APK found in output directory${NC}"
}

Write-Host "`n${Green}✨ Done! Your Android APK is ready to install.${NC}"
Write-Host "${Blue}Next steps:${NC}"
Write-Host "1. Transfer APK to Android device"
Write-Host "2. Go to Settings > Security > Install from Unknown Sources"
Write-Host "3. Open APK file and tap Install"
