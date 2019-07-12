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
  constructor(public configService: ConfigService) {
  }
}

