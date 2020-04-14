import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ConfigService } from '../config/config.service';

@Component({
    selector: 'app-filament',
    templateUrl: './filament.component.html',
    styleUrls: ['./filament.component.scss'],
})
export class FilamentComponent implements OnInit {
    public page: number;

    public constructor(private router: Router, private configService: ConfigService) {}

    public ngOnInit(): void {
        if (this.configService.isFilamentManagerEnabled()) {
            this.page = 0;
        } else {
            this.page = 1;
        }
    }

    public increasePage(): void {
        if (this.page < 5) {
            this.page++;
        } else if (this.page === 5) {
            this.router.navigate(['/main-screen']);
        }
    }

    public decreasePage(): void {
        if (this.page === 0) {
            this.router.navigate(['/main-screen']);
        } else if (this.page === 1 && this.configService.isFilamentManagerEnabled()) {
            this.page = 0;
        } else if (this.page === 2 || this.page === 3) {
            this.page = 1;
        } else if (this.page === 4 || this.page === 5) {
            this.page = 3;
        }
    }
}
