<script setup lang="ts">
import type { Owner, VehicleFeature, VehicleInput, VehicleMake, VehicleModel } from '~/types/admin'

const props = defineProps<{
  form: VehicleInput
  options: { owners: Owner[], makes: VehicleMake[], models: VehicleModel[], features: VehicleFeature[] }
}>()

const name = <T extends { id: number, name: string }>(list: T[], id: number | null) => list.find((x) => x.id === id)?.name ?? '—'
const primary = computed(() => props.form.images.find((i) => i.isPrimary) ?? props.form.images[0])

const details = computed(() => [
  { label: 'Owner', value: name(props.options.owners, props.form.ownerId) },
  { label: 'Make & model', value: `${name(props.options.makes, props.form.makeId)} ${name(props.options.models, props.form.modelId)}` },
  { label: 'Year', value: props.form.year },
  { label: 'New or used', value: props.form.listingType === 'new' ? 'New' : 'Used' },
  { label: 'Price', value: props.form.priceKes ? formatKes(props.form.priceKes) : null },
  { label: 'Payment', value: props.form.payment ? paymentLabel(props.form.payment) : null },
  { label: 'Sold from', value: props.form.location },
  { label: 'Mileage', value: props.form.mileageKm !== null ? formatKm(props.form.mileageKm) : null },
  { label: 'Condition', value: props.form.conditionGrade },
  { label: 'Fuel / transmission', value: [props.form.fuel, props.form.transmission].filter(Boolean).join(' · ') },
  { label: 'Body / drivetrain', value: [props.form.bodyStyle, props.form.drivetrain].filter(Boolean).join(' · ') },
  { label: 'Engine', value: props.form.engineCc ? `${props.form.engineCc.toLocaleString('en-US')} cc` : null },
  { label: 'Colours', value: [props.form.exteriorColour, props.form.interiorColour].filter(Boolean).join(' / ') },
  { label: 'Doors / seats', value: `${props.form.doors ?? '—'} / ${props.form.seats ?? '—'}` },
])
</script>

<template>
  <div class="space-y-6" data-test="vehicle-summary">
    <AdminCard title="Review before saving" description="Check everything. Submitting sends the listing to a reviewer; approval publishes it.">
      <div class="grid gap-6 md:grid-cols-[240px_minmax(0,1fr)]">
        <UiImage :src="primary?.url" :alt="form.title" class="relative aspect-[4/3] rounded-lg bg-slate-200" />
        <div>
          <p class="text-lg font-semibold text-slate-900">{{ form.title || 'Untitled vehicle' }}</p>
          <p class="mt-1 text-sm text-slate-600">{{ form.description }}</p>
          <AdminDetails class="mt-5" :items="details" :columns="3" />
        </div>
      </div>
    </AdminCard>
    <div class="grid gap-6 lg:grid-cols-3">
      <AdminCard title="Features">
        <p v-if="!form.featureIds.length" class="text-sm text-slate-500">None selected.</p>
        <ul class="flex flex-wrap gap-1.5">
          <li v-for="id in form.featureIds" :key="id" class="rounded-full bg-slate-100 px-2.5 py-1 text-xs">{{ name(options.features, id) }}</li>
        </ul>
      </AdminCard>
      <AdminCard title="Photographs"><p class="text-sm text-slate-700">{{ form.images.length }} photo(s){{ form.images.length ? ', primary set' : '' }}</p></AdminCard>
      <AdminCard title="Inspections"><p class="text-sm text-slate-700">{{ form.inspections.length }} record(s)</p><p v-if="form.conditionNotes" class="mt-2 text-sm text-slate-500">{{ form.conditionNotes }}</p></AdminCard>
    </div>
  </div>
</template>
