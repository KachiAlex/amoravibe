# Build Android APK (Capacitor)

This document describes how to build an Android APK from the web app using Capacitor.

Prerequisites
- Node.js (18+)
- Java JDK (17+)
- Android SDK + Android Studio (or `sdkmanager` + `adb`)
- `npx` available

High-level steps
1. Build static web assets:

```bash
cd apps/web
npm install
npm run build:web   # runs `next build && next export -o out`
```

2. Initialize Capacitor (only first time):

```bash
cd apps/web
npm run cap:init
# or:
# npx cap init AmoraVibe com.amoravibe.app --web-dir=out
```

3. Add Android platform and sync assets:

```bash
npm run cap:add:android
npx cap copy android
npx cap sync android
```

4. Open Android Studio and build the APK (recommended):

```bash
npm run cap:open:android
# then in Android Studio: Build > Build Bundle(s) / APK(s) > Build APK(s)
```

Notes on icons
- This repo uses `/public/images/logo.jpg` as the web `favicon` and as icons in `manifest.webmanifest`.
- For a proper Android adaptive icon, generate `mipmap-*` resources (foreground/background PNGs) and place them under `android/app/src/main/res/mipmap-*/` inside the Capacitor Android project.
- You can generate icons with tools like `pwa-asset-generator` or `cordova-res`.
- To automate icon generation from the repo logo, run:

```bash
cd apps/web
npm install
npm run generate:icons

# this will try `pwa-asset-generator` first and fall back to `cordova-res`.
```

After generation, run `npm run cap:copy` to copy the web `out/` plus generated icons into the Android project.
Then apply the generated icons into the Android project's `res/` folders:

```bash
cd apps/web
npm run cap:copy
npm run cap:apply:icons
npx cap sync android
```

`cap:apply:icons` will attempt to copy images from `apps/web/assets/icons` into `android/app/src/main/res/mipmap-*`.

Automated scripts (already added to `apps/web/package.json`)
- `npm run build:web` — builds and exports static site to `out/`
- `npm run cap:init` — initialize Capacitor (one-time)
- `npm run cap:add:android` — adds Android platform
- `npm run cap:open:android` — opens Android project in Android Studio

Common problems
- If `npx cap` fails, ensure `@capacitor/cli` is installed (`npm i -D @capacitor/cli @capacitor/core`).
- Generating icons: use `npx pwa-asset-generator public/images/logo.jpg ./out/manifest.webmanifest --icon-only` or `cordova-res android --skip-config --copy` and then copy resources into `android` project.

If you want, I can:
- Generate an icons checklist and add scripts to produce Android mipmap assets (requires installing `pwa-asset-generator` or `sharp`).
- Attempt to run these steps here — note: building Android APK requires Android SDK which is not available in this environment, so I can scaffold everything and produce commands for you to run locally.
