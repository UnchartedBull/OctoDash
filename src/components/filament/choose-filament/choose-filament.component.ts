import { ChangeDetectionStrategy, Component, EventEmitter, Output, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

import { FilamentSpool } from '../../../model';
import { FilamentService } from '../../../services/filament/filament.service';

interface SpoolFilters {
  material: string | null;
  vendor: string | null;
  minWeight: number | null;
  maxWeight: number | null;
}

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

  private activeFilters: SpoolFilters = {
    material: null,
    vendor: null,
    minWeight: null,
    maxWeight: null,
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
      })
      .filter(spool => {
        const weightLeft = this.getSpoolWeightLeft(spool.weight, spool.used);
        if (this.activeFilters.minWeight !== null && weightLeft < this.activeFilters.minWeight) {
          return false;
        }
        if (this.activeFilters.maxWeight !== null && weightLeft > this.activeFilters.maxWeight) {
          return false;
        }
        return true;
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

  public getMaximumWeight(spools: FilamentSpool[]): number {
    const weights = spools.map(s => this.getSpoolWeightLeft(s.weight, s.used));
    return weights.length > 0 ? Math.max(...weights) : 1000;
  }

  public setMinWeight(value: string): void {
    this.activeFilters.minWeight = value ? parseInt(value, 10) : null;
  }

  public setMaxWeight(value: string): void {
    this.activeFilters.maxWeight = value ? parseInt(value, 10) : null;
  }
}
