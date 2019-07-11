import { TestBed } from '@angular/core/testing';

import { PrinterStatusService } from './printer-status.service';

describe('PrinterStatusService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PrinterStatusService = TestBed.get(PrinterStatusService);
    expect(service).toBeTruthy();
  });
});
