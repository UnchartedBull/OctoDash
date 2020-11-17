import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { OctoprintConnection } from '.././octoprint/model/connection';
import { AppService } from '../app.service';
import { ConfigService } from '../config/config.service';
import { NotificationService } from '../notification/notification.service';
import { PsuControlService } from '../plugin-service/psu-control.service';

@Component({
  selector: 'app-standby',
  templateUrl: './standby.component.html',
  styleUrls: ['./standby.component.scss'],
})
export class StandbyComponent implements OnInit {
  public connecting = false;
  public error = '';
  private connectionRetries = 3;
  private displaySleepTimeout: ReturnType<typeof setTimeout>;

  public constructor(
    private configService: ConfigService,
    private http: HttpClient,
    private router: Router,
    private service: AppService,
    private notificationService: NotificationService,
    private psuControlService: PsuControlService,
  ) {}

  public ngOnInit(): void {
    this.notificationService.disableNotifications();
    if (this.configService.getAutomaticScreenSleep()) {
      this.displaySleepTimeout = setTimeout(this.service.turnDisplayOff.bind(this.service), 300000);
    }
  }

  public reconnect(): void {
    this.connecting = true;
    if (this.configService.turnOnPSUWhenExitingSleep()) {
      this.psuControlService.changePSUState(true);
      setTimeout(this.checkConnection.bind(this), 5000);
    } else {
      this.checkConnection();
    }
  }

  private connectToPrinter(): void {
    this.http
      .post(this.configService.getURL('connection'), connectPayload, this.configService.getHTTPHeaders())
      .subscribe(
        (): void => {
          setTimeout(this.checkConnection.bind(this), 5000);
        },
        (): void => {
          this.setConnectionError();
        },
      );
  }

  private checkConnection(): void {
    this.http.get(this.configService.getURL('connection'), this.configService.getHTTPHeaders()).subscribe(
      (data: OctoprintConnection): void => {
        if (data.current.state === 'Closed') {
          if (this.connectionRetries <= 0) {
            this.connectionRetries = 3;
            this.setConnectionError();
          } else {
            this.connectionRetries--;
            setTimeout(this.connectToPrinter.bind(this), 500);
          }
        } else if (data.current.state.includes('Error')) {
          if (this.connectionRetries <= 1) {
            this.connectionRetries = 3;
            this.setConnectionError();
          } else {
            this.connectionRetries--;
            setTimeout(this.connectToPrinter.bind(this), 500);
          }
        } else if (data.current.state === 'Connecting') {
          if (this.connectionRetries < 0) {
            this.connectionRetries = 3;
            this.setConnectionError();
          } else {
            this.connectionRetries--;
            setTimeout(this.checkConnection.bind(this), 5000);
          }
        } else {
          this.disableStandby();
        }
      },
      (): void => {
        this.connecting = false;
        this.error =
          "There is something really wrong, OctoDash can't get a response from OctoPrint. Please check your setup!";
      },
    );
  }

  private setConnectionError(): void {
    this.connecting = false;
    this.error =
      "OctoPrint can't connect to your printer. Please make sure that the connection works, then come back and try again.";
  }

  private disableStandby(): void {
    if (this.configService.getAutomaticScreenSleep()) {
      if (this.displaySleepTimeout) {
        clearTimeout(this.displaySleepTimeout);
      }
      this.service.turnDisplayOn();
    }
    setTimeout((): void => {
      this.connecting = false;
      this.notificationService.enableNotifications();
      this.router.navigate(['/main-screen']);
    }, 1000);
  }
}

const connectPayload: ConnectCommand = {
  command: 'connect',
  save: false,
};

interface ConnectCommand {
  command: string;
  port?: string;
  baudrate?: number;
  printerProfile?: string;
  save?: boolean;
  autoconnect?: boolean;
}
