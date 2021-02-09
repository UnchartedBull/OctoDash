/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-commonjs */

require('v8-compile-cache');

const { app, BrowserWindow, ipcMain, protocol, screen, session } = require('electron');
const path = require('path');
const Store = require('electron-store');

const args = process.argv.slice(1);
const big = args.some(val => val === '--big');
const dev = args.some(val => val === '--serve');

const activateListeners = require('./helper/listener');

if (!dev) {
  const createProtocol = require('./helper/protocol');
  const scheme = 'app';

  protocol.registerSchemesAsPrivileged([{ scheme: scheme, privileges: { standard: true } }]);
  createProtocol(scheme, path.join(__dirname, 'dist'));
}

app.commandLine.appendSwitch('touch-events', 'enabled');

let window;

function createWindow() {
  const _store = new Store();

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

  const mainScreen = screen.getPrimaryDisplay();

  window = new BrowserWindow({
    width: dev ? (big ? 1500 : 1200) : mainScreen.size.width,
    height: dev ? (big ? 600 : 450) : mainScreen.size.height,
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
