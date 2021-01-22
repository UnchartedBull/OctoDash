/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-commonjs */

require('v8-compile-cache');

const { app, BrowserWindow, ipcMain, protocol, screen, session } = require('electron');
const fs = require('fs');
const path = require('path');
const url = require('url');

const args = process.argv.slice(1);
const big = args.some(val => val === '--big');
const dev = args.some(val => val === '--serve');
const appPath = path.join(__dirname, 'dist');

const activateListeners = require('./helper/listener');

app.commandLine.appendSwitch('touch-events', 'enabled');

let window;

protocol.registerSchemesAsPrivileged([{ scheme: 'es6', privileges: { standard: true, secure: true } }]);

function createWindow() {
  registerProtocol();

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
    window.loadURL(
      url.format({
        pathname: 'index.html',
        protocol: 'es6:',
        slashes: true,
      }),
    );
    window.setFullScreen(true);
  }

  activateListeners(ipcMain, window, app, dev);

  window.on('closed', () => {
    window = null;
  });
}

function registerProtocol() {
  protocol.registerBufferProtocol('es6', (req, cb) => {
    fs.readFile(path.join(appPath, req.url.replace('es6://', '')), (_, b) => {
      cb({ mimeType: 'text/javascript', data: b });
    });
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
