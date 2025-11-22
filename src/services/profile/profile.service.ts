import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Option } from 'src/components/shared/quick-control/quick-control.component';

import { ConfigService } from '../config.service';
import { NotificationService } from '../notification.service';

interface TempProfile {
  bed: number | null;
  extruder: number | null;
  chamer: number | null;
  name: string;
}

interface OctoPrintSettings {
  temperature: {
    profiles: TempProfile[];
  };
}

const sortOptions = (options: Option[]) => options.sort((a, b) => a.value - b.value);

const addOffOption = (options: Option[]) => [...options, { value: 0, label: 'Off' }];

@Injectable()
export class ProfileService {
  httpClient: HttpClient = inject(HttpClient);
  configService: ConfigService = inject(ConfigService);
  notificationService: NotificationService = inject(NotificationService);

  private getProfiles(): Observable<TempProfile[]> {
    return this.httpClient
      .get<OctoPrintSettings>(this.configService.getApiURL('/api/settings', false), this.configService.getHTTPHeaders())
      .pipe(map(response => response.temperature.profiles));
  }

  private handleError(error: Error): Observable<TempProfile[]> {
    this.notificationService.error(
      $localize`:$$error-failed-to-load-profile-temps:Failed to load temp profiles`,
      error.message,
    );
    return of([]);
  }

  public getBedProfiles(): Observable<Option[]> {
    return this.getProfiles().pipe(
      map(profiles =>
        profiles.map(profile => ({
          value: profile.bed,
          label: profile.name,
        })),
      ),
      catchError(error => this.handleError(error)),
      map(addOffOption),
      map(options => [...options, { value: this.configService.getDefaultHeatbedTemperature(), label: 'Default' }]),
      map(sortOptions),
    );
  }

  public getHotendProfiles(): Observable<Option[]> {
    return this.getProfiles().pipe(
      map(profiles =>
        profiles.map(profile => ({
          value: profile.extruder,
          label: profile.name,
        })),
      ),
      catchError(error => this.handleError(error)),
      map(addOffOption),
      map(options => [...options, { value: this.configService.getDefaultHotendTemperature(), label: 'Default' }]),
      map(sortOptions),
    );
  }
}
