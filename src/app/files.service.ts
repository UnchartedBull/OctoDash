import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import _ from 'lodash';
import { Subscription } from 'rxjs';

import { AppService } from './app.service';
import { ConfigService } from './config/config.service';
import { NotificationService } from './notification/notification.service';
import { OctoprintFile, OctoprintFolder, OctoprintFolderContent } from './octoprint/model/file';

@Injectable({
  providedIn: 'root',
})
export class FilesService {
  private httpGETRequest: Subscription;
  private httpGETRequestTimeout: ReturnType<typeof setTimeout>;
  private httpPOSTRequest: Subscription;
  private httpDELETERequest: Subscription;

  public constructor(
    private configService: ConfigService,
    private http: HttpClient,
    private notificationService: NotificationService,
    private service: AppService,
  ) {}

  public getFolder(folderPath = '/'): Promise<(File | Folder)[]> {
    return new Promise((resolve, reject): void => {
      this.httpGETRequestTimeout = setTimeout(() => {
        this.httpGETRequest.unsubscribe();
        this.notificationService.setError("Can't retrieve folder!", 'Operation timed out. Please try again.');
        reject();
      }, 10000);
      folderPath = folderPath === '/' ? '' : folderPath;
      if (this.httpGETRequest) {
        this.httpGETRequest.unsubscribe();
      }
      this.httpGETRequest = this.http
        .get(this.configService.getURL('files' + folderPath), this.configService.getHTTPHeaders())
        .subscribe(
          (data: OctoprintFolder & OctoprintFolderContent): void => {
            if ('children' in data) {
              data.files = data.children;
              delete data.children;
            }
            const folder: (File | Folder)[] = [];
            let localCount = 0;
            let sdCardCount = 0;
            data.files.forEach((fileOrFolder): void => {
              if (fileOrFolder.type === 'folder') {
                if (folderPath === '') {
                  if (fileOrFolder.origin == 'local') {
                    localCount += fileOrFolder.children.length;
                  } else {
                    sdCardCount += fileOrFolder.children.length;
                  }
                }

                folder.push(({
                  type: 'folder',
                  path: '/' + fileOrFolder.origin + '/' + fileOrFolder.path,
                  name: fileOrFolder.name,
                  // TODO: Think of a way to retrieve number of children
                  files: fileOrFolder.children ? fileOrFolder.children.length : '-',
                } as unknown) as Folder);
              } else if (fileOrFolder.typePath.includes('gcode')) {
                let filamentLength = 0;
                if (fileOrFolder.gcodeAnalysis) {
                  _.forEach(fileOrFolder.gcodeAnalysis.filament, (tool): void => {
                    filamentLength += tool.length;
                  });
                }

                if (folderPath === '') {
                  if (fileOrFolder.origin == 'local') {
                    localCount += 1;
                  } else {
                    sdCardCount += 1;
                  }
                }

                folder.push(({
                  type: 'file',
                  path: '/' + fileOrFolder.origin + '/' + fileOrFolder.path,
                  name: fileOrFolder.name,
                  date: fileOrFolder.date,
                  size: this.service.convertByteToMegabyte(fileOrFolder.size),
                  ...(fileOrFolder.gcodeAnalysis
                    ? {
                        printTime: this.service.convertSecondsToHours(fileOrFolder.gcodeAnalysis.estimatedPrintTime),
                        filamentWeight: this.service.convertFilamentLengthToWeight(filamentLength),
                      }
                    : {}),
                } as unknown) as File);
              }
            });
            data = null;

            if (folderPath === '') {
              if (localCount > 0 && sdCardCount > 0) {
                folder.length = 0;
                folder.push(({
                  type: 'folder',
                  path: '/local',
                  name: 'local',
                  files: localCount,
                } as unknown) as Folder);
                folder.push(({
                  type: 'folder',
                  path: '/sdcard',
                  name: 'sdcard',
                  files: sdCardCount,
                } as unknown) as Folder);
              }
            }

            resolve(folder);
          },
          (error: HttpErrorResponse): void => {
            if (error.status === 404) {
              this.notificationService.setError("Can't find specified folder!", error.message);
              if (folderPath !== '/') {
                this.getFolder(folderPath.substring(0, folderPath.lastIndexOf('/')));
              } else {
                reject();
              }
            } else {
              this.notificationService.setError("Can't retrieve folder!", error.message);
              reject();
            }
          },
          (): void => {
            clearTimeout(this.httpGETRequestTimeout);
          },
        );
    });
  }

