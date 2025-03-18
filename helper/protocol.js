import fs from 'node:fs';
import path, { extname } from 'node:path';

import electron from 'electron';

const { app, protocol } = electron;

function createProtocol(scheme, basePath) {
  if (!app.isReady()) return app.on('ready', () => createProtocol(...arguments));

  protocol.registerBufferProtocol(scheme, (request, callback) => {
    const filePath = path.join(basePath, request.url.replace(`${scheme}://`, ''));
    fs.readFile(filePath, (error, buffer) => {
      if (error) {
        fs.readFile(path.join(basePath, 'index.html'), (_, buffer) => {
          callback({ mimeType: mimeType('index.html'), data: buffer });
        });
      } else {
        callback({ mimeType: mimeType(filePath), data: buffer });
      }
    });
  });
}

const mimeType = filename => mimeType[extname(`${filename || ''}`).toLowerCase()];

(mimeType[''] = 'text/plain'),
  (mimeType['.js'] = mimeType['.ts'] = mimeType['.mjs'] = 'text/javascript'),
  (mimeType['.html'] = mimeType['.htm'] = 'text/html'),
  (mimeType['.json'] = 'application/json'),
  (mimeType['.css'] = 'text/css'),
  (mimeType['.svg'] = 'image/svg+xml'),
  (mimeType['.png'] = 'image/png'),
  (mimeType['.jpg'] = mimeType['.jpeg'] = 'image/jpeg'),
  (mimeType['.ico'] = 'image/x-icon');

export default createProtocol;
