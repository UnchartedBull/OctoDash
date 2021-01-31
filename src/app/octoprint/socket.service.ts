import { Injectable } from '@angular/core';

@Injectable()
export abstract class SocketService {
  abstract connect(): void;

  abstract get temperatureSubscribable(): void;

  abstract get zIndicatorSubscribable(): void;
}
