import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private observable: Observable<Notification>;
  private observer: Observer<Notification>;
  private hideNotifications = false;

  constructor() {
    this.observable = new Observable((observer: Observer<Notification>) => {
      this.observer = observer;
    }).pipe(shareReplay(1));
  }

  enableNotifications() {
    // console.clear();
    this.hideNotifications = false;
  }

  disableNotifications() {
    // console.clear();
    this.hideNotifications = true;
  }

  setError(heading: string, text: string) {
    if (!this.hideNotifications) {
      this.observer.next({ heading, text, type: 'error' });
    }
  }

  setWarning(heading: string, text: string) {
    if (!this.hideNotifications) {
      this.observer.next({ heading, text, type: 'warn' });
    }
  }

  setUpdate(heading: string, text: string) {
    this.observer.next({ heading, text, type: 'update' });
  }

  getObservable() {
    return this.observable;
  }
}

export interface Notification {
  heading: string;
  text: string;
  type: string;
}
