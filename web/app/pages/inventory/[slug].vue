<script setup lang="ts">
import type { IconName } from '~/utils/icons'

const route = useRoute()
const catalogue = useVehicleCatalogue()
const vehicle = catalogue.findBySlug(String(route.params.slug))

if (!vehicle) {
  throw createError({ statusCode: 404, statusMessage: 'Vehicle not found', fatal: true })
}

const title = vehicleTitle(vehicle)
const SPECS: { icon: IconName, label: string, value: string }[] = [
  { icon: 'calendar', label: 'Year', value: String(vehicle.year) },
  { icon: 'gauge', label: 'Mileage', value: vehicle.listingType === 'new' ? 'Brand new' : formatKm(vehicle.mileageKm) },
  { icon: 'gear', label: 'Transmission', value: vehicle.transmission },
  { icon: 'fuel', label: 'Fuel', value: vehicle.fuel },
  { icon: 'engine', label: 'Engine', value: vehicle.engine },
  { icon: 'car', label: 'Body style', value: vehicle.bodyStyle },
  { icon: 'palette', label: 'Colour', value: vehicle.colour },
  { icon: 'shield', label: 'Condition', value: vehicle.condition.summary },
]

useSeoMeta({
  title: `${vehicle.year} ${title}`,
  description: `${vehicle.year} ${title}, ${formatKm(vehicle.mileageKm)}, ${vehicle.transmission}, ${vehicle.fuel}. ${formatKes(vehicle.priceKes)}.`,
  ogType: 'website',
})

useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Car',
      'name': `${vehicle.year} ${title}`,
      'brand': { '@type': 'Brand', 'name': vehicle.make },
      'model': vehicle.model,
      'vehicleModelDate': String(vehicle.year),
      'mileageFromOdometer': { '@type': 'QuantitativeValue', 'value': vehicle.mileageKm, 'unitCode': 'KMT' },
      'fuelType': vehicle.fuel,
      'vehicleTransmission': vehicle.transmission,
      'bodyType': vehicle.bodyStyle,
      'color': vehicle.colour,
      'offers': {
        '@type': 'Offer',
        'price': vehicle.priceKes,
        'priceCurrency': 'KES',
        'itemCondition': vehicle.listingType === 'new' ? 'https://schema.org/NewCondition' : 'https://schema.org/UsedCondition',
        'availableAtOrFrom': { '@type': 'Place', 'name': vehicle.location, 'address': { '@type': 'PostalAddress', 'addressLocality': vehicle.location, 'addressCountry': 'KE' } },
      },
    }),
  }],
})
</script>

