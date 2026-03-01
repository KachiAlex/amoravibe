# Neon Database Connection Guide

## Quick Fix for Connection Issues

If you encounter "Can't reach database server" errors:

### Option 1: Validate Configuration (Recommended First Step)
```bash
node scripts/validate-db-connection.js
```

This script checks:
- ✓ Neon database URL format
- ✓ Pooler endpoint usage
- ✓ SSL configuration
- ✓ Channel binding settings

### Option 2: Regenerate Connection String from Neon

1. Go to https://console.neon.tech
2. Select your project
3. Go to "Connection Details"
4. Copy the **Pooler** connection string (not Direct)
5. Update `.env.local`:
   ```
   DATABASE_URL="postgresql://user:password@ep-...-pooler.c-3.us-east-1.aws.neon.tech/database?sslmode=require&channel_binding=require"
   ```

### Option 3: Clear Prisma Cache and Regenerate

```bash
# Stop the dev server first
rm -rf node_modules/.prisma
yarn prisma generate
yarn workspace web dev
```

### Option 4: Check Neon Project Status

1. Go to https://console.neon.tech
2. Verify your project is **Active** (not suspended)
3. Check database exists and is accessible
4. Verify you have remaining compute hours

## Permanent Improvements Made

The following changes ensure better reliability:

### 1. Connection Pooling
- Using Neon's **pooler endpoint** (required for applications)
- Configured in `prisma/schema.prisma` with `directUrl` support

### 2. Error Handling
- Added connection error detection in `src/lib/db.ts`
- Automatic connection reset on transient failures
- Retry logic for initialization

### 3. Validation Script
- `scripts/validate-db-connection.js` checks configuration
- Run anytime you suspect connection issues

## Why Connection Issues Happen

Neon is a serverless PostgreSQL service. Connection issues can occur due to:

1. **Transient network issues** - Temporary connectivity glitches (usually resolve themselves)
2. **Project suspension** - Neon suspends inactive projects after 7 days
3. **Connection pooling limits** - Too many simultaneous connections
4. **SSL/TLS issues** - Missing or incorrect SSL parameters
5. **Firewall/Network** - Your ISP or network blocking port 5432

## Prevention Tips

1. **Keep your project active** - Log into Neon console regularly
2. **Use pooler endpoint** - Always use `-pooler` endpoint for applications
3. **Monitor compute hours** - Ensure you have available compute hours
4. **Check status page** - https://status.neon.tech for service issues
5. **Validate on startup** - Run validation script before dev sessions

## If Issues Persist

1. Check Neon status: https://status.neon.tech
2. Review Neon docs: https://neon.tech/docs/
3. Contact Neon support: https://neon.tech/docs/introduction/support
4. Consider temporary mock data: See `src/lib/dev-data.ts`

## Environment Variables

Your `.env.local` should contain:

```
# Required
DATABASE_URL="postgresql://user:password@ep-...-pooler.c-3.us-east-1.aws.neon.tech/database?sslmode=require&channel_binding=require"

# Optional (for migrations)
DATABASE_DIRECT_URL="postgresql://user:password@ep-....neon.tech/database?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:4000"
NEXTAUTH_SECRET="your-secret-key"
```

Note: `DATABASE_DIRECT_URL` is optional and only needed for Prisma migrations.
