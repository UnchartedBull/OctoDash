import { Component, OnInit, OnDestroy } from '@angular/core';
import { ConfigService } from '../config/config.service';
import { PrinterService, PrinterStatusAPI } from '../printer.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bottom-bar',
  templateUrl: './bottom-bar.component.html',
  styleUrls: ['./bottom-bar.component.scss']
})
export class BottomBarComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription = new Subscription();
  public printer: Printer;
  public enclosureTemperature: number;
  private ipc: any;

  constructor(private printerService: PrinterService, private configService: ConfigService) {
    if (window.require && configService.config.octodash.temperatureSensor !== null) {
      try {
        this.ipc = window.require('electron').ipcRenderer;
        this.ipc.on('temperatureReading', ({ }, temperatureReading: TemperatureReading) => {
          this.enclosureTemperature = temperatureReading.temperature;
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      this.enclosureTemperature = 0.0;
    }
    this.printer = {
      name: this.configService.config.printer.name,
      status: 'connecting ...'
    };
  }

  ngOnInit() {
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

interface TemperatureReading {
  temperature: number;
  humidity: number;
}
