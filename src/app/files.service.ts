import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import _ from 'lodash-es';
import { Subscription } from 'rxjs';

import { ConfigService } from './config/config.service';
import { ConversionService } from './conversion.service';
import { NotificationService } from './notification/notification.service';
import { OctoprintFile, OctoprintFolder, OctoprintFolderContent } from './model/octoprint/file.model';

@Injectable({
  providedIn: 'root',
})
export class FilesService {
  private _getRequest: Subscription;
  private _getRequestTimeout: ReturnType<typeof setTimeout>;
  private _postRequest: Subscription;
  private _deleteRequest: Subscription;
  private _loadedFile = false;

  public constructor(
    private _configService: ConfigService,
    private _http: HttpClient,
    private _notificationService: NotificationService,
    private _conversionService: ConversionService,
  ) {}

  public getFolder(folderPath = '/'): Promise<(File | Folder)[]> {
    return new Promise((resolve, reject): void => {
      this._getRequestTimeout = setTimeout(() => {
        this._getRequest.unsubscribe();
        this._notificationService.setError("Can't retrieve folder!", 'Operation timed out. Please try again.');
        reject();
      }, 10000);
      folderPath = folderPath === '/' ? '' : folderPath;
      if (this._getRequest) {
        this._getRequest.unsubscribe();
      }
      this._getRequest = this._http
        .get(this._configService.getApiURL('files' + folderPath), this._configService.getHTTPHeaders())
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
                  size: this._conversionService.convertByteToMegabyte(fileOrFolder.size),
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
                  size: this._conversionService.convertByteToMegabyte(fileOrFolder.size),
                  ...(fileOrFolder.gcodeAnalysis
                    ? {
                        printTime: this._conversionService.convertSecondsToHours(
                          fileOrFolder.gcodeAnalysis.estimatedPrintTime,
                        ),
                        filamentWeight: this._conversionService.convertFilamentLengthToWeight(filamentLength),
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
              this._notificationService.setError("Can't find specified folder!", error.message);
              if (folderPath !== '/') {
                this.getFolder(folderPath.substring(0, folderPath.lastIndexOf('/')));
              } else {
                reject();
              }
            } else {
              this._notificationService.setError("Can't retrieve folder!", error.message);
              reject();
            }
          },
          (): void => {
            clearTimeout(this._getRequestTimeout);
          },
        );
    });
  }

  public getFile(filePath: string): Promise<File> {
    return new Promise((resolve, reject): void => {
      if (this._getRequest) {
        this._getRequest.unsubscribe();
      }
      this._getRequest = this._http
        .get(this._configService.getApiURL('files' + filePath), this._configService.getHTTPHeaders())
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
              size: this._conversionService.convertByteToMegabyte(data.size),
              ...(data.gcodeAnalysis
                ? {
                    date: this._conversionService.convertDateToString(new Date(data.date * 1000)),
                    printTime: this._conversionService.convertSecondsToHours(data.gcodeAnalysis.estimatedPrintTime),
                    filamentWeight: this._conversionService.convertFilamentLengthToWeight(filamentLength),
                  }
                : {}),
              thumbnail: data.thumbnail ? this._configService.getApiURL(data.thumbnail, false) : 'assets/object.svg',
            } as unknown) as File;
            resolve(file);
          },
          (error: HttpErrorResponse): void => {
            if (error.status === 404) {
              this._notificationService.setError("Can't find specified file!", error.message);
              reject();
            } else {
              this._notificationService.setError("Can't retrieve folder!", error.message);
              reject();
            }
          },
        );
    });
  }

  public getThumbnail(filePath: string): Promise<string | undefined> {
    return new Promise((resolve, reject): void => {
      if (this._getRequest) {
        this._getRequest.unsubscribe();
      }
      this._getRequest = this._http
        .get(this._configService.getApiURL('files' + filePath), this._configService.getHTTPHeaders())
        .subscribe(
          (data: OctoprintFile): void => {
            const thumbnail = data.thumbnail
              ? this._configService.getApiURL(data.thumbnail, false)
              : 'assets/object.svg';
            resolve(thumbnail);
          },
          (error: HttpErrorResponse): void => {
            this._notificationService.setError("Can't load thumbnail!", error.message);
            reject();
          },
        );
    });
  }

  public set loadedFile(value: boolean) {
    this._loadedFile = value;
  }

  public get loadedFile(): boolean {
    return this._loadedFile;
  }

  public loadFile(filePath: string): void {
    if (this._postRequest) {
      this._postRequest.unsubscribe();
    }
    const loadFileBody = {
      command: 'select',
      print: false,
    };
    this._postRequest = this._http
      .post(this._configService.getApiURL('files' + filePath), loadFileBody, this._configService.getHTTPHeaders())
      .subscribe(
        (): void => null,
        (error: HttpErrorResponse): void => {
          this._notificationService.setError("Can't load the file!", error.message);
        },
      );
  }

  public printFile(filePath: string): void {
    if (this._postRequest) {
      this._postRequest.unsubscribe();
    }
    const printFileBody = {
      command: 'select',
      print: true,
    };
    this._postRequest = this._http
      .post(this._configService.getApiURL('files' + filePath), printFileBody, this._configService.getHTTPHeaders())
      .subscribe(
        (): void => null,
        (error: HttpErrorResponse): void => {
          this._notificationService.setError("Can't start print!", error.message);
        },
      );
  }

  public deleteFile(filePath: string): void {
    if (this._deleteRequest) {
      this._deleteRequest.unsubscribe();
    }
    this._deleteRequest = this._http
      .delete(this._configService.getApiURL('files' + filePath), this._configService.getHTTPHeaders())
      .subscribe(
        (): void => null,
        (error: HttpErrorResponse): void => {
          this._notificationService.setError("Can't delete file!", error.message);
        },
      );
  }
}

export interface Folder {
  type: string;
  path: string;
  name: string;
  size: string;
}

export interface File {
  type: string;
  path: string;
  name: string;
  size: string;
  printTime?: string;
  filamentWeight?: number;
  date?: string;
  thumbnail?: string;
}
