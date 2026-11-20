import type { LocationQuery } from 'vue-router'
import type { ListQuery, Paginated } from '~/types/admin'

const one = (v: LocationQuery[string] | undefined) => {
  const value = Array.isArray(v) ? v[0] : v
  return typeof value === 'string' && value !== '' ? value : undefined
}

/**
 * Admin list state kept in the URL (?search=&status=&sort=&page=&<filters>),
 * so lists are bookmarkable and survive refresh. Loads through `load` and
 * reloads whenever the query changes.
 */
export function useAdminList<T>(key: string, load: (query: ListQuery) => Promise<Paginated<T>>, filterKeys: string[] = [], perPage = 10) {
  const route = useRoute()

  const query = computed<ListQuery>(() => ({
    search: one(route.query.search),
    status: one(route.query.status),
    sort: one(route.query.sort),
    page: Math.max(1, Number(one(route.query.page)) || 1),
    perPage,
    filters: Object.fromEntries(filterKeys.map((k) => [k, one(route.query[k])])),
  }))

  const { data, status, error, refresh } = useAsyncData(key, () => load(query.value), {
    watch: [query],
    server: false,
  })

  /** Update list state; any change other than `page` returns to page 1. */
  function update(patch: Record<string, string | number | undefined>) {
    const next: Record<string, string> = {}
    const merged = { ...route.query, ...('page' in patch ? {} : { page: undefined }), ...patch }
    for (const [k, v] of Object.entries(merged)) {
      if (v !== undefined && v !== null && v !== '' && !(k === 'page' && Number(v) <= 1)) next[k] = String(v)
    }
    return navigateTo({ path: route.path, query: next }, { replace: true })
  }

  function toggleSort(column: string) {
    const current = query.value.sort
    return update({ sort: current === column ? `-${column}` : column })
  }

  const routeQuery = computed(() => ({ ...route.query }))
  const pending = computed(() => status.value === 'pending')

  return { query, data, pending, error, refresh, update, toggleSort, routeQuery }
}
