import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AdminUser } from '~/types/api'

const { apiMock } = vi.hoisted(() => ({ apiMock: vi.fn() }))
mockNuxtImport('useApi', () => () => apiMock)

const admin: AdminUser = {
  id: 1,
  name: 'Ada',
  email: 'ada@example.com',
  last_login_at: null,
  roles: ['reviewer'],
  permissions: ['access-admin-dashboard', 'review-vehicle-listings'],
}

const envelope = (data: unknown) => ({ success: true, message: 'OK', data, meta: null, errors: null })
const fetchError = (status: number, data: Record<string, unknown> = {}) => Object.assign(new Error('fetch'), { status, data })

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    apiMock.mockReset()
  })

  it('requests the CSRF cookie before logging in, then stores the user', async () => {
    apiMock.mockResolvedValueOnce(undefined).mockResolvedValueOnce(envelope(admin))
    const auth = useAuthStore()

    await auth.login({ email: 'ada@example.com', password: 'secret' })

    expect(apiMock).toHaveBeenNthCalledWith(1, '/sanctum/csrf-cookie')
    expect(apiMock).toHaveBeenNthCalledWith(2, '/api/v1/admin/auth/login', {
      method: 'POST',
      body: { email: 'ada@example.com', password: 'secret' },
    })
    expect(auth.isAuthenticated).toBe(true)
    expect(auth.user?.email).toBe('ada@example.com')
    expect(auth.loading).toBe(false)
  })

  it('exposes the API message and field errors when login fails', async () => {
    apiMock
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(fetchError(422, { message: 'Invalid.', errors: { email: ['These credentials do not match our records.'] } }))
    const auth = useAuthStore()

    const error = await auth.login({ email: 'x@example.com', password: 'bad' }).catch((e) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(422)
    expect(error.firstError('email')).toBe('These credentials do not match our records.')
    expect(auth.error).toBe('Invalid.')
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.loading).toBe(false)
  })

  it('restores the session from /me after a refresh', async () => {
    apiMock.mockResolvedValueOnce(envelope(admin))
    const auth = useAuthStore()

    await auth.fetchUser()

    expect(apiMock).toHaveBeenCalledWith('/api/v1/admin/auth/me')
    expect(auth.initialized).toBe(true)
    expect(auth.isAuthenticated).toBe(true)
  })

  it('treats a 401 from /me as logged out without showing an error', async () => {
    apiMock.mockRejectedValueOnce(fetchError(401, { message: 'Unauthenticated.' }))
    const auth = useAuthStore()

    await auth.fetchUser()

    expect(auth.initialized).toBe(true)
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.error).toBeNull()
  })

  it('clears local state on logout even if the server call fails', async () => {
    apiMock.mockResolvedValueOnce(envelope(admin)).mockRejectedValueOnce(fetchError(500))
    const auth = useAuthStore()
    await auth.fetchUser()

    await auth.logout()

    expect(apiMock).toHaveBeenLastCalledWith('/api/v1/admin/auth/logout', { method: 'POST' })
    expect(auth.user).toBeNull()
  })

  it('checks permissions from the loaded user', async () => {
    apiMock.mockResolvedValueOnce(envelope(admin))
    const auth = useAuthStore()
    expect(auth.can('review-vehicle-listings')).toBe(false)

    await auth.fetchUser()

    expect(auth.can('review-vehicle-listings')).toBe(true)
    expect(auth.can('manage-users')).toBe(false)
  })
})
