import { expect, test } from '@playwright/test';

['files', 'filament'].forEach(pageName => {
  test.describe(`Should reload the page when settings are updated while on ${pageName} page`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/plugin/octodash/`);
      const link = page.getByText(pageName);
      await link.click();
    });

    test('should reload the page when settings are updated', async ({ page, request }) => {
      const newsettings = {
        plugins: {
          octodash: {
            printer: {
              name: 'Updated name',
            },
          },
        },
      };
      const response = await request.post('/api/settings', {
        data: newsettings,
      });

      if (!response.ok()) {
        throw new Error(`Failed to update settings: ${response.status()} ${response.statusText()}`);
      }

      // expect the page to reload and be on the main screen
      await expect(page).toHaveURL(/\/main-screen$/);
      const header = page.getByText('OctoDash');
      await expect(header).toBeVisible();
    });
  });
});
