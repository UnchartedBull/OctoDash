import { expect, selectors, test } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.playwright' });

const apiKey = process.env.OCTODASH_API_KEY || '';

test('should redirect to login', async ({ page }) => {
  await page.goto('/plugin/octodash/');
  const text = page.getByText('authenticate');
  // expect to be on the login screen /login
  await expect(page).toHaveURL(/\/login$/);

  await expect(text).toBeVisible();
});

test('should login successfully with provided API key', async ({ page }) => {
  await page.goto('/plugin/octodash/login');
  const input = page.getByLabel('API Key:');
  const button = page.getByRole('button', { name: 'Continue' });

  await input.fill(apiKey);
  await button.click();
  // expect to be on the main screen /main-screen
  await expect(page).toHaveURL(/\/main-screen$/);
  const header = page.getByText('OctoDash');
  await expect(header).toBeVisible();
});

test('should login successfully with username/password', async ({ page }) => {
  selectors.setTestIdAttribute('data-test-id');
  await page.goto('/plugin/octodash/login');
  const text = page.getByText('authenticate');
  await expect(text).toBeVisible();

  await page.goto('/');
  const loginText = page.getByText('please log in');
  await expect(loginText).toBeVisible();
  const usernameInput = page.getByTestId('login-username');
  const passwordInput = page.getByTestId('login-password');
  const loginButton = page.getByRole('button', { name: 'Log in' });

  await usernameInput.fill('admin');
  await passwordInput.fill('password');
  await loginButton.click();

  await page.waitForTimeout(2000);

  await page.goto('/plugin/octodash/');
  const header = page.getByText('OctoDash');
  await expect(header).toBeVisible();
});
