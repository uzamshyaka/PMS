<script setup lang="ts">
import type { AdminColumn } from '~/types/admin-ui'

definePageMeta({ layout: 'admin', permission: PERMISSIONS.audit, title: 'Audit logs' })

const services = useAdminServices()
const list = useAdminList('admin-audit', (q) => services.audit.list(q), ['user', 'action', 'module', 'from', 'to'], 15)
const { data: facets } = useAsyncData('admin-audit-facets', () => services.audit.facets(), { server: false, default: () => ({ users: [], actions: [], modules: [] }) })

const columns: AdminColumn[] = [
  { key: 'at', label: 'Date & time', sortable: true },
  { key: 'userName', label: 'User' },
  { key: 'action', label: 'Action' },
  { key: 'module', label: 'Module', hideBelow: 'md' },
  { key: 'entity', label: 'Entity', hideBelow: 'lg' },
  { key: 'details', label: 'Details', hideBelow: 'sm' },
]
const isMock = useRuntimeConfig().public.adminDataSource === 'mock'
const when = (iso: string) => new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Nairobi' }).format(new Date(iso))
const opts = (values: string[]) => values.map((v) => ({ value: v, label: formatRole(v.replace(/_/g, '-')) }))
</script>

<template>
  <div>
    <AdminPageHeader title="Audit logs" description="Who did what, and when. Entries are append-only and cannot be edited." />
    <UiAlert v-if="isMock" class="mb-4" data-test="audit-mock-notice"><strong>Sample entries, not real activity.</strong> This prototype shows generated audit records plus actions you take in this session. Real entries will come from the server.</UiAlert>

    <AdminListToolbar :search="list.query.value.search" placeholder="Search details or entity…" @search="list.update({ search: $event })">
      <AdminSelectFilter label="User" all-label="All users" :model-value="list.query.value.filters.user" :options="facets.users.map((u) => ({ value: u, label: u }))" @update:model-value="list.update({ user: $event })" />
      <AdminSelectFilter label="Action" all-label="All actions" :model-value="list.query.value.filters.action" :options="opts(facets.actions)" @update:model-value="list.update({ action: $event })" />
      <AdminSelectFilter label="Module" all-label="All modules" :model-value="list.query.value.filters.module" :options="facets.modules.map((m) => ({ value: m, label: m }))" @update:model-value="list.update({ module: $event })" />
      <label class="flex items-center gap-2 text-sm text-slate-600">From <input type="date" class="admin-input w-auto py-2" :value="list.query.value.filters.from" aria-label="From date" @change="list.update({ from: ($event.target as HTMLInputElement).value || undefined })"></label>
      <label class="flex items-center gap-2 text-sm text-slate-600">To <input type="date" class="admin-input w-auto py-2" :value="list.query.value.filters.to" aria-label="To date" @change="list.update({ to: ($event.target as HTMLInputElement).value || undefined })"></label>
    </AdminListToolbar>

    <AdminDataTable :columns="columns" :rows="list.data.value?.items" :sort="list.query.value.sort ?? '-at'" :loading="list.pending.value" :error="list.error.value" empty-title="No audit entries match" @sort="list.toggleSort" @retry="list.refresh">
      <template #cell-at="{ row }"><time :datetime="row.at" class="whitespace-nowrap tabular-nums">{{ when(row.at) }}</time></template>
      <template #cell-action="{ row }"><span class="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs">{{ row.action }}</span></template>
      <template #cell-entity="{ row }"><span class="whitespace-nowrap">{{ row.entity }}</span></template>
      <template #cell-details="{ row }"><span class="text-slate-600">{{ row.details }}</span></template>
    </AdminDataTable>

    <UiPagination v-if="list.data.value" :meta="list.data.value.meta" :query="list.routeQuery.value" class="mt-6" />
  </div>
</template>
