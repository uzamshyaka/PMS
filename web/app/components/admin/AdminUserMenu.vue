<script setup lang="ts">
const auth = useAuthStore()
const initials = computed(() => (auth.user?.name ?? '?').split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase())

async function logout() {
  await auth.logout()
  await navigateTo(ADMIN_LOGIN_PATH)
}
</script>

<template>
  <AdminPopover label="Account menu" width="w-64">
    <template #trigger>
      <span class="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-xs font-bold text-white ring-2 ring-bronze/60">{{ initials }}</span>
    </template>
    <div class="border-b border-line px-4 py-3">
      <p class="text-sm font-semibold text-slate-900">{{ auth.user?.name }}</p>
      <p class="truncate text-xs text-slate-500">{{ auth.user?.email }}</p>
      <p class="mt-1 text-xs text-slate-500">{{ auth.user?.roles.map(formatRole).join(', ') || 'No role assigned' }}</p>
    </div>
    <button type="button" role="menuitem" class="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50" data-test="header-logout" @click="logout">
      <UiIcon name="logout" class="h-4 w-4" /> Log out
    </button>
  </AdminPopover>
</template>
