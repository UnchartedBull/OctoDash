import {
  ChangeDetectionStrategy,
  Component,
  computed,
  EventEmitter,
  inject,
  Output,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

import { FilamentSpool } from '../../../model';
import { FilamentService } from '../../../services/filament/filament.service';

interface SpoolFilters {
  material: WritableSignal<string | null>;
  vendor: WritableSignal<string | null>;
  minWeight: WritableSignal<number | null>;
  maxWeight: WritableSignal<number | null>;
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

  public filament: FilamentService = inject(FilamentService);
  spools = toSignal(this.filament.getFilamentSpools());

  private activeFilters: SpoolFilters = {
    material: signal<string | null>(null),
    vendor: signal<string | null>(null),
    minWeight: signal<number>(0),
    maxWeight: signal<number | null>(null),
  };

  showFilters = signal(false);

  currentSpools: Signal<(number | null)[]> = toSignal(
    this.filament.getCurrentSpools().pipe(map(spools => spools.map(s => s?.id || null))),
    {
      initialValue: [],
    },
  );

  public getSpoolWeightLeft(weight: number, used: number): number {
    return Math.floor(weight - used);
  }

  public filteredSpools = computed(() => {
    // null -> no filtering
    // empty string -> filter for empty values
    return this.spools()
      .filter(spool => {
        if (this.activeFilters.material() === null) {
          return true;
        }
        return this.activeFilters.material() === spool.material;
      })
      .filter(spool => {
        if (this.activeFilters.vendor() === null) {
          return true;
        }
        return this.activeFilters.vendor() === spool.vendor;
      })
      .filter(spool => {
        const weightLeft = this.getSpoolWeightLeft(spool.weight, spool.used);
        if (this.activeFilters.minWeight() !== null && weightLeft < this.activeFilters.minWeight()) {
          return false;
        }
        if (this.activeFilters.maxWeight() !== null && weightLeft > this.activeFilters.maxWeight()) {
          return false;
        }
        return true;
      });
  });

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

  public materials = computed(() => {
    return Array.from(new Set(this.spools().map(s => s.material)));
  });

  public manufacturers = computed(() => {
    return Array.from(new Set(this.spools().map(s => s.vendor)));
  });

  public maximumWeight = computed(() => {
    const spools = this.spools();
    if (!spools) {
      return 1000;
    }
    const weights = spools.map(s => this.getSpoolWeightLeft(s.weight, s.used));
    return weights.length > 0 ? Math.max(...weights) : 1000;
  });

  public setMinWeight(value: string): void {
    this.activeFilters.minWeight.set(value ? parseInt(value, 10) : null);
  }

  public setMaxWeight(value: string): void {
    this.activeFilters.maxWeight.set(value ? parseInt(value, 10) : null);
  }
}
