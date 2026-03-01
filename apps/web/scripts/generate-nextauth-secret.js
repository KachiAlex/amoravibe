/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

function generateSecret(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

const secret = generateSecret(32);

if (process.argv.includes('--write')) {
  const envPath = path.resolve(process.cwd(), '.env.local');
  let content = '';
  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, 'utf8');
    // replace existing NEXTAUTH_SECRET if present
    if (content.match(/^NEXTAUTH_SECRET=.*$/m)) {
      content = content.replace(/^NEXTAUTH_SECRET=.*$/m, `NEXTAUTH_SECRET=${secret}`);
    } else {
      if (content.length && !content.endsWith('\n')) content += '\n';
      content += `NEXTAUTH_SECRET=${secret}\n`;
    }
  } else {
    content = `NEXTAUTH_SECRET=${secret}\n`;
  }
  fs.writeFileSync(envPath, content, 'utf8');
  console.log(`Wrote NEXTAUTH_SECRET to ${envPath}`);
} else {
  console.log(secret);
}
