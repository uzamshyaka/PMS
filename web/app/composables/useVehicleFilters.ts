import type { VehicleQuery } from '~/types/vehicle'

/**
 * Inventory filters stored in the URL so results are shareable and server-rendered.
 */
export function useVehicleFilters() {
  const route = useRoute()
  const query = computed(() => parseVehicleQuery(route.query))

  const activeCount = computed(() =>
    Object.entries(query.value).filter(([key, value]) => key !== 'sort' && key !== 'page' && value !== undefined).length,
  )

  function update(patch: Partial<VehicleQuery>) {
    // Changing a filter or the sort order starts again from page 1.
    const next: VehicleQuery = { ...query.value, page: undefined, ...patch }
    // A model belongs to a make: clear it when the make changes.
    if ('make' in patch && patch.make !== query.value.make) next.model = undefined
    return navigateTo({ path: route.path, query: toRouteQuery(next) }, { replace: true })
  }

  function reset() {
    return navigateTo({ path: route.path, query: toRouteQuery({ sort: query.value.sort }) }, { replace: true })
  }

  return { query, activeCount, update, reset }
}
