import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';

import { ConfigService } from '../config/config.service';
import { NotificationService } from '../notification/notification.service';
import { JobCommand } from '../octoprint-api/jobAPI';

@Injectable({
  providedIn: 'root',
})
export class PsuControlService {
  private httpPOSTRequest: Subscription;

  public constructor(
    private configService: ConfigService,
    private notificationService: NotificationService,
    private http: HttpClient,
  ) {}

  public changePSUState(on: boolean): void {
    if (this.httpPOSTRequest) {
      this.httpPOSTRequest.unsubscribe();
    }
    const psuPayload: JobCommand = {
      command: on ? 'turnPSUOn' : 'turnPSUOff',
    };
    this.httpPOSTRequest = this.http
      .post(this.configService.getURL('plugin/psucontrol'), psuPayload, this.configService.getHTTPHeaders())
      .subscribe(
        (): void => null,
        (error: HttpErrorResponse): void => {
          this.notificationService.setError("Can't control PSU!", error.message);
        },
      );
  }

  public togglePSU(): void {
    if (this.httpPOSTRequest) {
      this.httpPOSTRequest.unsubscribe();
    }
    const psuPayload: JobCommand = {
      command: 'togglePSU',
    };
    this.httpPOSTRequest = this.http
      .post(this.configService.getURL('plugin/psucontrol'), psuPayload, this.configService.getHTTPHeaders())
      .subscribe(
        (): void => null,
        (error: HttpErrorResponse): void => {
          this.notificationService.setError("Can't control PSU!", error.message);
        },
      );
  }
}
