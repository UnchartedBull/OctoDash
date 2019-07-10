import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../config/config.service';
import { AppService } from '../app.service';
import { PrinterStatus } from '../printer-status/printer-status.component';

@Component({
  selector: 'app-bottom-bar',
  templateUrl: './bottom-bar.component.html',
  styleUrls: ['./bottom-bar.component.scss']
})
export class BottomBarComponent implements OnInit {

  printer: Printer;
  enclosureTemperature: number;


  constructor(private _service: AppService, private _configService: ConfigService) {
  }

  ngOnInit() {
    this.enclosureTemperature = 22.5; //TODO
    this.printer = {
      name: this._configService.config.printer.name,
      status: "connecting ..."
    }
    this._service.getPrinterStatus().subscribe((printerStatus: PrinterStatus) => this.printer.status = printerStatus.status)
  }

}

interface Printer {
  name: string;
  status: string;
}