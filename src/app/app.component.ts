import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AppService } from './app.service';
import { ConfigService } from './config/config.service';
import { SocketService } from './services/socket/socket.service';

// TODO: Upgrading settings killed OctoDash
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
    private service: AppService,
    private configService: ConfigService,
    private socketService: SocketService,
    private router: Router,
  ) {}

  public ngOnInit(): void {
    this.initialize();
  }

  private initialize(): void {
    if (this.configService && this.configService.isInitialized()) {
      if (this.configService.isLoaded()) {
        if (this.configService.isValid()) {
          this.connectWebsocket();
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
    }, 30000);
    this.socketService
      .connect()
      .then(() => {
        if (this.configService.isTouchscreen()) {
          this.router.navigate(['/main-screen']);
        } else {
          this.router.navigate(['/main-screen-no-touch']);
        }
      })
      .finally(() => clearTimeout(showPrinterConnectedTimeout));
  }
}
