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

export interface MoonrakerPrinterInfo {
  result: {
    hostname: string;
  };
}

interface OctoprintPrinterAxis {
  x: OctoprintAxisDetails;
  y: OctoprintAxisDetails;
  z: OctoprintAxisDetails;
}

interface OctoprintAxisDetails {
  inverted: boolean;
}
