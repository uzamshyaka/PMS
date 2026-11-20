<script setup lang="ts">
defineEmits<{ toggleMenu: [] }>()

const route = useRoute()
const auth = useAuthStore()
const titleOverride = useState<string | undefined>('admin-page-title', () => undefined)

const title = computed(() => titleOverride.value ?? route.meta.title ?? 'Admin')
const crumbs = computed(() => {
  const items: { label: string, to?: string }[] = [{ label: 'Admin', to: ADMIN_HOME_PATH }]
  if (route.meta.section) items.push(route.meta.section)
  items.push({ label: title.value })
  return items
})

const search = ref('')
function submitSearch() {
  return navigateTo({ path: '/admin/vehicles', query: search.value.trim() ? { search: search.value.trim() } : {} })
}
</script>

<template>
  <header class="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white/95 px-4 backdrop-blur sm:px-6">
    <button type="button" class="-ml-1 rounded-md p-2 text-slate-600 hover:bg-slate-100 md:hidden" aria-label="Open navigation" data-test="admin-menu-toggle" @click="$emit('toggleMenu')">
      <UiIcon name="menu" class="h-5 w-5" />
    </button>

    <div class="min-w-0 flex-1">
      <nav aria-label="Breadcrumb" class="hidden text-xs text-slate-500 sm:block">
        <ol class="flex items-center gap-1.5">
          <li v-for="(crumb, i) in crumbs" :key="i" class="flex min-w-0 items-center gap-1.5">
            <UiIcon v-if="i > 0" name="chevron-right" class="h-3 w-3 shrink-0 text-slate-400" />
            <NuxtLink v-if="crumb.to && i < crumbs.length - 1" :to="crumb.to" class="hover:text-slate-900">{{ crumb.label }}</NuxtLink>
            <span v-else class="truncate text-slate-700" aria-current="page">{{ crumb.label }}</span>
          </li>
        </ol>
      </nav>
      <h1 class="truncate text-base font-semibold text-slate-900 sm:text-lg" data-test="admin-title">{{ title }}</h1>
    </div>

    <form v-if="auth.can(PERMISSIONS.vehicles)" role="search" class="relative hidden lg:block" @submit.prevent="submitSearch">
      <label for="admin-search" class="sr-only">Search vehicles</label>
      <UiIcon name="search" class="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
      <input id="admin-search" v-model="search" type="search" placeholder="Search vehicles…" class="admin-input w-64 pl-9">
    </form>

    <AdminNotifications />
    <AdminUserMenu />
  </header>
</template>
