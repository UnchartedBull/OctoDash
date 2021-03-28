module.exports = {
  configure(globals, args) {

    const properties = {
      frame: false,
      fullscreen: true,
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

    // ordered so that --serve and --big can be used single or combined
    if (args.includes('--serve')) {
      globals.dev = true;
      properties.frame = true;
      properties.fullscreen = false;
      properties.width = 1200;
      properties.height = 450;
    }
    if (args.includes('--big')) {
      properties.width = 1500;
      properties.height = 600;
    }
    if (args.includes('--cosmos')) {
      const panelHeight = 26;
      properties.fullscreen = false;
      properties.width = 800;
      properties.height = 480 - panelHeight;
      properties.y = panelHeight;
    }

    if (!globals.dev) {
      const { protocol, session } = require('electron');
      const createProtocol = require('./helper/protocol');

      const scheme = 'app';
      protocol.registerSchemesAsPrivileged([{ scheme, privileges: { standard: true } }]);
      createProtocol(scheme, path.join(__dirname, 'dist'));

      const locale = require('./helper/locale.js').getLocale();
      globals.url = `file://${__dirname}/dist/${locale}/index.html`;

      session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
          responseHeaders: {
            ...details.responseHeaders,
            // TODO: re-enable
            // "Content-Security-Policy": ["script-src 'self'"],
          },
        });
      });
    } else {
      globals.url = 'http://localhost:4200';
    }

    return properties;
  },
};
