import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _ from 'lodash-es';

import { defaultConfig } from './config/config.default';
import { Config } from './config/config.model';
import { ConfigService } from './config/config.service';
import { ElectronService } from './electron.service';
import { NotificationType } from './model';
import { NotificationService } from './notification/notification.service';

@Injectable()
export class AppService {
  private updateError: Record<string, (config: Config) => void>;
  private latestVersionAssetsURL: string;
  private version: string;
  private latestVersion: {
    version: string;
    title: string;
  } = {
    version: '',
    title: '',
  };

  public updateAvailable = false;
  public dev = !!process.env.APP_DEV;

  public constructor(
    private configService: ConfigService,
    private notificationService: NotificationService,
    private http: HttpClient,
    private electronService: ElectronService,
  ) {
    this.enableVersionListener();
    this.enableCustomCSSListener();
    this.electronService.send('appInfo');

    // list of all error following an upgrade
    this.updateError = {
      "/plugins must have required property 'companion'": config =>
        (config.plugins.companion = defaultConfig.plugins.companion),
      "/printer must have required property 'zBabystepGCode'": config =>
        (config.printer.zBabystepGCode = defaultConfig.printer.zBabystepGCode),
      "/plugins must have required property 'tpLinkSmartPlug'": config =>
        (config.plugins.tpLinkSmartPlug = defaultConfig.plugins.tpLinkSmartPlug),
      "/plugins must have required property 'tasmota'": config =>
        (config.plugins.tasmota = defaultConfig.plugins.tasmota),
      "/plugins must have required property 'tasmotaMqtt'": config =>
        (config.plugins.tasmotaMqtt = defaultConfig.plugins.tasmotaMqtt),
      "/plugins must have required property 'tuya'": config => (config.plugins.tuya = defaultConfig.plugins.tuya),
      "/plugins must have required property 'wemo'": config => (config.plugins.wemo = defaultConfig.plugins.wemo),
      "/octodash must have required property 'previewProgressCircle'": config =>
        (config.octodash.previewProgressCircle = defaultConfig.octodash.previewProgressCircle),
      "/octodash must have required property 'turnOnPrinterWhenExitingSleep'": config => {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        config.octodash.turnOnPrinterWhenExitingSleep =
          (config.plugins.psuControl as any).turnOnPSUWhenExitingSleep ?? false;
        /* eslint-disable @typescript-eslint/no-explicit-any */
        delete (config.plugins.psuControl as any).turnOnPSUWhenExitingSleep;
      },
      "/octodash must have required property 'screenSleepCommand'": config =>
        (config.octodash.screenSleepCommand = defaultConfig.octodash.screenSleepCommand),
      "/octodash must have required property 'screenWakeupCommand'": config =>
        (config.octodash.screenWakeupCommand = defaultConfig.octodash.screenWakeupCommand),
      "/octodash must have required property 'invertAxisControl'": config =>
        (config.octodash.invertAxisControl = defaultConfig.octodash.invertAxisControl),
      "/printer must have required property 'disableExtruderGCode'": config =>
        (config.printer.disableExtruderGCode = defaultConfig.printer.disableExtruderGCode),
      "/octodash must have required property 'showExtruderControl'": config =>
        (config.octodash.showExtruderControl = defaultConfig.octodash.showExtruderControl),
      "/plugins must have required property 'spoolManager'": config =>
        (config.plugins.spoolManager = defaultConfig.plugins.spoolManager),
      "/plugins must have required property 'ophom'": config => (config.plugins.ophom = defaultConfig.plugins.ophom),
      "/octodash must have required property 'showNotificationCenterIcon'": config =>
        (config.octodash.showNotificationCenterIcon = defaultConfig.octodash.showNotificationCenterIcon),
      "/octodash must have required property 'defaultDirectory'": config =>
        (config.octodash.defaultDirectory = defaultConfig.octodash.defaultDirectory),
    };
  }

  private checkUpdate(): void {
    if (this.dev) {
      // Disable updates in developer mode
      return;
    }

    this.http.get('https://api.github.com/repos/UnchartedBull/OctoDash/releases/latest').subscribe({
      next: (data: GitHubReleaseInformation): void => {
        this.latestVersion = { version: data.tag_name.replace('v', ''), title: data.name };
        this.latestVersionAssetsURL = data.assets_url;
        if (this.version != this.latestVersion.version) {
          if (!this.updateAvailable) {
            // Display notification first time that update is detected
            this.notificationService.setNotification({
              heading: $localize`:@@update-available:Update available!`,
              text: $localize`:@@update-available-long:Version ${this.latestVersion.title} is available. Go to Settings > About to update.`,
              type: NotificationType.INFO,
              time: new Date(),
            });
          }

          this.updateAvailable = true;
        }
      },
      complete: () => setTimeout(this.checkUpdate.bind(this), 3600000),
    });
  }

  public hasUpdateError(errors: string[]): boolean {
    return _.intersection(errors, _.keys(this.updateError)).length > 0;
  }

  public fixUpdateErrors(errors: string[]): boolean {
    const config = this.configService.getCurrentConfig();

    config.octoprint.url = config.octoprint.url.replace('api/', '');

    let fullyFixed = true;
    for (const error of errors) {
      if (_.hasIn(this.updateError, error)) {
        this.updateError[error](config);
      } else {
        fullyFixed = false;
      }
    }
    this.configService.saveConfig(config);

    return fullyFixed;
  }

  private enableVersionListener(): void {
    this.electronService.on('versionInformation', (_, versionInformation: VersionInformation): void => {
      this.version = versionInformation.version;
      this.checkUpdate();
    });
  }

  private enableCustomCSSListener(): void {
    this.electronService.on('customStyles', (_, customCSS: string): void => {
      const css = document.createElement('style');
      css.appendChild(document.createTextNode(customCSS));
      document.head.append(css);
    });

    this.electronService.on('customStylesError', (_, customCSSError: string): void => {
      this.notificationService.setNotification({
        heading: $localize`:@@error-load-style:Can't load custom styles!`,
        text: customCSSError,
        type: NotificationType.ERROR,
        time: new Date(),
      });
    });
  }

  public getVersion(): string {
    return this.version;
  }

  public getLatestVersion(): { version: string; title: string } {
    return this.latestVersion;
  }

  public getLatestVersionAssetsURL(): string {
    return this.latestVersionAssetsURL;
  }

  public turnDisplayOff(): void {
    this.electronService.send('screenControl', { command: this.configService.getScreenSleepCommand() });
  }

  public turnDisplayOn(): void {
    this.electronService.send('screenControl', { command: this.configService.getScreenWakeupCommand() });
  }
}

interface VersionInformation {
  version: string;
}

interface GitHubReleaseInformation {
  name: string;

  assets_url: string;
  [key: string]: string;
}
