import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import _ from 'lodash';

import { AppService } from './app.service';
import { ConfigService } from './config/config.service';
import { NotificationService } from './notification/notification.service';
import { OctoprintScriptService } from './octoprint-script.service';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    require: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    process: any;
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public constructor(
    private service: AppService,
    private configService: ConfigService,
    private octoprintScriptService: OctoprintScriptService,
    private notificationService: NotificationService,
    private router: Router,
    private zone: NgZone,
  ) {}

  public ngOnInit(): void {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (this.configService && this.configService.isInitialized()) {
      if (this.configService.isLoaded()) {
        if (this.configService.isValid()) {
          try {
            await this.zone.run(async () => {
              await this.octoprintScriptService.initialize(this.configService.getURL(''));
              this.octoprintScriptService.authenticate(this.configService.getAccessKey());
            });
          } catch {
            this.notificationService.setError(
              "Can't get OctoPrint script!",
              'Please restart your machine. If the error persists open a new issue on GitHub.',
            );
          }
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
      setTimeout(this.initialize.bind(this), 1000);
    }
  }
}
