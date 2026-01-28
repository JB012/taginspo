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
    {fileName: 'cat.jpg', input: 'cat in nature', tags: [{name: 'cat', color: '#eba8ff'}, {name: 'nature', color: '#19ff79'}], editedInput: "cat outside"},
    {fileName: 'birds.jpg', input: 'birds on a branch', tags: [{name: 'bird', color: '#2e3fff'}, {name: 'nature', color: '#19ff79'}]},
    {fileName: 'sunset.jpg', input: 'sunset', tags: [{name: 'sunset', color: '#ff9f19', editedColor: '#ff6021'}, {name: 'sky', color: '#2ec0ff'}]}
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
        let alt = input + " ";

        for (const tag of tags) {
          alt += tag.name + " ";
        }

        alt.trim(); 

        await expect(page.getByAltText(alt)).toBeVisible();
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

      test(`view ${fileName} tags`, async ({ page }) => {
        await page.getByTestId('tag-view').click();

        await expect(page).toHaveURL('/gallery?type=tag');

        for (const {name, color} of tags) {
          await expect(page.getByTestId(`tag-${name}`)).toBeVisible();
          await expect(page.getByTestId(`tag-${name}`)).toHaveCSS('backgroundColor', color);
        }
      });

      test(`clicking on tag shows ${fileName}`, async ({ page }) => {
        for (const {name, color} of tags) {
          await page.goto('/gallery?type=tag');
          await page.getByTestId(`tag-${name}`).click();
          
          await expect(page).toHaveURL(url => {
            const params = url.searchParams;
            return !params.has('type') && params.get('query') === name;
          })

          await expect(page.getByText('Search Results')).toBeVisible();

          if (editedInput) {
            await expect(page.getByTestId(`image-${editedInput}`)).toBeVisible();
          }
          else {
            await expect(page.getByTestId(`image-${input}`)).toBeVisible();
          }
        }
      });

      test(`attempting to add image with title \`${editedInput ? editedInput : input}\``, async ({ page }) => {
        await page.goto('/gallery?type=image');

        await page.getByTestId('add-image').click();

        await page.getByTestId('drop-zone').click();
        
        await page.getByRole('button', { name: 'Drag-and-drop image or click' }).setInputFiles(path.join(__dirname, 'test-images', fileName));

        await page.getByRole('textbox', {name: 'Title'}).clear();
        await page.getByRole('textbox', {name: 'Title'}).fill(editedInput ? editedInput : input);

        
        await page.getByRole('button', {name: 'Save changes'}).click();

        await expect(page.getByText(/Title already exists/)).toBeVisible();
        await expect(page).toHaveURL(/\/editimage/);
      });

      test(`searching tag will show ${fileName}`, async ({ page }) => {
        await page.goto(`/gallery?type=image`);

        await expect(page.getByTestId('search-tag')).toBeVisible();

        for (const {name} of tags) {
          await page.getByRole('textbox').fill(name);

          await expect(page.getByTestId('search-results')).toBeVisible();
          await expect(page.getByTestId(`search-${name}`)).toBeVisible();

          await page.keyboard.press("Enter");

           await expect(page).toHaveURL(url => {
            const params = url.searchParams;
            return !params.has('type') && params.get('query') === name;
          })

          await expect(page.getByText('Search Results')).toBeVisible();

          if (editedInput) {
            await expect(page.getByTestId(`image-${editedInput}`)).toBeVisible();
          }
          else {
            await expect(page.getByTestId(`image-${input}`)).toBeVisible();
          }
        }
      });

      test(`searching ${editedInput ? editedInput : input} shows view of image`, async ({ page }) => {
        await page.getByTestId('select-search-options').click();

        await expect(page.getByTestId('search-image')).toBeVisible();

        await page.getByTestId('search-image').click();

        await expect(page.getByTestId('search-tag')).not.toBeVisible();

        await page.getByRole('textbox').fill(editedInput ? editedInput : input);
        
        await expect(page.getByTestId('search-results')).toBeVisible();

        await expect(page.getByTestId(`search-${editedInput ? editedInput : input}`)).toBeVisible();

        await page.getByTestId(`search-${editedInput ? editedInput : input}`).click();

        await expect(page).toHaveURL(url => {
          const params = url.searchParams;
          return params.get('type') === 'image' && params.has('id');
        });
      });

    });

    test(`unmatched search shows no results`, async ({ page }) => {
      await page.getByRole('textbox').fill('qjfwoqpwfwqf');
      await page.keyboard.press('Enter');

      await expect(page.getByText(/No results/)).toBeVisible();
    });

    test('sorting images in gallery page', async ({ page }) => {
      await page.goto('/gallery?type=image');

      await page.getByTestId('sort-options').click();

      await expect(page.getByText('Last created')).toBeVisible();
      await expect(page.getByText('Last edited')).toBeVisible();
      await expect(page.getByText('Title')).toBeVisible();

      await page.getByText('Last created').click();

      const lastCreatedImgSrcs = testData.map((data) => data.fileName);

      const lastCreatedImgs = await page.getByRole('img').all();
    
      for (let i = 0; i < lastCreatedImgs.length; i++) {
        await expect(lastCreatedImgs[i]).toHaveAttribute('src', lastCreatedImgSrcs[i]);
      }
      
      await page.getByTestId('sort-options').click();
      await page.getByText('Last edited').click();

      const lastEditedImgSrcs = testData.slice().sort((a, b) =>  b.editedInput ? 1 : -1).map((data) => data.fileName);
      const lastEditedImgs = await page.getByRole('img').all();
  
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

      const AscTitleImgs = await page.getByRole('img').all();
  
      for (let i = 0; i < lastEditedImgs.length; i++) {
        await expect(AscTitleImgs[i]).toHaveAttribute('src', AscTitleSrcs[i]);
      }
    });

  });
    