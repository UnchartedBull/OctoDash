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
    this.filamentPluginService.getSpools().subscribe({
      next: (spools: Array<FilamentSpool>) => (this.filamentSpools = spools),
      error: (error: HttpErrorResponse) =>
        this.notificationService.setError($localize`:@@error-spools:Can't load filament spools!`, error.message),
      complete: () => (this.loading = false),
    });
    this.filamentPluginService.getCurrentSpool().subscribe({
      next: (spool: FilamentSpool) => (this.currentSpool = spool),
      error: (error: HttpErrorResponse) =>
        this.notificationService.setError($localize`:@@error-spool:Can't load active spool!`, error.message),
    });
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
      this.filamentPluginService.setSpool(spool).subscribe({
        next: () => {
          this.filamentPluginService.getCurrentSpool().subscribe({
            next: (spoolRemote: FilamentSpool) => {
              if (spool.id === spoolRemote.id) resolve();
              else {
                this.notificationService.setError(
                  $localize`:@@error-spool-id:Spool IDs didn't match`,
                  $localize`:@@error-change-spool:Can't change spool. Please change spool manually in the OctoPrint UI.`,
                );
                reject();
              }
            },
            error: (error: HttpErrorResponse) => {
              this.notificationService.setError($localize`:@@error-set-new-spool:Can't set new spool!`, error.message);
              reject();
            },
          });
        },
        error: (error: HttpErrorResponse): void => {
          this.notificationService.setError($localize`:@@error-set-new-spool-2:Can't set new spool!`, error.message);
          reject();
        },
      });
    });
  }
}
