import { Injectable } from '@angular/core';
import { Observable, Observer, timer, Subscription } from 'rxjs';
import { ConfigService } from './config/config.service';
import { HttpHeaders, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { share } from 'rxjs/operators';
import { OctoprintJobAPI, JobCommand } from './octoprint-api/jobAPI';
import { ErrorService } from './error/error.service';

@Injectable({
  providedIn: 'root'
})
export class JobService {

  httpGETRequest: Subscription;
  httpPOSTRequest: Subscription;
  observable: Observable<Job>;

  constructor(private configService: ConfigService, private http: HttpClient, private errorService: ErrorService) {
    this.observable = new Observable((observer: Observer<any>) => {
      timer(750, this.configService.getAPIInterval()).subscribe(_ => {
        if (this.httpGETRequest) {
          this.httpGETRequest.unsubscribe();
        }
        this.httpGETRequest = this.http.get(this.configService.getURL('job'), this.configService.getHTTPHeaders()).subscribe(
          (data: OctoprintJobAPI) => {
            let job: Job = null;
            if (data.state === 'Printing') {
              job = {
                filename: data.job.file.display.replace('.gcode', ''),
                progress: Math.round((data.progress.filepos / data.job.file.size) * 100),
                filamentAmount: this.filamentLengthToAmount(data.job.filament.tool0.length),
                timeLeft: {
                  value: this.timeConvert(data.progress.printTimeLeft),
                  unit: 'h'
                },
                timePrinted: {
                  value: this.timeConvert(data.progress.printTime),
                  unit: 'h'
                },
              };
            }
            observer.next(job);
          }, (error: HttpErrorResponse) => {
            this.errorService.setError('Can\'t retrieve jobs!', error.message);
          });

      });
    }).pipe(share());
  }

  public getObservable(): Observable<Job> {
    return this.observable;
  }

  public cancelJob(): void {
    if (this.httpPOSTRequest) {
      this.httpPOSTRequest.unsubscribe();
    }
    const cancelPayload: JobCommand = {
      command: 'cancel'
    };
    this.httpPOSTRequest = this.http.post(this.configService.getURL('job'), cancelPayload, this.configService.getHTTPHeaders()).subscribe(
      () => null, (error: HttpErrorResponse) => {
        if (error.status === 409) {
          this.errorService.setError('Can\'t cancel Job!', 'There is no running job, that could be cancelled (409)');
        } else {
          this.errorService.setError('Can\'t cancel Job!', error.message);
        }
      }
    );
  }

  public pauseJob(): void {
    if (this.httpPOSTRequest) {
      this.httpPOSTRequest.unsubscribe();
    }
    const pausePayload: JobCommand = {
      command: 'pause',
      action: 'pause'
    };
    this.httpPOSTRequest = this.http.post(this.configService.getURL('job'), pausePayload, this.configService.getHTTPHeaders()).subscribe(
      () => null, (error: HttpErrorResponse) => {
        if (error.status === 409) {
          this.errorService.setError('Can\'t pause Job!', 'There is no running job, that could be paused (409)');
        } else {
          this.errorService.setError('Can\'t pause Job!', error.message);
        }
      }
    );
  }

  public resumeJob(): void {
    if (this.httpPOSTRequest) {
      this.httpPOSTRequest.unsubscribe();
    }
    const pausePayload: JobCommand = {
      command: 'pause',
      action: 'resume'
    };
    this.httpPOSTRequest = this.http.post(this.configService.getURL('job'), pausePayload, this.configService.getHTTPHeaders()).subscribe(
      () => null, (error: HttpErrorResponse) => {
        if (error.status === 409) {
          this.errorService.setError('Can\'t resume Job!', 'There is no paused job, that could be resumed (409)');
        } else {
          this.errorService.setError('Can\'t resume Job!', error.message);
        }
      }
    );
  }

  private timeConvert(input: number): string {
    const hours = (input / 60 / 60);
    let roundedHours = Math.floor(hours);
    const minutes = (hours - roundedHours) * 60;
    let roundedMinutes = Math.round(minutes);
    if (roundedMinutes === 60) {
      roundedMinutes = 0;
      roundedHours += 1;
    }
    return roundedHours + ':' + ('0' + roundedMinutes).slice(-2);
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
