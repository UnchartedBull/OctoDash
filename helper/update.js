import fs from 'node:fs';
import stream from 'node:stream';
import { promisify } from 'node:util';
import { exec } from 'node:child_process';

import { got } from 'got';
import progress from 'progress-stream';

export function downloadUpdate(updateInfo, window) {
  const downloadPath = '/tmp/octodash.deb';
  const archMapping = {
    armv7l: 'armv7l',
    aarch64: 'arm64',
    x86_64: 'amd64',
  };

  exec('arch', (err, stdout, stderr) => {
    if (err || stderr) {
      window.webContents.send('updateError', {
        error: err || { message: stderr },
      });
    }
    got(updateInfo.assetsURL)
      .then(releaseFiles => {
        const reducer = (accumulator, currentValue) => accumulator + currentValue;
        const averageETA = [];
        let downloadURL;
        let packageSize;
        for (const packageData of JSON.parse(releaseFiles.body)) {
          if (packageData.name.includes(archMapping[stdout.trim()])) {
            downloadURL = packageData.browser_download_url;
            packageSize = packageData.size;
          }
        }
        if (downloadURL) {
          const downloadPipeline = promisify(stream.pipeline);
          const downloadProgress = progress({
            length: packageSize,
            time: 300,
          });

          downloadProgress.on('progress', progress => {
            averageETA.push(progress.eta);
            if (averageETA.length > 4) averageETA.shift();
            window.webContents.send('updateDownloadProgress', {
              percentage: progress.percentage,
              transferred: (progress.transferred / 100000).toFixed(1),
              total: (progress.length / 1000000).toFixed(1),
              remaining: (progress.remaining / 100000).toFixed(1),
              eta: new Date(averageETA.reduce(reducer) * 1000).toISOString().substr(14, 5),
              runtime: new Date(progress.runtime * 1000).toISOString().substr(14, 5),
              delta: (progress.delta / 100000).toFixed(1),
              speed: (progress.speed / 1000000).toFixed(2),
            });
          });

          try {
            if (fs.existsSync(downloadPath)) fs.unlinkSync(downloadPath);
          } catch {
            // no need to handle this properly
          }

          downloadPipeline(got.stream(downloadURL), downloadProgress, fs.createWriteStream(downloadPath))
            .catch(error => {
              window.webContents.send('updateError', {
                error: {
                  message: `Can't download package! ${error.message}.`,
                },
              });
            })
            .then(() => {
              window.webContents.send('updateDownloadFinished');
              exec('sudo ~/scripts/update-octodash', (err, _, stderr) => {
                if (err || stderr) {
                  window.webContents.send('updateError', {
                    error: err || { message: stderr },
                  });
                } else {
                  window.webContents.send('updateInstalled');
                }
              });
            });
        } else {
          window.webContents.send('updateError', {
            error: {
              message: `Can't find matching package for architecture ${stdout}.`,
            },
          });
        }
      })
      .catch(error => {
        error.message = `Can't load releases. ${error.message}`;
        window.webContents.send('updateError', { error });
      });
  });
}

export function sendVersionInfo(window, app) {
  window.webContents.send('versionInformation', {
    version: app.getVersion(),
  });
}
