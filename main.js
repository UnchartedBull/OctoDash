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
  mainScreen: null,
};

app.commandLine.appendSwitch('touch-events', 'enabled');

function createWindow() {
  const _store = new Store();
  globals.mainScreen = screen.getPrimaryDisplay();

  window = new BrowserWindow(
    electron.configure(globals, process.argv.slice(1))
  );

  if (globals.dev) {
    window.webContents.openDevTools();
  }

  window.loadURL(globals.url);
  activateListeners(ipcMain, window, app, globals.url);

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
