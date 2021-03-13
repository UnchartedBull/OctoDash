import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { DisplayLayerProgressData } from 'src/app/model/octoprint/plugins/display-layer-progress.model';

import { ConfigService } from '../../config/config.service';
import { JobStatus, PrinterStatus, SocketAuth } from '../../model';
import { OctoprintPluginMessage, OctoprintSocketCurrent } from '../../model/octoprint/socket.model';
import { SystemService } from '../system/system.service';
import { SocketService } from './socket.service';

@Injectable()
export class OctoPrintSocketService implements SocketService {
  private fastInterval = 0;
  private socket: WebSocketSubject<unknown>;

  private printerStatusSubject: Subject<PrinterStatus>;
  private jobSubject: Subject<JobStatus>;

  private printerStatus: PrinterStatus;

  public constructor(private configService: ConfigService, private systemService: SystemService) {
    this.printerStatusSubject = new ReplaySubject<PrinterStatus>();
    this.jobSubject = new ReplaySubject<JobStatus>();
  }

  //==== SETUP & AUTH ====//

  public connect(): Promise<void> {
    this.printerStatus = {
      status: 'connecting ...',
      bed: {
        current: 0,
        set: 0,
        unit: '°C',
      },
      tool0: {
        current: 0,
        set: 0,
        unit: '°C',
      },
      fanSpeed: this.configService.isDisplayLayerProgressEnabled() ? 0 : -1,
    } as PrinterStatus;

    return new Promise(resolve => {
      this.tryConnect(resolve);
    });
  }

  private tryConnect(resolve: () => void): void {
    this.systemService.getSessionKey().subscribe(
      socketAuth => {
        this.connectSocket();
        this.setupSocket(resolve);
        this.authenticateSocket(socketAuth);
      },
      () => {
        setTimeout(this.tryConnect.bind(this), this.fastInterval < 6 ? 5000 : 15000, resolve);
        this.fastInterval += 1;
      },
    );
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

  public extractPrinterStatus(message: OctoprintSocketCurrent): void {
    let hasChanged = false;
    if (message.current.temps[0]) {
      this.printerStatus.bed = {
        current: Math.round(message.current.temps[0].bed.actual),
        set: Math.round(message.current.temps[0].bed.target),
        unit: '°C',
      };
      this.printerStatus.tool0 = {
        current: Math.round(message.current.temps[0].tool0.actual),
        set: Math.round(message.current.temps[0].tool0.target),
        unit: '°C',
      };
      hasChanged = true;
    }
    if (this.printerStatus.status !== message.current.state.text.toLowerCase()) {
      this.printerStatus.status = message.current.state.text.toLowerCase();
      hasChanged = true;
    }

    if (hasChanged) {
      this.printerStatusSubject.next(this.printerStatus);
    }
  }

  public extractFanSpeed(message: DisplayLayerProgressData): void {
    this.printerStatus.fanSpeed = Number(message.fanspeed.replace('%', '').trim());
  }

  //==== Subscribables ====//

  public getPrinterStatusSubscribable(): Observable<PrinterStatus> {
    return this.printerStatusSubject.pipe(startWith(this.printerStatus));
  }

  public getJobStatusSubscribable(): Observable<JobStatus> {
    throw new Error('Method not implemented.');
  }
}
