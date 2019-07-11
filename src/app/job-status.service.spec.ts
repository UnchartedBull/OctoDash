import { TestBed } from '@angular/core/testing';

import { JobStatusService } from './job-status.service';

describe('JobStatusService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: JobStatusService = TestBed.get(JobStatusService);
    expect(service).toBeTruthy();
  });
});
