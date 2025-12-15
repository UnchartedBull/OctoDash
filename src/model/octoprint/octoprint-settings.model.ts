export interface TempProfile {
  bed: number | null;
  extruder: number | null;
  chamer: number | null;
  name: string;
}

export interface SpoolmanSettings {
  selectedSpoolIds: {
    [index: string]: {
      spoolId: string;
    };
  };
}

export interface OctoPrintSettings {
  temperature: {
    profiles: TempProfile[];
  };
  plugins: {
    Spoolman?: SpoolmanSettings;
  };
}
