import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { FilamentSpool } from '../../model';
import { Filament, OctoPrintSettings, PrusaMMU } from '../../model/octoprint/octoprint-settings.model';
import { PrusaMMUCommand } from '../../model/octoprint/prusammu.model';
import { ConfigService } from '../config.service';
import { NotificationService } from '../notification.service';

@Injectable({
  providedIn: 'root',
})
export class PrusaMMUService {
  public filamentPickerIsVisible = false;
  public filaments: Filament[] = [
    { id: 1, name: 'Filament 1', color: '#FFF', enabled: true },
    { id: 2, name: 'Filament 2', color: '#FFF', enabled: true },
    { id: 3, name: 'Filament 3', color: '#FFF', enabled: true },
    { id: 4, name: 'Filament 4', color: '#FFF', enabled: true },
    { id: 5, name: 'Filament 5', color: '#FFF', enabled: true },
  ];
  public source = 'PrusaMMU';

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private notificationService: NotificationService,
  ) {}

  showHideFilamentPicker(show: boolean) {
    this.filamentPickerIsVisible = show;
  }

  setFilament(filament: Filament): Observable<unknown> {
    // Subtract one from id (choice is zero-indexed)
    const payload: PrusaMMUCommand = { choice: filament.id - 1, command: 'select' };
    return this.http
      .post(this.configService.getApiURL('plugin/prusammu'), payload, this.configService.getHTTPHeaders())
      .pipe(
        map(response => {
          this.filamentPickerIsVisible = false;
          return response;
        }),
        catchError(error => {
          this.notificationService.error(
            $localize`:@@prusammu-filament-selection-failed:Filament selection failed!`,
            error.message,
          );
          throw error;
        }),
      );
  }

  public initFilaments(currentSpools?: FilamentSpool[]): Observable<void> {
    return this.getPrusaMMUSettings().pipe(
      map(prusaMMUSettings => {
        if (prusaMMUSettings.filamentSource === 'prusammu' && prusaMMUSettings?.filament?.length) {
          this.filaments = prusaMMUSettings.filament;
          this.source = 'PrusaMMU';
        } else if (
          this.configService.isFilamentManagerUsed() &&
          (prusaMMUSettings.filamentSource === 'spoolManager' || prusaMMUSettings.filamentSource === 'filamentManager')
        ) {
          this.source = this.configService.isSpoolManagerPluginEnabled() ? 'SpoolManager' : 'Filament Manager';
          this.filaments = currentSpools.map(filament => {
            return {
              id: filament.tool,
              name: `${filament.name}${filament.material ? ' (' + filament.material + ')' : ''}`,
              color: filament.color ?? '#FFF',
              enabled: filament?.id > -1,
            };
          });
        }
      }),
      catchError(error => {
        this.notificationService.error(
          $localize`:@@prusammu-init-failed:Failed to load filament settings`,
          error.message || 'Unable to fetch PrusaMMU configuration',
        );
        console.error('Error initializing PrusaMMU filaments:', error);
        throw error;
      }),
    );
  }

  private getPrusaMMUSettings(): Observable<PrusaMMU> {
    const settingsUrl = this.configService.getApiURL('settings');
    return this.http
      .get<OctoPrintSettings>(settingsUrl, this.configService.getHTTPHeaders())
      .pipe(map(settings => settings.plugins.prusammu));
  }
}
