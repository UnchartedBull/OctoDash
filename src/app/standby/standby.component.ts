import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../config/config.service';
import { Subscription } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-standby',
  templateUrl: './standby.component.html',
  styleUrls: ['./standby.component.scss']
})
export class StandbyComponent implements OnInit {

  connecting = false;
  error = '';
  httpPOSTRequest: Subscription;

  constructor(private configService: ConfigService, private http: HttpClient, private router: Router) { }

  ngOnInit() {
  }

  reconnect() {
    this.connecting = true;
    if (this.httpPOSTRequest) {
      this.httpPOSTRequest.unsubscribe();
    }
    const connectPayload: ConnectCommand = {
      command: 'connect',
      save: false
    };
    this.httpPOSTRequest = this.http.post(this.configService.getURL('connection'), connectPayload, this.configService.getHTTPHeaders())
      .subscribe(
        () => {
          setTimeout(() => {
            this.connecting = false;
            this.router.navigate(['/main-screen']);
          }, 4000);
        },
        () => {
          this.connecting = false;
          this.error =
            'OctoPrint can\'t connect to your printer. Please make sure that the connection works, then come back and try again.';
        }
      );
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
