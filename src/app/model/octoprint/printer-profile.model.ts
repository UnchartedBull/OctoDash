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
}

export interface OctoprintPrinterAxis {
  x: OctoprintAxisDetails;
  y: OctoprintAxisDetails;
  z: OctoprintAxisDetails;
}

export interface OctoprintAxisDetails {
  inverted: boolean;
}
