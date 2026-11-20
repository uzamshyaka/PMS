import { defineVitestConfig } from '@nuxt/test-utils/config'

// Runs every test inside a Nuxt runtime (auto-imports, Pinia, plugins) on happy-dom.
export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    environmentOptions: {
      nuxt: {
        domEnvironment: 'happy-dom',
        // Unit/component tests use the sample catalogue and the in-memory admin services.
        overrides: { runtimeConfig: { public: { demoCatalogue: true, adminDataSource: 'mock' } } },
      },
    },
    include: ['tests/**/*.spec.ts'],
  },
})
