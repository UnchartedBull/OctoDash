export enum PrinterEvent {
  PRINTING,
  PAUSED,
  CLOSED,
  CONNECTED,
  IDLE,
  UNKNOWN,
}

export interface PrinterNotification {
  message?: string;
  action?: string;
  text?: string;
  choices?: string[];
}
