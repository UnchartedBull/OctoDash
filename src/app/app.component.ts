import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import _ from 'lodash';
import { ElectronService } from 'ngx-electron';

import { AppService } from './app.service';
import { ConfigService } from './config/config.service';
import { NotificationService } from './notification/notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public constructor(
    private service: AppService,
    private configService: ConfigService,
    private notificationService: NotificationService,
    private router: Router,
    private electronService: ElectronService,
  ) {}

  public activated = false;
  public status = 'initializing';
  public showConnectionHint = false;

  public ngOnInit(): void {
    this.initialize();
  }

  private initialize(): void {
    if (!this.electronService.isElectronApp) {
      this.notificationService.setWarning(
        'Non electron environment detected!',
        'The app may not work as intended. If you run an official build please open a new issue on GitHub.',
      );
    }
    if (this.configService && this.configService.isInitialized()) {
      if (this.configService.isLoaded()) {
        if (this.configService.isValid()) {
          this.connectWebsocket();
          this.status = 'connecting';
        } else {
          this.checkInvalidConfig();
        }
      } else {
        this.router.navigate(['/no-config']);
      }
    } else {
      setTimeout(this.initialize.bind(this), 1000);
    }
  }

  private checkInvalidConfig() {
    const errors = this.configService.getErrors();

    if (this.service.hasUpdateError(errors)) {
      if (this.service.fixUpdateErrors(errors)) {
        this.initialize();
      } else {
        this.configService.setUpdate();
        this.router.navigate(['/no-config']);
      }
    } else {
      this.router.navigate(['/invalid-config']);
    }
  }

  private connectWebsocket() {
    const showPrinterConnectedTimeout = setTimeout(() => {
      this.showConnectionHint = true;
    }, 2000);
    // if (this.configService.isTouchscreen()) {
    //   this.router.navigate(['/main-screen']);
    // } else {
    //   this.router.navigate(['/main-screen-no-touch']);
    // }
    // this.octoprintScriptService
    //   .initialize(this.configService.getURL(''), this.configService.getAccessKey())
    //   .then(() => {
    //     this.octoprintScriptService.authenticate(this.configService.getAccessKey());
    //   })
    //   .catch(() => {
    //     console.log('REJECTED');
    //     this.notificationService.setError(
    //       "Can't get OctoPrint script!",
    //       'Please restart your machine. If the error persists open a new issue on GitHub.',
    //     );
    //   })
    //   .finally(() => clearTimeout(showPrinterConnectedTimeout));
  }
}
