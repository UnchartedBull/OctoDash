import { Injectable } from '@angular/core';
import { ConfigService } from './config/config.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorService } from './error/error.service';
import { Subscription } from 'rxjs';
import { OctoprintFolderAPI, OctoprintFilesAPI, OctoprintFolderContentAPI } from './octoprint-api/filesAPI';
import { AppService } from './app.service';

@Injectable({
  providedIn: 'root'
})
export class FilesService {

  httpGETRequest: Subscription;
  httpPOSTRequest: Subscription;
  httpDELETERequest: Subscription;

  constructor(
    private configService: ConfigService,
    private http: HttpClient,
    private errorService: ErrorService,
    private service: AppService) { }

  public getFolder(folderPath: string = '/'): Promise<Array<File | Folder>> {
    return new Promise((resolve, reject): void => {
      folderPath = folderPath === '/' ? '' : folderPath;
      if (this.httpGETRequest) {
        this.httpGETRequest.unsubscribe();
      }
      this.httpGETRequest = this.http.get(this.configService.getURL('files/local' + folderPath),
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
                  size: this.service.convertByteToMegabyte(fileOrFolder.size),
                  printTime: this.service.convertSecondsToHours(fileOrFolder.gcodeAnalysis.estimatedPrintTime),
                  filamentWeight: this.service.convertFilamentLengthToAmount(fileOrFolder.gcodeAnalysis.filament.tool0.length),
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
              if (folderPath !== '/') {
                this.getFolder(folderPath.substring(0, folderPath.lastIndexOf('/')));
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

  public getFile(filePath: string): Promise<any> {

    return new Promise((resolve, reject): void => {
      if (this.httpGETRequest) {
        this.httpGETRequest.unsubscribe();
      }
      this.httpGETRequest = this.http.get(this.configService.getURL('files/local' + filePath),
        this.configService.getHTTPHeaders()).subscribe(
          (data: OctoprintFilesAPI) => {
            const file = {
              type: 'file',
              path: '/' + data.path,
              name: data.name,
              size: this.service.convertByteToMegabyte(data.size),
              printTime: this.service.convertSecondsToHours(data.gcodeAnalysis.estimatedPrintTime),
              filamentWeight: this.service.convertFilamentLengthToAmount(data.gcodeAnalysis.filament.tool0.length),
              date: this.service.convertDateToString(new Date(data.date * 1000))
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

  public loadFile(filePath: string) {
    if (this.httpPOSTRequest) {
      this.httpPOSTRequest.unsubscribe();
    }
    const loadFileBody = {
      command: 'select',
      print: false
    };
    this.httpPOSTRequest = this.http.post(this.configService.getURL('files/local' + filePath),
      loadFileBody, this.configService.getHTTPHeaders()).subscribe(
        () => null,
        (error: HttpErrorResponse) => {
          this.errorService.setError('Can\'t load the file!', error.message);
        }
      );
  }

  public printFile(filePath: string) {
    if (this.httpPOSTRequest) {
      this.httpPOSTRequest.unsubscribe();
    }
    const printFileBody = {
      command: 'select',
      print: true
    };
    this.httpPOSTRequest = this.http.post(this.configService.getURL('files/local' + filePath),
      printFileBody, this.configService.getHTTPHeaders()).subscribe(
        () => null,
        (error: HttpErrorResponse) => {
          this.errorService.setError('Can\'t start print!', error.message);
        }
      );
  }

  public deleteFile(filePath: string) {
    if (this.httpDELETERequest) {
      this.httpDELETERequest.unsubscribe();
    }
    this.httpDELETERequest = this.http.delete(this.configService.getURL('files/local' + filePath),
      this.configService.getHTTPHeaders()).subscribe(
        () => null,
        (error: HttpErrorResponse) => {
          this.errorService.setError('Can\'t delete file!', error.message);
        }
      );
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
