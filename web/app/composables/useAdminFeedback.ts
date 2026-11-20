import type { ConfirmOptions } from '~/stores/admin-ui'

/**
 * Confirmation dialogs and toasts for admin actions, plus `run`, which wraps a
 * service call with success/failure feedback so pages don't repeat try/catch.
 */
export function useAdminFeedback() {
  const ui = useAdminUiStore()
  const suffix = useRuntimeConfig().public.adminDataSource === 'mock' ? ' (prototype: not saved)' : ''

  async function run<T>(action: () => Promise<T>, success: string): Promise<T | undefined> {
    try {
      const result = await action()
      ui.toast(`${success}${suffix}`, 'success')
      return result
    }
    catch (e) {
      ui.toast(toApiError(e).message, 'error', 6000)
      return undefined
    }
  }

  return {
    confirm: (options: ConfirmOptions) => ui.confirm(options),
    toast: (message: string, tone: 'success' | 'error' | 'info' = 'success', timeout?: number) => ui.toast(tone === 'success' ? `${message}${suffix}` : message, tone, timeout),
    run,
  }
}

/** Override the header title for dynamic pages (e.g. a vehicle's name). */
export function useAdminTitle(title: MaybeRefOrGetter<string | undefined>) {
  const state = useState<string | undefined>('admin-page-title', () => undefined)
  watchEffect(() => { state.value = toValue(title) })
  onBeforeUnmount(() => { state.value = undefined })
}
