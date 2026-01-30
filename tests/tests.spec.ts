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

  const testData = [ 
    {fileName: 'cat.jpg', input: 'cat in nature', tags: ['cat', 'nature'], editedInput: "cat outside"},
    {fileName: 'birds.jpeg', input: 'birds on a branch', tags: ['bird','nature']},
    {fileName: 'sunset.jpg', input: 'sunset', tags: ['sunset', 'sky']}
  ];

  testData.forEach(({fileName, input, tags, editedInput}) => {
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

        for (const tagName of tags) {
          await page.getByTestId('add-tag').click();
          await expect(page.getByTestId('add-tag')).not.toBeVisible();

          await page.getByRole('textbox', { name: 'Enter tag here' }).click();
          await page.getByRole('textbox', { name: 'Enter tag here' }).fill(tagName);

          await page.getByTestId('submit-tag').click();
          await expect(page.getByTestId('submit-tag')).not.toBeVisible();
          
          await expect(page.getByTestId(`tag-${tagName}`)).toBeVisible(); 

          await expect(page.getByTestId(`tag-${tagName}-options`)).toBeVisible();
        }

        await page.getByRole('button', {name: 'Save changes'}).click();

        await page.waitForURL('/gallery?type=image');

        await expect(page).toHaveURL('/gallery?type=image');
        await expect(page.getByTestId(`image-${input}`)).toBeVisible();
      });

      test(`view ${fileName}`, async ({ page }) => {
        await page.goto("/gallery?type=image");
        await page.getByTestId(`image-${input}`).click();

        await expect(page).toHaveURL(url => {
          const params = url.searchParams;
          return params.has('type') && params.has('id');
        });

        await expect(page.getByTestId("title")).toBeVisible();

        await expect(page.getByTestId('view-image')).toBeVisible();

        for (const tagName of tags) {
          await expect(page.getByTestId(`tag-${tagName}`)).toBeVisible();
        }

        await expect(page.getByText(/Date Uploaded/)).toBeVisible();
      
        await page.getByTestId('hide-info').click();
        
        await expect(page.getByTestId("title")).not.toBeVisible();
        await expect(page.getByTestId(`tag-${input}`)).not.toBeVisible();
        await expect(page.getByText(/Date Uploaded/)).not.toBeVisible();
      });

      test(`edit ${fileName} title`, async ({ page }) => {
        async function editTitle(title : string, editedTitle: string) {
          await page.goto("/gallery?type=image");

          await page.getByTestId(`image-${title}`).click();
          await page.getByTestId('image-options').click();

          await expect(page.getByText('Edit Image')).toBeVisible();
          await expect(page.getByTestId('delete-image')).toBeVisible();

          await page.getByText('Edit Image').click();
          await expect(page).toHaveURL(/\/editimage/);

          
          //await expect(page.getByRole('img', {name: fileName})).toBeVisible();

          await expect(page.getByRole('textbox', {name: 'Title'})).toHaveValue(title);
          
          await page.getByRole('textbox', {name: 'Title'}).clear();
          await page.getByRole('textbox', {name: 'Title'}).fill(editedTitle);
  
          for (const tagName of tags) {
            await expect(page.getByTestId(`tag-${tagName}`)).toBeVisible();
          }

          await page.getByRole('button', {name: 'Save Changes'}).click();

          await page.waitForURL('/gallery?type=image');
          await expect(page).toHaveURL('/gallery?type=image');
        }

        if (editedInput) {
          await editTitle(input, editedInput);
          await editTitle(editedInput, input);
        }
      });

      test(`view ${fileName} tags`, async ({ page }) => {
        await page.goto("/gallery?type=image");
        await page.getByTestId('tag-view').click();

        await expect(page).toHaveURL('/gallery?type=tag');

        for (const tagName of tags) {
          await expect(page.getByTestId(`tag-${tagName}`)).toBeVisible();
        }
      });

      test(`clicking on tag shows ${fileName}`, async ({ page }) => {
        for (const tagName of tags) {
          await page.goto('/gallery?type=tag');
          await page.getByTestId(`tag-${tagName}`).click();
          
          await expect(page).toHaveURL(url => {
            const params = url.searchParams;
            return !params.has('type') && params.get('query') === tagName;
          })

          await expect(page.getByText('Search Results')).toBeVisible();

          await expect(page.getByTestId(`image-${input}`)).toBeVisible();
        }
      });

      test(`attempting to add image with title ${input}`, async ({ page }) => {
        await page.goto('/gallery?type=image');

        await page.getByTestId('add-image').click();

        await page.getByTestId('drop-zone').click();
        
        await page.getByRole('button', { name: 'Drag-and-drop image or click' }).setInputFiles(path.join(__dirname, 'test-images', fileName));

        await page.getByRole('textbox', {name: 'Title'}).clear();
        await page.getByRole('textbox', {name: 'Title'}).fill(input);

        
        await page.getByRole('button', {name: 'Save changes'}).click();

        await expect(page.getByText(/Title already exists/)).toBeVisible();
        await expect(page).toHaveURL(/\/addimage/);
      });

      test(`searching tag will show ${fileName}`, async ({ page }) => {
        await page.goto(`/gallery?type=image`);

        await expect(page.getByTestId('search-tag')).toBeVisible();

        for (const tagName of tags) {
          await page.getByRole('textbox').fill(tagName);

          await expect(page.getByTestId('search-results')).toBeVisible();
          await expect(page.getByTestId(`search-${tagName}`)).toBeVisible();

          await page.keyboard.press("Enter");

           await expect(page).toHaveURL(url => {
            const params = url.searchParams;
            return !params.has('type') && params.get('query') === tagName;
          })

          await expect(page.getByText('Search Results')).toBeVisible();

          await expect(page.getByTestId(`image-${input}`)).toBeVisible();
        }
      });

      test(`searching ${input} shows view of image`, async ({ page }) => {
        await page.goto("/gallery?type=image");

        await page.getByTestId('select-search-options').click();

        await expect(page.getByTestId('search-image')).toBeVisible();

        await page.getByTestId('search-image').click();

        await expect(page.getByTestId('search-tag')).not.toBeVisible();

        await page.getByRole('textbox').fill(input);
        
        await expect(page.getByTestId('search-results')).toBeVisible();

        await expect(page.getByTestId(`search-${input}`)).toBeVisible();

        await page.getByTestId(`search-${input}`).click();

        await expect(page).toHaveURL(url => {
          const params = url.searchParams;
          return params.get('type') === 'image' && params.has('id');
        });
      });

      test(`deleting ${fileName} tags`, async ({ page }) => {        
        for (const tagName of tags) {
          await page.goto('/gallery?type=tag');

          await page.getByTestId('edit-tag').click();

          await expect(page.getByText("Click a tag to edit")).toBeVisible();

          if (page.getByTestId(`tag-${tagName}`).isVisible()) {
            await page.getByTestId(`tag-${tagName}`).click();

            await expect(page).toHaveURL(/edittag/);
            await expect(page.getByRole('button', {name: "Delete tag"})).toBeVisible();

            await page.getByRole('button', {name: "Delete tag"}).click();

            await expect(page.getByTestId('delete-warning')).toBeVisible();
            await expect(page.getByRole("button", {name: "Yes"})).toBeVisible();
            await expect(page.getByRole("button", {name: "No"})).toBeVisible();

            await page.getByRole("button", {name: "Yes"}).click();
            await page.waitForURL("/gallery?type=tag");

            await expect(page.getByTestId(`tag=${tagName}`)).not.toBeVisible();
          }
        }

        await page.goto('/gallery?type=image');
        await page.getByTestId(`image-${input}`).click();
        await expect(page.getByTestId('tags-view')).toBeEmpty();
      });
    });

    test(`unmatched search shows no results`, async ({ page }) => {
      await page.goto("/gallery?type=image");
      await page.getByRole('textbox').fill('qjfwoqpwfwqf');
      await page.keyboard.press('Enter');

      await expect(page.getByText(/No results/)).toBeVisible();
    });

    /* test('sorting images in gallery page', async ({ page }) => {
      await page.goto('/gallery?type=image');

      await page.getByTestId('sort-options').click();

      await expect(page.getByText('Last created')).toBeVisible();
      await expect(page.getByText('Last edited')).toBeVisible();
      await expect(page.getByText('Title')).toBeVisible();

      await page.getByText('Last created').click();

      const lastCreatedImgSrcs = testData.map((data) => data.fileName);

      const lastCreatedImgs = await page.getByTestId(/image/).all();

      for (let i = 0; i < lastCreatedImgs.length; i++) {
        await expect(lastCreatedImgs[i]).toHaveAttribute('src', lastCreatedImgSrcs[i]);
      }
      
      await page.getByTestId('sort-options').click();
      await page.getByText('Last edited').click();

      const lastEditedImgSrcs = testData.slice().sort((a, b) =>  b.editedInput ? 1 : -1).map((data) => data.fileName);
      const lastEditedImgs = await page.getByTestId(/image/).all();
  
      for (let i = 0; i < lastEditedImgs.length; i++) {
        await expect(lastEditedImgs[i]).toHaveAttribute('src', lastEditedImgSrcs[i]);
      }

      await page.getByTestId('sort-options').click();
      await page.getByText('Title').click();

      const AscTitleSrcs = testData.slice().sort((a, b) => {
        const titleA = a.editedInput ? a.editedInput.toLowerCase() : a.input.toLowerCase();
        const titleB = b.editedInput ? b.editedInput.toLowerCase() : b.input.toLowerCase();

        return titleA.localeCompare(titleB);
      }).map((data) => data.fileName);

      const AscTitleImgs = await page.getByTestId(/image/).all();
  
      for (let i = 0; i < lastEditedImgs.length; i++) {
        await expect(AscTitleImgs[i]).toHaveAttribute('src', AscTitleSrcs[i]);
      }
    }); */

    test('navigating through images in view mode', async ({ page }) => {
      await page.goto("/gallery?type=image");
      await page.getByTestId('sort-options').click();
      await page.getByText('Last created').click();

      const fileNames = testData.map((data) => data.fileName);

      await page.getByRole('img').first().click();

      for (let i = 0; i < fileNames.length; i++) {
        await expect(page.getByRole('img')).toHaveAttribute('src', fileNames[i]);
        
        if (i === 0) {
          await expect(page.getByTestId('arrow-left')).toBeDisabled();
        }
        else if (i === fileNames.length - 1) {
          await expect(page.getByTestId('arrow-right')).toBeDisabled();
        }

        await page.getByTestId('arrow-right').click();
      }

      for (let i = fileNames.length - 1; i > -1; i--) {
        await expect(page.getByRole('img')).toHaveAttribute('src', fileNames[i]);
        
        if (i === 0) {
          await expect(page.getByTestId('arrow-left')).toBeDisabled();
        }
        else if (i === fileNames.length - 1) {
          await expect(page.getByTestId('arrow-right')).toBeDisabled();
        }

        await page.getByTestId('arrow-left').click();
      }
    });
    
    test(`deleting all images`, async ({ page }) => {
      await page.goto(`/gallery?type=image`);

      for (const img of await page.getByRole('img').all()) {
        await img.click();
        
        await expect(page).toHaveURL(url => {
          const params = url.searchParams;
          return params.get('type') === 'image' && params.has('id');
        });

        await page.getByTestId('image-options').click();
        await page.getByTestId('delete-image').click();

        await expect(page.getByText(/Are you sure/)).toBeVisible();
        await expect(page.getByRole("button", {name: "Yes"})).toBeVisible();
        await expect(page.getByRole("button", {name: "No"})).toBeVisible();

        await page.getByRole("button", {name: "Yes"}).click();

        await page.waitForURL(`/gallery?type=image`);
      }

      await expect(page.getByRole('img')).not.toBeVisible();
    });
  });
    