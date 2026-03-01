# Database Setup & Troubleshooting

## Neon Database Configuration

Your app uses Neon PostgreSQL with connection pooling. If you encounter database connectivity errors, follow these steps:

### 1. Verify Your Connection String

Your `.env.local` should have:
```
DATABASE_URL="postgresql://neondb_owner:npg_X7ZPdz0nkjUm@ep-tiny-bush-ahmf9y7d-pooler.c-3.us-east-1.aws.neon.tech/test?sslmode=require&channel_binding=require"
```

**Important**: Make sure you're using the **pooler endpoint** (contains `-pooler`), not the direct endpoint.

### 2. Connection Pooling

Neon provides two endpoints:
- **Direct endpoint**: `ep-...` - Use for migrations and one-off queries
- **Pooler endpoint**: `ep-...-pooler` - Use for applications (better for connection pooling)

Always use the pooler endpoint in your `DATABASE_URL`.

### 3. SSL Requirements

The connection string MUST include:
- `sslmode=require` - Enforces SSL encryption
- `channel_binding=require` - Neon security requirement

### 4. Troubleshooting Connection Issues

If you get "Can't reach database server" errors:

**Step 1: Verify the connection string**
```bash
node scripts/validate-db-connection.js
```

**Step 2: Check Neon dashboard**
- Go to https://console.neon.tech
- Verify your project is active (not suspended)
- Check that the database exists and is accessible

**Step 3: Regenerate connection string**
- In Neon dashboard, go to Connection Details
- Copy the pooler connection string
- Update your `.env.local` with the new string

**Step 4: Clear Prisma cache**
```bash
rm -rf node_modules/.prisma
yarn prisma generate
```

**Step 5: Restart dev server**
```bash
# Kill the dev server and restart
yarn workspace web dev
```

### 5. Network Issues

If the above doesn't work, your network might be blocking the connection:
- Check if your firewall allows outbound connections to `neon.tech`
- Try using a VPN if behind a corporate proxy
- Check if your ISP blocks PostgreSQL connections (port 5432)

### 6. Permanent Fix Applied

The following changes have been made for reliability:
- Added Prisma error logging in `src/lib/db.ts`
- Implemented connection pooling via Neon's pooler endpoint
- Added validation script to check connection configuration

### 7. If All Else Fails

Contact Neon support:
- https://neon.tech/docs/introduction/support
- Check status page: https://status.neon.tech

Or temporarily use mock data for development:
- See `src/lib/dev-data.ts` for mock data setup
- Update `getDashboardData()` to use mock data instead of database queries
