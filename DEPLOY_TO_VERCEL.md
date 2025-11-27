Deploy to Vercel — instructions

This document lists the exact steps and environment variables required to deploy `taskwebsite` to Vercel. It assumes the repository is already on GitHub (you pushed it).

1) Create a Vercel project
- Go to https://vercel.com and sign in.
- Click **New Project** → **Import Git Repository** → choose the `vladicavram/taskwebsite` repo.

2) Build settings (Vercel will usually auto-detect Next.js)
- Framework Preset: **Next.js**
- Install Command: `npm ci`
- Build Command: `npm run build`
- Output Directory: leave default (Vercel handles Next.js)

3) Environment Variables (add in Vercel project Settings → Environment Variables)
- `DATABASE_URL` — Postgres connection string for your production DB (e.g. `postgresql://user:pass@host:5432/dbname?schema=public`)
- `NEXTAUTH_URL` — e.g. `https://your-site.vercel.app`
- `NEXTAUTH_SECRET` — a long random string
- `GITHUB_ID` and `GITHUB_SECRET` — if using GitHub OAuth
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` — if using email
- `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY` — if payments are used
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`, `AWS_REGION` — if using S3 for uploads
- Any `NEXT_PUBLIC_...` env vars your client code uses

Notes about Prisma and migrations
- Vercel's serverless functions can cause many transient DB connections. Recommended approaches:
  - Use Prisma Data Proxy (recommended for serverless) and set `DATABASE_URL` accordingly, or
  - Use a serverless-friendly Postgres provider (Neon), or
  - Host the app on a long-running service (Render/Fly) to avoid connection churn.
- Migrations: make sure your production DB schema is migrated before or during deployment. Options:
  - Run migrations manually from your machine (see below), or
  - Use the included GitHub Actions workflow `.github/workflows/migrate.yml` which runs `npx prisma migrate deploy` on pushes to `main`. You must add `DATABASE_URL` to your GitHub Secrets for that to work.

Run migrations from your machine (example)
```
# set production DATABASE_URL locally (do not commit)
export DATABASE_URL="postgresql://user:pass@host:5432/dbname"
npx prisma generate
npx prisma migrate deploy
```

4) File uploads
- Do NOT rely on Vercel filesystem for user uploads. Use S3-compatible storage (AWS S3, DigitalOcean Spaces) and set the credentials in env vars above. The app expects S3-like env names; adapt if needed.

5) After deploy
- Visit your site at `https://your-project.vercel.app` (or your custom domain).
- Test signup/login flows, payments, and uploads.

6) Useful commands for local and CI
```
# build locally
npm ci
npx prisma generate
npm run build

# run migrations locally against production DB (use with caution)
export DATABASE_URL="postgresql://user:pass@host:5432/dbname"
npx prisma migrate deploy
```

If you want, I can also add a small `README_PROD.md` or scripts to automate migration deployment from CI. After you add `DATABASE_URL` to GitHub Secrets, the workflow `.github/workflows/migrate.yml` will run on pushes to `main` and apply migrations.
