import { Component, inject, Input } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ConfigService } from 'src/services/config.service';
import { PrinterService } from 'src/services/printer/printer.service';
import { ProfileService } from 'src/services/profile/profile.service';

import { Option } from '../quick-control/quick-control.component';
import { BaseQuickControlComponent } from '../smart-quick-control-component/base-quick-control.component';

@Component({
  selector: 'app-hotend-quick-control',
  templateUrl: '../smart-quick-control-component/base-quick-control.component.html',
  standalone: false,
})
export class HotendQuickControlComponent extends BaseQuickControlComponent {
  public configService = inject(ConfigService);
  public profileService = inject(ProfileService);
  public printerService = inject(PrinterService);

  @Input() toolIndex = 0;

  unit = '°C';
  defaultValue = this.configService.getDefaultHotendTemperature();

  options$ = this.profileService
    .getHotendProfiles()
    .pipe(map(profiles => profiles.filter(profile => profile.value !== 0)));

  publishValue(value) {
    this.printerService.setTemperatureHotend(value, this.toolIndex);
  }
}
