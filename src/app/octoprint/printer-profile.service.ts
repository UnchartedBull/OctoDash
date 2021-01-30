import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { defaultIfEmpty, filter, map, pluck } from 'rxjs/operators';

import { ConfigService } from '../config/config.service';
import { OctoprintPrinterProfile, OctoprintPrinterProfiles } from './model/printerProfile';

@Injectable({
  providedIn: 'root',
})
export class PrinterProfileService {
  constructor(private http: HttpClient, private configService: ConfigService) {}

  public getDefaultPrinterProfile(): Observable<OctoprintPrinterProfile> {
    console.log('GETTING printer profiles');
    return this.http
      .get<OctoprintPrinterProfiles>(this.configService.getURL('printerprofiles'), this.configService.getHTTPHeaders())
      .pipe(
        map(profiles => {
          for (const [_, profile] of Object.entries(profiles.profiles)) {
            if (profile.current) return profile;
          }
        }),
      );
  }

  public getActivePrinterProfileName(octoprintURL: string, apiKey: string): Observable<string> {
    return this.http
      .get<OctoprintPrinterProfiles>(`${octoprintURL}printerprofiles`, {
        headers: new HttpHeaders({
          'x-api-key': apiKey,
        }),
      })
      .pipe(
        map(profiles => {
          for (const [_, profile] of Object.entries(profiles.profiles)) {
            if (profile.current) return profile.name;
          }
        }, defaultIfEmpty('')),
      );
  }
}
