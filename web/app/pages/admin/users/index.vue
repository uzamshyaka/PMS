<script setup lang="ts">
import type { AdminColumn } from '~/types/admin-ui'

definePageMeta({ layout: 'admin', permission: PERMISSIONS.users, title: 'Users', section: { label: 'Users & Roles', to: '/admin/users' } })

const services = useAdminServices()
const list = useAdminList('admin-users', (q) => services.users.list(q), ['role'])

const columns: AdminColumn[] = [
  { key: 'name', label: 'User', sortable: true },
  { key: 'roles', label: 'Roles' },
  { key: 'status', label: 'Status' },
  { key: 'lastLogin', label: 'Last sign-in', sortable: true, hideBelow: 'md' },
  { key: 'createdAt', label: 'Created', sortable: true, hideBelow: 'lg' },
  { key: 'open', label: '', align: 'right' },
]
const when = (iso: string | null) => (iso ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Nairobi' }).format(new Date(iso)) : 'Never')
</script>

<template>
  <div>
    <AdminPageHeader title="Users" description="Staff accounts for this admin portal. Only administrators sign in.">
      <template #actions>
        <AdminButton v-if="useAuthStore().can(PERMISSIONS.roles)" to="/admin/roles" icon="key">View roles</AdminButton>
        <AdminButton to="/admin/users/create" variant="primary" icon="plus" data-test="add-user">Add User</AdminButton>
      </template>
    </AdminPageHeader>

    <AdminStatusTabs :tabs="[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]" :model-value="list.query.value.status" @update:model-value="list.update({ status: $event })" />

    <AdminListToolbar :search="list.query.value.search" placeholder="Search name or email…" @search="list.update({ search: $event })">
      <AdminSelectFilter label="Role" all-label="All roles" :model-value="list.query.value.filters.role" :options="ROLE_DEFINITIONS.map((r) => ({ value: r.name, label: r.label }))" @update:model-value="list.update({ role: $event })" />
    </AdminListToolbar>

    <AdminDataTable :columns="columns" :rows="list.data.value?.items" :sort="list.query.value.sort ?? 'name'" :loading="list.pending.value" :error="list.error.value" empty-title="No users found" @sort="list.toggleSort" @retry="list.refresh">
      <template #cell-name="{ row }">
        <NuxtLink :to="`/admin/users/${row.id}`" class="font-medium text-slate-900 hover:underline">{{ row.name }}</NuxtLink>
        <p class="text-xs text-slate-500">{{ row.email }}</p>
      </template>
      <template #cell-roles="{ row }">
        <div class="flex flex-wrap gap-1"><span v-for="r in row.roles" :key="r" class="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{{ formatRole(r) }}</span></div>
      </template>
      <template #cell-status="{ row }"><AdminStatusBadge :status="row.isActive ? 'active' : 'inactive'" /></template>
      <template #cell-lastLogin="{ row }"><span class="whitespace-nowrap">{{ when(row.lastLoginAt) }}</span></template>
      <template #cell-createdAt="{ row }">{{ formatDate(row.createdAt) }}</template>
      <template #cell-open="{ row }"><AdminButton :to="`/admin/users/${row.id}`" variant="ghost">Manage</AdminButton></template>
    </AdminDataTable>

    <UiPagination v-if="list.data.value" :meta="list.data.value.meta" :query="list.routeQuery.value" class="mt-6" />
  </div>
</template>
