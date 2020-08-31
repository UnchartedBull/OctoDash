/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-commonjs */

const fs = require('fs');
const path = require('path');
const { app } = require('electron');

function sendCustomStyles(window) {
  fs.readFile(path.join(app.getPath('userData'), 'custom-styles.css'), 'utf-8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        fs.writeFile(path.join(app.getPath('userData'), 'custom-styles.css'), '', err => {
          if (err) {
            window.webContents.send('customStylesError', err);
          } else {
            window.webContents.send('customStyles', '');
          }
        });
      } else {
        window.webContents.send('customStylesError', err);
      }
    } else {
      window.webContents.send('customStyles', data);
    }
  });
}

module.exports = sendCustomStyles;
