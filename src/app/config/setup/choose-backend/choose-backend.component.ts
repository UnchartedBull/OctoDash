import { Component, EventEmitter, Output } from '@angular/core';

import { getDefaultConfig } from '../../config.default';
import { BackendType, Config } from '../../config.model';

@Component({
  selector: 'app-config-setup-choose-backend',
  templateUrl: './choose-backend.component.html',
  styleUrls: ['./choose-backend.component.scss', '../setup.component.scss'],
})
export class ChooseBackendComponent {
  @Output() increasePage = new EventEmitter<void>();
  @Output() configGenerated = new EventEmitter<Config>();

  public backendType = BackendType;

  setBackend(type: BackendType): void {
    this.configGenerated.emit(getDefaultConfig(type));
    this.increasePage.emit();
  }
}
