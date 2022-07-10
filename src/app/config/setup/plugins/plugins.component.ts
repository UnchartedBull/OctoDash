import { Component, EventEmitter, Input, Output } from '@angular/core';

import { OctoprintPlugins } from '../../config.model';

@Component({
  selector: 'app-config-setup-plugins',
  templateUrl: './plugins.component.html',
  styleUrls: ['./plugins.component.scss', '../setup.component.scss'],
})
export class PluginsComponent {
  @Input() octoprintPlugins: OctoprintPlugins;

  @Output() octoprintPluginsChange = new EventEmitter<OctoprintPlugins>();

  public emitUpdate() {
    console.log(this.octoprintPlugins);
    this.octoprintPluginsChange.emit(this.octoprintPlugins);
  }
}
