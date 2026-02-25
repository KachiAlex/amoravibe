// This script copies the generated Prisma client to node_modules/@prisma/client
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'node_modules', '.prisma', 'client');
const dest = path.join(__dirname, '..', 'node_modules', '@prisma', 'client');

if (!fs.existsSync(dest)) {
  fs.mkdirSync(dest, { recursive: true });
}

fs.readdirSync(src).forEach(file => {
  const srcFile = path.join(src, file);
  const destFile = path.join(dest, file);
  if (fs.statSync(srcFile).isFile()) {
    fs.copyFileSync(srcFile, destFile);
  }
});

console.log('Copied generated Prisma client files to node_modules/@prisma/client');
