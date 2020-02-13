import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class NotificationService {
    private observable: Observable<Notification>;
    private observer: Observer<Notification>;
    private hideNotifications = false;

    public constructor() {
        this.observable = new Observable((observer: Observer<Notification>): void => {
            this.observer = observer;
        }).pipe(shareReplay(1));
    }

    public enableNotifications(): void {
        // console.clear();
        this.hideNotifications = false;
    }

    public disableNotifications(): void {
        // console.clear();
        this.hideNotifications = true;
    }

    public setError(heading: string, text: string): void {
        if (!this.hideNotifications) {
            this.observer.next({ heading, text, type: 'error' });
        }
    }

    public setWarning(heading: string, text: string): void {
        if (!this.hideNotifications) {
            this.observer.next({ heading, text, type: 'warn' });
        }
    }

    public setUpdate(heading: string, text: string): void {
        this.observer.next({ heading, text, type: 'update' });
    }

    public getObservable(): Observable<Notification> {
        return this.observable;
    }
}

export interface Notification {
    heading: string;
    text: string;
    type: string;
}
