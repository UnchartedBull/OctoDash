import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { QuickControlModalService } from 'src/services/quick-control-modal.service';

import { PrinterExtruders, PrinterProfile, PrinterStatus, Temperature } from '../../../model';
import { PrinterService } from '../../../services/printer/printer.service';
import { SocketService } from '../../../services/socket/socket.service';

@Component({
  selector: 'app-printer-status',
  templateUrl: './printer-status.component.html',
  styleUrls: ['./printer-status.component.scss'],
  standalone: false,
})
export class PrinterStatusComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public printerStatus: PrinterStatus;
  public extruderInfo: PrinterExtruders = {
    count: 1,
    offsets: [],
    sharedNozzle: false,
  };

  public fanSpeed: number;
  public status: string;

  public selectedHotend: number;
  public sharedNozzle: boolean;

  public quickControlModalService: QuickControlModalService = inject(QuickControlModalService);

  public constructor(
    private printerService: PrinterService,
    private socketService: SocketService,
  ) {}

  public ngOnInit(): void {
    this.subscriptions.add(
      this.printerService.getActiveProfile().subscribe({
        next: (printerProfile: PrinterProfile) => (this.extruderInfo = printerProfile.extruder),
      }),
    );
    this.subscriptions.add(
      this.socketService.getPrinterStatusSubscribable().subscribe((status: PrinterStatus): void => {
        this.printerStatus = status;
      }),
    );
  }

  public filteredToolsByProfile(): Temperature[] {
    if (!this.printerStatus || !this.extruderInfo) {
      return [];
    }
    return this.printerStatus.tools.concat().splice(0, this.extruderInfo.count);
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public extruderTrackBy(index: number) {
    // In this case the index is sufficient as a unique identifier
    // The number of tools is not likely to change
    return index;
  }
}
