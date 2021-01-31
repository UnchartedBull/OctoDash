import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import _ from 'lodash';

import { AppService } from './app.service';
import { ConfigService } from './config/config.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public activated = false;
  public status = 'initializing';
  public showConnectionHint = false;

  public constructor(private _service: AppService, private _configService: ConfigService, private _router: Router) {}

  public ngOnInit(): void {
    this.initialize();
  }

  private initialize(): void {
    if (this._configService && this._configService.isInitialized()) {
      if (this._configService.isLoaded()) {
        if (this._configService.isValid()) {
          this.connectWebsocket();
          this.status = 'connecting';
        } else {
          this.checkInvalidConfig();
        }
      } else {
        this._router.navigate(['/no-config']);
      }
    } else {
      setTimeout(this.initialize.bind(this), 1000);
    }
  }

  private checkInvalidConfig() {
    const errors = this._configService.getErrors();

    if (this._service.hasUpdateError(errors)) {
      if (this._service.fixUpdateErrors(errors)) {
        this.initialize();
      } else {
        this._configService.setUpdate();
        this._router.navigate(['/no-config']);
      }
    } else {
      this._router.navigate(['/invalid-config']);
    }
  }

  private connectWebsocket() {
    this._service.connectSocket();
    const showPrinterConnectedTimeout = setTimeout(() => {
      this.showConnectionHint = true;
    }, 2000);
    // if (this._configService.isTouchscreen()) {
    //   this._router.navigate(['/main-screen']);
    // } else {
    //   this._router.navigate(['/main-screen-no-touch']);
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
