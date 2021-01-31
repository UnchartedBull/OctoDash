/* eslint-disable camelcase */
import { HttpClient, HttpResponseBase } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { HttpHeader } from '../config/config.model';
import { OctoprintLogin } from './model/login';

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

  public getSessionKey(octoprintURL: string, options: HttpHeader): Observable<SocketAuth> {
    return this.http.post<OctoprintLogin>(`${octoprintURL}`, { passive: true }, options).pipe(
      map(octoprintLogin => {
        return {
          user: octoprintLogin.name,
          session: octoprintLogin.session,
        } as SocketAuth;
      }),
    );
  }
}

export interface AppToken {
  app_token: string;
}

export interface TokenSuccess {
  api_key: string;
}

export interface SocketAuth {
  user: string;
  session: string;
}
