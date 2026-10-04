import { expect, test } from '@playwright/test';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

const getVersionFromPip = async () => {
  const whichOutput = await execPromise('which python3');
  const systemPython = whichOutput.stdout.trim();
  const pythonPath = process.env.OCTODASH_PYTHON_PATH || systemPython;

  const output = await execPromise(`${pythonPath} -m pip show octoprint_octodash`);
  const versionLine = output.stdout.split('\n').find((line: string) => line.startsWith('Version:'));
  if (versionLine) {
    const version = versionLine.split(':')[1].trim();
    return version;
  } else {
    throw new Error('Version not found in pip show output');
  }
};

test.describe('Settings Version Display Test', () => {
  let pipVersion: string;

  test.beforeAll(async () => {
    pipVersion = await getVersionFromPip();
  });
  test.beforeEach(async ({ page }) => {
    await page.goto('/plugin/octodash/');
  });
  test('displayed version', async ({ page }) => {
    const gear = page.locator('[icon="gear"]');
    await gear.click();

    const aboutlink = page.getByText('about').first();
    await aboutlink.click();

    const version = page.getByText(/v\d+\.\d+\.\d+/);
    await expect(version).toHaveText(`v${pipVersion}`);
  });

  test('failure case', async ({ page, context }) => {
    await context.route('**/plugin/octodash/api/update_check', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });
    const gear = page.locator('[icon="gear"]');
    await gear.click();

    const aboutlink = page.getByText('about').first();
    await aboutlink.click();

    const version = page.getByText('Error fetching version');
    await expect(version).toBeVisible();
  });
});
