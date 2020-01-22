import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../config/config.service';
import { Subscription } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AppService } from '../app.service';
import { NotificationService } from '../notification/notification.service';
import { OctoprintConnectionAPI } from '../octoprint-api/connectionAPI';

@Component({
  selector: 'app-standby',
  templateUrl: './standby.component.html',
  styleUrls: ['./standby.component.scss']
})
export class StandbyComponent implements OnInit {

  connecting = false;
  error = '';

  constructor(
    private configService: ConfigService,
    private http: HttpClient,
    private router: Router,
    private service: AppService,
    private notificationService: NotificationService) { }

  ngOnInit() {
    if (this.configService.getAutomaticScreenSleep()) {
      setTimeout(this.service.turnDisplayOff.bind(this.service), 300000);
    }
  }

  reconnect() {
    this.connecting = true;
    this.http.get(this.configService.getURL('connection'), this.configService.getHTTPHeaders())
      .subscribe(
        (data: OctoprintConnectionAPI) => {
          if (data.current.state === 'Closed') {
            this.http.post(this.configService.getURL('connection'), connectPayload, this.configService.getHTTPHeaders())
              .subscribe(
                () => {
                  this.disableStandby();
                },
                () => {
                  this.connecting = false;
                  this.error =
                    'OctoPrint can\'t connect to your printer. Please make sure that the connection works, then come back and try again.';
                });
          } else {
            this.disableStandby();
          }
        },
        (error: HttpErrorResponse) => {
          this.connecting = false;
          this.error = 'There is something really wrong, OctoDash can\'t get a response from OctoPrint. Please check your setup!';
        });
    const connectPayload: ConnectCommand = {
      command: 'connect',
      save: false
    };
  }

  disableStandby() {
    setTimeout(() => {
      this.connecting = false;
      if (this.configService.getAutomaticScreenSleep()) {
        this.service.turnDisplayOn();
      }
      this.notificationService.enableNotifications();
      this.router.navigate(['/main-screen']);
    }, 2000);
  }
}

interface ConnectCommand {
  command: string;
  port?: string;
  baudrate?: number;
  printerProfile?: string;
  save?: boolean;
  autoconnect?: boolean;
}
