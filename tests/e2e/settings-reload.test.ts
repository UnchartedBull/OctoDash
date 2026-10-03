import { expect, test } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.playwright' });

const apiKey = process.env.OCTODASH_API_KEY || '';

const login = async (page) => {
  await page.goto('/plugin/octodash/login');
  const input = page.getByLabel('API Key:');
  const button = page.getByRole('button', { name: 'Continue' });

  await input.fill(apiKey);
  await button.click();
  // expect to be on the main screen /main-screen
  await expect(page).toHaveURL(/\/main-screen$/);
  const header = page.getByText('OctoDash');
  await expect(header).toBeVisible();
}

const triggerSettingsUpdate = async (request) => {
  const newsettings = {
    plugins: {
      octodash: {
        printer: {
          name: 'Updated name'
        }
      },
    },
  };
  const response = await request.post('/api/settings', {
    data: newsettings,
    headers: {
      Authorization: `Bearer ${apiKey}`,
    }
  });

  if (!response.ok()) {
    throw new Error(`Failed to update settings: ${response.status()} ${response.statusText()}`);
  }
}

const verifyReload = async (page) => {
  // expect the page to reload and be on the main screen
  await expect(page).toHaveURL(/\/main-screen$/);
  const header = page.getByText('OctoDash');
  await expect(header).toBeVisible();
}

test.describe('Should reload the page when settings are updated while on ', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });
  
  test('files page', async ({ page, request }) => {

    const filesLink = page.getByText('files');
    await filesLink.click();

    await triggerSettingsUpdate(request);

    // expect the page to reload and be on the main screen
    await verifyReload(page);
  });

  test('filament page', async ({ page, request }) => {
    // find the filament router link
    const filamentLink = page.getByText('filament');
    await filamentLink.click();

    await triggerSettingsUpdate(request);

    // expect the page to reload and be on the main screen
    await verifyReload(page);
  });
});