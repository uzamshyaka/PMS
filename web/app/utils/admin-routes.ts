export const ADMIN_ROOT = '/admin'
export const ADMIN_HOME_PATH = '/admin/dashboard'
export const ADMIN_LOGIN_PATH = '/admin/login'
export const ADMIN_FORBIDDEN_PATH = '/admin/forbidden'

export function isAdminPath(path: string): boolean {
  return path === ADMIN_ROOT || path.startsWith(`${ADMIN_ROOT}/`)
}

/**
 * Only follow ?redirect= targets inside the admin area, so the login page
 * cannot be used as an open redirect.
 */
export function safeAdminRedirect(target: unknown): string {
  if (typeof target !== 'string' || target.startsWith('//') || !isAdminPath(target.split(/[?#]/)[0] ?? '')) {
    return ADMIN_HOME_PATH
  }
  return target === ADMIN_LOGIN_PATH ? ADMIN_HOME_PATH : target
}

/** "vehicle-manager" -> "Vehicle Manager" */
export function formatRole(role: string): string {
  return role
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
