import { HttpErrorResponse } from '@angular/common/http';
import { Component, Injector } from '@angular/core';

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

  private _loading = true;

  constructor(private injector: Injector, private notificationService: NotificationService) {
    this.filamentPlugin = this.injector.get(FilamentManagerService);
    this.loadSpools();
    console.log('INSTANTIATED');
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
  }

  public get filamentSpools(): Array<FilamentSpool> {
    return this._filamentSpools;
  }

  public get loading(): boolean {
    return this._loading;
  }

  public getSpoolTemperatureOffsetString(spool: FilamentSpool): string {
    return `${spool.temperatureOffset === 0 ? '±' : spool.temperatureOffset > 0 ? '+' : '-'}${Math.abs(
      spool.temperatureOffset,
    )}`;
  }
}
