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
  let screenSize = {
    width: mainScreen.size.width,
    height: mainScreen.size.height,
  };
  if (args.includes('--serve')) {
    dev = true;
    screenSize = {
      width: 1200,
      height: 450,
    };
  }
  if (args.includes('--big')) {
    screenSize = {
      width: 1500,
      height: 600,
    };
  }
  if (args.includes('--cosmos')) {
    screenSize = {
      width: 640,
      height: 480,
    };
  }
  return screenSize;
}

function createWindow() {

  const mainScreen = screen.getPrimaryDisplay();
  const screenSize = parseArgs(mainScreen, process.argv.slice(1));

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
    width: screenSize.width,
    height: screenSize.height,
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
