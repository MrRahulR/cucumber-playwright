const { Given, When, Then } = require('@cucumber/cucumber');
const { Index } = require('../page-objects/Index');
const playwright = require('@playwright/test');

Given('user opens the website', async () => {
  const browser = await playwright.chromium.launch();

  const context = await browser.newContext({
    javaScriptEnabled: true,
  });

  const page = await context.newPage();
  const pageManager = new Index(page);

  await page.goto('/loginpagePractise/', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle('LoginPage Practise | Rahul Shetty Academy');
});

Given(
  'user logged in with {string} and {string}',
  async (username, password) => {
    const browser = await playwright.chromium.launch();

    const context = await browser.newContext({
      javaScriptEnabled: true,
    });

    const page = await context.newPage();
    const pageManager = new Index(page);

    await page.goto('/loginpagePractise/', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle('LoginPage Practise | Rahul Shetty Academy');

    await pageManager.getLoginPage().openLogin();
    await pageManager.getLoginPage().loginWith(username, password);
  },
);

When('user adds {string} to the cart', (item) => {
  return 'pending';
});

When('user clicks on the Cart', () => {
  return 'pending';
});

Then('user should see added item {string} in the cart', (item) => {
  return 'pending';
});
