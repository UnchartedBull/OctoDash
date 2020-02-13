import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AppService } from '../app.service';
import { ConfigService } from '../config/config.service';
import { NotificationService } from '../notification/notification.service';
import { OctoprintConnectionAPI } from '../octoprint-api/connectionAPI';
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

    constructor(
        private configService: ConfigService,
        private http: HttpClient,
        private router: Router,
        private service: AppService,
        private notificationService: NotificationService,
        private psuControlService: PsuControlService,
    ) {}

    ngOnInit() {
        if (this.configService.getAutomaticScreenSleep()) {
            setTimeout(this.service.turnDisplayOff.bind(this.service), 300000);
        }
    }

    public reconnect() {
        this.connecting = true;
        if (this.configService.turnOnPSUWhenExitingSleep()) {
            this.psuControlService.changePSUState(true);
            setTimeout(this.checkConnection.bind(this), 5000);
        } else {
            this.checkConnection();
        }
    }

    private connectToPrinter() {
        this.http
            .post(this.configService.getURL('connection'), connectPayload, this.configService.getHTTPHeaders())
            .subscribe(
                () => {
                    setTimeout(this.checkConnection.bind(this), 3000);
                },
                () => {
                    this.setConnectionError();
                },
            );
    }

    private checkConnection() {
        this.http.get(this.configService.getURL('connection'), this.configService.getHTTPHeaders()).subscribe(
            (data: OctoprintConnectionAPI) => {
                if (data.current.state !== 'Operational') {
                    if (this.connectionRetries === 0) {
                        this.connectionRetries = 3;
                        this.setConnectionError();
                    } else {
                        this.connectionRetries--;
                        setTimeout(this.connectToPrinter.bind(this), 500);
                    }
                } else {
                    this.disableStandby();
                }
            },
            (error: HttpErrorResponse) => {
                this.connecting = false;
                this.error =
                    "There is something really wrong, OctoDash can't get a response from OctoPrint. Please check your setup!";
            },
        );
    }

    private setConnectionError() {
        this.connecting = false;
        this.error =
            "OctoPrint can't connect to your printer. Please make sure that the connection works, then come back and try again.";
    }

    private disableStandby() {
        setTimeout(() => {
            this.connecting = false;
            if (this.configService.getAutomaticScreenSleep()) {
                this.service.turnDisplayOn();
            }
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
