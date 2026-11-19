import { DEMO_VEHICLES } from '~/data/demo-vehicles'
import type { ListingType, PublicVehicle, VehicleQuery } from '~/types/vehicle'

/**
 * Single entry point for public vehicle data. Today it serves the labelled
 * demonstration data set; when the public API exists, only this composable
 * changes (to call /api/v1/public/vehicles) and the pages stay the same.
 */
export function useVehicleCatalogue() {
  const isDemo = useRuntimeConfig().public.demoCatalogue === true
  const vehicles: readonly PublicVehicle[] = isDemo ? DEMO_VEHICLES : []

  const makes = [...new Set(vehicles.map((v) => v.make))].sort()
  const locations = [...new Set(vehicles.map((v) => v.location))].sort()

  function modelsFor(make?: string): string[] {
    return [...new Set(vehicles.filter((v) => !make || v.make === make).map((v) => v.model))].sort()
  }

  function search(query: VehicleQuery): PublicVehicle[] {
    return sortVehicles(filterVehicles(vehicles, query), query.sort)
  }

  function featured(limit = 4, type?: ListingType): PublicVehicle[] {
    return sortVehicles(vehicles.filter((v) => v.featured && (!type || v.listingType === type)), 'newest').slice(0, limit)
  }

  function findBySlug(slug: string): PublicVehicle | undefined {
    return vehicles.find((v) => v.slug === slug)
  }

  return { isDemo, total: vehicles.length, makes, locations, modelsFor, search, featured, findBySlug }
}
