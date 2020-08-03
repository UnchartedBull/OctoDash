import { HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import Ajv from "ajv";
import _ from "lodash";

import { NotificationService } from "../notification/notification.service";

@Injectable({
  providedIn: "root",
})
export class ConfigService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private store: any | undefined;
  private validator: Ajv.ValidateFunction;

  private config: Config;
  private valid: boolean;
  private update = false;
  private initialized = false;

  private httpHeaders: HttpHeader;

  public constructor(private notificationService: NotificationService) {
    const ajv = new Ajv({ allErrors: true });
    this.validator = ajv.compile(schema);
    try {
      const Store = window.require("electron-store");
      this.store = new Store();
      this.initialize(this.store.get("config"));
    } catch (e) {
      this.notificationService.setError(
        "Can't read config file!",
        "Please restart your system. If the issue persists open an issue on GitHub."
      );
    }
  }

  private initialize(config: Config): void {
    this.config = config;
    this.valid = this.validate();
    if (this.valid) {
      this.httpHeaders = {
        headers: new HttpHeaders({
          "x-api-key": this.config.octoprint.accessToken,
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          Expires: "0",
        }),
      };
    }
    this.initialized = true;
  }

  public getRemoteConfig(): Config {
    return this.store.get("config");
  }

  public getCurrentConfig(): Config {
    return _.cloneDeep(this.config);
  }

  public isEqualToCurrentConfig(changedConfig: Config): boolean {
    return _.isEqual(this.config, changedConfig);
  }

  public validate(): boolean {
    return this.validator(this.config) ? true : false;
  }

  public validateGiven(config: Config): boolean {
    return this.validator(config) ? true : false;
  }

  public getErrors(): string[] {
    const errors = [];
    this.validator.errors.forEach((error): void => {
      if (error.keyword === "type") {
        errors.push(`${error.dataPath} ${error.message}`);
      } else {
        errors.push(`${error.dataPath === "" ? "." : error.dataPath} ${error.message}`);
      }
    });
    console.error(errors);
    return errors;
  }

  public saveConfig(config?: Config): string {
    if (!config) {
      config = this.config;
    }
    if (window && window.process && window.process.type) {
      this.store.set("config", config);
      const configStored = this.store.get("config");
      if (this.validateGiven(configStored)) {
        return null;
      } else {
        return "Saved config is invalid!";
      }
    } else {
      return 'Browser version doesn\'t support saving!';
    }
  }

  public updateConfig(): void {
    if (window && window.process && window.process.type) {
      this.update = false;
      this.initialize(this.store.get("config"));
    }
  }

  public revertConfigForInput(config: Config): Config {
    config.octoprint.urlSplit = {
      url: config.octoprint.url.split(":")[1].replace("//", ""),
      port: parseInt(config.octoprint.url.split(":")[2].replace("/api/", ""), 10),
    };
    if (isNaN(config.octoprint.urlSplit.port)) {
      config.octoprint.urlSplit.port = null;
    }
    return config;
  }

  public createConfigFromInput(config: Config): Config {
    const configOut = _.cloneDeep(config);
    if (config.octoprint.urlSplit.port !== null || !isNaN(config.octoprint.urlSplit.port)) {
      configOut.octoprint.url = `http://${config.octoprint.urlSplit.url}:${config.octoprint.urlSplit.port}/api/`;
    } else {
      configOut.octoprint.url = `http://${config.octoprint.urlSplit.url}/api/`;
    }
    delete configOut.octoprint.urlSplit;
    return configOut;
  }

  public isLoaded(): boolean {
    return this.config ? true : false;
  }

  public setUpdate(): void {
    this.update = true;
  }

  public getHTTPHeaders(): HttpHeader {
    return this.httpHeaders;
  }

  public getURL(path: string): string {
    return this.config.octoprint.url + path;
  }

  public getAPIPollingInterval(): number {
    return this.config.octodash.pollingInterval;
  }

  public getPrinterName(): string {
    return this.config.printer.name;
  }

  public getCustomActions(): CustomAction[] {
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
    return this.config.plugins.enclosure.ambientSensorID;
  }

  public getAutomaticScreenSleep(): boolean {
    return this.config.octodash.turnScreenOffWhileSleeping;
  }

  public turnOnPSUWhenExitingSleep(): boolean {
    return this.config.plugins.psuControl.turnOnPSUWhenExitingSleep;
  }

  public getFilamentThickness(): number {
    return this.config.filament.thickness;
  }

  public getFilamentDensity(): number {
    return this.config.filament.density;
  }

  public getDefaultSortingAttribute(): "name" | "date" | "size" {
    return this.config.octodash.fileSorting.attribute;
  }

  public getDefaultSortingOrder(): "asc" | "dsc" {
    return this.config.octodash.fileSorting.order;
  }

  public getDefaultHotendTemperature(): number {
    return this.config.printer.defaultTemperatureFanSpeed.hotend;
  }

  public getDefaultHeatbedTemperature(): number {
    return this.config.printer.defaultTemperatureFanSpeed.heatbed;
  }

  public getDefaultFanSpeed(): number {
    return this.config.printer.defaultTemperatureFanSpeed.fan;
  }

  public isPreheatPluginEnabled(): boolean {
    return this.config.plugins.preheatButton.enabled;
  }

  public isFilamentManagerEnabled(): boolean {
    return this.config.plugins.filamentManager.enabled;
  }

  public getFeedLength(): number {
    return this.config.filament.feedLength;
  }

  public getFeedSpeed(): number {
    return this.config.filament.feedSpeed;
  }

  public getFeedSpeedSlow(): number {
    return this.config.filament.feedSpeedSlow;
  }

  public getPurgeDistance(): number {
    return this.config.filament.purgeDistance;
  }

  public useM600(): boolean {
    return this.config.filament.useM600;
  }

  public showThumbnailByDefault(): boolean {
    return this.config.octodash.preferPreviewWhilePrinting;
  }
}

