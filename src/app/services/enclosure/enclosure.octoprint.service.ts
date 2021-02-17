import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ConfigService } from '../../config/config.service';
import { TemperatureReading } from '../../model/enclosure.model';
import {
  EnclosureColorBody,
  EnclosureOutputBody,
  EnclosurePluginAPI,
} from '../../model/octoprint/plugins/enclosure.model';
import { NotificationService } from '../../notification/notification.service';
import { EnclosureService } from './enclosure.service';

@Injectable()
export class EnclosureOctoprintService implements EnclosureService {
  public constructor(
    private configService: ConfigService,
    private notificationService: NotificationService,
    private http: HttpClient,
  ) {}

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
      .pipe(catchError(error => this.notificationService.setError("Can't set LED color!", error.message)))
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
      .pipe(catchError(error => this.notificationService.setError("Can't set output!", error.message)))
      .subscribe();
  }
}
