import { Component } from '@angular/core';

import { FilamentManagementComponent, FilamentSpool } from '../../plugins';

@Component({
  selector: 'app-filament-choose',
  templateUrl: './choose-filament.component.html',
  styleUrls: ['./choose-filament.component.scss'],
})
export class ChooseFilamentComponent {
  public filamentSpools: Array<FilamentSpool>;
  public isLoadingSpools = true;

  public selectedSpool: FilamentSpool;

  constructor(public filament: FilamentManagementComponent) {}

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
