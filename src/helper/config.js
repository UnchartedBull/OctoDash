import fs from 'node:fs';

import configSchema from './config.schema.json' with { type: 'json' };

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
    fs.writeFileSync(new URL('./config.default.json', import.meta.url), JSON.stringify(defaultConfig));
  } catch (e) {
    console.log(e);
  }
}
