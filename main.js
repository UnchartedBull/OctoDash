import path from 'node:path';
import { fileURLToPath } from 'node:url';

import electron from 'electron';

import activateListeners from './src/helper/listener.js';
import { getLocale } from './src/helper/locale.js';
import createProtocol from './src/helper/protocol.js';

const { app, BrowserWindow, ipcMain, protocol, screen } = electron;

let window;
let locale;
let url;

const dev = !!process.env.APP_DEV;
const __dirname = fileURLToPath(new URL('.', import.meta.url));

if (!dev) {
  const scheme = 'app';

  protocol.registerSchemesAsPrivileged([{ scheme: scheme, privileges: { standard: true } }]);
  createProtocol(scheme, path.join(__dirname, 'dist'));

  locale = getLocale();
}

// Fixes rendering glitches on Raspberry Pi + Electron v27+
app.disableHardwareAcceleration();

app.commandLine.appendSwitch('touch-events', 'enabled');

function createWindow() {
  // if (!dev) {
  //   session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  //     callback({
  //       responseHeaders: {
  //         ...details.responseHeaders,
  //         "Content-Security-Policy": ["script-src 'self'"],
  //       },
  //     });
  //   });
  // }

  const mainScreen = screen.getPrimaryDisplay();

  window = new BrowserWindow({
    width: dev ? 1100 : mainScreen.size.width,
    height: dev ? 600 : mainScreen.size.height,
    frame: dev,
    backgroundColor: '#353b48',
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
    },
    icon: fileURLToPath(new URL(`./${dev ? 'src' : 'dist'}/assets/icon/icon.png`, import.meta.url)),
  });

  if (dev) {
    url = 'http://localhost:4200';
    let devtools = new BrowserWindow();
    window.webContents.setDevToolsWebContents(devtools.webContents);
    window.webContents.openDevTools({ mode: 'detach' });
  } else {
    url = `file://${__dirname}/dist/${locale}/index.html`;
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
