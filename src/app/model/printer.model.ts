export interface PrinterStatus {
  status: PrinterState;
  bed: Temperature;
  tool0: Temperature;
  fanSpeed: number;
}

interface Temperature {
  current: number;
  set: number;
  unit: string;
}

export enum PrinterState {
  operational,
  pausing,
  paused,
  printing,
  cancelling,
  closed,
  connecting,
}

interface PrinterCap {
  eeprom: number;
  z_probe: number;
}

export interface ZOffset {
  printer_cap: PrinterCap;
  z_offset: number;
}
