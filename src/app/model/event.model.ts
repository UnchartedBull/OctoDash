export enum PrinterEvent {
  PRINTING,
  PAUSED,
  CLOSED,
  CONNECTED,
  IDLE,
  UNKNOWN,
}

// either notification (message) or prompt (text and choices)
export interface PrinterNotification {
  message?: string,
  text?: string,
  choices?: string[],
}
