# Architecture

Car Showcase is a vehicle listing platform. Administrators manage vehicles,
owners and listings; reviewers approve listings for publication; visitors
browse published vehicles and contact owners directly. It is **not** a
marketplace: there are no payments, bids, bookings or buyer accounts.

> **Status:** Phase 0 (foundation) is complete. The only working feature is
> administrator authentication with role-based access control. Everything
> listed under [Planned modules](#planned-modules) is **not implemented yet**.

---

## 1. Overview

The system is a **modular monolith**: one Laravel API and one Nuxt web app,
deployed as two processes against one MySQL database. There are no
microservices, message brokers or caches beyond what Laravel provides.

```
Browser ──► Nuxt (web/)  ── public pages: server-rendered (SEO)
   │                     └─ /admin/**: client-rendered SPA
   │
   └─────► Laravel API (api/)  /api/v1/...  ──►  MySQL 8.4
           Sanctum session cookie + CSRF
```

| Layer    | Technology                                   | Location |
|----------|----------------------------------------------|----------|
| API      | Laravel 13, PHP 8.4, Sanctum 4, Spatie Permission 8 | `api/` |
| Web      | Nuxt 4, Vue 3, TypeScript, Pinia, Tailwind 4, Vuelidate | `web/` |
| Database | MySQL 8.4                                    | Docker `db` service |
| Retired  | Vue 3 + Vite SPA (replaced by `web/`)        | `app/` (kept for reference, not run) |

---

## 2. Backend (`api/`)

### Structure

```
api/app/
├── Models/                      Eloquent models, shared by all modules (User)
├── Modules/
│   └── Authentication/          ← the only module implemented so far
│       ├── Controllers/AuthController.php
│       ├── Enums/AdminRole.php, AdminPermission.php
│       ├── Middleware/EnsureAccountIsActive.php
│       ├── Requests/LoginRequest.php
│       ├── Resources/AdminUserResource.php
│       ├── Services/AuthService.php
│       └── routes.php
├── Support/Http/
│   ├── ApiResponse.php          builds every JSON response
│   └── ApiExceptionRenderer.php turns exceptions into the same envelope
└── Providers/AppServiceProvider.php   API rate limiter
```

Conventions:

- **One folder per business domain** under `app/Modules/<Domain>/`, each with
  `Controllers`, `Requests`, `Resources`, `Services`, `Policies` and a `routes.php`
  as needed. Only create the folders a module actually uses.
- **Models stay in `app/Models`.** Domains reference each other's models heavily
  and Laravel's factory and policy discovery expects this location.
- **Controllers stay thin.** They validate (Form Request), call a service and
  return `ApiResponse`. Business rules live in services.
- **No repository or DTO layers** over Eloquent unless a real need appears.
- **Separate resources for admin and public output.** Models are never
  returned directly.
- Use **database transactions** for any operation that writes related rows
  (see `RolesAndPermissionsSeeder` for an example).

### Routing

`routes/api.php` mounts each module's `routes.php`:

| Prefix | Audience | Middleware |
|---|---|---|
| `/api/v1/admin/auth/*` | admin login/logout/me | `throttle:api`; `auth:sanctum` + `active` for logout/me |
| `/api/v1/admin/*` | future admin modules | `auth:sanctum`, `active`, `permission:<name>` |
| `/api/v1/public/*` | future public site | `throttle:api` (planned) |

### API response standard

Every `/api/*` response, success or error, has this shape:

```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {},
  "meta": null,
  "errors": null
}
```

Use `App\Support\Http\ApiResponse`. Never build the array by hand:

| Method | Status |
|---|---|
| `ApiResponse::success($data, $message)` | 200 |
| `ApiResponse::created($data)` | 201 |
| `ApiResponse::paginated($paginator, ResourceClass::class)` | 200, adds `meta.pagination` |
| `ApiResponse::validationError($errors)` | 422 |
| `ApiResponse::unauthenticated()` | 401 |
| `ApiResponse::forbidden()` | 403 |
| `ApiResponse::notFound()` | 404 |
| `ApiResponse::error($message, $status)` | any |

Pagination meta: `{ "pagination": { "current_page", "per_page", "total", "last_page", "from", "to" } }`.

### Error handling

`bootstrap/app.php` routes every exception on `/api/*` through
`ApiExceptionRenderer`. Web routes keep Laravel's default rendering.

| Exception | Status | `message` | `errors` |
|---|---|---|---|
| `ValidationException` | 422 | validation summary | field → messages |
| `AuthenticationException` | 401 | "Unauthenticated." or a specific reason | null |
| `AuthorizationException`, Spatie `UnauthorizedException`, `abort(403)` | 403 | generic or app-written | null |
| `ModelNotFoundException`, unknown route | 404 | fixed text (never the model class) | null |
| `ThrottleRequestsException` | 429 | fixed text, `Retry-After` header kept | null |
| anything else | 500 | fixed text | null |

Stack traces, SQL, file paths and raw exception messages are **never**
returned, even when `APP_DEBUG=true`. They are still written to the log.

---

## 3. Authentication

Administrators are the only users who log in. Authentication uses
**Laravel Sanctum in SPA (cookie) mode**. There are no API tokens, and nothing
is stored in `localStorage`.

```
1. GET  /sanctum/csrf-cookie         → sets XSRF-TOKEN cookie
2. POST /api/v1/admin/auth/login     (X-XSRF-TOKEN header, credentials: include)
      → validates input (LoginRequest)
      → throttle: 5 failed attempts / minute per email+IP → 429
      → wrong email or password → 422 with one generic message
      → correct password but is_active = false → 403
      → session login, session ID regenerated, last_login_at updated
3. GET  /api/v1/admin/auth/me        → current admin (restores state after refresh)
4. POST /api/v1/admin/auth/logout    → session invalidated, CSRF token regenerated
```

- The `active` middleware (`EnsureAccountIsActive`) ends the session of an
  account that is deactivated while it is logged in. The next request gets a 401.
- The session cookie is HttpOnly. `Secure`, `SameSite` and the cookie domain
  come from `SESSION_SECURE_COOKIE`, `SESSION_SAME_SITE` and `SESSION_DOMAIN`.
- **Production requirement:** the web app and the API must share a registrable
  domain (e.g. `example.com` and `api.example.com`), with
  `SESSION_DOMAIN=.example.com`, `SESSION_SECURE_COOKIE=true` and
  `SANCTUM_STATEFUL_DOMAINS=example.com`.

---

## 4. Authorization (RBAC)

Implemented with `spatie/laravel-permission` (guard `web`). Role and
permission names are defined once, as PHP enums, in
`app/Modules/Authentication/Enums/`.

| Permission | Super Admin | Vehicle Manager | Reviewer | Enquiry Manager |
|---|:-:|:-:|:-:|:-:|
| `access-admin-dashboard` | ✓ | ✓ | ✓ | ✓ |
| `manage-users` | ✓ | | | |
| `manage-roles` | ✓ | | | |
| `manage-permissions` | ✓ | | | |
| `manage-vehicles` | ✓ | ✓ | | |
| `review-vehicle-listings` | ✓ | | ✓ | |
| `manage-enquiries` | ✓ | | | ✓ |
| `manage-website-content` | ✓ | | | |
| `manage-system-settings` | ✓ | | | |
| `view-audit-logs` | ✓ | | | |

Role slugs: `super-admin`, `vehicle-manager`, `reviewer`, `enquiry-manager`.

Rules:

- **The backend is authoritative.** Protect routes with
  `->middleware(AdminPermission::X->middleware())` and model actions with
  policies that call `$user->can(AdminPermission::X->value)`. Check
  permissions, not role names.
- The frontend receives `roles` and `permissions` from `/me` **only** to hide
  navigation the user cannot use.
- `RolesAndPermissionsSeeder` is idempotent: it creates any missing records and
  syncs each role to exactly the permissions in `AdminRole::permissions()`.
  It runs in every environment.
- Spatie caches permissions for 24 hours in the default cache store. The cache
  is cleared automatically when roles or permissions change through the
  package, and by the seeder.

---

## 5. Frontend (`web/`)

```
web/
├── app/
│   ├── app.vue                     title template, layout host
│   ├── assets/css/main.css         Tailwind 4 entry
│   ├── components/
│   │   ├── admin/AdminHeader.vue   user info + logout
│   │   ├── admin/AdminSidebar.vue  navigation, filtered by permission
│   │   ├── auth/LoginForm.vue      Vuelidate + server error display
│   │   └── ui/UiAlert.vue
│   ├── composables/useApi.ts       returns the shared $api client
│   ├── layouts/                    default (public), admin, auth
│   ├── middleware/admin-auth.global.ts  guards /admin/**
│   ├── pages/
│   │   ├── index.vue               public home (SSR placeholder)
│   │   └── admin/{index,login}.vue
│   ├── plugins/api.ts              $fetch client: credentials, XSRF, 401 handling
│   ├── stores/auth.ts              Pinia: user, initialized, login/logout/fetchUser
│   ├── types/api.ts                ApiEnvelope<T>, AdminUser, PaginationMeta
│   └── utils/                      ApiError/toApiError, admin route helpers
├── tests/                          Vitest (Nuxt environment, happy-dom)
├── nuxt.config.ts
└── vitest.config.ts
```

Rendering (`routeRules` in `nuxt.config.ts`):

- **Public pages** are server-rendered for SEO.
- **`/admin` and `/admin/**`** are client-only (`ssr: false`). The browser
  holds the Sanctum session cookie and talks to the API directly.

Admin route protection (`admin-auth.global.ts`):

1. Ignores non-admin paths.
2. On the first admin navigation it calls `/me` to restore the session (this is
   what makes a browser refresh keep you logged in).
3. Sends guests to `/admin/login?redirect=…`. Redirect targets are restricted to
   `/admin` paths to prevent open redirects.
4. Sends logged-in users away from the login page.

Any 401 from a non-auth endpoint clears the store and returns to the login page.

### Public website

The public site follows a premium-showroom design: black, white and muted
bronze, Montserrat for display type, Allura for the script heading and Inter
for body text. All fonts are self-hosted at build time by `@nuxt/fonts`.

| Route | Page |
|---|---|
| `/` | Hero, benefits bar, featured vehicles, about, why choose us, contact band |
| `/inventory` | Filterable, sortable grid. Filters live in the URL query (server-rendered, shareable) |
| `/inventory/:slug` | Gallery, price, key specs, description, features, condition, inspections, enquiry panel |
| `/about`, `/contact` | Static content and showroom contact details |

Design tokens are in `app/assets/css/main.css` (`@theme`). Components are
grouped by folder, and Nuxt prefixes each name with its folder:

| Folder | Contents |
|---|---|
| `site/` | Header, footer, logo, CSS showroom backdrop |
| `home/` | Homepage sections |
| `vehicle/` | Vehicle card, filters, gallery, inspections, enquiry panel |
| `ui/` | Button, badge, section heading, page hero, image, icon |

**Vehicle data is demonstration data.** `useVehicleCatalogue()` is the single
source of public vehicle data. It currently serves the labelled sample set in
`app/data/demo-vehicles.ts`, controlled by `runtimeConfig.public.demoCatalogue`
(env `NUXT_PUBLIC_DEMO_CATALOGUE`). Pages show a "Sample listings" note while
it is on. When the public vehicles API exists, only this composable changes.

**Contact.** Enquiry buttons use the showroom's own phone and WhatsApp number
from `runtimeConfig.public.contact`. The current values are **placeholders**:
set them through `NUXT_PUBLIC_CONTACT_PHONE`, `NUXT_PUBLIC_CONTACT_WHATSAPP`,
`NUXT_PUBLIC_CONTACT_EMAIL`, `NUXT_PUBLIC_CONTACT_ADDRESS` and
`NUXT_PUBLIC_CONTACT_HOURS`. Owner contact details are never shown publicly.

**Inspection claims** always show their source: declared by owner, recorded by
our team, or independent inspection. The "Verified" badge appears only for
independent inspections that have supporting evidence (`isVerifiedInspection`).

**Photos.** `<UiImage>` falls back to a styled placeholder (or a CSS showroom
backdrop in heroes) when a file is missing, so photos can be added by
dropping files into `web/public/images/` with no code changes:

| File | Size (ratio) | Used by |
|---|---|---|
| `hero.webp` | 2400×1350 (16:9) | Homepage hero |
| `showroom.webp` | 1600×1200 (4:3) | About section, About page |
| `inventory-hero.webp`, `about-hero.webp` | 2400×800 | Page banners |
| `vehicles/<slug>-1.webp` | 1600×760 (21:10) | Card and first gallery image |
| `vehicles/<slug>-2.webp`, `-3.webp` | 1600×1000 | Gallery |

---

## 6. Planned modules

**Not implemented.** No routes, tables or pages exist for these yet:

| Module | Responsibility |
|---|---|
| Dashboard | Admin summary figures |
| Owners | Vehicle owners managed by admins |
| Vehicles | Listings, makes/models, specifications, condition |
| VehicleFeatures | Feature catalogue and vehicle–feature links |
| VehicleInspections | Inspection records and private attachments, with the claim source (owner-declared / admin-recorded / independently verified) |
| Media | Image upload, validation, re-encoding, storage |
| Approvals | Submission, approval (which publishes automatically), rejection with reason, history, review of material changes |
| Enquiries | Customer enquiries and status history |
| WebsiteContent | About, Contact, Privacy pages and site settings |
| Terms | Versioned Terms and Conditions |
| AuditLogs | Append-only record of admin actions |

Still to be decided: how owner contact details appear publicly, and how long
enquiry data is kept.

---

## 7. Testing

| Suite | Tooling | Database / environment |
|---|---|---|
| API | PHPUnit 12 (`php artisan test`) | MySQL **`carshowcase_test`** only |
| Web | Vitest 5 + `@nuxt/test-utils` + Vue Test Utils + happy-dom | none (API mocked) |

Test database safety:

- `phpunit.xml` sets `APP_ENV`, `DB_CONNECTION` and `DB_DATABASE` as
  `<server>` variables. Laravel reads those before any `.env` file or
  container environment, so the Docker `env_file` cannot redirect tests to
  the development database.
- `tests/TestCase.php` refuses to boot unless the connection is MySQL and the
  database is `carshowcase_test`. This check runs before `RefreshDatabase`
  touches anything. SQLite is never used as a fallback.
- Test logging goes to the `null` channel.
- Routes needed only by tests (RBAC and error-rendering probes) are registered
  inside the test classes and never ship in the application.
