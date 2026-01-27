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


  [ 
    {fileName: 'cat.jpg', input: 'cat in nature', tags: [{name: 'cat', color: '#eba8ff'}, {name: 'nature', color: '#19ff79'}], editedInput: "cat outside"},
    {fileName: 'birds.jpg', input: 'birds on a branch', tags: [{name: 'bird', color: '#2e3fff'}, {name: 'nature', color: '#ffffff'}], editedInput: null},
    {fileName: 'sunset.jpg', input: 'sunset', tags: [{name: 'sunset', color: '#ff9f19'}, {name: 'sky', color: '#2ec0ff'}], editedInput: null}
  ].forEach(({fileName, input, tags, editedInput}) => {
      test(`add ${fileName} with tags`, async ({ page }) => {
        await page.goto("/gallery?type=image");

        await page.getByTestId('add-image').click();

        await expect(page).toHaveURL("/addimage");

        await expect(page.getByTestId('drop-zone')).toBeVisible();
        
        await page.getByTestId('drop-zone').click();
        
        await page.getByRole('button', { name: 'Drag-and-drop image or click' }).setInputFiles(path.join(__dirname, 'test-images', fileName));

        await expect(page.getByRole('img', {name: fileName})).toBeVisible();

        await page.getByRole('textbox', {name: 'Title'}).clear();
        await page.getByRole('textbox', {name: 'Title'}).fill(input);
        await expect(page.getByRole('textbox', {name: 'Title'})).toHaveValue(input);

        for (const {name, color} of tags) {
          await page.getByTestId('add-tag').click();
          await expect(page.getByTestId('add-tag')).not.toBeVisible();

          await page.getByRole('textbox', { name: 'Enter tag here' }).click();
          await page.getByRole('textbox', { name: 'Enter tag here' }).fill(name);

          await page.getByTestId('color-input').click();
          await page.getByTestId('color-input').fill(color);

          await page.getByTestId('submit-tag').click();
          await expect(page.getByTestId('submit-tag')).not.toBeVisible();
          
          await expect(page.getByTestId(`tag-${name}`)).toBeVisible(); 
          await expect(page.getByTestId(`tag-${name}`)).toHaveCSS('backgroundColor', color);             
            
          await page.getByTestId(`tag-${name}-options`).click();
          await expect(page.getByText("Edit")).toBeVisible();
          await expect(page.getByText("Delete")).toBeVisible();
        
          await page.getByRole('button', {name: 'Save changes'}).click();

          await page.waitForURL('/gallery?type=image');

          await expect(page).toHaveURL('/gallery?type=image');
          await expect(page.getByTestId(`image-${input}`)).toBeVisible();
        }
      });

      test(`view ${fileName}`, async ({ page }) => {
        await page.getByTestId(`image-${input}`).click();

        await expect(page).toHaveURL(url => {
          const params = url.searchParams;
          return params.has('type') && params.has('id');
        });

        await expect(page.getByTestId("title")).toBeVisible();

        // img alt is a combination of the image title and tag title(s)
        const alt = input + ' ' + tags.reduce((acc, tag) => acc + tag.name + " ", "").trim();
        await expect(page.getByRole('img', {name: alt})).toBeVisible();
        await expect(page.getByTestId(`tag-${input}`)).toBeVisible();

        const currentDate = new Date(Date.now()).toLocaleDateString();
        await expect(page.getByText(`Date Available: ${currentDate}`)).toBeVisible();
      
        await page.getByTestId('hide-info').click();
        
        await expect(page.getByTestId("title")).not.toBeVisible();
        await expect(page.getByRole('img', {name: alt})).toBeVisible();
        await expect(page.getByTestId(`tag-${input}`)).not.toBeVisible();
        await expect(page.getByText(/Date Available/)).not.toBeVisible();

        await page.getByTestId('hide-info').click();
      });

      test(`edit ${fileName}`, async ({ page }) => {
        await page.getByTestId('image-options').click();

        await expect(page.getByText('Edit Image')).toBeVisible();
        await expect(page.getByTestId('delete-image')).toBeVisible();

        await expect(page).toHaveURL(/\/editimage/);

        
        //await expect(page.getByRole('img', {name: fileName})).toBeVisible();

        await expect(page.getByRole('textbox', {name: 'Title'})).toHaveValue(input);
        
        if (editedInput) {
          await page.getByRole('textbox', {name: 'Title'}).clear();
          await page.getByRole('textbox', {name: 'Title'}).fill(editedInput);
        }

        for (const {name, color} of tags) {
          await expect(page.getByTestId(`tag-${name}`)).toBeVisible();
          await expect(page.getByTestId(`tag-${name}`)).toHaveCSS('color', color);
        }

        await page.getByRole('button', {name: 'Save Changes'}).click();

        await expect(page).toHaveURL('/gallery?type=image');
      });


    });

  });
    