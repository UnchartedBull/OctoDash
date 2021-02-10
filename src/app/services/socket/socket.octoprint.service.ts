import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

import { ConfigService } from '../../config/config.service';
import { Temperatures } from '../../model';
import { OctoprintSocketCurrent } from '../../model/octoprint/socket.model';
import { AuthService, SocketAuth } from '../auth/octoprint.auth.service';
import { SocketService } from './socket.service';

@Injectable()
export class OctoPrintSocketService implements SocketService {
  private _fastInterval = 0;
  private _socket: WebSocketSubject<unknown>;
  private _temperatureSubject: Subject<Temperatures>;
  private _printerStatusSubject: Subject<string>;

  public constructor(private _configService: ConfigService, private _authService: AuthService) {
    this._temperatureSubject = new Subject<Temperatures>();
    this._printerStatusSubject = new Subject<string>();
  }

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
        this.extractTemperature(message as OctoprintSocketCurrent);
        this.extractPrinterStatus(message as OctoprintSocketCurrent);
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

  public extractTemperature(message: OctoprintSocketCurrent): void {
    if (message.current.temps[0]) {
      this._temperatureSubject.next({
        bed: {
          current: Math.round(message.current.temps[0].bed.actual),
          set: Math.round(message.current.temps[0].bed.target),
        },
        tool0: {
          current: Math.round(message.current.temps[0].tool0.actual),
          set: Math.round(message.current.temps[0].tool0.target),
        },
      });
    }
  }

  public extractPrinterStatus(message: OctoprintSocketCurrent): void {
    this._printerStatusSubject.next(message.current.state.text.toLowerCase());
  }

  public getTemperatureSubscribable(): Observable<Temperatures> {
    return this._temperatureSubject.pipe(
      startWith({
        tool0: {
          current: 0,
          set: 0,
        },
        bed: {
          current: 0,
          set: 0,
        },
      } as Temperatures),
    );
  }

  public getPrinterStatusSubscribable(): Observable<string> {
    return this._printerStatusSubject.pipe(startWith('connecting ...'));
  }
}
