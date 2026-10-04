import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BasePathService } from './base-path.service';
import { ConfigService } from './config.service';
import { NotificationService } from './notification.service';

export interface VersionInformation {
  current_version: string;
}

@Injectable()
export class AppService {
  private basePathService = inject(BasePathService);

  public constructor(
    private configService: ConfigService,
    private notificationService: NotificationService,
    private http: HttpClient,
  ) {}

  public getVersionInfo(): Observable<VersionInformation> {
    return this.http.get<VersionInformation>(`${this.basePathService.getBasePath()}/plugin/octodash/api/update_check`);
  }

  public turnDisplayOff(): void {
    this.http
      .post(
        `${this.basePathService.getBasePath()}/plugin/octodash/api/screen_sleep`,
        {},
        this.configService.getHTTPHeaders(),
      )
      .subscribe({
        error: error =>
          this.notificationService.error($localize`:@@screen-sleep-error:Error turning display off`, error.message),
      });
  }

  public turnDisplayOn(): void {
    this.http
      .post(
        `${this.basePathService.getBasePath()}/plugin/octodash/api/screen_wakeup`,
        {},
        this.configService.getHTTPHeaders(),
      )
      .subscribe();
  }

  public loadCustomStyles(): void {
    this.http
      .get(`${this.basePathService.getBasePath()}/plugin/octodash/custom-styles.css`, { responseType: 'text' })
      .subscribe({
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
