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

  private filamentSpools: Array<FilamentSpool>;
  private currentSpool: FilamentSpool;

  public isLoading = true;

  constructor(private injector: Injector, private notificationService: NotificationService) {
    this.filamentPlugin = this.injector.get(FilamentManagerService);
    this.loadSpools();
    console.log('INSTANTIATED');
  }

  private loadSpools(): void {
    this.filamentPlugin.getSpools().subscribe(
      (spools: Array<FilamentSpool>): void => {
        this.filamentSpools = spools;
      },
      (error: HttpErrorResponse): void => {
        this.notificationService.setError("Can't load filament spools!", error.message);
      },
      (): void => {
        this.isLoading = false;
      },
    );
  }

  public getSpools(): Array<FilamentSpool> {
    return this.filamentSpools;
  }
}
