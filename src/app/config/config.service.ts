import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import Ajv from 'ajv';
import _ from 'lodash';

import { NotificationService } from '../notification/notification.service';
import { Config, CustomAction, HttpHeader, URLSplit } from './config.model';
import { configSchema } from './config.schema';

@Injectable({
  providedIn: 'root',
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
    this.validator = ajv.compile(configSchema);
    try {
      const Store = window.require('electron-store');
      this.store = new Store();
      this.initialize(this.store.get('config'));
    } catch (e) {
      console.error(e);
      this.notificationService.setError(
        "Can't read config file!",
        'Please restart your system. If the issue persists open an issue on GitHub.',
      );
    }
  }

  private initialize(config: Config): void {
    this.config = config;
    this.valid = this.validate();
    if (this.valid) {
      this.generateHttpHeaders();
    }
    this.initialized = true;
  }

  public generateHttpHeaders(): void {
    this.httpHeaders = {
      headers: new HttpHeaders({
        'x-api-key': this.config.octoprint.accessToken,
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        Expires: '0',
      }),
    };
  }

  public getRemoteConfig(): Config {
    return this.store.get('config');
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
      if (error.keyword === 'type') {
        errors.push(`${error.dataPath} ${error.message}`);
      } else {
        errors.push(`${error.dataPath === '' ? '.' : error.dataPath} ${error.message}`);
      }
    });
    console.error(errors);
    return errors;
  }

  public saveConfig(config: Config): string {
    try {
      this.store.set('config', config);
      const configStored = this.store.get('config');
      if (this.validateGiven(configStored)) {
        this.config = config;
        this.generateHttpHeaders();
        return null;
      } else {
        return 'Saved config is invalid!';
      }
    } catch {
      return 'Saving config failed!';
    }
  }

  public splitOctoprintURL(octoprintURL: string): URLSplit {
    const host = octoprintURL.split(':')[1].replace('//', '');
    const port = parseInt(octoprintURL.split(':')[2].replace('/api/', ''), 10);

    return {
      host,
      port: isNaN(port) ? null : port,
    };
  }

  public mergeOctoprintURL(urlSplit: URLSplit): string {
    // TODO: remove api/ from URL for v2.2.0
    if (urlSplit.port !== null || !isNaN(urlSplit.port)) {
      return `http://${urlSplit.host}:${urlSplit.port}/api/`;
    } else {
      return `http://${urlSplit.host}/api/`;
    }
  }

  public createConfigFromInput(config: Config): Config {
    const configOut = _.cloneDeep(config);
    configOut.octoprint.url = this.mergeOctoprintURL(config.octoprint.urlSplit);
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

  public getAutomaticPrinterPowerOn(): boolean {
    return this.config.octodash.turnOnPrinterWhenExitingSleep;
  }

  public useTpLinkSmartPlug(): boolean {
    return this.config.plugins.tpLinkSmartPlug.enabled;
  }

  public getSmartPlugIP(): string {
    return this.config.plugins.tpLinkSmartPlug.smartPlugIP;
  }
  public getFilamentThickness(): number {
    return this.config.filament.thickness;
  }

  public getFilamentDensity(): number {
    return this.config.filament.density;
  }

  public getDefaultSortingAttribute(): 'name' | 'date' | 'size' {
    return this.config.octodash.fileSorting.attribute;
  }

  public getDefaultSortingOrder(): 'asc' | 'dsc' {
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

  public getAccessKey(): string {
    return this.config.octoprint.accessToken;
  }

  public getZBabystepGCode(): string {
    return this.config.printer.zBabystepGCode;
  }

  public getPreviewProgressCircle(): boolean {
    return this.config.octodash.previewProgressCircle;
  }
}
