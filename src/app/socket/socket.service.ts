import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Temperatures } from '../model/temperature.model';

@Injectable()
export abstract class SocketService {
  abstract connect(): Promise<void>;

  abstract get temperatureSubscribable(): Observable<Temperatures>;

  abstract get zIndicatorSubscribable(): void;
}
