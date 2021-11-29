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
  public show = false;

  public constructor(private notificationService: NotificationService, private zone: NgZone) {
    this.subscriptions.add(
      this.notificationService
        .getObservable()
        .subscribe((notification: Notification | 'close'): void => this.setNotification(notification)),
    );
  }

  public hideNotification(): void {
    this.show = false;
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
