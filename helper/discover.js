/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-commonjs */

const compareVersions = require('compare-versions');
const exec = require('child_process').exec;

const minimumVersion = '1.3.5';
let browser;
let nodes = [];

function startDiscovery(window) {
  exec('hostname', (err, stdout) => {
    if (err) {
      discoverNodes(window, null);
    } else {
      discoverNodes(window, `${stdout}.local`);
    }
  });
}

function discoverNodes(window, localDomain) {
  const bonjour = require('bonjour')();
  nodes = [];
  browser = bonjour.find({ type: 'octoprint' });
  browser.on('up', service => {
    nodes.push({
      id: service.addresses[0] + service.port,
      name: service.name,
      version: service.txt.version,
      url: `http://${service.host.replace(/\.$/, '')}:${service.port}${service.txt.path}`,
      local: service.host === localDomain,
      disable: compareVersions(minimumVersion, service.txt.version) === -1,
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
