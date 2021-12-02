import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationType } from 'src/app/model';

import { ConfigService } from '../../config/config.service';
import { JobCommand } from '../../model/octoprint';
import { NotificationService } from '../../notification/notification.service';
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
          this.notificationService.setNotification({
            heading: $localize`:@@error-start-job:Can't start job!`,
            text: error.message,
            type: NotificationType.ERROR,
            time: new Date(),
          });
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
          this.notificationService.setNotification({
            heading: $localize`:@@error-pause-job:Can't pause job!`,
            text: error.message,
            type: NotificationType.ERROR,
            time: new Date(),
          });
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
          this.notificationService.setNotification({
            heading: $localize`:@@error-resume-job:Can't resume job!`,
            text: error.message,
            type: NotificationType.ERROR,
            time: new Date(),
          });
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
          this.notificationService.setNotification({
            heading: $localize`:@@error-cancel-job:Can't cancel job!`,
            text: error.message,
            type: NotificationType.ERROR,
            time: new Date(),
          });
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
          this.notificationService.setNotification({
            heading: $localize`:@@error-restart-job:Can't restart job!`,
            text: error.message,
            type: NotificationType.ERROR,
            time: new Date(),
          });
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
          this.notificationService.setNotification({
            heading: $localize`:@@error-preheat:Can't preheat printer!`,
            text: error.message,
            type: NotificationType.ERROR,
            time: new Date(),
          });
          return of(null);
        }),
      )
      .subscribe();
  }
}
