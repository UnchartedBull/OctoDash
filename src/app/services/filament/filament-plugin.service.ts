import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { FilamentSpool } from '../../model';

@Injectable()
export abstract class FilamentPluginService {
  abstract getSpools(): Observable<Array<FilamentSpool>>;

  abstract getCurrentSpool(): Observable<FilamentSpool>;

  abstract setSpool(spool: FilamentSpool): Observable<void>;
}