<template>
  <article v-if="vehicle" class="container-site py-10 sm:py-14">
    <nav aria-label="Breadcrumb" class="label-caps text-[10px] text-muted">
      <NuxtLink to="/inventory" class="hover:text-ink">Inventory</NuxtLink>
      <span class="mx-2" aria-hidden="true">/</span>
      <NuxtLink :to="`/inventory?type=${vehicle.listingType}`" class="hover:text-ink">{{ vehicle.listingType === 'new' ? 'New' : 'Used' }}</NuxtLink>
      <span class="mx-2" aria-hidden="true">/</span>
      <span class="text-ink">{{ vehicle.make }} {{ vehicle.model }}</span>
    </nav>

    <div class="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12">
      <div class="min-w-0">
        <VehicleGallery :images="vehicle.images" :alt="`${vehicle.year} ${title}`" />
      </div>

      <div class="lg:sticky lg:top-6 lg:self-start">
        <div class="flex gap-1.5">
          <UiBadge tone="dark">{{ vehicle.year }}</UiBadge>
          <UiBadge :tone="vehicle.listingType === 'new' ? 'bronze-solid' : 'neutral'">{{ vehicle.listingType === 'new' ? 'New' : 'Used' }}</UiBadge>
        </div>
        <h1 class="mt-3 font-display text-2xl font-bold uppercase leading-tight tracking-[0.03em] sm:text-3xl">
          {{ vehicle.make }} {{ vehicle.model }}
          <span class="mt-1 block text-base font-semibold tracking-[0.06em] text-muted">{{ vehicle.variant }}</span>
        </h1>
        <p class="mt-5 font-display text-3xl font-bold" data-test="detail-price">{{ formatKes(vehicle.priceKes) }}</p>
        <p class="mt-1 text-xs text-muted">{{ vehicle.listingType === 'new' ? 'Brand new' : formatKm(vehicle.mileageKm) }} · {{ vehicle.transmission }} · {{ vehicle.fuel }}</p>
        <p class="mt-1 text-xs text-muted">Added <time :datetime="vehicle.listedAt">{{ formatDate(vehicle.listedAt) }}</time></p>

        <dl class="mt-5 grid grid-cols-2 border-y border-line text-sm">
          <div class="py-3 pr-3">
            <dt class="label-caps text-[10px] text-muted">Sold from</dt>
            <dd class="mt-1 flex items-center gap-1.5 font-semibold" data-test="detail-location"><UiIcon name="pin" class="h-4 w-4 text-bronze" />{{ vehicle.location }}</dd>
          </div>
          <div class="border-l border-line py-3 pl-4">
            <dt class="label-caps text-[10px] text-muted">Payment</dt>
            <dd class="mt-1 font-semibold" data-test="detail-payment">{{ paymentLabel(vehicle.payment) }}</dd>
          </div>
        </dl>
        <p v-if="vehicle.payment === 'lipa-mdogo-mdogo'" class="mt-2 text-xs leading-relaxed text-muted">
          Pay in instalments. Deposit and terms are agreed with our showroom team.
        </p>
        <VehicleEnquiryPanel :vehicle="vehicle" class="mt-8" />
        <p v-if="catalogue.isDemo" class="mt-4 text-xs text-muted">Sample listing shown for demonstration. Not a real vehicle for sale.</p>
      </div>
    </div>

    <div class="mt-14 grid gap-14 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12">
      <div class="min-w-0 space-y-14">
        <section aria-labelledby="specs-title">
          <h2 id="specs-title" class="label-caps flex items-center gap-4">Key specifications <span class="h-px w-10 bg-bronze" /></h2>
          <dl class="mt-6 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3 lg:grid-cols-4">
            <div v-for="spec in SPECS" :key="spec.label" class="flex flex-col gap-2 bg-white p-4">
              <UiIcon :name="spec.icon" class="h-5 w-5 text-bronze" />
              <dt class="label-caps text-[10px] text-muted">{{ spec.label }}</dt>
              <dd class="text-sm font-semibold">{{ spec.value }}</dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby="desc-title">
          <h2 id="desc-title" class="label-caps flex items-center gap-4">Description <span class="h-px w-10 bg-bronze" /></h2>
          <p class="mt-5 max-w-3xl leading-relaxed text-muted">{{ vehicle.description }}</p>
        </section>

        <section aria-labelledby="features-title">
          <h2 id="features-title" class="label-caps flex items-center gap-4">Features <span class="h-px w-10 bg-bronze" /></h2>
          <ul class="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            <li v-for="feature in vehicle.features" :key="feature" class="flex items-center gap-3 text-sm">
              <UiIcon name="check" class="h-4 w-4 shrink-0 text-bronze" />{{ feature }}
            </li>
          </ul>
        </section>
      </div>

      <div class="space-y-14">
        <section aria-labelledby="condition-title">
          <h2 id="condition-title" class="label-caps flex items-center gap-4">Condition <span class="h-px w-10 bg-bronze" /></h2>
          <p class="mt-5 font-display text-lg font-bold uppercase tracking-[0.04em]">{{ vehicle.condition.summary }}</p>
          <ul class="mt-3 space-y-2 text-sm text-muted">
            <li v-for="note in vehicle.condition.notes" :key="note" class="flex gap-3"><span class="mt-2 h-1 w-1 shrink-0 bg-bronze" />{{ note }}</li>
          </ul>
        </section>

        <section aria-labelledby="inspection-title">
          <h2 id="inspection-title" class="label-caps flex items-center gap-4">Inspection information <span class="h-px w-10 bg-bronze" /></h2>
          <VehicleInspections :inspections="vehicle.inspections" class="mt-5" />
        </section>
      </div>
    </div>
  </article>
</template>
