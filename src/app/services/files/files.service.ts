import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Directory, File } from '../../model';

@Injectable()
export abstract class FilesService {
  abstract getFolderContent(folderPath: string): Observable<Directory>;

  abstract getFile(filePath: string): Promise<File>;

  abstract getThumbnail(filePath: string): Promise<string | undefined>;

  abstract loadFile(filePath: string): void;

  abstract printFile(filePath: string): void;

  abstract deleteFile(filePath: string): void;

  abstract setLoadedFile(value: boolean): void;

  abstract getLoadedFile(): boolean;
}
