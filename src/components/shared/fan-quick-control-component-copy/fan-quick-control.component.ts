import { Component, EventEmitter, inject, Output } from '@angular/core';
import { of } from 'rxjs';
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

  options$ = of([
    { value: 0, label: 'Off' },
    { value: this.configService.getDefaultFanSpeed(), label: 'On' },
  ]);
  onSet(value) {
    this.printerService.setFanSpeed(value);
  }

  @Output() onBack: EventEmitter<void> = new EventEmitter<void>();
}
