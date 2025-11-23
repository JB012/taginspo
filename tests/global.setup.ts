import { clerk, clerkSetup } from '@clerk/testing/playwright'
import { test as setup, expect } from '@playwright/test'
import * as path from 'path'

setup.describe.configure({ mode: 'serial' })

setup('global setup', async ({}) => {
    await clerkSetup();
    if (!process.env.TEST_USER_EMAIL) {
      throw new Error(
        "Please provide TEST_USER_EMAIL environment variables."
      );
    }
});

const authFile = path.join(__dirname, '../playwright/.clerk/user.json');

setup('authenticate and save state to storage', async ({ page }) => {
  await page.goto('/', {waitUntil: 'load'});
  
  await expect(page).toHaveTitle(/TagInspo/);
  await clerk.loaded({page});
  
  await clerk.signIn({
    page,
    emailAddress: process.env.TEST_USER_EMAIL
  });

  await page.goto("/dashboard", {waitUntil: "load"});
  
  await expect(page.getByLabel('Open user menu')).toBeVisible();

  await page.context().storageState({ path: authFile });
});