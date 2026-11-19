export const ADMIN_HOME_PATH = '/admin'
export const ADMIN_LOGIN_PATH = '/admin/login'

export function isAdminPath(path: string): boolean {
  return path === ADMIN_HOME_PATH || path.startsWith(`${ADMIN_HOME_PATH}/`)
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
