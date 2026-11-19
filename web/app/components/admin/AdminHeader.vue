<script setup lang="ts">
defineEmits<{ toggleMenu: [] }>()

const auth = useAuthStore()

async function logout() {
  await auth.logout()
  await navigateTo(ADMIN_LOGIN_PATH)
}
</script>

<template>
  <header class="flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-6">
    <button
      type="button"
      class="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
      aria-label="Toggle navigation"
      @click="$emit('toggleMenu')"
    >
      <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path stroke-linecap="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>

    <div class="ml-auto flex items-center gap-4">
      <div v-if="auth.user" class="text-right leading-tight">
        <p class="text-sm font-medium text-slate-900">{{ auth.user.name }}</p>
        <p class="text-xs text-slate-500">
          {{ auth.user.roles.map(formatRole).join(', ') || 'No role assigned' }}
        </p>
      </div>
      <button
        type="button"
        :disabled="auth.loading"
        class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        @click="logout"
      >
        Log out
      </button>
    </div>
  </header>
</template>
