import { BackendType, Config } from './config.model';

export const octoprintConfig: Partial<Config> = {
  backend: {
    type: BackendType.OCTOPRINT,
    host: 'http://localhost:5000',
    accessToken: '',
    pollingInterval: 2000,
    commands: {
      disableExtruder: 'M18 E',
      babystepZ: 'M290 Z',
    },
  },
  octoprint: {
    plugins: {
      displayLayerProgress: {
        enabled: true,
      },
      enclosure: {
        enabled: false,
        ambientSensorID: null,
        filament1SensorID: null,
        filament2SensorID: null,
      },
      filamentManager: {
        enabled: true,
      },
      spoolManager: {
        enabled: false,
      },
      preheatButton: {
        enabled: true,
      },
      printTimeGenius: {
        enabled: true,
      },
      psuControl: {
        enabled: false,
      },
      ophom: {
        enabled: false,
      },
      tpLinkSmartPlug: {
        enabled: false,
        smartPlugIP: '127.0.0.1',
      },
      tasmota: {
        enabled: false,
        ip: '127.0.0.1',
        index: null,
      },
      tasmotaMqtt: {
        enabled: false,
        topic: 'topic',
        relayNumber: null,
      },
    },
  },
};
