import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { ConfigService } from './config/config.service';
import { OctoprintPrinterProfile, OctoprintPrinterProfiles } from './model/octoprint/printer-profile.model';
import { NotificationService } from './notification/notification.service';

@Injectable({
  providedIn: 'root',
})
export class PrinterProfileService {
  private httpGETRequest: Subscription;

  public constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private notificationService: NotificationService,
  ) {}

  public getDefaultPrinterProfile(): Promise<OctoprintPrinterProfile> {
    return new Promise((resolve, reject): void => {
      if (this.httpGETRequest) {
        this.httpGETRequest.unsubscribe();
      }
      this.httpGETRequest = this.http
        .get(this.configService.getApiURL('printerprofiles/_default'), this.configService.getHTTPHeaders())
        .subscribe(
          (printerProfile: OctoprintPrinterProfile): void => {
            resolve(printerProfile);
          },
          (error: HttpErrorResponse): void => {
            reject();
            if (error.status === 0 && this.notificationService.getBootGrace()) {
              this.notificationService.setError("Can't retrieve printer status!", error.message);
            }
          },
        );
    });
  }

  // Needed for initial setup. Config not initialized yet, thus values need to be passed manually.
  public getActivePrinterProfileName(octoprintURL: string, apiKey: string): Observable<string> {
    return this.http
      .get<OctoprintPrinterProfiles>(`${octoprintURL}api/printerprofiles`, {
        headers: new HttpHeaders({
          'x-api-key': apiKey,
        }),
      })
      .pipe(
        map(profiles => {
          for (const [_, profile] of Object.entries(profiles.profiles)) {
            return profile.name;
          }
        }),
      );
  }
}
