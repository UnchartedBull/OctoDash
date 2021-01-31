import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';

import { ConfigService } from '../config/config.service';
import { NotificationService } from '../notification/notification.service';

@Injectable({
  providedIn: 'root',
})
export class TPLinkSmartPlugService {
  private httpPOSTRequest: Subscription;

  public constructor(
    private configService: ConfigService,
    private notificationService: NotificationService,
    private http: HttpClient,
  ) {}

  public changePowerState(on: boolean): void {
    if (this.httpPOSTRequest) {
      this.httpPOSTRequest.unsubscribe();
    }

    const payload = {
      command: on ? 'turnOn' : 'turnOff',
      ip: this.configService.getSmartPlugIP(),
    };
    this.httpPOSTRequest = this.http
      .post(this.configService.getApiURL('plugin/tplinksmartplug'), payload, this.configService.getHTTPHeaders())
      .subscribe(
        (): void => null,
        (error: HttpErrorResponse): void => {
          this.notificationService.setError("Can't control TPLink SmartPlug!", error.message);
        },
      );
  }
}
