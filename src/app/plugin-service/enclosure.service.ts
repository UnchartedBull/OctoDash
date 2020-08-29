import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Observer, Subscription, timer } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { TemperatureReading } from '../bottom-bar/bottom-bar.component';
import { ConfigService } from '../config/config.service';
import { NotificationService } from '../notification/notification.service';

@Injectable({
  providedIn: 'root',
})
export class EnclosureService {
  private httpGETRequest: Subscription;
  private observable: Observable<TemperatureReading>;
  private initialRequest = true;

  public constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private notificationService: NotificationService,
  ) {
    this.observable = new Observable((observer: Observer<TemperatureReading>): void => {
      timer(2500, 15000).subscribe((): void => {
        if (this.httpGETRequest) {
          this.httpGETRequest.unsubscribe();
        }
        this.httpGETRequest = this.http
          .get(
            this.configService
              .getURL('plugin/enclosure/inputs/' + this.configService.getAmbientTemperatureSensorName())
              .replace('/api', ''),
            this.configService.getHTTPHeaders(),
          )
          .subscribe(
            (data: EnclosurePluginAPI): void => {
              this.initialRequest = false;
              observer.next(({
                temperature: data.temp_sensor_temp,
                humidity: data.temp_sensor_humidity,
                unit: data.use_fahrenheit ? '°F' : '°C',
              } as unknown) as TemperatureReading);
            },
            (error: HttpErrorResponse): void => {
              if (this.initialRequest && error.status === 500) {
                this.initialRequest = false;
              } else {
                this.notificationService.setError("Can't retrieve enclosure temperature!", error.message);
              }
            },
          );
      });
    }).pipe(shareReplay(1));
  }

  public getObservable(): Observable<TemperatureReading> {
    return this.observable;
  }
}

interface EnclosurePluginAPI {
  /* eslint-disable camelcase */
  controlled_io: string;
  temp_sensor_address: string;
  temp_sensor_navbar: boolean;
  temp_sensor_temp: number;
  printer_action: string;
  filament_sensor_enabled: boolean;
  controlled_io_set_value: number;
  temp_sensor_type: string;
  temp_sensor_humidity: number;
  filament_sensor_timeout: number;
  edge: string;
  ds18b20_serial: string;
  action_type: string;
  input_pull_resistor: string;
  input_type: string;
  label: string;
  index_id: number;
  use_fahrenheit: boolean;
  gpio_pin: string;
}
