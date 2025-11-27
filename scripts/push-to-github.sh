#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./scripts/push-to-github.sh OWNER REPO [private]
# Examples:
#   ./scripts/push-to-github.sh vlad taskwebsite
#   ./scripts/push-to-github.sh vlad taskwebsite private
#
# This script safely prepares the repository, removes large paths from the index
# if needed, creates a GitHub repo using the `gh` CLI (if installed), and pushes
# the initial commit. It will NOT add secrets for you.

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "Project root: $PROJECT_ROOT"

if ! command -v git >/dev/null 2>&1; then
  echo "git is required but not found. Install git and re-run."
  exit 1
fi

# Ensure .gitignore exists
if [ ! -f .gitignore ]; then
  echo ".gitignore not found — creating a default .gitignore"
  cat > .gitignore <<'EOF'
node_modules/
.next/
out/
.vercel/
.env
public/uploads/
prisma/migrations/
EOF
  git add .gitignore || true
fi

# Abort if .env is tracked — it's dangerous to push secrets
if git ls-files --error-unmatch .env >/dev/null 2>&1; then
  echo "ERROR: .env is tracked in git. Remove it from the index before pushing and rotate any secrets."
  echo "Run: git rm --cached .env && git commit -m 'Remove .env from index'"
  exit 1
fi

# Init repo if necessary
if [ ! -d .git ]; then
  echo "Initializing git repository"
  git init
fi

# Remove large/sensitive paths from index if present
for path in node_modules .next out public/uploads; do
  if git ls-files --error-unmatch "$path" >/dev/null 2>&1; then
    echo "Removing $path from index (keeps files on disk)"
    git rm -r --cached "$path" || true
  fi
done

# Check for accidental large files staged
LARGE_FILES_FOUND=false
while IFS= read -r file; do
  if [ -f "$file" ]; then
    size=$(du -sh "$file" 2>/dev/null | cut -f1 || true)
    echo "Large tracked file: $file ($size)"
    LARGE_FILES_FOUND=true
  fi
done < <(git ls-files --exclude-standard --others --cached)

if [ "$LARGE_FILES_FOUND" = true ]; then
  echo "If you see large files above, remove them from the index with 'git rm --cached <file>' before proceeding."
fi

# Add and commit
if git rev-parse --quiet --verify HEAD >/dev/null 2>&1; then
  echo "Repository already has commits. Creating a new commit with changes."
  git add .
  git commit -m "Update repository" || true
else
  echo "Creating initial commit"
  git add .
  git commit -m "Initial commit" || true
fi

# Create remote and push
OWNER=${1:-}
REPO=${2:-}
PRIVATE_FLAG=${3:-}

if [ -n "$OWNER" ] && [ -n "$REPO" ] && command -v gh >/dev/null 2>&1; then
  echo "Creating GitHub repo using gh: $OWNER/$REPO"
  if [ "$PRIVATE_FLAG" = "private" ]; then
    gh repo create "$OWNER/$REPO" --private --source=. --remote=origin --push
  else
    gh repo create "$OWNER/$REPO" --public --source=. --remote=origin --push
  fi
  echo "Pushed to GitHub. Remote origin is set."
  exit 0
fi

if [ -n "$OWNER" ] && [ -n "$REPO" ]; then
  REMOTE="git@github.com:$OWNER/$REPO.git"
  echo "No gh CLI detected, adding remote: $REMOTE"
  git remote add origin "$REMOTE" || git remote set-url origin "$REMOTE"
  git branch -M main || true
  echo "Now run: git push -u origin main"
  exit 0
fi

echo "No OWNER/REPO provided. To push manually, create a remote repository on GitHub and run:" 
echo "  git remote add origin git@github.com:OWNER/REPO.git"
echo "  git branch -M main"
echo "  git push -u origin main"

exit 0
