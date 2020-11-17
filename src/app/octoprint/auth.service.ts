/* eslint-disable camelcase */
import { HttpClient, HttpResponseBase } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  public probeSupport(octoprintURL: string): Observable<HttpResponseBase> {
    return this.http.get<void>(`${octoprintURL}plugin/appkeys/probe`, { observe: 'response' });
  }

  public startProcess(octoprintURL: string): Observable<AppToken> {
    return this.http.post<AppToken>(`${octoprintURL}plugin/appkeys/request`, { app: 'OctoDash' });
  }

  public pollStatus(octoprintURL: string, token: string): Observable<HttpResponseBase> {
    return this.http.get<void | string>(`${octoprintURL}plugin/appkeys/request/${token}`, { observe: 'response' });
  }
}

export interface AppToken {
  app_token: string;
}

export interface TokenSuccess {
  api_key: string;
}
