import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { FilamentSpool } from '../../model';
import { ConfigService } from '../../services/config.service';
import { NotificationService } from '../../services/notification.service';
import { FilamentPluginService } from './filament-plugin.service';

@Injectable()
export class FilamentService {
  private filamentSpools: Array<FilamentSpool>;
  private currentSpool: FilamentSpool[];
  private loading = true;

  constructor(
    private notificationService: NotificationService,
    private configService: ConfigService,
    private filamentPluginService: FilamentPluginService,
  ) {
    if (this.configService.isFilamentManagerUsed()) {
      this.loadSpools();
    }
  }

  private loadSpools(): void {
    this.filamentPluginService.getSpools().subscribe({
      next: (spools: Array<FilamentSpool>) => (this.filamentSpools = spools),
      error: (error: HttpErrorResponse) =>
        this.notificationService.warn($localize`:@@error-spools:Can't load filament spools!`, error.message),
      complete: () => (this.loading = false),
    });
    this.filamentPluginService.getCurrentSpools().subscribe({
      next: (spools: FilamentSpool[]) => (this.currentSpool = spools),
      error: (error: HttpErrorResponse) =>
        this.notificationService.warn($localize`:@@error-spool:Can't load active spool!`, error.message),
    });
  }

  public getCurrentFilamentSpools(): Observable<FilamentSpool[]> {
    return this.filamentPluginService.getCurrentSpools().pipe(
      tap({
        error: (error: HttpErrorResponse) =>
          this.notificationService.error(
            $localize`:@@error-spools-active:Can't load active spools!`,
            error.message
          ),
      }),
    );
  }

  public getFilamentSpools(): Array<FilamentSpool> {
    return this.filamentSpools;
  }

  public getCurrentSpools(): Array<FilamentSpool> {
    return this.currentSpool;
  }

  public getCurrentSpool(tool: number): FilamentSpool {
    return this.currentSpool && this.currentSpool[tool];
  }

  public getLoading(): boolean {
    return this.loading;
  }

  public setSpool(spool: FilamentSpool, tool: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.filamentPluginService.setSpool(spool, tool).subscribe({
        next: () => {
          this.filamentPluginService.getCurrentSpool(tool).subscribe({
            next: (spoolRemote: FilamentSpool) => {
              if (spool.id === spoolRemote.id) resolve();
              else {
                this.notificationService.error(
                  $localize`:@@error-spool-id:Spool IDs didn't match`,
                  $localize`:@@error-change-spool:Can't change spool. Please change spool manually in the OctoPrint UI.`,
                );
                reject();
              }
            },
            error: (error: HttpErrorResponse) => {
              this.notificationService.error($localize`:@@error-set-new-spool:Can't set new spool!`, error.message);
              reject();
            },
          });
        },
        error: (error: HttpErrorResponse): void => {
          this.notificationService.error($localize`:@@error-set-new-spool-2:Can't set new spool!`, error.message);
          reject();
        },
      });
    });
  }
}
