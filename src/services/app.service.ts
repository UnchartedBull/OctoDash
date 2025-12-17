import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _ from 'lodash-es';

import defaultConfig from '../helper/config.default.json';
import { ConfigSchema as Config } from '../model';
import { ConfigService } from './config.service';
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
  public dev = false; // TODO: intelligently determine this

  public constructor(
    private configService: ConfigService,
    private notificationService: NotificationService,
    private http: HttpClient,
  ) {
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
      "/plugins must have required property 'spoolman'": config => {
        config.plugins.spoolman = defaultConfig.plugins.spoolman;
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

    // TODO: Fix or just remove this hole block
    // config.octoprint.url = config.octoprint.url.replace('api/', '');

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
    this.http.post('/plugin/octodash/api/screen_sleep', {}, this.configService.getHTTPHeaders()).subscribe({
      error: error =>
        this.notificationService.error($localize`:@@screen-sleep-error:Error turning display off`, error.message),
    });
  }

  public turnDisplayOn(): void {
    this.http.post('/plugin/octodash/api/screen_wakeup', {}, this.configService.getHTTPHeaders()).subscribe();
  }

  public loadCustomStyles(): void {
    this.http.get('/plugin/octodash/custom-styles.css', { responseType: 'text' }).subscribe({
      next: (styles: string) => {
        const styleElement = document.createElement('style');
        styleElement.innerHTML = styles;
        document.head.appendChild(styleElement);
      },
      error: error =>
        this.notificationService.warn($localize`:@@error-load-style:Can't load custom styles!`, error.message),
    });
  }
}

// interface VersionInformation {
//   version: string;
// }

interface GitHubReleaseInformation {
  name: string;

  assets_url: string;
  [key: string]: string;
}
