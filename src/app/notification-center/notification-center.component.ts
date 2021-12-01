import { Component, EventEmitter, Output } from '@angular/core';

import { Notification } from '../model';
import { NotificationService } from '../notification/notification.service';

@Component({
  selector: 'app-notification-center',
  templateUrl: './notification-center.component.html',
  styleUrls: ['./notification-center.component.scss'],
})
export class NotificationCenterComponent {
  @Output() setNotificationCenterAnimation = new EventEmitter<boolean>();
  @Output() setNotificationCenterPosition = new EventEmitter<string>();

  public time: string;
  public startSwipe: Touch | undefined;

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

  public hideNotificationCenter() {
    this.setNotificationCenterPosition.emit('-100%');
  }

  public showNotificationCenter() {
    this.setNotificationCenterPosition.emit('0%');
  }

  public onTouchStart(event: TouchEvent) {
    if (event.changedTouches[0].clientY > event.view.innerHeight - event.view.innerHeight / 5) {
      this.startSwipe = event.changedTouches[0];
      this.setNotificationCenterAnimation.emit(false);
    } else {
      this.startSwipe = undefined;
    }
  }

  public onTouchMove(event: TouchEvent) {
    if (this.startSwipe) {
      this.setNotificationCenterPosition.emit(
        `${(100 - (event.changedTouches[0].clientY / event.view.innerHeight) * 100) * -1}%`,
      );
    }
  }

  public onTouchEnd(event: TouchEvent) {
    if (this.startSwipe) {
      this.setNotificationCenterAnimation.emit(true);
      const endSwipe = event.changedTouches[0];
      if (endSwipe.clientY < event.view.innerHeight - event.view.innerHeight / 3) {
        this.hideNotificationCenter();
      } else {
        this.showNotificationCenter();
      }
    }
  }
}
