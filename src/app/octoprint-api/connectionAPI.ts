export interface OctoprintConnectionAPI {
  current: OctoprintConnectionCurrentAPI;
  options: OctoprintConnectionOptionsAPI;
}

interface OctoprintConnectionCurrentAPI {
  state: string;
  port: string;
  baudrate: number;
  printerProfile: string;
}

interface OctoprintConnectionOptionsAPI {
  ports: string[];
  baudrates: number[];
  printerProfiles: Record<string, unknown>;
  portPreference: string;
  baudratePreference: string;
  printerProfilePreference: string;
  autoconnect: boolean;
}
