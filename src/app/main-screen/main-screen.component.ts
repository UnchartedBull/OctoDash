import { Component } from '@angular/core';

import { FilesService } from '../files.service';
import { JobService } from '../job.service';

@Component({
  selector: 'app-main-screen',
  templateUrl: './main-screen.component.html',
})
export class MainScreenComponent {
  public printing = false;

  public constructor(private _jobService: JobService, private _fileService: FilesService) {}

  public isPrinting(): boolean {
    return this._jobService.isPrinting();
  }

  public isFileLoaded(): boolean {
    return this._fileService.loadedFile;
  }
}
