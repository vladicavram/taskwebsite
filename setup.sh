#!/usr/bin/env zsh
set -euo pipefail

echo "Running TaskSite setup script"

check_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Missing required command: $1" >&2
    return 1
  }
}

echo "Checking required tools..."
if ! check_cmd npm; then
  echo "npm is required. Install Node.js (which includes npm) and re-run this script." >&2
  exit 1
fi

if check_cmd docker && check_cmd docker-compose; then
  HAS_DOCKER=true
else
  HAS_DOCKER=false
fi

if [ ! -f .env.local ]; then
  echo "Creating .env.local from .env.example"
  cp .env.example .env.local || true
  echo "Please review .env.local and set NEXTAUTH_SECRET and optional OAuth secrets before continuing."
fi

echo "Installing npm dependencies..."
npm install

if [ "$HAS_DOCKER" = true ]; then
  echo "Docker + docker-compose detected — starting Postgres container"
  docker-compose up -d db
  echo "Waiting for Postgres to accept connections on localhost:5432..."
  # wait up to 60 seconds
  i=0
  until nc -z localhost 5432 >/dev/null 2>&1; do
    sleep 1
    i=$((i + 1))
    if [ $i -ge 60 ]; then
      echo "Timed out waiting for Postgres to start. Check docker containers with 'docker-compose ps'." >&2
      break
    fi
  done
fi

echo "Generating Prisma client..."
npx prisma generate

echo "Applying database migrations (prisma migrate dev)..."
npx prisma migrate dev --name init --skip-seed || true

echo "Seeding database (if seed script exists)..."
if [ -f prisma/seed.ts ]; then
  # run seed via ts-node if available, else via node (compiled)
  if command -v ts-node >/dev/null 2>&1; then
    npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
  else
    node prisma/seed.ts || true
  fi
fi

echo "Setup complete. To start the app in development run:"
echo "  npm run dev"

echo "If you want this script to start the dev server automatically, re-run with the START_DEV=1 environment variable:"
echo "  START_DEV=1 ./setup.sh"

if [ "${START_DEV-}" = "1" ]; then
  echo "Starting dev server..."
  npm run dev
fi
