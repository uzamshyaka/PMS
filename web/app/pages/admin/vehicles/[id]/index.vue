<script setup lang="ts">
import type { TimelineItem } from '~/types/admin-ui'

definePageMeta({ layout: 'admin', permission: PERMISSIONS.vehicles, title: 'Vehicle', section: { label: 'Vehicles', to: '/admin/vehicles' } })

const route = useRoute()
const id = Number(route.params.id)
const services = useAdminServices()

const { data, error, refresh } = useAsyncData(`admin-vehicle-${id}`, async () => {
  const vehicle = await services.vehicles.get(id)
  const [owner, reviews, activity, features] = await Promise.all([
    services.owners.get(vehicle.ownerId).catch(() => null),
    services.vehicles.reviews(id),
    services.vehicles.activity(id),
    services.catalogue.features(),
  ])
  return { vehicle, owner, reviews, activity, features }
}, { server: false })

const { menuFor } = useVehicleActions(refresh)
useAdminTitle(() => data.value?.vehicle.reference)

const v = computed(() => data.value?.vehicle)
const specs = computed(() => v.value ? [
  { label: 'Make & model', value: `${v.value.makeName} ${v.value.modelName}` },
  { label: 'Year', value: v.value.year },
  { label: 'New or used', value: v.value.listingType === 'new' ? 'New' : 'Used' },
  { label: 'Mileage', value: v.value.mileageKm === null ? null : formatKm(v.value.mileageKm) },
  { label: 'Fuel', value: v.value.fuel },
  { label: 'Transmission', value: v.value.transmission },
  { label: 'Body style', value: v.value.bodyStyle },
  { label: 'Drivetrain', value: v.value.drivetrain },
  { label: 'Engine', value: v.value.engineCc ? `${v.value.engineCc.toLocaleString('en-US')} cc` : null },
  { label: 'Exterior / interior', value: `${v.value.exteriorColour} / ${v.value.interiorColour || '—'}` },
  { label: 'Doors / seats', value: `${v.value.doors ?? '—'} / ${v.value.seats ?? '—'}` },
  { label: 'Condition', value: v.value.conditionGrade || null },
] : [])

const featureNames = computed(() => data.value ? data.value.features.filter((f) => data.value!.vehicle.featureIds.includes(f.id)).map((f) => f.name) : [])

const reviewItems = computed<TimelineItem[]>(() => (data.value?.reviews ?? []).map((r) => ({
  id: r.id,
  title: r.action === 'submitted' ? 'Submitted for review' : r.action === 'approved' ? 'Approved and published' : 'Rejected',
  at: r.createdAt,
  actor: r.actorName,
  body: r.reason,
  tone: r.action === 'approved' ? 'success' : r.action === 'rejected' ? 'danger' : 'default',
})))

const activityItems = computed<TimelineItem[]>(() => (data.value?.activity ?? []).map((a) => ({ id: a.id, title: `${formatRole(a.action.replace('_', '-'))}: ${a.details}`, at: a.at, actor: a.userName })))
const latestRejection = computed(() => v.value?.status === 'rejected' ? data.value?.reviews.find((r) => r.action === 'rejected') : undefined)
</script>

<template>
  <div>
    <AdminErrorState v-if="error" :error="error" @retry="refresh" />
    <AdminLoadingState v-else-if="!data || !v" />
    <template v-else>
      <AdminPageHeader :title="v.title">
        <template #meta>
          <div class="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span>{{ v.reference }}</span><AdminStatusBadge :status="v.status" /><span>· Added {{ formatDate(v.createdAt) }} by {{ v.createdBy }}</span>
          </div>
        </template>
        <template #actions>
          <AdminButton v-for="a in menuFor(v).filter((x) => x.to)" :key="a.label" :to="a.to" :icon="a.icon">{{ a.label }}</AdminButton>
          <AdminButton v-for="a in menuFor(v).filter((x) => !x.to)" :key="a.label" :icon="a.icon" :variant="a.danger ? 'danger' : 'secondary'" :data-test="`detail-${a.label.toLowerCase().replace(/[^a-z]+/g, '-')}`" @click="a.onSelect?.()">{{ a.label }}</AdminButton>
        </template>
      </AdminPageHeader>

      <UiAlert v-if="latestRejection" class="mb-6"><strong>Rejected by {{ latestRejection.actorName }}:</strong> {{ latestRejection.reason }}</UiAlert>

      <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div class="min-w-0 space-y-6">
          <AdminCard title="Photographs">
            <VehicleGallery :images="v.images.map((i) => i.url)" :alt="v.title" />
          </AdminCard>
          <AdminCard title="Specifications"><AdminDetails :items="specs" :columns="3" /></AdminCard>
          <AdminCard title="Description"><p class="whitespace-pre-line text-sm leading-relaxed text-slate-700">{{ v.description }}</p></AdminCard>
          <AdminCard title="Features" :description="`${featureNames.length} features`">
            <ul class="flex flex-wrap gap-1.5"><li v-for="f in featureNames" :key="f" class="rounded-full bg-slate-100 px-2.5 py-1 text-xs">{{ f }}</li></ul>
          </AdminCard>
          <AdminCard title="Condition & inspections">
            <p class="mb-4 text-sm text-slate-700"><strong v-if="v.conditionGrade">{{ v.conditionGrade }}.</strong> {{ v.conditionNotes }}</p>
            <VehicleInspections :inspections="v.inspections" />
          </AdminCard>
        </div>

        <div class="space-y-6">
          <AdminCard title="Listing">
            <p class="text-2xl font-semibold tabular-nums text-slate-900">{{ v.priceKes ? formatKes(v.priceKes) : 'No price yet' }}</p>
            <AdminDetails class="mt-4" :items="[
              { label: 'Status', value: vehicleStatusLabel(v.status) },
              { label: 'Payment', value: v.payment ? paymentLabel(v.payment) : null },
              { label: 'Sold from', value: v.location },
              { label: 'Last updated', value: formatDate(v.updatedAt) },
            ]" />
          </AdminCard>
          <AdminCard title="Owner">
            <template v-if="data.owner">
              <NuxtLink :to="`/admin/owners/${data.owner.id}`" class="font-medium text-slate-900 hover:underline">{{ data.owner.name }}</NuxtLink>
              <p class="mt-1 text-sm text-slate-600">{{ data.owner.phone }}<br>{{ data.owner.email || 'No email' }}<br>{{ data.owner.location }}</p>
              <p class="mt-2 text-xs text-slate-500">Internal only. Never shown on the public website.</p>
            </template>
            <p v-else class="text-sm text-slate-500">Owner record not found.</p>
          </AdminCard>
          <AdminCard title="Approval history"><AdminTimeline :items="reviewItems" empty="Not yet submitted for review." /></AdminCard>
          <AdminCard title="Activity"><AdminTimeline :items="activityItems" empty="No recorded activity yet." /></AdminCard>
        </div>
      </div>
    </template>
  </div>
</template>
