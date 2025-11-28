import { Component, inject, Input } from '@angular/core';
import { ConfigService } from 'src/services/config.service';
import { PrinterService } from 'src/services/printer/printer.service';
import { ProfileService } from 'src/services/profile/profile.service';

import { BaseQuickControlComponent } from '../base-quick-control.component';

@Component({
  selector: 'app-hotend-quick-control',
  templateUrl: '../base-quick-control.component.html',
  standalone: false,
})
export class HotendQuickControlComponent extends BaseQuickControlComponent {
  public configService = inject(ConfigService);
  public profileService = inject(ProfileService);
  public printerService = inject(PrinterService);

  @Input() toolIndex = 0;

  unit = '°C';
  defaultValue = this.configService.getDefaultHotendTemperature();

  options$ = this.profileService.getHotendProfiles();

  publishValue(value) {
    this.printerService.setTemperatureHotend(value, this.toolIndex);
  }
}
