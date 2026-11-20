<script setup lang="ts">
defineProps<{ title?: string, description?: string }>()
</script>

<template>
  <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div class="min-w-0">
      <h2 v-if="title" class="text-xl font-semibold text-slate-900">{{ title }}</h2>
      <p v-if="description" class="mt-1 max-w-2xl text-sm text-slate-500">{{ description }}</p>
      <slot name="meta" />
    </div>
    <div v-if="$slots.actions" class="flex shrink-0 flex-wrap gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
