export interface TempProfile {
  bed: number | null;
  extruder: number | null;
  chamer: number | null;
  name: string;
}

export interface OctoPrintSettings {
  temperature: {
    profiles: TempProfile[];
  };
}
