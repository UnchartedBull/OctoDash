import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { has } from 'lodash-es';

import { BackendType, FilamentChange } from '../../config.model';

const defaultIntegrated: FilamentChange = {
  integrated: {
    feedLength: 0,
    feedSpeed: 20,
    feedSpeedSlow: 3,
    purgeDistance: 30,
  },
};

const loadAndUnloadOctoprint: FilamentChange = {
  loadAndUnload: {
    unloadCommand: 'M702',
    loadCommand: 'M701',
  },
};

const loadAndUnloadKlipper: FilamentChange = {
  loadAndUnload: {
    unloadCommand: 'UNLOAD_FILAMENT',
    loadCommand: 'LOAD_FILAMENT',
  },
};

const changeOctoprint: FilamentChange = {
  change: {
    changeCommand: 'M600',
  },
};

const changeKlipper: FilamentChange = {
  change: {
    changeCommand: 'CHANGE_FILAMENT',
  },
};

@Component({
  selector: 'app-config-setup-filament-change',
  templateUrl: './filament-change.component.html',
  styleUrls: ['./filament-change.component.scss', '../setup.component.scss'],
})
export class FilamentChangeComponent implements OnInit {
  @Input() filamentChange: FilamentChange;
  @Input() backendType: BackendType;

  @Output() filamentChangeChange = new EventEmitter<FilamentChange>();

  public currentPage;
  public filamentRoutine = FilamentRoutine;

  public ngOnInit(): void {
    if (has(this.filamentChange, 'integrated')) {
      this.currentPage = FilamentRoutine.INTEGRATED;
    } else if (has(this.filamentChange, 'loadAndUnload')) {
      this.currentPage = FilamentRoutine.LOAD_UNLOAD;
    } else {
      this.currentPage = FilamentRoutine.CHANGE;
    }
  }

  public changePage(newPage: FilamentRoutine) {
    this.currentPage = newPage;
    switch (newPage) {
      case FilamentRoutine.INTEGRATED:
        return this.updateConfig(defaultIntegrated);
      case FilamentRoutine.LOAD_UNLOAD:
        if (this.backendType === BackendType.OCTOPRINT) {
          return this.updateConfig(loadAndUnloadOctoprint);
        }
        return this.updateConfig(loadAndUnloadKlipper);
      case FilamentRoutine.CHANGE:
        if (this.backendType === BackendType.OCTOPRINT) {
          return this.updateConfig(changeOctoprint);
        }
        return this.updateConfig(changeKlipper);
    }
  }

  private updateConfig(newConfig?: FilamentChange) {
    if (newConfig) {
      this.filamentChange = newConfig;
    }
    this.filamentChangeChange.emit(this.filamentChange);
  }
}

enum FilamentRoutine {
  INTEGRATED,
  LOAD_UNLOAD,
  CHANGE,
}
