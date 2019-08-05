import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { ConfigService } from './config/config.service';
import { Observable, Observer, timer, Subscription } from 'rxjs';
import { share } from 'rxjs/operators';
import { OctoprintPrinterStatusAPI } from './octoprint-api/printerStatusAPI';
import { ErrorService } from './error/error.service';

@Injectable({
  providedIn: 'root'
})
export class PrinterService {

  httpGETRequest: Subscription;
  observable: Observable<PrinterStatusAPI>;

  constructor(private http: HttpClient, private configService: ConfigService, private errorService: ErrorService) {
    this.observable = new Observable((observer: Observer<any>) => {
      timer(500, this.configService.getAPIInterval()).subscribe(_ => {
        if (this.configService.isValid()) {
          if (this.httpGETRequest) {
            this.httpGETRequest.unsubscribe();
          }
          this.httpGETRequest = this.http.get(this.configService.getURL('printer'), this.configService.getHTTPHeaders()).subscribe(
            (data: OctoprintPrinterStatusAPI) => {
              const printerStatus: PrinterStatusAPI = {
                status: data.state.text.toLowerCase(),
                nozzle: {
                  current: Math.round(data.temperature.tool0.actual),
                  set: Math.round(data.temperature.tool0.target)
                },
                heatbed: {
                  current: Math.round(data.temperature.bed.actual),
                  set: Math.round(data.temperature.bed.target)
                }
              };
              observer.next(printerStatus);
            }, (error: HttpErrorResponse) => {
              const printerStatus: PrinterStatusAPI = {
                status: `error (${error.status})`,
                nozzle: {
                  current: 0,
                  set: 0
                },
                heatbed: {
                  current: 0,
                  set: 0
                }
              };
              observer.next(printerStatus);
              this.errorService.setError('Can\'t retrieve printer status!', error.message);
            });
        }
      });
    }).pipe(share());
  }

  getObservable(): Observable<PrinterStatusAPI> {
    return this.observable;
  }
}

export interface PrinterStatusAPI {
  status: string;
  nozzle: PrinterValue;
  heatbed: PrinterValue;
}

export interface PrinterValue {
  current: number;
  set: number;
}
