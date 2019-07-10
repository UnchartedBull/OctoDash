import { Injectable } from '@angular/core';
import { Observable, Observer, timer } from 'rxjs';
import { ConfigService } from './config/config.service';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { share } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class JobStatusService {

  jobInformation: Observable<Object>
  layerProgress: Observable<Object>

  constructor(private _configService: ConfigService, private _http: HttpClient) {
    this.jobInformation = Observable.create((observer: Observer<any>) => {
      timer(1000, this._configService.config.octoprint.apiInterval).subscribe(_ => {
        if (this._configService.config) {
          const httpHeaders = {
            headers: new HttpHeaders({
              'x-api-key': this._configService.config.octoprint.accessToken
            })
          }
          this._http.get(this._configService.config.octoprint.url + "job", httpHeaders).subscribe((data: JSON) => {
            let job = null;
            if (data["state"] == "Printing") {
              job = {
                filename: data["job"]["file"]["display"].replace(".gcode", ""),
                progress: Math.round((data["progress"]["filepos"] / data["job"]["file"]["size"]) * 100),
                filamentAmount: data["job"]["filament"]["tool0"]["volume"],
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
          })
        }
      })
    })

    this.layerProgress = Observable.create((observer: Observer<any>) => {
      // TODO
      let layerProgress = {
        current: 0,
        total: 0
      }
      observer.next(layerProgress)
    })
  }

  public getJobInformationObservable(): Observable<Object> {
    return this.jobInformation
  }

  public getLayerProgressObservable(): Observable<Object> {
    return this.layerProgress
  }

  public timeConvert(input: number): string {
    let hours = (input / 60 / 60);
    let rhours = Math.floor(hours);
    let minutes = (hours - rhours) * 60;
    let rminutes = Math.round(minutes);
    return rhours + ":" + ("0" + rminutes).slice(-2)
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


export interface LayerProgress {
  current: number;
  total: number;
}
