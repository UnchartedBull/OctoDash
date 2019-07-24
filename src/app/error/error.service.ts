import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { share } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  private observable: Observable<Error>;
  private observer: Observer<Error>;

  constructor() {
    this.observable = new Observable((observer: Observer<Error>) => {
      this.observer = observer;
    }).pipe(share());
  }

  setError(heading: string, text: string) {
    this.observer.next({ heading, text });
  }

  getObservable() {
    return this.observable;
  }
}

export interface Error {
  heading: string;
  text: string;
}
