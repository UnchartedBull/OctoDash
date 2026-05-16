import { ChangeDetectionStrategy, Component, EventEmitter, Output, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

import { FilamentSpool } from '../../../model';
import { FilamentService } from '../../../services/filament/filament.service';

@Component({
  selector: 'app-filament-choose-spool',
  templateUrl: './choose-filament.component.html',
  styleUrls: ['./choose-filament.component.scss', '../filament.component.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChooseFilamentComponent {
  @Output() spoolChange = new EventEmitter<{ spool: FilamentSpool; skipChange: boolean }>();

  private currentSpools: Signal<(number | null)[]>;

  private activeFilters: { [key: string]: string | null } = {
    material: null,
    vendor: null,
  };

  showFilters = false;

  constructor(public filament: FilamentService) {
    this.currentSpools = toSignal(filament.getCurrentSpools().pipe(map(spools => spools.map(s => s?.id || null))), {
      initialValue: [],
    });
  }

  public getSpoolWeightLeft(weight: number, used: number): number {
    return Math.floor(weight - used);
  }

  public filterSpools(spools: FilamentSpool[]): FilamentSpool[] {
    // null -> no filtering
    // empty string -> filter for empty values
    return spools
      .filter(spool => {
        if (this.activeFilters.material === null) {
          return true;
        }
        return this.activeFilters.material === spool.material;
      })
      .filter(spool => {
        if (this.activeFilters.vendor === null) {
          return true;
        }
        return this.activeFilters.vendor === spool.vendor;
      });
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

  public getMaterials(spools: FilamentSpool[]): string[] {
    return Array.from(new Set(spools.map(s => s.material)));
  }
  public getManufacturers(spools: FilamentSpool[]): string[] {
    return Array.from(new Set(spools.map(s => s.vendor)));
  }
}
