import { test as baseTest, expect } from '@playwright/test';
import { clerk, clerkSetup } from '@clerk/testing/playwright';
import fs from 'fs';
import path from 'path';

export * from '@playwright/test';
export const test = baseTest.extend<{}, { workerStorageState: string }>({
  storageState: ({ workerStorageState }, use) => use(workerStorageState),

  workerStorageState: [async ({ browser }, use) => {
    // Use parallelIndex as a unique identifier for each worker.
    const id = test.info().parallelIndex;
    const fileName = `./playwright/.auth/${id}.json`;

    if (fs.existsSync(fileName)) {
      await use(fileName);
      return;
    }

    const page = await browser.newPage({ storageState: undefined });

    await clerkSetup();
    
    await page.goto('http://localhost:5173/', {waitUntil: 'load'});

    await clerk.loaded({page});
    
    await clerk.signIn({
    page,
    signInParams: {identifier: `user-${id}`, strategy: 'password', password: `${process.env.CLERK_SECRET_KEY}-${id}`}
    });
    
    await page.goto("http://localhost:5173/gallery?type=image", {waitUntil: "load"});
    await expect(page.getByLabel('Open user menu')).toBeVisible();

    await page.context().storageState({ path: fileName });
    await page.close();

    await use(fileName);
  }, { scope: 'worker' }],
});