import { mkdir, readdir, stat, cp } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = join(__dirname, '..');
const siteDir = join(projectRoot, 'site');
const distDir = join(projectRoot, 'dist');

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!(await exists(siteDir))) {
    console.warn('[copy-site] site directory not found, skipping');
    return;
  }

  if (!(await exists(distDir))) {
    await mkdir(distDir, { recursive: true });
  }

  await cp(siteDir, distDir, { recursive: true });
  const files = await readdir(siteDir);
  const manifest = files.map((file) => relative(siteDir, join(siteDir, file)));
  console.log(`[copy-site] copied ${manifest.length} asset(s) to dist/`);
}

main().catch((error) => {
  console.error('[copy-site] failed to copy site assets', error);
  process.exitCode = 1;
});
