/**
 * Shared API client ($api). Sends the Sanctum session cookie with every
 * request and echoes the XSRF-TOKEN cookie back as the X-XSRF-TOKEN header.
 * No credentials or tokens are ever stored in localStorage.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  const api = $fetch.create({
    baseURL: config.public.apiBase,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },

    onRequest({ options }) {
      if (!import.meta.client) return

      const token = readCookie('XSRF-TOKEN')
      if (token) {
        const headers = new Headers(options.headers)
        headers.set('X-XSRF-TOKEN', token)
        options.headers = headers
      }
    },

    // A 401 on any non-auth endpoint means the session ended (expired or the
    // account was deactivated): clear local state and send the user to login.
    async onResponseError({ request, response }) {
      if (!import.meta.client || response.status !== 401 || String(request).includes('/auth/')) return

      await nuxtApp.runWithContext(() => {
        useAuthStore().clear()
        return navigateTo({ path: ADMIN_LOGIN_PATH, query: { redirect: useRoute().fullPath } })
      })
    },
  })

  return { provide: { api } }
})

function readCookie(name: string): string | null {
  const match = document.cookie.split('; ').find((row) => row.startsWith(`${name}=`))
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null
}
