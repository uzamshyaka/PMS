<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: 'Dashboard' })

const auth = useAuthStore()
const hasAccess = computed(() => auth.can('access-admin-dashboard'))
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-semibold text-slate-900">Dashboard</h1>
      <p v-if="auth.user" class="mt-1 text-sm text-slate-500">Signed in as {{ auth.user.email }}</p>
    </div>

    <UiAlert v-if="!hasAccess">
      Your account does not have an admin role yet. Ask a Super Admin to assign one.
    </UiAlert>

    <div v-else class="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500">
      Management modules will appear here as they are delivered.
    </div>
  </div>
</template>
