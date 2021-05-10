export interface PrinterProfile {
  id: string;
  current: boolean;
  name: string;
  model: string;
  axes: PrinterAxis;
}

export interface PrinterAxis {
  x: AxisDetails;
  y: AxisDetails;
  z: AxisDetails;
}

export interface AxisDetails {
  inverted: boolean;
}
