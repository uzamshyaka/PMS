<script setup lang="ts">
/** Loading panel for whole-page loads (tables have their own skeleton rows). */
defineProps<{ label?: string }>()
</script>

<template>
  <div class="flex items-center justify-center gap-3 rounded-xl border border-line bg-white px-6 py-16 text-sm text-slate-500" role="status" data-test="loading-state">
    <svg class="h-5 w-5 animate-spin text-slate-400" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-opacity=".25" stroke-width="3" /><path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="3" /></svg>
    {{ label ?? 'Loading…' }}
  </div>
</template>
