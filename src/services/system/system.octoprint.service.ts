import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { NotificationType, SocketAuth, TestAddress } from '../../model';
import { ConnectCommand, OctoprintLogin } from '../../model/octoprint';
import { ConfigService } from '../../services/config.service';
import { NotificationService } from '../../services/notification.service';
import { SystemService } from './system.service';

@Injectable()
export class SystemOctoprintService implements SystemService {
  constructor(
    private configService: ConfigService,
    private notificationService: NotificationService,
    private http: HttpClient,
  ) {}

  public getSessionKey(): Observable<SocketAuth> {
    return this.http
      .post<OctoprintLogin>(
        this.configService.getApiURL('login'),
        { passive: true },
        this.configService.getHTTPHeaders(),
      )
      .pipe(
        map(octoprintLogin => {
          return {
            user: octoprintLogin.name,
            session: octoprintLogin.session,
          } as SocketAuth;
        }),
      );
  }

  public sendCommand(command: string): void {
    this.http
      .post(this.configService.getApiURL(`system/commands/core/${command}`), null, this.configService.getHTTPHeaders())
      .pipe(
        catchError(error => {
          this.notificationService.error($localize`:@@error-execute:Can't execute ${command} command!`, error.message);
          return of(error);
        }),
      )
      .subscribe();
  }

  public connectPrinter(): void {
    const payload: ConnectCommand = {
      command: 'connect',
      save: false,
    };

    this.http
      .post(this.configService.getApiURL('connection'), payload, this.configService.getHTTPHeaders())
      .pipe(
        catchError(error => {
          this.notificationService.warn($localize`:@@error-connect:Can't connect to printer!`, error.message, true);
          return of(error);
        }),
      )
      .subscribe();
  }

  public getLocalIpAddress() {
    const payload = {
      command: 'address',
    };

    return this.http
      .post<TestAddress>(this.configService.getApiURL('util/test'), payload, this.configService.getHTTPHeaders())
      .pipe(map(result => (result?.is_lan_address && result?.address ? result.address : null)));
  }
}
