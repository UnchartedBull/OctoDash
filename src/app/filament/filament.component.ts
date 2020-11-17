import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';

import { ConfigService } from '../config/config.service';
import { FilamentManagerService, FilamentSpool, FilamentSpoolList } from '../plugin-service/filament-manager.service';
import { PrinterService, PrinterStatusAPI } from '../printer.service';

@Component({
  selector: 'app-filament',
  templateUrl: './filament.component.html',
  styleUrls: ['./filament.component.scss'],
})
export class FilamentComponent implements OnInit {
  public selectedSpool: FilamentSpool;
  private currentSpool: FilamentSpool;
  private totalPages = 5;

  public page: number;
  private timeout: ReturnType<typeof setTimeout>;
  private timeout2: ReturnType<typeof setTimeout>;

  public filamentSpools: FilamentSpoolList;
  public isLoadingSpools = true;

  private hotendPreviousTemperature = 0;
  public hotendTarget: number;
  public hotendTemperature: number;
  public automaticHeatingStartSeconds: number;
  public isHeating: boolean;

  private feedSpeedSlow = false;

  public purgeAmount: number;

  public constructor(
    private router: Router,
    private configService: ConfigService,
    private filamentManagerService: FilamentManagerService,
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
    this.hotendTarget = this.configService.getDefaultHotendTemperature();
    this.printerService.getObservable().subscribe((printerStatus: PrinterStatusAPI): void => {
      this.hotendTemperature = printerStatus.nozzle.current;
    });
  }

  public increasePage(): void {
    if (this.page < this.totalPages) {
      this.setPage(this.page + 1);
    } else if (this.page === this.totalPages) {
      this.router.navigate(['/main-screen']);
    }
  }

