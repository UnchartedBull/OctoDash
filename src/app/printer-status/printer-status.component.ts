import { Component, OnInit } from '@angular/core';
import { PrinterStatusService, PrinterStatus } from '../printer-status.service';
import { DisplayLayerProgressService } from '../display-layer-progress.service';

@Component({
  selector: 'app-printer-status',
  templateUrl: './printer-status.component.html',
  styleUrls: ['./printer-status.component.scss']
})
export class PrinterStatusComponent implements OnInit {

  printerStatus: PrinterStatus;

  constructor(private _printerStatusService: PrinterStatusService, private _displayLayerProgressService: DisplayLayerProgressService) {
    this._printerStatusService.getObservable().subscribe((printerStatus: PrinterStatus) => this.printerStatus = printerStatus)
  }

  ngOnInit() { }

}