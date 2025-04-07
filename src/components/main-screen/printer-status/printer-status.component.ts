import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { PrinterExtruders, PrinterProfile, PrinterStatus } from '../../../model';
import { ConfigService } from '../../../services/config.service';
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

  public QuickControlView = QuickControlView;
  public view = QuickControlView.NONE;

  public constructor(
    private printerService: PrinterService,
    private configService: ConfigService,
    private socketService: SocketService,
    private router: Router,
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

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public showQuickControlHotend(tool: number): void {
    this.view = QuickControlView.HOTEND;
    this.selectedHotend = tool;
  }

  public showQuickControlHeatbed(): void {
    this.view = QuickControlView.HEATBED;
  }

  public showQuickControlFan(): void {
    this.view = QuickControlView.FAN;
  }

  public hideQuickControl(): void {
    this.view = QuickControlView.NONE;
  }

  public quickControlSetValue(value: number): void {
    switch (this.view) {
      case QuickControlView.HOTEND:
        this.printerService.setTemperatureHotend(value, this.selectedHotend);
        break;
      case QuickControlView.HEATBED:
        this.printerService.setTemperatureBed(value);
        break;
      case QuickControlView.FAN:
        this.printerService.setFanSpeed(value);
        break;
    }

    this.hideQuickControl();
  }
}

enum QuickControlView {
  NONE,
  HOTEND,
  HEATBED,
  FAN,
}
