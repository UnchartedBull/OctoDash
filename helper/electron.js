const path = require('path');
const { fetchConfig } = require('./config.js');

function replaceExistingProperties(properties, config, keys) {
  for (key of keys) {
    if (config[key]) {
      properties[key] = config[key];
    }
  }
}

function configureWindow(properties, args, globals) {
  // ordered so that --serve and --big can be used single or combined
  // --big overrides custom properties as it explicitly asks for a size

  if (args.includes('--serve')) {
    globals.dev = true;
    properties.width = 1200;
    properties.height = 450;
  }

  if (globals.dev) {
    properties.frame = true;
    properties.fullscreen = false;
  }

  const config = fetchConfig()
  if (config.octodash.window) {
    replaceExistingProperties(
      properties,
      config.octodash.window,
      ['width', 'height', 'x', 'y', 'fullscreen'],
    );
  }

  if (args.includes('--big')) {
    properties.width = 1500;
    properties.height = 600;
  }
}

module.exports = {
  configure(globals, args) {

    // defaults
    const properties = {
      frame: false,
      fullscreen: true,
      // width and height web treated as page size
      // actual window size will include the frame/devtools and be larger
      useContentSize: true,
      width: globals.mainScreen.size.width,
      height: globals.mainScreen.size.height,
      x: 0,
      y: 0,
      backgroundColor: '#353b48',
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        worldSafeExecuteJavaScript: true,
        contextIsolation: false,
      },
      icon: path.join(__dirname, 'dist', 'assets', 'icon', 'icon.png'),
    };

    configureWindow(properties, args, globals);

    if (globals.dev) {
      globals.url = 'http://localhost:4200';
    } else {
      const { protocol, session } = require('electron');
      const createProtocol = require('./helper/protocol');

      const scheme = 'app';
      protocol.registerSchemesAsPrivileged([{ scheme, privileges: { standard: true } }]);
      createProtocol(scheme, path.join(__dirname, 'dist'));

      session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
          responseHeaders: {
            ...details.responseHeaders,
            // TODO: re-enable
            // "Content-Security-Policy": ["script-src 'self'"],
          },
        });
      });

      const locale = require('./helper/locale.js').getLocale();
      globals.url = `file://${__dirname}/dist/${locale}/index.html`;
    }

    console.debug({ properties })
    return properties;
  },
};
