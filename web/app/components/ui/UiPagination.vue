<script setup lang="ts">
import type { LocationQueryRaw } from 'vue-router'
import type { PaginationMeta } from '~/types/api'

/**
 * Link-based pagination: every page is a real URL (?page=N), so pages are
 * server-rendered, shareable and crawlable.
 */
const props = defineProps<{ meta: PaginationMeta, query: LocationQueryRaw, label?: string }>()

const route = useRoute()

function pageLink(page: number) {
  const query = { ...props.query }
  if (page > 1) query.page = String(page)
  else delete query.page
  return { path: route.path, query }
}

/** 1 … 4 5 6 … 10, always showing first, last and neighbours of the current page. */
const pages = computed<(number | 'gap')[]>(() => {
  const { current_page: current, last_page: last } = props.meta
  const wanted = new Set([1, last, current - 1, current, current + 1].filter((p) => p >= 1 && p <= last))
  const sorted = [...wanted].sort((a, b) => a - b)
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1]! > 1 ? ['gap' as const, p] : [p]))
})

// Vue Router ignores the query when deciding a link is "exact active", so every
// /inventory?page=N link would get aria-current="page". Set it explicitly instead.
const cell = 'flex h-10 min-w-10 items-center justify-center px-3 text-[12px] font-semibold uppercase tracking-[0.1em] transition-colors'
</script>

<template>
  <nav v-if="meta.last_page > 1" :aria-label="label ?? 'Pagination'" class="flex flex-wrap items-center justify-center gap-1" data-test="pagination">
    <NuxtLink
      v-if="meta.current_page > 1"
      :to="pageLink(meta.current_page - 1)"
      :class="[cell, 'border border-line hover:border-ink']"
      aria-current="false"
      rel="prev"
      data-test="page-prev"
    >
      <UiIcon name="arrow-right" class="h-4 w-4 rotate-180" /><span class="ml-2 hidden sm:inline">Previous</span>
    </NuxtLink>

    <template v-for="(p, i) in pages" :key="`${p}-${i}`">
      <span v-if="p === 'gap'" :class="[cell, 'text-muted']" aria-hidden="true">…</span>
      <span v-else-if="p === meta.current_page" :class="[cell, 'bg-ink text-white']" aria-current="page">{{ p }}</span>
      <NuxtLink v-else :to="pageLink(p)" :class="[cell, 'border border-line hover:border-ink']" :aria-label="`Page ${p}`" aria-current="false">{{ p }}</NuxtLink>
    </template>

    <NuxtLink
      v-if="meta.current_page < meta.last_page"
      :to="pageLink(meta.current_page + 1)"
      :class="[cell, 'border border-line hover:border-ink']"
      aria-current="false"
      rel="next"
      data-test="page-next"
    >
      <span class="mr-2 hidden sm:inline">Next</span><UiIcon name="arrow-right" class="h-4 w-4" />
    </NuxtLink>
  </nav>
</template>
