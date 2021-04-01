const path = require('path');
const { screen } = require('electron');

const { fetchConfig } = require('./config.js');
const { getLocale } = require('./locale.js');

// replaces properties in <properties> from <config> when it exists
function replaceExistingProperties(properties, config, keys) {
  for (key of keys) {
    if (config[key] !== undefined) {
      properties[key] = config[key];
    }
  }
}

// returns the absolute build path of a filename in the repo
// /<absolute path>/app.asar/dist/<locale dir>/<filename>
function getPath(filename) {
  return path.format({
    dir: path.normalize(__dirname + '/../dist/' + getLocale()),
    base: filename,
  });
}

module.exports = {
  configure(args) {
    const mainScreen = screen.getPrimaryDisplay();

    // defaults
    const properties = {
      dev: false,
      url: null,
      window: {
        frame: false,
        fullscreen: true,
        useContentSize: true,
        width: mainScreen.size.width,
        height: mainScreen.size.height,
        x: 0,
        y: 0,
        backgroundColor: '#353b48',
        webPreferences: {
          nodeIntegration: true,
          enableRemoteModule: true,
          worldSafeExecuteJavaScript: true,
          contextIsolation: false,
        },
        icon: getPath('assets/icon/icon.png'),
      }
    };

    // if statements ordered so that --serve and --big can be used single or combined

    if (args.includes('--serve')) {
      properties.dev = true;
      properties.window.width = 1200;
      properties.window.height = 450;
    }

    if (properties.dev) {
      properties.url = 'http://localhost:4200';
      properties.window.frame = true;
      properties.window.fullscreen = false;
    } else {
      const { session } = require('electron');
      session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
          responseHeaders: {
            ...details.responseHeaders,
            // TODO: re-enable
            // "Content-Security-Policy": ["script-src 'self'"],
          },
        });
      });
      properties.url = 'file://' + getPath('index.html');
    }

    const config = fetchConfig();
    if (config.octodash.window) {
      replaceExistingProperties(
        properties.window,
        config.octodash.window,
        ['width', 'height', 'x', 'y', 'fullscreen'],
      );
    }

    // --big overrides custom properties as it explicitly asks for a size
    if (args.includes('--big')) {
      properties.window.width = 1500;
      properties.window.height = 600;
    }

    console.debug({ properties });
    return properties;
  },
};