  // PAGINATION

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
    clearTimeout(this.timeout);
    clearTimeout(this.timeout2);
    if (this.page === 4) {
      this.feedSpeedSlow = false;
    }
    if (page === 0) {
      this.selectedSpool = null;
      this.getSpools();
    } else if (page === 1) {
      this.isHeating = false;
      this.automaticHeatingStartSeconds = 6;
      this.automaticHeatingStartTimer();
    } else if (page === 2) {
      if (this.getFeedLength() === 0) {
        this.setPage(3);
        return;
      } else {
        this.unloadSpool();
      }
    } else if (page === 3) {
      if (this.configService.useM600()) {
        this.initiateM600FilamentChange();
      } else {
        this.disableExtruderStepper();
      }
    } else if (page === 4) {
      if (this.getFeedLength() === 0) {
        this.setPage(5);
        return;
      } else {
        this.loadSpool();
      }
    } else if (page === 5) {
      this.purgeAmount = this.configService.useM600() ? 0 : this.configService.getPurgeDistance();
      this.purgeFilament(this.purgeAmount);
    }
    this.page = page;
    if (this.page > 0) {
      setTimeout((): void => {
        document.getElementById('progressBar').style.width = this.page * (20 / this.totalPages) + 'vw';
      }, 200);
    }
  }

  // FILAMENT MANAGEMENT

  private getSpools(): void {
    this.isLoadingSpools = true;
    this.filamentManagerService
      .getSpoolList()
      .then((spools: FilamentSpoolList): void => {
        this.filamentSpools = spools;
      })
      .catch((): void => {
        this.filamentSpools = null;
      })
      .finally((): void => {
        this.filamentManagerService
          .getCurrentSpool()
          .then((spool: FilamentSpool): void => {
            this.currentSpool = spool;
          })
          .catch((): void => {
            this.currentSpool = null;
          })
          .finally((): void => {
            this.isLoadingSpools = false;
          });
      });
  }

  public getSpoolWeightLeft(weight: number, used: number): number {
    return Math.floor(weight - used);
  }

  public getSpoolTemperatureOffset(): string {
    return `${this.selectedSpool.temp_offset === 0 ? '±' : this.selectedSpool.temp_offset > 0 ? '+' : '-'}${Math.abs(
      this.selectedSpool.temp_offset,
    )}`;
  }

  public getCurrentSpoolColor(): string {
    if (this.currentSpool) {
      return this.currentSpool.color;
    } else {
      return '#44bd32';
    }
  }

  public getSelectedSpoolColor(): string {
    if (this.selectedSpool) {
      return this.selectedSpool.color;
    } else {
      return '#44bd32';
    }
  }

  private getFeedLength(): number {
    return this.configService.useM600() ? 0 : this.configService.getFeedLength();
  }

  public getFeedSpeed(): number {
    if (this.feedSpeedSlow) {
      return this.configService.getFeedSpeedSlow();
    } else {
      return this.configService.getFeedSpeed();
    }
  }

  public setSpool(spool: FilamentSpool): void {
    this.selectedSpool = spool;
    this.hotendTarget = this.hotendTarget + spool.temp_offset;
    this.increasePage();
  }

  private unloadSpool(): void {
    this.printerService.extrude(this.getFeedLength() * -1, this.configService.getFeedSpeed());
    setTimeout((): void => {
      const unloadingProgressBar = document.getElementById('filamentUnloadBar');
      unloadingProgressBar.style.backgroundColor = this.getCurrentSpoolColor();
      const unloadTime = this.getFeedLength() / this.configService.getFeedSpeed() + 0.5;
      unloadingProgressBar.style.transition = 'width ' + unloadTime + 's ease-in';
      setTimeout((): void => {
        unloadingProgressBar.style.width = '0vw';
        this.timeout = setTimeout((): void => {
          this.increasePage();
        }, unloadTime * 1000 + 500);
      }, 200);
    }, 0);
  }

  private loadSpool(): void {
    const loadTimeFast = (this.getFeedLength() * 0.75) / this.configService.getFeedSpeed();
    const loadTimeSlow = (this.getFeedLength() * 0.17) / this.configService.getFeedSpeedSlow();
    const loadTime = loadTimeFast + loadTimeSlow + 0.5;
    this.printerService.extrude(this.getFeedLength() * 0.75, this.configService.getFeedSpeed());
    setTimeout((): void => {
      const loadingProgressBar = document.getElementById('filamentLoadBar');
      loadingProgressBar.style.backgroundColor = this.getSelectedSpoolColor();

      loadingProgressBar.style.transition = 'width ' + loadTime + 's ease-in';
      setTimeout((): void => {
        loadingProgressBar.style.width = '50vw';
        this.timeout = setTimeout((): void => {
          this.printerService.extrude(this.getFeedLength() * 0.17, this.configService.getFeedSpeedSlow());
          this.feedSpeedSlow = true;
          this.timeout2 = setTimeout((): void => {
            this.increasePage();
          }, loadTimeSlow * 1000 + 400);
        }, loadTimeFast * 1000 + 200);
      }, 200);
    }, 0);
  }

  public setSpoolSelection(): void {
    this.printerService.setTemperatureHotend(this.hotendPreviousTemperature);
    if (this.selectedSpool) {
      this.filamentManagerService.setCurrentSpool(this.selectedSpool).finally(this.increasePage.bind(this));
    } else {
      this.increasePage();
    }
  }

  public stopExtruderMovement(): void {
    this.printerService.stopMotors();
    clearTimeout(this.timeout);
    clearTimeout(this.timeout2);

    let bar: HTMLElement;
    const wrapper = (document.getElementsByClassName(
      'filament__progress-bar-wrapper-wide',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    )[0] as any) as HTMLElement;

    if (document.getElementById('filamentLoadBar')) {
      bar = document.getElementById('filamentLoadBar');
    } else {
      bar = document.getElementById('filamentUnloadBar');
    }

    bar.style.width = Math.floor(bar.getBoundingClientRect().width) + 'px';
    wrapper.style.borderColor = '#c23616';
  }

  private disableExtruderStepper(): void {
    this.printerService.executeGCode('M18 E ');
  }

  private initiateM600FilamentChange(): void {
    this.printerService.executeGCode('M600');
  }

  // NOZZLE HEATING

  public changeHotendTarget(value: number): void {
    this.hotendTarget = this.hotendTarget + value;
    if (this.hotendTarget < 0) {
      this.hotendTarget = 0;
    }
    if (this.hotendTarget > 999) {
      this.hotendTarget = 999;
    }
    if (!this.isHeating) {
      this.automaticHeatingStartSeconds = 5;
    } else {
      this.setNozzleTemperature();
    }
  }

  private automaticHeatingStartTimer(): void {
    this.automaticHeatingStartSeconds--;
    if (this.automaticHeatingStartSeconds === 0) {
      this.setNozzleTemperature();
    } else {
      this.timeout = setTimeout(this.automaticHeatingStartTimer.bind(this), 1000);
    }
  }

  public setNozzleTemperature(): void {
    if (this.page === 1) {
      this.isHeating = true;
      this.printerService.setTemperatureHotend(this.hotendTarget);
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
      if (this.timeout2) {
        clearTimeout(this.timeout2);
      }
      this.timeout2 = setTimeout(this.checkTemperature.bind(this), 1500);
    }
  }

  private checkTemperature(): void {
    if (this.hotendTemperature >= this.hotendTarget) {
      this.increasePage();
    } else {
      this.timeout2 = setTimeout(this.checkTemperature.bind(this), 1500);
    }
  }

  public increasePurgeAmount(length: number): void {
    this.purgeAmount += length;
    this.purgeFilament(length);
  }

  public purgeFilament(length: number): void {
    this.printerService.extrude(length, this.configService.getFeedSpeedSlow());
  }
}
