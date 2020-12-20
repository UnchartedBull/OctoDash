/* eslint-disable camelcase */
import {HttpClient, HttpHeaders, HttpResponseBase} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {BasicAuth} from "../config/config.model";

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  private basicAuthHeaders(basicAuth?: BasicAuth) {
    if (basicAuth) {
      return new HttpHeaders({
        'Authorization': 'Basic ' + btoa(`${basicAuth.user}:${basicAuth.pass}`)
      });
    }
  }

  public probeSupport(octoprintURL: string, basicAuth?: BasicAuth): Observable<HttpResponseBase> {
    return this.http.get<void>(`${octoprintURL}plugin/appkeys/probe`, { observe: 'response', headers: this.basicAuthHeaders(basicAuth) });
  }

  public startProcess(octoprintURL: string, basicAuth?: BasicAuth): Observable<AppToken> {
    return this.http.post<AppToken>(`${octoprintURL}plugin/appkeys/request`, { app: 'OctoDash' }, { headers: this.basicAuthHeaders(basicAuth) });
  }

  public pollStatus(octoprintURL: string, token: string, basicAuth?: BasicAuth): Observable<HttpResponseBase> {
    return this.http.get<void | string>(`${octoprintURL}plugin/appkeys/request/${token}`, { observe: 'response', headers: this.basicAuthHeaders(basicAuth) });
  }
}

export interface AppToken {
  app_token: string;
}

export interface TokenSuccess {
  api_key: string;
}
