import { Component, EventEmitter, Output } from '@angular/core';

import { Config } from '../../config.model';

@Component({
  selector: 'app-config-choose-backend',
  templateUrl: './discover-octoprint.component.html',
  styleUrls: ['./discover-octoprint.component.scss', '../setup.component.scss'],
})
export class ChooseBackendComponent {
  @Output() increasePage = new EventEmitter<void>();
  @Output() configGenerated = new EventEmitter<Config>();
}
