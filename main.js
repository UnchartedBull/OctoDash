import path from 'node:path';

import 'v8-compile-cache';
import electron from 'electron';
import Store from 'electron-store';

import activateListeners from './helper/listener.js';
import createProtocol from './helper/protocol.js';
import { getLocale } from './helper/locale.js';

const { app, BrowserWindow, ipcMain, protocol, screen, session } = electron;

const args = process.argv.slice(1);
const big = args.some(val => val === '--big');
const dev = args.some(val => val === '--serve');

let window;
let locale;
let url;

if (!dev) {
  const scheme = 'app';

  protocol.registerSchemesAsPrivileged([{ scheme: scheme, privileges: { standard: true } }]);
  createProtocol(scheme, new URL('./dist', import.meta.url));

  locale = getLocale();
}

app.commandLine.appendSwitch('touch-events', 'enabled');

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
      contextIsolation: false,
    },
    icon: new URL('./dist/assets/icon/icon.png', import.meta.url),
  });

  if (dev) {
    url = 'http://localhost:4200';
    window.webContents.openDevTools();
  } else {
    url = new URL(`./dist/${locale}/index.html`, import.meta.url);
    window.setFullScreen(true);
  }

  window.loadURL(url);
  activateListeners(ipcMain, window, app, url);

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
