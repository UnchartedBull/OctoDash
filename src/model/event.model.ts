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

export enum PrusaMMUActions {
  SHOW = 'show',
  CLOSE = 'close',
  NAV = 'nav',
}

export interface PrusaMMUMessage {
  action?: string;
  previousTool?: string;
  state?: string;
  tool?: number;
}
