const { spawnSync } = require('child_process');
const path = require('path');

const logo = path.resolve(__dirname, '..', 'public', 'images', 'logo.jpg');
const out = path.resolve(__dirname, '..', 'assets', 'icons');

console.log('Using logo:', logo);
console.log('Output dir:', out);

// Try pwa-asset-generator first
try {
  console.log('Attempting pwa-asset-generator...');
  const res = spawnSync('npx', ['pwa-asset-generator', logo, out, '--manifest', '--icon-only'], { stdio: 'inherit' });
  if (res.status === 0) {
    console.log('pwa-asset-generator finished successfully.');
    process.exit(0);
  }
  console.warn('pwa-asset-generator failed or not available, falling back to cordova-res.');
} catch (e) {
  console.warn('pwa-asset-generator attempt threw:', e && e.message);
}

// Fallback: cordova-res
try {
  console.log('Attempting cordova-res for Android icons...');
  const res2 = spawnSync('npx', ['cordova-res', 'android', '--skip-config', '--copy', '--resources', logo], { stdio: 'inherit' });
  if (res2.status === 0) {
    console.log('cordova-res finished successfully.');
    process.exit(0);
  }
  console.warn('cordova-res failed or not available.');
} catch (e) {
  console.warn('cordova-res attempt threw:', e && e.message);
}

console.error('Icon generation failed. Please install either `pwa-asset-generator` or `cordova-res` and re-run `npm run generate:icons`.');
process.exit(1);
