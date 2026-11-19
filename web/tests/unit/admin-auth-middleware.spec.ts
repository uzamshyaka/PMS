import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { RouteLocationNormalized } from 'vue-router'
import middleware from '~/middleware/admin-auth.global'

const { navigateToMock } = vi.hoisted(() => ({ navigateToMock: vi.fn((target: unknown) => target) }))
mockNuxtImport('navigateTo', () => navigateToMock)

function route(path: string, query: Record<string, string> = {}): RouteLocationNormalized {
  const search = new URLSearchParams(query).toString()
  return { path, query, fullPath: search ? `${path}?${search}` : path } as unknown as RouteLocationNormalized
}

const run = (to: RouteLocationNormalized) => middleware(to, to)

describe('admin-auth middleware', () => {
  let auth: ReturnType<typeof useAuthStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    navigateToMock.mockClear()
    auth = useAuthStore()
  })

  function loggedIn() {
    auth.user = { id: 1, name: 'A', email: 'a@example.com', last_login_at: null, roles: [], permissions: [] }
    auth.initialized = true
  }

  it('ignores public routes', async () => {
    const fetchUser = vi.spyOn(auth, 'fetchUser')

    expect(await run(route('/'))).toBeUndefined()
    expect(await run(route('/administrator-tips'))).toBeUndefined()
    expect(fetchUser).not.toHaveBeenCalled()
  })

  it('restores the session once before deciding', async () => {
    const fetchUser = vi.spyOn(auth, 'fetchUser').mockImplementation(async () => {
      loggedIn()
    })

    expect(await run(route('/admin'))).toBeUndefined()
    await run(route('/admin'))
    expect(fetchUser).toHaveBeenCalledTimes(1)
  })

  it('redirects guests to login and remembers where they were going', async () => {
    auth.initialized = true

    const result = await run(route('/admin/settings'))

    expect(navigateToMock).toHaveBeenCalledWith({ path: '/admin/login', query: { redirect: '/admin/settings' } })
    expect(result).toEqual({ path: '/admin/login', query: { redirect: '/admin/settings' } })
  })

  it('lets guests open the login page', async () => {
    auth.initialized = true

    expect(await run(route('/admin/login'))).toBeUndefined()
    expect(navigateToMock).not.toHaveBeenCalled()
  })

  it('sends authenticated users away from the login page', async () => {
    loggedIn()

    await run(route('/admin/login'))
    expect(navigateToMock).toHaveBeenLastCalledWith('/admin')

    await run(route('/admin/login', { redirect: '/admin/settings' }))
    expect(navigateToMock).toHaveBeenLastCalledWith('/admin/settings')
  })

  it('never redirects outside the admin area', async () => {
    loggedIn()

    await run(route('/admin/login', { redirect: '//evil.example.com/admin' }))
    expect(navigateToMock).toHaveBeenLastCalledWith('/admin')

    await run(route('/admin/login', { redirect: 'https://evil.example.com' }))
    expect(navigateToMock).toHaveBeenLastCalledWith('/admin')
  })
})
