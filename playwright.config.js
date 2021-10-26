// @ts-check

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
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