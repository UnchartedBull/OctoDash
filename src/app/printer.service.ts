import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ConfigService } from './config/config.service';
import { Observable, Observer, timer, Subscription } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { OctoprintPrinterStatusAPI } from './octoprint-api/printerStatusAPI';
import { ErrorService } from './error/error.service';

@Injectable({
  providedIn: 'root'
})
export class PrinterService {

  httpGETRequest: Subscription;
  httpPOSTRequest: Subscription;
  observable: Observable<PrinterStatusAPI>;

  constructor(private http: HttpClient, private configService: ConfigService, private errorService: ErrorService) {
    this.observable = new Observable((observer: Observer<any>) => {
      timer(500, this.configService.getAPIInterval()).subscribe(_ => {
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
                current: Math.round(data.temperature.bed.actual),
                set: Math.round(data.temperature.bed.target)
              }
            };
            observer.next(printerStatus);
          }, (error: HttpErrorResponse) => {
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
            this.errorService.setError('Can\'t retrieve printer status!', error.message);
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
          this.errorService.setError('Can\'t move Printhead!', error.message);
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
          this.errorService.setError('Can\'t send GCode!', error.message);
        }
      );
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
