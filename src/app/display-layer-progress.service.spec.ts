import { TestBed } from '@angular/core/testing';

import { DisplayLayerProgressService } from './display-layer-progress.service';

describe('DisplayLayerProgressService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DisplayLayerProgressService = TestBed.get(DisplayLayerProgressService);
    expect(service).toBeTruthy();
  });
});
