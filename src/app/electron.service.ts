import { Injectable } from '@angular/core';
import { emit, listen } from '@tauri-apps/api/event';

import { NotificationService } from './notification/notification.service';

@Injectable({
  providedIn: 'root',
})
export class ElectronService {
  listeners = new Map();

  constructor(private notificationService: NotificationService) {}

  public async on(channel: string, listener: (...args) => void): Promise<void> {
    this.listeners.set(channel, await listen(channel, listener));
  }

  public removeListener(channel: string): void {
    this.listeners.get(channel)();
    this.listeners.delete(channel);
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public send(channel: string, ...args): void {
    console.log('SENDING MESSAGE to ', channel);
    emit(channel, ...args);
  }
}
