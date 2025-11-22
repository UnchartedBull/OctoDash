import { Component, EventEmitter, inject, Output } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { ConfigService } from 'src/services/config.service';
import { NotificationService } from 'src/services/notification.service';
import { PrinterService } from 'src/services/printer/printer.service';
import { ProfileService } from 'src/services/profile/profile.service';

import { Option } from '../quick-control/quick-control.component';

@Component({
  selector: 'app-bed-quick-control',
  templateUrl: './bed-quick-control.component.html',
  standalone: false,
})
export class BedQuickControlComponent {
  public configService = inject(ConfigService);
  public profileService = inject(ProfileService);
  public printerService = inject(PrinterService);
  public notificationService = inject(NotificationService);

  options$: Observable<Option[]> = this.profileService.getProfiles().pipe(
    map(profiles =>
      profiles.map(profile => ({
        value: profile.bed,
        label: profile.name,
      })),
    ),
    catchError(error => {
      this.notificationService.error(
        $localize`:$$error-failed-to-load-profile-temps:Failed to load temp profiles`,
        error.message,
      );
      return of([]);
    }),
    map(options => [
      ...options,
      { value: 0, label: 'Off' },
      { value: this.configService.getDefaultHeatbedTemperature(), label: 'Default' },
    ]),
    map(options => options.sort((a, b) => a.value - b.value)),
  );

  onSet(value) {
    this.printerService.setTemperatureBed(value);
  }
  @Output() onBack: EventEmitter<void> = new EventEmitter<void>();
}
