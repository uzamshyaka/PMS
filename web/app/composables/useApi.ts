/** The shared, credentialed API client provided by plugins/api.ts. */
export function useApi() {
  return useNuxtApp().$api
}
