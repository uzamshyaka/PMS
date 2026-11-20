<script setup lang="ts">
import type { OwnerRow } from '~/types/admin'
import type { AdminAction, AdminColumn } from '~/types/admin-ui'

definePageMeta({ layout: 'admin', permission: PERMISSIONS.vehicles, title: 'Owners' })

const services = useAdminServices()
const { confirm, run } = useAdminFeedback()
const list = useAdminList('admin-owners', (q) => services.owners.list(q), ['type'])

const columns: AdminColumn[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'type', label: 'Type', hideBelow: 'md' },
  { key: 'phone', label: 'Phone', hideBelow: 'sm' },
  { key: 'email', label: 'Email', hideBelow: 'xl' },
  { key: 'vehicles', label: 'Vehicles', sortable: true, align: 'right', hideBelow: 'md' },
  { key: 'status', label: 'Status' },
  { key: 'createdAt', label: 'Date added', sortable: true, hideBelow: 'lg' },
  { key: 'actions', label: 'Actions', align: 'right' },
]

async function toggleStatus(owner: OwnerRow) {
  const deactivate = owner.status === 'active'
  const { confirmed } = await confirm({
    title: deactivate ? 'Deactivate owner?' : 'Reactivate owner?',
    message: deactivate ? `${owner.name} will no longer be selectable for new vehicles. Existing vehicles are unaffected.` : `${owner.name} can be selected for vehicles again.`,
    confirmLabel: deactivate ? 'Deactivate' : 'Reactivate',
    tone: deactivate ? 'danger' : 'default',
  })
  if (confirmed && (await run(() => services.owners.setStatus(owner.id, deactivate ? 'inactive' : 'active'), deactivate ? 'Owner deactivated' : 'Owner reactivated'))) await list.refresh()
}

const actionsFor = (owner: OwnerRow): AdminAction[] => [
  { label: 'View', icon: 'eye', to: `/admin/owners/${owner.id}` },
  { label: 'Edit', icon: 'pencil', to: `/admin/owners/${owner.id}/edit` },
  { label: owner.status === 'active' ? 'Deactivate' : 'Reactivate', icon: owner.status === 'active' ? 'x-circle' : 'check', danger: owner.status === 'active', onSelect: () => toggleStatus(owner) },
]
</script>

<template>
  <div>
    <AdminPageHeader title="Owners" description="Individuals and businesses whose vehicles we list. Owner details are internal only.">
      <template #actions><AdminButton to="/admin/owners/create" variant="primary" icon="plus" data-test="add-owner">Add Owner</AdminButton></template>
    </AdminPageHeader>

    <AdminStatusTabs :tabs="[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]" :model-value="list.query.value.status" @update:model-value="list.update({ status: $event })" />

    <AdminListToolbar :search="list.query.value.search" placeholder="Search name, phone, email or town…" @search="list.update({ search: $event })">
      <AdminSelectFilter label="Owner type" all-label="All types" :model-value="list.query.value.filters.type" :options="[{ value: 'individual', label: 'Individuals' }, { value: 'business', label: 'Businesses' }]" @update:model-value="list.update({ type: $event })" />
    </AdminListToolbar>

    <AdminDataTable :columns="columns" :rows="list.data.value?.items" :sort="list.query.value.sort ?? '-createdAt'" :loading="list.pending.value" :error="list.error.value" empty-title="No owners found" @sort="list.toggleSort" @retry="list.refresh">
      <template #cell-name="{ row }">
        <NuxtLink :to="`/admin/owners/${row.id}`" class="font-medium text-slate-900 hover:underline">{{ row.name }}</NuxtLink>
        <p class="text-xs text-slate-500">{{ row.type === 'business' ? `Contact: ${row.contactPerson}` : row.location }}</p>
      </template>
      <template #cell-type="{ row }">{{ row.type === 'business' ? 'Business' : 'Individual' }}</template>
      <template #cell-phone="{ row }"><span class="whitespace-nowrap">{{ row.phone }}</span></template>
      <template #cell-email="{ row }">{{ row.email || '—' }}</template>
      <template #cell-vehicles="{ row }"><span class="tabular-nums">{{ row.vehicleCount }}</span></template>
      <template #cell-status="{ row }"><AdminStatusBadge :status="row.status" /></template>
      <template #cell-createdAt="{ row }">{{ formatDate(row.createdAt) }}</template>
      <template #cell-actions="{ row }"><div class="flex justify-end"><AdminActionMenu :actions="actionsFor(row)" :label="`Actions for ${row.name}`" /></div></template>
    </AdminDataTable>

    <UiPagination v-if="list.data.value" :meta="list.data.value.meta" :query="list.routeQuery.value" class="mt-6" />
  </div>
</template>
