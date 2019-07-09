import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Observer, timer } from 'rxjs';
import { Config } from './app.config';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  private config: Config;

  constructor(private http: HttpClient) {
    this.getConfig().subscribe((config: Config) => this.config = config);
  }

  public getConfig(): Observable<Object> {
    return this.http.get("assets/config.json")
  }

  public getJobInformation(): Observable<Object> {
    return Observable.create((observer: Observer<any>) => {
      timer(1000, 1500).subscribe(_ => {
        if (this.config) {
          const httpHeaders = {
            headers: new HttpHeaders({
              'x-api-key': this.config.octoprint.accessToken
            })
          }
          this.http.get(this.config.octoprint.url + "job", httpHeaders).subscribe((data: JSON) => {
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
  }

  public getPrinterState(): Observable<Object> {
    return Observable.create((observer: Observer<any>) => {
      timer(500, 1500).subscribe(_ => {
        if (this.config) {
          const httpHeaders = {
            headers: new HttpHeaders({
              'x-api-key': this.config.octoprint.accessToken
            })
          }
          this.http.get(this.config.octoprint.url + "printer", httpHeaders).subscribe((data: JSON) => {
            let printerState = {
              state: data["state"]["text"].toLowerCase(),
              nozzle: {
                current: Math.round(data["temperature"]["tool0"]["actual"]),
                set:  Math.round(data["temperature"]["tool0"]["target"])
              },
              heatbed: {
                current:  Math.round(data["temperature"]["bed"]["actual"]),
                set:  Math.round(data["temperature"]["bed"]["target"])
              },
              fan: 100
            }
            observer.next(printerState)
          })
        }
    })
  })
}

  private timeConvert(input: number): string {
    let hours = (input / 60 / 60);
    let rhours = Math.floor(hours);
    let minutes = (hours - rhours) * 60;
    let rminutes = Math.round(minutes);
    return rhours + ":" + ("0" + rminutes).slice(-2)
  }
}
