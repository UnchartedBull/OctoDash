import { Component, inject } from '@angular/core';
import { ConfigService } from 'src/services/config.service';
import { PrinterService } from 'src/services/printer/printer.service';
import { ProfileService } from 'src/services/profile/profile.service';

import { BaseQuickControlComponent } from '../smart-quick-control-component/base-quick-control.component';

@Component({
  selector: 'app-bed-quick-control',
  templateUrl: '../smart-quick-control-component/base-quick-control.component.html',
  standalone: false,
})
export class BedQuickControlComponent extends BaseQuickControlComponent {
  public configService = inject(ConfigService);
  public profileService = inject(ProfileService);
  public printerService = inject(PrinterService);

  options$ = this.profileService.getBedProfiles();
  defaultValue = this.configService.getDefaultHeatbedTemperature();
  unit = '°C';

  publishValue(value) {
    this.printerService.setTemperatureBed(value);
  }
}
