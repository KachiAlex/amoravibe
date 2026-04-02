#!/usr/bin/env pwsh
<#
.SYNOPSIS
Build Amoravibe Android APK using EAS (Expo Application Services)

.DESCRIPTION
This script builds a production-ready APK for Android with the Amoravibe logo as app icon and favicon.
Prerequisites:
- EAS CLI installed globally (npm install -g eas-cli)
- Expo account created at https://expo.dev
- Logged into EAS account (eas login)

.PARAMETER Profile
Build profile to use. Options: development, preview, production
Default: production

.PARAMETER Watch
Display real-time build logs

.EXAMPLE
./build-eas-apk.ps1 -Profile production
./build-eas-apk.ps1 -Profile preview -Watch

#>

param(
    [ValidateSet('development', 'preview', 'production')]
    [string]$Profile = 'production',
    
    [switch]$Watch
)

$ErrorActionPreference = "Stop"

# Colors
$Blue = "`e[34m"
$Green = "`e[32m"
$Yellow = "`e[33m"
$Red = "`e[31m"
$NC = "`e[0m"

Write-Host "${Blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
Write-Host "${Blue}🚀 Amoravibe Android APK Build (EAS Cloud Build)${NC}"
Write-Host "${Blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}`n"

# Check if in mobile directory
if (-not (Test-Path "eas.json")) {
    Write-Host "${Red}❌ eas.json not found. Please run this script from apps/mobile directory.${NC}"
    exit 1
}

# Check EAS login status
Write-Host "${Blue}🔐 Checking EAS authentication...${NC}"
$loginStatus = npx eas whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "${Yellow}⚠️  Not logged into EAS. Initiating login...${NC}`n"
    npx eas login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "${Red}❌ Failed to authenticate with EAS${NC}"
        exit 1
    }
}
else {
    Write-Host "${Green}✅ Authenticated as: $loginStatus${NC}`n"
}

# Verify app configuration
Write-Host "${Blue}📋 Verifying app configuration...${NC}"
$appJson = Get-Content app.json | ConvertFrom-Json
$appName = $appJson.expo.name
$appSlug = $appJson.expo.slug
$appVersion = $appJson.expo.version
$androidPackage = $appJson.expo.android.package

Write-Host "App Name:      $appName"
Write-Host "App Slug:      $appSlug"
Write-Host "App Version:   $appVersion"
Write-Host "Android Package: $androidPackage"
Write-Host "Build Profile: ${Yellow}$Profile${NC}`n"

# Verify icon files exist
Write-Host "${Blue}🎨 Verifying icon assets...${NC}"
$icons = @(
    "assets/icon.png",
    "assets/adaptive-icon.png",
    "assets/splash-icon.png",
    "assets/favicon.png"
)

$allIconsExist = $true
foreach ($icon in $icons) {
    if (Test-Path $icon) {
        Write-Host "✅ $icon"
    }
    else {
        Write-Host "${Red}❌ $icon${NC} (Missing!)"
        $allIconsExist = $false
    }
}

if (-not $allIconsExist) {
    Write-Host "`n${Red}Some icon files are missing. Run 'python generate-icons.py' first.${NC}"
    exit 1
}
Write-Host ""

# Start the build
Write-Host "${Blue}🔨 Starting EAS Android APK build...${NC}"
Write-Host "Build will be created on Expo cloud servers."
Write-Host "This may take 5-15 minutes depending on queue.`n"

$buildArgs = @(
    "--platform", "android",
    "--profile", $Profile
)

if ($Watch) {
    $buildArgs += "--wait"
}

Write-Host "${Green}▶ Running: eas build $($buildArgs -join ' ')${NC}`n"

# Execute build
npx eas build @buildArgs

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n${Red}❌ Build failed!${NC}"
    Write-Host "Check the build logs for details."
    exit 1
}

Write-Host "`n${Green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
Write-Host "${Green}✨ APK build initiated successfully!${NC}"
Write-Host "${Green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}`n"

Write-Host "📱 Your APK will be available at: ${Yellow}https://expo.dev/builds${NC}"
Write-Host "📧 Download link will be sent to your email`n"

Write-Host "${Blue}Next steps:${NC}"
Write-Host "1. Wait for build to complete (check email or https://expo.dev/builds)"
Write-Host "2. Download the APK file"
Write-Host "3. Transfer to Android device or use Android emulator"
Write-Host "4. Install with: adb install amoravibe.apk`n"

Write-Host "${Blue}💡 Pro tip:${NC} Run 'eas build --platform android --profile production --wait' to wait for build completion"
