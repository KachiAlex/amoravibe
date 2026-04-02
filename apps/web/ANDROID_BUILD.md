Prerequisites

- Java JDK (11+)
- Android SDK + Android Studio (or CLI tools)
- Node.js >= 20
- npm or yarn

Steps to create an Android APK using Capacitor

1) Build the web app and export static output (if your app supports static export):

```bash
# from repo root
cd apps/web
npm install
npm run build:web
```

If your Next.js app uses server-side features and cannot be exported, instead deploy the web app to a hosted URL and configure Capacitor to load that URL (see step 3).

2) Initialize Capacitor (only needed once):

```bash
npm run cap:init
```

3) Add Android platform and open in Android Studio:

```bash
npm run cap:add:android
npm run cap:open:android
```

If you are using a hosted URL, edit `apps/web/capacitor.config.ts` and set:

```ts
const config = {
  server: { url: 'https://your-deployed-site.example', cleartext: false }
}
```

4) In Android Studio, build an APK or App Bundle. You need to have the Android SDK and signing keys configured there.

Notes

- This repo sets `webDir` to `out` by default to use `next export` output. If your app requires server runtime (API routes/SSR), point Capacitor to a hosted URL instead.
- Icons: the app uses `/images/logo.jpg` as the manifest icon. For production you should create properly sized `png` icons and update `public/manifest.webmanifest` and the Android project resources.

If you'd like, I can:
- generate proper PNG icon sizes from the source logo (requires an image tool), or
- scaffold the Android resources inside `android/app/src/main/res` referencing the logo (placeholders), or
- proceed to run `npm install` and `npm run build:web` here (this will succeed only if environment has required Node tooling). 
