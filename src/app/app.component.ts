import { Component } from '@angular/core';
import { AppService } from './app.service';
import { Config, ConfigService } from './config/config.service';
import { timer, from } from 'rxjs'
import { map } from 'rxjs/operators'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  config: Config;
  job: Job  // TODO

  constructor(private _service: AppService, private _configService: ConfigService) {
    this._service.getJobInformation().subscribe((job: Job) => this.job = job);
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

