<script setup lang="ts">
const props = defineProps<{ error: unknown }>()
defineEmits<{ retry: [] }>()
const message = computed(() => toApiError(props.error).message)
</script>

<template>
  <div class="flex flex-col items-center px-6 py-14 text-center" role="alert" data-test="error-state">
    <span class="flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-500"><UiIcon name="alert" class="h-5 w-5" /></span>
    <p class="mt-3 text-sm font-semibold text-slate-900">Something went wrong</p>
    <p class="mt-1 max-w-sm text-sm text-slate-500">{{ message }}</p>
    <AdminButton class="mt-4" icon="history" @click="$emit('retry')">Try again</AdminButton>
  </div>
</template>
