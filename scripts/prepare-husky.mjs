#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const inCi = Boolean(process.env.CI && process.env.CI !== '0');
const huskyDisabled = ['0', 'false'].includes((process.env.HUSKY ?? '').toLowerCase());
const productionInstall = (process.env.npm_config_production ?? '').toLowerCase() === 'true';

if (inCi || huskyDisabled || productionInstall) {
  console.log('Skipping Husky install (CI/production environment detected).');
  process.exit(0);
}

const huskyBin = path.resolve(
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'husky.cmd' : 'husky'
);

if (!existsSync(huskyBin)) {
  console.warn('Husky binary not found. Skipping installation.');
  process.exit(0);
}

const result = spawnSync(huskyBin, ['install'], { stdio: 'inherit' });

if (result.error) {
  console.warn(`Husky install failed: ${result.error.message}`);
  process.exit(0);
}

process.exit(result.status ?? 0);
