<script setup lang="ts">
/** White panel used for page sections and form sections. */
withDefaults(defineProps<{ title?: string, description?: string, padded?: boolean }>(), { padded: true })
</script>

<template>
  <section class="rounded-xl border border-line bg-white shadow-card">
    <header v-if="title || $slots.actions" class="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
      <div>
        <h3 v-if="title" class="text-sm font-semibold text-slate-900">{{ title }}</h3>
        <p v-if="description" class="mt-0.5 text-xs text-slate-500">{{ description }}</p>
      </div>
      <div v-if="$slots.actions" class="shrink-0"><slot name="actions" /></div>
    </header>
    <div :class="padded && 'p-5'"><slot /></div>
  </section>
</template>
