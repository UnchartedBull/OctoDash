import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { ConfigService } from './config/config.service';
import { Observable, Observer, timer } from 'rxjs';
import { share } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PrinterStatusService {

  observable: Observable<Object>;

  constructor(private _http: HttpClient, private _configService: ConfigService) {
    this.observable = Observable.create((observer: Observer<any>) => {
      timer(500, this._configService.config.octoprint.apiInterval).subscribe(_ => {
        if (this._configService.config) {
          const httpHeaders = {
            headers: new HttpHeaders({
              'x-api-key': this._configService.config.octoprint.accessToken
            })
          }
          this._http.get(this._configService.config.octoprint.url + "printer", httpHeaders).subscribe(
            (data: JSON) => {
              const printerStatus: PrinterStatusAPI = {
                status: data["state"]["text"].toLowerCase(),
                nozzle: {
                  current: Math.round(data["temperature"]["tool0"]["actual"]),
                  set: Math.round(data["temperature"]["tool0"]["target"])
                },
                heatbed: {
                  current: Math.round(data["temperature"]["bed"]["actual"]),
                  set: Math.round(data["temperature"]["bed"]["target"])
                }
              }
              observer.next(printerStatus)
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
              }
              observer.next(printerStatus)
            })
        }
      })
    }).pipe(share())
  }

  getObservable(): Observable<Object> {
    return this.observable
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