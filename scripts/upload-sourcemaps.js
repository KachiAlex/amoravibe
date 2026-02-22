#!/usr/bin/env node

// simple helper to run sentry-cli in project root with correct release version
const { execSync } = require('child_process');
const path = require('path');
const pkgPath = path.join(__dirname, '..', 'apps', 'web', 'package.json');
const pkg = require(pkgPath);

const release = pkg.version || 'unknown';
console.log(`Uploading source maps for release ${release}`);

try {
  execSync(`npx sentry-cli releases new ${release}`, { stdio: 'inherit' });
  execSync(`npx sentry-cli releases files ${release} upload-sourcemaps apps/web/.next --rewrite`, { stdio: 'inherit' });
  console.log('Source maps uploaded');
} catch (err) {
  console.error('Sentry upload failed', err);
  process.exit(1);
}
