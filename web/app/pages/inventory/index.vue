<script setup lang="ts">
const catalogue = useVehicleCatalogue()
const { query, activeCount, update, reset } = useVehicleFilters()

// Default order: date added to the system, newest first.
const results = computed(() => catalogue.search(query.value))
const paged = computed(() => paginate(results.value, query.value.page))
const routeQuery = computed(() => toRouteQuery(query.value))
const models = computed(() => catalogue.modelsFor(query.value.make))
const filtersOpen = ref(false)

useSeoMeta({
  title: 'Inventory',
  description: 'Browse new and used vehicles in one place. Filter by condition, make, model, location, payment (cash or Lipa Mdogo Mdogo), price, year, mileage and more.',
})
</script>

<template>
  <div>
    <UiPageHero
      eyebrow="Browse our selection"
      title="Vehicle Inventory"
      intro="New and used vehicles in one place. Filter by condition, location, payment and more."
      image="/images/inventory-hero.webp"
    />

    <section class="container-site py-12" aria-label="Vehicle search">
      <div class="flex items-center justify-between gap-4 border-b border-line pb-4 lg:hidden">
        <button type="button" class="label-caps flex items-center gap-2 text-ink" :aria-expanded="filtersOpen" aria-controls="inventory-filters" @click="filtersOpen = !filtersOpen">
          <UiIcon name="sliders" class="h-4 w-4" /> Filters<span v-if="activeCount"> ({{ activeCount }})</span>
        </button>
      </div>

      <div id="inventory-filters" class="mt-6 lg:mt-0 lg:block" :class="filtersOpen ? 'block' : 'hidden'">
        <VehicleFilters :query="query" :makes="catalogue.makes" :models="models" :locations="catalogue.locations" :active-count="activeCount" @update="update" @reset="reset" />
      </div>

      <div class="mt-10 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm text-muted" aria-live="polite" data-test="result-count">
          <template v-if="paged.meta.last_page > 1">
            Showing <strong class="text-ink">{{ paged.meta.from }}–{{ paged.meta.to }}</strong> of
          </template>
          <strong class="text-ink">{{ results.length }}</strong> {{ results.length === 1 ? 'vehicle' : 'vehicles' }}<template v-if="paged.meta.last_page === 1"> found</template>
        </p>
        <label class="flex items-center gap-3">
          <span class="label-caps text-[10px] text-muted">Sort by</span>
          <select
            class="border-0 border-b border-line bg-transparent py-1.5 pr-6 text-sm focus:border-ink focus:outline-none focus:ring-0"
            :value="query.sort"
            name="sort"
            @change="update({ sort: ($event.target as HTMLSelectElement).value as typeof query.sort })"
          >
            <option v-for="s in VEHICLE_SORTS" :key="s.value" :value="s.value">{{ s.label }}</option>
          </select>
        </label>
      </div>

      <div v-if="results.length" class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-test="inventory-grid">
        <VehicleCard v-for="(vehicle, i) in paged.items" :key="vehicle.slug" :vehicle="vehicle" :eager="i < 3" show-date />
      </div>
      <UiPagination v-if="results.length" :meta="paged.meta" :query="routeQuery" label="Inventory pages" class="mt-10" />
      <div v-else class="mt-10 border border-dashed border-line px-6 py-16 text-center">
        <p class="font-display text-lg font-bold uppercase tracking-[0.04em]">No vehicles match your search</p>
        <p class="mt-2 text-sm text-muted">Try removing a filter or two.</p>
        <UiButton v-if="activeCount" variant="outline" size="sm" class="mt-6" @click="reset">Clear filters</UiButton>
      </div>

      <p v-if="catalogue.isDemo" class="mt-8 text-xs text-muted">Sample listings shown for demonstration. They are not real vehicles for sale.</p>
    </section>
  </div>
</template>
