export interface OctoprintPrinterProfileAPI {
  name: string;
  model: string;
  axes: OctoprintPrinterAxis;
}

export interface OctoprintPrinterAxis {
  x: OctoprintAxisDetails;
  y: OctoprintAxisDetails;
  z: OctoprintAxisDetails;
}

export interface OctoprintAxisDetails {
  inverted: boolean;
}
