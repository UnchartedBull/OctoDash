import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { TempOption } from 'src/model/temp-options.model';

import { ConfigService } from '../config.service';

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

@Injectable()
export class ProfileService {
  httpClient: HttpClient = inject(HttpClient);
  configService: ConfigService = inject(ConfigService);

  public getHotendProfiles(): Observable<TempOption[]> {
    return this.httpClient
      .get<OctoPrintSettings>(this.configService.getApiURL('/api/settings', false), this.configService.getHTTPHeaders())
      .pipe(map(response => response.temperature.profiles))
      .pipe(
        map(profiles => {
          return profiles.map(profile => ({
            value: profile.extruder,
            label: profile.name,
          }));
        }),
      )
      .pipe(map(profiles => profiles.concat([{ value: 0, label: 'Off' }])))
      .pipe(map(profiles => profiles.sort((a, b) => (a.value! < b.value! ? -1 : 1))));
  }

  public getBedProfiles(): Observable<TempOption[]> {
    return this.httpClient
      .get<OctoPrintSettings>(this.configService.getApiURL('/api/settings', false), this.configService.getHTTPHeaders())
      .pipe(map(response => response.temperature.profiles))
      .pipe(
        map(profiles => {
          return profiles.map(profile => ({
            value: profile.bed,
            label: profile.name,
          }));
        }),
      )
      .pipe(map(profiles => profiles.concat([{ value: 0, label: 'Off' }])))
      .pipe(map(profiles => profiles.sort((a, b) => (a.value! < b.value! ? -1 : 1))));
  }

  public getFanProfiles(): Observable<TempOption[]> {
    return of([
      { value: 0, label: 'Off' },
      { value: 100, label: 'On' },
    ]);
  }
}
