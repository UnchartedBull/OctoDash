/* eslint-disable camelcase */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import _ from 'lodash-es';
import { Observable, of, ReplaySubject, Subject } from 'rxjs';
import { pluck, startWith } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

import { ConfigService } from '../../config/config.service';
import { ConversionService } from '../../conversion.service';
import { JobStatus, Notification, NotificationType, PrinterEvent, PrinterState, PrinterStatus } from '../../model';
import {
  DisplayLayerProgressData,
  OctoprintFilament,
  OctoprintSocketCurrent,
  OctoprintSocketEvent,
} from '../../model/octoprint';
import { NotificationService } from '../../notification/notification.service';
import { SystemService } from '../system/system.service';
import { SocketService } from './socket.service';

@Injectable()
export class MoonrakerService implements SocketService {
  private fastInterval = 0;
  private socketDeadTimeout: ReturnType<typeof setTimeout>;
  private socket: WebSocketSubject<unknown>;
  private socketConnected = false;
  private socketId?: number;

  private printerStatusSubject: Subject<PrinterStatus>;
  private jobStatusSubject: Subject<JobStatus>;
  private eventSubject: Subject<PrinterEvent>;

  private printerStatus: PrinterStatus;
  private jobStatus: JobStatus;
  private lastState: PrinterEvent;

  public constructor(
    private configService: ConfigService,
    private systemService: SystemService,
    private conversionService: ConversionService,
    private notificationService: NotificationService,
    private http: HttpClient,
  ) {
    this.printerStatusSubject = new ReplaySubject<PrinterStatus>(1);
    this.jobStatusSubject = new Subject<JobStatus>();
    this.eventSubject = new ReplaySubject<PrinterEvent>();
  }

  //==== SETUP & AUTH ====//

  public connect(): Promise<void> {
    console.log('KLIPPER SOCKET');
    this.initPrinterStatus();
    this.initJobStatus();
    this.lastState = PrinterEvent.UNKNOWN;

    return new Promise(resolve => {
      this.tryConnect(resolve);
    });
  }

  private initPrinterStatus(): void {
    this.printerStatus = {
      status: PrinterState.connecting,
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
      fanSpeed: 0,
    } as PrinterStatus;
    this.printerStatusSubject.next(this.printerStatus);
  }

  private initJobStatus(): void {
    this.jobStatus = {
      file: null,
      fullPath: null,
      progress: 0,
      zHeight: { current: 0, total: -1 },
      filamentAmount: 0,
      timePrinted: null,
      timeLeft: {
        value: '---',
        unit: null,
      },
      estimatedPrintTime: null,
      estimatedEndTime: null,
    } as JobStatus;
  }

  private tryConnect(resolve: () => void): void {
    try {
      this.connectSocket();
      this.setupSocket(resolve);
    } catch {
      setTimeout(this.tryConnect.bind(this), this.fastInterval < 6 ? 5000 : 15000, resolve);
      this.fastInterval += 1;
    }
  }

  private connectSocket() {
    const url = `${this.configService.getApiURL('websocket').replace(/^http/, 'ws')}`;
    if (!this.socket) {
      this.socket = webSocket(url);
    }
  }

