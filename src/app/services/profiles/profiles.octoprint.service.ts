import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ConfigService } from '../../config/config.service';
import { PrinterProfile } from '../../model';
import {
  OctoprintPrinterProfiles,
  ProfileCommand
} from '../../model/octoprint';
import { NotificationService } from '../../notification/notification.service';
import { ProfileService } from './profiles.service';

@Injectable()
export class ProfileOctoprintService implements ProfileService {
  private currentProfile: PrinterProfile;
  public constructor(
    private configService: ConfigService,
    private notificationService: NotificationService,
    private http: HttpClient,
  ) {}

  public get CurrentProfile(): PrinterProfile{
    return this.currentProfile;
  }
  public getActiveProfile(): Observable<PrinterProfile> {
    return this.http
      .get<OctoprintPrinterProfiles>(
        this.configService.getApiURL('printerprofiles'),
        this.configService.getHTTPHeaders(),
      )
      .pipe(
        map(profiles => {
          for (const [_, profile] of Object.entries(profiles.profiles)) {
            if (profile.current) {
              this.currentProfile = profile;
              return profile;
            }
          }
        }),
      );
  }
  public getProfiles(): Observable<Array<PrinterProfile>> {
    return this.http
    .get<OctoprintPrinterProfiles>(this.configService.getApiURL('printerprofiles'),
      this.configService.getHTTPHeaders())
    .pipe(
      map(profiles =>  {
        var objs: PrinterProfile[] = [];
        for (const [_, profile] of Object.entries(profiles.profiles)) {
          objs.push(profile)
        }
        return objs;
      })
    );
  }
  public setActiveProfile(printerID: string): void{
    const profilePayload: ProfileCommand = {
      current: true
    };
    this.http
      .post(this.configService.getApiURL('printerprofiles/' + printerID), profilePayload, this.configService.getHTTPHeaders())
      .pipe(
        catchError(error =>
          this.notificationService.setError($localize`:@@error-printer-profile-save:Can't save printer profile!`, error.message),
        ),
      )
      .subscribe();
  }
}