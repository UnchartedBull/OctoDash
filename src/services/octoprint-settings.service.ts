import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { OctoPrintSettings } from 'src/model/octoprint/octoprint-settings.model';

import { ConfigService } from './config.service';
import { SocketService } from './socket/socket.service';

@Injectable({ providedIn: 'root' })
export class OctoprintSettingsService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);
  private socketService = inject(SocketService);

  settings$ = new BehaviorSubject<OctoPrintSettings | null>(null);

  constructor() {
    this.configService.getInitializedSubscribable().subscribe(initialized => {
      if (initialized) {
        this.loadSettings();
      }
    });
    this.socketService.getSettingsUpdatedSubscribable().subscribe(() => {
      this.loadSettings();
    });
  }

  loadSettings() {
    const apiUrl = this.configService.getApiURL('settings', true);
    if (!apiUrl) {
      console.warn('No API URL found for OctoPrint settings.');
      return;
    }
    this.http.get<OctoPrintSettings>(apiUrl, this.configService.getHTTPHeaders()).subscribe({
      next: settings => this.settings$.next(settings),
      error: error => console.error('Error loading OctoPrint settings:', error),
    });
  }
}
