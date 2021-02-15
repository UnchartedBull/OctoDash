import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ConfigService } from '../../config/config.service';
import { FilamentSpool } from '../../model';
import { NotificationService } from '../../notification/notification.service';
import { FilamentPluginService } from './filament-plugin.service';

@Injectable()
export class FilamentService {
  private filamentSpools: Array<FilamentSpool>;
  private currentSpool: FilamentSpool;
  private loading = true;

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
        this.filamentSpools = spools;
      },
      (error: HttpErrorResponse): void => {
        this.notificationService.setError("Can't load filament spools!", error.message);
      },
      (): void => {
        this.loading = false;
      },
    );
    this.filamentPluginService.getCurrentSpool().subscribe(
      (spool: FilamentSpool): void => {
        this.currentSpool = spool;
      },
      (error: HttpErrorResponse): void => {
        this.notificationService.setError("Can't load active spool!", error.message);
      },
    );
  }

  public getFilamentSpools(): Array<FilamentSpool> {
    return this.filamentSpools;
  }

  public getCurrentSpool(): FilamentSpool {
    return this.currentSpool;
  }

  public getLoading(): boolean {
    return this.loading;
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
