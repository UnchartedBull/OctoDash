import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import _ from 'lodash-es';

import { AppService } from './app.service';
import { ConfigService } from './config/config.service';
import { SocketService } from './services/socket/socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public activated = false;
  public status = 'initializing';
  public showConnectionHint = false;

  public constructor(
    private _service: AppService,
    private _configService: ConfigService,
    private _socketService: SocketService,
    private _router: Router,
  ) {}

  public ngOnInit(): void {
    this.initialize();
  }

  private initialize(): void {
    if (this._configService && this._configService.isInitialized()) {
      if (this._configService.isLoaded()) {
        if (this._configService.isValid()) {
          this.status = 'connecting';
          this.connectWebsocket();
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
    const showPrinterConnectedTimeout = setTimeout(() => {
      this.showConnectionHint = true;
    }, 2000);
    this._socketService
      .connect()
      .then(() => {
        if (this._configService.isTouchscreen()) {
          this._router.navigate(['/main-screen']);
        } else {
          this._router.navigate(['/main-screen-no-touch']);
        }
      })
      .finally(() => clearTimeout(showPrinterConnectedTimeout));
  }
}
