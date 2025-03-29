import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Directory, File } from '../../model';

@Injectable()
export abstract class FilesService {
  abstract getFolderContent(folderPath: string): Observable<Directory>;

  abstract getFile(filePath: string): Observable<File>;

  abstract getThumbnail(filePath: string): Observable<string | undefined>;

  abstract loadFile(filePath: string): void;

  abstract printFile(filePath: string): void;

  abstract deleteFile(filePath: string): void;

  abstract setLoadedFile(value: boolean): void;

  abstract getLoadedFile(): boolean;
}
