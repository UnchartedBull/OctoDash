export interface OctoprintJobStatus {
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
