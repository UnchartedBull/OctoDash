import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import _ from 'lodash-es';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ConfigService } from '../../config/config.service';
import { ConversionService } from '../../conversion.service';
import { Directory, File, Folder, NotificationType } from '../../model';
import { FileCommand, OctoprintFile, OctoprintFolder } from '../../model/octoprint';
import { NotificationService } from '../../notification/notification.service';
import { FilesService } from './files.service';

@Injectable({
  providedIn: 'root',
})
export class FilesOctoprintService implements FilesService {
  private loadedFile = false;

  public constructor(
    private configService: ConfigService,
    private notificationService: NotificationService,
    private http: HttpClient,
    private conversionService: ConversionService,
  ) {}

  public getFolderContent(folderPath?: string): Observable<Directory> {
    return this.http
      .get(
        this.configService.getApiURL('files' + (folderPath === '/' ? '' : folderPath)),
        this.configService.getHTTPHeaders(),
      )
      .pipe(
        map(response => {
          if (Object.prototype.hasOwnProperty.call(response, 'children')) {
            return response['children'];
          } else {
            return response['files'];
          }
        }),
        map((folderContent: Array<OctoprintFile & OctoprintFolder>) => {
          const directory: Directory = { files: [], folders: [] };

          folderContent.forEach(fileOrFolder => {
            if (fileOrFolder.type === 'folder') {
              directory.folders.push({
                origin: fileOrFolder.origin,
                path: '/' + fileOrFolder.origin + '/' + fileOrFolder.path,
                name: fileOrFolder.display,
                size: this.conversionService.convertByteToMegabyte(fileOrFolder.size),
              } as Folder);
            }

            if (fileOrFolder.typePath.includes('gcode')) {
              directory.files.push({
                origin: fileOrFolder.origin,
                path: '/' + fileOrFolder.origin + '/' + fileOrFolder.path,
                name: fileOrFolder.display,
                date: this.conversionService.convertDateToString(new Date(fileOrFolder.date)),
                size: this.conversionService.convertByteToMegabyte(fileOrFolder.size),
                ...(fileOrFolder.gcodeAnalysis
                  ? {
                      successful:
                        fileOrFolder.prints != null
                          ? fileOrFolder.prints.last.success
                            ? 'files__object--success'
                            : 'files__object--failed'
                          : 'files__object--unknown',
                      thumbnail: fileOrFolder.thumbnail
                        ? this.configService.getApiURL(fileOrFolder.thumbnail, false)
                        : 'assets/object.svg',
                      printTime: this.conversionService.convertSecondsToHours(
                        fileOrFolder.gcodeAnalysis.estimatedPrintTime,
                      ),
                      filamentWeight: this.conversionService.convertFilamentLengthToWeight(
                        _.sumBy(_.values(fileOrFolder.gcodeAnalysis.filament), tool => tool.length),
                      ),
                    }
                  : {}),
              } as File);
            }
          });

          return directory;
        }),
        map((directory: Directory) => {
          if (folderPath === '/') {
            const localCount = _.sumBy(_.concat(directory.files, directory.folders), (fileOrFolder: File & Folder) =>
              fileOrFolder.origin === 'local' ? 1 : 0,
            );
            const sdCardCount = _.sumBy(_.concat(directory.files, directory.folders), (fileOrFolder: File & Folder) =>
              fileOrFolder.origin === 'sdcard' ? 1 : 0,
            );

            if (localCount > 0 && sdCardCount > 0) {
              directory.folders = [
                {
                  origin: 'local',
                  path: '/local',
                  name: $localize`:@@local:local`,
                  size: undefined,
                },
                {
                  origin: 'sdcard',
                  path: '/sdcard',
                  name: $localize`:@@sdcard:sdcard`,
                  size: undefined,
                },
              ];
              directory.files = [];
            }
          }

          return directory;
        }),
      );
  }

  public getFile(filePath: string): Observable<File> {
    return this.http.get(this.configService.getApiURL('files' + filePath), this.configService.getHTTPHeaders()).pipe(
      map((file: OctoprintFile): File => {
        return {
          origin: file.origin,
          path: '/' + file.origin + '/' + file.path,
          name: file.name,
          date: this.conversionService.convertDateToString(new Date(file.date * 1000)),
          size: this.conversionService.convertByteToMegabyte(file.size),
          thumbnail: file.thumbnail ? this.configService.getApiURL(file.thumbnail, false) : 'assets/object.svg',
          ...(file.gcodeAnalysis
            ? {
                printTime: this.conversionService.convertSecondsToHours(file.gcodeAnalysis.estimatedPrintTime),
                filamentWeight: this.conversionService.convertFilamentLengthToWeight(
                  _.sumBy(_.values(file.gcodeAnalysis.filament), tool => tool.length),
                ),
              }
            : {}),
        } as File;
      }),
    );
  }

  public getThumbnail(filePath: string): Observable<string> {
    return this.http.get(this.configService.getApiURL('files' + filePath), this.configService.getHTTPHeaders()).pipe(
      map((file: OctoprintFile): string => {
        return file.thumbnail ? this.configService.getApiURL(file.thumbnail, false) : 'assets/object.svg';
      }),
    );
  }

  public loadFile(filePath: string): void {
    const payload: FileCommand = {
      command: 'select',
      print: false,
    };

    this.http
      .post(this.configService.getApiURL('files' + filePath), payload, this.configService.getHTTPHeaders())
      .pipe(
        catchError(error => {
          this.notificationService.setNotification({
            heading: $localize`:@@files-error-file:Can't load file!`,
            text: error.message,
            type: NotificationType.ERROR,
            time: new Date(),
          });
          return of(null);
        }),
      )
      .subscribe();
  }

  public printFile(filePath: string): void {
    const payload: FileCommand = {
      command: 'select',
      print: true,
    };

    this.http
      .post(this.configService.getApiURL('files' + filePath), payload, this.configService.getHTTPHeaders())
      .pipe(
        catchError(error => {
          this.notificationService.setNotification({
            heading: $localize`:@@files-error-print:Can't start print!`,
            text: error.message,
            type: NotificationType.ERROR,
            time: new Date(),
          });
          return of(null);
        }),
      )
      .subscribe();
  }

  public deleteFile(filePath: string): void {
    this.http
      .delete(this.configService.getApiURL('files' + filePath), this.configService.getHTTPHeaders())
      .pipe(
        catchError(error => {
          this.notificationService.setNotification({
            heading: $localize`:@@files-error-delete:Can't delete file!`,
            text: error.message,
            type: NotificationType.ERROR,
            time: new Date(),
          });
          return of(null);
        }),
      )
      .subscribe();
  }

  public setLoadedFile(value: boolean): void {
    this.loadedFile = value;
  }

  public getLoadedFile(): boolean {
    return this.loadedFile;
  }
}
