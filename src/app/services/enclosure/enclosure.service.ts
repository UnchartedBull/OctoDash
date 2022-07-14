import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PSUState, TemperatureReading } from '../../model';

@Injectable()
export abstract class EnclosureService {
  abstract getEnclosureTemperature(): Observable<TemperatureReading>;

  abstract setLEDColor(identifier: number, red: number, green: number, blue: number): void;

  abstract setOutput(identifier: number, status: boolean): void;

  abstract setOutputPWM(identifier: number, dutyCycle: number): void;

  abstract runEnclosureShell(identifier: number): void;

  abstract setPSUState(state: PSUState): void;

  abstract togglePSU(): void;
}
