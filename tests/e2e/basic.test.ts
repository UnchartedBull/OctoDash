import { expect, test } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.playwright', debug: true });

const apiKey = process.env.OCTODASH_API_KEY || '';
console.log('Using API key:', apiKey);

test('should have a title', async ({ page }) => {
  await page.goto('/plugin/octodash/');
  await expect(page).toHaveTitle(/OctoDash/);
});

test('should have a header', async ({ page }) => {
  await page.goto('/plugin/octodash/');
  await page.evaluate(key => localStorage.setItem('octodash_apikey', key), apiKey);
  await page.goto('/plugin/octodash/');
  const header = page.getByText('OctoDash');
  await expect(header).toBeVisible();
});
