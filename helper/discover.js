/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-commonjs */

const mdns = require('mdns');
const compareVersions = require('compare-versions');

const browser = mdns.createBrowser(mdns.tcp('octoprint'));
const minimumVersion = '1.3.5';
let nodes = [];

function discoverNodes(window) {
  browser.on('serviceUp', service => {
    nodes.push({
      id: service.interfaceIndex,
      name: service.name,
      version: service.txtRecord.version,
      url: `http://${service.host.replace(/\.$/, '')}:${service.port}${service.txtRecord.path}api/`,
      disable: compareVersions(minimumVersion, service.txtRecord.version) === -1,
    });
    sendNodes(window);
  });

  browser.on('serviceDown', service => {
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

module.exports = { discoverNodes, stopDiscovery };
