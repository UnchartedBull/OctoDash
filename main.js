/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-commonjs */

require('v8-compile-cache');

const { app, BrowserWindow, ipcMain, screen } = require('electron');
const Store = require('electron-store');

const activateListeners = require('./helper/listener');
const electron = require('./helper/electron.js');

const globals = {
  window: null,
  url: null,
  dev: false,
  mainScreen: screen.getPrimaryDisplay(),
};

const windowProperties = electron.configure(globals, process.argv.slice(1))
app.commandLine.appendSwitch('touch-events', 'enabled');

app.on('ready', () => {
  const _store = new Store();
  window = new BrowserWindow(windowProperties);
  if (globals.dev) {
    window.webContents.openDevTools();
  }
  window.loadURL(url);
  activateListeners(ipcMain, window, app, url);

  window.on('closed', () => {
    window = null;
  });
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (window === null) {
    createWindow();
  }
});
