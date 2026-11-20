<script setup lang="ts">
defineProps<{ title: string, text?: string }>()
</script>

<template>
  <div class="flex flex-col items-center px-6 py-14 text-center" data-test="empty-state">
    <span class="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400"><UiIcon name="inbox" class="h-5 w-5" /></span>
    <p class="mt-3 text-sm font-semibold text-slate-900">{{ title }}</p>
    <p v-if="text" class="mt-1 max-w-sm text-sm text-slate-500">{{ text }}</p>
    <div v-if="$slots.default" class="mt-4"><slot /></div>
  </div>
</template>