  public getFile(filePath: string): Promise<File> {
    return new Promise((resolve, reject): void => {
      if (this.httpGETRequest) {
        this.httpGETRequest.unsubscribe();
      }
      this.httpGETRequest = this.http
        .get(this.configService.getURL('files' + filePath), this.configService.getHTTPHeaders())
        .subscribe(
          (data: OctoprintFile): void => {
            let filamentLength = 0;
            if (data.gcodeAnalysis) {
              _.forEach(data.gcodeAnalysis.filament, (tool): void => {
                filamentLength += tool.length;
              });
            }
            const file = ({
              type: 'file',
              path: '/' + data.origin + '/' + data.path,
              name: data.name,
              size: this.service.convertByteToMegabyte(data.size),
              ...(data.gcodeAnalysis
                ? {
                    date: this.service.convertDateToString(new Date(data.date * 1000)),
                    printTime: this.service.convertSecondsToHours(data.gcodeAnalysis.estimatedPrintTime),
                    filamentWeight: this.service.convertFilamentLengthToWeight(filamentLength),
                  }
                : {}),
              thumbnail: data.thumbnail
                ? this.configService.getURL(data.thumbnail).replace('/api/', '/')
                : 'assets/object.svg',
            } as unknown) as File;
            resolve(file);
          },
          (error: HttpErrorResponse): void => {
            if (error.status === 404) {
              this.notificationService.setError("Can't find specified file!", error.message);
              reject();
            } else {
              this.notificationService.setError("Can't retrieve folder!", error.message);
              reject();
            }
          },
        );
    });
  }

  public getThumbnail(filePath: string): Promise<string | undefined> {
    return new Promise((resolve, reject): void => {
      if (this.httpGETRequest) {
        this.httpGETRequest.unsubscribe();
      }
      this.httpGETRequest = this.http
        .get(this.configService.getURL('files' + filePath), this.configService.getHTTPHeaders())
        .subscribe(
          (data: OctoprintFile): void => {
            const thumbnail = data.thumbnail
              ? this.configService.getURL(data.thumbnail).replace('/api/', '/')
              : 'assets/object.svg';
            resolve(thumbnail);
          },
          (error: HttpErrorResponse): void => {
            this.notificationService.setError("Can't load thumbnail!", error.message);
            reject();
          },
        );
    });
  }

  public loadFile(filePath: string): void {
    if (this.httpPOSTRequest) {
      this.httpPOSTRequest.unsubscribe();
    }
    const loadFileBody = {
      command: 'select',
      print: false,
    };
    this.httpPOSTRequest = this.http
      .post(this.configService.getURL('files' + filePath), loadFileBody, this.configService.getHTTPHeaders())
      .subscribe(
        (): void => null,
        (error: HttpErrorResponse): void => {
          this.notificationService.setError("Can't load the file!", error.message);
        },
      );
  }

  public printFile(filePath: string): void {
    if (this.httpPOSTRequest) {
      this.httpPOSTRequest.unsubscribe();
    }
    const printFileBody = {
      command: 'select',
      print: true,
    };
    this.httpPOSTRequest = this.http
      .post(this.configService.getURL('files' + filePath), printFileBody, this.configService.getHTTPHeaders())
      .subscribe(
        (): void => null,
        (error: HttpErrorResponse): void => {
          this.notificationService.setError("Can't start print!", error.message);
        },
      );
  }

  public deleteFile(filePath: string): void {
    if (this.httpDELETERequest) {
      this.httpDELETERequest.unsubscribe();
    }
    this.httpDELETERequest = this.http
      .delete(this.configService.getURL('files' + filePath), this.configService.getHTTPHeaders())
      .subscribe(
        (): void => null,
        (error: HttpErrorResponse): void => {
          this.notificationService.setError("Can't delete file!", error.message);
        },
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
  thumbnail?: string;
}
