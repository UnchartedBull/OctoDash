import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { ConfigService } from '../config/config.service';
import { EnclosureService } from '../plugins/enclosure.service';
import { SocketService } from '../services/socket/socket.service';

@Component({
  selector: 'app-bottom-bar',
  templateUrl: './bottom-bar.component.html',
  styleUrls: ['./bottom-bar.component.scss'],
})
export class BottomBarComponent implements OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public printerStatus: string;
  public enclosureTemperature: TemperatureReading;

  public constructor(
    private socketService: SocketService,
    private configService: ConfigService,
    private enclosureService: EnclosureService,
  ) {
    if (this.configService.getAmbientTemperatureSensorName() !== null) {
      this.subscriptions.add(
        this.enclosureService.getObservable().subscribe((temperatureReading: TemperatureReading): void => {
          this.enclosureTemperature = temperatureReading;
        }),
      );
    } else {
      this.enclosureTemperature = null;
    }
    this.subscriptions.add(
      this.socketService.getPrinterStatusSubscribable().subscribe((printerStatus: string): void => {
        this.printerStatus = printerStatus;
      }),
    );
  }

  public getPrinterName(): string {
    return this.configService.getPrinterName();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}

export interface TemperatureReading {
  temperature: number;
  humidity: number;
  unit: string;
}
