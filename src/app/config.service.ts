import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { IpcRenderer, IpcMessageEvent } from 'electron';

declare global {
  interface Window { require: any; }
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  public config: Config;
  private ipc: IpcRenderer | undefined;

  constructor(private http: HttpClient) {
    if (window.require) {
      try {
        this.ipc = window.require('electron').ipcRenderer;
        console.log(this.ipc.sendSync('config', 'abc'));
      } catch (e) {
        throw e;
      }
    } else {
      console.warn('Can\'t load IPC, config may not be up to date! (non-electron version)');
      this.http.get(environment.config).subscribe((config: Config) => this.config = config);
    }
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