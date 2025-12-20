#!/bin/bash

# Script to apply Prisma migrations to production DB
# Usage: ./apply-migration.sh
# Make sure DATABASE_URL is set to production URL

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL environment variable is not set."
  echo "Set it to your production database URL."
  exit 1
fi

echo "Applying Prisma migrations to production DB..."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
  echo "Migrations applied successfully!"
else
  echo "Failed to apply migrations."
  exit 1
fi