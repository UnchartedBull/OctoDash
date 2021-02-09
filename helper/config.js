/* eslint-disable @typescript-eslint/no-var-requires */

const Store = require('electron-store');
const Ajv = require('ajv');
const configSchema = require('./config.schema');

let store;
const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(configSchema);

function readConfig(window) {
  try {
    if (!store) {
      store = new Store();
    }
    const config = store.get('config');
    window.webContents.send('configRead', config);
  } catch {
    window.webContents.send('configError', "Can't read config file.");
  }
}

function saveConfig(window, config) {
  if (validate(config)) {
    store.set('config', config);
    window.webContents.send('configSaved', config);
  } else {
    window.webContents.send('configError', "Can't save config.");
  }
}

function checkConfig(window, config) {
  if (!validate(config)) {
    const errors = [];
    validate.errors?.forEach(error => {
      if (error.keyword === 'type') {
        errors.push(`${error.dataPath} ${error.message}`);
      } else {
        errors.push(`${error.dataPath === '' ? '.' : error.dataPath} ${error.message}`);
      }
    });

    window.webContents.send('configFail', errors);
  } else {
    window.webContents.send('configPass');
  }
}

module.exports = { readConfig, saveConfig, checkConfig };
