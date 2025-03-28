import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { Notification } from '../model';

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

  public closeNotification(): void {
    this.observer.next('close');
  }

  public setNotification(notification: Notification): void {
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

  public getObservable(): Observable<Notification | 'close'> {
    return this.observable;
  }

  public getBootGrace(): boolean {
    return this.bootGrace;
  }
}
