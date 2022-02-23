import { Config } from './config.model';
import { octoprintConfig } from './config.octoprint.default';

const octodashConfig = {
  printer: {
    name: '',
    xySpeed: 150,
    zSpeed: 5,
    // TODO switch those around for klipper
    disableExtruderGCode: 'M18 E',
    zBabystepGCode: 'M290 Z',
    defaultTemperatureFanSpeed: {
      hotend: 200,
      heatbed: 60,
      fan: 100,
    },
  },
  filament: {
    // TODO remove thickness and density
    thickness: 1.75,
    density: 1.25,
    feedLength: 0,
    feedSpeed: 20,
    feedSpeedSlow: 3,
    purgeDistance: 30,
    // TODO think about how to handle this with klipper
    useM600: false,
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
  fileSorting: {
    attribute: 'name',
    order: 'asc',
  },
  invertAxisControl: {
    x: false,
    y: false,
    z: false,
  },
  pollingInterval: 2000,
  touchscreen: true,
  turnScreenOffWhileSleeping: false,
  turnOnPrinterWhenExitingSleep: false,
  preferPreviewWhilePrinting: false,
  previewProgressCircle: false,
  screenSleepCommand: 'xset dpms force standby',
  screenWakeupCommand: 'xset s off && xset -dpms && xset s noblank',
  showExtruderControl: true,
  showNotificationCenterIcon: true,
};

module.exports.config = (backend: 'octoprint' | 'moonraker') => {
  if (backend === 'octoprint')
    return {
      ...octodashConfig,
      octoprint: octoprintConfig,
    } as Config;
  else
    return {
      ...octodashConfig,
    };
};
