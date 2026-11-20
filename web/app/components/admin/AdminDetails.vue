<script setup lang="ts">
/** Read-only label/value grid for detail pages. */
withDefaults(defineProps<{ items: { label: string, value?: string | number | null }[], columns?: 2 | 3 }>(), { columns: 2 })
</script>

<template>
  <dl class="grid gap-x-6 gap-y-4" :class="columns === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'">
    <div v-for="item in items" :key="item.label" class="min-w-0">
      <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">{{ item.label }}</dt>
      <dd class="mt-1 break-words text-sm text-slate-900">{{ item.value === null || item.value === undefined || item.value === '' ? '—' : item.value }}</dd>
    </div>
  </dl>
</template>
