/**
 * Laravel implementation of the admin service contracts (/api/v1/admin/*).
 * Same shapes as the mock implementation, so pages do not change.
 * Errors propagate as fetch errors; pages convert them with toApiError().
 */
import type { useApi } from '~/composables/useApi'
import type { AdminServices } from '~/services/contracts'
import type { ApiEnvelope, PaginationMeta } from '~/types/api'
import type {
  AdminUserRecord, AdminVehicle, AdminVehicleRow, AuditLog, ContentValues, Enquiry, EnquiryRow, ListQuery, Notification,
  Owner, OwnerRow, Paginated, RoleSummary, VehicleFeature, VehicleImage, VehicleInput, VehicleMake, VehicleModel,
  VehicleReview, VehicleStats,
} from '~/types/admin'
import { ROLE_DEFINITIONS } from '~/utils/permissions'

const BASE = '/api/v1/admin'

/** ListQuery -> URL query (?search=&status=&sort=&page=&per_page=&<filters>). */
function toQuery(q: ListQuery): Record<string, string | number> {
  const out: Record<string, string | number> = { page: q.page }
  if (q.perPage) out.per_page = q.perPage
  if (q.search) out.search = q.search
  if (q.status) out.status = q.status
  if (q.sort) out.sort = q.sort
  for (const [k, v] of Object.entries(q.filters)) if (v) out[k] = v
  return out
}

/** Only the fields the API needs for photos: id, order (array position) and primary flag. */
function vehicleBody(input: VehicleInput, intent: string) {
  return { ...input, intent, images: input.images.map((i: VehicleImage) => ({ id: i.id, isPrimary: i.isPrimary })) }
}

export type ApiClient = ReturnType<typeof useApi>

export function createApiServices(api: ApiClient): AdminServices {
  const get = async <T>(path: string, query?: Record<string, string | number>) => (await api<ApiEnvelope<T>>(`${BASE}${path}`, { query })).data
  const send = async <T>(method: 'POST' | 'PUT' | 'PATCH', path: string, body?: unknown) => (await api<ApiEnvelope<T>>(`${BASE}${path}`, { method, body: body as Record<string, unknown> })).data
  const page = async <T>(path: string, q: ListQuery): Promise<Paginated<T>> => {
    const res = await api<ApiEnvelope<T[]>>(`${BASE}${path}`, { query: toQuery(q) })
    return { items: res.data, meta: (res.meta as { pagination: PaginationMeta }).pagination }
  }

  return {
    vehicles: {
      list: (q) => page<AdminVehicleRow>('/vehicles', q),
      get: (id) => get<AdminVehicleRow>(`/vehicles/${id}`),
      create: (input, intent) => send<AdminVehicle>('POST', '/vehicles', vehicleBody(input, intent)),
      update: (id, input, intent) => send<AdminVehicle>('PUT', `/vehicles/${id}`, vehicleBody(input, intent)),
      transition: (id, action, reason) => send<AdminVehicle>('POST', `/vehicles/${id}/transitions`, { action, reason }),
      statusCounts: () => get<Record<string, number>>('/vehicles/status-counts'),
      stats: () => get<VehicleStats>('/dashboard/stats'),
      recent: (limit) => get<AdminVehicleRow[]>('/vehicles/recent', { limit }),
      reviews: (id) => get<VehicleReview[]>(`/vehicles/${id}/reviews`),
      activity: (id) => get<AuditLog[]>(`/vehicles/${id}/activity`),
      uploadImages: (files) => {
        const form = new FormData()
        files.forEach((f) => form.append('files[]', f))
        return send<VehicleImage[]>('POST', '/vehicle-images', form)
      },
    },
    owners: {
      list: (q) => page<OwnerRow>('/owners', q),
      all: () => get<Owner[]>('/owners/options'),
      get: (id) => get<OwnerRow>(`/owners/${id}`),
      create: (input) => send<Owner>('POST', '/owners', input),
      update: (id, input) => send<Owner>('PUT', `/owners/${id}`, input),
      setStatus: (id, status) => send<Owner>('PATCH', `/owners/${id}/status`, { status }),
      vehicles: (id) => get<AdminVehicleRow[]>(`/owners/${id}/vehicles`),
      activity: (id) => get<AuditLog[]>(`/owners/${id}/activity`),
    },
    enquiries: {
      list: (q) => page<EnquiryRow>('/enquiries', q),
      get: (id) => get<EnquiryRow>(`/enquiries/${id}`),
      updateStatus: (id, status, note) => send<Enquiry>('PATCH', `/enquiries/${id}/status`, { status, note }),
      assign: (id, userId) => send<Enquiry>('PATCH', `/enquiries/${id}/assignee`, { userId }),
      addNote: (id, body) => send<Enquiry>('POST', `/enquiries/${id}/notes`, { body }),
      statusCounts: () => get<Record<string, number>>('/enquiries/status-counts'),
      recent: (limit) => get<EnquiryRow[]>('/enquiries/recent', { limit }),
      assignees: () => get<{ id: number, name: string }[]>('/enquiries/assignees'),
    },
    catalogue: {
      makes: () => get<VehicleMake[]>('/catalogue/makes'),
      models: () => get<VehicleModel[]>('/catalogue/models'),
      features: () => get<VehicleFeature[]>('/catalogue/features'),
      save: (kind, item) => (item.id ? send('PUT', `/catalogue/${kind}/${item.id}`, item) : send('POST', `/catalogue/${kind}`, item)),
      setActive: async (kind, id, isActive) => { await send('PATCH', `/catalogue/${kind}/${id}/active`, { isActive }) },
    },
    users: {
      list: (q) => page<AdminUserRecord>('/users', q),
      all: async () => (await page<AdminUserRecord>('/users', { page: 1, perPage: 100, filters: {} })).items,
      get: (id) => get<AdminUserRecord>(`/users/${id}`),
      create: (input) => send<AdminUserRecord>('POST', '/users', input),
      update: (id, input) => send<AdminUserRecord>('PUT', `/users/${id}`, input),
      roles: async () => (await get<Omit<RoleSummary, 'description'>[]>('/roles')).map((r) => ({
        ...r, description: ROLE_DEFINITIONS.find((d) => d.name === r.name)?.description ?? '',
      })),
      activity: (id) => get<AuditLog[]>(`/users/${id}/activity`),
    },
    content: {
      get: (section) => get<ContentValues>(`/content/${section}`),
      save: (section, values) => send<ContentValues>('PUT', `/content/${section}`, values),
      uploadImage: async (file) => {
        const form = new FormData()
        form.append('file', file)
        return (await send<{ url: string }>('POST', '/content-images', form)).url
      },
    },
    audit: {
      list: (q) => page<AuditLog>('/audit-logs', q),
      facets: () => get<{ users: string[], actions: string[], modules: string[] }>('/audit-logs/facets'),
    },
    // The server already filters notifications by the user's permissions.
    notifications: { list: () => get<Notification[]>('/notifications') },
  }
}
