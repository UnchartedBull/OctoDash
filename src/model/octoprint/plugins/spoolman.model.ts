export interface SpoolmanSpoolList {
  data: {
    spools: SpoolmanSpool[];
  };
}

export interface SpoolmanVendor {
  external_id: string;
  extra: object;
  id: number;
  name: string;
  registered: string;
}

export interface SpoolmanFilament {
  color_hex: string;
  density: number;
  diameter: number;
  external_id: string;
  extra: object;
  id: number;
  material: string;
  name: string;
  price: number;
  registered: string;
  settings_bed_temp: number;
  settings_extruder_temp: number;
  spool_weight: number;
  vendor: SpoolmanVendor;
  weight: number;
}

export interface SpoolmanSpool {
  archived: boolean;
  extra: object;
  filament: SpoolmanFilament;
  first_used: string;
  id: number;
  initial_weight: number;
  last_used: string;
  price: number;
  registered: string;
  remaining_length: number;
  remaining_weight: number;
  spool_weight: number;
  used_length: number;
  used_weight: number;
}

export interface SpoolmanCurrentJobRequirements {
  data: {
    isFilamentUsageAvailable: boolean;
    tools: SpoolmanToolInfo;
  };
}

export interface SpoolmanToolInfo {
  [key: string]: SpoolmanTool;
}

export interface SpoolmanTool {
  filamentLength: number;
  filamentWeight: number;
  spoolId: number;
}
