export interface ConfigOld {
    octoprint: Octoprint;
    printer: Printer;
    filament: Filament;
    octodash: OctoDash;
}

interface OctoDash {
    touchscreen: boolean;
    temperatureSensor: TemperatureSensor | null;
    customActions: CustomAction[];
    turnScreenOffSleep: boolean;
}

interface CustomAction {
    icon: string;
    command: string;
    color: string;
}

interface TemperatureSensor {
    ambient: number | null;
    filament1: number | null;
    filament2: number | null;
}

interface Octoprint {
    url: string;
    accessToken: string;
    apiInterval: number;
    urlSplit?: {
        url: string;
        port: number;
    };
}

interface Printer {
    name: string;
    xySpeed: number;
    zSpeed: number;
}

interface Filament {
    thickness: number;
    density: number;
}
