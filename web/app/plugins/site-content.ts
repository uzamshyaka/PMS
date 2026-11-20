import type { ApiEnvelope } from '~/types/api'
import type { SiteContent } from '~/composables/useSiteContent'

/**
 * Loads website content from the public API before the first render (the
 * server waits for this plugin; the browser reuses the server's result).
 * Falls back to built-in defaults if the API is unreachable.
 */
export default defineNuxtPlugin({
  name: 'site-content',
  dependsOn: ['api'],
  async setup() {
    const state = useState<SiteContent | null>('site-content', () => null)
    if (state.value) return
    if (useRuntimeConfig().public.demoCatalogue === true) {
      state.value = defaultSiteContent()
      return
    }
    try {
      const remote = (await useNuxtApp().$api<ApiEnvelope<Partial<SiteContent>>>('/api/v1/public/site')).data
      state.value = mergeSiteContent(remote)
    }
    catch {
      state.value = defaultSiteContent()
    }
  },
})
