import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import _ from 'lodash-es';
import { Subscription } from 'rxjs';

import { ConfigService } from './config/config.service';
import { ConversionService } from './conversion.service';
import { OctoprintDirectory, OctoprintFile, OctoprintFolder } from './model/octoprint/file.model';
import { NotificationService } from './notification/notification.service';

@Injectable({
  providedIn: 'root',
})
export class FilesService {
  private getRequest: Subscription;
  private getRequestTimeout: ReturnType<typeof setTimeout>;
  private postRequest: Subscription;
  private deleteRequest: Subscription;
  private loadedFile = false;

  public constructor(
    private configService: ConfigService,
    private http: HttpClient,
    private notificationService: NotificationService,
    private conversionService: ConversionService,
  ) {}

  public getFolder(folderPath = '/'): Promise<(File | Folder)[]> {
    return new Promise((resolve, reject): void => {
      this.getRequestTimeout = setTimeout(() => {
        this.getRequest.unsubscribe();
        this.notificationService.setError("Can't retrieve folder!", 'Operation timed out. Please try again.');
        reject();
      }, 10000);
      folderPath = folderPath === '/' ? '' : folderPath;
      if (this.getRequest) {
        this.getRequest.unsubscribe();
      }
      this.getRequest = this.http
        .get(this.configService.getApiURL('files' + folderPath), this.configService.getHTTPHeaders())
        .subscribe(
          (data: OctoprintDirectory & OctoprintFolder): void => {
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
                  size: this.conversionService.convertByteToMegabyte(fileOrFolder.size),
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
                  size: this.conversionService.convertByteToMegabyte(fileOrFolder.size),
                  ...(fileOrFolder.gcodeAnalysis
                    ? {
                        printTime: this.conversionService.convertSecondsToHours(
                          fileOrFolder.gcodeAnalysis.estimatedPrintTime,
                        ),
                        filamentWeight: this.conversionService.convertFilamentLengthToWeight(filamentLength),
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
            clearTimeout(this.getRequestTimeout);
          },
        );
    });
  }

  public getFile(filePath: string): Promise<File> {
    return new Promise((resolve, reject): void => {
      if (this.getRequest) {
        this.getRequest.unsubscribe();
      }
      this.getRequest = this.http
        .get(this.configService.getApiURL('files' + filePath), this.configService.getHTTPHeaders())
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
              size: this.conversionService.convertByteToMegabyte(data.size),
              ...(data.gcodeAnalysis
                ? {
                    date: this.conversionService.convertDateToString(new Date(data.date * 1000)),
                    printTime: this.conversionService.convertSecondsToHours(data.gcodeAnalysis.estimatedPrintTime),
                    filamentWeight: this.conversionService.convertFilamentLengthToWeight(filamentLength),
                  }
                : {}),
              thumbnail: data.thumbnail ? this.configService.getApiURL(data.thumbnail, false) : 'assets/object.svg',
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
      if (this.getRequest) {
        this.getRequest.unsubscribe();
      }
      this.getRequest = this.http
        .get(this.configService.getApiURL('files' + filePath), this.configService.getHTTPHeaders())
        .subscribe(
          (data: OctoprintFile): void => {
            const thumbnail = data.thumbnail
              ? this.configService.getApiURL(data.thumbnail, false)
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

  public setLoadedFile(value: boolean): void {
    this.loadedFile = value;
  }

  public getLoadedFile(): boolean {
    return this.loadedFile;
  }

  public loadFile(filePath: string): void {
    if (this.postRequest) {
      this.postRequest.unsubscribe();
    }
    const loadFileBody = {
      command: 'select',
      print: false,
    };
    this.postRequest = this.http
      .post(this.configService.getApiURL('files' + filePath), loadFileBody, this.configService.getHTTPHeaders())
      .subscribe(
        (): void => null,
        (error: HttpErrorResponse): void => {
          this.notificationService.setError("Can't load the file!", error.message);
        },
      );
  }

  public printFile(filePath: string): void {
    if (this.postRequest) {
      this.postRequest.unsubscribe();
    }
    const printFileBody = {
      command: 'select',
      print: true,
    };
    this.postRequest = this.http
      .post(this.configService.getApiURL('files' + filePath), printFileBody, this.configService.getHTTPHeaders())
      .subscribe(
        (): void => null,
        (error: HttpErrorResponse): void => {
          this.notificationService.setError("Can't start print!", error.message);
        },
      );
  }

  public deleteFile(filePath: string): void {
    if (this.deleteRequest) {
      this.deleteRequest.unsubscribe();
    }
    this.deleteRequest = this.http
      .delete(this.configService.getApiURL('files' + filePath), this.configService.getHTTPHeaders())
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
