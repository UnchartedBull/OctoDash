export interface Filament {
  color: string;
  enabled: boolean;
  id: number;
  name: string;
}

export interface FilamentSource {
  id: string;
  name: string;
}

export interface GcodeFilament {
  color: string;
  id: number;
  name: string;
}

export interface PrusaMMU {
  classicColorPicker: boolean;
  debug: boolean;
  defaultFilament?: any;
  displayActiveFilament: boolean;
  filament: Filament[];
  filamentSource: string;
  filamentSources: FilamentSource[];
  gcodeFilament: GcodeFilament[];
  indexAtZero: boolean;
  simpleDisplayMode: boolean;
  timeout: number;
  useDefaultFilament: boolean;
}

export interface Plugins {
  prusammu: PrusaMMU;
}

export interface OctoPrintSettings {
  plugins: Plugins;
}
