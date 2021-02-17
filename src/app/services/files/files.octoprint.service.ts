import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import _ from 'lodash-es';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OctoprintFile, OctoprintFolder } from 'src/app/model/octoprint/file.model';

import { ConfigService } from '../../config/config.service';
import { ConversionService } from '../../conversion.service';
import { Directory, File, Folder } from '../../model';
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
                name: fileOrFolder.name,
                size: this.conversionService.convertByteToMegabyte(fileOrFolder.size),
              } as Folder);
            }

            if (fileOrFolder.typePath.includes('gcode')) {
              directory.files.push({
                origin: fileOrFolder.origin,
                path: '/' + fileOrFolder.origin + '/' + fileOrFolder.path,
                name: fileOrFolder.name,
                date: this.conversionService.convertDateToString(new Date(fileOrFolder.date * 1000)),
                size: this.conversionService.convertByteToMegabyte(fileOrFolder.size),
                ...(fileOrFolder.gcodeAnalysis
                  ? {
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
              directory.folders.push({
                origin: 'local',
                path: '/local',
                name: 'local',
                size: `${localCount} files`,
              } as Folder);
              directory.folders.push({
                origin: 'sdcard',
                path: '/sdcard',
                name: 'sdcard',
                size: `${localCount} files`,
              } as Folder);
            }
          }

          return directory;
        }),
      );
  }

  public getFile(filePath: string): Promise<File> {
    throw new Error('Method not implemented.');
  }

  public getThumbnail(filePath: string): Promise<string> {
    throw new Error('Method not implemented.');
  }

  public loadFile(filePath: string): void {
    throw new Error('Method not implemented.');
  }

  public printFile(filePath: string): void {
    throw new Error('Method not implemented.');
  }

  public deleteFile(filePath: string): void {
    throw new Error('Method not implemented.');
  }

  public setLoadedFile(value: boolean): void {
    this.loadedFile = value;
  }

  public getLoadedFile(): boolean {
    return this.loadedFile;
  }
}
