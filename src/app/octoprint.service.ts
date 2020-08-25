import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';

import { ConfigService } from './config/config.service';
import { NotificationService } from './notification/notification.service';

@Injectable({
  providedIn: 'root',
})
export class OctoprintService {
  private httpPOSTRequest: Subscription;

  public constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private notificationService: NotificationService,
  ) {}

  public disconnectPrinter(): void {
    if (this.httpPOSTRequest) {
      this.httpPOSTRequest.unsubscribe();
    }
    const disconnectPayload: DisconnectCommand = {
      command: 'disconnect',
    };
    this.httpPOSTRequest = this.http
      .post(this.configService.getURL('connection'), disconnectPayload, this.configService.getHTTPHeaders())
      .subscribe(
        (): void => null,
        (error: HttpErrorResponse): void => {
          this.notificationService.setError("Can't disconnect from Printer!", error.message);
        },
      );
  }

  public sendSystemCommand(command: string): void {
    if (this.httpPOSTRequest) {
      this.httpPOSTRequest.unsubscribe();
    }
    this.httpPOSTRequest = this.http
      .post(this.configService.getURL(`system/commands/core/${command}`), null, this.configService.getHTTPHeaders())
      .subscribe(
        (): void => null,
        (error: HttpErrorResponse): void => {
          this.notificationService.setError(`Can't execute ${command} command!`, error.message);
        },
      );
  }
}

interface DisconnectCommand {
  command: string;
}
