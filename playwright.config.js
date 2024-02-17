const { defineConfig } = require('@playwright/test');

export default defineConfig({
  testDir: './tests',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  fullyParallel: true,
  workers: process.env.CI ? 1 : undefined,
  timeout: 30 * 1000,
  reporter: [
    ['html'],
    ['line'],
    ['json'],
    [
      'allure-playwright',
      {
        detail: true,
        outputFolder: 'allure-results',
        suiteTitle: false,
      },
    ],
  ],
  expect: {
    timeout: 5 * 1000,
    toHaveScreenshot: { maxDiffPixelRatio: 0 },
    toMatchSnapshot: {
      threshold: 0.2,
      maxDiffPixelRatio: 0.1,
      maxDiffPixels: 200,
    },
  },
  use: {
    baseURL: 'https://rahulshettyacademy.com/',
    browserName: 'chromium',
    headless: process.env.CI ? true : false,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: process.env.CI ? 'retain-on-failure' : 'off',
    viewport: { width: 1280, height: 720 },
  },
});
