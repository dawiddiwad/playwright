// @ts-check

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  reporter: [['html', { outputFolder: 'playwright-report' }]],
  repeatEach: 1,
  retries: 3,
  workers: 2,
  use: {
    headless: true,
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
    video: {
      mode: "on",
      size: {
        width: 1920,
        height: 1080
      }
    },
  },
};

module.exports = config;