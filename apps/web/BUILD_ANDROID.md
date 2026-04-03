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

CI build (GitHub Actions)
-------------------------
This repo includes a workflow to build an unsigned debug APK in GitHub Actions and upload it as an artifact:

- Path: `.github/workflows/android-build.yml`
- Trigger: manual (`workflow_dispatch`) or push to `master`.

Secrets (optional, for signing):
- `ANDROID_KEYSTORE` — base64-encoded keystore file
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

CI play upload secret:
- `PLAY_SERVICE_ACCOUNT_JSON` — base64-encoded Google Play service account JSON. The workflow uses this to authenticate and upload to the `internal` track.

CI Upload to Google Play (optional)
- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` — the raw JSON contents of a Google Play service account key (add as a repository secret). The workflow will use this secret to upload the built APK to the `internal` track.

To create the service account JSON:
1. Go to Google Play Console -> Setup -> API access.
2. Create a service account and grant the `Release Manager` role (or appropriate permission) for the app.
3. Generate a JSON key and add its contents as the `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` secret in GitHub (paste entire JSON content).

Play Store upload (optional):
- `PLAY_SERVICE_ACCOUNT_JSON` — JSON contents of a Google Play service account key (store as a GitHub secret). The workflow will upload the built APK to the `internal` track when this secret is present.

To create the service account JSON:
1. In Google Play Console, go to Settings -> API access and create a service account or link an existing one.
2. Grant the service account the `Release manager` role for the app.
3. Create and download a JSON key and add its full contents as the repository secret `PLAY_SERVICE_ACCOUNT_JSON`.

If you want the CI to also sign the APK, add those secrets in the repository settings. The workflow will decode the keystore and sign the APK using `apksigner` from the Android build-tools.

To run the workflow manually: go to Actions -> Build Android APK -> Run workflow.

Quick local verification
------------------------
After you run the local steps and build the APK, you can run a quick verification that checks for expected files:

```bash
cd apps/web
npm run verify:android
```

The script checks for `out/`, `assets/icons/`, Android `res/` folder, and the debug APK path. It helps validate that icons were applied and the APK was produced.

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

CI release & signing
- The GitHub Actions workflow can optionally sign the APK and attach it to a GitHub Release when the keystore secrets are present.
- Required secrets (set in repo Settings -> Secrets):
	- `ANDROID_KEYSTORE` (base64-encoded keystore file)
	- `ANDROID_KEYSTORE_PASSWORD`
	- `ANDROID_KEY_ALIAS`
	- `ANDROID_KEY_PASSWORD`

When those secrets exist, the workflow will:
1. build the debug APK
2. decode the keystore and sign the APK using `apksigner`
3. create a release `android-release-<run_id>` and attach the signed APK as `app-signed.apk`

If you'd prefer automatic Play Store upload, I can add a step to upload to Google Play using a service account JSON stored in secrets (requires `google-play-deploy` action and a service account with the correct permissions).
