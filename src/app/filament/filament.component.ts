import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';

import { ConfigService } from '../config/config.service';
import { FilamentManagementComponent, FilamentSpool } from '../plugins';
import { PrinterService, PrinterStatusAPI } from '../printer.service';

@Component({
  selector: 'app-filament',
  templateUrl: './filament.component.html',
  styleUrls: ['./filament.component.scss'],
  providers: [FilamentManagementComponent],
})
export class FilamentComponent implements OnInit {
  private totalPages = 5;
  public page: number;
  private hotendPreviousTemperature = 0;

  public selectedSpool: FilamentSpool;
  public currentSpool: FilamentSpool;

  private timeout: ReturnType<typeof setTimeout>;
  private timeout2: ReturnType<typeof setTimeout>;

  public purgeAmount: number;

  public constructor(
    private router: Router,
    private configService: ConfigService,
    private printerService: PrinterService,
  ) {
    this.printerService
      .getObservable()
      .pipe(take(1))
      .subscribe((printerStatus: PrinterStatusAPI): void => {
        this.hotendPreviousTemperature = printerStatus.nozzle.set;
      });
  }

  public ngOnInit(): void {
    if (this.configService.isFilamentManagerEnabled()) {
      this.setPage(0);
    } else {
      this.setPage(1);
    }
  }

  public increasePage(): void {
    if (this.page < this.totalPages) {
      this.setPage(this.page + 1);
    } else if (this.page === this.totalPages) {
      this.router.navigate(['/main-screen']);
    }
  }

  public decreasePage(): void {
    if (this.page === 0) {
      this.router.navigate(['/main-screen']);
    } else if (this.page === 1 && this.configService.isFilamentManagerEnabled()) {
      this.setPage(0);
    } else if (this.page === 1) {
      this.router.navigate(['/main-screen']);
    } else if (this.page === 2 || this.page === 3) {
      this.setPage(1);
    } else if (this.page === 4 || this.page === 5) {
      this.setPage(3);
    }
  }

  private setPage(page: number): void {
    if (page === 5) {
      this.purgeAmount = this.configService.useM600() ? 0 : this.configService.getPurgeDistance();
      this.purgeFilament(this.purgeAmount);
    }
    if (page > 0) {
      setTimeout((): void => {
        document.getElementById('progressBar').style.width = this.page * (20 / this.totalPages) + 'vw';
      }, 200);
    }
    this.page = page;
  }

  public setSpool(spoolInformation: { spool: FilamentSpool; skipChange: boolean }): void {
    this.selectedSpool = spoolInformation.spool;
    if (spoolInformation.skipChange) {
      this.setPage(this.totalPages);
    } else {
      this.increasePage();
    }
  }

  public setSpoolSelection(): void {
    // this.printerService.setTemperatureHotend(this.hotendPreviousTemperature);
    // if (this.selectedSpool) {
    //   this.filamentManagerService.setCurrentSpool(this.selectedSpool).finally(this.increasePage.bind(this));
    // } else {
    //   this.increasePage();
    // }
  }

  // NOZZLE HEATING

  public increasePurgeAmount(length: number): void {
    this.purgeAmount += length;
    this.purgeFilament(length);
  }

  public purgeFilament(length: number): void {
    this.printerService.extrude(length, this.configService.getFeedSpeedSlow());
  }
}
