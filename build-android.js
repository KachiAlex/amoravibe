#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Change to mobile app directory
process.chdir(path.join(__dirname, 'apps', 'mobile'));

console.log('Starting EAS build for Android APK...\n');

const build = spawn('eas', ['build', '--platform', 'android', '--profile', 'preview', '--skip-credentials-check'], {
  stdio: 'inherit',
  shell: true
});

build.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ Build completed successfully!');
    console.log('Check the EAS dashboard for your APK download link.');
  } else {
    console.log(`\n❌ Build failed with exit code ${code}`);
  }
  process.exit(code);
});

build.on('error', (err) => {
  console.error('Failed to start build:', err);
  process.exit(1);
});
