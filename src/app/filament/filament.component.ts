import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ConfigService } from '../config/config.service';
import { FilamentManagerService, FilamentSpool, FilamentSpoolList } from '../plugin-service/filament-manager.service';
import { PrinterService, PrinterStatusAPI } from '../printer.service';

@Component({
    selector: 'app-filament',
    templateUrl: './filament.component.html',
    styleUrls: ['./filament.component.scss'],
})
export class FilamentComponent implements OnInit {
    private selectedSpool: FilamentSpool;
    private currentSpool: FilamentSpool;
    private totalPages = 5;

    public page: number;
    private timeout: number;
    private timeout2: number;

    public filamentSpools: FilamentSpoolList;
    public isLoadingSpools = true;

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
    ) {}

    public ngOnInit(): void {
        if (this.configService.isFilamentManagerEnabled()) {
            this.setPage(0);
        } else {
            this.setPage(1);
        }
        this.hotendTarget = this.configService.getDefaultHotendTemperature();
        this.automaticHeatingStartSeconds = 6;
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
            this.unloadSpool();
        } else if (page === 4) {
            this.loadSpool();
        } else if (page === 5) {
            this.purgeAmount = this.configService.getPurgeDistance();
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
        return `${
            this.selectedSpool.temp_offset === 0 ? '±' : this.selectedSpool.temp_offset > 0 ? '+' : '-'
        }${Math.abs(this.selectedSpool.temp_offset)}`;
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
        this.setPage(1);
    }

    private unloadSpool(): void {
        setTimeout((): void => {
            const unloadingProgressBar = document.getElementById('filamentUnloadBar');
            unloadingProgressBar.style.backgroundColor = this.getCurrentSpoolColor();
            const unloadTime = this.configService.getFeedLength() / this.configService.getFeedSpeed() + 0.5;
            unloadingProgressBar.style.transition = 'width ' + unloadTime + 's ease-in';
            setTimeout((): void => {
                unloadingProgressBar.style.width = '0vw';
                this.timeout = setTimeout((): void => {
                    this.setPage(3);
                }, unloadTime * 1000 + 500);
            }, 200);
        }, 5);
    }

    private loadSpool(): void {
        setTimeout((): void => {
            const loadingProgressBar = document.getElementById('filamentLoadBar');
            loadingProgressBar.style.backgroundColor = this.getSelectedSpoolColor();

            const loadTimeFast = (this.configService.getFeedLength() * 0.85) / this.configService.getFeedSpeed();
            const loadTimeSlow = (this.configService.getFeedLength() * 0.15) / this.configService.getFeedSpeedSlow();
            const loadTime = loadTimeFast + loadTimeSlow + 0.5;

            loadingProgressBar.style.transition = 'width ' + loadTime + 's ease-in';
            setTimeout((): void => {
                loadingProgressBar.style.width = '50vw';
                this.timeout = setTimeout((): void => {
                    this.feedSpeedSlow = true;
                    this.timeout2 = setTimeout((): void => {
                        this.setPage(5);
                    }, loadTimeSlow * 1000 + 200);
                }, loadTimeFast * 1000 + 300);
            }, 200);
        }, 5);
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
            setTimeout(this.automaticHeatingStartTimer.bind(this), 1000);
        }
    }

    public setNozzleTemperature(): void {
        if (this.page === 1) {
            this.isHeating = true;
        }
    }

    public increasePurgeAmount(mm: number): void {
        this.purgeAmount += mm;
    }
}
