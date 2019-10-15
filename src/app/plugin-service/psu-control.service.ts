import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConfigService } from '../config/config.service';
import { NotificationService } from '../notification/notification.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { JobCommand } from '../octoprint-api/jobAPI';

@Injectable({
  providedIn: 'root'
})
export class PsuControlService {

  httpPOSTRequest: Subscription;

  constructor(private configService: ConfigService, private notificationService: NotificationService, private http: HttpClient) { }

  public changePSUState(on: boolean) {
    if (this.httpPOSTRequest) {
      this.httpPOSTRequest.unsubscribe();
    }
    const psuPayload: JobCommand = {
      command: on ? 'turnPSUOn' : 'turnPSUOff'
    };
    this.httpPOSTRequest = this.http.post(this.configService.getURL('plugin/psucontrol'), psuPayload, this.configService.getHTTPHeaders())
      .subscribe(
        () => null, (error: HttpErrorResponse) => {
          this.notificationService.setError('Can\'t control PSU!', error.message);
        }
      );
  }

  public togglePSU() {
    if (this.httpPOSTRequest) {
      this.httpPOSTRequest.unsubscribe();
    }
    const psuPayload: JobCommand = {
      command: 'togglePSU'
    };
    this.httpPOSTRequest = this.http.post(this.configService.getURL('plugin/psucontrol'), psuPayload, this.configService.getHTTPHeaders())
      .subscribe(
        () => null, (error: HttpErrorResponse) => {
          this.notificationService.setError('Can\'t control PSU!', error.message);
        }
      );
  }
}
