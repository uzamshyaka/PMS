/** Envelope returned by every Laravel API endpoint. */
export interface ApiEnvelope<T = unknown> {
  success: boolean
  message: string
  data: T
  meta: Record<string, unknown> | null
  errors: ApiFieldErrors | null
}

/** Laravel validation errors keyed by field name. */
export type ApiFieldErrors = Record<string, string[]>

export interface PaginationMeta {
  current_page: number
  per_page: number
  total: number
  last_page: number
  from: number | null
  to: number | null
}

export interface AdminUser {
  id: number
  name: string
  email: string
  last_login_at: string | null
  roles: string[]
  permissions: string[]
}

export interface LoginCredentials {
  email: string
  password: string
  remember?: boolean
}
