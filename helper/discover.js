import { exec } from 'node:child_process';

import * as compareVersions from 'compare-versions';
import bonjour from 'bonjour';

const minimumVersion = '1.3.5';
let browser;
let nodes = [];

export function startDiscovery(window) {
  exec('hostname', (err, stdout) => {
    if (err) {
      discoverNodes(window, null);
    } else {
      discoverNodes(window, `${stdout}.local`);
    }
  });
}

function discoverNodes(window, localDomain) {
  const bonjour = bonjour();
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

export function stopDiscovery() {
  browser.stop();
}

function sendNodes(window) {
  window.webContents.send('discoveredNodes', nodes);
}
