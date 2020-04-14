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
    public spools: FilamentSpoolList;

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

    public setPage(page: number): void {
        if (page === 0) {
            this.filamentManagerService
                .getSpoolList()
                .then((spools: FilamentSpoolList): void => {
                    console.log(spools);
                    this.spools = spools;
                })
                .catch((): void => {
                    this.spools = null;
                });
        }
        this.page = page;
    }
}
