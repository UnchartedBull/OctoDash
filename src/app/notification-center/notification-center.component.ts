import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-notification-center',
  templateUrl: './notification-center.component.html',
  styleUrls: ['./notification-center.component.scss'],
})
export class NotificationCenterComponent {
  @Output() hideNotificationCenter = new EventEmitter<void>();

  public time: string;

  constructor() {
    this.updateTime();
  }

  public updateTime(): void {
    const now = new Date();
    this.time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setTimeout(this.updateTime, 5000);
  }
}
