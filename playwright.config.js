// @ts-check

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  reporter: [['html', { outputFolder: 'playwright-report' }]],
  repeatEach: 3,
  retries: 0,
  workers: 1,
  use: {
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