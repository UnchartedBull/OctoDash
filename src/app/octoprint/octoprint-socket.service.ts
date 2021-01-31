import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

import { ConfigService } from '../config/config.service';
import { NotificationService } from '../notification/notification.service';
import { AuthService, SocketAuth } from './auth.service';
import { SocketService } from './socket.service';

@Injectable()
export class OctoPrintSocketService implements SocketService {
  private _fastInterval = 0;
  private _socket: WebSocketSubject<unknown>;

  public constructor(
    private _configService: ConfigService,
    private _authService: AuthService,
    private _notificationService: NotificationService,
  ) {}

  public connect(): void {
    this._authService
      .getSessionKey(this._configService.getApiURL('login'), this._configService.getHTTPHeaders())
      .subscribe(
        socketAuth => {
          this.connectSocket();
          this.authenticateSocket(socketAuth);
          this._socket.subscribe(messages => console.log(messages));
        },
        () => {
          setTimeout(this.connect.bind(this), this._fastInterval < 6 ? 5000 : 15000);
          this._fastInterval += 1;
        },
      );
  }

  private connectSocket() {
    const url = `${this._configService.getApiURL('sockjs/websocket', false).replace(/^http/, 'ws')}`;
    if (!this._socket) {
      this._socket = webSocket(url);
    }
  }

  private authenticateSocket(socketAuth: SocketAuth) {
    const payload = {
      auth: `${socketAuth.user}:${socketAuth.session}`,
    };
    this._socket.next(payload);
  }

  public get temperatureSubscribable(): any {
    console.log('GET TEMPERATURE');
    return null;
  }

  public get zIndicatorSubscribable(): any {
    console.log('GET TEMPERATURE');
    return null;
  }
}