interface HttpHeader {
  headers: HttpHeaders;
}

export interface Config {
  octoprint: Octoprint;
  printer: Printer;
  filament: Filament;
  plugins: Plugins;
  octodash: OctoDash;
}

interface Octoprint {
  url: string;
  accessToken: string;
  urlSplit?: {
    url: string;
    port: number;
  };
}

interface Printer {
  name: string;
  xySpeed: number;
  zSpeed: number;
  defaultTemperatureFanSpeed: DefaultTemperatureFanSpeed;
}

interface DefaultTemperatureFanSpeed {
  hotend: number;
  heatbed: number;
  fan: number;
}

interface Filament {
  thickness: number;
  density: number;
  feedLength: number;
  feedSpeed: number;
  feedSpeedSlow: number;
  purgeDistance: number;
  useM600: boolean;
}

interface Plugins {
  enclosure: EnclosurePlugin;
  filamentManager: Plugin;
  preheatButton: Plugin;
  printTimeGenius: Plugin;
  psuControl: PSUControlPlugin;
}

interface Plugin {
  enabled: boolean;
}

interface EnclosurePlugin extends Plugin {
  ambientSensorID: number | null;
  filament1SensorID: number | null;
  filament2SensorID: number | null;
}

interface PSUControlPlugin extends Plugin {
  turnOnPSUWhenExitingSleep: boolean;
}

interface OctoDash {
  customActions: CustomAction[];
  fileSorting: FileSorting;
  pollingInterval: number;
  touchscreen: boolean;
  turnScreenOffWhileSleeping: boolean;
  preferPreviewWhilePrinting: boolean;
}

interface CustomAction {
  icon: string;
  command: string;
  color: string;
  confirm: boolean;
  exit: boolean;
}

interface FileSorting {
  attribute: "name" | "date" | "size";
  order: "asc" | "dsc";
}

