import { expect, test } from '@playwright/test';

test('should have a title', async ({ page }) => {
  await page.goto('/plugin/octodash/');
  await expect(page).toHaveTitle(/OctoDash/);
});
