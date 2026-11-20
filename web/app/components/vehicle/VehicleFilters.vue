<script setup lang="ts">
import type { VehicleQuery } from '~/types/vehicle'

const props = defineProps<{ query: VehicleQuery, makes: string[], models: string[], locations: string[], activeCount: number }>()
const emit = defineEmits<{ update: [patch: Partial<VehicleQuery>], reset: [] }>()

const PRICE_STEPS = [2_000_000, 3_000_000, 4_000_000, 5_000_000, 6_000_000, 7_000_000, 8_000_000, 10_000_000]
const YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i)
const MILEAGES = [20_000, 40_000, 60_000, 80_000, 100_000, 150_000]

const search = ref(props.query.q ?? '')
watch(() => props.query.q, (q) => { search.value = q ?? '' })

const num = (value: string) => (value ? Number(value) : undefined)
const str = <T extends string>(value: string) => (value ? (value as T) : undefined)

const field = 'w-full appearance-none border-0 border-b border-line bg-transparent py-2.5 pr-6 text-sm text-ink focus:border-ink focus:outline-none focus:ring-0'
const label = 'label-caps text-[10px] text-muted'
</script>

<template>
  <form role="search" class="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4" data-test="filters" @submit.prevent="emit('update', { q: search || undefined })">
    <label class="sm:col-span-2 lg:col-span-4">
      <span :class="label">Search</span>
      <span class="relative block">
        <input v-model="search" type="search" placeholder="Make, model or year" :class="field" name="q" @change="emit('update', { q: search || undefined })">
        <UiIcon name="search" class="pointer-events-none absolute right-0 top-3 h-4 w-4 text-muted" />
      </span>
    </label>

    <label>
      <span :class="label">New or used</span>
      <select :class="field" :value="query.type ?? ''" name="type" @change="emit('update', { type: str(($event.target as HTMLSelectElement).value) })">
        <option value="">New &amp; used</option>
        <option v-for="t in LISTING_TYPES" :key="t.value" :value="t.value">{{ t.plural }}</option>
      </select>
    </label>

    <label>
      <span :class="label">Make</span>
      <select :class="field" :value="query.make ?? ''" name="make" @change="emit('update', { make: str(($event.target as HTMLSelectElement).value) })">
        <option value="">Any make</option>
        <option v-for="m in makes" :key="m" :value="m">{{ m }}</option>
      </select>
    </label>

    <label>
      <span :class="label">Model</span>
      <select :class="field" :value="query.model ?? ''" name="model" :disabled="!models.length" @change="emit('update', { model: str(($event.target as HTMLSelectElement).value) })">
        <option value="">Any model</option>
        <option v-for="m in models" :key="m" :value="m">{{ m }}</option>
      </select>
    </label>

    <label>
      <span :class="label">Location</span>
      <select :class="field" :value="query.location ?? ''" name="location" @change="emit('update', { location: str(($event.target as HTMLSelectElement).value) })">
        <option value="">All locations</option>
        <option v-for="l in locations" :key="l" :value="l">{{ l }}</option>
      </select>
    </label>

    <label>
      <span :class="label">Payment</span>
      <select :class="field" :value="query.payment ?? ''" name="payment" @change="emit('update', { payment: str(($event.target as HTMLSelectElement).value) })">
        <option value="">Cash &amp; Lipa Mdogo Mdogo</option>
        <option v-for="t in PAYMENT_TERMS" :key="t.value" :value="t.value">{{ t.label }}</option>
      </select>
    </label>

    <label>
      <span :class="label">Min price</span>
      <select :class="field" :value="query.minPrice ?? ''" name="minPrice" @change="emit('update', { minPrice: num(($event.target as HTMLSelectElement).value) })">
        <option value="">No minimum</option>
        <option v-for="p in PRICE_STEPS" :key="p" :value="p">{{ formatKes(p) }}</option>
      </select>
    </label>

    <label>
      <span :class="label">Max price</span>
      <select :class="field" :value="query.maxPrice ?? ''" name="maxPrice" @change="emit('update', { maxPrice: num(($event.target as HTMLSelectElement).value) })">
        <option value="">No maximum</option>
        <option v-for="p in PRICE_STEPS" :key="p" :value="p">{{ formatKes(p) }}</option>
      </select>
    </label>

    <label>
      <span :class="label">Year from</span>
      <select :class="field" :value="query.minYear ?? ''" name="minYear" @change="emit('update', { minYear: num(($event.target as HTMLSelectElement).value) })">
        <option value="">Any year</option>
        <option v-for="y in YEARS" :key="y" :value="y">{{ y }}</option>
      </select>
    </label>

    <label>
      <span :class="label">Max mileage</span>
      <select :class="field" :value="query.maxMileage ?? ''" name="maxMileage" @change="emit('update', { maxMileage: num(($event.target as HTMLSelectElement).value) })">
        <option value="">Any mileage</option>
        <option v-for="m in MILEAGES" :key="m" :value="m">Up to {{ formatKm(m) }}</option>
      </select>
    </label>

    <label>
      <span :class="label">Fuel</span>
      <select :class="field" :value="query.fuel ?? ''" name="fuel" @change="emit('update', { fuel: str(($event.target as HTMLSelectElement).value) })">
        <option value="">Any fuel</option>
        <option v-for="f in FUEL_TYPES" :key="f" :value="f">{{ f }}</option>
      </select>
    </label>

    <label>
      <span :class="label">Transmission</span>
      <select :class="field" :value="query.transmission ?? ''" name="transmission" @change="emit('update', { transmission: str(($event.target as HTMLSelectElement).value) })">
        <option value="">Any</option>
        <option v-for="t in TRANSMISSIONS" :key="t" :value="t">{{ t }}</option>
      </select>
    </label>

    <label>
      <span :class="label">Body style</span>
      <select :class="field" :value="query.body ?? ''" name="body" @change="emit('update', { body: str(($event.target as HTMLSelectElement).value) })">
        <option value="">Any body style</option>
        <option v-for="b in BODY_STYLES" :key="b" :value="b">{{ b }}</option>
      </select>
    </label>

    <div class="flex items-end sm:col-span-2 lg:col-span-4">
      <button
        v-if="activeCount"
        type="button"
        class="label-caps pb-3 text-[10px] text-ink underline decoration-bronze underline-offset-4"
        data-test="clear-filters"
        @click="emit('reset')"
      >
        Clear filters ({{ activeCount }})
      </button>
    </div>
  </form>
</template>
