#!/usr/bin/env node
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
if (args.length === 0) {
  args.push('generate');
}

const hasSchemaFlag = args.some((arg) => arg.startsWith('--schema'));
if (!hasSchemaFlag) {
  args.push('--schema=prisma/schema.prisma');
}

// Use npx to run prisma which handles Windows better
const result = spawnSync('npx', ['prisma', ...args], {
  cwd: repoRoot,
  stdio: 'inherit',
  env: process.env,
  shell: true,
});

if (result.signal) {
  console.error(`prisma process terminated with signal ${result.signal}`);
  process.exit(1);
}
process.exit(result.status ?? 1);
