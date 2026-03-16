@echo off
REM Amoravibe Android APK Build Script (Docker Desktop)
REM Simply run this file to build the Android APK

setlocal enabledelayedexpansion

echo.
echo [32m==============================================================[0m
echo [32m  Amoravibe Android APK Build (Docker Desktop)[0m
echo [32m==============================================================[0m
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo [31m❌ Docker is not installed or not in PATH[0m
    echo [33mPlease install Docker Desktop from https://www.docker.com/products/docker-desktop[0m
    pause
    exit /b 1
)

echo [36m✓ Docker found[0m
echo.

REM Get the directory of this script (without trailing slash)
for %%A in ("%~dp0.") do set "SCRIPT_DIR=%%~fA"
set OUTPUT_DIR=%SCRIPT_DIR%\dist

REM Create output directory
if not exist "%OUTPUT_DIR%" (
    mkdir "%OUTPUT_DIR%"
)

echo [34m📦 Step 1: Building Docker image (this takes 5-10 minutes on first run)...[0m
echo Starting Docker build from: %SCRIPT_DIR%

docker build -f "%SCRIPT_DIR%\Dockerfile.android" -t amoravibe-android-builder "%SCRIPT_DIR%"

if errorlevel 1 (
    echo [31m❌ Docker image build failed![0m
    pause
    exit /b 1
)

echo [32m✓ Docker image built successfully[0m
echo.

echo [34m⚙️  Step 2: Building Android APK (this takes 10-15 minutes)...[0m
echo [33mPlease wait, this may take a while...[0m
echo.

docker run --rm ^
    -v "%SCRIPT_DIR%":/workspace/apps/mobile ^
    -v "%OUTPUT_DIR%":/output ^
    -e ANDROID_HOME=/opt/android-sdk ^
    amoravibe-android-builder ^
    bash -c "cd /workspace/apps/mobile && npm install && npx expo build-android --release-channel preview --output /output 2>&1"

if errorlevel 1 (
    echo.
    echo [31m❌ APK build failed![0m
    pause
    exit /b 1
)

echo.
echo [32m✅ APK build complete![0m
echo.

dir "%OUTPUT_DIR%\*.apk" >nul 2>&1
if errorlevel 1 (
    echo [33m⚠️  No APK found in output directory[0m
) else (
    echo [32m📱 APK saved to: %OUTPUT_DIR%[0m
    echo.
    for %%f in ("%OUTPUT_DIR%\*.apk") do (
        echo     %%~nxf
    )
)

echo.
echo [32m✨ Next steps:[0m
echo [36m   1. Transfer APK to your Android device[0m
echo [36m   2. Go to Settings ^> Security ^> Install from Unknown Sources[0m
echo [36m   3. Open APK file and tap Install[0m
echo.
echo [32m==============================================================[0m
pause
