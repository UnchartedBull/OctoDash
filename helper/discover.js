/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-commonjs */

const compareVersions = require('compare-versions');
const exec = require('child_process').exec;

let minimumVersion;
let browser;
let nodes = [];

function startDiscovery(window, type) {
  if (type === 'OCTOPRINT') {
    minimumVersion = '1.3.5';
  }

  exec('hostname', (err, stdout) => {
    if (err) {
      discoverNodes(window, type, null);
    } else {
      discoverNodes(window, type, `${stdout}.local`);
    }
  });
}

function discoverNodes(window, type, localDomain) {
  const bonjour = require('bonjour')();
  nodes = [];

  console.log('HERE');

  // browser = bonjour.find({ type: 'octoprint' });
  browser = bonjour.find({ type });
  browser.on('up', service => {
    console.log(service);
    nodes.push({
      id: service.addresses[0] + service.port,
      name: service.name,
      version: service.txt?.version ?? 'unknown',
      url: `http://${service.host.replace(/\.$/, '')}:${service.port}${service.txt?.path ?? ''}`,
      local: service.host === localDomain,
      disable: minimumVersion ? compareVersions(minimumVersion, service.txt.version) === -1 : false,
    });
    sendNodes(window);
  });

  browser.on('down', service => {
    nodes = nodes.filter(node => node.id !== service.interfaceIndex);
    sendNodes(window);
  });

  browser.start();
}

function stopDiscovery() {
  browser.stop();
}

function sendNodes(window) {
  window.webContents.send('discoveredNodes', nodes);
}

module.exports = { startDiscovery, stopDiscovery };
