import { Injectable } from '@angular/core';
import { Observable, Observer, timer } from 'rxjs';
import { ConfigService } from '../config/config.service';
import { HttpHeaders, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { share } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class JobStatusService {

  observable: Observable<Job>;

  constructor(private configService: ConfigService, private http: HttpClient) {
    this.observable = new Observable((observer: Observer<any>) => {
      timer(1000, this.configService.config.octoprint.apiInterval).subscribe(_ => {
        if (this.configService.config) {
          const httpHeaders = {
            headers: new HttpHeaders({
              'x-api-key': this.configService.config.octoprint.accessToken
            })
          };
          this.http.get(this.configService.config.octoprint.url + 'job', httpHeaders).subscribe(
            (data: JSON) => {
              let job: Job = null;
              if (data['state'] === 'Printing') {
                job = {
                  filename: data['job']['file']['display'].replace('.gcode', ''),
                  progress: Math.round((data['progress']['filepos'] / data['job']['file']['size']) * 100),
                  filamentAmount: this.filamentLengthToAmount(data['job']['filament']['tool0']['length']),
                  timeLeft: {
                    value: this.timeConvert(data['progress']['printTimeLeft']),
                    unit: 'h'
                  },
                  timePrinted: {
                    value: this.timeConvert(data['progress']['printTime']),
                    unit: 'h'
                  },
                };
              }
              observer.next(job);
            }, (error: HttpErrorResponse) => {
              console.error('Can\'t retrieve jobs! ' + error.message);
            });
        }
      });
    }).pipe(share());
  }

  public getObservable(): Observable<Job> {
    return this.observable;
  }

  private timeConvert(input: number): string {
    const hours = (input / 60 / 60);
    const rhours = Math.floor(hours);
    const minutes = (hours - rhours) * 60;
    const rminutes = Math.round(minutes);
    return rhours + ':' + ('0' + rminutes).slice(-2);
  }

  private filamentLengthToAmount(filamentLength: number): number {
    return Math.round((Math.PI * (this.configService.config.filament.thickness / 2) * filamentLength)
      * this.configService.config.filament.density / 100) / 10;
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
