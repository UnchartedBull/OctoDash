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

  public notification?: Notification;
  public notificationCloseTimeout: ReturnType<typeof setTimeout>;
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

  public hideNotification(removeFromStack = true): void {
    this.show = false;
    clearTimeout(this.notificationCloseTimeout);
    if (removeFromStack) this.notificationService.removeNotification(this.notification);
  }

  // TODO:
  public answerPrompt(index: number): void {
    this.http
      .post(
        this.configService.getApiURL('plugin/action_command_prompt'),
        { command: 'select', choice: index },
        this.configService.getHTTPHeaders(),
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
        this.hideNotification(false);
        this.notification = notification;
        this.show = true;

        if (!notification.sticky) {
          clearTimeout(this.notificationCloseTimeout);
          this.notificationCloseTimeout = setTimeout(this.hideNotification.bind(this), 30 * 1000, false);
        }
      }
    });
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
