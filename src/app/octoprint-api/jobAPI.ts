export interface OctoprintJobAPI {
    job: OctoprintJob;
    progress: OctoprintProgress;
    state: string;
}

interface OctoprintJob {
    file: OctoprintFile;
    estimatedPrintTime: number;
    filament: OctoprintFilament;
}

interface OctoprintFile {
    name: string;
    origin: string;
    display: string;
    path?: string;
    type?: string;
    typePath?: string;
    size: number;
    date: number;
}

export interface OctoprintFilament {
    tool0?: OctoprintFilamentValues;
    tool1?: OctoprintFilamentValues;
    tool2?: OctoprintFilamentValues;
    tool3?: OctoprintFilamentValues;
    tool4?: OctoprintFilamentValues;
    tool5?: OctoprintFilamentValues;
    [key: string]: OctoprintFilamentValues;
}

interface OctoprintFilamentValues {
    length: number;
    volume: number;
}

interface OctoprintProgress {
    completion: number;
    filepos: number;
    printTime: number;
    printTimeLeft: number;
}

export interface JobCommand {
    command: string;
    action?: string;
}
