export interface TasmotaCommand {
  command: 'turnOn' | 'turnOff';
  ip: string;
  idx: number;
}
