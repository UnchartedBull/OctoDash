import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, lastValueFrom, Observable } from 'rxjs';

import { FilamentSpool } from '../../model';
import { ConfigService } from '../../services/config.service';
import { NotificationService } from '../../services/notification.service';
import { FilamentPluginService } from './filament-plugin.service';

@Injectable()
export class FilamentService {
  private filamentSpools = new BehaviorSubject<Array<FilamentSpool>>([]);
  private currentSpool = new BehaviorSubject<Array<FilamentSpool>>([]);
  private loading = new BehaviorSubject<boolean>(true);

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
      next: (spools: Array<FilamentSpool>) => this.filamentSpools.next(spools),
      error: (error: HttpErrorResponse) =>
        this.notificationService.warn($localize`:@@error-spools:Can't load filament spools!`, error.message),
      complete: () => this.loading.next(false),
    });
    this.filamentPluginService.getCurrentSpools().subscribe({
      next: (spools: FilamentSpool[]) => this.currentSpool.next(spools),
      error: (error: HttpErrorResponse) =>
        this.notificationService.warn($localize`:@@error-spool:Can't load active spool!`, error.message),
    });
  }

  public getFilamentSpools(): Observable<Array<FilamentSpool>> {
    return this.filamentSpools.asObservable();
  }

  public getCurrentSpools() {
    return this.currentSpool.asObservable();
  }

  public getCurrentSpool(tool: number): FilamentSpool {
    return this.currentSpool.getValue()[tool];
  }

  public getLoading(): Observable<boolean> {
    return this.loading.asObservable();
  }

  public async setSpool(spool: FilamentSpool, tool: number): Promise<void> {
    try {
      await lastValueFrom(this.filamentPluginService.setSpool(spool, tool));

      const currentSpool = await lastValueFrom(this.filamentPluginService.getCurrentSpool(tool));
      if (spool.id == currentSpool?.id) {
        return;
      }

      this.notificationService.error(
        $localize`:@@error-spool-id:Spool IDs didn't match`,
        $localize`:@@error-change-spool:Can't change spool. Please change spool manually in the OctoPrint UI.`,
      );
      throw new Error('Spool IDs did not match after setting spool');
    } catch (error) {
      this.notificationService.error($localize`:@@error-set-new-spool:Can't set new spool!`, error.message);
      throw error;
    }
  }
}
