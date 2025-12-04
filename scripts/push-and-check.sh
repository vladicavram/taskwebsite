#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/push-and-check.sh [commit-message]
# Example: ./scripts/push-and-check.sh "build(fix): annotate types and fix route module"

COMMIT_MSG=${1:-"build(fix): annotate types and fix route module"}
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

echo "Working directory: $PROJECT_DIR"

echo "Git status:"
git --no-pager status --porcelain --branch || true

echo "Showing diffs for edited files (if any):"
git --no-pager diff -- "src/app/[locale]/profile/[id]/page.tsx" "src/app/[locale]/tasks/[id]/page.tsx" "src/app/api/users/credits/add/route.ts" || true

# Stage files (quoted to avoid zsh globbing)
git add "src/app/[locale]/profile/[id]/page.tsx" "src/app/[locale]/tasks/[id]/page.tsx" "src/app/api/users/credits/add/route.ts" || echo "git add failed or files not found"

# Commit if changes exist
if git diff --cached --quiet; then
  echo "No staged changes to commit. Skipping commit."
else
  git commit -m "$COMMIT_MSG"
fi

# Push with fallback to rebase if remote changed
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Pushing to origin/main..."
  if ! git push origin main; then
    echo "Push failed — pulling and rebasing then pushing..."
    git pull --rebase origin main
    git push origin main
  fi
fi

# Allow Vercel a few seconds to start build
echo "Waiting 5s for Vercel to pick up the push..."
sleep 5

echo "=== Vercel logs (last 200 lines) ==="
if command -v vercel >/dev/null 2>&1; then
  vercel logs FaG1T6Dnb --since 60m --limit 200 || echo "vercel logs command failed (not logged in or other error)"
else
  echo "vercel CLI not installed — install with 'npm i -g vercel' or run logs from your shell"
fi

# Optional local build (may require DATABASE_URL)
read -p "Run local build now? (y/N): " RUN_BUILD
if [[ "$RUN_BUILD" =~ ^[Yy]$ ]]; then
  echo "Installing dependencies..."
  npm ci
  echo "Running prisma generate (may fail if DATABASE_URL not set)..."
  npx prisma generate || true
  echo "Running npm run build..."
  npm run build || echo "Local build finished with errors (see output)"
fi

echo "Done. If Vercel build still fails, paste the error block here and I'll patch the files."