import type { ApiEnvelope, ApiFieldErrors } from '~/types/api'

const FALLBACK_MESSAGE = 'Unable to reach the server. Please check your connection and try again.'

/** A normalized API failure: HTTP status, user-safe message and field errors. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly errors: ApiFieldErrors = {},
  ) {
    super(message)
    this.name = 'ApiError'
  }

  firstError(field: string): string | undefined {
    return this.errors[field]?.[0]
  }
}

interface FetchErrorLike {
  status?: number
  statusCode?: number
  data?: Partial<ApiEnvelope> | null
}

/** Convert anything thrown by $fetch into an ApiError. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error

  const e = (error ?? {}) as FetchErrorLike
  const status = e.status ?? e.statusCode ?? 0
  const message = e.data?.message || FALLBACK_MESSAGE

  return new ApiError(message, status, e.data?.errors ?? {})
}
