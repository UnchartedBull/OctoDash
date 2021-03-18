import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';

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
      .pipe(catchError(error => this.notificationService.setError("Can't start job!", error.message)))
      .subscribe();
  }

  pauseJob(): void {
    const payload: JobCommand = {
      command: 'pause',
      action: 'pause',
    };

    this.http
      .post(this.configService.getApiURL('job'), payload, this.configService.getHTTPHeaders())
      .pipe(catchError(error => this.notificationService.setError("Can't pause job!", error.message)))
      .subscribe();
  }

  resumeJob(): void {
    const payload: JobCommand = {
      command: 'pause',
      action: 'resume',
    };

    this.http
      .post(this.configService.getApiURL('job'), payload, this.configService.getHTTPHeaders())
      .pipe(catchError(error => this.notificationService.setError("Can't resume job!", error.message)))
      .subscribe();
  }

  cancelJob(): void {
    const payload: JobCommand = {
      command: 'cancel',
    };

    this.http
      .post(this.configService.getApiURL('job'), payload, this.configService.getHTTPHeaders())
      .pipe(catchError(error => this.notificationService.setError("Can't cancel job!", error.message)))
      .subscribe();
  }

  restartJob(): void {
    const payload: JobCommand = {
      command: 'restart',
    };

    this.http
      .post(this.configService.getApiURL('job'), payload, this.configService.getHTTPHeaders())
      .pipe(catchError(error => this.notificationService.setError("Can't restart job!", error.message)))
      .subscribe();
  }

  preheat(): void {
    const payload: JobCommand = {
      command: 'preheat',
    };

    this.http
      .post(this.configService.getApiURL('plugin/preheat'), payload, this.configService.getHTTPHeaders())
      .pipe(catchError(error => this.notificationService.setError("Can't preheat printer!", error.message)))
      .subscribe();
  }
}
