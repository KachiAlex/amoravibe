#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
const renderUrl = 'postgresql://amoravibe_user:knKUyuneX3rBzWEDxN5Z3wOX1EWYcNH7@dpg-d6i06f0gjchc73d0gv10-a.virginia-postgres.render.com/amoravibe';

try {
  let content = fs.readFileSync(envPath, 'utf-8');
  
  // Replace DATABASE_URL line
  content = content.replace(/DATABASE_URL=.*/g, `DATABASE_URL="${renderUrl}"`);
  
  fs.writeFileSync(envPath, content, 'utf-8');
  console.log('✅ Fixed .env DATABASE_URL to Render');
  
  // Verify
  const updated = fs.readFileSync(envPath, 'utf-8');
  const dbLine = updated.split('\n').find(line => line.startsWith('DATABASE_URL='));
  console.log('Current:', dbLine);
} catch (err) {
  console.error('❌ Error:', err.message);
  process.exit(1);
}
