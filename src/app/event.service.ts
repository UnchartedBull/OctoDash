import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { ConfigService } from './config/config.service';
import { PrinterEvent } from './model/event.model';
import { SocketService } from './services/socket/socket.service';

@Injectable()
export class EventService implements OnDestroy {
  private subscriptions: Subscription = new Subscription();

  private printing = false;

  public constructor(
    private socketService: SocketService,
    private configService: ConfigService,
    private router: Router,
  ) {
    this.subscriptions.add(
      this.socketService.getEventSubscribable().subscribe((event: PrinterEvent) => this.handlePrinterEvent(event)),
    );
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
      }, 500);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public isPrinting(): boolean {
    return this.printing;
  }
}
