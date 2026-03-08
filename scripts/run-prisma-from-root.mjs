#!/usr/bin/env node
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const prismaBinary = process.platform === 'win32' ? 'prisma.cmd' : 'prisma';
const prismaBinPath = path.resolve(repoRoot, 'node_modules', '.bin', prismaBinary);

const args = process.argv.slice(2);
if (args.length === 0) {
  args.push('generate');
}

const hasSchemaFlag = args.some((arg) => arg.startsWith('--schema'));
if (!hasSchemaFlag) {
  args.push('--schema=prisma/schema.prisma');
}

const child = spawn(prismaBinPath, args, {
  cwd: repoRoot,
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code, signal) => {
  if (signal) {
    console.error(`prisma process terminated with signal ${signal}`);
    process.exit(1);
  }
  process.exit(code ?? 1);
});

child.on('error', (error) => {
  console.error('Failed to run Prisma CLI from repo root:', error);
  process.exit(1);
});
