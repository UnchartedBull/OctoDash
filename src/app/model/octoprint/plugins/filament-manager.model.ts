export interface FilamentManagerSpoolList {
  spools: FilamentManagerSpool[];
}

export interface FilamentManagerSelections {
  selections: FilamentManagerSelection[];
}

export interface FilamentManagerSelectionPatch {
  selection: {
    tool: number;
    spool: {
      id: number;
    };
  };
}

interface FilamentManagerSelection {
  // eslint-disable-next-line camelcase
  client_id: string;
  spool: FilamentManagerSpool;
  tool: number;
}

export interface FilamentManagerSpool {
  /* eslint-disable camelcase */
  cost: number;
  id: number;
  name: string;
  displayName?: string;
  color?: string;
  profile: FilamentManagerProfile;
  temp_offset: number;
  used: number;
  weight: number;
}

interface FilamentManagerProfile {
  density: number;
  diameter: number;
  id: number;
  material: string;
  vendor: string;
}
