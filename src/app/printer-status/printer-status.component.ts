import { Component, OnInit } from '@angular/core';
import { PrinterStatusService, PrinterStatus } from '../printer-status.service';

@Component({
  selector: 'app-printer-status',
  templateUrl: './printer-status.component.html',
  styleUrls: ['./printer-status.component.scss']
})
export class PrinterStatusComponent implements OnInit {

  printerStatus: PrinterStatus;

  constructor(private _printerStatusService: PrinterStatusService) {
    this._printerStatusService.getPrinterStatusObservable().subscribe((printerStatus: PrinterStatus) => this.printerStatus = printerStatus)
  }

  ngOnInit() { }

}