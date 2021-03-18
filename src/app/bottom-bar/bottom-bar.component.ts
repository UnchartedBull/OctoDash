import { Component, OnDestroy } from '@angular/core';
import { Subscription, timer } from 'rxjs';

import { ConfigService } from '../config/config.service';
import { PrinterState, PrinterStatus, TemperatureReading } from '../model';
import { NotificationService } from '../notification/notification.service';
import { EnclosureService } from '../services/enclosure/enclosure.service';
import { SocketService } from '../services/socket/socket.service';

@Component({
  selector: 'app-bottom-bar',
  templateUrl: './bottom-bar.component.html',
  styleUrls: ['./bottom-bar.component.scss'],
})
export class BottomBarComponent implements OnDestroy {
  private subscriptions: Subscription = new Subscription();
  private printerReady = false;

  public printerStatus: PrinterState;
  public enclosureTemperature: TemperatureReading;

  public constructor(
    private socketService: SocketService,
    private configService: ConfigService,
    private enclosureService: EnclosureService,
    private notificationService: NotificationService,
  ) {
    if (this.configService.getAmbientTemperatureSensorName() !== null) {
      this.subscriptions.add(
        timer(2500, 15000).subscribe(() => {
          if (this.printerReady) {
            this.enclosureService.getEnclosureTemperature().subscribe(
              (temperatureReading: TemperatureReading) => (this.enclosureTemperature = temperatureReading),
              error => {
                this.notificationService.setError("Can't retrieve enclosure temperature!", error.message);
              },
            );
          }
        }),
      );
    }
    this.subscriptions.add(
      this.socketService.getPrinterStatusSubscribable().subscribe((printerStatus: PrinterStatus): void => {
        this.printerStatus = printerStatus.status;
        if (!this.printerReady) {
          this.printerReady = [PrinterState.operational, PrinterState.printing, PrinterState.paused].includes(
            this.printerStatus,
          );
        }
      }),
    );
  }

  public getStringStatus(printerState: PrinterState): string {
    return PrinterState[printerState];
  }

  public getPrinterName(): string {
    return this.configService.getPrinterName();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
