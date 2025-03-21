import { HttpHeaders } from '@angular/common/http';

export interface HttpHeader {
  headers: HttpHeaders;
}

export interface Config {
  octoprint: Octoprint;
  printer: Printer;
  filament: Filament;
  plugins: Plugins;
  octodash: OctoDash;
}

interface Octoprint {
  url: string;
  accessToken: string;
  urlSplit?: URLSplit;
}

export interface URLSplit {
  host: string;
  port: number;
}

interface Printer {
  name: string;
  xySpeed: number;
  zSpeed: number;
  disableExtruderGCode: string;
  zBabystepGCode: string;
  defaultTemperatureFanSpeed: DefaultTemperatureFanSpeed;
}

interface DefaultTemperatureFanSpeed {
  hotend: number;
  heatbed: number;
  fan: number;
}

interface Filament {
  thickness: number;
  density: number;
  feedLength: number;
  feedSpeed: number;
  feedSpeedSlow: number;
  purgeDistance: number;
  useM600: boolean;
}

interface Plugins {
  companion: Plugin;
  displayLayerProgress: Plugin;
  enclosure: EnclosurePlugin;
  filamentManager: Plugin;
  spoolManager: Plugin;
  preheatButton: Plugin;
  printTimeGenius: Plugin;
  psuControl: Plugin;
  ophom: Plugin;
  tpLinkSmartPlug: TPLinkSmartPlugPlugin;
  tasmota: TasmotaPlugin;
  tasmotaMqtt: TasmotaMqttPlugin;
  tuya: TuyaPlugin;
  wemo: WemoPlugin;
}

interface Plugin {
  enabled: boolean;
}

interface EnclosurePlugin extends Plugin {
  ambientSensorID: number | null;
  filament1SensorID: number | null;
  filament2SensorID: number | null;
}

interface TPLinkSmartPlugPlugin extends Plugin {
  smartPlugIP: string;
}

interface TasmotaPlugin extends Plugin {
  ip: string;
  index: number;
}

interface TasmotaMqttPlugin extends Plugin {
  topic: string;
  relayNumber: number;
}

interface TuyaPlugin extends Plugin {
  label: string;
}

interface WemoPlugin extends Plugin {
  ip: string;
  port: number;
}

interface OctoDash {
  customActions: CustomAction[];
  fileSorting: FileSorting;
  invertAxisControl: InvertAxisControl;
  pollingInterval: number;
  touchscreen: boolean;
  turnScreenOffWhileSleeping: boolean;
  turnOnPrinterWhenExitingSleep: boolean;
  preferPreviewWhilePrinting: boolean;
  previewProgressCircle: boolean;
  screenSleepCommand: string;
  screenWakeupCommand: string;
  showExtruderControl: boolean;
  showNotificationCenterIcon: boolean;
  defaultDirectory: string;
}

export interface CustomAction {
  icon: string;
  command: string;
  color: string;
  confirm: boolean;
  exit: boolean;
}

interface FileSorting {
  attribute: 'name' | 'date' | 'size';
  order: 'asc' | 'dsc';
}

interface InvertAxisControl {
  x: boolean;
  y: boolean;
  z: boolean;
}
