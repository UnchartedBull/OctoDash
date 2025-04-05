import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { compare } from 'compare-versions';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { PrinterProfile } from '../../model';
import {
  DisconnectCommand,
  ExtrudeCommand,
  FeedrateCommand,
  GCodeCommand,
  JogCommand,
  OctoprintPrinterProfiles,
  OctoprintVersionInfo,
  TemperatureHeatbedCommand,
  TemperatureHotendCommand,
  ToolCommand,
} from '../../model/octoprint';
import { ConfigService } from '../../services/config.service';
import { NotificationService } from '../../services/notification.service';
import { PrinterService } from './printer.service';

export const minimumVersion = '1.9.0';

export function isOctoprintVersionGood(version) {
  version = version.replace(/(?<!-)rc/, '-rc').replace('.dev', '-dev');
  return compare(minimumVersion, version, '<=');
}

@Injectable()
export class PrinterOctoprintService implements PrinterService {
  public constructor(
    private configService: ConfigService,
    private notificationService: NotificationService,
    private http: HttpClient,
  ) {
    this.http
      .get<OctoprintVersionInfo>(this.configService.getApiURL('version'), this.configService.getHTTPHeaders())
      .pipe(
        map(info => {
          if (!isOctoprintVersionGood(info.server)) {
            this.notificationService.error(
              $localize`:@@octoprint-upgrade-required-title:OctoPrint outdated!`,
              $localize`:@@octoprint-upgrade-required-long:OctoPrint must be running at least ${minimumVersion}; currently running ${info.server}.`,
            );
          }
        }),
      )
      .subscribe();
  }

  public getActiveProfile(): Observable<PrinterProfile> {
    return this.http
      .get<OctoprintPrinterProfiles>(
        this.configService.getApiURL('printerprofiles'),
        this.configService.getHTTPHeaders(),
      )
      .pipe(
        map(profiles => {
          for (const profile of Object.values(profiles.profiles)) {
            if (profile.current) return profile;
          }
        }),
      );
  }

  saveToEPROM(): void {
    this.executeGCode('M500');
  }

  public executeGCode(gCode: string): void {
    const gCodePayload: GCodeCommand = {
      commands: gCode.split('; '),
    };
    this.http
      .post(this.configService.getApiURL('printer/command'), gCodePayload, this.configService.getHTTPHeaders())
      .pipe(
        catchError(error => {
          this.notificationService.error($localize`:@@printer-error-gcode:Can't send GCode!`, error.message);
          return of(null);
        }),
      )
      .subscribe();
  }

  public jog(x: number, y: number, z: number): void {
    const jogPayload: JogCommand = {
      command: 'jog',
      x: this.configService.isXAxisInverted() ? x * -1 : x,
      y: this.configService.isYAxisInverted() ? y * -1 : y,
      z: this.configService.isZAxisInverted() ? z * -1 : z,
      speed: z !== 0 ? this.configService.getZSpeed() * 60 : this.configService.getXYSpeed() * 60,
    };
    this.http
      .post(this.configService.getApiURL('printer/printhead'), jogPayload, this.configService.getHTTPHeaders())
      .pipe(
        catchError(error => {
          this.notificationService.error($localize`:@@error-printer-head:Can't move Printhead!`, error.message);
          return of(null);
        }),
      )
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
      .pipe(
        catchError(error => {
          this.notificationService.error($localize`:@@error-printer-extrude:Can't extrude Filament!`, error.message);
          return of(null);
        }),
      )
      .subscribe();
  }

  public setTool(tool: number): void {
    const toolPayload: ToolCommand = {
      command: 'select',
      tool: `tool${tool}`,
    };
    this.http
      .post(this.configService.getApiURL('printer/tool'), toolPayload, this.configService.getHTTPHeaders())
      .pipe(
        catchError(error => {
          this.notificationService.error($localize`:@@error-printer-set-tool:Can't set active tool!`, error.message);
          return of(null);
        }),
      )
      .subscribe();
  }

  public setTemperatureHotend(temperature: number, tool?: number): void {
    const temperatureHotendCommand: TemperatureHotendCommand = {
      command: 'target',
      targets: {
        [`tool${tool || 0}`]: temperature,
      },
    };
    this.http
      .post(this.configService.getApiURL('printer/tool'), temperatureHotendCommand, this.configService.getHTTPHeaders())
      .pipe(
        catchError(error => {
          this.notificationService.error(
            $localize`:@@error-printer-hotend:Can't set Hotend Temperature!`,
            error.message,
          );
          return of(null);
        }),
      )
      .subscribe();
  }

  public setTemperatureBed(temperature: number): void {
    const temperatureHeatbedCommand: TemperatureHeatbedCommand = {
      command: 'target',
      target: temperature,
    };
    this.http
      .post(this.configService.getApiURL('printer/bed'), temperatureHeatbedCommand, this.configService.getHTTPHeaders())
      .pipe(
        catchError(error => {
          this.notificationService.error($localize`:@@error-printer-bed:Can't set Bed Temperature!`, error.message);
          return of(null);
        }),
      )
      .subscribe();
  }

  public setFeedrate(feedrate: number): void {
    const feedrateCommand: FeedrateCommand = {
      command: 'feedrate',
      factor: feedrate,
    };
    this.http
      .post(this.configService.getApiURL('printer/printhead'), feedrateCommand, this.configService.getHTTPHeaders())
      .pipe(
        catchError(error => {
          this.notificationService.error($localize`:@@error-printer-feedrate:Can't set Feedrate!`, error.message);
          return of(null);
        }),
      )
      .subscribe();
  }

  public setFlowrate(flowrate: number): void {
    const flowrateCommand: FeedrateCommand = {
      command: 'flowrate',
      factor: flowrate,
    };
    this.http
      .post(this.configService.getApiURL('printer/tool'), flowrateCommand, this.configService.getHTTPHeaders())
      .pipe(
        catchError(error => {
          this.notificationService.error($localize`:@@error-printer-flowrate:Can't set Flowrate!`, error.message);
          return of(null);
        }),
      )
      .subscribe();
  }

  public disconnectPrinter(): void {
    const disconnectPayload: DisconnectCommand = {
      command: 'disconnect',
    };
    this.http
      .post(this.configService.getApiURL('connection'), disconnectPayload, this.configService.getHTTPHeaders())
      .pipe(
        catchError(error => {
          this.notificationService.error(
            $localize`:@@error-printer-disconnect:Can't disconnect Printer!`,
            error.message,
          );
          return of(null);
        }),
      )
      .subscribe();
  }

  public extrude(amount: number, speed: number, tool?: number): void {
    let multiplier = 1;
    let toBeExtruded: number;
    if (amount < 0) {
      multiplier = -1;
      toBeExtruded = amount * -1;
    } else {
      toBeExtruded = amount;
    }

    if (tool) {
      const selectionPayload = {
        command: 'select',
        tool: `tool${tool}`,
      };
      this.http
        .post(this.configService.getApiURL('printer/tool'), selectionPayload, this.configService.getHTTPHeaders())
        .pipe(
          catchError(error => {
            this.notificationService.error($localize`:@@error-printer-extrude:Can't extrude Filament!`, error.message);
            return of(null);
          }),
        )
        .subscribe();
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
