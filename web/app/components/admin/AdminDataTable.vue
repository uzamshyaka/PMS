<script setup lang="ts" generic="T extends { id: number | string }">
import type { AdminColumn } from '~/types/admin-ui'
/**
 * Generic admin table. Columns are declared by the page; cells can be
 * customised with `#cell-<key>="{ row }"` slots. Sorting is URL-driven via the
 * `sort` prop ("key" or "-key") and `sort` event. Loading, error and empty
 * states are built in.
 */

const props = defineProps<{
  columns: AdminColumn[]
  rows: T[] | null | undefined
  sort?: string
  loading?: boolean
  error?: unknown
  emptyTitle?: string
  emptyText?: string
}>()

defineEmits<{ sort: [key: string], retry: [] }>()

const HIDE = { sm: 'hidden sm:table-cell', md: 'hidden md:table-cell', lg: 'hidden lg:table-cell', xl: 'hidden xl:table-cell', '2xl': 'hidden 2xl:table-cell' } as const

const sortState = (key: string) => (props.sort === key ? 'ascending' : props.sort === `-${key}` ? 'descending' : 'none')
const cellClass = (c: AdminColumn) => [c.hideBelow ? HIDE[c.hideBelow] : '', c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left', c.class]
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-line bg-white shadow-card">
    <AdminErrorState v-if="error" :error="error" @retry="$emit('retry')" />
    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="border-b border-line bg-slate-50/70 text-xs uppercase tracking-wider text-slate-500">
          <tr>
            <th v-for="col in columns" :key="col.key" scope="col" class="whitespace-nowrap px-4 py-3 font-semibold" :class="cellClass(col)" :aria-sort="col.sortable ? sortState(col.key) : undefined">
              <button v-if="col.sortable" type="button" class="inline-flex items-center gap-1 uppercase hover:text-slate-900" :data-test="`sort-${col.key}`" @click="$emit('sort', col.key)">
                {{ col.label }}
                <UiIcon :name="sortState(col.key) === 'descending' ? 'arrow-down' : 'arrow-up'" class="h-3 w-3" :class="sortState(col.key) === 'none' && 'opacity-30'" />
              </button>
              <span v-else :class="!col.label && 'sr-only'">{{ col.label || col.key }}</span>
            </th>
          </tr>
        </thead>
        <tbody v-if="loading && !rows?.length">
          <tr v-for="i in 5" :key="i" class="border-b border-line last:border-0">
            <td v-for="col in columns" :key="col.key" class="px-4 py-4" :class="cellClass(col)"><span class="block h-3 animate-pulse rounded bg-slate-200" /></td>
          </tr>
        </tbody>
        <tbody v-else-if="rows?.length" :class="loading && 'opacity-60'" data-test="table-body">
          <tr v-for="row in rows" :key="row.id" class="border-b border-line align-middle last:border-0 hover:bg-slate-50/60" data-test="table-row">
            <td v-for="col in columns" :key="col.key" class="px-4 py-3" :class="cellClass(col)">
              <slot :name="`cell-${col.key}`" :row="row">{{ (row as Record<string, unknown>)[col.key] }}</slot>
            </td>
          </tr>
        </tbody>
      </table>
      <AdminEmptyState v-if="!loading && !rows?.length" :title="emptyTitle ?? 'Nothing found'" :text="emptyText ?? 'Try changing your search or filters.'" />
    </div>
  </div>
</template>
