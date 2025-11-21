import { Component, EventEmitter, inject, Output } from '@angular/core';
import { ConfigService } from 'src/services/config.service';
import { PrinterService } from 'src/services/printer/printer.service';
import { ProfileService } from 'src/services/profile/profile.service';

@Component({
  selector: 'app-fan-quick-control',
  templateUrl: './fan-quick-control.component.html',
  standalone: false,
})
export class FanQuickControlComponent {
  public configService = inject(ConfigService);
  public profileService = inject(ProfileService);
  public printerService = inject(PrinterService);

  options$ = this.profileService.getFanProfiles();
  onSet(value) {
    this.printerService.setFanSpeed(value);
  }

  @Output() onBack: EventEmitter<void> = new EventEmitter<void>();
}
