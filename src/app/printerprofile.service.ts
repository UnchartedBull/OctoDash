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
  private printerStatusService: PrinterService;
  private httpGETRequest: Subscription;
  private observable: Observable<OctoprintPrinterProfileAPI>;
  private observer: Observer<OctoprintPrinterProfileAPI>;

  public constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private notificationService: NotificationService,
    private printerService: PrinterService,
    private router: Router
  ) {
    this.printerStatusService = printerService;
    this.observable = new Observable((observer: Observer<OctoprintPrinterProfileAPI>): void => {
      this.observer = observer;
    }).pipe(shareReplay(1));
  }

  public getObservable(): Observable<OctoprintPrinterProfileAPI> {
    return this.observable;
  }

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
            this.observer.next(printerProfile);
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
              this.observer.next(printerProfile);
              resolve(printerProfile);
            } else {
              this.observer.next(printerProfile);
              resolve(printerProfile);
              this.notificationService.setError("Can't retrieve printer status!", error.message);
            }
          }
        );
    });
  }

}