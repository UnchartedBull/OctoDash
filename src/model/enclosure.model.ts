export interface TemperatureReading {
  temperature: number;
  humidity: number;
  unit: string;
}

export enum PSUState {
  ON,
  OFF,
}
