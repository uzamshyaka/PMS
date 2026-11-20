import type { IconName } from '~/utils/icons'

export interface AdminNavItem {
  label: string
  to: string
  icon: IconName
  permission: string
  children?: { label: string, to: string, permission?: string }[]
}

/**
 * Sidebar structure. Visibility follows permissions (UX only; the API enforces
 * access). Each page also declares its own `permission` in definePageMeta.
 */
export const ADMIN_NAV: { heading: string, items: AdminNavItem[] }[] = [
  {
    heading: 'Main menu',
    items: [
      { label: 'Dashboard', to: '/admin/dashboard', icon: 'grid', permission: PERMISSIONS.dashboard },
      { label: 'Vehicles', to: '/admin/vehicles', icon: 'car', permission: PERMISSIONS.vehicles },
      { label: 'Owners', to: '/admin/owners', icon: 'users', permission: PERMISSIONS.vehicles },
      { label: 'Listing Reviews', to: '/admin/reviews', icon: 'shield', permission: PERMISSIONS.reviews },
      { label: 'Enquiries', to: '/admin/enquiries', icon: 'inbox', permission: PERMISSIONS.enquiries },
    ],
  },
  {
    heading: 'Management',
    items: [
      {
        label: 'Vehicle Catalogue',
        to: '/admin/catalogue',
        icon: 'tag',
        permission: PERMISSIONS.vehicles,
        children: [
          { label: 'Makes', to: '/admin/catalogue/makes' },
          { label: 'Models', to: '/admin/catalogue/models' },
          { label: 'Features', to: '/admin/catalogue/features' },
        ],
      },
      {
        label: 'Website Management',
        to: '/admin/website',
        icon: 'globe',
        permission: PERMISSIONS.website,
        children: [
          { label: 'Homepage', to: '/admin/website/homepage' },
          { label: 'About page', to: '/admin/website/about' },
          { label: 'Contact details', to: '/admin/website/contact' },
          { label: 'Branding', to: '/admin/website/branding' },
          { label: 'SEO', to: '/admin/website/seo' },
        ],
      },
      {
        label: 'Users & Roles',
        to: '/admin/users',
        icon: 'key',
        permission: PERMISSIONS.users,
        children: [
          { label: 'Users', to: '/admin/users' },
          { label: 'Roles', to: '/admin/roles', permission: PERMISSIONS.roles },
        ],
      },
      { label: 'Settings', to: '/admin/settings', icon: 'cog', permission: PERMISSIONS.settings },
      { label: 'Audit Logs', to: '/admin/audit-logs', icon: 'history', permission: PERMISSIONS.audit },
    ],
  },
]

/** Navigation filtered to what `can` allows; empty groups are dropped. */
export function visibleAdminNav(can: (permission: string) => boolean) {
  return ADMIN_NAV
    .map((group) => ({
      ...group,
      items: group.items
        .filter((item) => can(item.permission))
        .map((item) => ({ ...item, children: item.children?.filter((c) => can(c.permission ?? item.permission)) })),
    }))
    .filter((group) => group.items.length)
}
