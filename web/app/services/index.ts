import { type ApiClient, createApiServices } from '~/services/api'
import type { AdminServices } from '~/services/contracts'
import { createAuditService, createCatalogueService, createContentService, createEnquiryService, createNotificationService, createOwnerService, createUserService } from '~/services/mock/others'
import { createVehicleService } from '~/services/mock/vehicles'

/**
 * Build the admin services for a data source:
 *  - 'api'  : the Laravel API (default)
 *  - 'mock' : in-memory prototype data (tests, demos)
 */
export function createAdminServices(source: string, actor: () => string, api?: ApiClient): AdminServices {
  if (source === 'api') {
    if (!api) throw new Error('The API data source needs an API client.')
    return createApiServices(api)
  }
  if (source !== 'mock') {
    throw new Error(`Unknown admin data source "${source}". Use "api" or "mock".`)
  }
  return {
    vehicles: createVehicleService(actor),
    owners: createOwnerService(actor),
    enquiries: createEnquiryService(actor),
    catalogue: createCatalogueService(actor),
    users: createUserService(actor),
    content: createContentService(actor),
    audit: createAuditService(),
    notifications: createNotificationService(),
  }
}
