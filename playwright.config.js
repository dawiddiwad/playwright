// @ts-check

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  reporter: [['html', { outputFolder: 'playwright-report' }], ['list']],
<<<<<<< HEAD
  repeatEach: 1,
=======
  repeatEach: 20,
>>>>>>> master
  retries: 2,
  workers: 2,
  use: {
    actionTimeout: 10000,
    headless: true,
    viewport: { width: 1366, height: 768 },
    ignoreHTTPSErrors: true,
    video: {
      mode: "retain-on-failure",
      size: {
        width: 683,
        height: 384
      }
    },
  },
};

module.exports = config;