const schema = {
  definitions: {},
  $schema: "http://json-schema.org/draft-07/schema#",
  $id: "http://example.com/root.json",
  type: "object",
  required: ["octoprint", "printer", "filament", "plugins", "octodash"],
  properties: {
    octoprint: {
      $id: "#/properties/octoprint",
      type: "object",
      required: ["accessToken", "url"],
      properties: {
        accessToken: {
          $id: "#/properties/octoprint/properties/accessToken",
          type: "string",
          pattern: "^(.*)$",
        },
        url: {
          $id: "#/properties/octoprint/properties/url",
          type: "string",
          pattern: "^(.*)$",
        },
      },
    },
    printer: {
      $id: "#/properties/printer",
      type: "object",
      required: ["name", "xySpeed", "zSpeed", "defaultTemperatureFanSpeed"],
      properties: {
        name: {
          $id: "#/properties/printer/properties/name",
          type: "string",
          pattern: "^(.*)$",
        },
        xySpeed: {
          $id: "#/properties/printer/properties/xySpeed",
          type: "integer",
        },
        zSpeed: {
          $id: "#/properties/printer/properties/zSpeed",
          type: "integer",
        },
        defaultTemperatureFanSpeed: {
          $id: "#/properties/printer/properties/defaultTemperatureFanSpeed",
          type: "object",
          required: ["hotend", "heatbed", "fan"],
          properties: {
            hotend: {
              $id: "#/properties/printer/properties/defaultTemperatureFanSpeed/hotend",
              type: "integer",
            },
            heatbed: {
              $id: "#/properties/printer/properties/defaultTemperatureFanSpeed/heatbed",
              type: "integer",
            },
            fan: {
              $id: "#/properties/printer/properties/defaultTemperatureFanSpeed/fan",
              type: "integer",
            },
          },
        },
      },
    },
    filament: {
      $id: "#/properties/filament",
      type: "object",
      required: ["density", "thickness", "feedLength", "feedSpeed", "feedSpeedSlow", "purgeDistance", "useM600"],
      properties: {
        density: {
          $id: "#/properties/filament/properties/density",
          type: "number",
        },
        thickness: {
          $id: "#/properties/filament/properties/thickness",
          type: "number",
        },
        feedLength: {
          $id: "#/properties/filament/properties/feedLength",
          type: "integer",
        },
        feedSpeed: {
          $id: "#/properties/filament/properties/feedSpeed",
          type: "integer",
        },
        feedSpeedSlow: {
          $id: "#/properties/filament/properties/feedSpeedSlow",
          type: "integer",
        },
        purgeDistance: {
          $id: "#/properties/filament/properties/purgeDistance",
          type: "integer",
        },
        useM600: {
          $id: "#/properties/filament/properties/useM600",
          type: "boolean",
        },
      },
    },
    plugins: {
      $id: "#/properties/plugins",
      type: "object",
      required: [
        "enclosure",
        "filamentManager",
        "preheatButton",
        "printTimeGenius",
        "psuControl",
      ],
      properties: {
        enclosure: {
          $id: "#/properties/plugins/properties/enclosure",
          type: "object",
          required: ["enabled", "ambientSensorID", "filament1SensorID", "filament2SensorID"],
          properties: {
            enabled: {
              $id: "#/properties/plugins/properties/enclosure/properties/enabled",
              type: "boolean",
            },
            ambientSensorID: {
              $id: "#/properties/plugins/properties/enclosure/properties/ambientSensorID",
              type: ["number", "null"],
              pattern: "^(.*)$",
            },
            filament1SensorID: {
              $id: "#/properties/plugins/properties/enclosure/properties/filament1SensorID",
              type: ["number", "null"],
              pattern: "^(.*)$",
            },
            filament2SensorID: {
              $id: "#/properties/plugins/properties/enclosure/properties/filament2SensorID",
              type: ["number", "null"],
              pattern: "^(.*)$",
            },
          },
        },
        filamentManager: {
          $id: "#/properties/plugins/properties/filamentManager",
          type: "object",
          required: ["enabled"],
          properties: {
            enabled: {
              $id: "#/properties/plugins/properties/filamentManager/properties/enabled",
              type: "boolean",
            },
          },
        },
        preheatButton: {
          $id: "#/properties/plugins/properties/preheatButton",
          type: "object",
          required: ["enabled"],
          properties: {
            enabled: {
              $id: "#/properties/plugins/properties/preheatButton/properties/enabled",
              type: "boolean",
            },
          },
        },
        printTimeGenius: {
          $id: "#/properties/plugins/properties/printTimeGenius",
          type: "object",
          required: ["enabled"],
          properties: {
            enabled: {
              $id: "#/properties/plugins/properties/printTimeGenius/properties/enabled",
              type: "boolean",
            },
          },
        },
        psuControl: {
          $id: "#/properties/plugins/properties/psuControl",
          type: "object",
          required: ["enabled", "turnOnPSUWhenExitingSleep"],
          properties: {
            enabled: {
              $id: "#/properties/plugins/properties/printTimeGenius/properties/enabled",
              type: "boolean",
            },
            turnOnPSUWhenExitingSleep: {
              $id: "#/properties/plugins/properties/turnOnPSUWhenExitingSleep",
              type: "boolean",
            },
          },
        },
      },
    },
    octodash: {
      $id: "#/properties/octodash",
      type: "object",
      required: [
        "customActions",
        "fileSorting",
        "pollingInterval",
        "touchscreen",
        "turnScreenOffWhileSleeping",
        "preferPreviewWhilePrinting",
      ],
      properties: {
        customActions: {
          $id: "#/properties/octodash/properties/customActions",
          type: "array",
          items: {
            $id: "#/properties/octodash/properties/customActions/items",
            type: "object",
            required: ["icon", "command", "color", "confirm", "exit"],
            properties: {
              icon: {
                $id: "#/properties/octodash/properties/customActions/items/properties/icon",
                type: "string",
                pattern: "^(.*)$",
              },
              command: {
                $id: "#/properties/octodash/properties/customActions/items/properties/command",
                type: "string",
                pattern: "^(.*)$",
              },
              color: {
                $id: "#/properties/octodash/properties/customActions/items/properties/color",
                type: "string",
                pattern: "^(.*)$",
              },
              confirm: {
                $id: "#/properties/octodash/properties/customActions/items/properties/confirm",
                type: "boolean",
              },
              exit: {
                $id: "#/properties/octodash/properties/customActions/items/properties/exit",
                type: "boolean",
              },
            },
          },
        },
        fileSorting: {
          $id: "#/properties/octodash/properties/fileSorting",
          type: "object",
          required: ["attribute", "order"],
          properties: {
            attribute: {
              $id: "#/properties/octodash/properties/fileSorting/properties/attribute",
              type: "string",
              pattern: "^(name|date|size)$",
            },
            order: {
              $id: "#/properties/octodash/properties/fileSorting/properties/order",
              type: "string",
              pattern: "^(asc|dsc)$",
            },
          },
        },
        pollingInterval: {
          $id: "#/properties/octodash/properties/pollingInterval",
          type: "integer",
        },
        touchscreen: {
          $id: "#/properties/octodash/properties/touchscreen",
          type: "boolean",
        },
        turnScreenOffWhileSleeping: {
          $id: "#/properties/octodash/properties/turnScreenOffWhileSleeping",
          type: "boolean",
        },
        preferPreviewWhilePrinting: {
          $id: "#/properties/octodash/properties/preferPreviewWhilePrinting",
          type: "boolean",
        },
      },
    },
  },
};
