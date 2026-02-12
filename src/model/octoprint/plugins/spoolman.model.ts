export interface SpoolmanSpoolList {
  data: {
    spools: SpoolmanSpool[];
  };
}

export interface SpoolmanVendor {
  external_id: string | null;
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
  material: string | null;
  name: string | null;
  price: number | null;
  registered: string;
  settings_bed_temp: number;
  settings_extruder_temp: number;
  spool_weight: number;
  vendor: SpoolmanVendor | null;
  weight: number;
}

export interface SpoolmanSpool {
  archived: boolean;
  extra: object;
  filament: SpoolmanFilament;
  first_used: string | null;
  id: number;
  initial_weight: number | null;
  last_used: string | null;
  price: number | null;
  registered: string;
  remaining_length: number | null;
  remaining_weight: number | null;
  spool_weight: number | null;
  used_length: number;
  used_weight: number;
}
