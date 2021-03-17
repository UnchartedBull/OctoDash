import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PrinterEvent } from 'src/app/model/event.model';

import { JobStatus, PrinterStatus } from '../../model';

@Injectable()
export abstract class SocketService {
  abstract connect(): Promise<void>;

  abstract getPrinterStatusSubscribable(): Observable<PrinterStatus>;

  abstract getJobStatusSubscribable(): Observable<JobStatus>;

  abstract getEventSubscribable(): Observable<PrinterEvent>;
}
