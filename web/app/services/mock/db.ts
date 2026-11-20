/**
 * In-memory mock database for the admin prototype. Seeded from data/admin,
 * shared by all mock services, and reset on every page reload: nothing is
 * persisted.
 */
import { FEATURE_CATEGORIES, MOCK_FEATURES, MOCK_MAKES, MOCK_MODELS } from '~/data/admin/catalogue'
import { MOCK_AUDIT_LOGS, MOCK_CONTENT, MOCK_ENQUIRIES } from '~/data/admin/operations'
import { MOCK_OWNERS, MOCK_USERS } from '~/data/admin/people'
import { MOCK_REVIEWS, MOCK_VEHICLES } from '~/data/admin/vehicles'
import type { AuditLog, ListQuery, Paginated } from '~/types/admin'
import { paginate } from '~/utils/vehicle-query'

function seed() {
  return structuredClone({
    makes: MOCK_MAKES,
    models: MOCK_MODELS,
    features: MOCK_FEATURES,
    owners: MOCK_OWNERS,
    users: MOCK_USERS,
    vehicles: MOCK_VEHICLES,
    reviews: MOCK_REVIEWS,
    enquiries: MOCK_ENQUIRIES,
    audit: MOCK_AUDIT_LOGS,
    content: MOCK_CONTENT,
  })
}

export type MockDb = ReturnType<typeof seed>

export let db: MockDb = seed()

/** Restore the seed data (used by tests). */
export function resetMockDb() {
  db = seed()
}

export { FEATURE_CATEGORIES }

/** Simulated network latency so loading states are exercised. Zero in tests. */
export const delay = (ms = import.meta.env?.MODE === 'test' ? 0 : 180) => new Promise((r) => setTimeout(r, ms))

export const clone = <T>(value: T): T => structuredClone(value)

export const nextId = (rows: { id: number }[]) => rows.reduce((max, r) => Math.max(max, r.id), 0) + 1

export const now = () => new Date().toISOString()

export function notFound(what: string): never {
  throw Object.assign(new Error(`${what} not found`), { status: 404, data: { message: `${what} not found.` } })
}

export function invalid(message: string, errors: Record<string, string[]> = {}): never {
  throw Object.assign(new Error(message), { status: 422, data: { message, errors } })
}

export function audit(actor: string, action: string, module: string, entity: string, details: string) {
  const entry: AuditLog = { id: nextId(db.audit), at: now(), userName: actor, action, module, entity, details }
  db.audit.unshift(entry)
}

interface ListOptions<T> {
  search: (item: T) => string
  status?: (item: T) => string
  filters?: Record<string, (item: T, value: string) => boolean>
  sorts: Record<string, (a: T, b: T) => number>
  defaultSort: string
}

/**
 * Search, filter, sort and paginate like the future API will: `sort` is a
 * column key, prefixed with "-" for descending.
 */
export function listItems<T>(items: T[], q: ListQuery, opts: ListOptions<T>): Paginated<T> {
  const term = q.search?.toLowerCase().trim()
  let rows = items.filter((item) =>
    (!term || opts.search(item).toLowerCase().includes(term))
    && (!q.status || !opts.status || opts.status(item) === q.status)
    && Object.entries(q.filters).every(([key, value]) => !value || !opts.filters?.[key] || opts.filters[key](item, value)),
  )

  const sort = q.sort && opts.sorts[q.sort.replace(/^-/, '')] ? q.sort : opts.defaultSort
  const compare = opts.sorts[sort.replace(/^-/, '')]!
  rows = [...rows].sort((a, b) => (sort.startsWith('-') ? compare(b, a) : compare(a, b)))

  return paginate(rows, q.page, q.perPage ?? 10)
}
