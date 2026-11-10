# Local development

## Requirements

- Node.js 22.6+. The seed is TypeScript run directly by Node.
- Docker Desktop, for the local PostgreSQL 17 database.

## First run

```bash
npm install                 # also runs `prisma generate`
cp .env.example .env        # defaults work as-is for local development
npm run db:up               # PostgreSQL in Docker on 127.0.0.1:55434
npm run db:migrate          # apply migrations
npm run db:seed             # development data (safe to run again)
npm run dev                 # http://localhost:3000 · admin at /admin
```

Port 55434 avoids clashing with any PostgreSQL already installed on the machine.

## Development accounts

Created by `npm run db:seed`, in the **local database only**:

| Role        | Email                     | Can                                                    |
| ----------- | ------------------------- | ------------------------------------------------------ |
| Super Admin | `superadmin@example.com`  | Everything, including users and roles                  |
| Admin       | `admin@example.com`       | All content, taxonomy, media, settings, activity log   |
| Editor      | `editor@example.com`      | Create, edit and publish content; upload images        |
| Contributor | `contributor@example.com` | Draft content and submit it for review; cannot publish |

Password for all four: **`Aneakajun-dev-2026`**. To use a different one, set `SEED_ADMIN_PASSWORD` before seeding.

Re-running the seed resets these accounts' passwords and clears any login lockouts. The seed refuses to run when `NODE_ENV=production` or when `DATABASE_URL` points at a non-local host. Never create these accounts in production.

## Seed data

`prisma/seed-data.ts` contains fictional English and Khmer sample content:

- 12 people (one unpublished draft)
- 8 organizations with key people and members
- 8 articles (one draft)
- 22 categories, 9 tags, 14 skills and 12 locations
- site settings

Every record is upserted by slug, email or key, so running the seed repeatedly never creates duplicates. **The Khmer text is sample content and should be reviewed by a native speaker.**

## Commands

| Command                                           | Purpose                                                      |
| ------------------------------------------------- | ------------------------------------------------------------ |
| `npm run dev`                                     | Development server                                           |
| `npm run build` / `npm start`                     | Production build / server                                    |
| `npm run typecheck` / `npm run lint` / `npm test` | TypeScript / ESLint / unit tests                             |
| `npm run db:up` / `db:down`                       | Start / stop local PostgreSQL                                |
| `npm run db:migrate`                              | Apply pending migrations (non-interactive, also for servers) |
| `npm run db:migrate:dev -- --name <change>`       | Create a new migration after editing `prisma/schema.prisma`  |
| `npm run db:seed`                                 | Load development data                                        |
| `npm run db:reset`                                | Drop the local database, re-migrate and re-seed              |
| `npm run db:studio`                               | Browse the database                                          |

To run a production build next to a running dev server, use `NEXT_DIST_DIR=.next-build npm run build`. Otherwise both use the `.next` folder and conflict.

## Uploads

Images go to `storage/uploads/` (git-ignored) and are served by `/media/...`. Only JPEG, PNG, WebP and GIF are accepted, up to 5 MB, and the type is checked from the file's bytes. SVG is rejected because it can contain scripts.
