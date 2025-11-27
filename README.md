# TaskSite (minimal TaskRabbit-like scaffold)

This repository is a minimal, ready-to-extend scaffold for a Task marketplace built with Next.js (App Router), TypeScript, Tailwind CSS, Prisma (Postgres), and basic API routes.

Features included in scaffold
- Next.js App Router structure with server/client components
- Prisma schema for `User`, `Profile`, `Task`, `Category`, `Review`
- Prisma seed script to create demo data
- Docker + docker-compose (Postgres + app)
- i18n scaffold (messages files)
- Basic pages: Home, Tasks, Create Task, Task detail, Profile, Login placeholder

Quick start (Docker)

1. Copy env file:

```zsh
cp .env.example .env.local
```

2. Start containers (this runs the Next.js dev server):

```zsh
docker-compose up --build
```

3. Inside the running `app` container (or locally once `npm install` is run), run Prisma migrate & seed:

```zsh
npx prisma migrate dev --name init
node prisma/seed.ts
```

Run locally

```zsh
npm install
cp .env.example .env.local
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

Authentication
- To enable OAuth login with GitHub set `GITHUB_ID` and `GITHUB_SECRET` in `.env.local`.
- `NEXTAUTH_SECRET` should be set to a secure random value for production.


Files of interest
- `prisma/schema.prisma` — database models
- `prisma/seed.ts` — basic seed data
- `src/app` — app pages and API route handlers
- `src/lib/prisma.ts` — Prisma client wrapper

Quick setup script
- You can run the bundled `setup.sh` script which will install dependencies, start Postgres via Docker Compose (if available), run Prisma generate/migrate, and seed the database.

Make it executable and run:

```bash
chmod +x ./setup.sh
./setup.sh
```

Localization
- Messages live under `messages/` for `en`, `ro`, `ru`. Use `next-intl` in pages/components to localize strings.

Next steps (suggested)
- Wire NextAuth (credentials + OAuth) and protect create/edit routes
- Add client-side i18n usage (language switcher)
- Implement user uploads, avatars, and image storage
- Add tests, CI, and proper production optimizations
