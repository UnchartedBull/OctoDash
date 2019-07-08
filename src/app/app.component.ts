import { Component } from '@angular/core';
import { AppService } from './app.service';
import { Config } from './app.config';
import { timer, from } from 'rxjs'
import { map } from 'rxjs/operators'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  config: Config;
  job: Job
  printerState: PrinterState = {
    state: "no connection",
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
  enclosureTemperature: number = 22.3;
  layerProgress: LayerProgress = {
    current: 0,
    total: 0
  }

  constructor(private _service: AppService) {
    this._service.getConfig().subscribe((config: Config) => this.config = config);
    this._service.getJobInformation().subscribe((job: Job) => this.job = job);
    this._service.getPrinterState().subscribe((printerState: PrinterState) => this.printerState = printerState)
  }
}

interface Duration {
  value: string;
  unit: string;
}

interface Job {
  filename: string;
  progress: number;
  filamentAmount: number;
  timeLeft: Duration;
  timePrinted: Duration;
}

interface LayerProgress {
  current: number;
  total: number;
}

interface PrinterState {
  state: string,
  nozzle: PrinterValue;
  heatbed: PrinterValue;
  fan: number;
}

interface PrinterValue {
  current: number;
  set: number;
}