import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { ConfigService } from '../config/config.service';
import { Observable, Observer, timer, Subscription } from 'rxjs';
import { share } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PrinterStatusService {

  httpRequest: Subscription;
  observable: Observable<PrinterStatusAPI>;

  constructor(private http: HttpClient, private configService: ConfigService) {
    this.observable = new Observable((observer: Observer<any>) => {
      timer(500, this.configService.config.octoprint.apiInterval).subscribe(_ => {
        if (this.configService.config) {
          const httpHeaders = {
            headers: new HttpHeaders({
              'x-api-key': this.configService.config.octoprint.accessToken
            })
          };
          if (this.httpRequest) {
            this.httpRequest.unsubscribe();
          }
          this.httpRequest = this.http.get(this.configService.config.octoprint.url + 'printer', httpHeaders).subscribe(
            (data: JSON) => {
              const printerStatus: PrinterStatusAPI = {
                status: data['state']['text'].toLowerCase(),
                nozzle: {
                  current: Math.round(data['temperature']['tool0']['actual']),
                  set: Math.round(data['temperature']['tool0']['target'])
                },
                heatbed: {
                  current: Math.round(data['temperature']['bed']['actual']),
                  set: Math.round(data['temperature']['bed']['target'])
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
