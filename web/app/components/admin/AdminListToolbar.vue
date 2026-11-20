<script setup lang="ts">
/** Search box (debounced) plus a slot for filter selects. */
const props = defineProps<{ search?: string, placeholder?: string }>()
const emit = defineEmits<{ search: [value: string | undefined] }>()

const value = ref(props.search ?? '')
watch(() => props.search, (s) => { value.value = s ?? '' })

let timer: ReturnType<typeof setTimeout> | undefined
watch(value, (v) => {
  clearTimeout(timer)
  timer = setTimeout(() => { if ((v || undefined) !== (props.search || undefined)) emit('search', v.trim() || undefined) }, 350)
})
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div class="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
    <label class="relative block lg:w-80">
      <span class="sr-only">Search</span>
      <UiIcon name="search" class="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
      <input v-model="value" type="search" class="admin-input pl-9" :placeholder="placeholder ?? 'Search…'" data-test="list-search">
    </label>
    <div v-if="$slots.default" class="flex flex-wrap gap-2 lg:ml-auto">
      <slot />
    </div>
  </div>
</template>
