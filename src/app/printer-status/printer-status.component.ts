import { Component, OnInit } from '@angular/core';
import { PrinterStatusService, PrinterStatus } from '../printer-status.service';

@Component({
  selector: 'app-printer-status',
  templateUrl: './printer-status.component.html',
  styleUrls: ['./printer-status.component.scss']
})
export class PrinterStatusComponent implements OnInit {

  printerStatus: PrinterStatus;
  // printerStatus: PrinterStatus = {
  //   status: "no connection",
  //   nozzle: {
  //     current: 0,
  //     set: 0
  //   },
  //   heatbed: {
  //     current: 0,
  //     set: 0
  //   },
  //   // TODO
  //   fan: 0
  // }

  constructor(private _printerStatusService: PrinterStatusService) {
    this._printerStatusService.getPrinterStatusObservable().subscribe((printerStatus: PrinterStatus) => this.printerStatus = printerStatus)
  }

  ngOnInit() { }

}