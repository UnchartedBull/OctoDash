import { HttpHeaders } from '@angular/common/http';

export interface HttpHeader {
  headers: HttpHeaders;
}

export interface Config {
  backend: string;
  printer: Printer;
  filament: Filament;
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
  octoprint?: OctoprintConfig;
  moonraker?: MoonrakerConfig;
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

export interface OctoprintConfig {
  url: string;
  accessToken: string;
  plugins: Plugins;
  urlSplit?: URLSplit;
}

export interface MoonrakerConfig {
  url: string;
  urlSplit?: URLSplit;
}
export interface URLSplit {
  host: string;
  port: number;
}
