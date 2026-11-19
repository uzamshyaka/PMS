/**
 * Guards every /admin route. Runs in the browser only (admin pages are
 * client-rendered). This is a UX guard: the API independently rejects
 * unauthenticated or unauthorized requests.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server || !isAdminPath(to.path)) return

  const auth = useAuthStore()

  // After a browser refresh the store is empty: restore it from the session cookie.
  if (!auth.initialized) {
    await auth.fetchUser()
  }

  const onLoginPage = to.path === ADMIN_LOGIN_PATH

  if (!auth.isAuthenticated && !onLoginPage) {
    return navigateTo({ path: ADMIN_LOGIN_PATH, query: { redirect: to.fullPath } })
  }

  if (auth.isAuthenticated && onLoginPage) {
    return navigateTo(safeAdminRedirect(to.query.redirect))
  }
})
