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

  public connect(): Promise<void> {
    return new Promise(resolve => {
      this._authService
        .getSessionKey(this._configService.getApiURL('login'), this._configService.getHTTPHeaders())
        .subscribe(
          socketAuth => {
            this.connectSocket();
            this.setupSocket(resolve);
            this.authenticateSocket(socketAuth);
          },
          () => {
            setTimeout(this.connect.bind(this), this._fastInterval < 6 ? 5000 : 15000);
            this._fastInterval += 1;
          },
        );
    });
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

  private setupSocket(resolve: () => void) {
    this._socket.subscribe(message => {
      if (Object.hasOwnProperty.bind(message)('current')) {
        console.log('CURRENT RECEIVED');
      } else if (Object.hasOwnProperty.bind(message)('event')) {
        console.log('EVENT RECEIVED');
      } else if (Object.hasOwnProperty.bind(message)('plugin')) {
        console.log('PLUGIN RECEIVED');
      } else if (Object.hasOwnProperty.bind(message)('history')) {
        console.log('HISTORY RECEIVED');
      } else if (Object.hasOwnProperty.bind(message)('reauth')) {
        console.log('REAUTH REQUIRED');
      } else if (Object.hasOwnProperty.bind(message)('connected')) {
        console.log('CONNECTED RECEIVED');
        resolve();
      } else {
        console.log('UNKNOWN MESSAGE');
        console.log(message);
      }
    });
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
