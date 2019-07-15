import { Component, OnInit, OnDestroy } from '@angular/core';
import { PrinterStatusService, PrinterStatusAPI, PrinterValue } from './printer-status.service';
import { DisplayLayerProgressService, DisplayLayerProgressAPI } from '../display-layer-progress.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-printer-status',
  templateUrl: './printer-status.component.html',
  styleUrls: ['./printer-status.component.scss']
})
export class PrinterStatusComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription = new Subscription();
  public printerStatus: PrinterStatus;

  constructor(private printerStatusService: PrinterStatusService, private displayLayerProgressService: DisplayLayerProgressService) {
    this.printerStatus = {
      nozzle: {
        current: 0,
        set: 0
      },
      heatbed: {
        current: 0,
        set: 0
      },
      fan: 0
    };
  }

  ngOnInit() {
    this.subscriptions.add(this.printerStatusService.getObservable().subscribe((printerStatus: PrinterStatusAPI) => {
      this.printerStatus.nozzle = printerStatus.nozzle;
      this.printerStatus.heatbed = printerStatus.heatbed;
    }));

    this.subscriptions.add(this.displayLayerProgressService.getObservable().subscribe((layerProgress: DisplayLayerProgressAPI) => {
      this.printerStatus.fan = layerProgress.fanSpeed;
    }));
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}

export interface PrinterStatus {
  nozzle: PrinterValue;
  heatbed: PrinterValue;
  fan: number;
}
