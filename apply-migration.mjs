import { Client } from 'pg';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf-8');
const dbUrlLine = envContent.split('\n').find(l => l.trim().startsWith('DATABASE_URL='));
if (!dbUrlLine) {
  console.error('DATABASE_URL not found in .env.local');
  process.exit(1);
}

const url = dbUrlLine.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '');

const connectionString = url.includes('sslmode=') 
  ? url.replace('sslmode=require', 'uselibpqcompat=true&sslmode=require')
  : url + (url.includes('?') ? '&' : '?') + 'uselibpqcompat=true&sslmode=require';

const client = new Client({ connectionString, ssl: false });

try {
  await client.connect();
  const sql = fs.readFileSync('migrate-db.sql', 'utf-8');
  await client.query(sql);
  console.log('Migration applied successfully!');
} catch (err) {
  console.error('Migration failed:', err.message);
  process.exit(1);
} finally {
  await client.end();
}
