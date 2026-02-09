import { test as baseTest, expect } from '@playwright/test';
import { clerk, clerkSetup } from '@clerk/testing/playwright';
import { acquireAccount } from './utils';
import fs from 'fs';
import path from 'path';

export * from '@playwright/test';
export const test = baseTest.extend<{}, { workerStorageState: string }>({
  // Use the same storage state for all tests in this worker.
  storageState: ({ workerStorageState }, use) => use(workerStorageState),

  // Authenticate once per worker with a worker-scoped fixture.
  workerStorageState: [async ({ browser }, use) => {
    // Use parallelIndex as a unique identifier for each worker.
    const id = test.info().parallelIndex;
    const fileName = `./playwright/.auth/${id}.json`;

    if (fs.existsSync(fileName)) {
      // Reuse existing authentication state if any.
      await use(fileName);
      return;
    }
    // Important: make sure we authenticate in a clean environment by unsetting storage state.
    const page = await browser.newPage({ storageState: undefined });

    // Acquire a unique account, for example create a new one.
    // Alternatively, you can have a list of precreated accounts for testing.
    // Make sure that accounts are unique, so that multiple team members
    // can run tests at the same time without interference.

    await clerkSetup();

    const account = await acquireAccount(id);

    // Perform authentication steps. Replace these actions with your own.
    
    await page.goto('http://localhost:5173/', {waitUntil: 'load'});

    await clerk.loaded({page});
    
    await clerk.signIn({
    page,
    signInParams: {identifier: account.username, strategy: 'password', password: account.password}
    });
    
    await page.goto("http://localhost:5173/gallery?type=image", {waitUntil: "load"});
    await expect(page.getByLabel('Open user menu')).toBeVisible();
    
    // End of authentication steps.

    await page.context().storageState({ path: fileName });
    await page.close();
    await use(fileName);
  }, { scope: 'worker' }],
});