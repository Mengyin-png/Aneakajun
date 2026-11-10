# Aneakajun: Cambodian People & Organization Information Hub

A searchable, bilingual (English / Khmer) directory of Cambodian people, organizations and articles, with an admin CMS.

- **Public site:** home with global search, people and organization directories with filters, profiles, articles, and search across all content.
- **Admin CMS (`/admin`):**
  - content management with Draft / In review / Published / Archived statuses
  - featured content, display ordering, SEO fields and previews
  - media library, taxonomy, users and roles, site settings, activity log

Setup, development accounts and commands: **[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)**.

## Stack

| Area       | Technology                                                                                    |
| ---------- | --------------------------------------------------------------------------------------------- |
| Framework  | Next.js 15 (App Router), React 19, TypeScript (strict)                                        |
| Styling    | Tailwind CSS v4 with design tokens in `src/app/globals.css`                                   |
| Database   | PostgreSQL 17 via Prisma 6, with the `pg_trgm` extension for search                           |
| Auth       | Built in: scrypt password hashing and database-backed sessions in an httpOnly cookie          |
| Validation | Zod, on every server action                                                                   |
| Storage    | Local disk behind a `StorageProvider` interface (`src/lib/storage`)                           |
| Tests      | Vitest unit tests, plus end-to-end tests in a real browser                                    |

## Architecture

```
prisma/                schema.prisma, migrations/, seed.ts, seed-data.ts
src/app/(en)/          English public routes at the site root (/people/[slug] …)
src/app/km/            Khmer public routes (/km/people/[slug] …), thin wrappers
src/views/             The public pages themselves, shared by both languages
src/app/admin/         CMS: login, (cms)/ dashboard, content, taxonomy, media, users, settings, activity, preview
src/app/media/         Serves uploaded files
src/app/api/search/    Search suggestions endpoint
src/server/queries/    Read side: directory listing, filters, search, profiles (public)
src/server/actions/    Write side: server actions with permission checks, validation and audit logging
src/server/admin/      Admin list and edit-form loaders
src/components/        site/ (public UI), profiles/ (profile views, reused by admin preview), admin/ (CMS UI), ui/
src/lib/               auth/, i18n/, validation/, storage/, db, seo, slug, markdown, audit
```

- **Frontend, backend and database are separated:**
  - Pages only call `server/queries` (reads) or `server/actions` (writes).
  - Actions are the only code that writes to the database.
- **Permissions:**
  - Roles and permissions are stored in the database (`Role`, `Permission`, `RolePermission`), seeded from `src/lib/auth/permissions.ts`.
  - Every admin page and server action checks its permission on the server.
  - Contributors can only edit their own unpublished drafts and cannot publish.
  - Public registration is disabled.
- **Bilingual content:**
  - People, organizations and articles keep their language-specific text in `*Translation` tables, one row per language. English is required; Khmer is optional and falls back to English.
  - Short labels (categories, tags, skills, locations) use `name` / `nameKm`.
  - Interface text lives in `src/lib/i18n/dictionaries.ts`.
  - English URLs have no prefix; Khmer URLs are under `/km`. Pages set `hreflang` and canonical links.
- **Search:**
  - Case-insensitive substring matching on names, headlines, descriptions, skills and tags, sped up by `pg_trgm` trigram indexes. This works for Khmer, which is written without spaces between words.
  - Results are ranked by relevance (exact match, then prefix, then word, then other fields).
  - Filters combine location (a country includes its provinces and cities), industry and category. Sorting is by relevance, newest or A–Z, with pagination.
  - Matching and ranking are done in application code over up to 2,000 matches per type. That's fine for an MVP directory; move ranking into SQL if the data grows far beyond that.
- **Caching:**
  - Home pages and profiles are cached (ISR, 5 minutes) and refreshed immediately whenever an admin saves.
  - Filtered and search pages are rendered per request.
  - Only published content appears in the sitemap, and search pages are `noindex`.
- **Phase 2 (schema only):**
  - `Submission`, `Event`, `Opportunity`, `Notification` and `Bookmark` models exist, with no UI or workflow.
  - Submissions have their own review states (pending, changes requested, approved, rejected) and never publish automatically.

## Deployment notes (Daun Penh Cloud or any Node host)

- `output: "standalone"` is set in `next.config.ts`. Run `npm run build`, then `node .next/standalone/server.js`, copying `.next/static` and `public` next to it as usual for standalone output.
- **Environment variables:**
  - `DATABASE_URL`: PostgreSQL 15+ with the `pg_trgm` extension available.
  - `SITE_URL`: the public domain.
  - `STORAGE_DIR`: a persistent volume.
- Run `npm run db:migrate` (`prisma migrate deploy`) before starting a new version. **Never run the seed in production.** Create the first Super Admin with a one-off script or SQL instead.
- The two home pages are prerendered at build time, so the build needs database access.
- To use object storage, implement `StorageProvider` (`put`, `get`, `delete`, `publicUrl`) in `src/lib/storage/index.ts`.
