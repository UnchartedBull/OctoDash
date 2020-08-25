import { OctoprintFilament } from './jobAPI';

export interface OctoprintFilesAPI {
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

export interface OctoprintFolderAPI {
  files: [OctoprintFilesAPI & OctoprintFolderContentAPI];
  free: number;
  total: number;
}

export interface OctoprintFolderContentAPI {
  children: [OctoprintFilesAPI & OctoprintFolderContentAPI];
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
