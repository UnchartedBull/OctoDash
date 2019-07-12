import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  public config: Config;

  constructor(private http: HttpClient) {
    this.http.get(environment.config).subscribe((config: Config) => this.config = config);
  }
}

export interface Config {
  octoprint: Octoprint;
  printer: Printer;
  filament: Filament;
}

interface Octoprint {
  url: string;
  accessToken: string;
  apiInterval: number;
}

interface Printer {
  name: string;
}

interface Filament {
  thickness: number;
  density: number;
}
