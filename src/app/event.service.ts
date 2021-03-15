import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { PrinterEvent } from './model/event.model';
import { SocketService } from './services/socket/socket.service';

@Injectable()
export class EventService implements OnDestroy {
  private subscriptions: Subscription = new Subscription();

  private printing = false;

  public constructor(private socketService: SocketService) {
    this.subscriptions.add(
      this.socketService.getEventSubscribable().subscribe((event: PrinterEvent) => {
        if (event === PrinterEvent.PRINTING || event === PrinterEvent.PAUSED) {
          this.printing = true;
        } else {
          this.printing = false;
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
