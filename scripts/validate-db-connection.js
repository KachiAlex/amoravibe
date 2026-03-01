#!/usr/bin/env node

/**
 * Validates and fixes database connection issues with Neon
 * Run this script if you encounter database connectivity errors
 */

const fs = require('fs');
const path = require('path');

const envLocalPath = path.join(__dirname, '..', '.env.local');

if (!fs.existsSync(envLocalPath)) {
  console.error('❌ .env.local not found. Please create it with DATABASE_URL.');
  process.exit(1);
}

const envContent = fs.readFileSync(envLocalPath, 'utf-8');
const databaseUrlMatch = envContent.match(/DATABASE_URL="([^"]+)"/);

if (!databaseUrlMatch) {
  console.error('❌ DATABASE_URL not found in .env.local');
  process.exit(1);
}

const databaseUrl = databaseUrlMatch[1];

// Validate Neon connection string format
const isNeonUrl = databaseUrl.includes('neon.tech');
const hasPooler = databaseUrl.includes('-pooler');
const hasSSL = databaseUrl.includes('sslmode=require');
const hasChannelBinding = databaseUrl.includes('channel_binding=require');

console.log('🔍 Validating database connection...\n');
console.log(`Database URL: ${databaseUrl.substring(0, 50)}...`);
console.log(`✓ Is Neon: ${isNeonUrl ? '✓' : '✗'}`);
console.log(`✓ Uses pooler: ${hasPooler ? '✓' : '✗'}`);
console.log(`✓ Has SSL: ${hasSSL ? '✓' : '✗'}`);
console.log(`✓ Has channel binding: ${hasChannelBinding ? '✓' : '✗'}`);

if (!isNeonUrl) {
  console.warn('\n⚠️  Warning: This doesn\'t look like a Neon database URL');
}

if (!hasPooler) {
  console.warn('\n⚠️  Warning: Not using Neon pooler endpoint. Consider using the pooler for better reliability.');
  console.log('   Replace "ep-" with "ep-...-pooler" in your DATABASE_URL');
}

if (!hasSSL || !hasChannelBinding) {
  console.error('\n❌ Missing required SSL parameters for Neon');
  console.log('   Your DATABASE_URL should end with: ?sslmode=require&channel_binding=require');
  process.exit(1);
}

console.log('\n✅ Database connection configuration looks good!');
console.log('\nIf you still have connectivity issues:');
console.log('1. Check that your Neon project is active in the dashboard');
console.log('2. Verify your IP is whitelisted (if applicable)');
console.log('3. Try regenerating the connection string from Neon dashboard');
console.log('4. Ensure your local network can reach neon.tech');
