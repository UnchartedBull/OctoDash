export interface OctoprintConnection {
  current: OctoprintCurrentConnection;
  options: OctoprintConnectionOptions;
}

interface OctoprintCurrentConnection {
  state: string;
  port: string;
  baudrate: number;
  printerProfile: string;
}

interface OctoprintConnectionOptions {
  ports: string[];
  baudrates: number[];
  printerProfiles: Record<string, unknown>;
  portPreference: string;
  baudratePreference: string;
  printerProfilePreference: string;
  autoconnect: boolean;
}
