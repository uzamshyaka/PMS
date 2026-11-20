# Car Showcase

A vehicle showcase and listing management system. Administrators manage
listings and approve them for publication. Visitors browse vehicles and
contact owners directly.

**Current state: Phase 0 (foundation) plus the public website design.** Working features:

- Administrator login, logout and session restore
- Role-based access control
- The standard API response format
- Public website (home, inventory, vehicle details, about, contact) running on **sample vehicle data**
- Admin dashboard on **live data**: vehicles, owners, listing reviews (approval publishes), enquiries, catalogue, website content, users, settings, audit logs
- Vehicle photos stored in an **S3 bucket** (local S3-compatible service in Docker)
- Website enquiry form; admin changes to listings and content appear on the website

Still to do: versioned Terms & Conditions, and showing the last approved version of a listing while edits are under review.
See [docs/architecture.md](docs/architecture.md).

| Directory | Contents |
|---|---|
| `api/` | Laravel 13 REST API (`/api/v1`) |
| `web/` | Nuxt 4 website and admin panel |
| `docker/` | Docker support files (MySQL init script) |
| `docs/` | Architecture documentation |
| `app/` | **Retired** Vue SPA, replaced by `web/`. Not part of the running stack. Kept for reference until it is deleted. |

## Requirements

- Docker with Compose v2, **or**
- PHP 8.4, Composer 2, Node.js `^22.22.3 || ^24.15.0` (required by Nuxt 4.6), MySQL 8.4

## Local development with Docker

```bash
# 1. Configuration (none of these files are committed)
cp .env.example .env                       # Compose: DB credentials
cp api/.env.example api/.env               # API settings (skip if you already have one)
cp api/.env.testing.example api/.env.testing
cp web/.env.example web/.env

# Fill in DB_PASSWORD / DB_ROOT_PASSWORD in .env, and set the same
# DB_PASSWORD in api/.env and api/.env.testing.

# 2. Start the stack
docker compose up -d --build

# 3. First time only: app key, migrations, seed data (roles, catalogue, local admin) and the photo bucket.
#    None of these run automatically.
docker compose exec api php artisan key:generate
docker compose exec api php artisan migrate --seed
docker compose exec api php artisan storage:ensure-bucket
```

| Service | URL |
|---|---|
| Website | http://localhost:3000 |
| Admin | http://localhost:3000/admin |
| API | http://localhost:8081/api/v1 |
| MySQL | `localhost:3307` from the host, `db:3306` inside Docker |
| S3 (vehicle photos) | http://localhost:8334 (bucket `car-showcase`) |

`migrate --seed` creates the four roles and their permissions. In the `local`
environment it also creates a Super Admin from `DEV_ADMIN_EMAIL` /
`DEV_ADMIN_PASSWORD` (defaults: `admin@example.com` / `password`).

**After changing PHP or npm dependencies**, rebuild and replace the
containers' dependency volumes. Otherwise Docker keeps the old `vendor/` or
`node_modules/`:

```bash
docker compose up -d --build --renew-anon-volumes
```

## Required API settings for the admin login

In `api/.env`:

```dotenv
FRONTEND_URL=http://localhost:3000          # CORS origin
SANCTUM_STATEFUL_DOMAINS=localhost:3000     # host:port of the Nuxt app
SESSION_DOMAIN=localhost
```

If `SANCTUM_STATEFUL_DOMAINS` does not include the Nuxt host, login fails
with a 500 error and the log shows "Session store not set on request".

For production, see the authentication section in
[docs/architecture.md](docs/architecture.md#3-authentication). Set
`APP_ENV=production`, `APP_DEBUG=false` and `SESSION_SECURE_COOKIE=true`,
and serve both apps over HTTPS on the same registrable domain.

## Running without Docker

```bash
cd api && composer install && php artisan serve --port=8081
cd web && npm install && npm run dev        # http://localhost:3000
```

Point `DB_HOST`/`DB_PORT` in `api/.env` at your MySQL server.

## Tests

### API (PHPUnit, MySQL)

Tests only ever run against the `carshowcase_test` database and refuse to
start otherwise. The Docker MySQL service creates that database the first
time its volume is initialised. For an older volume, create it once:

```sql
CREATE DATABASE carshowcase_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON carshowcase_test.* TO '<DB_USERNAME>'@'%';
```

```bash
cd api && php artisan test                      # from the host (uses 127.0.0.1:3307)
docker compose exec api php artisan test        # inside Docker (Compose supplies DB_HOST=db)
```

### Web (Vitest)

```bash
cd web
npm run test        # unit and component tests
npm run typecheck   # vue-tsc
npm run build       # production build
npm run test:e2e    # Playwright layout checks against the build (run `npx playwright install chromium` once)
```

`test:e2e` saves full-page screenshots at 1440, 768 and 390 px to
`web/e2e/screenshots/` (git-ignored) for comparison with the design reference.
