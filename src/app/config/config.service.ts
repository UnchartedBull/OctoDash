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

  private config: Config;
  private valid: boolean;
  private update = false;
  private initialized = false;

  private httpHeaders: object;

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

  private initialize(config: Config): void {
    this.config = config;
    this.valid = this.validate();
    if (this.valid) {
      this.httpHeaders = {
        headers: new HttpHeaders({
          'x-api-key': this.config.octoprint.accessToken,
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          Expires: '0'
        })
      };
    }
    this.initialized = true;
  }

  public getRemoteConfig(): Config {
    return this.store.get('config');
  }

  public getCurrentConfig(): Config {
    return this.config;
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
      this.update = false;
      this.initialize(this.store.get('config'));
    }
  }

  public revertConfigForInput(config: Config) {
    config.octoprint.urlSplit = {
      url: config.octoprint.url.split(':')[1].replace('//', ''),
      port: parseInt(config.octoprint.url.split(':')[2].replace('/api/', ''), 10)
    };
    return config;
  }

  public createConfigFromInput(config: Config) {
    config.octoprint.url = `http://${config.octoprint.urlSplit.url}:${config.octoprint.urlSplit.port}/api/`;
    delete config.octoprint.urlSplit;
    return config;
  }

  public isLoaded(): boolean {
    return this.config ? true : false;
  }

  public setUpdate(): void {
    this.update = true;
  }

  public getHTTPHeaders(): object {
    return this.httpHeaders;
  }

  public getURL(path: string) {
    return this.config.octoprint.url + path;
  }

  public getAPIInterval(): number {
    return this.config.octoprint.apiInterval;
  }

  public getPrinterName(): string {
    return this.config.printer.name;
  }

  public getCustomActions(): Array<CustomAction> {
    return this.config.octodash.customActions;
  }

  public getXYSpeed(): number {
    return this.config.printer.xySpeed;
  }

  public getZSpeed(): number {
    return this.config.printer.zSpeed;
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  public isValid(): boolean {
    return this.valid;
  }

  public isUpdate(): boolean {
    return this.update;
  }

  public isTouchscreen(): boolean {
    return this.config.octodash.touchscreen;
  }

  public getAmbientTemperatureSensorName(): number {
    return this.config.octodash.temperatureSensor.ambient;
  }

  public getAutomaticScreenSleep(): boolean {
    return this.config.octodash.turnScreenOffSleep;
  }

  public isPSUControlEnabled(): boolean {
    // TODO: implement in next config change
    return false;
  }

  public getFilamentThickness(): number {
    return this.config.filament.thickness;
  }

  public getFilamentDensity(): number {
    return this.config.filament.density;
  }
}

export interface Config {
  octoprint: Octoprint;
  printer: Printer;
  filament: Filament;
  octodash: OctoDash;
}

interface OctoDash {
  touchscreen: boolean;
  temperatureSensor: TemperatureSensor | null;
  customActions: CustomAction[];
  turnScreenOffSleep: boolean;
}

interface CustomAction {
  icon: string;
  command: string;
  color: string;
}

interface TemperatureSensor {
  ambient: number | null;
  filament1: number | null;
  filament2: number | null;
}

interface Octoprint {
  url: string;
  accessToken: string;
  apiInterval: number;
  urlSplit?: {
    url: string;
    port: number;
  };
}

interface Printer {
  name: string;
  xySpeed: number;
  zSpeed: number;
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
      required: [
        'url',
        'accessToken',
        'apiInterval'
      ],
      properties: {
        url: {
          $id: '#/properties/octoprint/properties/url',
          type: 'string',
          pattern: '^(.*)$'
        },
        accessToken: {
          $id: '#/properties/octoprint/properties/accessToken',
          type: 'string',
          pattern: '^(.*)$'
        },
        apiInterval: {
          $id: '#/properties/octoprint/properties/apiInterval',
          type: 'integer'
        }
      }
    },
    printer: {
      $id: '#/properties/printer',
      type: 'object',
      required: [
        'name',
        'xySpeed',
        'zSpeed'
      ],
      properties: {
        name: {
          $id: '#/properties/printer/properties/name',
          type: 'string',
          pattern: '^(.*)$'
        },
        xySpeed: {
          $id: '#/properties/printer/properties/xySpeed',
          type: 'integer'
        },
        zSpeed: {
          $id: '#/properties/printer/properties/zSpeed',
          type: 'integer'
        }
      }
    },
    filament: {
      $id: '#/properties/filament',
      type: 'object',
      required: [
        'thickness',
        'density'
      ],
      properties: {
        thickness: {
          $id: '#/properties/filament/properties/thickness',
          type: 'number'
        },
        density: {
          $id: '#/properties/filament/properties/density',
          type: 'number'
        }
      }
    },
    octodash: {
      $id: '#/properties/octodash',
      type: 'object',
      required: [
        'touchscreen',
        'temperatureSensor',
        'customActions',
        'turnScreenOffSleep'
      ],
      properties: {
        touchscreen: {
          $id: '#/properties/octodash/properties/touchscreen',
          type: 'boolean'
        },
        temperatureSensor: {
          $id: '#/properties/octodash/properties/temperatureSensor',
          type: 'object',
          required: [
            'ambient',
            'filament1',
            'filament2'
          ],
          properties: {
            ambient: {
              $id: '#/properties/octodash/properties/temperatureSensor/properties/ambient',
              type: ['number', 'null'],
              pattern: '^(.*)$'
            },
            filament1: {
              $id: '#/properties/octodash/properties/temperatureSensor/properties/filament1',
              type: ['number', 'null'],
              pattern: '^(.*)$'
            },
            filament2: {
              $id: '#/properties/octodash/properties/temperatureSensor/properties/filament2',
              type: ['number', 'null'],
              pattern: '^(.*)$'
            },
          }
        },
        customActions: {
          $id: '#/properties/octodash/properties/customActions',
          type: 'array',
          items: {
            $id: '#/properties/octodash/properties/customActions/items',
            type: 'object',
            required: [
              'icon',
              'command',
              'color'
            ],
            properties: {
              icon: {
                $id: '#/properties/octodash/properties/customActions/items/properties/icon',
                type: 'string',
                pattern: '^(.*)$'
              },
              command: {
                $id: '#/properties/octodash/properties/customActions/items/properties/command',
                type: 'string',
                pattern: '^(.*)$'
              },
              color: {
                $id: '#/properties/octodash/properties/customActions/items/properties/color',
                type: 'string',
                pattern: '^(.*)$'
              }
            }
          }
        },
        turnScreenOffSleep: {
          $id: '#/properties/octodash/properties/turnScreenOffSleep',
          type: 'boolean'
        },
      }
    }
  }
};
