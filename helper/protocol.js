import fs from 'node:fs';
import path from 'node:path';

import electron from 'electron';
import mime from 'mime-types';

const { app, protocol } = electron;

function createProtocol(scheme, basePath) {
  if (!app.isReady()) return app.on('ready', () => createProtocol(...arguments));

  protocol.registerBufferProtocol(scheme, (request, callback) => {
    const filePath = path.join(basePath, request.url.replace(`${scheme}://`, ''));
    fs.readFile(filePath, (error, buffer) => {
      if (error) {
        fs.readFile(path.join(basePath, 'index.html'), (_, buffer) => {
          callback({ mimeType: mime.lookup('index.html'), data: buffer });
        });
      } else {
        callback({ mimeType: mime.lookup(filePath), data: buffer });
      }
    });
  });
}

export default createProtocol;
