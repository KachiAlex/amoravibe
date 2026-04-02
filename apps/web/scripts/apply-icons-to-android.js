const fs = require('fs');
const path = require('path');

function findFileBySize(dir, size) {
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir);
  const sizeStr = String(size);
  for (const f of files) {
    const lower = f.toLowerCase();
    if (lower.endsWith('.png') && (lower.includes(sizeStr + 'x' ) || lower.includes(sizeStr + '.png') || lower.includes(sizeStr))) {
      return path.join(dir, f);
    }
  }
  return null;
}

function copyIfExists(src, dest) {
  if (!src) return false;
  try {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    return true;
  } catch (e) {
    return false;
  }
}

const repoRoot = path.resolve(__dirname, '..');
const assetsDir = path.join(repoRoot, 'assets', 'icons');
const androidRes = path.join(repoRoot, 'android', 'app', 'src', 'main', 'res');

console.log('Assets dir:', assetsDir);
console.log('Android res dir:', androidRes);

if (!fs.existsSync(assetsDir)) {
  console.error('Icon assets folder not found. Run `npm run generate:icons` first.');
  process.exit(1);
}
if (!fs.existsSync(androidRes)) {
  console.error('Android project not found. Run Capacitor add android first (npm run cap:add:android).');
  process.exit(1);
}

const densityMap = {
  mdpi: 48,
  hdpi: 72,
  xhdpi: 96,
  xxhdpi: 144,
  xxxhdpi: 192
};

let copied = 0;
for (const [density, size] of Object.entries(densityMap)) {
  const src = findFileBySize(assetsDir, size) || findFileBySize(assetsDir, Math.round(size * 1.5)) || findFileBySize(assetsDir, Math.round(size / 2));
  const destDir = path.join(androidRes, `mipmap-${density}`);
  const dest = path.join(destDir, 'ic_launcher.png');
  if (src && copyIfExists(src, dest)) {
    console.log(`Copied ${path.basename(src)} -> ${path.relative(repoRoot, dest)}`);
    copied++;
  } else {
    console.warn(`No matching icon found for ${density} (expected ~${size}px).`);
  }
}

// Any available 512/foreground files -> copy to mipmap-anydpi-v26
const anydpiDir = path.join(androidRes, 'mipmap-anydpi-v26');
const anySrc = findFileBySize(assetsDir, 512) || findFileBySize(assetsDir, 432) || findFileBySize(assetsDir, 360);
if (anySrc) {
  const dest = path.join(anydpiDir, 'ic_launcher.png');
  if (copyIfExists(anySrc, dest)) {
    console.log(`Copied adaptive icon ${path.basename(anySrc)} -> ${path.relative(repoRoot, dest)}`);
    copied++;
  }
}

// Adaptive icon: look for explicit foreground/background images and copy them
const fgCandidates = ['ic_launcher_foreground.png', 'foreground.png', 'ic_foreground.png'];
const bgCandidates = ['ic_launcher_background.png', 'background.png', 'ic_background.png'];
let fgFound = null;
let bgFound = null;
for (const f of fs.readdirSync(assetsDir)) {
  const lower = f.toLowerCase();
  if (!fgFound && fgCandidates.some(c => lower.includes(c))) fgFound = path.join(assetsDir, f);
  if (!bgFound && bgCandidates.some(c => lower.includes(c))) bgFound = path.join(assetsDir, f);
}

// Also accept names containing 'foreground' or 'background'
if (!fgFound) {
  const match = fs.readdirSync(assetsDir).find(x => x.toLowerCase().includes('foreground'));
  if (match) fgFound = path.join(assetsDir, match);
}
if (!bgFound) {
  const match = fs.readdirSync(assetsDir).find(x => x.toLowerCase().includes('background'));
  if (match) bgFound = path.join(assetsDir, match);
}

if (fgFound) {
  const dest = path.join(anydpiDir, 'ic_launcher_foreground.png');
  if (copyIfExists(fgFound, dest)) {
    console.log(`Copied foreground ${path.basename(fgFound)} -> ${path.relative(repoRoot, dest)}`);
    copied++;
  }
}
if (bgFound) {
  const dest = path.join(anydpiDir, 'ic_launcher_background.png');
  if (copyIfExists(bgFound, dest)) {
    console.log(`Copied background ${path.basename(bgFound)} -> ${path.relative(repoRoot, dest)}`);
    copied++;
  }
}

if (copied === 0) {
  console.error('No icons were copied. Inspect the assets folder and generated filenames.');
  process.exit(2);
}

console.log(`Done. ${copied} files copied. Now run 'npx cap sync android' or open Android Studio to verify.`);
process.exit(0);


