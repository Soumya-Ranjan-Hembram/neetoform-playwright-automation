import { defineConfig, devices } from '@playwright/test';

export const STORAGE_STATE = "./auth/session.json";


export default defineConfig({
  testDir: './e2e/tests',

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // workers: process.env.CI ? 1 : undefined,
  workers: 1,
  reporter: 'html',
  use: {
    trace: 'on',
    baseURL: "https://neeto-form-web-playwright.neetodeployapp.com",
    testIdAttribute: "data-cy",
  },

  projects: [
    {
      name: 'login',
      use: { ...devices['Desktop Chrome'] },
      testMatch: "**/login.setup.ts",
    },
    {
      name: "teardown",
      use: { ...devices["Desktop Chrome"] },
      testMatch: "**/global.teardown.ts",
    },
    {
      name: "Logged In tests",
      use: { ...devices["Desktop Chrome"], storageState: STORAGE_STATE },
      dependencies: ["login"],
      teardown: "teardown",
      testMatch: "**/*.spec.ts",
    },
  ],
});
