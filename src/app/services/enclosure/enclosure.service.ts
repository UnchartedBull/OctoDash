import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { TemperatureReading } from '../../model/enclosure.model';

@Injectable()
export abstract class EnclosureService {
  abstract getEnclosureTemperature(): Observable<TemperatureReading>;

  abstract setLEDColor(identifier: number, red: number, green: number, blue: number): void;

  abstract setOutput(identifier: number, status: boolean): void;
}
