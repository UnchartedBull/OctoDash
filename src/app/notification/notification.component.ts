import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationService, Notification } from './notification.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnDestroy {

  private subscriptions: Subscription = new Subscription();

  public notification: Notification = {
    heading: '',
    text: '',
    type: ''
  };
  public show = false;

  public constructor(private notificationService: NotificationService) {
    this.subscriptions.add(this.notificationService.getObservable().subscribe((message: Notification) => this.setNotification(message)));
  }

  public hideNotification() {
    this.show = false;
  }

  public setNotification(notification: Notification) {
    this.notification = notification;
    this.show = true;
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
