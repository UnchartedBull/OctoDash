import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, NgZone } from '@angular/core';
import { Ajv } from 'ajv';
import * as _ from 'lodash-es';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';

import configSchema from '../helper/config.schema.json' with { type: 'json' };
import { ConfigSchema as Config, CustomAction, URLSplit } from '../model';

const ajv = new Ajv({ useDefaults: true, allErrors: true });

// Define keywords for schema->TS converter
ajv.addKeyword('tsEnumNames');
ajv.addKeyword('tsName');
ajv.addKeyword('tsType');

const validate = ajv.compile(configSchema);

export class ConfigValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigValidationError';
  }
}

interface HttpHeader {
  headers: HttpHeaders;
}

interface OctoPrintConfig {
  plugins: {
    octodash: Config;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private config: Config;
  private valid: boolean;
  private update = false;

  private httpHeaders: HttpHeader;
  private apiKey: string;

  private http: HttpClient = inject(HttpClient);
  private zone: NgZone = inject(NgZone);

  private errors$ = new BehaviorSubject<string[]>([]);

  private validateConfig(config: Config): boolean {
    const result = validate(config);
    if (!result) {
      this.errors$.next(
        validate.errors.map(error => {
          if (error.keyword === 'type') {
            return `${error.instancePath} ${error.message}`;
          } else {
            return `${error.instancePath === '' ? '/' : error.instancePath} ${error.message}: ${JSON.stringify(error.params)}`;
          }
        }),
      );
    }
    return result;
  }

  public getConfig() {
    this.apiKey = localStorage.getItem('octodash_apikey');
    let headers = null;
    if (this.apiKey) {
      headers = new HttpHeaders({ 'x-api-key': this.apiKey });
    } else {
      console.log('API key found, attempting login with cookie');
    }

    return this.http
      .get<OctoPrintConfig>('/api/settings', { headers: headers ?? new HttpHeaders() })
      .pipe(
        map(response => {
          return response.plugins.octodash;
        }),
      )
      .pipe(
        tap(config => {
          if (!this.validateConfig(config)) {
            throw new ConfigValidationError('Invalid config');
            // console.error('Invalid config:', config);
            // this.router.navigate(['/no-config']);
          }
        }),
      )
      .pipe(
        map((config: Config) => {
          this.config = { ...config };
          this.zone.run(() => {
            this.generateHttpHeaders();
            this.valid = true;
          });
        }),
      );
  }

  public resetConfig() {
    return this.http.post(this.getApiURL('plugin/octodash/api/settings_reset', false), {}, this.getHTTPHeaders());
  }

  public generateHttpHeaders(): void {
    const headers = new HttpHeaders({
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
      Expires: '0',
    });
    if (this.apiKey) {
      this.httpHeaders = {
        headers: headers.append('x-api-key', this.apiKey),
      };
      return;
    }

    this.httpHeaders = {
      headers,
    };
  }

  public getAccessToken(): string {
    return this.apiKey;
  }

  public setAccessToken(token: string): void {
    this.apiKey = token;
    localStorage.setItem('octodash_apikey', token);
    this.generateHttpHeaders();
  }

  public getCurrentConfig(): Config {
    return _.cloneDeep(this.config);
  }

  public isEqualToCurrentConfig(changedConfig: Config): boolean {
    return _.isEqual(this.config, changedConfig);
  }

  public getErrors(): Observable<string[]> {
    return this.errors$.asObservable();
  }

  public saveConfig(config: Config) {
    return this.http.post(this.getApiURL('settings'), { plugins: { octodash: config } }, this.getHTTPHeaders());
  }

  public splitOctoprintURL(octoprintURL: string): URLSplit {
    const host = octoprintURL.split(':')[1].replace('//', '');
    const port = parseInt(octoprintURL.split(':')[2], 10);

    return {
      host,
      port: isNaN(port) ? null : port,
    };
  }

  public mergeOctoprintURL(urlSplit: URLSplit): string {
    if (urlSplit.port !== null || !isNaN(urlSplit.port)) {
      return `http://${urlSplit.host}:${urlSplit.port}/`;
    } else {
      return `http://${urlSplit.host}/`;
    }
  }

  public createConfigFromInput(config: Config): Config {
    return _.cloneDeep(config);
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

  public getApiURL(path: string, includeApi = true): string {
    if (includeApi) return `/api/${path}`;
    else return `/${path}`;
  }

  public getAPIPollingInterval(): number {
    return this.config.octodash.pollingInterval;
  }

  public getPrinterName(): string {
    return this.config?.printer?.name;
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
    return this.config !== null;
  }

  public isValid(): boolean {
    return this.valid;
  }

  public isUpdate(): boolean {
    return this.update;
  }

  public isTouchscreen(): boolean {
    return this.config?.octodash?.touchscreen;
  }

  public getAmbientTemperatureSensorName(): number {
    return this.config?.plugins?.enclosure.ambientSensorID;
  }

  public getAutomaticScreenSleep(): boolean {
    return this.config.octodash.turnScreenOffWhileSleeping;
  }

  public getAutomaticPrinterPowerOn(): boolean {
    return this.config.octodash.turnOnPrinterWhenExitingSleep;
  }

  public usePSUControl(): boolean {
    return this.config.plugins.psucontrol.inUse;
  }

  public useOphomControl(): boolean {
    return this.config.plugins.ophom.inUse;
  }

  public useTuya(): boolean {
    return this.config.plugins.tuyasmartplug.inUse;
  }

  public getTuyaLabel(): string {
    return this.config.plugins.tuyasmartplug.label;
  }

  public useTpLinkSmartPlug(): boolean {
    return this.config.plugins.tplinksmartplug.inUse;
  }

  public getSmartPlugIP(): string {
    return this.config.plugins.tplinksmartplug.smartPlugIP;
  }

  public useTasmota(): boolean {
    return this.config.plugins.tasmota.inUse;
  }

  public getTasmotaIP(): string {
    return this.config.plugins.tasmota.ip;
  }

  public getTasmotaIndex(): number {
    return this.config.plugins.tasmota.index;
  }

  public useTasmotaMqtt(): boolean {
    return this.config.plugins.tasmota_mqtt.inUse;
  }

  public getTasmotaMqttTopic(): string {
    return this.config.plugins.tasmota_mqtt.topic;
  }

  public getTasmotaMqttRelayNumber(): number {
    return this.config.plugins.tasmota_mqtt.relayNumber;
  }

  public useWemo(): boolean {
    return this.config.plugins.wemo.inUse;
  }

  public getWemoIP(): string {
    return `${this.config.plugins.wemo.ip}:${this.config.plugins.wemo.port}`;
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

  public isDisplayLayerProgressEnabled(): boolean {
    return this.config.plugins.DisplayLayerProgress.inUse;
  }

  public isPreheatPluginEnabled(): boolean {
    return this.config.plugins.preheat.inUse;
  }

  public isFilamentManagerUsed(): boolean {
    return (
      this.config.plugins.filamentmanager.enabled ||
      this.config.plugins.SpoolManager.enabled ||
      this.config.plugins.Spoolman.enabled
    );
  }

  public isSpoolmanPluginEnabled(): boolean {
    return this.config.plugins.Spoolman.enabled;
  }

  public isSpoolManagerPluginEnabled(): boolean {
    return this.config.plugins.SpoolManager.enabled;
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
    return this.config?.octodash?.preferPreviewWhilePrinting;
  }

  public getDisableExtruderGCode(): string {
    return this.config.printer.disableExtruderGCode;
  }

  public getZBabystepGCode(): string {
    return this.config.printer.zBabystepGCode;
  }

  public getPreviewProgressCircle(): boolean {
    return this.config.octodash.previewProgressCircle;
  }

  public getScreenSleepCommand(): string {
    return this.config.octodash.screenSleepCommand;
  }

  public getScreenOffDelay(): number {
    return this.config.octodash.screenSleepDelay;
  }

  public getScreenWakeupCommand(): string {
    return this.config.octodash.screenWakeupCommand;
  }

  public getShowExtruderControl(): boolean {
    return this.config.octodash.showExtruderControl;
  }

  public isXAxisInverted(): boolean {
    return this.config.octodash.invertAxisControl.x;
  }

  public isYAxisInverted(): boolean {
    return this.config.octodash.invertAxisControl.y;
  }

  public isZAxisInverted(): boolean {
    return this.config.octodash.invertAxisControl.z;
  }

  public setSortingAttribute(attribute: 'name' | 'date' | 'size'): void {
    this.config.octodash.fileSorting.attribute = attribute;
    this.saveConfig(this.config);
  }

  public setSortingOrder(order: 'asc' | 'dsc'): void {
    this.config.octodash.fileSorting.order = order;
    this.saveConfig(this.config);
  }

  public showActionCenterIcon(): boolean {
    return this.config.octodash.showActionCenterIcon;
  }

  public getDefaultDirectory(): string {
    return this.config.octodash.defaultDirectory;
  }
}
