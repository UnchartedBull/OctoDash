import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { ConfigService } from '../../services/config.service';
import { EventService } from '../../services/event.service';
import { FilesService } from '../../services/files/files.service';
import { PrusaMMUService } from '../../services/prusammu/prusa-mmu.service';

@Component({
  selector: 'app-main-screen',
  templateUrl: './main-screen.component.html',
  standalone: false,
})
export class MainScreenComponent {
  public printing = false;
  usePrusaMMU = false;

  public constructor(
    private eventService: EventService,
    private fileService: FilesService,
    private configService: ConfigService,
    private router: Router,
    public prusaMMUService: PrusaMMUService,
  ) {
    if (!this.configService.isInitialized()) {
      this.router.navigate(['/']);
    } else {
      this.usePrusaMMU = this.configService.isPrusaMMUPluginEnabled();
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
