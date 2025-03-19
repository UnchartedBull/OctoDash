import { exec } from 'node:child_process';

import { checkConfig, readConfig, resetConfig, saveConfig } from './config.js';
import { startDiscovery, stopDiscovery } from './discover.js';
import sendCustomStyles from './styles.js';
import { downloadUpdate, sendVersionInfo } from './update.js';

function activateScreenSleepListener(ipcMain) {
  ipcMain.on('screenControl', (_, screenCommand) => exec(screenCommand.command));
}

function activateReloadListener(ipcMain, window, url) {
  ipcMain.on('reload', () => {
    window.loadURL(url);
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
  ipcMain.on('resetConfig', () => resetConfig(window));
  ipcMain.on('saveConfig', (_, config) => saveConfig(window, config));
  ipcMain.on('checkConfig', (_, config) => checkConfig(window, config));
}

function activateListeners(ipcMain, window, app, url) {
  activateConfigListener(ipcMain, window);
  activateAppInfoListener(ipcMain, window, app);
  activateScreenSleepListener(ipcMain);
  activateReloadListener(ipcMain, window, url);
  activateUpdateListener(ipcMain, window);
  activateDiscoverListener(ipcMain, window);
}

export default activateListeners;
