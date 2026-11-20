declare module '#app' {
  interface PageMeta {
    /** Permission needed to open an admin page (UX guard; the API enforces access). */
    permission?: string
    /** Page title shown in the admin header. */
    title?: string
    /** Parent breadcrumb, e.g. { label: 'Vehicles', to: '/admin/vehicles' }. */
    section?: { label: string, to: string }
  }
}

export {}
