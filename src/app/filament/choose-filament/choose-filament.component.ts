import { Component, EventEmitter, Output } from '@angular/core';

import { FilamentManagementComponent, FilamentSpool } from '../../plugins';

@Component({
  selector: 'app-filament-choose',
  templateUrl: './choose-filament.component.html',
  styleUrls: ['./choose-filament.component.scss', '../filament.component.scss'],
})
export class ChooseFilamentComponent {
  @Output() spoolChange = new EventEmitter<{ spool: FilamentSpool; skipChange: boolean }>();

  constructor(public filament: FilamentManagementComponent) {}

  public getSpoolWeightLeft(weight: number, used: number): number {
    return Math.floor(weight - used);
  }

  public setSpool(spool: FilamentSpool): void {
    setTimeout(() => {
      this.spoolChange.emit({ spool, skipChange: false });
    }, 150);
  }

  public setSpoolSkipChange(spool: FilamentSpool): void {
    setTimeout(() => {
      this.spoolChange.emit({ spool, skipChange: true });
    }, 150);
  }
}
