import { clerk, clerkSetup } from '@clerk/testing/playwright'
import { test as setup, expect } from '@playwright/test'
import * as path from 'path'

setup.describe.configure({ mode: 'serial' })

setup('global setup', async ({}) => {
    await clerkSetup();
});

const authFile = path.join(__dirname, '../playwright/.clerk/user.json');

setup('authenticate and save state to storage', async ({ page }) => {
  await page.goto('http://localhost:5173', {waitUntil: 'load'});
  
  await clerk.loaded({page});
  
  await clerk.signIn({
  page,
  signInParams: {
    strategy: 'password',
    identifier: process.env.E2E_CLERK_USER_USERNAME!,
    password: process.env.E2E_CLERK_USER_PASSWORD!,
  },
});

  await page.goto("http://localhost:5173/dashboard", {waitUntil: "load"});
  
  await expect(page.getByLabel('Open user menu')).toBeVisible();

  await page.context().storageState({ path: authFile });
});