import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import _ from 'lodash';
import { Subscription } from 'rxjs';

import { AppService } from './app.service';
import { ConfigService } from './config/config.service';
import { NotificationService } from './notification/notification.service';
import { OctoprintFilesAPI, OctoprintFolderAPI, OctoprintFolderContentAPI } from './octoprint-api/filesAPI';

@Injectable({
    providedIn: 'root',
})
export class FilesService {
    private httpGETRequest: Subscription;
    private httpPOSTRequest: Subscription;
    private httpDELETERequest: Subscription;

    public constructor(
        private configService: ConfigService,
        private http: HttpClient,
        private notificationService: NotificationService,
        private service: AppService,
    ) {}

    public getFolder(folderPath: string = '/'): Promise<(File | Folder)[]> {
        return new Promise((resolve, reject): void => {
            folderPath = folderPath === '/' ? '' : folderPath;
            if (this.httpGETRequest) {
                this.httpGETRequest.unsubscribe();
            }
            this.httpGETRequest = this.http
                .get(this.configService.getURL('files' + folderPath), this.configService.getHTTPHeaders())
                .subscribe(
                    (data: OctoprintFolderAPI & OctoprintFolderContentAPI): void => {
                        if ('children' in data) {
                            data.files = data.children;
                            delete data.children;
                        }
                        const folder: (File | Folder)[] = [];
                        data.files.forEach((fileOrFolder): void => {
                            if (fileOrFolder.type === 'folder') {
                                folder.push(({
                                    type: 'folder',
                                    path: '/' + fileOrFolder.origin + '/' + fileOrFolder.path,
                                    name: fileOrFolder.name,
                                    // TODO: Think of a way to retrieve number of children
                                    files: fileOrFolder.children ? fileOrFolder.children.length : '-',
                                } as unknown) as Folder);
                            } else if (fileOrFolder.typePath.includes('gcode')) {
                                if (fileOrFolder.gcodeAnalysis) {
                                    var filamentLength = 0;
                                    _.forEach(fileOrFolder.gcodeAnalysis.filament, (tool): void => {
                                        filamentLength += tool.length;
                                    });
                                    var estimatedPrintTime = this.service.convertSecondsToHours(
                                        fileOrFolder.gcodeAnalysis.estimatedPrintTime,
                                    );
                                }

                                folder.push(({
                                    type: 'file',
                                    path: '/' + fileOrFolder.origin + '/' + fileOrFolder.path,
                                    name: fileOrFolder.name,
                                    date: fileOrFolder.date,
                                    size: this.service.convertByteToMegabyte(fileOrFolder.size),
                                    ... (fileOrFolder.gcodeAnalysis) ? {
                                        printTime: estimatedPrintTime,
                                        filamentWeight: this.service.convertFilamentLengthToAmount(filamentLength),
                                    } : {},
                                } as unknown) as File);
                            }
                        });
                        data = null;

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
                    (data: OctoprintFilesAPI): void => {
                        if (data.gcodeAnalysis) {
                            var filamentLength = 0;
                            _.forEach(data.gcodeAnalysis.filament, (tool): void => {
                                filamentLength += tool.length;
                            });
                        }
                        const file = ({
                            type: 'file',
                            path: '/' + data.path,
                            name: data.name,
                            size: this.service.convertByteToMegabyte(data.size),
                            ... (data.gcodeAnalysis) ? {
                                date: this.service.convertDateToString(new Date(data.date * 1000)),
                                printTime: this.service.convertSecondsToHours(data.gcodeAnalysis.estimatedPrintTime),
                                filamentWeight: this.service.convertFilamentLengthToAmount(filamentLength),
                            } : {},
                            thumbnail: data.path.endsWith('.ufp.gcode')
                                ? this.configService
                                      .getURL('plugin/UltimakerFormatPackage/thumbnail/')
                                      .replace('/api/', '/') + data.path.replace('.ufp.gcode', '.png')
                                : undefined,
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
                .get(this.configService.getURL('files/local/' + filePath), this.configService.getHTTPHeaders())
                .subscribe(
                    (data: OctoprintFilesAPI): void => {
                        let thumbnail = data.path.endsWith('.ufp.gcode')
                            ? this.configService
                                  .getURL('plugin/UltimakerFormatPackage/thumbnail/')
                                  .replace('/api/', '/') + data.path.replace('.ufp.gcode', '.png')
                            : undefined;
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
            .post(
                this.configService.getURL('files/local' + filePath),
                loadFileBody,
                this.configService.getHTTPHeaders(),
            )
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
            .post(
                this.configService.getURL('files/local' + filePath),
                printFileBody,
                this.configService.getHTTPHeaders(),
            )
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
            .delete(this.configService.getURL('files/local' + filePath), this.configService.getHTTPHeaders())
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
