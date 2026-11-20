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

  if (to.path === ADMIN_ROOT) {
    return navigateTo(ADMIN_HOME_PATH)
  }

  // Pages declare the permission they need via definePageMeta({ permission }).
  const required = to.meta.permission
  if (auth.isAuthenticated && required && !auth.can(required) && to.path !== ADMIN_FORBIDDEN_PATH) {
    return navigateTo({ path: ADMIN_FORBIDDEN_PATH, query: { from: to.fullPath } })
  }
})
