import { Component } from '@angular/core';

import { FilesService } from '../files.service';
import { JobService } from '../job.service';

@Component({
  selector: 'app-main-screen',
  templateUrl: './main-screen.component.html',
})
export class MainScreenComponent {
  public printing = false;

  public constructor(private jobService: JobService, private fileService: FilesService) {}

  public isPrinting(): boolean {
    // return this.jobService.isPrinting()
    return true;
  }

  public isFileLoaded(): boolean {
    return this.fileService.getLoadedFile();
  }
}
