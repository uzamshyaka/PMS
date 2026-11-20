<script setup lang="ts">
import type { AdminColumn } from '~/types/admin-ui'

definePageMeta({ layout: 'admin', permission: PERMISSIONS.enquiries, title: 'Enquiries' })

const services = useAdminServices()
const list = useAdminList('admin-enquiries', (q) => services.enquiries.list(q), ['assigned'])
const { data: counts } = useAsyncData('admin-enquiry-counts', () => services.enquiries.statusCounts(), { server: false, watch: [list.data] })
const { data: staff } = useAsyncData('admin-enquiry-staff', () => services.enquiries.assignees(), { server: false, default: () => [] })

const columns: AdminColumn[] = [
  { key: 'customer', label: 'Customer', sortable: true },
  { key: 'phone', label: 'Phone', hideBelow: 'md' },
  { key: 'email', label: 'Email', hideBelow: 'xl' },
  { key: 'vehicle', label: 'Vehicle', hideBelow: 'lg' },
  { key: 'createdAt', label: 'Received', sortable: true, hideBelow: 'sm' },
  { key: 'assigned', label: 'Assigned to', hideBelow: 'lg' },
  { key: 'status', label: 'Status' },
]
</script>

<template>
  <div>
    <AdminPageHeader title="Customer enquiries" description="Enquiries from the website. Assign them, follow up and record what happened." />

    <AdminStatusTabs :tabs="ENQUIRY_STATUSES" :counts="counts" :model-value="list.query.value.status" @update:model-value="list.update({ status: $event })" />

    <AdminListToolbar :search="list.query.value.search" placeholder="Search customer, phone, vehicle or message…" @search="list.update({ search: $event })">
      <AdminSelectFilter
        label="Assigned to"
        all-label="Anyone"
        :model-value="list.query.value.filters.assigned"
        :options="[{ value: 'unassigned', label: 'Unassigned' }, ...staff.map((u) => ({ value: String(u.id), label: u.name }))]"
        @update:model-value="list.update({ assigned: $event })"
      />
    </AdminListToolbar>

    <AdminDataTable :columns="columns" :rows="list.data.value?.items" :sort="list.query.value.sort ?? '-createdAt'" :loading="list.pending.value" :error="list.error.value" empty-title="No enquiries" @sort="list.toggleSort" @retry="list.refresh">
      <template #cell-customer="{ row }">
        <NuxtLink :to="`/admin/enquiries/${row.id}`" class="font-medium text-slate-900 hover:underline">{{ row.customerName }}</NuxtLink>
        <p class="max-w-xs truncate text-xs text-slate-500">{{ row.message }}</p>
      </template>
      <template #cell-phone="{ row }"><span class="whitespace-nowrap">{{ row.phone }}</span></template>
      <template #cell-email="{ row }">{{ row.email || '—' }}</template>
      <template #cell-vehicle="{ row }">
        <NuxtLink v-if="row.vehicleId" :to="`/admin/vehicles/${row.vehicleId}`" class="hover:underline">{{ row.vehicleTitle }}</NuxtLink>
        <span v-else class="text-slate-400">General enquiry</span>
      </template>
      <template #cell-createdAt="{ row }"><span class="whitespace-nowrap">{{ formatDate(row.createdAt) }}</span></template>
      <template #cell-assigned="{ row }"><span :class="!row.assignedToName && 'text-slate-400'">{{ row.assignedToName ?? 'Unassigned' }}</span></template>
      <template #cell-status="{ row }"><AdminStatusBadge :status="row.status" /></template>
    </AdminDataTable>

    <UiPagination v-if="list.data.value" :meta="list.data.value.meta" :query="list.routeQuery.value" class="mt-6" />
  </div>
</template>
