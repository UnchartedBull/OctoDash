import { Component, EventEmitter, inject, Output } from '@angular/core';
import { ConfigService } from 'src/services/config.service';
import { PrinterService } from 'src/services/printer/printer.service';
import { ProfileService } from 'src/services/profile/profile.service';

@Component({
  selector: 'app-bed-quick-control',
  templateUrl: './bed-quick-control.component.html',
  standalone: false,
})
export class BedQuickControlComponent {
  public configService = inject(ConfigService);
  public profileService = inject(ProfileService);
  public printerService = inject(PrinterService);

  options$ = this.profileService.getBedProfiles();
  onSet(value) {
    this.printerService.setTemperatureBed(value);
  }
  @Output() onBack: EventEmitter<void> = new EventEmitter<void>();
}
