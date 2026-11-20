import { defineConfig, devices } from '@playwright/test'

/**
 * Layout and smoke checks for the public site, run against the production
 * build (`npm run build` first). Screenshots are written to e2e/screenshots/
 * for side-by-side comparison with the design reference.
 */
const PORT = 3100

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: 'node .output/server/index.mjs',
    url: `http://localhost:${PORT}`,
    // Layout tests run on the labelled sample vehicles and the in-memory admin
    // prototype, so they need no backend.
    env: { PORT: String(PORT), NUXT_PUBLIC_DEMO_CATALOGUE: 'true', NUXT_PUBLIC_ADMIN_DATA_SOURCE: 'mock' },
    reuseExistingServer: false,
    timeout: 30_000,
  },
})
