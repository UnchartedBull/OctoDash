import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import _ from 'lodash-es';
import { ElectronService } from 'ngx-electron';

import { Config } from './config/config.model';
import { ConfigService } from './config/config.service';
import { NotificationService } from './notification/notification.service';

@Injectable()
export class AppService {
  private updateError: Record<string, (config: Config) => void>;
  private latestVersionAssetsURL: string;
  private version: string;
  private latestVersion: string;

  public updateAvailable = false;

  public constructor(
    private configService: ConfigService,
    private notificationService: NotificationService,
    private http: HttpClient,
    private electronService: ElectronService,
  ) {
    this.enableVersionListener();
    this.enableCustomCSSListener();
    this.electronService.ipcRenderer.send('appInfo');

    // list of all error following an upgrade
    this.updateError = {
      ".printer should have required property 'zBabystepGCode'": config => (config.printer.zBabystepGCode = 'M290 Z'),
      ".plugins should have required property 'tpLinkSmartPlug'": config =>
        (config.plugins.tpLinkSmartPlug = { enabled: true, smartPlugIP: '127.0.0.1' }),
      ".octodash should have required property 'previewProgressCircle'": config =>
        (config.octodash.previewProgressCircle = false),
      ".octodash should have required property 'turnOnPrinterWhenExitingSleep'": config => {
        config.octodash.turnOnPrinterWhenExitingSleep = config.plugins.psuControl.turnOnPSUWhenExitingSleep ?? false;
        delete config.plugins.psuControl.turnOnPSUWhenExitingSleep;
      },
      ".octodash should have required property 'screenSleepCommand'": config =>
        (config.octodash.screenSleepCommand = 'xset dpms force standby'),
      ".octodash should have required property 'screenWakeupCommand'": config =>
        (config.octodash.screenWakeupCommand = 'xset s off && xset -dpms && xset s noblank'),
      ".printer should have required property 'disableExtruderGCode'": config =>
        (config.printer.disableExtruderGCode = 'M18 E'),
    };
  }

  private checkUpdate(): void {
    this.http.get('https://api.github.com/repos/UnchartedBull/OctoDash/releases/latest').subscribe(
      (data: GitHubReleaseInformation): void => {
        if (this.version !== data.name.replace('v', '')) {
          this.updateAvailable = true;
        }
        this.latestVersion = data.name.replace('v', '');
        this.latestVersionAssetsURL = data.assets_url;
      },
      (): void => null,
    );
    setTimeout(this.checkUpdate.bind(this), 3600000);
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
    this.electronService.ipcRenderer.on('versionInformation', (_, versionInformation: VersionInformation): void => {
      this.version = versionInformation.version;
      this.checkUpdate();
    });
  }

  private enableCustomCSSListener(): void {
    this.electronService.ipcRenderer.on('customStyles', (_, customCSS: string): void => {
      const css = document.createElement('style');
      css.appendChild(document.createTextNode(customCSS));
      document.head.append(css);
    });

    this.electronService.ipcRenderer.on('customStylesError', (_, customCSSError: string): void => {
      this.notificationService.setError("Can't load custom styles!", customCSSError);
    });
  }

  public getVersion(): string {
    return this.version;
  }

  public getLatestVersion(): string {
    return this.latestVersion;
  }

  public getLatestVersionAssetsURL(): string {
    return this.latestVersionAssetsURL;
  }

  public turnDisplayOff(): void {
    this.electronService.ipcRenderer.send('screenControl', { command: this.configService.getScreenSleepCommand() });
  }

  public turnDisplayOn(): void {
    this.electronService.ipcRenderer.send('screenControl', { command: this.configService.getScreenWakeupCommand() });
  }
}

interface VersionInformation {
  version: string;
}

interface GitHubReleaseInformation {
  name: string;
  // eslint-disable-next-line camelcase
  assets_url: string;
  [key: string]: string;
}
