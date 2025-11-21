import { Component, EventEmitter, inject, Output } from '@angular/core';
import { ConfigService } from 'src/services/config.service';
import { PrinterService } from 'src/services/printer/printer.service';
import { ProfileService } from 'src/services/profile/profile.service';

@Component({
  selector: 'app-hotend-quick-control',
  templateUrl: './hotend-quick-control.component.html',
  standalone: false,
})
export class HotendQuickControlComponent {
  public configService = inject(ConfigService);
  public profileService = inject(ProfileService);
  public printerService = inject(PrinterService);

  options$ = this.profileService.getHotendProfiles();
  @Output() onBack: EventEmitter<void> = new EventEmitter<void>();

  onSet(value) {
    this.printerService.setTemperatureHotend(value);
  }
}
