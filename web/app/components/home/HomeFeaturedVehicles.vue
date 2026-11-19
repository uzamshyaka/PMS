<script setup lang="ts">
import type { ListingType } from '~/types/vehicle'

const catalogue = useVehicleCatalogue()

// "Find your perfect drive", sub-divided: new cars first, then used cars.
const GROUPS: { type: ListingType, title: string, cta: string }[] = [
  { type: 'new', title: 'New Cars', cta: 'See all new cars' },
  { type: 'used', title: 'Used Cars', cta: 'See all used cars' },
]

const groups = GROUPS
  .map((group) => ({ ...group, vehicles: catalogue.featured(4, group.type) }))
  .filter((group) => group.vehicles.length)
</script>

<template>
  <section class="container-site pb-20 pt-16 sm:pt-20" aria-labelledby="featured-title" data-test="featured">
    <UiSectionHeading eyebrow="Browse our selection" title="Find your perfect drive">
      <template #action>
        <UiButton to="/inventory" variant="outline" size="sm" arrow>View All Vehicles</UiButton>
      </template>
    </UiSectionHeading>

    <div v-for="group in groups" :key="group.type" class="mt-10 first-of-type:mt-8" :data-test="`featured-${group.type}`">
      <div class="flex items-center justify-between gap-4 border-b border-line pb-3">
        <h3 class="flex items-center gap-3 font-display text-sm font-bold uppercase tracking-[0.14em]">
          <span class="h-4 w-1 bg-bronze" aria-hidden="true" />{{ group.title }}
        </h3>
        <NuxtLink :to="`/inventory?type=${group.type}`" class="label-caps flex items-center gap-1.5 text-[10px] text-ink/70 hover:text-ink">
          {{ group.cta }} <UiIcon name="arrow-right" class="h-3.5 w-3.5" />
        </NuxtLink>
      </div>
      <div class="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" data-test="featured-grid">
        <VehicleCard v-for="vehicle in group.vehicles" :key="vehicle.slug" :vehicle="vehicle" />
      </div>
    </div>

    <p v-if="!groups.length" class="mt-8 text-muted">New vehicles are being prepared. Please check back soon.</p>
    <p v-if="catalogue.isDemo" class="mt-5 text-xs text-muted">Sample listings shown for demonstration.</p>
  </section>
</template>
