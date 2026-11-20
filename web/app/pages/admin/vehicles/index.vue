<script setup lang="ts">
import type { AdminColumn } from '~/types/admin-ui'

definePageMeta({ layout: 'admin', permission: PERMISSIONS.vehicles, title: 'Vehicles' })

const services = useAdminServices()
const list = useAdminList('admin-vehicles', (q) => services.vehicles.list(q), ['make', 'type', 'location'])
const { data: counts, refresh: refreshCounts } = useAsyncData('admin-vehicle-counts', () => services.vehicles.statusCounts(), { server: false })
const { data: makes } = useAsyncData('admin-makes', () => services.catalogue.makes(), { server: false, default: () => [] })
const { menuFor } = useVehicleActions(() => Promise.all([list.refresh(), refreshCounts()]))

const LOCATIONS = ['Eldoret', 'Kisumu', 'Machakos', 'Mombasa', 'Nairobi', 'Nakuru', 'Thika']

const columns: AdminColumn[] = [
  { key: 'photo', label: '', class: 'w-20' },
  { key: 'title', label: 'Vehicle', sortable: true, class: 'min-w-[16rem]' },
  { key: 'makeModel', label: 'Make & model', hideBelow: '2xl' },
  { key: 'year', label: 'Year', sortable: true, hideBelow: 'md' },
  { key: 'price', label: 'Price', sortable: true, align: 'right' },
  { key: 'mileage', label: 'Mileage', sortable: true, align: 'right', hideBelow: 'xl' },
  { key: 'owner', label: 'Owner', hideBelow: '2xl' },
  { key: 'status', label: 'Status' },
  { key: 'createdAt', label: 'Date added', sortable: true, hideBelow: 'md' },
  { key: 'actions', label: 'Actions', align: 'right' },
]
</script>

<template>
  <div>
    <AdminPageHeader title="Vehicle inventory" description="Every vehicle record, in any status. Approval publishes a listing.">
      <template #actions>
        <AdminButton to="/admin/vehicles/create" variant="primary" icon="plus" data-test="add-vehicle">Add Vehicle</AdminButton>
      </template>
    </AdminPageHeader>

    <AdminStatusTabs :tabs="VEHICLE_STATUSES" :counts="counts" :model-value="list.query.value.status" @update:model-value="list.update({ status: $event })" />

    <AdminListToolbar :search="list.query.value.search" placeholder="Search reference, vehicle, owner or town…" @search="list.update({ search: $event })">
      <AdminSelectFilter label="Make" all-label="All makes" :model-value="list.query.value.filters.make" :options="makes.map((m) => ({ value: String(m.id), label: m.name }))" @update:model-value="list.update({ make: $event })" />
      <AdminSelectFilter label="Condition" all-label="New & used" :model-value="list.query.value.filters.type" :options="[{ value: 'new', label: 'New' }, { value: 'used', label: 'Used' }]" @update:model-value="list.update({ type: $event })" />
      <AdminSelectFilter label="Location" all-label="All locations" :model-value="list.query.value.filters.location" :options="LOCATIONS.map((l) => ({ value: l, label: l }))" @update:model-value="list.update({ location: $event })" />
    </AdminListToolbar>

    <AdminDataTable
      :columns="columns"
      :rows="list.data.value?.items"
      :sort="list.query.value.sort ?? '-createdAt'"
      :loading="list.pending.value"
      :error="list.error.value"
      empty-title="No vehicles found"
      @sort="list.toggleSort"
      @retry="list.refresh"
    >
      <template #cell-photo="{ row }">
        <UiImage :src="row.images.find((i) => i.isPrimary)?.url ?? row.images[0]?.url" :alt="row.title" class="relative h-11 w-16 rounded-md bg-slate-200" />
      </template>
      <template #cell-title="{ row }">
        <NuxtLink :to="`/admin/vehicles/${row.id}`" class="font-medium text-slate-900 hover:underline">{{ row.title }}</NuxtLink>
        <p class="text-xs text-slate-500">{{ row.reference }} · {{ row.location }} · {{ row.listingType === 'new' ? 'New' : 'Used' }}</p>
      </template>
      <template #cell-makeModel="{ row }">{{ row.makeName }} {{ row.modelName }}</template>
      <template #cell-price="{ row }"><span class="whitespace-nowrap font-medium tabular-nums">{{ formatKes(row.priceKes) }}</span></template>
      <template #cell-mileage="{ row }"><span class="whitespace-nowrap tabular-nums">{{ formatKm(row.mileageKm) }}</span></template>
      <template #cell-owner="{ row }"><NuxtLink :to="`/admin/owners/${row.ownerId}`" class="hover:underline">{{ row.ownerName }}</NuxtLink></template>
      <template #cell-status="{ row }"><AdminStatusBadge :status="row.status" /></template>
      <template #cell-createdAt="{ row }"><span class="whitespace-nowrap">{{ formatDate(row.createdAt) }}</span></template>
      <template #cell-actions="{ row }"><div class="flex justify-end"><AdminActionMenu :actions="menuFor(row, { includeView: true })" :label="`Actions for ${row.title}`" /></div></template>
    </AdminDataTable>

    <UiPagination v-if="list.data.value" :meta="list.data.value.meta" :query="list.routeQuery.value" label="Vehicle pages" class="mt-6" />
  </div>
</template>
