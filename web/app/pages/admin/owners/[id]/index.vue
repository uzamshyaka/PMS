<script setup lang="ts">
import type { AdminColumn, TimelineItem } from '~/types/admin-ui'

definePageMeta({ layout: 'admin', permission: PERMISSIONS.vehicles, title: 'Owner', section: { label: 'Owners', to: '/admin/owners' } })

const id = Number(useRoute().params.id)
const services = useAdminServices()

const { data, error, refresh } = useAsyncData(`admin-owner-${id}`, async () => {
  const [owner, vehicles, activity] = await Promise.all([services.owners.get(id), services.owners.vehicles(id), services.owners.activity(id)])
  return { owner, vehicles, activity }
}, { server: false })
useAdminTitle(() => data.value?.owner.name)

const columns: AdminColumn[] = [
  { key: 'title', label: 'Vehicle' },
  { key: 'price', label: 'Price', align: 'right', hideBelow: 'sm' },
  { key: 'status', label: 'Status' },
  { key: 'createdAt', label: 'Added', hideBelow: 'md' },
]

const history = computed<TimelineItem[]>(() => (data.value?.vehicles ?? []).map((v) => ({
  id: v.id,
  title: `${v.title}: ${vehicleStatusLabel(v.status)}`,
  at: v.updatedAt,
  actor: v.createdBy,
})))
</script>

<template>
  <div>
    <AdminErrorState v-if="error" :error="error" @retry="refresh" />
    <AdminLoadingState v-else-if="!data" />
    <template v-else>
      <AdminPageHeader :title="data.owner.name">
        <template #meta><div class="mt-2 flex items-center gap-2 text-sm text-slate-500">{{ data.owner.type === 'business' ? 'Business' : 'Individual' }} <AdminStatusBadge :status="data.owner.status" /></div></template>
        <template #actions>
          <AdminButton :to="`/admin/owners/${id}/edit`" icon="pencil">Edit</AdminButton>
          <AdminButton :to="{ path: '/admin/vehicles/create' }" variant="primary" icon="plus">Add vehicle</AdminButton>
        </template>
      </AdminPageHeader>

      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div class="min-w-0 space-y-6">
          <AdminCard title="Vehicles" :description="`${data.vehicles.length} vehicle(s)`" :padded="false">
            <div class="p-4">
              <AdminDataTable :columns="columns" :rows="data.vehicles" empty-title="No vehicles yet">
                <template #cell-title="{ row }"><NuxtLink :to="`/admin/vehicles/${row.id}`" class="font-medium hover:underline">{{ row.title }}</NuxtLink><p class="text-xs text-slate-500">{{ row.reference }}</p></template>
                <template #cell-price="{ row }"><span class="tabular-nums">{{ formatKes(row.priceKes) }}</span></template>
                <template #cell-status="{ row }"><AdminStatusBadge :status="row.status" /></template>
                <template #cell-createdAt="{ row }">{{ formatDate(row.createdAt) }}</template>
              </AdminDataTable>
            </div>
          </AdminCard>
          <AdminCard title="Listing history"><AdminTimeline :items="history" empty="No listings yet." /></AdminCard>
        </div>
        <div class="space-y-6">
          <AdminCard title="Contact information">
            <AdminDetails :items="[
              ...(data.owner.type === 'business' ? [{ label: 'Contact person', value: data.owner.contactPerson }] : []),
              { label: 'Phone', value: data.owner.phone },
              { label: 'WhatsApp', value: data.owner.whatsapp },
              { label: 'Email', value: data.owner.email },
              { label: 'Location', value: data.owner.location },
              { label: 'Added', value: formatDate(data.owner.createdAt) },
            ]" />
            <p class="mt-4 text-xs text-slate-500">Internal only. Owners do not log in and their details are never shown publicly.</p>
          </AdminCard>
          <AdminCard title="Internal notes"><p class="whitespace-pre-line text-sm text-slate-700">{{ data.owner.notes || 'No notes.' }}</p></AdminCard>
        </div>
      </div>
    </template>
  </div>
</template>
