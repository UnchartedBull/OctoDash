/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-commonjs */
const exec = require('child_process').exec;
const waitPort = require('wait-port');

const sendCustomStyles = require('./styles');
const { downloadUpdate, sendVersionInfo } = require('./update');
const { discoverNodes, stopDiscovery } = require('./discover');

function activateScreenSleepListener(ipcMain) {
  ipcMain.on('screenControl', (_, screenCommand) => {
    exec(screenCommand.command);
  });
}

function activateReloadListener(ipcMain, window, dev) {
  ipcMain.on('reload', () => {
    if (dev) {
      window.reload();
    } else {
      window.loadFile('dist/index.html');
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
  ipcMain.on('update', (_, updateInfo) => {
    downloadUpdate(updateInfo, window);
  });
}

function activateDiscoverListener(ipcMain, window) {
  ipcMain.on('discover', () => {
    discoverNodes(window);
  });

  ipcMain.on('stopDiscover', () => {
    stopDiscovery();
  });
}

function activatePortListener(ipcMain, window) {
  ipcMain.on('checkOctoPrintPort', (_, hostInfo) => {
    const waitPortParams = {
      host: hostInfo.host,
      port: hostInfo.port,
      output: 'silent',
      timeout: 60000,
    };

    waitPort(waitPortParams)
      .then(open => {
        window.webContents.send('octoprintReady', open);
      })
      .catch(error => {
        window.webContents.send('waitPortError', error);
      });
  });
}

function activateListeners(ipcMain, window, app, dev) {
  activatePortListener(ipcMain, window);
  activateAppInfoListener(ipcMain, window, app);
  activateScreenSleepListener(ipcMain);
  activateReloadListener(ipcMain, window, dev);
  activateUpdateListener(ipcMain, window);
  activateDiscoverListener(ipcMain, window);
}

module.exports = activateListeners;
