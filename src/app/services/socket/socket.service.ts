import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { JobStatus, PrinterStatus } from '../../model';

@Injectable()
export abstract class SocketService {
  abstract connect(): Promise<void>;

  abstract getPrinterStatusSubscribable(): Observable<PrinterStatus>;

  abstract getJobStatusSubscribable(): Observable<JobStatus>;

  // TODO
  // Wakeup & Sleep
  // ReAuth
}
