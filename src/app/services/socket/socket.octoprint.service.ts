import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { DisplayLayerProgressData } from 'src/app/model/octoprint/plugins/display-layer-progress.model';

import { ConfigService } from '../../config/config.service';
import { SocketAuth, Temperatures } from '../../model';
import { OctoprintPluginMessage, OctoprintSocketCurrent } from '../../model/octoprint/socket.model';
import { SystemService } from '../system/system.service';
import { SocketService } from './socket.service';

@Injectable()
export class OctoPrintSocketService implements SocketService {
  private fastInterval = 0;
  private socket: WebSocketSubject<unknown>;

  private temperatureSubject: Subject<Temperatures>;
  private printerStatusSubject: Subject<string>;
  private fanSpeedSubject: Subject<number>;

  public constructor(private configService: ConfigService, private systemService: SystemService) {
    this.temperatureSubject = new ReplaySubject<Temperatures>();
    this.printerStatusSubject = new ReplaySubject<string>();
    this.fanSpeedSubject = new ReplaySubject<number>();
  }

  //==== SETUP & AUTH ====//

  public connect(): Promise<void> {
    return new Promise(resolve => {
      this.systemService.getSessionKey().subscribe(
        socketAuth => {
          this.connectSocket();
          this.setupSocket(resolve);
          this.authenticateSocket(socketAuth);
        },
        () => {
          setTimeout(this.connect.bind(this), this.fastInterval < 6 ? 5000 : 15000);
          this.fastInterval += 1;
        },
      );
    });
  }

  private connectSocket() {
    const url = `${this.configService.getApiURL('sockjs/websocket', false).replace(/^http/, 'ws')}`;
    if (!this.socket) {
      this.socket = webSocket(url);
    }
  }

  private authenticateSocket(socketAuth: SocketAuth) {
    const payload = {
      auth: `${socketAuth.user}:${socketAuth.session}`,
    };
    this.socket.next(payload);
  }

  private setupSocket(resolve: () => void) {
    this.socket.subscribe(message => {
      if (Object.hasOwnProperty.bind(message)('current')) {
        this.extractTemperature(message as OctoprintSocketCurrent);
        this.extractPrinterStatus(message as OctoprintSocketCurrent);
      } else if (Object.hasOwnProperty.bind(message)('event')) {
        console.log('EVENT RECEIVED');
        console.log(message);
      } else if (Object.hasOwnProperty.bind(message)('plugin')) {
        const pluginMessage = message as OctoprintPluginMessage;
        if (pluginMessage.plugin.plugin === 'DisplayLayerProgress-websocket-payload') {
          this.extractFanSpeed(pluginMessage.plugin.data as DisplayLayerProgressData);
        } else {
          console.log('UNKOWN PLUGIN RECEIVED');
          console.log(message);
        }
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

  //==== Printer State ====//

  public extractTemperature(message: OctoprintSocketCurrent): void {
    if (message.current.temps[0]) {
      this.temperatureSubject.next({
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
    this.printerStatusSubject.next(message.current.state.text.toLowerCase());
  }

  public extractFanSpeed(message: DisplayLayerProgressData): void {
    this.fanSpeedSubject.next(Number(message.fanspeed.replace('%', '').trim()));
  }

  //==== Subscribables ====//

  public getTemperatureSubscribable(): Observable<Temperatures> {
    return this.temperatureSubject.pipe(
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
    return this.printerStatusSubject.pipe(startWith('connecting ...'));
  }

  getZIndicatorSubscribable(): Observable<string> {
    throw new Error('Method not implemented.');
  }

  getFanSpeedSubscribable(): Observable<number> {
    return this.fanSpeedSubject.pipe(startWith(this.configService.isDisplayLayerProgressEnabled() ? 0 : -1));
  }
}
