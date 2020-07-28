import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, Observer, Subscription, timer } from "rxjs";
import { shareReplay } from "rxjs/operators";

import { ConfigService } from "./config/config.service";
import { NotificationService } from "./notification/notification.service";
import { PrinterService } from "./printer.service";

import { OctoprintPrinterProfileAPI } from "./octoprint-api/printerProfileAPI";

@Injectable({
  providedIn: "root",
})
export class PrinterProfileService {
  private httpGETRequest: Subscription;
  
  public constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private notificationService: NotificationService,
    private printerStatusService: PrinterService,
    private router: Router
  ) { }

  public getDefaultPrinterProfile(): Promise<OctoprintPrinterProfileAPI> {
    return new Promise((resolve): void => {
      if (this.httpGETRequest) {
        this.httpGETRequest.unsubscribe();
      }
      this.httpGETRequest = this.http
        .get(this.configService.getURL("printerprofiles/_default"), this.configService.getHTTPHeaders())
        .subscribe(
          (data: OctoprintPrinterProfileAPI): void => {
            const printerProfile: OctoprintPrinterProfileAPI = data;
            resolve(printerProfile);
          },
          (error: HttpErrorResponse): void => {
            const printerProfile: OctoprintPrinterProfileAPI = {
              name: "_default",
              model: "unknown",
              axes: {
                x: { inverted: false },
                y: { inverted: false },
                z: { inverted: false }
              }
            };

            if (error.status === 409) {
              this.printerStatusService.isPrinterOffline().then((printerOffline): void => {
                if (printerOffline) {
                  this.router.navigate(["/standby"]);
                } else {
                  this.notificationService.setError("Can't retrieve printer profile!", error.message);
                }
              });
              resolve(printerProfile);
            } else if (error.status === 0 && this.notificationService.getBootGrace()) {
              resolve(printerProfile);
            } else {
              resolve(printerProfile);
              this.notificationService.setError("Can't retrieve printer status!", error.message);
            }
          }
        );
    });
  }

}