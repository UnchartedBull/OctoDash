import fs from 'node:fs';

import { Ajv } from 'ajv';
import Store from 'electron-store';

import configSchema from './config.schema.json' with { type: 'json' };

let store;

const ajv = new Ajv({ useDefaults: true, allErrors: true });

// Define keywords for schema->TS converter
ajv.addKeyword('tsEnumNames');
ajv.addKeyword('tsName');
ajv.addKeyword('tsType');

const validate = ajv.compile(configSchema);

export function readConfig(window) {
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
export function resetConfig(window) {
  try {
    store.delete('config');
    window.webContents.send('configErased');
  } catch {
    window.webContents.send('configError', "Can't reset config file.");
  }
}
export function saveConfig(window, config) {
  if (validate(config)) {
    try {
      store.set('config', config);
      window.webContents.send('configSaved', config);
    } catch {
      window.webContents.send('configError', "Can't save config file.");
    }
  } else {
    window.webContents.send('configSaveFail', getConfigErrors());
  }
}
export function checkConfig(window, config) {
  if (!validate(config)) {
    window.webContents.send('configFail', getConfigErrors());
  } else {
    window.webContents.send('configPass');
  }
}
function getConfigErrors() {
  const errors = [];
  validate.errors?.forEach(error => {
    if (error.keyword === 'type') {
      errors.push(`${error.instancePath} ${error.message}`);
    } else {
      errors.push(`${error.instancePath === '' ? '/' : error.instancePath} ${error.message}`);
    }
  });
  return errors;
}

function extractDefaults(data) {
  if ('default' in data) {
    return data.default;
  }

  if (data.type === 'object' && data.properties) {
    const obj = {};
    for (const [key, propdata] of Object.entries(data.properties)) {
      obj[key] = extractDefaults(propdata);
    }
    return obj;
  }

  if (data.type === 'array' && data.default) {
    return data.default;
  }

  return undefined;
}

export function writeDefaultConfig() {
  try {
    const defaultConfig = extractDefaults(configSchema);
    fs.writeFileSync(new URL('../app/config/config.default.json', import.meta.url), JSON.stringify(defaultConfig));
  } catch (e) {
    console.log(e);
  }
}
