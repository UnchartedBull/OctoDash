/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-commonjs */

require('v8-compile-cache');

const { app, BrowserWindow, ipcMain } = require('electron');
const Store = require('electron-store');

const activateListeners = require('./helper/listener');
const electron = require('./helper/electron.js');

let window;

app.commandLine.appendSwitch('touch-events', 'enabled');
// protocol.registerSchemesAsPrivileged([{
//   scheme: globals.scheme,
//   privileges: { standard: true }
// }]);

function createWindow() {
  const _store = new Store();
  const properties = electron.configure(process.argv.slice(1))

  window = new BrowserWindow(properties.window);

  if (properties.dev) {
    window.webContents.openDevTools();
  }

  window.loadURL(properties.url);
  activateListeners(ipcMain, window, app, properties.url);

  window.on('closed', () => {
    window = null;
  });
}

app.on('ready', createWindow);

app.on('activate', () => {
  if (window === null) {
    createWindow();
  }
});

app.on('window-all-closed', () => {
  app.quit();
});
