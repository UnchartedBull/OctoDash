import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _ from 'lodash-es';

import defaultConfig from '../helper/config.default.json';
import { ConfigSchema as Config } from '../model';
import { ConfigService } from './config.service';
import { ElectronService } from './electron.service';
import { NotificationService } from './notification.service';

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
    /* eslint-disable @typescript-eslint/no-explicit-any */
    this.updateError = {
      '/octodash must NOT have additional properties': config => {
        if ('showNotificationCenterIcon' in (config.octodash as any)) {
          config.octodash.showActionCenterIcon = (config.octodash as any).showNotificationCenterIcon;
          delete (config.octodash as any).showNotificationCenterIcon;
        }
      },
      "/plugins must have required property 'tuya'": config => {
        config.plugins.tuya = defaultConfig.plugins.tuya;
      },
      "/plugins must have required property 'wemo'": config => {
        config.plugins.wemo = defaultConfig.plugins.wemo;
      },
      "/plugins must have required property 'companion'": config => {
        config.plugins.companion = defaultConfig.plugins.companion;
      },
      '/plugins/psuControl must NOT have additional properties': config => {
        if ('turnOnPSUWhenExitingSleep' in (config.plugins.psuControl as any)) {
          delete (config.plugins.psuControl as any).turnOnPSUWhenExitingSleep;
        }
      },
      '/plugins/ophom must NOT have additional properties': config => {
        if ('turnOnPSUWhenExitingSleep' in (config.plugins.ophom as any)) {
          delete (config.plugins.ophom as any).turnOnPSUWhenExitingSleep;
        }
      },
    };
    /* eslint-enable @typescript-eslint/no-explicit-any */
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
            this.notificationService.info(
              $localize`:@@update-available:Update available!`,
              $localize`:@@update-available-long:Version ${this.latestVersion.title} is available. Go to Settings > About to update.`,
            );
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
      this.notificationService.warn($localize`:@@error-load-style:Can't load custom styles!`, customCSSError);
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

  public loadCustomStyles(): void {
    this.http.get('http://localhost:8080/plugin/octodash/custom-styles.css', { responseType: 'text' }).subscribe({
      next: (styles: string) => {
        const styleElement = document.createElement('style');
        styleElement.innerHTML = styles;
        document.head.appendChild(styleElement);
      },
      error: error =>
        this.notificationService.error($localize`:@@custom-styles-error:Error loading custom styles`, error.message),
    });
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
