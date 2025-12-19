import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { OctoPrintSettings } from 'src/model/octoprint/octoprint-settings.model';

import { ConfigService } from './config.service';

@Injectable({ providedIn: 'root' })
export class OctoprintSettingsService {
  http = inject(HttpClient);
  configService = inject(ConfigService);

  settings$ = new BehaviorSubject<OctoPrintSettings | null>(null);

  constructor() {
    this.configService.initialized$.subscribe(initialized => {
      if (initialized) {
        this.loadSettings();
      }
    });
  }

  loadSettings() {
    const apiUrl = this.configService.getApiURL('settings', true);
    this.http.get<OctoPrintSettings>(apiUrl, this.configService.getHTTPHeaders()).subscribe({
      next: settings => this.settings$.next(settings),
      error: error => console.error('Error loading OctoPrint settings:', error),
    });
  }
}
