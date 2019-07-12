import { Injectable } from '@angular/core';
import { Observable, Observer, timer } from 'rxjs';
import { HttpHeaders, HttpErrorResponse, HttpClient } from '@angular/common/http';
import { ConfigService } from './config/config.service';
import { share } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DisplayLayerProgressService {

  observable: Observable<Object>

  constructor(private _configService: ConfigService, private _http: HttpClient) {
    this.observable = Observable.create((observer: Observer<any>) => {
      timer(750, this._configService.config.octoprint.apiInterval).subscribe(_ => {
        if (this._configService.config) {
          const httpHeaders = {
            headers: new HttpHeaders({
              'x-api-key': this._configService.config.octoprint.accessToken
            })
          }
          this._http.get(this._configService.config.octoprint.url + "plugin/DisplayLayerProgress", httpHeaders).subscribe(
            (data: JSON) => {
              observer.next({
                current: data["layer"]["current"] === "-" ? 0 : data["layer"]["current"],
                total: data["layer"]["total"] === "-" ? 0 : data["layer"]["total"],
                fanSpeed: data["fanSpeed"] === "-" ? 0 : data["fanSpeed"]
              })
            }, (error: HttpErrorResponse) => {
              console.error("Can't retrieve layerProgress! " + error.message)
            })
        }
      })
    }).pipe(share())
  }


  public getObservable(): Observable<Object> {
    return this.observable
  }

}

export interface DisplayLayerProgressAPI {
  current: number;
  total: number;
  fanSpeed: number;
}
