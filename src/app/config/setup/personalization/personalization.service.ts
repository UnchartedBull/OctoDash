import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { defaultIfEmpty, map } from 'rxjs/operators';

import { MoonrakerPrinterInfo, OctoprintPrinterProfiles } from '../../../model/octoprint';

@Injectable({
  providedIn: 'root',
})
export class PersonalizationService {
  public constructor(private http: HttpClient) {}

  public getOctoprintActivePrinterProfileName(octoprintURL: string, apiKey: string): Observable<string> {
    return this.http
      .get<OctoprintPrinterProfiles>(`${octoprintURL}/api/printerprofiles`, {
        headers: new HttpHeaders({
          'x-api-key': apiKey,
        }),
      })
      .pipe(
        map(profiles => {
          for (const profile of Object.values(profiles.profiles)) {
            if (profile.current) return profile.name;
          }
        }),
        defaultIfEmpty('Printer Name'),
      );
  }

  public getMoonrakerPrinterName(moonrakerUrl: string, apiKey: string): Observable<string> {
    return this.http
      .get<MoonrakerPrinterInfo>(`${moonrakerUrl}/printer/info`, {
        headers: new HttpHeaders({
          'x-api-key': apiKey,
        }),
      })
      .pipe(
        map(printerInfo => {
          return printerInfo.result?.hostname;
        }),
        defaultIfEmpty('Printer Name'),
      );
  }
}
