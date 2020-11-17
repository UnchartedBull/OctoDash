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
  preheatButton: Plugin;
  printTimeGenius: Plugin;
  psuControl: PSUControlPlugin;
}

interface Plugin {
  enabled: boolean;
}

interface EnclosurePlugin extends Plugin {
  ambientSensorID: number | null;
  filament1SensorID: number | null;
  filament2SensorID: number | null;
}

interface PSUControlPlugin extends Plugin {
  turnOnPSUWhenExitingSleep: boolean;
}

interface OctoDash {
  customActions: CustomAction[];
  fileSorting: FileSorting;
  pollingInterval: number;
  touchscreen: boolean;
  turnScreenOffWhileSleeping: boolean;
  preferPreviewWhilePrinting: boolean;
  previewProgressCircle: boolean;
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
