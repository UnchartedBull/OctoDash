import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ConfigService } from '../config/config.service';
import { NotificationService } from '../notification/notification.service';
import { Observable, Observer, timer, Subscription } from 'rxjs';
import { OctoprintSettingsAPI } from '../octoprint-api/settingsAPI';
import { PrinterStatusAPI } from '../printer.service';
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
      // TODO_ Change once plugin gets updated
      timer(1200, 30000000).subscribe(_ => {
        if (this.httpGETRequest) {
          this.httpGETRequest.unsubscribe();
        }
        this.httpGETRequest = this.http.get(this.configService.getURL('settings'), this.configService.getHTTPHeaders()).subscribe(
          (data: OctoprintSettingsAPI) => {
            const enclosureInputs = data.plugins.enclosure.rpi_inputs;
            const ambientTemperatureSensorName = this.configService.getAmbientTemperatureSensorName();
            enclosureInputs.forEach((enclosureInput) => {
              if (enclosureInput.label === ambientTemperatureSensorName) {
                observer.next({
                  temperature: enclosureInput.temp_sensor_temp,
                  humidity: enclosureInput.temp_sensor_humidity
                } as TemperatureReading);
              }
            });
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
