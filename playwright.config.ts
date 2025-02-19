import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 20 : '100%',
  reporter: process.env.CI ? 'html' : 'line',
  maxFailures: process.env.CI ? 5 : 1,
  use: {
    baseURL: 'http://localhost:5173',
    trace: process.env.CI ? 'on-first-retry' : 'off',
    screenshot: process.env.CI ? 'only-on-failure' : 'off',
    actionTimeout: process.env.CI ? 15000 : 3000,
    navigationTimeout: process.env.CI ? 15000 : 3000,
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: process.env.CI ? 120000 : 5000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
  expect: {
    timeout: process.env.CI ? 15000 : 1000,
  },
  globalTimeout: process.env.CI ? 600000 : 60000,
}); 