import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { ConfigService } from 'src/app/config/config.service';
import { NotificationType, PrinterProfile } from 'src/app/model';
import { NotificationService } from 'src/app/notification/notification.service';

import { PrinterService } from './printer.service';

@Injectable()
export class PrinterMoonrakerService implements PrinterService {
  public constructor(
    private configService: ConfigService,
    private notificationService: NotificationService,
    private http: HttpClient,
  ) {}

  getActiveProfile(): Observable<PrinterProfile> {
    throw new Error('Method not implemented.');
  }

  saveToEPROM(): void {
    //TODO: check if this is needed
    return;
  }

  executeGCode(gCode: string): void {
    this.sendGCode(gCode, $localize`:@@error-printer-hotend:Can't execute GCode!`);
  }

  jog(x: number, y: number, z: number): void {
    x = this.configService.isXAxisInverted() ? x * -1 : x;
    y = this.configService.isYAxisInverted() ? y * -1 : y;
    z = this.configService.isZAxisInverted() ? z * -1 : z;

    this.sendGCode(
      `G91 : G0 F${this.convertMMpStoMMpH(this.configService.getZSpeed())} Z${z} : G0 F${this.convertMMpStoMMpH(
        this.configService.getXYSpeed(),
      )} X${x} Y${y} `,
      $localize`:@@error-printer-head:Can't move Printhead!`,
    );
  }

  extrude(amount: number, speed: number): void {
    this.sendGCode(
      `M83 : G1 F${this.convertMMpStoMMpH(speed)} E${amount}`,
      $localize`:@@error-printer-head:Can't move Printhead!`,
    );
  }

  setTemperatureHotend(temperature: number): void {
    this.sendGCode(
      `SET_HEATER_TEMPERATURE HEATER=extruder TARGET=${temperature}`,
      $localize`:@@error-printer-hotend:Can't set Hotend Temperature!`,
    );
  }

  setTemperatureBed(temperature: number): void {
    this.sendGCode(
      `SET_HEATER_TEMPERATURE HEATER=heater_bed TARGET=${temperature}`,
      $localize`:@@error-printer-bed:Can't set Bed Temperature!`,
    );
  }

  setFanSpeed(percentage: number): void {
    this.sendGCode(`M106 P0 S${percentage * 2.55}`, $localize`:@@error-printer-fan:Can't set Fan Speed!`);
  }

  setFeedrate(feedrate: number): void {
    this.sendGCode(`M220 S${feedrate}`, $localize`:@@error-printer-feedrate:Can't set Feedrate!`);
  }

  setFlowrate(flowrate: number): void {
    this.sendGCode(`M221 S${flowrate}`, $localize`:@@error-printer-feedrate:Can't set Flowrate!`);
  }

  disconnectPrinter(): void {
    this.notificationService.setNotification({
      heading: $localize`:@@error-disconnect-not-supported:[!DISCONNECT] command not supported on Moonraker!`,
      text: $localize`:@@error-command-not-supported-details:Please check the docs for alternatives.`,
      type: NotificationType.WARN,
      time: new Date(),
    });
  }

  restart(): void {
    this.http
      .post(this.configService.getApiURL(`printer/restart`), null, this.configService.getHTTPHeaders())
      .pipe(
        catchError(error => {
          this.notificationService.setNotification({
            heading: $localize`:@@error-printer-emergency:Can't execute restart!`,
            text: error.message,
            type: NotificationType.ERROR,
            time: new Date(),
          });
          return of(null);
        }),
      )
      .subscribe();
  }

  firmwareRestart(): void {
    this.http
      .post(this.configService.getApiURL(`printer/firmware_restart`), null, this.configService.getHTTPHeaders())
      .pipe(
        catchError(error => {
          this.notificationService.setNotification({
            heading: $localize`:@@error-printer-emergency:Can't execute firmware restart!`,
            text: error.message,
            type: NotificationType.ERROR,
            time: new Date(),
          });
          return of(null);
        }),
      )
      .subscribe();
  }

  emergencyStop(): void {
    this.http
      .post(this.configService.getApiURL(`printer/emergency_stop`), null, this.configService.getHTTPHeaders())
      .pipe(
        catchError(error => {
          this.notificationService.setNotification({
            heading: $localize`:@@error-printer-emergency:Can't execute emergency stop!`,
            text: error.message,
            type: NotificationType.ERROR,
            time: new Date(),
          });
          return of(null);
        }),
      )
      .subscribe();
  }

  private convertMMpStoMMpH(speed: number): number {
    return speed * 60;
  }

  private sendGCode(cmd: string, errorMessage: string) {
    this.http
      .post(
        this.configService.getApiURL(`printer/gcode/script?script=${cmd}`),
        null,
        this.configService.getHTTPHeaders(),
      )
      .pipe(
        catchError(error => {
          this.notificationService.setNotification({
            heading: errorMessage,
            text: error.message,
            type: NotificationType.ERROR,
            time: new Date(),
          });
          return of(null);
        }),
      )
      .subscribe();
  }
}
