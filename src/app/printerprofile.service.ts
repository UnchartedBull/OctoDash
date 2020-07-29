import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";

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
    return new Promise((resolve, reject): void => {
      if (this.httpGETRequest) {
        this.httpGETRequest.unsubscribe();
      }
      this.httpGETRequest = this.http
        .get(this.configService.getURL("printerprofiles/_default"), this.configService.getHTTPHeaders())
        .subscribe(
          (printerProfile: OctoprintPrinterProfileAPI): void => {
            resolve(printerProfile);
          },
          (error: HttpErrorResponse): void => {
            if (error.status === 409) {
              this.printerStatusService.isPrinterOffline().then((printerOffline): void => {
                if (printerOffline) {
                  this.router.navigate(["/standby"]);
                } else {
                  this.notificationService.setError("Can't retrieve printer profile!", error.message);
                }
              });
              reject();
            } else {
              reject();
              if (error.status === 0 && this.notificationService.getBootGrace()) {
                this.notificationService.setError("Can't retrieve printer status!", error.message);
              }
            }
          }
        );
    });
  }

}
