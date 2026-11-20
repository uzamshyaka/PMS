<script setup lang="ts">
import type { TimelineItem } from '~/types/admin-ui'

definePageMeta({ layout: 'admin', permission: PERMISSIONS.reviews, title: 'Review listing', section: { label: 'Listing reviews', to: '/admin/reviews' } })

const route = useRoute()
const id = Number(route.params.id)
const auth = useAuthStore()
const services = useAdminServices()

const { data, error, refresh } = useAsyncData(`admin-review-${id}`, async () => {
  const vehicle = await services.vehicles.get(id)
  const [reviews, features] = await Promise.all([services.vehicles.reviews(id), services.catalogue.features()])
  // Owner contact details are only loaded for users who manage vehicles.
  const owner = auth.can(PERMISSIONS.vehicles) ? await services.owners.get(vehicle.ownerId).catch(() => null) : null
  return { vehicle, reviews, features, owner }
}, { server: false })

const { perform } = useVehicleActions(refresh)
useAdminTitle(() => (data.value ? `Review ${data.value.vehicle.reference}` : undefined))

const v = computed(() => data.value?.vehicle)
const isPending = computed(() => v.value?.status === 'pending_approval')
const canDecide = computed(() => isPending.value && auth.can(PERMISSIONS.reviews))

async function decide(action: 'approve' | 'reject') {
  if (v.value && (await perform(v.value, action))) await navigateTo('/admin/reviews')
}

const history = computed<TimelineItem[]>(() => (data.value?.reviews ?? []).map((r) => ({
  id: r.id,
  title: r.action === 'submitted' ? 'Submitted for review' : r.action === 'approved' ? 'Approved and published' : 'Rejected',
  at: r.createdAt,
  actor: r.actorName,
  body: r.reason,
  tone: r.action === 'approved' ? 'success' : r.action === 'rejected' ? 'danger' : 'default',
})))

const specs = computed(() => v.value ? [
  { label: 'Make & model', value: `${v.value.makeName} ${v.value.modelName}` },
  { label: 'Year', value: v.value.year },
  { label: 'Price', value: formatKes(v.value.priceKes) },
  { label: 'Payment', value: v.value.payment ? paymentLabel(v.value.payment) : null },
  { label: 'Mileage', value: formatKm(v.value.mileageKm) },
  { label: 'New or used', value: v.value.listingType === 'new' ? 'New' : 'Used' },
  { label: 'Fuel / transmission', value: `${v.value.fuel || '—'} · ${v.value.transmission || '—'}` },
  { label: 'Body / drivetrain', value: `${v.value.bodyStyle || '—'} · ${v.value.drivetrain || '—'}` },
  { label: 'Engine', value: v.value.engineCc ? `${v.value.engineCc.toLocaleString('en-US')} cc` : null },
  { label: 'Colours', value: `${v.value.exteriorColour} / ${v.value.interiorColour || '—'}` },
  { label: 'Sold from', value: v.value.location },
  { label: 'Condition', value: v.value.conditionGrade || null },
] : [])
</script>

<template>
  <div>
    <AdminErrorState v-if="error" :error="error" @retry="refresh" />
    <AdminLoadingState v-else-if="!data || !v" />
    <template v-else>
      <AdminPageHeader :title="v.title">
        <template #meta>
          <div class="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            {{ v.reference }} <AdminStatusBadge :status="v.status" />
            <span v-if="v.submittedAt">· Submitted {{ formatDate(v.submittedAt) }} by {{ v.createdBy }}</span>
          </div>
        </template>
      </AdminPageHeader>

      <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div class="min-w-0 space-y-6">
          <AdminCard title="Photographs" :description="`${v.images.length} photo(s)`"><VehicleGallery :images="v.images.map((i) => i.url)" :alt="v.title" /></AdminCard>
          <AdminCard title="Specifications"><AdminDetails :items="specs" :columns="3" /></AdminCard>
          <AdminCard title="Description"><p class="text-sm leading-relaxed text-slate-700">{{ v.description }}</p></AdminCard>
          <AdminCard title="Condition & inspection claims">
            <p class="mb-4 text-sm text-slate-700">{{ v.conditionNotes || 'No condition notes.' }}</p>
            <VehicleInspections :inspections="v.inspections" />
          </AdminCard>
        </div>

        <div class="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <AdminCard v-if="canDecide" title="Decision" data-test="decision-panel">
            <p class="text-sm text-slate-600">Approving publishes this listing on the public website straight away.</p>
            <div class="mt-4 grid gap-2">
              <AdminButton variant="primary" icon="check" data-test="approve" @click="decide('approve')">Approve & publish</AdminButton>
              <AdminButton variant="danger" icon="x-circle" data-test="reject" @click="decide('reject')">Reject with reason</AdminButton>
            </div>
          </AdminCard>
          <UiAlert v-else tone="info">This listing is {{ vehicleStatusLabel(v.status).toLowerCase() }}. Only listings awaiting review can be decided.</UiAlert>

          <AdminCard title="Owner">
            <template v-if="data.owner">
              <p class="font-medium text-slate-900">{{ data.owner.name }}</p>
              <p class="mt-1 text-sm text-slate-600">{{ data.owner.phone }} · {{ data.owner.location }}</p>
            </template>
            <p v-else class="text-sm text-slate-500" data-test="owner-hidden">Owner contact details are not available to your role.</p>
          </AdminCard>
          <AdminCard title="Review history"><AdminTimeline :items="history" /></AdminCard>
        </div>
      </div>
    </template>
  </div>
</template>
