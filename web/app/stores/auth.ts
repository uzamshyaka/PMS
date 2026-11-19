import { defineStore } from 'pinia'
import type { AdminUser, ApiEnvelope, LoginCredentials } from '~/types/api'

const ENDPOINTS = {
  csrf: '/sanctum/csrf-cookie',
  login: '/api/v1/admin/auth/login',
  logout: '/api/v1/admin/auth/logout',
  me: '/api/v1/admin/auth/me',
} as const

/**
 * Admin session state. The session itself lives in Laravel's HttpOnly cookie;
 * this store only mirrors who is logged in so the UI can render. The API
 * enforces every permission regardless of what this store says.
 */
export const useAuthStore = defineStore('auth', () => {
  const user = ref<AdminUser | null>(null)
  /** True once the session has been checked at least once (e.g. after a refresh). */
  const initialized = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => user.value !== null)

  function can(permission: string): boolean {
    return user.value?.permissions.includes(permission) ?? false
  }

  /** Restore the session from the cookie. A 401 simply means "not logged in". */
  async function fetchUser(): Promise<void> {
    try {
      const response = await useApi()<ApiEnvelope<AdminUser>>(ENDPOINTS.me)
      user.value = response.data
    } catch (e) {
      const apiError = toApiError(e)
      user.value = null
      error.value = apiError.status === 401 ? null : apiError.message
    } finally {
      initialized.value = true
    }
  }

  async function login(credentials: LoginCredentials): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const api = useApi()
      await api(ENDPOINTS.csrf)
      const response = await api<ApiEnvelope<AdminUser>>(ENDPOINTS.login, {
        method: 'POST',
        body: credentials,
      })
      user.value = response.data
      initialized.value = true
    } catch (e) {
      const apiError = toApiError(e)
      error.value = apiError.message
      throw apiError
    } finally {
      loading.value = false
    }
  }

  async function logout(): Promise<void> {
    loading.value = true
    try {
      await useApi()(ENDPOINTS.logout, { method: 'POST' })
    } catch {
      // Already logged out server-side (e.g. expired session): clear locally anyway.
    } finally {
      clear()
      loading.value = false
    }
  }

  function clear(): void {
    user.value = null
    error.value = null
    initialized.value = true
  }

  return { user, initialized, loading, error, isAuthenticated, can, fetchUser, login, logout, clear }
})
