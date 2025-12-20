import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { distinctUntilChanged, filter, map } from 'rxjs';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { PrinterState } from 'src/model';
import { OctoPrintSettings } from 'src/model/octoprint/octoprint-settings.model';

import { ConfigService } from './config.service';
import { SocketService } from './socket/socket.service';

const NOT_CONNECTED = [
  PrinterState.closed,
  PrinterState.connecting,
  PrinterState.reconnecting,
  PrinterState.socketDead,
];

enum ConnectedState {
  connected,
  notConnected,
}

@Injectable({ providedIn: 'root' })
export class OctoprintSettingsService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);
  private socketService = inject(SocketService);

  private settings$ = new BehaviorSubject<OctoPrintSettings | null>(null);

  getSettings() {
    return this.settings$.asObservable();
  }

  constructor() {
    // this.configService.getInitializedSubscribable().subscribe(initialized => {
    //   if (initialized) {
    //     this.loadSettings();
    //   }
    // });

    // If it goes from not connected to connected, then I need to reload
    this.socketService
      .getPrinterStatusSubscribable()
      .pipe(map(status => status?.status))
      .pipe(
        map(status => {
          if (status === undefined) {
            return ConnectedState.notConnected;
          }
          if (NOT_CONNECTED.includes(status)) {
            return ConnectedState.notConnected;
          }
          return ConnectedState.connected;
        }),
      )
      .pipe(distinctUntilChanged())
      // when the state flips from disconnected to connected
      .pipe(filter(status => status === ConnectedState.connected))
      .subscribe(status => {
        console.log('Printer status update received, reloading settings.', status);
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
      error: error => console.error('Error loading OctoPrint settings:', error),
    });
  }
}
