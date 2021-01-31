import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import _ from 'lodash';
import { ElectronService } from 'ngx-electron';

import { Config } from './config/config.model';
import { ConfigService } from './config/config.service';
import { NotificationService } from './notification/notification.service';
import { SocketService } from './octoprint/socket.service';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  private _updateError: Record<string, (config: Config) => void>;
  private _latestVersionAssetsURL: string;
  private _version: string;
  private _latestVersion: string;

  public updateAvailable = false;

  public constructor(
    private _configService: ConfigService,
    private _notificationService: NotificationService,
    private _http: HttpClient,
    private _electronService: ElectronService,
    private _socketService: SocketService,
  ) {
    this.enableVersionListener();
    this.enableCustomCSSListener();
    this._electronService.ipcRenderer.send('appInfo');

    // this._socketService = this._injector.get(OctoPrintSocketService);

    // list of all error following an upgrade
    this._updateError = {
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
    };
  }

  public fixUpdateErrors(errors: string[]): boolean {
    const config = this._configService.getCurrentConfig();

    config.octoprint.url = config.octoprint.url.replace('api/', '');
    console.log(config.octoprint);

    let fullyFixed = true;
    for (const error of errors) {
      if (_.hasIn(this._updateError, error)) {
        this._updateError[error](config);
      } else {
        fullyFixed = false;
      }
    }
    this._configService.saveConfig(config);
    return fullyFixed;
  }

  private enableVersionListener(): void {
    this._electronService.ipcRenderer.on('versionInformation', (_, versionInformation: VersionInformation): void => {
      this._version = versionInformation.version;
      this.checkUpdate();
    });
  }

  private enableCustomCSSListener(): void {
    this._electronService.ipcRenderer.on('customStyles', (_, customCSS: string): void => {
      const css = document.createElement('style');
      css.appendChild(document.createTextNode(customCSS));
      document.head.append(css);
    });

    this._electronService.ipcRenderer.on('customStylesError', (_, customCSSError: string): void => {
      this._notificationService.setError("Can't load custom styles!", customCSSError);
    });
  }

  private checkUpdate(): void {
    this._http.get('https://api.github.com/repos/UnchartedBull/OctoDash/releases/latest').subscribe(
      (data: GitHubReleaseInformation): void => {
        if (this.version !== data.name.replace('v', '')) {
          this.updateAvailable = true;
        }
        this._latestVersion = data.name.replace('v', '');
        this._latestVersionAssetsURL = data.assets_url;
      },
      (): void => null,
    );
    setTimeout(this.checkUpdate.bind(this), 3600000);
  }

  public get version(): string {
    return this._version;
  }

  public get latestVersion(): string {
    return this._latestVersion;
  }

  public turnDisplayOff(): void {
    this._electronService.ipcRenderer.send('screenControl', { command: this._configService.getScreenSleepCommand() });
  }

  public turnDisplayOn(): void {
    this._electronService.ipcRenderer.send('screenControl', { command: this._configService.getScreenWakeupCommand() });
  }

  public hasUpdateError(errors: string[]): boolean {
    return _.intersection(errors, _.keys(this._updateError)).length > 0;
  }

  public get latestVersionAssetsURL(): string {
    return this._latestVersionAssetsURL;
  }

  public connectSocket(): void {
    this._socketService.connect();
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
