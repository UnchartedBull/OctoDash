import { Injectable } from '@angular/core';
import { ConfigService } from './config/config.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorService } from './error/error.service';
import { Subscription } from 'rxjs';
import { OctoprintFolderAPI, OctoprintFilesAPI, OctoprintFolderContentAPI } from './octoprint-api/filesAPI';

@Injectable({
  providedIn: 'root'
})
export class FilesService {

  httpGETRequest: Subscription;

  constructor(private configService: ConfigService, private http: HttpClient, private errorService: ErrorService) { }

  public getFolder(foldername: string = '/'): Promise<Array<File | Folder>> {
    return new Promise((resolve, reject): void => {
      foldername = foldername === '/' ? '' : foldername;
      if (this.httpGETRequest) {
        this.httpGETRequest.unsubscribe();
      }
      this.httpGETRequest = this.http.get(this.configService.getURL('files/local' + foldername),
        this.configService.getHTTPHeaders()).subscribe(
          (data: OctoprintFolderAPI & OctoprintFolderContentAPI) => {
            if ('children' in data) {
              data.files = data.children;
            }
            const out: Array<File | Folder> = [];
            console.log(data);
            data.files.forEach((fileOrFolder) => {
              if ('children' in fileOrFolder) {
                out.push({
                  type: 'folder',
                  path: '/' + fileOrFolder.path,
                  name: fileOrFolder.display,
                  files: fileOrFolder.children.length,
                } as Folder);
              } else if ('gcodeAnalysis' in fileOrFolder && 'progress' in fileOrFolder.gcodeAnalysis) {
                out.push({
                  type: 'file',
                  path: '/' + fileOrFolder.path,
                  name: fileOrFolder.display,
                  size: fileOrFolder.size,
                  printTime: fileOrFolder.gcodeAnalysis.estimatedPrintTime,
                  filamentWeight: fileOrFolder.gcodeAnalysis.filament.tool0.length,
                  date: new Date(fileOrFolder.date)
                } as File);
              } else {
                this.errorService.setError('Found weird thing in files.',
                  `The thing ${fileOrFolder.name} is neither a file nor a folder, omitting it for now.`);
              }
            });
            data = null;
            out.sort((a, b) => a.type === b.type ? a.name > b.name ? 1 : -1 : a.type === 'folder' ? -1 : 1);

            console.log(out);

            resolve(out);
          },
          (error: HttpErrorResponse) => {
            if (error.status === 404) {
              this.errorService.setError('Can\'t find specified folder!', error.message);
              if (foldername !== '/') {
                this.getFolder(foldername.substring(0, foldername.lastIndexOf('/')));
              } else {
                reject('not found');
              }
            } else {
              this.errorService.setError('Can\'t retrieve folder!', error.message);
              reject('unknown error');
            }
          }
        );
    });
  }

  public getFile(filename: string): File {
    return null;
  }
}

export interface Folder {
  type: string;
  path: string;
  name: string;
  files?: number;
}

export interface File {
  type: string;
  path: string;
  name: string;
  size?: number;
  printTime?: number;
  filamentWeight?: number;
  date?: Date;
}
