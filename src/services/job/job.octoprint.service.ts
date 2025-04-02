import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { JobCommand } from '../../model/octoprint';
import { ConfigService } from '../../services/config.service';
import { NotificationService } from '../../services/notification.service';
import { JobService } from './job.service';

@Injectable()
export class JobOctoprintService implements JobService {
  public constructor(
    private configService: ConfigService,
    private notificationService: NotificationService,
    private http: HttpClient,
  ) {}

  startJob(): void {
    const payload: JobCommand = {
      command: 'start',
    };

    this.http
      .post(this.configService.getApiURL('job'), payload, this.configService.getHTTPHeaders())
      .pipe(
        catchError(error => {
          this.notificationService.error($localize`:@@error-start-job:Can't start job!`, error.message);
          return of(null);
        }),
      )
      .subscribe();
  }

  pauseJob(): void {
    const payload: JobCommand = {
      command: 'pause',
      action: 'pause',
    };

    this.http
      .post(this.configService.getApiURL('job'), payload, this.configService.getHTTPHeaders())
      .pipe(
        catchError(error => {
          this.notificationService.error($localize`:@@error-pause-job:Can't pause job!`, error.message);
          return of(null);
        }),
      )
      .subscribe();
  }

  resumeJob(): void {
    const payload: JobCommand = {
      command: 'pause',
      action: 'resume',
    };

    this.http
      .post(this.configService.getApiURL('job'), payload, this.configService.getHTTPHeaders())
      .pipe(
        catchError(error => {
          this.notificationService.error($localize`:@@error-resume-job:Can't resume job!`, error.message);
          return of(null);
        }),
      )
      .subscribe();
  }

  cancelJob(): void {
    const payload: JobCommand = {
      command: 'cancel',
    };

    this.http
      .post(this.configService.getApiURL('job'), payload, this.configService.getHTTPHeaders())
      .pipe(
        catchError(error => {
          this.notificationService.error($localize`:@@error-cancel-job:Can't cancel job!`, error.message);
          return of(null);
        }),
      )
      .subscribe();
  }

  restartJob(): void {
    const payload: JobCommand = {
      command: 'restart',
    };

    this.http
      .post(this.configService.getApiURL('job'), payload, this.configService.getHTTPHeaders())
      .pipe(
        catchError(error => {
          this.notificationService.error($localize`:@@error-restart-job:Can't restart job!`, error.message);
          return of(null);
        }),
      )
      .subscribe();
  }

  preheat(): void {
    const payload: JobCommand = {
      command: 'preheat',
    };

    this.http
      .post(this.configService.getApiURL('plugin/preheat'), payload, this.configService.getHTTPHeaders())
      .pipe(
        catchError(error => {
          this.notificationService.error($localize`:@@error-preheat:Can't preheat printer!`, error.message);
          return of(null);
        }),
      )
      .subscribe();
  }
}
