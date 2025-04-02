import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { Notification, NotificationType } from '../model';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private observable: Observable<Notification | 'close'>;
  private observer: Observer<Notification | 'close'>;
  private bootGrace = false;

  public notificationStack: Array<Notification> = [];

  public constructor() {
    this.observable = new Observable((observer: Observer<Notification | 'close'>): void => {
      this.observer = observer;
      setTimeout((): void => {
        this.bootGrace = false;
      }, 30000);
    }).pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }

  public info(heading: string, text: string, sticky?: boolean): void {
    this.setNotification({
      heading,
      text,
      type: NotificationType.INFO,
      sticky,
    });
  }

  public warn(heading: string, text: string, sticky?: boolean): void {
    this.setNotification({
      heading,
      text,
      type: NotificationType.WARN,
      sticky,
    });
  }

  public error(heading: string, text: string, sticky?: boolean): void {
    this.setNotification({
      heading,
      text,
      type: NotificationType.ERROR,
      sticky,
    });
  }

  public prompt(heading: string, text: string, choices: Array<string>, callback: (index: number) => void): void {
    this.setNotification({
      heading,
      text,
      type: NotificationType.PROMPT,
      choices,
      callback,
      sticky: true,
    });
  }

  private setNotification(notification: Notification): void {
    if (!notification.time) {
      notification.time = new Date();
    }
    if (this.observer) {
      this.observer.next(notification);
      this.notificationStack.push(notification);

      if (this.notificationStack.length > 25) {
        this.notificationStack.shift();
      }
    } else {
      setTimeout(this.setNotification.bind(this), 1000, notification);
    }
  }

  public removeNotification(notification: Notification) {
    this.notificationStack = this.notificationStack.filter(n => n.time !== notification.time);
  }

  public closeNotification(): void {
    this.observer.next('close');
  }

  public getObservable(): Observable<Notification | 'close'> {
    return this.observable;
  }

  public getBootGrace(): boolean {
    return this.bootGrace;
  }
}
