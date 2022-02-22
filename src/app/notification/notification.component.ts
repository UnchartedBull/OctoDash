import { Component, NgZone, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { Notification } from '../model';
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

  public constructor(private notificationService: NotificationService, private zone: NgZone) {
    this.subscriptions.add(
      this.notificationService
        .getObservable()
        .subscribe((notification: Notification | 'close'): void => this.setNotification(notification)),
    );
  }

  public hideNotification(removeFromStack = true, userTriggered = false): void {
    if (!userTriggered || (userTriggered && !this.notification.choices)) {
      this.show = false;
      clearTimeout(this.notificationCloseTimeout);
      if (removeFromStack) this.notificationService.removeNotification(this.notification);
    }
  }

  public chooseAction(index: number, callback: (index: number) => void): void {
    callback(index);
    this.hideNotification();
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
          this.notificationCloseTimeout = setTimeout(this.hideNotification.bind(this), 15 * 1000, false);
        }
      }
    });
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
