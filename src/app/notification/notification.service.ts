import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private observable: Observable<Message>;
  private observer: Observer<Message>;

  constructor() {
    this.observable = new Observable((observer: Observer<Message>) => {
      this.observer = observer;
    }).pipe(shareReplay(1));
  }

  setError(heading: string, text: string) {
    this.observer.next({ heading, text, type: 'error' });
  }

  setUpdate(heading: string, text: string) {
    this.observer.next({ heading, text, type: 'update' });
  }

  getObservable() {
    return this.observable;
  }
}

export interface Message {
  heading: string;
  text: string;
  type: string;
}
