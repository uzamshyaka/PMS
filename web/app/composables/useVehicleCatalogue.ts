import type { PaginationMeta } from '~/types/api'
import { DEMO_VEHICLES } from '~/data/demo-vehicles'
import type { ApiEnvelope } from '~/types/api'
import type { ListingType, PublicVehicle, VehicleQuery } from '~/types/vehicle'

export interface CatalogueFacets {
  makes: string[]
  modelsByMake: Record<string, string[]>
  locations: string[]
}

export interface CataloguePage {
  items: PublicVehicle[]
  meta: PaginationMeta
}

const PUBLIC = '/api/v1/public'

/**
 * Single entry point for public vehicle data, used by the homepage, the
 * inventory and the details page.
 *  - Default: the Laravel public API (published listings only).
 *  - runtimeConfig.public.demoCatalogue = true: the labelled sample data set
 *    (used by the automated layout tests).
 */
export function useVehicleCatalogue() {
  const isDemo = useRuntimeConfig().public.demoCatalogue === true
  const api = useApi()

  async function search(query: VehicleQuery, perPage = VEHICLES_PER_PAGE): Promise<CataloguePage> {
    if (isDemo) return paginate(sortVehicles(filterVehicles(DEMO_VEHICLES, query), query.sort), query.page, perPage)

    const res = await api<ApiEnvelope<PublicVehicle[]>>(`${PUBLIC}/vehicles`, { query: { ...toRouteQuery(query), page: query.page ?? 1, per_page: perPage } })
    return { items: res.data, meta: (res.meta as { pagination: PaginationMeta }).pagination }
  }

  /** Homepage rows: the vehicles chosen under Website → Homepage, else the newest. */
  async function featured(limit: number, type?: ListingType): Promise<PublicVehicle[]> {
    if (isDemo) return sortVehicles(DEMO_VEHICLES.filter((v) => v.featured && (!type || v.listingType === type)), 'newest').slice(0, limit)

    const res = await api<ApiEnvelope<PublicVehicle[]>>(`${PUBLIC}/vehicles`, { query: { featured: 1, type, per_page: limit } })
    return res.data
  }

  async function findBySlug(slug: string): Promise<PublicVehicle | null> {
    if (isDemo) return DEMO_VEHICLES.find((v) => v.slug === slug) ?? null
    try {
      return (await api<ApiEnvelope<PublicVehicle>>(`${PUBLIC}/vehicles/${encodeURIComponent(slug)}`)).data
    }
    catch (e) {
      if (toApiError(e).status === 404) return null
      throw e
    }
  }

  /** Filter options from what is actually listed. */
  async function facets(): Promise<CatalogueFacets> {
    if (isDemo) {
      const makes = [...new Set(DEMO_VEHICLES.map((v) => v.make))].sort()
      return {
        makes,
        modelsByMake: Object.fromEntries(makes.map((m) => [m, [...new Set(DEMO_VEHICLES.filter((v) => v.make === m).map((v) => v.model))].sort()])),
        locations: [...new Set(DEMO_VEHICLES.map((v) => v.location))].sort(),
      }
    }
    return (await api<ApiEnvelope<CatalogueFacets>>(`${PUBLIC}/vehicles/facets`)).data
  }

  return { isDemo, search, featured, findBySlug, facets }
}