  private setupSocket(resolve: () => void) {
    this.socket.subscribe({
      next: (message: Message) => {
        if (!this.socketConnected) {
          this.socketConnected = true;

          this.socket.next({
            jsonrpc: '2.0',
            method: 'server.connection.identify',
            params: {
              client_name: 'OctoDash',
              version: '1.0.0',
              type: 'display',
              url: 'https://github.com/UnchartedBull/OctoDash',
            },
            id: 4656,
          });
        }

        if (!this.socketId && isConnectionMessage(message)) {
          this.socketId = message.result.connection_id;

          this.socket.next({
            jsonrpc: '2.0',
            method: 'printer.objects.subscribe',
            params: {
              objects: {
                // gcode_move: ['speed_factor', 'extrude_factor'],
                extruder: ['temperature', 'target'],
                heater_bed: ['temperature', 'target'],
                fan: ['speed'],
                print_stats: ['filename', 'total_duration', 'print_duration', 'state', 'message'],
              },
            },
            id: 5434,
          });
        }

        if (isUpdateConfigMessage(message)) {
          resolve();

          this.extractPrinterStatus(message.result.status);
        }

        clearTimeout(this.socketDeadTimeout);
        this.socketDeadTimeout = setTimeout(() => {
          this.printerStatus.status = PrinterState.socketDead;
          this.printerStatusSubject.next(this.printerStatus);
        }, 30000);
        console.log(message);

        if (isStatusUpdateMessage(message)) {
          this.extractPrinterStatus(message.params[0]);
        }
        // if (Object.hasOwnProperty.bind(message)('current')) {
        //   this.extractPrinterStatus(message as OctoprintSocketCurrent);
        //   this.extractJobStatus(message as OctoprintSocketCurrent);
        // } else if (Object.hasOwnProperty.bind(message)('event')) {
        //   this.extractPrinterEvent(message as OctoprintSocketEvent);
        // } else if (Object.hasOwnProperty.bind(message)('plugin')) {
        //   this.handlePluginMessage(message as OctoprintPluginMessage);
        // } else if (Object.hasOwnProperty.bind(message)('reauthRequired')) {
        //   this.systemService.getSessionKey().subscribe(socketAuth => this.authenticateSocket(socketAuth));
        // } else if (Object.hasOwnProperty.bind(message)('connected')) {
        //   resolve();
        //   this.checkPrinterConnection();
        // }
      },
      error: error => {
        if (error['type'] === 'close') {
          this.printerStatus.status = PrinterState.reconnecting;
          this.printerStatusSubject.next(this.printerStatus);
          this.tryConnect(() => null);
        } else {
          console.error(error);
        }
      },
    });
  }

  // TODO
  private checkPrinterConnection() {
    this.http
      .get(this.configService.getApiURL('connection'), this.configService.getHTTPHeaders())
      .pipe(pluck('current'), pluck('state'))
      .subscribe((state: string) => {
        if (state === 'Closed' || state === 'Error') {
          this.eventSubject.next(PrinterEvent.CLOSED);
        }
      });
  }

  //==== Printer Status ====//

  public extractPrinterStatus(status: MoonrakerStatusUpdate): void {
    if (status.extruder?.temperature != null)
      this.printerStatus.tool0.current = Math.round(status.extruder.temperature);
    if (status.extruder?.target != null) this.printerStatus.tool0.set = Math.round(status.extruder.target);
    if (status.heater_bed?.temperature != null)
      this.printerStatus.bed.current = Math.round(status.heater_bed.temperature);
    if (status.heater_bed?.target != null) this.printerStatus.bed.set = Math.round(status.heater_bed.target);
    if (status.fan?.speed != null) this.printerStatus.fanSpeed = Math.round(status.fan.speed * 100);
    if (status.print_stats?.state) this.printerStatus.status = this.convertPrinterState(status.print_stats.state);

    this.printerStatusSubject.next(this.printerStatus);
  }

  private convertPrinterState(state: string): PrinterState {
    switch (state) {
      case 'standby':
      case 'complete':
      case 'cancelled':
        return PrinterState.operational;
      case 'printing':
        return PrinterState.printing;
      case 'paused':
        return PrinterState.paused;
      case 'error':
        // TODO: should return error, maybe?
        return PrinterState.closed;
    }
  }

  //==== Job Status ====//
  // TODO

