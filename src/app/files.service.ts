import { Injectable } from '@angular/core';
import { ConfigService } from './config/config.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorService } from './error/error.service';
import { Subscription } from 'rxjs';
import { OctoprintFolderAPI, OctoprintFilesAPI, OctoprintFolderContentAPI } from './octoprint-api/filesAPI';
import { JobService } from './job.service';

@Injectable({
  providedIn: 'root'
})
export class FilesService {

  httpGETRequest: Subscription;

  constructor(
    private configService: ConfigService,
    private http: HttpClient,
    private errorService: ErrorService,
    private jobService: JobService) { }

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
              delete data.children;
            }
            const out: Array<File | Folder> = [];
            data.files.forEach((fileOrFolder) => {
              if (fileOrFolder.type === 'folder') {
                out.push({
                  type: 'folder',
                  path: '/' + fileOrFolder.path,
                  name: fileOrFolder.name,
                  // TODO: Think of a way to retrieve number of children
                  files: fileOrFolder.children ? fileOrFolder.children.length : '-',
                } as Folder);
              } else {
                out.push({
                  type: 'file',
                  path: '/' + fileOrFolder.path,
                  name: fileOrFolder.name,
                  size: this.convertByteToMegabyte(fileOrFolder.size),
                  printTime: this.jobService.convertSecondsToHours(fileOrFolder.gcodeAnalysis.estimatedPrintTime),
                  filamentWeight: this.jobService.convertFilamentLengthToAmount(fileOrFolder.gcodeAnalysis.filament.tool0.length),
                  date: new Date(fileOrFolder.date)
                } as File);
              }
            });
            data = null;
            out.sort((a, b) => a.type === b.type ? a.name > b.name ? 1 : -1 : a.type === 'folder' ? -1 : 1);

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

  private convertByteToMegabyte(byte: number): string {
    return (byte / 1000000).toFixed(1);
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
  size?: string;
  printTime?: string;
  filamentWeight?: number;
  date?: Date;
}
