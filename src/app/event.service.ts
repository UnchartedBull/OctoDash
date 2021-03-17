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
      this.socketService.getEventSubscribable().subscribe((event: PrinterEvent) => {
        if (event === PrinterEvent.PRINTING || event === PrinterEvent.PAUSED) {
          this.printing = true;
        } else {
          this.printing = false;
        }

        if (event === PrinterEvent.CLOSED) {
          this.router.navigate(['/standby']);
        } else if (event === PrinterEvent.CONNECTED) {
          if (this.configService.isTouchscreen()) {
            this.router.navigate(['/main-screen']);
          } else {
            this.router.navigate(['/main-screen-no-touch']);
          }
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  // PrinterStateChange -> PRINTING / PAUSING / PAUSED / RESUMING / ... -> enum

  public isPrinting(): boolean {
    return this.printing;
  }
}
