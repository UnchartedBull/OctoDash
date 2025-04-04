import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { ConfigService } from '../../services/config.service';
import { EventService } from '../../services/event.service';
import { FilesService } from '../../services/files/files.service';

@Component({
  selector: 'app-main-screen',
  templateUrl: './main-screen.component.html',
  standalone: false,
})
export class MainScreenComponent {
  public printing = false;

  public constructor(
    private eventService: EventService,
    private fileService: FilesService,
    private configService: ConfigService,
    private router: Router,
  ) {
    if (!this.configService.isInitialized()) {
      this.router.navigate(['/']);
    }
  }

  public isPrinting(): boolean {
    return this.eventService.isPrinting();
  }

  public isFileLoaded(): boolean {
    return this.fileService.getLoadedFile();
  }

  public isTouchscreen(): boolean {
    return this.configService.isTouchscreen();
  }
}
