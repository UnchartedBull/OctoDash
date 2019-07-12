import { Injectable } from '@angular/core';
import { Observable, Observer, timer } from 'rxjs';
import { ConfigService } from './config/config.service';
import { HttpHeaders, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { share } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class JobStatusService {

  observable: Observable<Object>

  constructor(private _configService: ConfigService, private _http: HttpClient) {
    this.observable = Observable.create((observer: Observer<any>) => {
      timer(1000, this._configService.config.octoprint.apiInterval).subscribe(_ => {
        if (this._configService.config) {
          const httpHeaders = {
            headers: new HttpHeaders({
              'x-api-key': this._configService.config.octoprint.accessToken
            })
          }
          this._http.get(this._configService.config.octoprint.url + "job", httpHeaders).subscribe(
            (data: JSON) => {
              let job: Job = null;
              if (data["state"] == "Printing") {
                job = {
                  filename: data["job"]["file"]["display"].replace(".gcode", ""),
                  progress: Math.round((data["progress"]["filepos"] / data["job"]["file"]["size"]) * 100),
                  filamentAmount: this.filamentLengthToAmount(data["job"]["filament"]["tool0"]["length"]),
                  timeLeft: {
                    value: this.timeConvert(data["progress"]["printTimeLeft"]),
                    unit: "h"
                  },
                  timePrinted: {
                    value: this.timeConvert(data["progress"]["printTime"]),
                    unit: "h"
                  },
                }
              }
              observer.next(job);
            }, (error: HttpErrorResponse) => {
              console.log("Can't retrieve jobs! " + error.message)
            })
        }
      })
    }).pipe(share())
  }

  public getObservable(): Observable<Object> {
    return this.observable
  }

  private timeConvert(input: number): string {
    let hours = (input / 60 / 60);
    let rhours = Math.floor(hours);
    let minutes = (hours - rhours) * 60;
    let rminutes = Math.round(minutes);
    return rhours + ":" + ("0" + rminutes).slice(-2)
  }

  private filamentLengthToAmount(filamentLength: number): number {
    return Math.round((Math.PI * (this._configService.config.filament.thickness / 2) * filamentLength) * this._configService.config.filament.density / 100) / 10
  }
}

interface Duration {
  value: string;
  unit: string;
}

export interface Job {
  filename: string;
  progress: number;
  filamentAmount: number;
  timeLeft: Duration;
  timePrinted: Duration;
}
