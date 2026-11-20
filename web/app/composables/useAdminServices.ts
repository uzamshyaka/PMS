import type { AdminServices } from '~/services/contracts'
import { createAdminServices } from '~/services'

let services: AdminServices | null = null

/**
 * The admin data layer. Pages call this, never the API or mock data directly.
 * Source: runtimeConfig.public.adminDataSource ('api' by default, 'mock' for the prototype).
 */
export function useAdminServices(): AdminServices {
  if (!services) {
    const source = String(useRuntimeConfig().public.adminDataSource ?? 'api')
    const auth = useAuthStore()
    services = createAdminServices(source, () => auth.user?.name ?? 'Unknown user', useApi())
  }
  return services
}
