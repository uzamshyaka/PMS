<script setup lang="ts">
definePageMeta({ layout: 'admin', permission: PERMISSIONS.dashboard, title: 'Dashboard' })

const auth = useAuthStore()
const services = useAdminServices()

const canVehicles = computed(() => auth.can(PERMISSIONS.vehicles))
const canReviews = computed(() => auth.can(PERMISSIONS.reviews))
const canEnquiries = computed(() => auth.can(PERMISSIONS.enquiries))
const seesVehicles = computed(() => canVehicles.value || canReviews.value)

const { data, error, refresh } = useAsyncData('admin-dashboard', async () => {
  const [stats, recentVehicles, recentEnquiries] = await Promise.all([
    services.vehicles.stats(),
    seesVehicles.value ? services.vehicles.recent(6) : Promise.resolve([]),
    canEnquiries.value ? services.enquiries.recent(5) : Promise.resolve([]),
  ])
  return { stats, recentVehicles, recentEnquiries }
}, { server: false })

const tiles = computed(() => {
  const s = data.value?.stats
  if (!s) return []
  const vehicleLink = (status?: string) => (canVehicles.value ? { path: '/admin/vehicles', query: status ? { status } : {} } : undefined)
  return [
    ...(seesVehicles.value ? [
      { label: 'Total vehicles', value: s.total, icon: 'car' as const, to: vehicleLink() },
      { label: 'Published', value: s.byStatus.published, icon: 'globe' as const, to: vehicleLink('published') },
      { label: 'Pending reviews', value: s.byStatus.pending_approval, icon: 'shield' as const, to: canReviews.value ? '/admin/reviews' : vehicleLink('pending_approval') },
      { label: 'Drafts', value: s.byStatus.draft, icon: 'pencil' as const, to: vehicleLink('draft') },
      { label: 'Sold', value: s.byStatus.sold, icon: 'tag' as const, to: vehicleLink('sold') },
    ] : []),
    ...(canEnquiries.value ? [{ label: 'New enquiries', value: s.newEnquiries, icon: 'inbox' as const, to: { path: '/admin/enquiries', query: { status: 'new' } } }] : []),
  ]
})

const quickActions = computed(() => [
  ...(canVehicles.value ? [{ label: 'Add Vehicle', to: '/admin/vehicles/create', icon: 'plus' as const }, { label: 'Add Owner', to: '/admin/owners/create', icon: 'users' as const }] : []),
  ...(canReviews.value ? [{ label: 'Review Listings', to: '/admin/reviews', icon: 'shield' as const }] : []),
  ...(canEnquiries.value ? [{ label: 'View Enquiries', to: '/admin/enquiries', icon: 'inbox' as const }] : []),
])

const firstName = computed(() => auth.user?.name.split(' ')[0] ?? '')
</script>

<template>
  <div>
    <AdminPageHeader :title="`Welcome back${firstName ? `, ${firstName}` : ''}`" description="Today's overview of listings and enquiries.">
      <template #actions>
        <AdminButton v-for="(a, i) in quickActions" :key="a.label" :to="a.to" :icon="a.icon" :variant="i === 0 ? 'primary' : 'secondary'" data-test="quick-action">{{ a.label }}</AdminButton>
      </template>
    </AdminPageHeader>

    <AdminErrorState v-if="error" :error="error" @retry="refresh" />
    <AdminLoadingState v-else-if="!data" />
    <template v-else>
      <div v-if="tiles.length" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6" data-test="stat-tiles">
        <AdminStatCard v-for="t in tiles" :key="t.label" v-bind="t" />
      </div>
      <UiAlert v-else tone="info">Your account has no modules assigned yet. Ask a Super Admin for a role.</UiAlert>

      <div class="mt-6 grid gap-6 xl:grid-cols-3">
        <AdminCard v-if="seesVehicles" title="Listing status summary" description="All vehicles by status">
          <AdminStatusSummary :counts="data.stats.byStatus" :linkable="canVehicles" />
        </AdminCard>

        <AdminCard v-if="seesVehicles" title="Recent vehicle activity" class="xl:col-span-2" :padded="false">
          <template #actions><AdminButton v-if="canVehicles" to="/admin/vehicles" variant="ghost">View all</AdminButton></template>
          <ul class="divide-y divide-line" data-test="recent-vehicles">
            <li v-for="v in data.recentVehicles" :key="v.id" class="flex items-center gap-3 px-5 py-3">
              <UiImage :src="v.images[0]?.url" :alt="v.title" class="relative h-10 w-14 shrink-0 rounded-md bg-slate-200" />
              <div class="min-w-0 flex-1">
                <NuxtLink :to="canVehicles ? `/admin/vehicles/${v.id}` : `/admin/reviews/${v.id}`" class="block truncate text-sm font-medium text-slate-900 hover:underline">{{ v.title }}</NuxtLink>
                <p class="text-xs text-slate-500">{{ v.reference }} · updated {{ formatDate(v.updatedAt) }}</p>
              </div>
              <AdminStatusBadge :status="v.status" />
            </li>
          </ul>
        </AdminCard>

        <AdminCard v-if="canEnquiries" title="Recent enquiries" :class="seesVehicles ? 'xl:col-span-3' : 'xl:col-span-3'" :padded="false">
          <template #actions><AdminButton to="/admin/enquiries" variant="ghost">View all</AdminButton></template>
          <ul class="divide-y divide-line" data-test="recent-enquiries">
            <li v-for="e in data.recentEnquiries" :key="e.id" class="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-center sm:gap-4">
              <div class="min-w-0 flex-1">
                <NuxtLink :to="`/admin/enquiries/${e.id}`" class="text-sm font-medium text-slate-900 hover:underline">{{ e.customerName }}</NuxtLink>
                <p class="truncate text-xs text-slate-500">{{ e.vehicleTitle ?? 'General enquiry' }} · {{ e.message }}</p>
              </div>
              <span class="text-xs text-slate-500">{{ formatDate(e.createdAt) }}</span>
              <AdminStatusBadge :status="e.status" />
            </li>
          </ul>
        </AdminCard>
      </div>
    </template>
  </div>
</template>
