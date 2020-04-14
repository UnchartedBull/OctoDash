import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ConfigService } from '../config/config.service';
import { FilamentManagerService, FilamentSpoolList } from '../plugin-service/filament-manager.service';

@Component({
    selector: 'app-filament',
    templateUrl: './filament.component.html',
    styleUrls: ['./filament.component.scss'],
})
export class FilamentComponent implements OnInit {
    public page: number;
    public filamentSpools: FilamentSpoolList;
    public isLoadingSpools = true;

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
    }

    public increasePage(): void {
        if (this.page < 5) {
            this.setPage(this.page + 1);
        } else if (this.page === 5) {
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
            this.getSpools();
        }
        this.page = page;
    }

    private getSpools(): void {
        this.isLoadingSpools = true;
        this.filamentManagerService
            .getSpoolList()
            .then((spools: FilamentSpoolList): void => {
                console.log(spools);
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
}
