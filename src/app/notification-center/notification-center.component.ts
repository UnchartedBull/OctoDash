import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-notification-center',
  templateUrl: './notification-center.component.html',
  styleUrls: ['./notification-center.component.scss'],
})
export class NotificationCenterComponent {
  @Output() hideNotificationCenter = new EventEmitter<void>();
}
