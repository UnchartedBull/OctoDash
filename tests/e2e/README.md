# End-To-End Playwright tests

This folder contains some Playwright tests. They do not come close to representing full coverage

## Setup

On top of `npm install`, you'll need to install some Playwright-specific stuff:

```bash
npx playwright install --with-deps
```

You'll also need to configure the env var `OCTODASH_API_KEY` with the API key for your OctoDash instance. You can find this in the OctoDash settings under "API Key". See [Environment Variables](#environment-variables) for more details.

## Running the tests

You can run the tests with:

```bash
npx playwright test
```

## Configuration

### Environment Variables

| Variable               | Required | Description                                                                                                                                                                               |
| ---------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OCTODASH_API_KEY`     | Yes      | The API key for your OctoDash instance                                                                                                                                                    |
| `OCTODASH_PYTHON_PATH` | No       | If OctoPrint is not installed in the default Python environment, this should point to the correct Python interpreter, eg `~/venv/bin/python`                                              |
| `PLAYWRIGHT_BASEURL`   | No       | The URL of your OctoPrint instance. Defaults to `http://localhost:8080`                                                                                                                   |
| `NO_SERVER`            | No       | If set, the tests will not attempt to spin up an OctoPrint instance. This is useful if you already have one running and don't want to start a new one                                     |
| `OCTOPRINT_CONFIG_DIR` | No       | The path to your OctoPrint config directory. Used for spinning up the OctoPrint instance if needed. The default path used by OctoPrint varies by platform                                 |
| `CI`                   | No       | Set by default by many CI services. Disables use of existing OctoPrint server, enables reportig of test results as GitHub Actions summaries, enables retries, and assorted other settings |

These can simply be set in your shell environment. If using the Playwright VS Code extension, you can also set them in `playwright.env` in your workspace settings.
