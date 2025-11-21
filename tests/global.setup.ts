import { clerk, clerkSetup } from '@clerk/testing/playwright'
import { test as setup, expect } from '@playwright/test'
import * as path from 'path'

setup.describe.configure({ mode: 'serial' })

setup('global setup', async ({}) => {
    await clerkSetup();
});

const authFile = path.join(__dirname, '../playwright/.clerk/user.json');

setup('authenticate and save state to storage', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  
  await clerk.signIn({
    page,
    emailAddress: process.env.TEST_USER_EMAIL,
  })

  await page.goto("http://localhost:5173/dashboard", {waitUntil: "load"});
  
  await expect(page.getByLabel('Open user menu')).toBeVisible();

  await page.context().storageState({ path: authFile });
});