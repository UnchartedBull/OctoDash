import { Component } from '@angular/core';
import { AppService } from './app.service';
import { Config } from './app.config';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  config: Config;
  enclosureTemperature: number = 22.3;
  currentState: CurrentState = {
    status: "printing",
    duration: {
      value: "1:14",
      unit: "h"
    }
  };
  job: Job = {
    filename: "Benchy.gcode",
    progress: 55,
    filamentAmount: 5.8,
    timeLeft: {
      value: "0:45",
      unit: "h"
    },
    timeTotal: {
      value: "1:59",
      unit: "h"
    }
  };
  // job = null;
  printHead: PrintHead = {
    x: 154,
    y: 201,
    z: 25.4
  }
  printerState: PrinterState = {
    nozzle: {
      current: 190,
      set: 190
    },
    heatbed: {
      current: 56,
      set: 55
    },
    fan: {
      current: 80,
      set: 80
    }
  }

  constructor(private _service: AppService) {
    this._service.getConfig().subscribe((config: Config) => this.config = config);
  }
}

interface Duration {
  value: string;
  unit: string;
}

interface CurrentState {
  status: string;
  duration: Duration;
}

interface Job {
  filename: string;
  progress: number;
  filamentAmount: number;
  timeLeft: Duration;
  timeTotal: Duration;
}

interface PrintHead {
  x: number;
  y: number;
  z: number;
}

interface PrinterState {
  nozzle: PrinterValue;
  heatbed: PrinterValue;
  fan: PrinterValue;
}

interface PrinterValue {
  current: number;
  set?: number;
}