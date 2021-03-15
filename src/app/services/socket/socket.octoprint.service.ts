import { Injectable } from '@angular/core';
import _ from 'lodash-es';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { ConversionService } from 'src/app/conversion.service';
import { DisplayLayerProgressData } from 'src/app/model/octoprint/plugins/display-layer-progress.model';

import { ConfigService } from '../../config/config.service';
import { JobStatus, PrinterStatus, SocketAuth } from '../../model';
import { OctoprintFilament, OctoprintPluginMessage, OctoprintSocketCurrent } from '../../model/octoprint/socket.model';
import { SystemService } from '../system/system.service';
import { SocketService } from './socket.service';

@Injectable()
export class OctoPrintSocketService implements SocketService {
  private fastInterval = 0;
  private socket: WebSocketSubject<unknown>;

  private printerStatusSubject: Subject<PrinterStatus>;
  private jobStatusSubject: Subject<JobStatus>;

  private printerStatus: PrinterStatus;
  private jobStatus: JobStatus;

  public constructor(
    private configService: ConfigService,
    private systemService: SystemService,
    private conversionService: ConversionService,
  ) {
    this.printerStatusSubject = new ReplaySubject<PrinterStatus>();
    this.jobStatusSubject = new ReplaySubject<JobStatus>();
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

    this.jobStatus = {
      file: null,
      thumbnail: null,
      progress: 0,
      zHeight: null,
      filamentAmount: 0,
      timePrinted: null,
      timeLeft: null,
      estimatedPrintTime: null,
      estimatedEndTime: null,
    };

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
        this.extractJobStatus(message as OctoprintSocketCurrent);
        console.log(message);
      } else if (Object.hasOwnProperty.bind(message)('event')) {
        // console.log('EVENT RECEIVED');
        // console.log(message);
      } else if (Object.hasOwnProperty.bind(message)('plugin')) {
        const pluginMessage = message as OctoprintPluginMessage;
        if (
          pluginMessage.plugin.plugin === 'DisplayLayerProgress-websocket-payload' &&
          this.configService.isDisplayLayerProgressEnabled()
        ) {
          this.extractFanSpeed(pluginMessage.plugin.data as DisplayLayerProgressData);
          this.extractLayerHeight(pluginMessage.plugin.data as DisplayLayerProgressData);
        }
      } else if (Object.hasOwnProperty.bind(message)('reauth')) {
        console.log('REAUTH REQUIRED');
      } else if (Object.hasOwnProperty.bind(message)('connected')) {
        console.log('CONNECTED RECEIVED');
        resolve();
      }
    });
  }

  //==== Printer Status ====//

  public extractPrinterStatus(message: OctoprintSocketCurrent): void {
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
    }
    this.printerStatus.status = message.current.state.text.toLowerCase();

    this.printerStatusSubject.next(this.printerStatus);
  }

  public extractFanSpeed(message: DisplayLayerProgressData): void {
    this.printerStatus.fanSpeed = Number(message.fanspeed.replace('%', '').trim());
  }

  //==== Job Status ====//

  public extractJobStatus(message: OctoprintSocketCurrent): void {
    this.jobStatus.file = message.current.job.file.display.replace('.gcode', '').replace('.ufp', '');
    this.jobStatus.thumbnail = null; //TODO
    this.jobStatus.progress = Math.round(message.current.progress.completion);
    this.jobStatus.timePrinted = {
      value: this.conversionService.convertSecondsToHours(message.current.progress.printTime),
      unit: 'h',
    };

    if (message.current.job.filament) {
      this.jobStatus.filamentAmount = this.getTotalFilamentWeight(message.current.job.filament);
    }

    if (message.current.progress.printTimeLeft) {
      this.jobStatus.timeLeft = {
        value: this.conversionService.convertSecondsToHours(message.current.progress.printTimeLeft),
        unit: 'h',
      };
      this.jobStatus.estimatedEndTime = this.calculateEndTime(message.current.progress.printTimeLeft);
    }

    if (message.current.job.estimatedPrintTime) {
      this.jobStatus.estimatedPrintTime = {
        value: this.conversionService.convertSecondsToHours(message.current.job.estimatedPrintTime),
        unit: 'h',
      };
    }

    if (!this.configService.isDisplayLayerProgressEnabled() && message.current.currentZ) {
      this.jobStatus.zHeight = message.current.currentZ;
    }

    this.jobStatusSubject.next(this.jobStatus);
  }

  private getTotalFilamentWeight(filament: OctoprintFilament) {
    let filamentLength = 0;
    _.forEach(filament, (tool): void => {
      filamentLength += tool.length;
    });
    return this.conversionService.convertFilamentLengthToWeight(filamentLength);
  }

  private calculateEndTime(printTimeLeft: number) {
    const date = new Date();
    date.setSeconds(date.getSeconds() + printTimeLeft);
    return `${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}`;
  }

  public extractLayerHeight(message: DisplayLayerProgressData): void {
    this.jobStatus.zHeight = {
      current: Number(message.currentLayer),
      total: Number(message.totalLayer),
    };
  }

  //==== Subscribables ====//

  public getPrinterStatusSubscribable(): Observable<PrinterStatus> {
    return this.printerStatusSubject.pipe(startWith(this.printerStatus));
  }

  public getJobStatusSubscribable(): Observable<JobStatus> {
    return this.jobStatusSubject.pipe(startWith(this.jobStatus));
  }
}
