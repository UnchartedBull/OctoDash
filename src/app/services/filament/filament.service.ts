import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ConfigService } from '../../config/config.service';
import { FilamentSpool } from '../../model';
import { NotificationService } from '../../notification/notification.service';
import { FilamentPluginService } from './filament-plugin.service';

@Injectable()
export class FilamentService {
  private _filamentSpools: Array<FilamentSpool>;
  private _currentSpool: FilamentSpool;

  private _loading = true;

  constructor(
    private notificationService: NotificationService,
    private configService: ConfigService,
    private filamentPluginService: FilamentPluginService,
  ) {
    if (this.configService.isFilamentManagerEnabled()) {
      this.loadSpools();
    }
  }

  private loadSpools(): void {
    this.filamentPluginService.getSpools().subscribe(
      (spools: Array<FilamentSpool>): void => {
        this._filamentSpools = spools;
      },
      (error: HttpErrorResponse): void => {
        this.notificationService.setError("Can't load filament spools!", error.message);
      },
      (): void => {
        this._loading = false;
      },
    );
    this.filamentPluginService.getCurrentSpool().subscribe(
      (spool: FilamentSpool): void => {
        this._currentSpool = spool;
      },
      (error: HttpErrorResponse): void => {
        this.notificationService.setError("Can't load active spool!", error.message);
      },
    );
  }

  public get filamentSpools(): Array<FilamentSpool> {
    return this._filamentSpools;
  }

  public get currentSpool(): FilamentSpool {
    return this._currentSpool;
  }

  public get loading(): boolean {
    return this._loading;
  }

  public setSpool(spool: FilamentSpool): Promise<void> {
    return new Promise((resolve, reject) => {
      this.filamentPluginService.setSpool(spool).subscribe(
        (): void => {
          this.filamentPluginService.getCurrentSpool().subscribe(
            (spoolRemote: FilamentSpool): void => {
              if (spool.id === spoolRemote.id) resolve();
              else {
                this.notificationService.setError(
                  `Spool IDs didn't match`,
                  `Can't change spool. Please change spool manually in the OctoPrint UI.`,
                );
                reject();
              }
            },
            (error): void => {
              this.notificationService.setError("Can't set new spool!", error.message);
              reject();
            },
          );
        },
        (error): void => {
          this.notificationService.setError("Can't set new spool!", error.message);
          reject();
        },
      );
    });
  }
}
