import { Component, EventEmitter, Output } from '@angular/core';

import { Notification } from '../model';
import { NotificationService } from '../notification/notification.service';

@Component({
  selector: 'app-notification-center',
  templateUrl: './notification-center.component.html',
  styleUrls: ['./notification-center.component.scss'],
})
export class NotificationCenterComponent {
  @Output() hideNotificationCenter = new EventEmitter<void>();

  public time: string;

  constructor(private notificationService: NotificationService) {
    this.updateTime();
  }

  public updateTime(): void {
    const now = new Date();
    this.time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setTimeout(this.updateTime.bind(this), 5000);
  }

  public getAllNotifications(): Array<Notification> {
    return this.notificationService.notificationStack;
  }

  public removeNotification(notification: Notification) {
    this.notificationService.removeNotification(notification);
  }
}
