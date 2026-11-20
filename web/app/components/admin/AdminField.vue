<script setup lang="ts">
/**
 * Label + control + hint/error wrapper. The control goes in the default slot
 * and receives `id` and `invalid` so it can wire up aria attributes.
 */
const props = defineProps<{ label: string, error?: string | false, hint?: string, required?: boolean, id?: string }>()
const fieldId = props.id ?? useId()
</script>

<template>
  <div>
    <label :for="fieldId" class="mb-1.5 block text-sm font-medium text-slate-700">
      {{ label }}<span v-if="required" class="text-rose-600" aria-hidden="true"> *</span>
    </label>
    <slot :id="fieldId" :invalid="!!error" :describedby="error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined" />
    <p v-if="error" :id="`${fieldId}-error`" class="mt-1 text-xs text-rose-600" data-test="field-error">{{ error }}</p>
    <p v-else-if="hint" :id="`${fieldId}-hint`" class="mt-1 text-xs text-slate-500">{{ hint }}</p>
  </div>
</template>
