import { Injectable, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import * as Ajv from 'ajv';

declare global {
  interface Window {
    require: any;
    process: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  public config: Config;
  private store: any | undefined;
  private validator: Ajv.ValidateFunction;
  public valid: boolean;

  constructor(private http: HttpClient) {
    const ajv = new Ajv({ allErrors: true });
    this.validator = ajv.compile(schema);
    if (window && window.process && window.process.type) {
      const Store = window.require('electron-store');
      this.store = new Store();
      // this.store.set('config', { 'type': 'abv' });
      // this.store.delete('config');
      this.config = this.store.get('config');
      this.valid = this.validate();
    } else {
      console.warn('Detected non-electron environment. Fallback to assets/config.json. Any changes are non-persistent!');
      this.http.get(environment.config).subscribe((config: Config) => {
        this.config = config;
        this.valid = this.validate();
      });
    }
  }

  public validate(): boolean {
    return this.validator(this.config) ? true : false;
  }

  public validateGiven(config: Config): boolean {
    return this.validator(config) ? true : false;
  }

  public getErrors(): string[] {
    const errors = [];
    this.validator.errors.forEach(error => {
      if (error.keyword === 'type') {
        errors.push(`${error.dataPath} ${error.message}`);
      } else {
        errors.push(`${error.dataPath === '' ? '.' : error.dataPath} ${error.message}`);
      }
    });
    return errors;
  }

  public saveConfig(config?: Config): string {
    if (!config) {
      config = this.config;
    }
    if (window && window.process && window.process.type) {
      this.store.set('config', config);
      const configStored = this.store.get('config');
      if (this.validateGiven(configStored)) {
        if (configStored === config) {
          return null;
        } else {
          return ('Error while saving config!');
        }
      } else {
        return ('Saved config is invalid!');
      }
    } else {
      return ('Browser version doesn\'t support saving!');
    }
  }

  public updateConfig() {
    if (window && window.process && window.process.type) {
      this.config = this.store.get('config');
      this.valid = this.validate();
    }
  }
}

export interface Config {
  octoprint: Octoprint;
  printer: Printer;
  filament: Filament;
  touchscreen: boolean;
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

const schema = {
  definitions: {},
  $id: 'http://example.com/root.json',
  type: 'object',
  title: 'The Root Schema',
  required: [
    'octoprint',
    'printer',
    'filament'
  ],
  properties: {
    octoprint: {
      $id: '#/properties/octoprint',
      type: 'object',
      title: 'The Octoprint Schema',
      required: [
        'url',
        'accessToken',
        'apiInterval'
      ],
      properties: {
        url: {
          $id: '#/properties/octoprint/properties/url',
          type: 'string',
          title: 'The Url Schema',
          default: 'http://localhost:5000/api/'
        },
        accessToken: {
          $id: '#/properties/octoprint/properties/accessToken',
          type: 'string',
          title: 'The Accesstoken Schema'
        },
        apiInterval: {
          $id: '#/properties/octoprint/properties/apiInterval',
          type: 'integer',
          title: 'The Apiinterval Schema',
          default: 2000
        }
      }
    },
    printer: {
      $id: '#/properties/printer',
      type: 'object',
      title: 'The Printer Schema',
      required: [
        'name'
      ],
      properties: {
        name: {
          $id: '#/properties/printer/properties/name',
          type: 'string',
          title: 'The Name Schema'
        }
      }
    },
    filament: {
      $id: '#/properties/filament',
      type: 'object',
      title: 'The Filament Schema',
      required: [
        'thickness',
        'density'
      ],
      properties: {
        thickness: {
          $id: '#/properties/filament/properties/thickness',
          type: 'number',
          title: 'The Thickness Schema'
        },
        density: {
          $id: '#/properties/filament/properties/density',
          type: 'number',
          title: 'The Density Schema'
        }
      }
    }
  }
};
