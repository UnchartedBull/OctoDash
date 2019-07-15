import { Component, OnInit, OnDestroy } from '@angular/core';
import { ConfigService } from '../config/config.service';
import { PrinterStatusService, PrinterStatusAPI } from '../printer-status/printer-status.service';
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


  constructor(private printerStatusService: PrinterStatusService, private configService: ConfigService) {
    this.enclosureTemperature = 22.5; // TODO
    this.printer = {
      name: this.configService.config.printer.name,
      status: 'connecting ...'
    };
  }

  ngOnInit() {
    this.subscriptions.add(this.printerStatusService.getObservable().subscribe((printerStatus: PrinterStatusAPI) => {
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
