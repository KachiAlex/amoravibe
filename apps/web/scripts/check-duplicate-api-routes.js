const fs = require('fs').promises;
const path = require('path');

const ROOT = path.resolve(__dirname, '..'); // apps/web
const PAGES_API = path.join(ROOT, 'src', 'pages', 'api');
const APP_API = path.join(ROOT, 'src', 'app', 'api');
const PAGE_EXTS = ['.js', '.ts', '.jsx', '.tsx', '.mjs', '.cjs', '.json'];

async function walk(dir) {
  const entries = [];
  try {
    const items = await fs.readdir(dir, { withFileTypes: true });
    for (const it of items) {
      const full = path.join(dir, it.name);
      if (it.isDirectory()) {
        entries.push(...(await walk(full)));
      } else {
        entries.push(full);
      }
    }
  } catch (err) {
    return [];
  }
  return entries;
}

function normalizePagesRoute(file) {
  const rel = path.relative(PAGES_API, file).replace(/\\/g, '/');
  const ext = path.extname(rel);
  if (!PAGE_EXTS.includes(ext)) return null;
  let withoutExt = rel.slice(0, -ext.length);
  const parts = withoutExt.split('/').filter(Boolean);
  // drop trailing 'index'
  if (parts[parts.length - 1] === 'index') parts.pop();
  const route = '/api' + (parts.length ? '/' + parts.join('/') : '');
  return route;
}

function normalizeAppRoute(routeFile) {
  const rel = path.relative(APP_API, routeFile).replace(/\\/g, '/');
  const ext = path.extname(rel);
  const base = path.basename(rel, ext);
  // route files must be named `route.*`
  if (!base.startsWith('route')) return null;
  const dir = path.dirname(rel);
  const parts = dir === '.' ? [] : dir.split('/').filter(Boolean);
  const route = '/api' + (parts.length ? '/' + parts.join('/') : '');
  return route;
}

(async function main() {
  const pagesFiles = await walk(PAGES_API);
  const appFiles = await walk(APP_API);

  const pagesRoutes = new Map();
  for (const f of pagesFiles) {
    const r = normalizePagesRoute(f);
    if (!r) continue;
    pagesRoutes.set(r, (pagesRoutes.get(r) || []).concat(path.relative(PAGES_API, f)));
  }

  const appRoutes = new Map();
  for (const f of appFiles) {
    const r = normalizeAppRoute(f);
    if (!r) continue;
    appRoutes.set(r, (appRoutes.get(r) || []).concat(path.relative(APP_API, f)));
  }

  const duplicates = [];
  for (const r of pagesRoutes.keys()) {
    if (appRoutes.has(r)) duplicates.push(r);
  }

  if (duplicates.length === 0) {
    console.log('✅ No duplicate API routes found between src/pages/api and src/app/api');
    process.exit(0);
  }

  console.error('⚠️ Duplicate API routes detected (pages vs app):');
  for (const route of duplicates) {
    console.error('\n  ' + route);
    console.error('    pages: ' + (pagesRoutes.get(route) || []).slice(0, 5).join(', '));
    console.error('    app:   ' + (appRoutes.get(route) || []).slice(0, 5).join(', '));
  }

  console.error('\nFix by removing or renaming one of the implementations (prefer a single canonical router).');
  process.exit(1);
})();