export interface PrinterProfile {
  id: string;
  current: boolean;
  name: string;
  model: string;
  axes: PrinterAxis;
  volume: VolumeDetails;
}

export interface PrinterAxis {
  x: AxisDetails;
  y: AxisDetails;
  z: AxisDetails;
}

export interface AxisDetails {
  inverted: boolean;
}

export interface VolumeDetails {
  width:number;
  depth:number;
  height:number;
}