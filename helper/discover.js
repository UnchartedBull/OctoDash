/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-commonjs */

const mdns = require('mdns');
const compareVersions = require('compare-versions');

const minimumVersion = '1.3.5';
let mdnsBrowser;
let nodes = [];

function discoverNodes(window) {
  nodes = [];
  mdnsBrowser = mdns.createBrowser(mdns.tcp('octoprint'));
  mdnsBrowser.on('serviceUp', service => {
    nodes.push({
      id: service.interfaceIndex,
      name: service.name,
      version: service.txtRecord.version,
      url: `http://${service.host.replace(/\.$/, '')}:${service.port}${service.txtRecord.path}api/`,
      disable: compareVersions(minimumVersion, service.txtRecord.version) === -1,
    });
    sendNodes(window);
  });

  mdnsBrowser.on('serviceDown', service => {
    nodes = nodes.filter(node => node.id !== service.interfaceIndex);
    sendNodes(window);
  });

  mdnsBrowser.start();
}

function stopDiscovery() {
  mdnsBrowser.stop();
}

function sendNodes(window) {
  window.webContents.send('discoveredNodes', nodes);
}

module.exports = { discoverNodes, stopDiscovery };
