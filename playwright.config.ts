// eslint-disable no-use-before-define
// @ts-nocheck
import { devices } from '@playwright/test';

const config = {
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reportSlowTests: {
    max: 30_000,
    threshold: 50_000,
  },
  reporter: [['list'], ['html'], ...(process.env.CI ? [['github']] : [])],
  use: {
    actionTimeout: 0,
    baseURL: process.env.PLAYWRIGHT_BASEURL || 'http://localhost:8080',
    testIdAttribute: 'data-test-id',
    trace: 'on',
    video: 'on',
    viewport: { width: 1280, height: 720 },
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },
  ],
};

if (!process.env.NO_SERVER) {
  const octoprintServerOpts = process.env.OCTOPRINT_SERVER_BASE ? `-b ${process.env.OCTOPRINT_SERVER_BASE}` : '';

  config.webServer = {
    command: `octoprint ${octoprintServerOpts} serve --host 127.0.0.1 --port 8080`,
    url: 'http://127.0.0.1:8080/online.txt',
    reuseExistingServer: !process.env.CI,
  };
}

export default config;
