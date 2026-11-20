<script setup lang="ts">
import type { AdminColumn } from '~/types/admin-ui'

definePageMeta({ layout: 'admin', permission: PERMISSIONS.reviews, title: 'Listing reviews' })

const services = useAdminServices()
const TABS = [
  { value: 'pending_approval', label: 'Awaiting review' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'published', label: 'Approved & live' },
]

// The pending queue is first-come, first-served (oldest first); the other tabs show the most recent first.
const defaultSort = (status?: string) => (status ? '-createdAt' : 'createdAt')
const list = useAdminList('admin-reviews', (q) => services.vehicles.list({ ...q, status: q.status ?? 'pending_approval', sort: q.sort ?? defaultSort(q.status) }))
const { data: counts } = useAsyncData('admin-review-counts', () => services.vehicles.statusCounts(), { server: false })
const activeTab = computed(() => list.query.value.status ?? 'pending_approval')
const tabCounts = computed(() => (counts.value ? Object.fromEntries(TABS.map((t) => [t.value, counts.value![t.value] ?? 0])) : null))

const columns: AdminColumn[] = [
  { key: 'photo', label: '', class: 'w-20' },
  { key: 'title', label: 'Vehicle', sortable: true },
  { key: 'price', label: 'Price', sortable: true, align: 'right', hideBelow: 'sm' },
  { key: 'createdBy', label: 'Submitted by', hideBelow: 'lg' },
  { key: 'submittedAt', label: 'Submitted', hideBelow: 'md' },
  { key: 'status', label: 'Status', hideBelow: 'sm' },
  { key: 'open', label: '', align: 'right' },
]
</script>

<template>
  <div>
    <AdminPageHeader title="Listing reviews" description="Check each submitted listing. Approving publishes it on the website immediately; rejecting returns it with your reason." />

    <div class="-mx-1 mb-4 overflow-x-auto px-1">
      <div class="flex min-w-max gap-1 border-b border-line" role="tablist" aria-label="Review queue">
        <button
          v-for="tab in TABS"
          :key="tab.value"
          type="button"
          role="tab"
          :aria-selected="activeTab === tab.value"
          class="-mb-px flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium"
          :class="activeTab === tab.value ? 'border-ink text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'"
          @click="list.update({ status: tab.value === 'pending_approval' ? undefined : tab.value })"
        >
          {{ tab.label }}<span v-if="tabCounts" class="rounded-full bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-600">{{ tabCounts[tab.value] }}</span>
        </button>
      </div>
    </div>

    <AdminListToolbar :search="list.query.value.search" placeholder="Search vehicle, reference or owner…" @search="list.update({ search: $event })" />

    <AdminDataTable
      :columns="columns"
      :rows="list.data.value?.items"
      :sort="list.query.value.sort ?? defaultSort(list.query.value.status)"
      :loading="list.pending.value"
      :error="list.error.value"
      :empty-title="activeTab === 'pending_approval' ? 'No listings awaiting review' : 'Nothing here'"
      :empty-text="activeTab === 'pending_approval' ? 'New submissions will appear here.' : undefined"
      @sort="list.toggleSort"
      @retry="list.refresh"
    >
      <template #cell-photo="{ row }"><UiImage :src="row.images[0]?.url" :alt="row.title" class="relative h-11 w-16 rounded-md bg-slate-200" /></template>
      <template #cell-title="{ row }">
        <NuxtLink :to="`/admin/reviews/${row.id}`" class="font-medium text-slate-900 hover:underline">{{ row.title }}</NuxtLink>
        <p class="text-xs text-slate-500">{{ row.reference }} · {{ row.location }}</p>
      </template>
      <template #cell-price="{ row }"><span class="whitespace-nowrap tabular-nums">{{ formatKes(row.priceKes) }}</span></template>
      <template #cell-submittedAt="{ row }">{{ row.submittedAt ? formatDate(row.submittedAt) : '—' }}</template>
      <template #cell-status="{ row }"><AdminStatusBadge :status="row.status" /></template>
      <template #cell-open="{ row }"><AdminButton :to="`/admin/reviews/${row.id}`" variant="ghost">{{ row.status === 'pending_approval' ? 'Review' : 'View' }}</AdminButton></template>
    </AdminDataTable>

    <UiPagination v-if="list.data.value" :meta="list.data.value.meta" :query="list.routeQuery.value" class="mt-6" />
  </div>
</template>
