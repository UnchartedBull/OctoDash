import { merge } from 'lodash-es';

import { BackendType, Config } from './config.model';
import { moonrakerConfig } from './config.moonraker.default';
import { octoprintConfig } from './config.octoprint.default';

const octodashConfig: Partial<Config> = {
  customization: {
    turnOnPrinterWhenExitingSleep: false,
    preferPreviewWhilePrinting: false,
    previewProgressCircle: false,
    showExtruderControl: true,
    showNotificationCenterIcon: false,
    fileSorting: {
      attribute: 'date',
      order: 'dsc',
    },
    invertAxisControl: {
      x: false,
      y: false,
      z: false,
    },
  },
  printer: {
    name: '',
    xySpeed: 80,
    zSpeed: 5,
  },
  filamentChange: {
    integrated: {
      feedLength: 0,
      feedSpeed: 20,
      feedSpeedSlow: 3,
      purgeDistance: 30,
    },
  },
  customActions: [
    {
      icon: 'home',
      command: 'G28',
      color: '#dcdde1',
      confirm: false,
      exit: true,
    },
    {
      icon: 'ruler-vertical',
      command: 'G29',
      color: '#4bae50',
      confirm: false,
      exit: true,
    },
    {
      icon: 'fire-alt',
      command: 'M140 S50; M104 S185',
      color: '#e1b12c',
      confirm: false,
      exit: true,
    },
    {
      icon: 'snowflake',
      command: 'M140 S0; M104 S0',
      color: '#0097e6',
      confirm: false,
      exit: true,
    },
    {
      icon: 'redo-alt',
      command: '[!RELOAD]',
      color: '#7f8fa6',
      confirm: true,
      exit: false,
    },
    {
      icon: 'power-off',
      command: '[!SHUTDOWN]',
      color: '#e84118',
      confirm: true,
      exit: false,
    },
  ],
};

export function getDefaultConfig(backend: BackendType) {
  if (backend === BackendType.OCTOPRINT) return merge(octodashConfig, octoprintConfig) as Config;
  else return merge(octodashConfig, moonrakerConfig) as Config;
}
