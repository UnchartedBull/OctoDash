import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { ConfigService } from './config/config.service';
import { PrinterEvent, PrinterNotification } from './model/event.model';
import { SocketService } from './services/socket/socket.service';
import { NotificationService } from './notification/notification.service';

@Injectable()
export class EventService implements OnDestroy {
  private subscriptions: Subscription = new Subscription();

  private printing = false;

  public constructor(
    private socketService: SocketService,
    private configService: ConfigService,
    private notificationService: NotificationService,
    private router: Router,
  ) {
    this.subscriptions.add(
      this.socketService.getEventSubscribable().subscribe((event: PrinterEvent | PrinterNotification) => {
        if (this.isPrinterNotification(event)) {
          this.handlePrinterNotification(event);
        } else {
          this.handlePrinterEvent(event);
        }
      }),
    );
  }

  // https://stackoverflow.com/questions/14425568/interface-type-check-with-typescript
  // https://stackoverflow.com/questions/8511281/check-if-a-value-is-an-object-in-javascript/8511350#8511350
  private isPrinterNotification(object: any): object is PrinterNotification {
    return typeof object === 'object'
      && object !== null
      && ('text' in object || 'message' in object);
  }

  private handlePrinterNotification(event: PrinterNotification): void {
    if (event.choices?.length > 0) {
      // event is action:prompt
      this.notificationService.setPrompt($localize`:@@action-required:Action required`, event.text, event.choices)
    } else {
      // event is action:notification
      this.notificationService.setInfo($localize`:@@printer-information:Printer information`, event.message)
    }
  }

  private handlePrinterEvent(event: PrinterEvent): void {
    if (event === PrinterEvent.PRINTING || event === PrinterEvent.PAUSED) {
      setTimeout(() => {
        this.printing = true;
      }, 500);
    } else {
      setTimeout(() => {
        this.printing = false;
      }, 1000);
    }

    if (event === PrinterEvent.CLOSED) {
      this.router.navigate(['/standby']);
    } else if (event === PrinterEvent.CONNECTED) {
      setTimeout(() => {
        if (this.configService.isTouchscreen()) {
          this.router.navigate(['/main-screen']);
        } else {
          this.router.navigate(['/main-screen-no-touch']);
        }
      }, 1000);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public isPrinting(): boolean {
    return this.printing;
  }
}
