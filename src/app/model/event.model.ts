export enum PrinterEvent {
  PRINTING,
  PAUSED,
  CLOSED,
  CONNECTED,
  IDLE,
  UNKNOWN,
}

// either notification (message) or prompt (action, text and choices)
export interface PrinterNotification {
  message?: string,
  action?: string,
  text?: string,
  choices?: string[],
}
