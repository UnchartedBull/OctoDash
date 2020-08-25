import { Component } from '@angular/core';

import { AppService } from '../app.service';
import { JobService } from '../job.service';

@Component({
  selector: 'app-main-screen',
  templateUrl: './main-screen.component.html',
})
export class MainScreenComponent {
  public printing = false;

  public constructor(private jobService: JobService, private service: AppService) {}

  public isPrinting(): boolean {
    return this.jobService.isPrinting();
  }

  public isFileLoaded(): boolean {
    return this.service.getLoadedFile();
  }
}
