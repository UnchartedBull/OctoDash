export interface OctoprintPrinterProfiles {
  profiles: {
    [key: string]: OctoprintPrinterProfile;
  };
}

export interface OctoprintPrinterProfile {
  current: boolean;
  name: string;
  model: string;
  axes: OctoprintPrinterAxis;
  extruder: OctoprintPrinterExtruders;
}

interface OctoprintPrinterAxis {
  x: OctoprintAxisDetails;
  y: OctoprintAxisDetails;
  z: OctoprintAxisDetails;
}

interface OctoprintAxisDetails {
  inverted: boolean;
}

interface OctoprintPrinterExtruders {
  count: number;
  offsets: OctoprintPrinterExtruderOffset[];
  sharedNozzle: boolean;
}

interface OctoprintPrinterExtruderOffset {
  x: number;
  y: number;
}
