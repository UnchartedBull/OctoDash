import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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

  public getProfiles(): Observable<TempProfile[]> {
    return this.httpClient
      .get<OctoPrintSettings>(this.configService.getApiURL('/api/settings', false), this.configService.getHTTPHeaders())
      .pipe(map(response => response.temperature.profiles));
  }
}
