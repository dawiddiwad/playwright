// @ts-check

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  reporter: [['html', { outputFolder: 'playwright-report' }], ['list']],
  repeatEach: 20,
  retries: 2,
  workers: 2,
  use: {
    actionTimeout: 10000,
    headless: true,
    viewport: { width: 1368, height: 768 },
    ignoreHTTPSErrors: true,
    video: {
      mode: "on",
      size: {
        width: 600,
        height: 400
      }
    },
  },
};

module.exports = config;
