/* eslint-disable camelcase */
import { HttpClient, HttpResponseBase } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { pluck } from 'rxjs/operators';

import { AppToken } from '../../../model/octoprint';

@Injectable({
  providedIn: 'root',
})
@Injectable()
export class OctoprintAuthenticationService {
  constructor(private http: HttpClient) {}

  public probeAuthSupport(octoprintURL: string): Observable<HttpResponseBase> {
    return this.http.get<void>(`${octoprintURL}plugin/appkeys/probe`, { observe: 'response' });
  }

  public startAuthProcess(octoprintURL: string): Observable<string> {
    return this.http
      .post<AppToken>(`${octoprintURL}plugin/appkeys/request`, { app: 'OctoDash' })
      .pipe(pluck('app_token'));
  }

  public pollAuthProcessStatus(octoprintURL: string, token: string): Observable<HttpResponseBase> {
    return this.http.get<void | string>(`${octoprintURL}plugin/appkeys/request/${token}`, { observe: 'response' });
  }
}
