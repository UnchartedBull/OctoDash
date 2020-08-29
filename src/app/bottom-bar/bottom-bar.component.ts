import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { ConfigService } from '../config/config.service';
import { EnclosureService } from '../plugin-service/enclosure.service';
import { PrinterService, PrinterStatusAPI } from '../printer.service';

@Component({
  selector: 'app-bottom-bar',
  templateUrl: './bottom-bar.component.html',
  styleUrls: ['./bottom-bar.component.scss'],
})
export class BottomBarComponent implements OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public printer: Printer;
  public enclosureTemperature: TemperatureReading;

  public constructor(
    private printerService: PrinterService,
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
    this.printer = {
      name: this.configService.getPrinterName(),
      status: 'connecting ...',
    };
    this.subscriptions.add(
      this.printerService.getObservable().subscribe((printerStatus: PrinterStatusAPI): void => {
        this.printer.status = printerStatus.status;
      }),
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}

interface Printer {
  name: string;
  status: string;
}

export interface TemperatureReading {
  temperature: number;
  humidity: number;
  unit: string;
}
