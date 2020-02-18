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
                .get(this.configService.getURL('files/local' + folderPath), this.configService.getHTTPHeaders())
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
                                    path: '/' + fileOrFolder.path,
                                    name: fileOrFolder.name,
                                    // TODO: Think of a way to retrieve number of children
                                    files: fileOrFolder.children ? fileOrFolder.children.length : '-',
                                } as unknown) as Folder);
                            } else if (fileOrFolder.typePath.includes('gcode') && fileOrFolder.origin === 'local') {
                                if (!fileOrFolder.gcodeAnalysis) {
                                    this.notificationService.setError(
                                        'Corrupted file found!',
                                        `File ${fileOrFolder.name} does not include GCodeAnalysis. Ignoring it for now ...`,
                                    );
                                    return;
                                }
                                let filamentLength = 0;
                                _.forEach(fileOrFolder.gcodeAnalysis.filament, (tool): void => {
                                    filamentLength += tool.length;
                                });

                                folder.push(({
                                    type: 'file',
                                    path: '/' + fileOrFolder.path,
                                    name: fileOrFolder.name,
                                    size: this.service.convertByteToMegabyte(fileOrFolder.size),
                                    printTime: this.service.convertSecondsToHours(
                                        fileOrFolder.gcodeAnalysis.estimatedPrintTime,
                                    ),
                                    filamentWeight: this.service.convertFilamentLengthToAmount(filamentLength),
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
                .get(this.configService.getURL('files/local' + filePath), this.configService.getHTTPHeaders())
                .subscribe(
                    (data: OctoprintFilesAPI): void => {
                        let filamentLength = 0;
                        _.forEach(data.gcodeAnalysis.filament, (tool): void => {
                            filamentLength += tool.length;
                        });
                        const file = ({
                            type: 'file',
                            path: '/' + data.path,
                            name: data.name,
                            size: this.service.convertByteToMegabyte(data.size),
                            printTime: this.service.convertSecondsToHours(data.gcodeAnalysis.estimatedPrintTime),
                            filamentWeight: this.service.convertFilamentLengthToAmount(filamentLength),
                            date: this.service.convertDateToString(new Date(data.date * 1000)),
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
}
