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
            const folder: Array<File | Folder> = [];
            data.files.forEach((fileOrFolder) => {
              if (fileOrFolder.type === 'folder') {
                folder.push({
                  type: 'folder',
                  path: '/' + fileOrFolder.path,
                  name: fileOrFolder.name,
                  // TODO: Think of a way to retrieve number of children
                  files: fileOrFolder.children ? fileOrFolder.children.length : '-',
                } as Folder);
              } else {
                folder.push({
                  type: 'file',
                  path: '/' + fileOrFolder.path,
                  name: fileOrFolder.name,
                  size: this.convertByteToMegabyte(fileOrFolder.size),
                  printTime: this.jobService.convertSecondsToHours(fileOrFolder.gcodeAnalysis.estimatedPrintTime),
                  filamentWeight: this.jobService.convertFilamentLengthToAmount(fileOrFolder.gcodeAnalysis.filament.tool0.length),
                } as File);
              }
            });
            data = null;
            folder.sort((a, b) => a.type === b.type ? a.name > b.name ? 1 : -1 : a.type === 'folder' ? -1 : 1);

            resolve(folder);
          },
          (error: HttpErrorResponse) => {
            if (error.status === 404) {
              this.errorService.setError('Can\'t find specified folder!', error.message);
              if (foldername !== '/') {
                this.getFolder(foldername.substring(0, foldername.lastIndexOf('/')));
              } else {
                reject();
              }
            } else {
              this.errorService.setError('Can\'t retrieve folder!', error.message);
              reject();
            }
          }
        );
    });
  }

  private convertByteToMegabyte(byte: number): string {
    return (byte / 1000000).toFixed(1);
  }

  private convertDateToString(date: Date): string {
    return `${('0' + date.getDate()).slice(-2)}.${('0' + (date.getMonth() + 1)).slice(-2)}.${date.getFullYear()} ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}`;
  }

  public getFile(filename: string): Promise<any> {

    return new Promise((resolve, reject): void => {
      if (this.httpGETRequest) {
        this.httpGETRequest.unsubscribe();
      }
      this.httpGETRequest = this.http.get(this.configService.getURL('files/local' + filename),
        this.configService.getHTTPHeaders()).subscribe(
          (data: OctoprintFilesAPI) => {
            console.log(data);
            const file = {
              type: 'file',
              path: '/' + data.path,
              name: data.name,
              size: this.convertByteToMegabyte(data.size),
              printTime: this.jobService.convertSecondsToHours(data.gcodeAnalysis.estimatedPrintTime),
              filamentWeight: this.jobService.convertFilamentLengthToAmount(data.gcodeAnalysis.filament.tool0.length),
              date: this.convertDateToString(new Date(data.date * 1000))
            } as File;
            resolve(file);
          },
          (error: HttpErrorResponse) => {
            if (error.status === 404) {
              this.errorService.setError('Can\'t find specified file!', error.message);
              reject();
            } else {
              this.errorService.setError('Can\'t retrieve folder!', error.message);
              reject();
            }
          }
        );
    });
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
  date?: string;
}
