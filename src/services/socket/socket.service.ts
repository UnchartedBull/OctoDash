import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { JobStatus, PrinterEvent, PrinterNotification, PrinterStatus } from '../../model';

@Injectable()
export abstract class SocketService {
  abstract connect(): Promise<void>;

  abstract getPrinterStatusSubscribable(): Observable<PrinterStatus>;

  abstract getPrinterStatusText(): Observable<string>;

  abstract getJobStatusSubscribable(): Observable<JobStatus>;

  abstract getEventSubscribable(): Observable<PrinterEvent | PrinterNotification>;
}
