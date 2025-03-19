import fs from 'node:fs';
import path from 'node:path';

import electron from 'electron';

const { app } = electron;

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

export default sendCustomStyles;
