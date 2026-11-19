<script setup lang="ts">
import type { PublicVehicle } from '~/types/vehicle'

const props = defineProps<{ vehicle: PublicVehicle, eager?: boolean, showDate?: boolean }>()

const title = computed(() => vehicleTitle(props.vehicle))
const to = computed(() => `/inventory/${props.vehicle.slug}`)
</script>

<template>
  <article class="group flex flex-col overflow-hidden border border-line bg-white shadow-card transition-shadow hover:shadow-lg" data-test="vehicle-card">
    <NuxtLink :to="to" class="relative block" :aria-label="`${vehicle.year} ${title}`" tabindex="-1">
      <UiImage
        :src="vehicle.images[0]"
        :alt="`${vehicle.year} ${title}`"
        :eager="eager"
        :width="1600"
        :height="760"
        class="relative aspect-[21/10] bg-carbon"
        img-class="transition-transform duration-500 group-hover:scale-[1.03]"
      />
      <span class="absolute left-3 top-3 flex gap-1.5">
        <UiBadge tone="dark">{{ vehicle.year }}</UiBadge>
        <UiBadge v-if="vehicle.listingType === 'new'" tone="bronze-solid" data-test="new-badge">New</UiBadge>
      </span>
    </NuxtLink>

    <div class="flex flex-1 flex-col px-4 pb-4 pt-3.5">
      <h3 class="line-clamp-2 min-h-[2lh] text-[13px] font-bold uppercase leading-snug tracking-[0.03em] text-ink">
        <NuxtLink :to="to" class="hover:underline">{{ vehicle.make }} {{ vehicle.model }} {{ vehicle.variant }}</NuxtLink>
      </h3>
      <p class="mt-1.5 truncate whitespace-nowrap text-[10.5px] uppercase tracking-[0.04em] text-muted" data-test="specs">
        {{ vehicle.listingType === 'new' ? 'Brand new' : formatKm(vehicle.mileageKm) }}<span class="mx-1.5 text-line" aria-hidden="true">|</span>{{ vehicle.transmission }}<span class="mx-1.5 text-line" aria-hidden="true">|</span>{{ vehicle.fuel }}
      </p>
      <div class="mt-2 flex items-center justify-between gap-2">
        <p class="flex min-w-0 items-center gap-1 text-[11px] text-ink/80" data-test="location">
          <UiIcon name="pin" class="h-3.5 w-3.5 shrink-0 text-bronze" /><span class="truncate">{{ vehicle.location }}</span>
        </p>
        <span
          class="shrink-0 rounded-sm px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.06em]"
          :class="vehicle.payment === 'lipa-mdogo-mdogo' ? 'bg-bronze/12 text-[#7a5f35] ring-1 ring-bronze/40' : 'bg-mist text-ink/70 ring-1 ring-line'"
          data-test="payment"
        >{{ paymentLabel(vehicle.payment) }}</span>
      </div>
      <p v-if="showDate" class="mt-1 text-[10.5px] text-muted" data-test="added-date">
        Added <time :datetime="vehicle.listedAt">{{ formatDate(vehicle.listedAt) }}</time>
      </p>
      <div class="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
        <p class="text-[15px] font-bold text-ink" data-test="price">{{ formatKes(vehicle.priceKes) }}</p>
        <NuxtLink :to="to" class="label-caps flex items-center gap-1.5 text-[10px] text-ink/70 hover:text-ink" tabindex="-1" aria-hidden="true">
          Details <UiIcon name="arrow-right" class="h-3.5 w-3.5" />
        </NuxtLink>
      </div>
    </div>
  </article>
</template>
