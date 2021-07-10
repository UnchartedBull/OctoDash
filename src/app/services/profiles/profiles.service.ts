import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PrinterProfile } from '../../model';

@Injectable()
export abstract class ProfileService {
  abstract getActiveProfile(): Observable<PrinterProfile>;

  abstract getProfiles(): Observable<Array<PrinterProfile>>;

  abstract setActiveProfile(profileID: string): void;

  abstract get CurrentProfile(): PrinterProfile

}