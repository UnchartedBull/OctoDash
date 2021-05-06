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
      && ('text' in object || 'message' in object || 'action' in object);
  }

  private handlePrinterNotification(event: PrinterNotification): void {
    const messages = {
      'FilamentRunout T0': $localize`:@@prompt-filament-runout-t0:Filament runout detected. Ejecting filament, please wait...`,
      'Nozzle Parked': $localize`:@@prompt-filament-runout:A filament runout has been detected. Please remove the ejected filament, insert filament from a new spool and press Continue.`,
      'Continue': $localize`:@@prompt-continue:Continue`,
      'Paused': $localize`:@@prompt-filament-runout-resume:The filament has been primed. Do you want to continue printing?`,
      'PurgeMore': $localize`:@@prompt-filament-runout-purge:Purge more filament`,
      'Heater Timeout': $localize`:@@prompt-heater-timeout:The hotend has been disabled due to inactivity, to avoid burning the filament. Press Reheat when ready to resume.`,
      'Reheat': $localize`:@@prompt-reheat:Reheat`,
      'Reheating...': $localize`:@@prompt-reheating:Reheating...`,
      'Reheat Done': $localize`:@@prompt-reheat-done:The hotend is now ready.`,
    };
    if (event.action === 'close') {
      this.notificationService.closeNotification();
    } else if (event.choices?.length > 0) {
      // event is action:prompt
      this.notificationService.setPrompt(
        $localize`:@@action-required:Action required`,
        messages[event.text] || event.text,
        event.choices.map(c => messages[c] || c)
      );
    } else if (event.choices?.length == 0) {
      // event is action:prompt without choices
      this.notificationService.setWarning(
        $localize`:@@printer-information:Printer information`,
        messages[event.text] || event.text
      );
    } else {
      // event is action:notification
      // this.notificationService.setInfo(
      //   $localize`:@@printer-information:Printer information`,
      //   messages[event.message] || event.message
      // );
      // TODO: annoying as a notification
      // should be put with an autoclear timeout in the bottom-right statusline
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
