import { HttpHeaders } from '@angular/common/http';

export interface HttpHeader {
  headers: HttpHeaders;
}

export enum BackendType {
  OCTOPRINT = 'OCTOPRINT',
  MOONRAKER = 'MOONRAKER',
}

export interface Config {
  backend: Backend;
  customization: Customization;
  printer: Printer;
  screen: Screen;
  preheatConfigurations: Array<PreheatConfiguration>;
  filamentChange: FilamentChange;
  customActions: Array<CustomAction>;
  octoprint?: OctoprintConfig;
}

interface Backend {
  type: BackendType;
  url: string;
  accessToken: string;
  pollingInterval: number;
  commands: BackendCommands;
}

interface BackendCommands {
  disableExtruder: string;
  babystepZ: string;
}

interface Customization {
  turnOnPrinterWhenExitingSleep: boolean;
  preferPreviewWhilePrinting: boolean;
  previewProgressCircle: boolean;
  showExtruderControl: boolean;
  showNotificationCenterIcon: boolean;
  fileSorting: FileSorting;
  invertAxisControl: InvertAxisControl;
}
interface Printer {
  name: string;
  xySpeed: number;
  zSpeed: number;
}

interface Screen {
  touchscreen: boolean;
  turnOffWhileSleeping: boolean;
  sleepCommand: string;
  wakeupCommand: string;
}

interface PreheatConfiguration {
  name: string;
  hotend: number;
  heatbed: number;
  fan: number;
}

interface FilamentChange {
  integrated?: {
    feedLength: number;
    feedSpeed: number;
    feedSpeedSlow: number;
    purgeDistance: number;
  };
  loadAndUnload?: {
    unloadCommand: string;
    loadCommand: string;
  };
  change?: {
    changeCommand: string;
  };
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
  plugins: OctoprintPlugins;
}

export interface URLSplit {
  host: string;
  port: number;
}

interface OctoprintPlugins {
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
