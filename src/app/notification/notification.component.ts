import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationService, Message } from './notification.service';
import { PrinterService } from '../printer.service';
import { Router } from '@angular/router';

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

  public constructor(private notificationService: NotificationService, private printerService: PrinterService, private router: Router) {
    this.subscriptions.add(this.notificationService.getObservable().subscribe((message: Message) => this.setMessage(message)));
  }

  public hideNotification() {
    this.show = false;
  }

  public setMessage(message: Message) {
    if (message.printerStatusError) {
      this.printerService.isPrinterOffline().then((printerOffline) => {
        if (printerOffline) {
          this.hideNotification();
          console.clear();
          this.router.navigate(['/standby']);
        } else {
          this.notification = message;
          this.show = true;
        }
      });
    } else {
      this.notification = message;
      this.show = true;
    }
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
