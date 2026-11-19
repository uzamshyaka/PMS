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
    env: { PORT: String(PORT) },
    reuseExistingServer: false,
    timeout: 30_000,
  },
})
