import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { map, Observable } from 'rxjs';
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

  options$: Observable<Option[]> = this.profileService.getProfiles().pipe(
    map(profiles =>
      profiles.map(profile => ({
        value: profile.extruder,
        label: profile.name,
      })),
    ),
    map(options => [
      ...options,
      { value: 0, label: 'Off' },
      { value: this.configService.getDefaultHotendTemperature(), label: 'Default' },
    ]),
    map(options => options.sort((a, b) => a.value - b.value)),
  );

  onSet(value) {
    this.printerService.setTemperatureHotend(value, this.toolIndex);
  }
}
