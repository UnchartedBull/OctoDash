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

function parseArgs(mainScreen, args) {
  // ordered so that --serve and --big can be used single or combined
  let c = {
    width: mainScreen.size.width,
    height: mainScreen.size.height,
    x: 0,
    y: 0,
  };
  if (args.includes('--serve')) {
    dev = true;
    c.width = 1200;
    c.height = 450;
  }
  if (args.includes('--big')) {
    c.width = 1500;
    c.height = 600;
  }
  if (args.includes('--cosmos')) {
    const panelHeight = 26;
    c.width = 800;
    c.height = 480 - panelHeight;
    c.y = panelHeight;
  }
  return c;
}

function createWindow() {

  const mainScreen = screen.getPrimaryDisplay();
  const coordinates = parseArgs(mainScreen, process.argv.slice(1));

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

  window = new BrowserWindow({
    ...coordinates,
    frame: dev,
    backgroundColor: '#353b48',
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      worldSafeExecuteJavaScript: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, 'dist', 'assets', 'icon', 'icon.png'),
  });

  if (dev) {
    window.loadURL('http://localhost:4200');
    window.webContents.openDevTools();
  } else {
    window.loadURL('app://.');
    window.setFullScreen(true);
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
