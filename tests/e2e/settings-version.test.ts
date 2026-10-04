import { expect, test } from '@playwright/test';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

const getVersionFromPip = async () => {
  const whichOutput = await execPromise('which python3');
  const systemPython = whichOutput.stdout.trim();
  const pythonPath = process.env.OCTODASH_PYTHON_PATH || systemPython;

  return new Promise<string>((resolve, reject) => {
    exec(`${pythonPath} -m pip show octoprint_octodash`, (error: Error, stdout: string) => {
      if (error) {
        reject(error);
      } else {
        const versionLine = stdout.split('\n').find((line: string) => line.startsWith('Version:'));
        if (versionLine) {
          const version = versionLine.split(':')[1].trim();
          resolve(version);
        } else {
          reject(new Error('Version not found in pip show output'));
        }
      }
    });
  });
};

test('displayed version', async ({ page }) => {
  const pipVersion = await getVersionFromPip();
  await page.goto('/plugin/octodash/');
  const gear = page.locator('[icon="gear"]');
  await gear.click();

  const aboutlink = page.getByText('about').first();
  await aboutlink.click();

  const version = page.getByText(/v\d+\.\d+\.\d+/);
  await expect(version).toHaveText(`v${pipVersion}`);
});
