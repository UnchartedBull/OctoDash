import { Component, OnInit, OnDestroy } from '@angular/core';
import { PrinterService, PrinterStatusAPI, PrinterValue } from '../printer.service';
import { LayerProgressService, DisplayLayerProgressAPI } from '../plugin-service/layer-progress.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-printer-status',
  templateUrl: './printer-status.component.html',
  styleUrls: ['./printer-status.component.scss']
})
export class PrinterStatusComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription = new Subscription();
  public printerStatus: PrinterStatus;
  public status: string;

  constructor(private printerService: PrinterService, private displayLayerProgressService: LayerProgressService) {
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
    this.status = 'connecting';
  }

  ngOnInit() {
    this.subscriptions.add(this.printerService.getObservable().subscribe((printerStatus: PrinterStatusAPI) => {
      this.printerStatus.nozzle = printerStatus.nozzle;
      this.printerStatus.heatbed = printerStatus.heatbed;
      this.status = printerStatus.status;
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
