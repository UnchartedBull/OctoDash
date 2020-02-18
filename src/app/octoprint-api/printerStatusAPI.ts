export interface OctoprintPrinterStatusAPI {
    temperature: OctoprintTemperature;
    sd: OctoprintSD;
    state: OctoprintPrinterState;
}

interface OctoprintTemperature {
    tool0?: OctoprintTemperatureData;
    tool1?: OctoprintTemperatureData;
    tool2?: OctoprintTemperatureData;
    tool3?: OctoprintTemperatureData;
    tool4?: OctoprintTemperatureData;
    tool5?: OctoprintTemperatureData;
    bed?: OctoprintTemperatureData;
    [key: string]: OctoprintTemperatureData;
}

interface OctoprintTemperatureData {
    actual: number;
    target: number;
    offset: number;
}

interface OctoprintSD {
    ready: boolean;
}

interface OctoprintPrinterState {
    text: string;
    flags: OctoprintPrinterStateFlags;
}

interface OctoprintPrinterStateFlags {
    operational: boolean;
    paused: boolean;
    printing: boolean;
    pausing: boolean;
    cancelling: boolean;
    sdReady: boolean;
    error: boolean;
    ready: boolean;
    closedOrError: boolean;
}
