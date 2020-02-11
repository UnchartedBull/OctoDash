import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Observer, timer, Subscription } from 'rxjs';
import { ConfigService } from './config/config.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { shareReplay, publish } from 'rxjs/operators';
import { OctoprintJobAPI, JobCommand, OctoprintFilament } from './octoprint-api/jobAPI';
import { NotificationService } from './notification/notification.service';
import { AppService } from './app.service';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  httpGETRequest: Subscription;
  httpPOSTRequest: Subscription;
  observable: Observable<Job>;
  private observer: Observer<any>;
  private printing = false;

  constructor(
    private configService: ConfigService,
    private http: HttpClient,
    private notificationService: NotificationService,
    private service: AppService) {
    this.observable = new Observable((observer: Observer<any>) => {
      this.observer = observer;
      timer(750, this.configService.getAPIPollingInterval()).subscribe(_ => {
        if (this.httpGETRequest) {
          this.httpGETRequest.unsubscribe();
        }
        this.httpGETRequest = this.http.get(this.configService.getURL('job'), this.configService.getHTTPHeaders()).subscribe(
          (data: OctoprintJobAPI) => {
            let job: Job = null;
            if (data.job && data.job.file.name) {
              this.printing = ['Printing', 'Pausing', 'Paused', 'Cancelling'].includes(data.state);
              try {
                job = {
                  status: data.state,
                  filename: data.job.file.display.replace('.gcode', ''),
                  progress: Math.round((data.progress.filepos / data.job.file.size) * 100),
                  filamentAmount: this.service.convertFilamentLengthToAmount(this.getTotalAmountOfFilament(data.job.filament)),
                  timeLeft: {
                    value: this.service.convertSecondsToHours(data.progress.printTimeLeft),
                    unit: 'h'
                  },
                  timePrinted: {
                    value: this.service.convertSecondsToHours(data.progress.printTime),
                    unit: 'h'
                  },
                  estimatedPrintTime: {
                    value: this.service.convertSecondsToHours(data.job.estimatedPrintTime),
                    unit: 'h'
                  },
                  estimatedEndTime: this.calculateEndTime(data.job.estimatedPrintTime),
                };
              } catch (error) {
                this.notificationService.setError('Can\'t retrieve Job Status', error);
              }
            }
            observer.next(job);
          }, (error: HttpErrorResponse) => {
            this.printing = false;
            this.notificationService.setError('Can\'t retrieve jobs!', error.message);
          });

      });
    }).pipe(shareReplay(1));
    this.observable.subscribe();
  }

  private getTotalAmountOfFilament(filamentAmount: OctoprintFilament): number {
    let filamentLength = 0;
    // for (const property in filamentAmount) {
    //   if (filamentAmount.hasOwnProperty(property) && filamentAmount[property].hasOwnProperty('length')) {
    //     filamentLength += filamentAmount[property].length;
    //   }
    // }
    for (const filament of filamentAmount.entries) {
      filamentLength += filament.length;
    }
    return filamentLength;
  }

  public deleteJobInformation(): void {
    this.observer.next(null);
  }

  public getObservable(): Observable<Job> {
    return this.observable;
  }

  public isPrinting(): boolean {
    return this.printing;
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
          this.notificationService.setError('Can\'t cancel Job!', 'There is no running job, that could be cancelled (409)');
        } else {
          this.notificationService.setError('Can\'t cancel Job!', error.message);
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
          this.notificationService.setError('Can\'t pause Job!', 'There is no running job, that could be paused (409)');
        } else {
          this.notificationService.setError('Can\'t pause Job!', error.message);
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
          this.notificationService.setError('Can\'t resume Job!', 'There is no paused job, that could be resumed (409)');
        } else {
          this.notificationService.setError('Can\'t resume Job!', error.message);
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
          this.notificationService.setError('Can\'t start Job!', 'There is already a job running (409)');
        } else {
          this.notificationService.setError('Can\'t start Job!', error.message);
        }
      }
    );
  }

  public preheat(): void {
    if (this.httpPOSTRequest) {
      this.httpPOSTRequest.unsubscribe();
    }
    const preheatPayload: JobCommand = {
      command: 'preheat'
    };
    this.httpPOSTRequest = this.http.post(this.configService.getURL('plugin/preheat'), preheatPayload, this.configService.getHTTPHeaders())
      .subscribe(
        () => null, (error: HttpErrorResponse) => {
          this.notificationService.setError('Can\'t preheat printer!', error.message);
        }
      );
  }

  private calculateEndTime(duration: number): string {
    const date = new Date();
    date.setSeconds(date.getSeconds() + duration);
    return `${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}`;
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
  estimatedPrintTime: Duration;
  estimatedEndTime: string;
}
