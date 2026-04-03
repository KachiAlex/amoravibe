const fs = require('fs');
const path = require('path');

function exists(p) { return fs.existsSync(path.resolve(__dirname, '..', p)); }

const checks = [
  { path: 'out', desc: 'Exported web assets (out/)' },
  { path: 'assets/icons', desc: 'Generated icon assets (apps/web/assets/icons)' },
  { path: 'android/app/src/main/res', desc: 'Android res folder' },
  { path: 'android/app/build/outputs/apk/debug/app-debug.apk', desc: 'Debug APK' }
];

let ok = true;
for (const c of checks) {
  const full = path.resolve(__dirname, '..', c.path);
  const e = fs.existsSync(full);
  console.log(`${e ? '✓' : '✗'} ${c.desc} -> ${c.path}`);
  if (!e) ok = false;
}

if (!ok) {
  console.error('\nSome items are missing. Follow BUILD_ANDROID.md steps or inspect the paths above.');
  process.exit(2);
}

console.log('\nAll checks passed. APK and resources appear present.');
process.exit(0);
