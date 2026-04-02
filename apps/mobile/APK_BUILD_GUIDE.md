# Amoravibe Android APK Build Guide

## Overview
This guide explains how to build the Amoravibe web app as a native Android APK with your app logo.

## System Components
- **Web App**: Next.js app in `apps/web/` running on web
- **Mobile Wrapper**: React Native app in `apps/mobile/` wraps the web app in WebView
- **Build System**: EAS (Expo Application Services) handles cloud compilation to APK
- **Icons**: Generated from `apps/web/public/amoravibe.jpg` (1024x1024px logo with heart + waves design)

## What Was Done
✅ Generated app icons in required sizes:
- `icon.png` (1024x1024) - Main app icon
- `adaptive-icon.png` (1080x1080) - Android adaptive icon
- `splash-icon.png` (1024x1024) - Splash screen
- `favicon.png` (192x192) - Web favicon

✅ Created EAS build configuration in `eas.json`:
- Production APK build profile
- Android-specific settings
- Cloud build pipeline

✅ Generated build script: `build-eas-apk.ps1`

## Prerequisites

### 1. Install EAS CLI (One-time setup)
```powershell
npm install -g eas-cli
```

### 2. Create Expo Account
- Go to https://expo.dev
- Sign up for a free account
- Note your username/email

### 3. Login to EAS
```powershell
cd apps/mobile
npx eas login
# Enter your Expo account credentials
```

### 4. Install Java (If building locally)
The cloud build handles Java/Android SDK, but for local testing:
```powershell
# Check if Java is installed
java -version
```

## Building the APK

### Quick Start (Recommended - Cloud Build)
```powershell
cd apps/mobile
.\build-eas-apk.ps1 -Profile production
```

This will:
1. Verify your EAS login
2. Check all icon files exist
3. Start a cloud build on Expo servers
4. Display build URL

### Alternative: Using eas-cli directly
```powershell
cd apps/mobile

# Production build (releases to users)
npx eas build --platform android --profile production

# Preview build (testing)
npx eas build --platform android --profile preview

# Wait for build to complete
npx eas build --platform android --profile production --wait
```

### Build Profiles in eas.json

**development**: For local testing with Expo Go
```json
{
  "developmentClient": true,
  "distribution": "internal",
  "android": { "buildType": "apk" }
}
```

**preview**: For QA testing before production
```json
{
  "distribution": "internal",
  "android": { "buildType": "apk" }
}
```

**production**: For app store and distribution
```json
{
  "distribution": "internal",
  "android": { "buildType": "apk" }
}
```

## Build Process Timeline

1. **Submission** (0-2 min): You run build script
2. **Queued** (0-10 min): Build queued on EAS servers
3. **Building** (10-15 min): APK compiled and packaged
4. **Ready** (5 min): Download link sent to email

Total time: **15-30 minutes** depending on queue

## Receiving Your APK

### Option 1: Email Link
- EAS sends download link to your Expo account email
- Link valid for 30 days
- Direct download to your computer

### Option 2: EAS Dashboard
```powershell
# Check build status
npx eas build --list

# View in web browser
https://expo.dev/builds
```

### Option 3: Build with --wait Flag
```powershell
cd apps/mobile
npx eas build --platform android --profile production --wait

# Stays running until build completes
# Downloads APK to dist/ directory automatically
```

## Installing on Android Device

### For Testing:
1. Get the APK file
2. Transfer to Android phone via USB or email
3. Open file manager on phone
4. Tap APK to install
5. Grant permissions
6. Launch app

### Using Android Debug Bridge (adb):
```powershell
# Connect phone via USB with debugging enabled
adb install amoravibe.apk
adb shell am start -n com.amoravibe.app/.MainActivity
```

### For Emulator:
```powershell
# Using Android Studio emulator
adb install amoravibe.apk

# Or drag APK into emulator window
```

## Icon System

All icons are automatically generated from the Amoravibe logo:

### Icon Locations
- `apps/mobile/assets/icon.png` - Primary app icon
- `apps/mobile/assets/adaptive-icon.png` - Android adaptive (Modern Android 8+)
- `apps/mobile/assets/splash-icon.png` - Launch screen
- `apps/mobile/assets/favicon.png` - Web version favicon

### Regenerating Icons
If you update the logo (`apps/web/public/amoravibe.jpg`), regenerate icons:

```powershell
cd apps/mobile
python generate-icons.py
```

This script:
1. Reads `apps/web/public/amoravibe.jpg`
2. Resizes to required sizes: 1024px, 1080px, 1024px, 192px
3. Converts to PNG format
4. Centers on white background
5. Saves to `assets/` directory

## Configuration

### App Manifest (app.json)
```json
{
  "expo": {
    "name": "Amoravibe",
    "slug": "mobile",
    "version": "1.0.0",
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.amoravibe.app"
    }
  }
}
```

### Build Configuration (eas.json)
```json
{
  "build": {
    "production": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    }
  }
}
```

## Troubleshooting

### Build Fails with "Android build error"
- Delete `android/` folder
- Run: `npx eas build --platform android --profile production`
- EAS will regenerate Android project

### Can't find APK after build
- Check EAS dashboard: https://expo.dev/builds
- Download from build details page
- Or run: `npx eas download --id BUILD_ID`

### Icon not showing in app
- Verify all icon files exist in `assets/`
- Check app.json paths are correct
- Icons should be PNG format, 1024x1024 minimum

### EAS authentication fails
```powershell
# Clear login cache
eas credentials
Remove-Item ~/.eas -Force -Recurse
npx eas login
```

## App Architecture

The Amoravibe mobile app uses a WebView wrapper:

```
┌─────────────────────────────┐
│  Android App Container       │
│  (React Native)              │
│  ┌───────────────────────┐   │
│  │  WebView              │   │
│  │  (Next.js Web App)    │   │
│  │  runs at localhost    │   │
│  └───────────────────────┘   │
└─────────────────────────────┘
```

This approach:
- ✅ Runs your existing Next.js web app
- ✅ No code changes required
- ✅ Shared icons/branding
- ✅ Native app store compliance
- ✅ One codebase, multiple platforms

## Next Steps

1. **Login to EAS**: `npx eas login`
2. **Build APK**: `.\build-eas-apk.ps1 -Profile production`
3. **Download**: Check email for download link
4. **Test**: Install on Android device/emulator
5. **Deploy**: Upload to Google Play Store (requires developer account)

## Support Resources

- **EAS Documentation**: https://docs.expo.dev/eas/
- **Expo Discord**: https://discord.gg/expo
- **Project**: https://github.com/KachiAlex/amoravibe

## Deployment Options

### Option 1: Internal Testing (Current)
- APK file for manual installation
- Good for QA and testing
- Users need APK file directly

### Option 2: Google Play Store
- Submit APK to Play Store
- Requires Google Play Developer account ($25 one-time)
- Users install from Play Store

### Option 3: Beta Testing (TestFlight-like)
- Use EAS Submit feature
- Automatically publish to TestFlight or Play Store
- Example: `eas submit --platform android`

---

**Status**: ✅ Ready to build APK
**Icons**: ✅ Generated from Amoravibe logo
**Configuration**: ✅ Production-ready
**Next**: Run `.\build-eas-apk.ps1` to start building!
