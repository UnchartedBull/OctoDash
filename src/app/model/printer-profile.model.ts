export interface PrinterProfile {
  current: boolean;
  name: string;
  model: string;
  axes: PrinterAxis;
  extruder: PrinterExtruders;
}

export interface PrinterAxis {
  x: AxisDetails;
  y: AxisDetails;
  z: AxisDetails;
}

export interface AxisDetails {
  inverted: boolean;
}

export interface PrinterExtruders {
  count: number;
  offsets: PrinterExtruderOffset[];
  sharedNozzle: boolean;
}

interface PrinterExtruderOffset {
  x: number;
  y: number;
}
