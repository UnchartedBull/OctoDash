/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-commonjs */

require('v8-compile-cache');

const { app, BrowserWindow, ipcMain, protocol, screen, session } = require('electron');
const path = require('path');
const Store = require('electron-store');

const activateListeners = require('./helper/listener');
const createProtocol = require('./helper/protocol');

const scheme = 'app';
protocol.registerSchemesAsPrivileged([{ scheme, privileges: { standard: true } }]);
createProtocol(scheme, path.join(__dirname, 'dist'));

app.commandLine.appendSwitch('touch-events', 'enabled');

const store = new Store();

let window;
let dev = false;

function configureWindow(mainScreen, args) {

  let properties = {
    frame: false,
    fullscreen: true,
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
    icon: path.join(__dirname, 'dist', 'assets', 'icon', 'icon.png'),
  };

  // ordered so that --serve and --big can be used single or combined
  if (args.includes('--serve')) {
    dev = true;
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
  return properties;
}

function createWindow() {

  const mainScreen = screen.getPrimaryDisplay();
  // modifies global variable dev
  const properties = configureWindow(mainScreen, process.argv.slice(1));

  if (!dev) {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          // TODO: re-enable
          // "Content-Security-Policy": ["script-src 'self'"],
        },
      });
    });
  }

  window = new BrowserWindow(properties);
  window.loadURL(dev ? 'http://localhost:4200' : 'app://.');
  if (dev) {
    window.webContents.openDevTools();
  }

  activateListeners(ipcMain, window, app, dev);

  window.on('closed', () => {
    window = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (window === null) {
    createWindow();
  }
});
