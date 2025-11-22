import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfigService } from 'src/services/config.service';
import { PrinterService } from 'src/services/printer/printer.service';
import { ProfileService } from 'src/services/profile/profile.service';

import { Option } from '../quick-control/quick-control.component';

@Component({
  selector: 'app-hotend-quick-control',
  templateUrl: './hotend-quick-control.component.html',
  standalone: false,
})
export class HotendQuickControlComponent {
  public configService = inject(ConfigService);
  public profileService = inject(ProfileService);
  public printerService = inject(PrinterService);

  @Input() toolIndex = 0;

  @Output() onBack: EventEmitter<void> = new EventEmitter<void>();

  options$: Observable<Option[]> = this.profileService.getHotendProfiles();

  onSet(value) {
    this.printerService.setTemperatureHotend(value, this.toolIndex);
  }
}
