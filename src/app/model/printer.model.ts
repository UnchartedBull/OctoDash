export interface PrinterStatus {
  status: string;
  bed: Temperature;
  tool0: Temperature;
  fanSpeed: number;
}

interface Temperature {
  current: number;
  set: number;
  unit: string;
}
