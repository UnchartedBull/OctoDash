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
            if (
                (this.page === 1 && this.configService.getFeedLength() === 0) ||
                (this.page === 3 && this.configService.getFeedLength() === 0)
            ) {
                this.setPage(this.page + 2);
            } else {
                this.setPage(this.page + 1);
            }
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
        } else if (page === 3) {
            this.disableExtruderStepper();
        } else if (page === 4) {
            this.loadSpool();
        } else if (page === 5) {
            this.purgeAmount = this.configService.getPurgeDistance();
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
        this.increasePage();
    }

    private unloadSpool(): void {
        this.printerService.extrude(this.configService.getFeedLength() * -1, this.configService.getFeedSpeed());
        setTimeout((): void => {
            const unloadingProgressBar = document.getElementById('filamentUnloadBar');
            unloadingProgressBar.style.backgroundColor = this.getCurrentSpoolColor();
            const unloadTime = this.configService.getFeedLength() / this.configService.getFeedSpeed() + 0.5;
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
        const loadTimeFast = (this.configService.getFeedLength() * 0.8) / this.configService.getFeedSpeed();
        const loadTimeSlow = (this.configService.getFeedLength() * 0.1) / this.configService.getFeedSpeedSlow();
        const loadTime = loadTimeFast + loadTimeSlow + 0.5;
        this.printerService.extrude(this.configService.getFeedLength() * 0.75, this.configService.getFeedSpeed());
        setTimeout((): void => {
            const loadingProgressBar = document.getElementById('filamentLoadBar');
            loadingProgressBar.style.backgroundColor = this.getSelectedSpoolColor();

            loadingProgressBar.style.transition = 'width ' + loadTime + 's ease-in';
            setTimeout((): void => {
                loadingProgressBar.style.width = '50vw';
                this.timeout = setTimeout((): void => {
                    this.printerService.extrude(
                        this.configService.getFeedLength() * 0.17,
                        this.configService.getFeedSpeedSlow(),
                    );
                    this.feedSpeedSlow = true;
                    this.timeout2 = setTimeout((): void => {
                        this.increasePage();
                    }, loadTimeSlow * 1000 + 400);
                }, loadTimeFast * 1000 + 200);
            }, 200);
        }, 0);
    }

    public setSpoolSelection(): void {
        this.printerService.setTemperatureHotend(0);
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
