import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { ConfigService } from '../../config/config.service';
import { NotificationService } from '../../notification/notification.service';
import { FilamentManagementPlugin, FilamentSpool } from './filament.interface';

const colorRegexp = /\((.*)\)$/g;

@Injectable({
  providedIn: 'root',
})
export class FilamentManagerService implements FilamentManagementPlugin {
  private httpGETRequest: Subscription;
  private httpPOSTRequest: Subscription;

  public constructor(
    private configService: ConfigService,
    private notificationService: NotificationService,
    private http: HttpClient,
  ) {}

  // public getSpoolList(): Promise<FilamentSpoolList> {
  //   return new Promise((resolve, reject): void => {
  //     if (this.httpGETRequest) {
  //       this.httpGETRequest.unsubscribe();
  //     }
  //     this.httpGETRequest = this.http
  //       .get(
  //         this.configService.getURL('plugin/filamentmanager/spools').replace('/api', ''),
  //         this.configService.getHTTPHeaders(),
  //       )
  //       .subscribe(
  //         (spools: FilamentSpoolList): void => {
  //           spools.spools.forEach((spool): void => {
  //             const match = colorRegexp.exec(spool.name);
  //             if (match) {
  //               spool.color = match[1];
  //               spool.displayName = `${spool.profile.vendor} - ${spool.name.replace(match[0], '')}`;
  //             } else {
  //               spool.color = '#f5f6fa';
  //               spool.displayName = `${spool.profile.vendor} - ${spool.name}`;
  //             }
  //             colorRegexp.lastIndex = 0;
  //           });
  //           resolve(spools);
  //         },
  //         (error: HttpErrorResponse): void => {
  //           this.notificationService.setError("Can't load filament spools!", error.message);
  //           reject();
  //         },
  //       );
  //   });
  // }

  public getSpools(): Observable<Array<FilamentSpool>> {
    return this.http
      .get(
        this.configService.getURL('plugin/filamentmanager/spools').replace('/api', ''),
        this.configService.getHTTPHeaders(),
      )
      .pipe(
        map(
          (spools: FilamentManagerSpoolList): Array<FilamentSpool> => {
            return spools.spools.map(
              (spool: FilamentManagerSpool): FilamentSpool => {
                return {
                  color: '#f5f6fa',
                  density: spool.profile.density,
                  diameter: spool.profile.diameter,
                  displayName: `${spool.profile.vendor} - ${spool.name}`,
                  id: spool.id,
                  material: spool.profile.material,
                  name: spool.name,
                  temperatureOffset: spool.temp_offset,
                  used: spool.used,
                  vendor: spool.profile.vendor,
                  weight: spool.weight,
                };
              },
            );
          },
        ),
        map((spools: Array<FilamentSpool>) => {
          spools.forEach((spool): void => {
            const match = colorRegexp.exec(spool.name);
            if (match) {
              spool.color = match[1];
              spool.displayName = `${spool.vendor} - ${spool.name.replace(match[0], '')}`;
            }
            colorRegexp.lastIndex = 0;
          });
          return spools;
        }),
      );
  }

  public getCurrentSpool(): Promise<FilamentManagerSpool> {
    return new Promise((resolve, reject): void => {
      if (this.httpGETRequest) {
        this.httpGETRequest.unsubscribe();
      }
      this.httpGETRequest = this.http
        .get(
          this.configService.getURL('plugin/filamentmanager/selections').replace('/api', ''),
          this.configService.getHTTPHeaders(),
        )
        .subscribe(
          (selections: FilamentManagerSelections): void => {
            if (selections.selections.length > 0) {
              const match = colorRegexp.exec(selections.selections[0].spool.name);
              if (match) {
                selections.selections[0].spool.color = match[1];
                selections.selections[0].spool.displayName = `${
                  selections.selections[0].spool.profile.vendor
                } - ${selections.selections[0].spool.name.replace(match[0], '')}`;
              } else {
                selections.selections[0].spool.color = '#f5f6fa';
                selections.selections[0].spool.displayName = `${selections.selections[0].spool.profile.vendor} - ${selections.selections[0].spool.name}`;
              }
              colorRegexp.lastIndex = 0;
              resolve(selections.selections[0].spool);
            }
            resolve(null);
          },
          (error: HttpErrorResponse): void => {
            this.notificationService.setError("Can't load filament spools!", error.message);
            reject();
          },
        );
    });
  }

  public setCurrentSpool(spool: FilamentManagerSpool): Promise<void> {
    return new Promise((resolve, reject): void => {
      const setSpoolBody: FilamentManagerSelectionPatch = {
        selection: {
          tool: 0,
          spool: spool,
        },
      };
      if (this.httpPOSTRequest) {
        this.httpPOSTRequest.unsubscribe();
      }
      this.httpPOSTRequest = this.http
        .patch(
          this.configService.getURL('plugin/filamentmanager/selections/0').replace('/api', ''),
          setSpoolBody,
          this.configService.getHTTPHeaders(),
        )
        .subscribe(
          (selection: FilamentManagerSelectionConfirm): void => {
            if (selection.selection.spool.id === spool.id) {
              resolve();
            } else {
              this.notificationService.setError(
                `Spool IDs didn't match`,
                `Can't change spool. Please change spool manually in the OctoPrint UI.`,
              );
              reject();
            }
          },
          (error: HttpErrorResponse): void => {
            this.notificationService.setError("Can't set new spool!", error.message);
            reject();
          },
        );
    });
  }
}

export interface FilamentManagerSpoolList {
  spools: FilamentManagerSpool[];
}

interface FilamentManagerSelections {
  selections: FilamentManagerSelection[];
}

interface FilamentManagerSelectionPatch {
  selection: {
    tool: number;
    spool: FilamentManagerSpool;
  };
}

interface FilamentManagerSelectionConfirm {
  selection: FilamentManagerSelection;
}

interface FilamentManagerSelection {
  // eslint-disable-next-line camelcase
  client_id: string;
  spool: FilamentManagerSpool;
  tool: number;
}

interface FilamentManagerSpool {
  /* eslint-disable camelcase */
  cost: number;
  id: number;
  name: string;
  displayName?: string;
  color?: string;
  profile: FilamentManagerProfile;
  temp_offset: number;
  used: number;
  weight: number;
}

interface FilamentManagerProfile {
  density: number;
  diameter: number;
  id: number;
  material: string;
  vendor: string;
}
