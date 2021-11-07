// @ts-check

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  reporter: [['html', { outputFolder: 'playwright-report' }], ['list']],
  repeatEach: 1,
  retries: 2,
  workers: 2,
  use: {
    actionTimeout: 10000,
    headless: true,
    viewport: { width: 1366, height: 768 },
    ignoreHTTPSErrors: true,
    video: {
      mode: "on",
      size: {
        width: 683,
        height: 384
      }
    },
  },
};

module.exports = config;
