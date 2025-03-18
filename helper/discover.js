import { exec } from 'node:child_process';

import { compare } from 'compare-versions';
import bonjour from 'bonjour';

const minimumVersion = '1.3.5';
let browser;
let nodes = [];

function compareVersions(left, right, direction) {
  function fixVersion(v) {
    return v.replace('rc', '-rc').replace('--rc', '-rc');
  }
  return compare(fixVersion(left), fixVersion(right), direction);
}

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
      disabled: compareVersions(minimumVersion, service.txt.version, '>'),
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
