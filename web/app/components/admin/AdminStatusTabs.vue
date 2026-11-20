<script setup lang="ts">
/** Status filter tabs with counts. `modelValue` undefined = "All". */
defineProps<{ tabs: { value: string, label: string }[], counts?: Record<string, number> | null, modelValue?: string }>()
defineEmits<{ 'update:modelValue': [value: string | undefined] }>()
</script>

<template>
  <div class="-mx-1 mb-4 overflow-x-auto px-1">
    <div class="flex min-w-max gap-1 border-b border-line" role="tablist" aria-label="Filter by status" data-test="status-tabs">
      <button
        v-for="tab in [{ value: undefined, label: 'All' }, ...tabs]"
        :key="tab.label"
        type="button"
        role="tab"
        :aria-selected="modelValue === tab.value"
        class="-mb-px flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors"
        :class="modelValue === tab.value ? 'border-ink text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'"
        @click="$emit('update:modelValue', tab.value)"
      >
        {{ tab.label }}
        <span v-if="counts" class="rounded-full bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-600">
          {{ tab.value ? counts[tab.value] ?? 0 : Object.values(counts).reduce((a, b) => a + b, 0) }}
        </span>
      </button>
    </div>
  </div>
</template>
