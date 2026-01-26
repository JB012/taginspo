import { test, expect } from '@playwright/test';
import path = require('path');


test.describe('not signed in tests', () => {  
  test.use({ storageState: { cookies: [], origins: [] } });
   
  test('has title', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/TagInspo/);
  });

  test('buttons are visible', async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole('button', {name: 'Sign Up'})).toBeVisible();
    await expect(page.getByRole('button', {name: 'Sign In'})).toBeVisible();
    await expect(page.getByRole('button', {name: 'Get Started'})).toBeVisible();
  });

});

test.describe('signed in tests', () => {
  test.use({ storageState: 'playwright/.clerk/user.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto("/gallery?type=image");
  });

  test('add an image with a tag', async ({ page }) => {
    await page.getByTestId('add-image').click();

    await expect(page).toHaveURL("/addimage");

    await expect(page.getByTestId('drop-zone')).toBeVisible();
    
    await page.getByTestId('drop-zone').click();
    
    await page.getByRole('button', { name: 'Drag-and-drop image or click' }).setInputFiles(path.join(__dirname, 'test-images', 'cat.jpg'));

    await expect(page.getByRole('img', {'name': 'cat.jpg'})).toBeVisible();
    await expect(page.getByRole('textbox', {name: 'Title'})).toHaveValue('cat');

    await page.getByTestId('add-tag').click();

    await page.getByRole('textbox', { name: 'Enter tag here' }).click();
    await page.getByRole('textbox', { name: 'Enter tag here' }).fill('cat');
    await page.getByTestId('color-input').click();
    await page.getByTestId('color-input').fill('#ffa3c8');

    await page.getByTestId('submit-tag').click();

    await expect(page.getByTestId('tag-cat')).toBeVisible();

    await page.getByTestId('tag-cat-options').click();
    
    await expect(page.getByText("Edit")).toBeVisible();
    await expect(page.getByText("Delete")).toBeVisible();

    await page.getByText("Edit").click();
    await page.getByTestId('edit-color').click();
    await page.getByTestId('edit-color').fill('#ffa3f3');
    await page.getByTestId('confirm-addtag').click();

    await page.getByRole('button', {name: 'Save changes'}).click();

    await page.waitForURL('/gallery?type=image');

    await expect(page).toHaveURL('/gallery?type=image');
    await expect(page.getByTestId('image-cat')).toBeVisible();  
  });

  test('view image', async ({ page }) => {
    await page.getByTestId('image-cat').click();

    await expect(page).toHaveURL(url => {
      const params = url.searchParams;
      return params.has('type') && params.has('id');
    });

    // img alt is a combination of the image title and tag title(s)
    await expect(page.getByRole('img', {name: 'cat cat'})).toBeVisible();
    await expect(page.getByTestId('tag-cat')).toBeVisible();
    await expect(page.getByText(/Date Available/)).toBeVisible();
  });
    
  // clean up
});