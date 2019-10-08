import { Component, OnInit, OnDestroy } from '@angular/core';
import { ConfigService } from '../config/config.service';
import { PrinterService, PrinterStatusAPI } from '../printer.service';
import { Subscription } from 'rxjs';
import { EnclosureService } from '../enclosure.service';

@Component({
  selector: 'app-bottom-bar',
  templateUrl: './bottom-bar.component.html',
  styleUrls: ['./bottom-bar.component.scss']
})
export class BottomBarComponent implements OnDestroy {

  private subscriptions: Subscription = new Subscription();
  public printer: Printer;
  public enclosureTemperature: TemperatureReading;

  constructor(private printerService: PrinterService, private configService: ConfigService, private enclosureService: EnclosureService) {
    if (this.configService.getAmbientTemperatureSensorName() !== null) {
      this.subscriptions.add(this.enclosureService.getObservable().subscribe((temperatureReading: TemperatureReading) => {
        this.enclosureTemperature = temperatureReading;
      }));
    } else {
      this.enclosureTemperature = null;
    }
    this.printer = {
      name: this.configService.config.printer.name,
      status: 'connecting ...'
    };
    this.subscriptions.add(this.printerService.getObservable().subscribe((printerStatus: PrinterStatusAPI) => {
      this.printer.status = printerStatus.status;
    }));
  }

  ngOnDestroy() {
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
}
