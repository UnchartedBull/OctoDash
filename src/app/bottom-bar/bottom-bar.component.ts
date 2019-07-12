import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../config.service';
import { PrinterStatusService, PrinterStatusAPI } from '../printer-status.service';

@Component({
  selector: 'app-bottom-bar',
  templateUrl: './bottom-bar.component.html',
  styleUrls: ['./bottom-bar.component.scss']
})
export class BottomBarComponent implements OnInit {

  printer: Printer;
  enclosureTemperature: number;


  constructor(private printerStatusService: PrinterStatusService, private configService: ConfigService) {
    this.printerStatusService.getObservable().subscribe((printerStatus: PrinterStatusAPI) => this.printer.status = printerStatus.status);
  }

  ngOnInit() {
    this.enclosureTemperature = 22.5; // TODO
    this.printer = {
      name: this.configService.config.printer.name,
      status: 'connecting ...'
    };
  }
}

interface Printer {
  name: string;
  status: string;
}
