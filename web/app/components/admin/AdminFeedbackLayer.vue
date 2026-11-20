<script setup lang="ts">
/**
 * Global confirmation dialog (native <dialog>: focus trap, Escape, backdrop)
 * and toast notifications for the admin area.
 */
const ui = useAdminUiStore()
const dialog = ref<HTMLDialogElement | null>(null)
const reason = ref('')
const touched = ref(false)

const state = computed(() => ui.confirmState)
const reasonError = computed(() => {
  const rule = state.value?.reason
  if (!rule) return ''
  return reason.value.trim().length < rule.minLength ? `Please write at least ${rule.minLength} characters.` : ''
})

watch(state, async (s) => {
  reason.value = ''
  touched.value = false
  await nextTick()
  if (s && !dialog.value?.open) dialog.value?.showModal()
  if (!s && dialog.value?.open) dialog.value.close()
})

function confirm() {
  touched.value = true
  if (reasonError.value) return
  ui.settle({ confirmed: true, reason: state.value?.reason ? reason.value.trim() : undefined })
}
const cancel = () => ui.settle({ confirmed: false })
</script>

<template>
  <dialog
    ref="dialog"
    class="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl p-0 shadow-2xl backdrop:bg-ink/50"
    aria-labelledby="confirm-title"
    data-test="confirm-dialog"
    @cancel.prevent="cancel"
  >
    <form v-if="state" class="p-6" @submit.prevent="confirm">
      <h2 id="confirm-title" class="text-lg font-semibold text-slate-900">{{ state.title }}</h2>
      <p class="mt-2 text-sm leading-relaxed text-slate-600">{{ state.message }}</p>

      <label v-if="state.reason" class="mt-4 block">
        <span class="text-sm font-medium text-slate-700">{{ state.reason.label }} <span class="text-rose-600">*</span></span>
        <textarea
          v-model="reason"
          rows="4"
          class="admin-input mt-1.5"
          :placeholder="state.reason.placeholder"
          :aria-invalid="touched && !!reasonError"
          data-test="confirm-reason"
          @blur="touched = true"
        />
        <span v-if="touched && reasonError" class="mt-1 block text-xs text-rose-600" data-test="confirm-reason-error">{{ reasonError }}</span>
      </label>

      <div class="mt-6 flex justify-end gap-2">
        <button type="button" class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" @click="cancel">Cancel</button>
        <button
          type="submit"
          class="rounded-lg px-4 py-2 text-sm font-semibold text-white"
          :class="state.tone === 'danger' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-ink hover:bg-graphite'"
          data-test="confirm-ok"
        >
          {{ state.confirmLabel ?? 'Confirm' }}
        </button>
      </div>
    </form>
  </dialog>

  <div class="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2" aria-live="polite" role="status">
    <div
      v-for="t in ui.toasts"
      :key="t.id"
      class="pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg"
      :class="{
        'border-emerald-200 bg-emerald-50 text-emerald-900': t.tone === 'success',
        'border-rose-200 bg-rose-50 text-rose-900': t.tone === 'error',
        'border-sky-200 bg-sky-50 text-sky-900': t.tone === 'info',
      }"
      data-test="toast"
    >
      <UiIcon :name="t.tone === 'error' ? 'alert' : t.tone === 'info' ? 'info' : 'check'" class="mt-0.5 h-4 w-4 shrink-0" />
      <p class="flex-1">{{ t.message }}</p>
      <button type="button" class="opacity-60 hover:opacity-100" aria-label="Dismiss" @click="ui.dismiss(t.id)"><UiIcon name="close" class="h-4 w-4" /></button>
    </div>
  </div>
</template>
