import { Component, EventEmitter, Output } from '@angular/core';

import { FilamentManagementComponent, FilamentSpool } from '../../plugins';

@Component({
  selector: 'app-filament-choose',
  templateUrl: './choose-filament.component.html',
  styleUrls: ['./choose-filament.component.scss'],
})
export class ChooseFilamentComponent {
  @Output() spoolChange = new EventEmitter<{ spool: FilamentSpool; skipChange: boolean }>();

  constructor(public filament: FilamentManagementComponent) {}

  public getSpoolWeightLeft(weight: number, used: number): number {
    return Math.floor(weight - used);
  }

  public setSpool(spool: FilamentSpool): void {
    this.spoolChange.emit({ spool, skipChange: false });
  }

  public setSpoolSkipChange(spool: FilamentSpool): void {
    this.spoolChange.emit({ spool, skipChange: true });
  }
}
