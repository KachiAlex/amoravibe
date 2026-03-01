#!/bin/bash

# Setup Render PostgreSQL Database
# This script updates your .env.local with the Render database connection

ENV_FILE="apps/web/.env.local"

# Check if .env.local exists
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ $ENV_FILE not found"
    exit 1
fi

# Render database URL
RENDER_DB_URL="postgresql://amoravibe_user:knKUyuneX3rBzWEDxN5Z3wOX1EWYcNH7@dpg-d6i06f0gjchc73d0gv10-a.virginia-postgres.render.com/amoravibe"

# Update DATABASE_URL in .env.local
if grep -q "^DATABASE_URL=" "$ENV_FILE"; then
    # Replace existing DATABASE_URL
    sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"$RENDER_DB_URL\"|" "$ENV_FILE"
    echo "✅ Updated DATABASE_URL in $ENV_FILE"
else
    # Add DATABASE_URL if it doesn't exist
    echo "DATABASE_URL=\"$RENDER_DB_URL\"" >> "$ENV_FILE"
    echo "✅ Added DATABASE_URL to $ENV_FILE"
fi

echo ""
echo "🔄 Regenerating Prisma Client..."
yarn prisma generate

echo ""
echo "🔄 Running database migrations..."
yarn prisma migrate deploy

echo ""
echo "✅ Render database setup complete!"
echo ""
echo "Next steps:"
echo "1. Start the dev server: yarn workspace web dev"
echo "2. Test the connection by navigating to http://localhost:4000/dashboard"
