import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Observer, timer, Subscription } from 'rxjs';
import { ConfigService } from './config/config.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { shareReplay } from 'rxjs/operators';
import { OctoprintJobAPI, JobCommand } from './octoprint-api/jobAPI';
import { ErrorService } from './error/error.service';
import { AppService } from './app.service';

@Injectable({
  providedIn: 'root'
})
export class JobService {

  httpGETRequest: Subscription;
  httpPOSTRequest: Subscription;
  observable: Observable<Job>;
  private observer: Observer<any>;

  constructor(
    private configService: ConfigService,
    private http: HttpClient,
    private errorService: ErrorService,
    private service: AppService) {
    this.observable = new Observable((observer: Observer<any>) => {
      this.observer = observer;
      timer(750, this.configService.getAPIInterval()).subscribe(_ => {
        if (this.httpGETRequest) {
          this.httpGETRequest.unsubscribe();
        }
        this.httpGETRequest = this.http.get(this.configService.getURL('job'), this.configService.getHTTPHeaders()).subscribe(
          (data: OctoprintJobAPI) => {
            let job: Job = null;
            if (data.job && data.job.file.name) {
              job = {
                status: data.state,
                filename: data.job.file.display.replace('.gcode', ''),
                progress: Math.round((data.progress.filepos / data.job.file.size) * 100),
                filamentAmount: this.service.convertFilamentLengthToAmount(data.job.filament.tool0.length),
                timeLeft: {
                  value: this.service.convertSecondsToHours(data.progress.printTimeLeft),
                  unit: 'h'
                },
                timePrinted: {
                  value: this.service.convertSecondsToHours(data.progress.printTime),
                  unit: 'h'
                },
              };
            }
            observer.next(job);
          }, (error: HttpErrorResponse) => {
            this.errorService.setError('Can\'t retrieve jobs!', error.message);
          });

      });
    }).pipe(shareReplay(1));
  }

  public deleteJobInformation(): void {
    this.observer.next(null);
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

  public startJob(): void {
    if (this.httpPOSTRequest) {
      this.httpPOSTRequest.unsubscribe();
    }
    const pausePayload: JobCommand = {
      command: 'start'
    };
    this.httpPOSTRequest = this.http.post(this.configService.getURL('job'), pausePayload, this.configService.getHTTPHeaders()).subscribe(
      () => null, (error: HttpErrorResponse) => {
        if (error.status === 409) {
          this.errorService.setError('Can\'t start Job!', 'There is already a job running (409)');
        } else {
          this.errorService.setError('Can\'t start Job!', error.message);
        }
      }
    );
  }
}

interface Duration {
  value: string;
  unit: string;
}

export interface Job {
  status: string;
  filename: string;
  progress: number;
  filamentAmount: number;
  timeLeft: Duration;
  timePrinted: Duration;
}
