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
    private totalPages = 5;

    public page: number;

    public filamentSpools: FilamentSpoolList;
    public isLoadingSpools = true;

    public hotendTarget: number;
    public hotendTemperature: number;
    public automaticHeatingStartSeconds: number;
    public isHeating: boolean;

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
        if (page === 0) {
            this.selectedSpool = null;
            this.getSpools();
        } else if (page === 1) {
            this.isHeating = false;
            this.automaticHeatingStartSeconds = 6;
            this.automaticHeatingStartTimer();
        }
        this.page = page;
        if (this.page > 0) {
            setTimeout((): void => {
                document.getElementById('progressBar').style.width = this.page * (20 / this.totalPages) + 'vw';
            }, 200);
        }
    }

    // PAGE 1

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
                this.isLoadingSpools = false;
            });
    }

    public getSpoolWeightLeft(weight: number, used: number): number {
        return Math.floor(weight - used);
    }

    public setSpool(spool: FilamentSpool): void {
        this.selectedSpool = spool;
        this.hotendTarget = this.hotendTarget + spool.temp_offset;
        this.setPage(1);
    }

    // PAGE 2

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
        console.log('START HEATING');
        this.isHeating = true;
    }

    public getAbsoluteValue(number: number): number {
        return Math.abs(number);
    }
}
