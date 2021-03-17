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

export interface ConnectCommand {
  command: string;
  port?: string;
  baudrate?: number;
  printerProfile?: string;
  save?: boolean;
  autoconnect?: boolean;
}
