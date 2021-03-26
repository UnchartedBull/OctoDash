/* eslint-disable camelcase */
/* eslint-disable no-sync */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-commonjs */

const fs = require('fs');
const got = require('got');
const stream = require('stream');
const { promisify } = require('util');
const progress = require('progress-stream');

const args = process.argv.slice(1);
const dev = args.some(val => val === '--serve');

const exec = require('child_process').exec;

if (dev) {
  var rootPath = '/opt/OctoDash';
} else {
  //TODO : Detect app path
  var rootPath = '/opt/OctoDash';
}

function downloadUpdate(updateInfo, window) {
  const tempPath = '/tmp';
  const archMapping = {
    armv7l: 'armv7l',
    aarch64: 'arm64',
    x86_64: 'amd64',
  };

  fs.access(rootPath, fs.constants.W_OK, function(err) {
    if (err) {
      window.webContents.send('updateError', {
        error: {
          message: `${rootPath} is not writable!`,
        },
      });
    } else {
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
            let downloadPath;
            let downloadFilename;
            let packageName;
            for (const package of JSON.parse(releaseFiles.body)) {
              if (package.name.includes(archMapping[stdout.trim()]) &&
                  package.name.endsWith(".tar.gz")) {
                downloadURL = package.browser_download_url;
                packageSize = package.size;
                downloadFilename = package.name;

                downloadPath = tempPath + '/' + downloadFilename;

                packageName = downloadFilename.replace('.tar.gz','').replace(/_/g,'-');
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
                  exec(`tar zxvf ${downloadPath} -C ${tempPath}`, (err, _, stderr) => {
                    if (err || stderr) {
                      window.webContents.send('updateError', {
                        error: err || { message: stderr },
                      });
                    } else {
                      exec(`rsync -av --delete "${tempPath}/${packageName}/" "${rootPath}"`, (err, _, stderr) => {
                        if (err || stderr) {
                          window.webContents.send('updateError', {
                            error: err || { message: stderr },
                          });
                        } else {
                          exec(`rm -rf "${downloadPath}" "${tempPath}/${packageName}"`, (err, _, stderr) => {
                            if (err || stderr) {
                              window.webContents.send('updateError', {
                                error: err || { message: stderr },
                              });
                            } else {
                              window.webContents.send('updateInstalled');
                            }
                          });
                        }
                      });
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
  });
}

function sendVersionInfo(window, app) {
  window.webContents.send('versionInformation', {
    version: app.getVersion(),
  });
}

module.exports = { downloadUpdate, sendVersionInfo };
