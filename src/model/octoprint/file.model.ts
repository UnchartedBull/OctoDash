import { OctoprintFilament } from './socket.model';

export interface OctoprintFile {
  date: number;
  display: string;
  gcodeAnalysis?: OctoprintGCodeAnalysis;
  hash: string;
  name: string;
  origin: string;
  path: string;
  prints: OctoprintPrints;
  refs: OctoprintRefs;
  size: number;
  statistics?: Record<string, unknown>;
  type: string;
  typePath: [string];
  thumbnail?: string;
}

export interface OctoprintFolder {
  children: [OctoprintFile & OctoprintFolder];
  display: string;
  name: string;
  origin: string;
  path: string;
  refs: OctoprintRefs;
  type: string;
  typePath: [string];
}

interface OctoprintGCodeAnalysis {
  analysisFirstFilamentPrintTime: number;
  analysisLastFilamentPrintTime: number;
  analysisPending: boolean;
  analysisPrintTime: number;
  compensatedPrintTime: number;
  dimensions: {
    depth: number;
    height: number;
    width: number;
  };
  estimatedPrintTime: number;
  filament: OctoprintFilament;
  firstFilament: number;
  lastFilament: number;
  printingArea: {
    maxX: number;
    maxY: number;
    maxZ: number;
    minX: number;
    minY: number;
    minZ: number;
  };
  progress: [[number, number]];
}

interface OctoprintPrints {
  failure: number;
  success: number;
  last: {
    date: number;
    printTime: number;
    success: boolean;
  };
}

interface OctoprintRefs {
  download?: string;
  resource: string;
}

export interface FileCommand {
  command: 'select';
  print: boolean;
}
