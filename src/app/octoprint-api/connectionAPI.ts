export interface OctoprintConnectionAPI {
    current: OctoprintConnectionCurrentAPI;
    options: OctoprintConnectionOptionsAPI;
}

interface OctoprintConnectionCurrentAPI {
    state: string;
    port: string;
    baudrate: number;
    printerProfile: string;
}

interface OctoprintConnectionOptionsAPI {
    ports: Array<string>;
    baudrates: Array<number>;
    printerProfiles: Array<object>;
    portPreference: string;
    baudratePreference: string;
    printerProfilePreference: string;
    autoconnect: boolean;
}
