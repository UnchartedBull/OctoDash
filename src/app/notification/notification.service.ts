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

  public constructor() {
    this.observable = new Observable((observer: Observer<Notification | 'close'>): void => {
      this.observer = observer;
      setTimeout((): void => {
        this.bootGrace = false;
      }, 30000);
    }).pipe(shareReplay(1));
  }

  public closeNotification(): void {
    this.observer.next('close');
  }

  public setError(heading: string, text: string): Promise<void> {
    return new Promise(resolve => {
      if (this.observer) {
        this.observer.next({ heading, text, type: 'error', closed: resolve });
      } else {
        setTimeout(() => {
          this.setError(heading, text);
        }, 1000);
      }
    });
  }

  public setWarning(heading: string, text: string): Promise<void> {
    return new Promise(resolve => {
      if (this.observer) {
        this.observer.next({ heading, text, type: 'warn', closed: resolve });
      } else {
        setTimeout(() => {
          this.setWarning(heading, text);
        }, 1000);
      }
    });
  }

  public setNotification(heading: string, text: string): Promise<void> {
    return new Promise(resolve => {
      if (this.observer) {
        this.observer.next({ heading, text, type: 'notification', closed: resolve });
      } else {
        setTimeout(() => {
          this.setNotification(heading, text);
        }, 1000);
      }
    });
  }

  public getObservable(): Observable<Notification | 'close'> {
    return this.observable;
  }

  public getBootGrace(): boolean {
    return this.bootGrace;
  }
}
