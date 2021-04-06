export interface TasmotaMqttCommand {
  command: 'turnOn' | 'turnOff';
  topic: string;
  relayN: number;
}
