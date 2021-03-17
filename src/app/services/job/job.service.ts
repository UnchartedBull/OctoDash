import { Injectable } from '@angular/core';

@Injectable()
export abstract class JobService {
  abstract startJob(): void;

  abstract pauseJob(): void;

  abstract resumeJob(): void;

  abstract cancelJob(): void;

  abstract restartJob(): void;

  abstract preheat(): void;
}
