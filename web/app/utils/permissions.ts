/**
 * Permission names, mirroring api/app/Modules/Authentication/Enums/AdminPermission.php.
 * The frontend uses them only to show/hide navigation; the API enforces them.
 */
export const PERMISSIONS = {
  dashboard: 'access-admin-dashboard',
  users: 'manage-users',
  roles: 'manage-roles',
  permissions: 'manage-permissions',
  vehicles: 'manage-vehicles',
  reviews: 'review-vehicle-listings',
  enquiries: 'manage-enquiries',
  website: 'manage-website-content',
  settings: 'manage-system-settings',
  audit: 'view-audit-logs',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

export const PERMISSION_LABELS: Record<Permission, string> = {
  'access-admin-dashboard': 'Access admin dashboard',
  'manage-users': 'Manage users',
  'manage-roles': 'Manage roles',
  'manage-permissions': 'Manage permissions',
  'manage-vehicles': 'Manage vehicles, owners & catalogue',
  'review-vehicle-listings': 'Review vehicle listings',
  'manage-enquiries': 'Manage enquiries',
  'manage-website-content': 'Manage website content',
  'manage-system-settings': 'Manage system settings',
  'view-audit-logs': 'View audit logs',
}

/** Mirrors api/app/Modules/Authentication/Enums/AdminRole.php (seeded by RolesAndPermissionsSeeder). */
export const ROLE_DEFINITIONS: { name: string, label: string, description: string, permissions: Permission[] }[] = [
  {
    name: 'super-admin',
    label: 'Super Admin',
    description: 'Full access to every module, user and setting.',
    permissions: Object.values(PERMISSIONS),
  },
  {
    name: 'vehicle-manager',
    label: 'Vehicle Manager',
    description: 'Creates and maintains vehicles, owners and the vehicle catalogue.',
    permissions: [PERMISSIONS.dashboard, PERMISSIONS.vehicles],
  },
  {
    name: 'reviewer',
    label: 'Reviewer',
    description: 'Approves or rejects submitted vehicle listings.',
    permissions: [PERMISSIONS.dashboard, PERMISSIONS.reviews],
  },
  {
    name: 'enquiry-manager',
    label: 'Enquiry Manager',
    description: 'Handles customer enquiries and follow-ups.',
    permissions: [PERMISSIONS.dashboard, PERMISSIONS.enquiries],
  },
]
