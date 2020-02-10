import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ConfigService } from './config/config.service';
import { Observable, Observer, timer, Subscription } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { OctoprintPrinterStatusAPI } from './octoprint-api/printerStatusAPI';
import { NotificationService } from './notification/notification.service';
import { OctoprintConnectionAPI } from './octoprint-api/connectionAPI';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PrinterService {

  httpGETRequest: Subscription;
  httpPOSTRequest: Subscription;
  observable: Observable<PrinterStatusAPI>;

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private notificationService: NotificationService,
    private router: Router) {
    this.observable = new Observable((observer: Observer<PrinterStatusAPI>) => {
      timer(500, this.configService.getAPIPollingInterval()).subscribe(_ => {
        if (this.httpGETRequest) {
          this.httpGETRequest.unsubscribe();
        }
        this.httpGETRequest = this.http.get(this.configService.getURL('printer'), this.configService.getHTTPHeaders()).subscribe(
          (data: OctoprintPrinterStatusAPI) => {
            const printerStatus: PrinterStatusAPI = {
              status: data.state.text.toLowerCase(),
              nozzle: {
                current: Math.round(data.temperature.tool0.actual),
                set: Math.round(data.temperature.tool0.target)
              },
              heatbed: {
                current: data.temperature.bed ? Math.round(data.temperature.bed.actual) : 0,
                set: data.temperature.bed ? Math.round(data.temperature.bed.target) : 0
              }
            };
            observer.next(printerStatus);
          }, (error: HttpErrorResponse) => {
            if (error.status === 409) {
              this.isPrinterOffline().then((printerOffline) => {
                if (printerOffline) {
                  this.router.navigate(['/standby']);
                  this.notificationService.disableNotifications();
                } else {
                  this.notificationService.setError('Can\'t retrieve printer status!', error.message);
                }
              });
            } else {
              const printerStatus: PrinterStatusAPI = {
                status: `error (${error.status})`,
                nozzle: {
                  current: 0,
                  set: 0
                },
                heatbed: {
                  current: 0,
                  set: 0
                }
              };
              observer.next(printerStatus);
              this.notificationService.setError('Can\'t retrieve printer status!', error.message);
            }
          });
      });
    }).pipe(shareReplay(1));
  }

  public getObservable(): Observable<PrinterStatusAPI> {
    return this.observable;
  }

  public jog(x: number, y: number, z: number) {
    const jogPayload: JogCommand = {
      command: 'jog',
      x,
      y,
      z,
      speed: z !== 0 ? this.configService.getZSpeed() * 60 : this.configService.getXYSpeed() * 60
    };
    this.httpPOSTRequest = this.http.post(this.configService.getURL('printer/printhead'), jogPayload, this.configService.getHTTPHeaders())
      .subscribe(
        () => null, (error: HttpErrorResponse) => {
          this.notificationService.setError('Can\'t move Printhead!', error.message);
        }
      );
  }

  public executeGCode(gCode: string) {
    if (this.httpPOSTRequest) {
      this.httpPOSTRequest.unsubscribe();
    }
    const gCodePayload: GCodeCommand = {
      commands: gCode.split('; ')
    };
    this.httpPOSTRequest = this.http.post(this.configService.getURL('printer/command'), gCodePayload, this.configService.getHTTPHeaders())
      .subscribe(
        () => null, (error: HttpErrorResponse) => {
          this.notificationService.setError('Can\'t send GCode!', error.message);
        }
      );
  }

  public setTemperatureHotend(temperature: number) {
    const temperatureHotendCommand: TemperatureHotendCommand = {
      command: 'target',
      targets: {
        tool0: temperature
      }
    };
    this.httpPOSTRequest = this.http.post(this.configService.getURL('printer/tool'), temperatureHotendCommand,
      this.configService.getHTTPHeaders())
      .subscribe(
        () => null, (error: HttpErrorResponse) => {
          this.notificationService.setError('Can\'t set Hotend Temperature!', error.message);
        }
      );
  }

  public setTemperatureHeatbed(temperature: number) {
    const temperatureHeatbedCommand: TemperatureHeatbedCommand = {
      command: 'target',
      target: temperature
    };
    this.httpPOSTRequest = this.http.post(this.configService.getURL('printer/bed'), temperatureHeatbedCommand,
      this.configService.getHTTPHeaders())
      .subscribe(
        () => null, (error: HttpErrorResponse) => {
          this.notificationService.setError('Can\'t set Heatbed Temperature!', error.message);
        }
      );
  }

  public setFeedrate(feedrate: number) {
    if (feedrate === 100) { return; }
    const feedrateCommand: FeedrateCommand = {
      command: 'feedrate',
      factor: feedrate
    };
    this.httpPOSTRequest = this.http.post(this.configService.getURL('printer/printhead'), feedrateCommand,
      this.configService.getHTTPHeaders())
      .subscribe(
        () => null, (error: HttpErrorResponse) => {
          this.notificationService.setError('Can\'t set Feedrate!', error.message);
        }
      );
  }

  public setFlowrate(flowrate: number) {
    if (flowrate === 100) { return; }
    const flowrateCommand: FeedrateCommand = {
      command: 'flowrate',
      factor: flowrate
    };
    this.httpPOSTRequest = this.http.post(this.configService.getURL('printer/tool'), flowrateCommand,
      this.configService.getHTTPHeaders())
      .subscribe(
        () => null, (error: HttpErrorResponse) => {
          this.notificationService.setError('Can\'t set Flowrate!', error.message);
        }
      );
  }

  public isPrinterOffline(): Promise<boolean> {
    return new Promise((resolve) => {
      this.http.get(this.configService.getURL('connection'), this.configService.getHTTPHeaders())
        .subscribe(
          (data: OctoprintConnectionAPI) => {
            resolve(data.current.state === 'Closed');
          },
          (error: HttpErrorResponse) => {
            this.notificationService.setError('Can\'t retrieve connection state!', error.message);
            resolve(false);
          }
        );
    });
  }
}

export interface PrinterStatusAPI {
  status: string;
  nozzle: PrinterValue;
  heatbed: PrinterValue;
}

export interface PrinterValue {
  current: number;
  set: number;
}

interface JogCommand {
  command: string;
  x: number;
  y: number;
  z: number;
  speed: number;
}

interface GCodeCommand {
  commands: string[];
}

interface FeedrateCommand {
  command: string;
  factor: number;
}

interface TemperatureHotendCommand {
  command: string;
  targets: {
    tool0: number;
    tool1?: number;
  };
}

interface TemperatureHeatbedCommand {
  command: string;
  target: number;
}
