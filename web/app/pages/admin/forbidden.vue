<script setup lang="ts">
definePageMeta({ layout: 'admin', title: 'No access' })
const from = computed(() => String(useRoute().query.from ?? ''))
</script>

<template>
  <div class="mx-auto max-w-lg py-16 text-center" data-test="forbidden">
    <span class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600"><UiIcon name="key" class="h-6 w-6" /></span>
    <h2 class="mt-4 text-xl font-semibold text-slate-900">You don't have access to this page</h2>
    <p class="mt-2 text-sm text-slate-500">
      Your role doesn't include <span v-if="from" class="font-mono text-slate-700">{{ from }}</span><span v-else>this module</span>.
      Ask a Super Admin if you need it.
    </p>
    <AdminButton :to="ADMIN_HOME_PATH" variant="primary" class="mt-6">Back to dashboard</AdminButton>
  </div>
</template>
