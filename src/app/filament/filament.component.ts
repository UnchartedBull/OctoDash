import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ConfigService } from '../config/config.service';
import { FilamentManagerService, FilamentSpool, FilamentSpoolList } from '../plugin-service/filament-manager.service';

@Component({
    selector: 'app-filament',
    templateUrl: './filament.component.html',
    styleUrls: ['./filament.component.scss'],
})
export class FilamentComponent implements OnInit {
    private spool: FilamentSpool;
    private totalPages = 5;

    public page: number;

    public filamentSpools: FilamentSpoolList;
    public isLoadingSpools = true;

    public hotendTarget: number;
    public automaticStartSeconds: number;

    public constructor(
        private router: Router,
        private configService: ConfigService,
        private filamentManagerService: FilamentManagerService,
    ) {}

    public ngOnInit(): void {
        if (this.configService.isFilamentManagerEnabled()) {
            this.setPage(0);
        } else {
            this.setPage(1);
        }
        this.hotendTarget = this.configService.getDefaultHotendTemperature();
        this.automaticStartSeconds = 5;
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
            this.spool = null;
            this.getSpools();
        }
        this.page = page;
        if (this.page > 0) {
            setTimeout((): void => {
                document.getElementById('progressBar').style.width = this.page * (20 / this.totalPages) + 'vw';
            }, 200);
        }
    }

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
        this.spool = spool;
        this.hotendTarget = this.hotendTarget + spool.temp_offset;
        console.log(this.hotendTarget);
        this.setPage(1);
    }

    public changeHotendTarget(value: number): void {
        this.hotendTarget = this.hotendTarget + value;
    }
}
