import { defineVitestConfig } from '@nuxt/test-utils/config'

// Runs every test inside a Nuxt runtime (auto-imports, Pinia, plugins) on happy-dom.
export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    environmentOptions: {
      nuxt: { domEnvironment: 'happy-dom' },
    },
    include: ['tests/**/*.spec.ts'],
  },
})
