import { defineStore } from 'pinia'

export interface ConfirmOptions {
  title: string
  message: string
  confirmLabel?: string
  tone?: 'default' | 'danger'
  /** Require a written reason (e.g. rejecting a listing). */
  reason?: { label: string, minLength: number, placeholder?: string }
}

export interface ConfirmResult {
  confirmed: boolean
  reason?: string
}

export interface Toast {
  id: number
  tone: 'success' | 'error' | 'info'
  message: string
}

/** Shared admin UI state: the confirmation dialog and toast notifications. */
export const useAdminUiStore = defineStore('admin-ui', () => {
  const confirmState = ref<(ConfirmOptions & { resolve: (r: ConfirmResult) => void }) | null>(null)
  const toasts = ref<Toast[]>([])
  let toastId = 0

  function confirm(options: ConfirmOptions): Promise<ConfirmResult> {
    confirmState.value?.resolve({ confirmed: false })
    return new Promise((resolve) => { confirmState.value = { ...options, resolve } })
  }

  function settle(result: ConfirmResult) {
    confirmState.value?.resolve(result)
    confirmState.value = null
  }

  function toast(message: string, tone: Toast['tone'] = 'success', timeout = 4000) {
    const id = ++toastId
    toasts.value.push({ id, tone, message })
    if (timeout && import.meta.client) setTimeout(() => dismiss(id), timeout)
  }

  function dismiss(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return { confirmState, toasts, confirm, settle, toast, dismiss }
})
