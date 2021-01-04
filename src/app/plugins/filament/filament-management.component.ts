import { HttpErrorResponse } from '@angular/common/http';
import { Component, Injector } from '@angular/core';
import { ConfigService } from 'src/app/config/config.service';

import { NotificationService } from '../../notification/notification.service';
import { FilamentManagementPlugin, FilamentSpool } from './filament.interface';
import { FilamentManagerService } from './filament-manager.service';

@Component({
  selector: 'backend-filament-manager',
  template: '',
  styles: [],
})
export class FilamentManagementComponent {
  private filamentPlugin: FilamentManagementPlugin;

  private _filamentSpools: Array<FilamentSpool>;
  private _currentSpool: FilamentSpool;

  private _loading = true;

  constructor(
    private injector: Injector,
    private notificationService: NotificationService,
    private configService: ConfigService,
  ) {
    if (this.configService.isFilamentManagerEnabled()) {
      this.filamentPlugin = this.injector.get(FilamentManagerService);
      this.loadSpools();
    }
  }

  private loadSpools(): void {
    this.filamentPlugin.getSpools().subscribe(
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
    this.filamentPlugin.getCurrentSpool().subscribe(
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
      this.filamentPlugin.setSpool(spool).subscribe(
        (): void => {
          this.filamentPlugin.getCurrentSpool().subscribe(
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
