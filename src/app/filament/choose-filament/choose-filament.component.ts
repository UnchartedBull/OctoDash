import { Component, OnInit } from '@angular/core';

import {
  FilamentManagerService,
  FilamentSpool,
  FilamentSpoolList,
} from '../../plugin-service/filament-manager.service';
import { NotificationService } from '../../notification/notification.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-filament-choose',
  templateUrl: './choose-filament.component.html',
  styleUrls: ['./choose-filament.component.scss'],
})
export class ChooseFilamentComponent implements OnInit {
  public filamentSpools: FilamentSpoolList;
  public isLoadingSpools = true;

  public selectedSpool: FilamentSpool;
  private currentSpool: FilamentSpool;

  constructor(
    private filamentManagerService: FilamentManagerService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.getSpools();
  }

  private getSpools(): void {
    this.isLoadingSpools = true;
    this.filamentManagerService.getSpoolList().subscribe(
      (spools: FilamentSpoolList): void => {
        this.filamentSpools = spools;
      },
      (error: HttpErrorResponse): void => {
        this.notificationService.setError("Can't load filament spools!", error.message);
      },
      () => (this.isLoadingSpools = false),
    );
    // .then((spools: FilamentSpoolList): void => {
    //   this.filamentSpools = spools;
    // })
    // .catch((): void => {
    //   this.filamentSpools = null;
    // })
    // .finally((): void => {
    //   this.filamentManagerService
    //     .getCurrentSpool()
    //     .then((spool: FilamentSpool): void => {
    //       this.currentSpool = spool;
    //     })
    //     .catch((): void => {
    //       this.currentSpool = null;
    //     })
    //     .finally((): void => {
    //       this.isLoadingSpools = false;
    //     });
    // });
  }

  private getCurrentSpool() {}

  public getSpoolWeightLeft(weight: number, used: number): number {
    return Math.floor(weight - used);
  }

  public setSpool(spool: FilamentSpool): void {
    this.selectedSpool = spool;
    // this.hotendTarget = this.hotendTarget + spool.temp_offset;
    // this.increasePage();
  }

  // public getSpoolTemperatureOffset(): string {
  //   return `${this.selectedSpool.temp_offset === 0 ? '±' : this.selectedSpool.temp_offset > 0 ? '+' : '-'}${Math.abs(
  //     this.selectedSpool.temp_offset,
  //   )}`;
  // }

  // public getCurrentSpoolColor(): string {
  //   if (this.currentSpool) {
  //     return this.currentSpool.color;
  //   } else {
  //     return '#44bd32';
  //   }
  // }

  // public getSelectedSpoolColor(): string {
  //   if (this.selectedSpool) {
  //     return this.selectedSpool.color;
  //   } else {
  //     return '#44bd32';
  //   }
  // }
}
