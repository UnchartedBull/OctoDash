export interface TPLinkCommand {
  command: 'turnOn' | 'turnOff';
  ip: string;
}
