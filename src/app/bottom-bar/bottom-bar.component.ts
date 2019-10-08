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
  public enclosureTemperature: TemperatureReading;
  private ipc: any;

  constructor(private printerService: PrinterService, private configService: ConfigService) {
    if (true) {
      this.enclosureTemperature = {
        temperature: 21.8,
        humidity: 1
      };
    } else {
      this.enclosureTemperature = null;
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
