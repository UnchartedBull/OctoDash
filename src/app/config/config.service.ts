import { HttpHeaders } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import _ from 'lodash-es';

import { ElectronService } from '../electron.service';
import { NotificationType } from '../model';
import { NotificationService } from '../notification/notification.service';
import { BackendType, Config, CustomAction, HttpHeader, PreheatConfiguration } from './config.model';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private config: Config;
  private valid: boolean;
  private errors: string[];
  private update = false;
  private initialized = false;

  private httpHeaders: HttpHeader;

  public constructor(
    private notificationService: NotificationService,
    private electronService: ElectronService,
    private zone: NgZone,
  ) {
    // TODO: reload instead or might not be needed
    // this.electronService.on('configSaved', (_, config: Config) => this.initialize(config));
    this.electronService.on('configError', (_, error: string) => {
      this.notificationService.setNotification({
        heading: error,
        text: $localize`:@@error-restart:Please restart your system. If the issue persists open an issue on GitHub.`,
        type: NotificationType.ERROR,
        time: new Date(),
        sticky: true,
      });
    });
  }

  public async readConfig(): Promise<void> {
    let resolvePromise;

    setTimeout(() => resolvePromise(), 4000);

    this.electronService.on('configRead', (_, config: Config) => {
      this.zone.run(() => {
        this.config = config;
        this.electronService.send('checkConfig', config);
      });
    });

    this.electronService.on('configPass', () => {
      this.zone.run(() => {
        this.valid = true;
        this.generateHttpHeaders();
        this.initialized = true;

        resolvePromise();
      });
    });

    this.electronService.on('configFail', (_, errors) => {
      this.zone.run(() => {
        this.valid = false;
        this.errors = errors;
        this.initialized = true;

        console.error(errors);
        resolvePromise();
      });
    });

    this.electronService.send('readConfig');

    return new Promise(resolve => {
      resolvePromise = resolve;
    });
  }

  public generateHttpHeaders(): void {
    if (this.isOctoprintBackend()) {
      this.httpHeaders = {
        headers: new HttpHeaders({
          'x-api-key': this.config.backend.accessToken,
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          Expires: '0',
        }),
      };
    } else {
      this.httpHeaders = {
        headers: new HttpHeaders({}),
      };
    }
  }

  public saveConfig(config: Config, reload = true): void {
    this.electronService.send('saveConfig', config);
    if (reload) {
      this.electronService.send('reload');
    }
  }

  public getCurrentConfig(): Config {
    return _.cloneDeep(this.config);
  }

  public isEqualToCurrentConfig(changedConfig: Config): boolean {
    return _.isEqual(this.config, changedConfig);
  }

  public getErrors(): string[] {
    return this.errors;
  }

  public setUpdate(): void {
    this.update = true;
  }

  // CONFIG ACCESS METHODS
  public getHTTPHeaders(): HttpHeader {
    return this.httpHeaders;
  }

  public getApiURL(path: string, includeApi = this.isOctoprintBackend() ? true : false): string {
    return `${this.config.backend.url}/${includeApi ? 'api/' : ''}${path}`;
  }

  public getAPIPollingInterval(): number {
    return this.config.backend.pollingInterval;
  }

  public isOctoprintBackend(): boolean {
    return this.config.backend.type === BackendType.OCTOPRINT;
  }

  public isMoonrakerBackend(): boolean {
    return this.config.backend.type === BackendType.MOONRAKER;
  }

  public getPrinterName(): string {
    return this.config.printer.name;
  }

  public getCustomActions(): CustomAction[] {
    return this.config.customActions;
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
    return this.config.screen.touchscreen;
  }

  public getAutomaticScreenSleep(): boolean {
    return this.config.screen.turnOffWhileSleeping;
  }

  public getAutomaticPrinterPowerOn(): boolean {
    return this.config.customization.turnOnPrinterWhenExitingSleep;
  }

  public getDefaultSortingAttribute(): 'name' | 'date' | 'size' {
    return this.config.customization.fileSorting.attribute;
  }

  public getDefaultSortingOrder(): 'asc' | 'dsc' {
    return this.config.customization.fileSorting.order;
  }

  public getDefaultHotendTemperature(): number {
    return this.config.preheatConfigurations[0].hotend;
  }

  public getDefaultHeatbedTemperature(): number {
    return this.config.preheatConfigurations[0].heatbed;
  }

  public getDefaultFanSpeed(): number {
    return this.config.preheatConfigurations[0].fan;
  }

  public getPreheatConfigurations(): Array<PreheatConfiguration> {
    return this.config.preheatConfigurations;
  }

  public getAmbientTemperatureSensorName(): number {
    return this.config.octoprint?.plugins.enclosure.ambientSensorID;
  }

  public usePSUControl(): boolean {
    return this.config.octoprint.plugins.psuControl.enabled;
  }

  public useOphomControl(): boolean {
    return this.config.octoprint.plugins.ophom.enabled;
  }

  public useTpLinkSmartPlug(): boolean {
    return this.config.octoprint.plugins.tpLinkSmartPlug.enabled;
  }

  public getSmartPlugIP(): string {
    return this.config.octoprint.plugins.tpLinkSmartPlug.smartPlugIP;
  }

  public useTasmota(): boolean {
    return this.config.octoprint.plugins.tasmota.enabled;
  }

  public getTasmotaIP(): string {
    return this.config.octoprint.plugins.tasmota.ip;
  }

  public getTasmotaIndex(): number {
    return this.config.octoprint.plugins.tasmota.index;
  }

  public useTasmotaMqtt(): boolean {
    return this.config.octoprint.plugins.tasmotaMqtt.enabled;
  }

  public getTasmotaMqttTopic(): string {
    return this.config.octoprint.plugins.tasmotaMqtt.topic;
  }

  public getTasmotaMqttRelayNumber(): number {
    return this.config.octoprint.plugins.tasmotaMqtt.relayNumber;
  }

  public isDisplayLayerProgressEnabled(): boolean {
    return this.config.octoprint.plugins.displayLayerProgress.enabled;
  }

  public isPreheatPluginEnabled(): boolean {
    return this.config.octoprint.plugins.preheatButton.enabled;
  }

  public isFilamentManagerUsed(): boolean {
    return this.config.octoprint.plugins.filamentManager.enabled || this.config.octoprint.plugins.spoolManager.enabled;
  }

  public isSpoolManagerPluginEnabled(): boolean {
    return this.config.octoprint.plugins.spoolManager.enabled;
  }

  // TODO

  public getFeedLength(): number {
    return this.config.filamentChange.integrated.feedLength;
  }

  public getFeedSpeed(): number {
    return this.config.filamentChange.integrated.feedSpeed;
  }

  public getFeedSpeedSlow(): number {
    return this.config.filamentChange.integrated.feedSpeedSlow;
  }

  public getPurgeDistance(): number {
    return this.config.filamentChange.integrated.purgeDistance;
  }

  public useM600(): boolean {
    return false;
  }

  public showThumbnailByDefault(): boolean {
    return this.config.customization.preferPreviewWhilePrinting;
  }

  public getAccessKey(): string {
    return this.config.backend.accessToken;
  }

  public getDisableExtruderGCode(): string {
    return this.config.backend.commands.disableExtruder;
  }

  public getZBabystepGCode(): string {
    return this.config.backend.commands.babystepZ;
  }

  public getPreviewProgressCircle(): boolean {
    return this.config.customization.previewProgressCircle;
  }

  public getScreenSleepCommand(): string {
    return this.config.screen.sleepCommand;
  }

  public getScreenWakeupCommand(): string {
    return this.config.screen.wakeupCommand;
  }

  public getShowExtruderControl(): boolean {
    return this.config.customization.showExtruderControl;
  }

  public isXAxisInverted(): boolean {
    return this.config.customization.invertAxisControl.x;
  }

  public isYAxisInverted(): boolean {
    return this.config.customization.invertAxisControl.y;
  }

  public isZAxisInverted(): boolean {
    return this.config.customization.invertAxisControl.z;
  }

  public setSortingAttribute(attribute: 'name' | 'date' | 'size'): void {
    this.config.customization.fileSorting.attribute = attribute;
    this.saveConfig(this.config);
  }

  public setSortingOrder(order: 'asc' | 'dsc'): void {
    this.config.customization.fileSorting.order = order;
    this.saveConfig(this.config);
  }

  public showNotificationCenterIcon(): boolean {
    return this.config.customization.showNotificationCenterIcon;
  }
}
