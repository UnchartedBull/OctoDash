import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { distinctUntilChanged, filter, map } from 'rxjs';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { PrinterState } from 'src/model';
import { OctoPrintSettings } from 'src/model/octoprint/octoprint-settings.model';

import { ConfigService } from './config.service';
import { NotificationService } from './notification.service';
import { SocketService } from './socket/socket.service';

const NOT_CONNECTED = [
  PrinterState.closed,
  PrinterState.connecting,
  PrinterState.reconnecting,
  PrinterState.socketDead,
];

enum SocketConnectedState {
  connected,
  notConnected,
}

@Injectable({ providedIn: 'root' })
export class OctoprintSettingsService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);
  private socketService = inject(SocketService);
  private notificationService = inject(NotificationService);

  private settings$ = new BehaviorSubject<OctoPrintSettings | null>(null);

  getSettings() {
    return this.settings$.asObservable();
  }

  constructor() {
    // If it goes from not connected to connected, then reload settings
    this.socketService
      .getPrinterStatusSubscribable()
      .pipe(map(status => status?.status))
      .pipe(
        map(status => {
          if (status === undefined) {
            return SocketConnectedState.notConnected;
          }
          if (NOT_CONNECTED.includes(status)) {
            return SocketConnectedState.notConnected;
          }
          return SocketConnectedState.connected;
        }),
      )
      .pipe(distinctUntilChanged())
      .pipe(filter(status => status === SocketConnectedState.connected))
      .subscribe(() => {
        this.loadSettings();
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
      error: error => {
        console.error('Error loading OctoPrint settings:', error);
        this.notificationService.error(
          $localize`@@error-octoprint-settings:Failed to load OctoPrint settings.`,
          error.message,
        );
      },
    });
  }
}
