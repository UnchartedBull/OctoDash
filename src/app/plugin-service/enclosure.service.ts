import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ConfigService } from '../config/config.service';
import { NotificationService } from '../notification/notification.service';
import { Observable, Observer, timer, Subscription } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { TemperatureReading } from '../bottom-bar/bottom-bar.component';

@Injectable({
  providedIn: 'root'
})
export class EnclosureService {

  httpGETRequest: Subscription;
  observable: Observable<TemperatureReading>;

  constructor(private http: HttpClient, private configService: ConfigService, private notificationService: NotificationService) {
    this.observable = new Observable((observer: Observer<TemperatureReading>) => {
      timer(850, 30000).subscribe(_ => {
        if (this.httpGETRequest) {
          this.httpGETRequest.unsubscribe();
        }
        this.httpGETRequest = this.http.get(this.configService.getURL('plugin/enclosure/inputs/' +
          this.configService.getAmbientTemperatureSensorName()).replace('/api', ''), this.configService.getHTTPHeaders()).subscribe(
            (data: EnclosurePluginAPI) => {
              observer.next({
                temperature: data.temp_sensor_temp,
                humidity: data.temp_sensor_humidity
              } as TemperatureReading);
            }, (error: HttpErrorResponse) => {
              this.notificationService.setError('Can\'t retrieve enclosure temperature!', error.message);
            });
      });
    }).pipe(shareReplay(1));
  }

  public getObservable(): Observable<TemperatureReading> {
    return this.observable;
  }
}

interface EnclosurePluginAPI {
  controlled_io: any;
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
