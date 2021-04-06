import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ConfigService } from '../../config/config.service';
import { PSUState, TemperatureReading } from '../../model';
import {
  EnclosureColorBody,
  EnclosureOutputBody,
  EnclosurePluginAPI,
  PSUControlCommand,
  TPLinkCommand,
  TasmotaCommand,
  TasmotaMqttCommand,
} from '../../model/octoprint';
import { NotificationService } from '../../notification/notification.service';
import { EnclosureService } from './enclosure.service';

@Injectable()
export class EnclosureOctoprintService implements EnclosureService {
  public constructor(
    private configService: ConfigService,
    private notificationService: NotificationService,
    private http: HttpClient,
  ) {}
  private currentPSUState = PSUState.ON;

  getEnclosureTemperature(): Observable<TemperatureReading> {
    return this.http
      .get(
        this.configService.getApiURL(
          'plugin/enclosure/inputs/' + this.configService.getAmbientTemperatureSensorName(),
          false,
        ),
        this.configService.getHTTPHeaders(),
      )
      .pipe(
        map((data: EnclosurePluginAPI) => {
          return {
            temperature: data.temp_sensor_temp,
            humidity: data.temp_sensor_humidity,
            unit: data.use_fahrenheit ? '°F' : '°C',
          } as TemperatureReading;
        }),
      );
  }

  setLEDColor(identifier: number, red: number, green: number, blue: number): void {
    const colorBody: EnclosureColorBody = {
      red,
      green,
      blue,
    };
    this.http
      .patch(
        this.configService.getApiURL('plugin/enclosure/neopixel/' + identifier, false),
        colorBody,
        this.configService.getHTTPHeaders(),
      )
      .pipe(catchError(error => this.notificationService.setError($localize`:@@error-set-color:Can't set LED color!`, error.message)))
      .subscribe();
  }

  setOutput(identifier: number, status: boolean): void {
    const outputBody: EnclosureOutputBody = {
      status,
    };
    this.http
      .patch(
        this.configService.getApiURL('plugin/enclosure/outputs/' + identifier, false),
        outputBody,
        this.configService.getHTTPHeaders(),
      )
      .pipe(catchError(error => this.notificationService.setError($localize`:@@error-set-output:Can't set output!`, error.message)))
      .subscribe();
  }

  setPSUState(state: PSUState): void {
    if (this.configService.usePSUControl()) {
      this.setPSUStatePSUControl(state);
    } else if (this.configService.useTpLinkSmartPlug()) {
      this.setPSUStateTPLink(state);
    } else if (this.configService.useTasmota()) {
      this.setPSUStateTasmota(state);
    } else if (this.configService.useTasmotaMqtt()) {
      this.setPSUStateTasmotaMqtt(state);
    } else {
      this.notificationService.setWarning($localize`:@@error-psu-state:Can't change PSU State!`, $localize`:@@error-psu-provider:No provider for PSU Control is configured.`);
    }
  }

  private setPSUStatePSUControl(state: PSUState) {
    const psuControlPayload: PSUControlCommand = {
      command: state === PSUState.ON ? 'turnPSUOn' : 'turnPSUOff',
    };

    this.http
      .post(this.configService.getApiURL('plugin/psucontrol'), psuControlPayload, this.configService.getHTTPHeaders())
      .pipe(catchError(error => this.notificationService.setError($localize`:@@error-send-psu-gcode:Can't send GCode!`, error.message)))
      .subscribe();
  }

  private setPSUStateTPLink(state: PSUState) {
    const tpLinkPayload: TPLinkCommand = {
      command: state === PSUState.ON ? 'turnOn' : 'turnOff',
      ip: this.configService.getSmartPlugIP(),
    };

    this.http
      .post(this.configService.getApiURL('plugin/tplinksmartplug'), tpLinkPayload, this.configService.getHTTPHeaders())
      .pipe(catchError(error => this.notificationService.setError($localize`:@@error-send-smartplug-gcode:Can't send GCode!`, error.message)))
      .subscribe();
  }

  private setPSUStateTasmota(state: PSUState) {
    const tasmotaPayload: TasmotaCommand = {
      command: state === PSUState.ON ? 'turnOn' : 'turnOff',
      ip: this.configService.getTasmotaIP(),
      idx: this.configService.getTasmotaIndex(),
    };

    this.http
      .post(this.configService.getApiURL('plugin/tasmota'), tasmotaPayload, this.configService.getHTTPHeaders())
      .pipe(catchError(error => this.notificationService.setError("Can't send GCode!", error.message)))
      .subscribe();
  }

  private setPSUStateTasmotaMqtt(state: PSUState) {
    const tasmotaMqttPayload: TasmotaMqttCommand = {
      command: state === PSUState.ON ? 'turnOn' : 'turnOff',
      topic: this.configService.getTasmotaMqttTopic(),
      relayN: this.configService.getTasmotaMqttRelayNumber(),
    };

    this.http
      .post(this.configService.getApiURL('plugin/tasmota_mqtt'), tasmotaMqttPayload, this.configService.getHTTPHeaders())
      .pipe(catchError(error => this.notificationService.setError("Can't send GCode!", error.message)))
      .subscribe();
  }

  togglePSU(): void {
    this.currentPSUState === PSUState.ON ? this.setPSUState(PSUState.OFF) : this.setPSUState(PSUState.ON);
  }
}
