<script setup lang="ts">
interface NavItem {
  label: string
  to: string
  permission: string
}

defineEmits<{ navigate: [] }>()

// Only modules that actually exist are listed. Add entries as modules ship.
const items: NavItem[] = [
  { label: 'Dashboard', to: ADMIN_HOME_PATH, permission: 'access-admin-dashboard' },
]

const auth = useAuthStore()
const visibleItems = computed(() => items.filter((item) => auth.can(item.permission)))
</script>

<template>
  <nav aria-label="Admin" class="flex flex-col gap-1 p-3">
    <NuxtLink
      v-for="item in visibleItems"
      :key="item.to"
      :to="item.to"
      class="rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
      exact-active-class="bg-slate-800 text-white"
      @click="$emit('navigate')"
    >
      {{ item.label }}
    </NuxtLink>
  </nav>
</template>
