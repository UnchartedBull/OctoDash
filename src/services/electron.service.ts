import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';

import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class ElectronService {
  private ipcRenderer: IpcRenderer | undefined;

  constructor(private notificationService: NotificationService) {
    if (window.require) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
    } else {
      this.notificationService.error(
        "Can't load electron library",
        'Please restart your system and open a new issue on GitHub if this issue persists.',
        true,
      );
    }
  }

  public on(channel: string, listener: (...args) => void): void {
    if (!this.ipcRenderer) {
      return;
    }
    this.ipcRenderer.on(channel, listener);
  }

  public removeListener(channel: string, listener: (...args) => void): void {
    if (!this.ipcRenderer) {
      return;
    }
    this.ipcRenderer.removeListener(channel, listener);
  }

  public send(channel: string, ...args): void {
    if (!this.ipcRenderer) {
      return;
    }
    this.ipcRenderer.send(channel, ...args);
  }
}
