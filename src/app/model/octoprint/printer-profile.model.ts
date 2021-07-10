export interface OctoprintPrinterProfiles {
  profiles: {
    [key: string]: OctoprintPrinterProfile;
  };
}

export interface OctoprintPrinterProfile {
  id: string;
  current: boolean;
  name: string;
  model: string;
  axes: OctoprintPrinterAxis;
  volume: OctoprintVolumeDetails;
}

interface OctoprintPrinterAxis {
  x: OctoprintAxisDetails;
  y: OctoprintAxisDetails;
  z: OctoprintAxisDetails;
}

interface OctoprintAxisDetails {
  inverted: boolean;
}

interface OctoprintVolumeDetails {
  width:number;
  depth:number;
  height:number;
}