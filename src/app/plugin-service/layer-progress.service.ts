import { Injectable } from '@angular/core';
import { Observable, Observer, timer, Subscription } from 'rxjs';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { ConfigService } from '../config/config.service';
import { shareReplay } from 'rxjs/operators';
import { OctoprintLayerProgressAPI } from '../octoprint-api/layerProgressAPI';
import { NotificationService } from '../notification/notification.service';

@Injectable({
  providedIn: 'root'
})
export class LayerProgressService {

  httpGETRequest: Subscription;
  observable: Observable<DisplayLayerProgressAPI>;

  constructor(private configService: ConfigService, private notificationService: NotificationService, private http: HttpClient) {
    this.observable = new Observable((observer: Observer<any>) => {
      timer(1000, this.configService.getAPIInterval()).subscribe(_ => {
        if (this.httpGETRequest) {
          this.httpGETRequest.unsubscribe();
        }
        this.httpGETRequest = this.http.get(this.configService.getURL('plugin/DisplayLayerProgress/values').replace('/api', ''),
          this.configService.getHTTPHeaders()).subscribe(
            (data: OctoprintLayerProgressAPI) => {
              observer.next({
                current: data.layer.current === '-' ? 0 : Number(data.layer.current) + 1,
                total: data.layer.total === '-' ? 0 : Number(data.layer.total) + 1,
                fanSpeed: data.fanSpeed === '-' ? 0 : data.fanSpeed === 'Off' ? 0 : data.fanSpeed.replace('%', '')
              });
            }, (error: HttpErrorResponse) => {
              this.notificationService.setError('Can\'t retrieve layer progress!', error.message);
            });

      });
    }).pipe(shareReplay(1));
  }


  public getObservable(): Observable<DisplayLayerProgressAPI> {
    return this.observable;
  }

}

export interface DisplayLayerProgressAPI {
  current: number;
  total: number;
  fanSpeed: number;
}
