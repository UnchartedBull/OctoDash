import { Observable } from 'rxjs/internal/Observable';

export interface Directory {
  folders: Array<Folder>;
  files: Array<File>;
}

export interface Folder {
  origin: string;
  path: string;
  name: string;
  size: string;
}

export interface File {
  origin: string;
  path: string;
  name: string;
  size: string;
  thumbnail$: Observable<string>;
  printTime?: string;
  filamentWeight?: number;
  date?: string;
  successful: 'files__object--success' | 'files__object--failed' | 'files__object--unknown';
}