  public extractJobStatus(message: OctoprintSocketCurrent): void {
    const file = message?.current?.job?.file?.display?.replace('.gcode', '').replace('.ufp', '');
    if (this.jobStatus.file !== file) {
      this.initJobStatus();
    }

    this.jobStatus.file = file;
    this.jobStatus.fullPath = '/' + message?.current?.job?.file?.origin + '/' + message?.current?.job?.file?.path;
    this.jobStatus.progress = Math.round(message?.current?.progress?.completion);
    this.jobStatus.timePrinted = {
      value: this.conversionService.convertSecondsToHours(message.current.progress.printTime),
      unit: $localize`:@@unit-h-1:h`,
    };

    if (message.current.job.filament) {
      this.jobStatus.filamentAmount = this.getTotalFilamentWeight(message.current.job.filament);
    }

    if (message.current.progress.printTimeLeft) {
      this.jobStatus.timeLeft = {
        value: this.conversionService.convertSecondsToHours(message.current.progress.printTimeLeft),
        unit: $localize`:@@unit-h-2:h`,
      };
      this.jobStatus.estimatedEndTime = this.calculateEndTime(message.current.progress.printTimeLeft);
    }

    if (message.current.job.estimatedPrintTime) {
      this.jobStatus.estimatedPrintTime = {
        value: this.conversionService.convertSecondsToHours(message.current.job.estimatedPrintTime),
        unit: $localize`:@@unit-h-3:h`,
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
      filamentLength += tool?.length;
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
      current: message.currentLayer === '-' ? 0 : Number(message.currentLayer),
      total: message.totalLayer === '-' ? 0 : Number(message.totalLayer),
    };
  }

  //==== Event ====//
  // TODO

  public extractPrinterEvent(state: OctoprintSocketEvent): void {
    let newState: PrinterEvent;

    switch (state.event.type) {
      case 'PrintStarted':
      case 'PrintResumed':
        newState = PrinterEvent.PRINTING;
        break;
      case 'PrintPaused':
        newState = PrinterEvent.PAUSED;
        break;
      case 'PrintFailed':
      case 'PrintDone':
      case 'PrintCancelled':
        newState = PrinterEvent.IDLE;
        break;
      case 'Connected':
        newState = PrinterEvent.CONNECTED;
        break;
      case 'Disconnected':
        newState = PrinterEvent.CLOSED;
        break;
      case 'Error':
        newState = PrinterEvent.CLOSED;
        if (state.event.payload) {
          this.notificationService.setNotification({
            heading: $localize`:@@printer-error:Printer error`,
            text: state.event.payload.error,
            type: NotificationType.ERROR,
            time: new Date(),
            sticky: true,
          } as Notification);
        }
        break;
      default:
        break;
    }

    if (newState !== undefined) {
      this.lastState = newState;
      this.eventSubject.next(newState);
    }
  }

  //==== Subscribables ====//

  public getPrinterStatusSubscribable(): Observable<PrinterStatus> {
    return this.printerStatusSubject.pipe(startWith(this.printerStatus));
  }

  public getJobStatusSubscribable(): Observable<JobStatus> {
    return this.jobStatusSubject.pipe(startWith(this.jobStatus));
  }

  public getEventSubscribable(): Observable<PrinterEvent> {
    return this.eventSubject;
  }

  public getPrinterStatusText(): Observable<string> {
    return of('connecting');
  }
}

function isConnectionMessage(message: Message): message is ConnectionMessage {
  return message.id === 4656;
}

function isUpdateConfigMessage(message: Message): message is UpdateConfigMessage {
  return message.id === 5434;
}

function isStatusUpdateMessage(message: Message): message is StatusUpdateMessage {
  return message.method === 'notify_status_update';
}

interface Message {
  jsonrpc: string;
  method?: string;
  id?: number;
  params?: unknown;
}

interface ConnectionMessage {
  jsonrpc: string;
  id: 4656;
  result: {
    connection_id: number;
  };
}

interface UpdateConfigMessage {
  jsonrpc: string;
  id: 5434;
  result: {
    eventtime: number;
    status: MoonrakerStatusUpdate;
  };
}

interface StatusUpdateMessage {
  jsonrpc: string;
  method: 'notify_status_update';
  params: {
    0: MoonrakerStatusUpdate;
    1: number;
  };
}

interface MoonrakerStatusUpdate {
  extruder?: {
    target?: number;
    temperature?: number;
  };
  fan?: {
    speed?: number;
  };
  heater_bed?: {
    target?: number;
    temperature?: number;
  };
  print_stats?: {
    filename?: string;
    message?: string;
    print_duration?: number;
    total_duration?: number;
    state?: string;
  };
}
