import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationService, Message } from './notification.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnDestroy {

  private subscriptions: Subscription = new Subscription();

  public notification: Message = {
    heading: '',
    text: '',
    type: ''
  };
  public show = false;

  constructor(private notificationService: NotificationService) {
    this.subscriptions.add(this.notificationService.getObservable().subscribe((message: Message) => this.setMessage(message)));
  }

  hideNotification() {
    this.show = false;
  }

  setMessage(message: Message) {
    this.notification = message;
    this.show = true;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
