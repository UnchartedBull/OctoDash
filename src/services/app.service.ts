import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

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
  // public dev = !!process.env.APP_DEV;
  public dev = true; // TODO: remove this line before release

  public constructor(
    private configService: ConfigService,
    private notificationService: NotificationService,
    private http: HttpClient,
  ) {}

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
}

// interface VersionInformation {
//   version: string;
// }

interface GitHubReleaseInformation {
  name: string;

  assets_url: string;
  [key: string]: string;
}
