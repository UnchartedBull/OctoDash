import { Component, OnDestroy, OnInit } from '@angular/core';
import { AnimationOptions } from 'ngx-lottie';
import { Subscription } from 'rxjs';

import { Filament } from '../../../model/octoprint/octoprint-settings.model';
import { ConfigService } from '../../../services/config.service';
import { FilamentService } from '../../../services/filament/filament.service';
import { PrusaMMUService } from '../../../services/prusammu/prusa-mmu.service';

@Component({
  selector: 'app-prusa-mmu',
  templateUrl: './prusa-mmu.component.html',
  styleUrls: ['./prusa-mmu.component.scss'],
  standalone: false,
})
export class PrusaMMUComponent implements OnDestroy, OnInit {
  constructor(
    public prusaMMUService: PrusaMMUService,
    private readonly filamentService: FilamentService,
    private readonly configService: ConfigService,
  ) {}
  subscriptions: Subscription[] = [];
  filamentsReady = false;
  loadingOptions: AnimationOptions = {
    path: 'assets/animations/loading.json',
  };

  ngOnInit(): void {
    this.filamentsReady = false;
    // If filamentManagement is used, then fetch most recent spools (could've changed)
    if (this.configService.isFilamentManagerUsed()) {
      this.subscriptions.push(
        this.filamentService.getCurrentFilamentSpools().subscribe(spools => {
          this.subscriptions.push(
            this.prusaMMUService.initFilaments(spools).subscribe(() => (this.filamentsReady = true)),
          );
        }),
      );
    } else {
      // Otherwise we use the ones provided by the PrusaMMU-plugin
      this.subscriptions.push(this.prusaMMUService.initFilaments().subscribe(() => (this.filamentsReady = true)));
    }
  }

  setFilament(filament: Filament) {
    this.subscriptions.push(this.prusaMMUService.setFilament(filament).subscribe());
  }

  cancelSelection(): void {
    this.prusaMMUService.showHideFilamentPicker(false);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.prusaMMUService.showHideFilamentPicker(false);
  }
}
