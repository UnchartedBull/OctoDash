export interface SpoolManagerSpoolList {
  allSpools: Array<SpoolManagerSpool>;
  selectedSpools: Array<SpoolManagerSpool>;
  catalogs: SpoolManagerCatalogs;
  templateSpool: SpoolManagerSpool;
  totalItemCount: string;
}

interface SpoolManagerCatalogs {
  labels: Array<string>;
  materials: Array<string>;
  vendors: Array<string>;
}

export interface SpoolManagerSelectionPut {
  databaseId: number;
  toolIndex: number;
}

export interface SpoolManagerSpool {
  bedTemperature: number;
  code: unknown;
  color: string;
  colorName: string;
  cost: number;
  costUnit: string;
  created: string;
  databaseId: number;
  density: number;
  diameter: number;
  diameterTolerance: number;
  displayName: string;
  enclosureTemperature: number;
  firstUse: string;
  flowRateCompensation: number;
  isActive: boolean;
  isTemplate: boolean;
  labels: string;
  lastUse: string;
  material: string;
  materialCharacteristic: unknown;
  noteDeltaFormat: string;
  noteHtml: string;
  noteText: string;
  offsetBedTemperature: number;
  offsetEnclosureTemperature: number;
  offsetTemperature: number;
  originator: unknown;
  purchasedFrom: string;
  purchasedOn: string;
  remainingLength: string;
  remainingLengthPercentage: string;
  remainingPercentage: string;
  remainingWeight: string;
  spoolWeight: string;
  temperature: number;
  totalLength: number;
  totalWeight: number;
  updated: string;
  usedLength: number;
  usedLengthPercentage: string;
  usedPercentage: string;
  usedWeight: string;
  vendor: string;
  version: number;
}
