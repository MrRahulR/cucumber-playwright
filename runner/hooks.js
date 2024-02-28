const { BeforeAll, AfterAll, Before, After } = require('@cucumber/cucumber');
const playwright = require('@playwright/test');
const fs = require('fs');
const path = require('path');

BeforeAll(async () => {
  global.browser = await playwright.chromium.launch({ headless: true });
});

AfterAll(async () => {
  await global.browser.close();
});
