import _ from 'lodash';
import { AppService } from './app.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConfigService } from './config/config.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {

  constructor(private configService: ConfigService, private service: AppService, private router: Router) {
    this.initialize();
  }

  initialize() {
    if (this.configService && this.configService.isInitialized()) {
      if (this.configService.config) {
        if (this.configService.isValid()) {
          if (this.configService.isTouchscreen()) {
            this.router.navigate(['/main-screen']);
          } else {
            this.router.navigate(['/main-screen-no-touch']);
          }
        } else {
          if (_.isEqual(this.configService.getErrors(), this.service.getUpdateError())) {
            if (this.service.autoFixError()) {
              this.initialize();
            } else {
              this.configService.setUpdate();
              this.router.navigate(['/no-config']);
            }
          } else {
            this.router.navigate(['/invalid-config']);
          }
        }
      } else {
        this.router.navigate(['/no-config']);
      }
    } else {
      setTimeout(this.initialize, 200);
    }
  }
}
