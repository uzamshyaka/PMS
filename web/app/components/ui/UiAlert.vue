<script setup lang="ts">
withDefaults(defineProps<{ tone?: 'error' | 'info' }>(), { tone: 'error' })
</script>

<template>
  <div
    role="alert"
    class="rounded-lg border px-4 py-3 text-sm"
    :class="tone === 'error' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-sky-200 bg-sky-50 text-sky-800'"
  >
    <slot />
  </div>
</template>
