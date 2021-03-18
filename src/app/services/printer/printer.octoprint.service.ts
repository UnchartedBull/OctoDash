import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ConfigService } from '../../config/config.service';
import { PrinterProfile } from '../../model';
import {
  DisconnectCommand,
  ExtrudeCommand,
  FeedrateCommand,
  GCodeCommand,
  JogCommand,
  OctoprintPrinterProfiles,
  TemperatureHeatbedCommand,
  TemperatureHotendCommand,
} from '../../model/octoprint';
import { NotificationService } from '../../notification/notification.service';
import { PrinterService } from './printer.service';

@Injectable()
export class PrinterOctoprintService implements PrinterService {
  public constructor(
    private configService: ConfigService,
    private notificationService: NotificationService,
    private http: HttpClient,
  ) {}

  public getActiveProfile(): Observable<PrinterProfile> {
    return this.http
      .get<OctoprintPrinterProfiles>(
        this.configService.getApiURL('printerprofiles'),
        this.configService.getHTTPHeaders(),
      )
      .pipe(
        map(profiles => {
          for (const [_, profile] of Object.entries(profiles.profiles)) {
            if (profile.current) return profile;
          }
        }),
      );
  }

  public executeGCode(gCode: string): void {
    const gCodePayload: GCodeCommand = {
      commands: gCode.split('; '),
    };
    this.http
      .post(this.configService.getApiURL('printer/command'), gCodePayload, this.configService.getHTTPHeaders())
      .pipe(catchError(error => this.notificationService.setError("Can't send GCode!", error.message)))
      .subscribe();
  }

  public jog(x: number, y: number, z: number): void {
    const jogPayload: JogCommand = {
      command: 'jog',
      x,
      y,
      z,
      speed: z !== 0 ? this.configService.getZSpeed() * 60 : this.configService.getXYSpeed() * 60,
    };
    this.http
      .post(this.configService.getApiURL('printer/printhead'), jogPayload, this.configService.getHTTPHeaders())
      .pipe(catchError(error => this.notificationService.setError("Can't move Printhead!", error.message)))
      .subscribe();
  }

  private moveExtruder(amount: number, speed: number): void {
    const extrudePayload: ExtrudeCommand = {
      command: 'extrude',
      amount,
      speed: speed * 60,
    };
    this.http
      .post(this.configService.getApiURL('printer/tool'), extrudePayload, this.configService.getHTTPHeaders())
      .pipe(catchError(error => this.notificationService.setError("Can't extrude Filament!", error.message)))
      .subscribe();
  }

  public setTemperatureHotend(temperature: number): void {
    const temperatureHotendCommand: TemperatureHotendCommand = {
      command: 'target',
      targets: {
        tool0: temperature,
      },
    };
    this.http
      .post(this.configService.getApiURL('printer/tool'), temperatureHotendCommand, this.configService.getHTTPHeaders())
      .pipe(catchError(error => this.notificationService.setError("Can't set Hotend Temperature!", error.message)))
      .subscribe();
  }

  public setTemperatureBed(temperature: number): void {
    const temperatureHeatbedCommand: TemperatureHeatbedCommand = {
      command: 'target',
      target: temperature,
    };
    this.http
      .post(this.configService.getApiURL('printer/bed'), temperatureHeatbedCommand, this.configService.getHTTPHeaders())
      .pipe(catchError(error => this.notificationService.setError("Can't set Bed Temperature!", error.message)))
      .subscribe();
  }

  public setFeedrate(feedrate: number): void {
    if (feedrate === 100) {
      return;
    }
    const feedrateCommand: FeedrateCommand = {
      command: 'feedrate',
      factor: feedrate,
    };
    this.http
      .post(this.configService.getApiURL('printer/printhead'), feedrateCommand, this.configService.getHTTPHeaders())
      .pipe(catchError(error => this.notificationService.setError("Can't set Feedrate!", error.message)))
      .subscribe();
  }

  public setFlowrate(flowrate: number): void {
    if (flowrate === 100) {
      return;
    }
    const flowrateCommand: FeedrateCommand = {
      command: 'flowrate',
      factor: flowrate,
    };
    this.http
      .post(this.configService.getApiURL('printer/tool'), flowrateCommand, this.configService.getHTTPHeaders())
      .pipe(catchError(error => this.notificationService.setError("Can't set Flowrate!", error.message)))
      .subscribe();
  }

  public disconnectPrinter(): void {
    const disconnectPayload: DisconnectCommand = {
      command: 'disconnect',
    };
    this.http
      .post(this.configService.getApiURL('connection'), disconnectPayload, this.configService.getHTTPHeaders())
      .pipe(catchError(error => this.notificationService.setError("Can't disconnect Printer!", error.message)))
      .subscribe();
  }

  public extrude(amount: number, speed: number): void {
    let multiplier = 1;
    let toBeExtruded: number;
    if (amount < 0) {
      multiplier = -1;
      toBeExtruded = amount * -1;
    } else {
      toBeExtruded = amount;
    }

    while (toBeExtruded > 0) {
      if (toBeExtruded >= 100) {
        toBeExtruded -= 100;
        this.moveExtruder(100 * multiplier, speed);
      } else {
        this.moveExtruder(toBeExtruded * multiplier, speed);
        toBeExtruded = 0;
      }
    }
  }

  public emergencyStop(): void {
    this.executeGCode('M410');
  }

  public setFanSpeed(percentage: number): void {
    this.executeGCode('M106 S' + Math.round((percentage / 100) * 255));
  }
}
