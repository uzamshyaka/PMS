<script setup lang="ts">
/** Compact select used in list toolbars. Empty value = no filter. */
defineProps<{ label: string, modelValue?: string, options: { value: string, label: string }[], allLabel?: string }>()
defineEmits<{ 'update:modelValue': [value: string | undefined] }>()
</script>

<template>
  <label class="flex items-center gap-2 text-sm">
    <span class="sr-only">{{ label }}</span>
    <select
      class="admin-input w-auto min-w-36 py-2"
      :value="modelValue ?? ''"
      :aria-label="label"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value || undefined)"
    >
      <option value="">{{ allLabel ?? `All ${label.toLowerCase()}` }}</option>
      <option v-for="o in options" :key="o.value" :value="o.value">{{ o.label }}</option>
    </select>
  </label>
</template>
