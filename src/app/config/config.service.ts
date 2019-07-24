import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import Ajv from 'ajv';

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
  private store: any | undefined;
  private validator: Ajv.ValidateFunction;
  private httpHeaders: object;
  public config: Config;
  public valid: boolean;
  public update = false;

  constructor(private http: HttpClient) {
    const ajv = new Ajv({ allErrors: true });
    this.validator = ajv.compile(schema);
    if (window && window.process && window.process.type) {
      const Store = window.require('electron-store');
      this.store = new Store();
      this.initialize(this.store.get('config'));
    } else {
      console.warn('Detected non-electron environment. Fallback to assets/config.json. Any changes are non-persistent!');
      this.http.get(environment.config).subscribe((config: Config) => {
        this.initialize(config);
      });
    }
  }

  private initialize(config: Config) {
    this.config = config;
    this.valid = this.validate();
    if (this.valid) {
      this.httpHeaders = {
        headers: new HttpHeaders({
          'x-api-key': this.config.octoprint.accessToken
        })
      };
    }
  }

  public getRemoteConfig(): Config {
    return this.store.get('config');
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
        return null;
      } else {
        return ('Saved config is invalid!');
      }
    } else {
      return ('Browser version doesn\'t support saving!');
    }
  }

  public updateConfig() {
    if (window && window.process && window.process.type) {
      this.initialize(this.store.get('config'));
    }
  }

  public getHTTPHeaders(): object {
    return this.httpHeaders;
  }

  public getURL(path: string) {
    return this.config.octoprint.url + path;
  }

  public getAPIInterval() {
    return this.config.octoprint.apiInterval;
  }
}

export interface Config {
  octoprint: Octoprint;
  printer: Printer;
  filament: Filament;
  octodash: OctoDash;
  // DEPRECATED, will be removed with the next config change
  touchscreen?: boolean;
}

interface OctoDash {
  touchscreen: boolean;
  temperatureSensor: TemperatureSensor | null;
}

interface TemperatureSensor {
  type: number;
  gpio: number;
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
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'http://example.com/root.json',
  type: 'object',
  title: 'The Root Schema',
  required: [
    'octoprint',
    'printer',
    'filament',
    'octodash'
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
          pattern: '^(.*)$'
        },
        accessToken: {
          $id: '#/properties/octoprint/properties/accessToken',
          type: 'string',
          title: 'The Accesstoken Schema',
          pattern: '^(.*)$'
        },
        apiInterval: {
          $id: '#/properties/octoprint/properties/apiInterval',
          type: 'integer',
          title: 'The Apiinterval Schema'
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
          title: 'The Name Schema',
          pattern: '^(.*)$'
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
    },
    octodash: {
      $id: '#/properties/octodash',
      type: 'object',
      title: 'The Octodash Schema',
      required: [
        'touchscreen',
        'temperatureSensor'
      ],
      properties: {
        touchscreen: {
          $id: '#/properties/octodash/properties/touchscreen',
          type: 'boolean',
          title: 'The Touchscreen Schema'
        },
        temperatureSensor: {
          $id: '#/properties/octodash/properties/temperatureSensor',
          type: ['object', 'null'],
          title: 'The Temperaturesensor Schema',
          required: [
            'type',
            'gpio'
          ],
          properties: {
            type: {
              $id: '#/properties/octodash/properties/temperatureSensor/properties/type',
              type: 'integer',
              title: 'The Type Schema'
            },
            gpio: {
              $id: '#/properties/octodash/properties/temperatureSensor/properties/gpio',
              type: 'integer',
              title: 'The Gpio Schema'
            }
          }
        }
      }
    }
  }
};
