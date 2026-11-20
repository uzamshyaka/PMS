<script setup lang="ts">
const auth = useAuthStore()
const services = useAdminServices()
const route = useRoute()

const { data: items } = useAsyncData('admin-notifications', () => services.notifications.list(auth.can), {
  server: false,
  watch: [() => route.fullPath],
  default: () => [],
})
</script>

<template>
  <AdminPopover label="Notifications" width="w-80">
    <template #trigger>
      <span class="relative rounded-md p-2 text-slate-600 hover:bg-slate-100">
        <UiIcon name="bell" class="h-5 w-5" />
        <span v-if="items.length" class="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-bronze px-1 text-[10px] font-bold text-white" data-test="notification-count">{{ items.length }}</span>
      </span>
    </template>
    <template #default="{ close }">
      <p class="border-b border-line px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Notifications</p>
      <ul v-if="items.length" class="max-h-80 overflow-y-auto">
        <li v-for="n in items" :key="n.id">
          <NuxtLink :to="n.to" role="menuitem" class="block px-4 py-3 hover:bg-slate-50" @click="close">
            <p class="text-sm font-medium text-slate-900">{{ n.title }}</p>
            <p class="truncate text-xs text-slate-500">{{ n.description }}</p>
          </NuxtLink>
        </li>
      </ul>
      <p v-else class="px-4 py-6 text-center text-sm text-slate-500">You're all caught up.</p>
    </template>
  </AdminPopover>
</template>
