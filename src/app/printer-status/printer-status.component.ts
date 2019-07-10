import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';

@Component({
  selector: 'app-printer-status',
  templateUrl: './printer-status.component.html',
  styleUrls: ['./printer-status.component.scss']
})
export class PrinterStatusComponent implements OnInit {

  printerStatus: PrinterStatus = {
    status: "no connection",
    nozzle: {
      current: 0,
      set: 0
    },
    heatbed: {
      current: 0,
      set: 0
    },
    // TODO
    fan: 0
  }

  // TODO
  layerProgress: LayerProgress = {
    current: 0,
    total: 0
  }

  constructor(private _service: AppService) { }

  ngOnInit() {
    this._service.getPrinterStatus().subscribe((printerStatus: PrinterStatus) => this.printerStatus = printerStatus)
  }

}

export interface PrinterStatus {
  status: string,
  nozzle: PrinterValue;
  heatbed: PrinterValue;
  fan: number;
}

interface PrinterValue {
  current: number;
  set: number;
}

interface LayerProgress {
  current: number;
  total: number;
}