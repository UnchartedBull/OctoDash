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
    progress: 99,
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