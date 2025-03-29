export interface ConnectCommand {
  command: string;
  port?: string;
  baudrate?: number;
  printerProfile?: string;
  save?: boolean;
  autoconnect?: boolean;
}
