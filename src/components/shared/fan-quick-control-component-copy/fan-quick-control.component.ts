import { Component, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ConfigService } from 'src/services/config.service';
import { PrinterService } from 'src/services/printer/printer.service';
import { ProfileService } from 'src/services/profile/profile.service';

import { Option } from '../quick-control/quick-control.component';
import { BaseQuickControlComponent } from '../smart-quick-control-component/base-quick-control.component';

@Component({
  selector: 'app-fan-quick-control',
  templateUrl: '../smart-quick-control-component/base-quick-control.component.html',
  standalone: false,
})
export class FanQuickControlComponent extends BaseQuickControlComponent {
  public configService = inject(ConfigService);
  public profileService = inject(ProfileService);
  public printerService = inject(PrinterService);

  unit = '%';
  getOptions(): Observable<Option[]> {
    return of([
      { value: 0, label: 'Off' },
      { value: this.configService.getDefaultFanSpeed(), label: 'On' },
    ]);
  }
  defaultValue = this.configService.getDefaultFanSpeed();
  publishValue(value) {
    this.printerService.setFanSpeed(value);
  }
}
