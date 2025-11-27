# Git setup and push instructions

This file contains exact commands to initialize a local Git repository, create a remote on GitHub, and push your project. Run these commands on your machine in the project root (`/Users/vlad/taskwebsite`).

1) Check repo size and uploads

It's common for `public/uploads/` to contain many or large files. Do not commit them. Confirm size:

```bash
du -sh public/uploads || true
```

2) Initialize local repo and create first commit

```bash
cd /Users/vlad/taskwebsite
# create repository if not present
git init
git add .
git commit -m "Initial commit"
```

3) Create GitHub repository and push (recommended: use GitHub CLI)

If you have `gh` installed and are logged in:

```bash
# replace OWNER/REPO with your GitHub username and desired repo name
gh repo create OWNER/REPO --public --source=. --remote=origin --push
```

If you don't use `gh`, create a repo on github.com manually, then in the project run:

```bash
# replace with your repo remote URL (SSH or HTTPS)
git remote add origin git@github.com:OWNER/REPO.git
git branch -M main
git push -u origin main
```

4) Add secrets and CI

- Do NOT commit `.env` files. Ensure they are in `.gitignore` (already added).
- Add production `DATABASE_URL`, `NEXTAUTH_SECRET`, and other secrets in Vercel project settings or GitHub Actions secrets.

5) Optional: add a GitHub Actions workflow to run prisma migrations (example below). You will still need to set `DATABASE_URL` as a secret in the repo settings.

Example workflow snippet (save under `.github/workflows/migrate.yml` if you want automatic migrations on `main`):

```yaml
name: Run migrations
on:
  push:
    branches: [ main ]
jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          node-version: '20'
      - name: Install deps
        run: npm ci
      - name: Generate Prisma client
        run: npx prisma generate
      - name: Run Prisma migrations
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: npx prisma migrate deploy
```

6) After pushing to GitHub, you can import the repo into Vercel and set env vars there.

If you want, I can create the `.github/workflows/migrate.yml` file for you (but I will not set secrets). Because the terminal tool is not available, you'll need to push the created files yourself.
