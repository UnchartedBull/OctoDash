import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  public config: Config;

  constructor(private _http: HttpClient) {
    this._http.get("assets/config.json").subscribe((config: Config) => this.config = config)
  }
}

export interface Config {
  octoprint: Octoprint;
  printer: Printer;
}

interface Octoprint {
  url: string;
  accessToken: string;
  apiInterval: number;
}

interface Printer {
  name: string;
}