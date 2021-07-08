import { Component, NgZone, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Notification } from '../model';
import { ConfigService } from '../config/config.service';
import { NotificationService } from './notification.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent implements OnDestroy {
  private subscriptions: Subscription = new Subscription();

  public notification: Notification = {
    heading: '',
    text: '',
    type: '',
    choices: null,
    closed: null,
  };
  public show = false;

  public constructor(
    private notificationService: NotificationService,
    private zone: NgZone,
    private http: HttpClient,
    private configService: ConfigService,
  ) {
    this.subscriptions.add(
      this.notificationService
        .getObservable()
        .subscribe((notification: Notification | 'close'): void => this.setNotification(notification)),
    );
  }

  public hideNotification(): void {
    this.show = false;
    if (this.notification.closed) {
      this.notification.closed();
    }
  }

  public answerPrompt(index: number): void {
    this.http
      .post(
        this.configService.getApiURL('plugin/action_command_prompt'),
        { command: 'select', choice: index },
        this.configService.getHTTPHeaders()
      )
      .pipe(
        catchError(error =>
          this.notificationService.setError($localize`:@@error-answer-prompt:Can't answer prompt!`, error.message),
        ),
      )
      .subscribe();
  }

  private setNotification(notification: Notification | 'close'): void {
    this.zone.run(() => {
      if (notification === 'close') {
        this.hideNotification();
      } else {
        this.notification = notification;
        this.show = true;
      }
    });
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
