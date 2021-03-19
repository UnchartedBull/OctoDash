/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-commonjs */
const exec = require('child_process').exec;

const sendCustomStyles = require('./styles');
const { downloadUpdate, sendVersionInfo } = require('./update');
const { startDiscovery, stopDiscovery } = require('./discover');
const { readConfig, saveConfig, checkConfig } = require('./config');

function activateScreenSleepListener(ipcMain) {
  ipcMain.on('screenControl', (_, screenCommand) => exec(screenCommand.command));
}

function activateReloadListener(ipcMain, window, dev) {
  ipcMain.on('reload', () => {
    if (dev) {
      window.loadURL('http://localhost:4200');
    } else {
      window.loadURL('app://.');
    }
  });
}

function activateAppInfoListener(ipcMain, window, app) {
  ipcMain.on('appInfo', () => {
    sendCustomStyles(window);
    sendVersionInfo(window, app);
  });
}

function activateUpdateListener(ipcMain, window) {
  ipcMain.on('update', (_, updateInfo) => downloadUpdate(updateInfo, window));
}

function activateDiscoverListener(ipcMain, window) {
  ipcMain.on('discover', () => startDiscovery(window));

  ipcMain.on('stopDiscover', () => stopDiscovery());
}

function activateConfigListener(ipcMain, window) {
  ipcMain.on('readConfig', () => readConfig(window));
  ipcMain.on('saveConfig', (_, config) => saveConfig(window, config));
  ipcMain.on('checkConfig', (_, config) => checkConfig(window, config));
}

function activateListeners(ipcMain, window, app, dev) {
  activateConfigListener(ipcMain, window);
  activateAppInfoListener(ipcMain, window, app);
  activateScreenSleepListener(ipcMain);
  activateReloadListener(ipcMain, window, dev);
  activateUpdateListener(ipcMain, window);
  activateDiscoverListener(ipcMain, window);
}

module.exports = activateListeners;
